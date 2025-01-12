let allData = [];
let pieChartInstance = null;
let barChartInstance = null;

const csvFileInput = document.getElementById("csvFileInput");
const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");

csvFileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    allData = csvToJson(csvText);
    buildMonthSelect(allData);
    updateDashboard();
  };
  reader.readAsText(file);
});

function csvToJson(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1);

  const jsonArray = rows.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i];
    });
    return obj;
  });
  return jsonArray;
}

function buildMonthSelect(data) {
  monthSelect.innerHTML = "";
  const monthsSet = new Set();

  data.forEach((row) => {
    const dateStr = row.Date;
    if (!dateStr) return;
    const [dd, mm, yyyy] = dateStr.split("/");
    if (yyyy && mm) {
      const key = `${yyyy}-${mm.padStart(2, "0")}`;
      monthsSet.add(key);
    }
  });

  const sortedMonths = Array.from(monthsSet).sort();
  sortedMonths.forEach((monthStr) => {
    const option = document.createElement("option");
    option.value = monthStr;
    const [year, mo] = monthStr.split("-");
    option.textContent = `${monthNumberToName(parseInt(mo, 10))} ${year}`;
    monthSelect.appendChild(option);
  });

  if (sortedMonths.length > 0) {
    monthSelect.value = sortedMonths[sortedMonths.length - 1];
  }
}

function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[num - 1] || "Unknown";
}

monthSelect.addEventListener("change", updateDashboard);

function updateDashboard() {
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [year, month] = selectedMonth.split("-");

  const filteredData = allData.filter((row) => {
    if (!row.Date) return false;
    const [dd, mm, yyyy] = row.Date.split("/");
    return yyyy === year && mm === month;
  });

  tableBody.innerHTML = "";
  let total = 0;
  filteredData.forEach((row) => {
    const tr = document.createElement("tr");
    const amountVal = parseFloat(row.Amount) || 0;
    total += amountVal;

    tr.innerHTML = `
          <td>${row.Date}</td>
          <td>${row["Business Name"] || ""}</td>
          <td>${row.Category || ""}</td>
          <td>$${amountVal.toFixed(2)}</td>
        `;
    tableBody.appendChild(tr);
  });

  totalExpensesSpan.textContent = `$${total.toFixed(2)}`;

  const categoryTotals = {};
  filteredData.forEach((row) => {
    const cat = row.Category || "Unknown";
    const amt = parseFloat(row.Amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const pieLabels = Object.keys(categoryTotals);
  const pieValues = Object.values(categoryTotals);

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  const pieCtx = document.getElementById("pieChart").getContext("2d");
  pieChartInstance = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [
        {
          data: pieValues,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8B572A", "#F5A623"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Expenses by Category"
        }
      }
    }
  });

  const dailyTotals = {};
  filteredData.forEach((row) => {
    const [dd] = row.Date.split("/");
    const amt = parseFloat(row.Amount) || 0;
    dailyTotals[dd] = (dailyTotals[dd] || 0) + amt;
  });

  const sortedDays = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b));
  const barValues = sortedDays.map((day) => dailyTotals[day]);

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  const barCtx = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: sortedDays.map((d) => "Day " + d),
      datasets: [
        {
          label: "Expenses Per Day",
          data: barValues,
          backgroundColor: "#36A2EB"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Daily Expenses"
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
