/********************************************
 * Global Variables and DOM References
 ********************************************/
let allData = []; // Will store the parsed CSV as an array of objects
let pieChartInstance = null; // For the Pie Chart
let barChartInstance = null; // For the Bar Chart

// Get references to the DOM elements
const csvFileInput = document.getElementById("csvFileInput");
const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");

/********************************************
 * 1) Read the CSV File and Parse
 ********************************************/
csvFileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    // Convert CSV text to array of objects
    allData = csvToJson(csvText);

    // Populate the month select dropdown
    buildMonthSelect(allData);
    // Show data for the default selected month
    updateDashboard();
  };
  reader.readAsText(file);
});

// CSV -> JSON function
// Assumes first row is headers. Example CSV:
//   Date,Business Name,Category,Amount
//   01/01/2024,Starbucks,Food & Beverage,5.75
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

/********************************************
 * 2) Build the Month Dropdown (YYYY-MM)
 ********************************************/
function buildMonthSelect(data) {
  // Clear existing options
  monthSelect.innerHTML = "";

  // We'll gather all unique "YYYY-MM" from "DD/MM/YYYY"
  const monthsSet = new Set();

  data.forEach((row) => {
    const dateStr = row.Date; // e.g. "05/01/2024"
    if (!dateStr) return;
    const [dd, mm, yyyy] = dateStr.split("/");
    if (yyyy && mm) {
      // e.g. "2024-01"
      const key = `${yyyy}-${mm.padStart(2, "0")}`;
      monthsSet.add(key);
    }
  });

  // Convert to an array and sort
  const sortedMonths = Array.from(monthsSet).sort(); // alphabetical => chronological for YYYY-MM

  // Populate <select>
  sortedMonths.forEach((monthStr) => {
    const option = document.createElement("option");
    option.value = monthStr; // e.g. "2024-01"
    const [year, mo] = monthStr.split("-");
    option.textContent = `${monthNumberToName(parseInt(mo, 10))} ${year}`;
    monthSelect.appendChild(option);
  });

  // If we have at least one month, default to the last one (most recent)
  if (sortedMonths.length > 0) {
    monthSelect.value = sortedMonths[sortedMonths.length - 1];
  }
}

// Helper to convert "01" => "January", etc.
function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[num - 1] || "Unknown";
}

/********************************************
 * 3) Update Dashboard On Month Change
 ********************************************/
monthSelect.addEventListener("change", updateDashboard);

/********************************************
 * 4) Main Dashboard Update
 ********************************************/
function updateDashboard() {
  const selectedMonth = monthSelect.value; // e.g. "2024-01"
  if (!selectedMonth) return;

  const [year, month] = selectedMonth.split("-"); // year="2024", month="01"

  // === (A) Filter data to match "DD/MM/YYYY" => year, month === yyyy, mm
  const filteredData = allData.filter((row) => {
    if (!row.Date) return false;
    const [dd, mm, yyyy] = row.Date.split("/");
    return yyyy === year && mm === month;
  });

  // === (B) Update Table ===
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

  // === (C) Pie Chart: Sum by Category ===
  const categoryTotals = {};
  filteredData.forEach((row) => {
    const cat = row.Category || "Unknown";
    const amt = parseFloat(row.Amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const pieLabels = Object.keys(categoryTotals);
  const pieValues = Object.values(categoryTotals);

  // Destroy old Pie Chart if exists
  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  // Create new Pie Chart
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

  // === (D) Bar Chart: Sum by Day (DD) ===
  const dailyTotals = {};
  filteredData.forEach((row) => {
    const [dd] = row.Date.split("/");
    const amt = parseFloat(row.Amount) || 0;
    dailyTotals[dd] = (dailyTotals[dd] || 0) + amt;
  });

  // Sort days numerically
  const sortedDays = Object.keys(dailyTotals).sort((a, b) => parseInt(a) - parseInt(b));
  const barValues = sortedDays.map((day) => dailyTotals[day]);

  // Destroy old Bar Chart if exists
  if (barChartInstance) {
    barChartInstance.destroy();
  }

  // Create new Bar Chart
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
