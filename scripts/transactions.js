let allData = [];
let pieChartInstance = null;
let barChartInstance = null;

const csvFileInput = document.getElementById("csvFileInput");
const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");

// Get the stored CSV data from local storage
let storedData = JSON.parse(localStorage.getItem("expensesData")) || {};

// If data exists in local storage, load it into the app
if (storedData.allData) {
  allData = storedData.allData;
  buildMonthSelect(allData);
  updateDashboard();
}

csvFileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    allData = csvToJson(csvText);

    // Save the data to local storage
    storedData = {
      allData,
      currentMonthExpenses: 0, // Reset when loading new data
      previousMonthExpenses: 0 // Reset when loading new data
    };
    localStorage.setItem("expensesData", JSON.stringify(storedData));

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

  // Save the current month's expenses
  storedData.currentMonthExpenses = total;

  // Calculate the previous month's expenses
  const previousMonth = getPreviousMonth(selectedMonth);
  const previousMonthExpenses = calculateMonthlyExpenses(previousMonth);
  storedData.previousMonthExpenses = previousMonthExpenses;

  // Save updated data to local storage
  localStorage.setItem("expensesData", JSON.stringify(storedData));

  // Update Charts
  updateCharts(filteredData);
}

function updateCharts(filteredData) {
  // --- Pie Chart ---
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
          text: "Expenses by Category",
          color: "white"
        },
        legend: {
          labels: {
            color: "white"
          }
        }
      }
    }
  });

  // --- Bar Chart ---
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
      labels: sortedDays.map((d) => {
        const day = parseInt(d);
        const suffix = (day) => {
          if (day > 3 && day < 21) return "th";
          switch (day % 10) {
            case 1:
              return "st";
            case 2:
              return "nd";
            case 3:
              return "rd";
            default:
              return "th";
          }
        };
        return `${day}${suffix(day)}`;
      }),
      datasets: [
        {
          label: "Expenses Per Day of the Month",
          data: barValues,
          backgroundColor: "#ff5733"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Daily Expenses",
          color: "white"
        },
        legend: {
          labels: {
            color: "white"
          }
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: "white" } },
        x: { ticks: { color: "white" } }
      }
    }
  });
}

// Helper: Calculate total expenses for a given month (YYYY-MM)
function calculateMonthlyExpenses(month) {
  const [year, mm] = month.split("-");
  return allData
    .filter((row) => {
      const [dd, rowMM, rowYYYY] = row.Date.split("/");
      return rowYYYY === year && rowMM === mm;
    })
    .reduce((sum, row) => sum + (parseFloat(row.Amount) || 0), 0);
}

// Helper: Get the previous month (YYYY-MM format)
function getPreviousMonth(currentMonth) {
  const [year, month] = currentMonth.split("-").map(Number);
  const previousMonth = new Date(year, month - 2, 1); // Subtract 1 month
  const yyyy = previousMonth.getFullYear();
  const mm = String(previousMonth.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}
