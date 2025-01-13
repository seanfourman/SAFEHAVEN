let allData = [];
let pieChartInstance = null;
let barChartInstance = null;

// Get references to DOM elements
const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");
const previousChargeSpan = document.getElementById("previous-charge");
const nextChargeSpan = document.getElementById("next-charge");

// Load stored data from localStorage
const storedData = JSON.parse(localStorage.getItem("expensesData")) || {};

// If data exists, initialize the app
if (storedData.allData) {
  allData = storedData.allData;
  buildMonthSelect(allData);
  updateDashboard();
}

updateChargesFromStorage(); // Update Last and Next Charges directly from localStorage

// Build the dropdown for months
function buildMonthSelect(data) {
  if (!document.getElementById("monthSelect")) return;
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

  const sortedMonths = Array.from(monthsSet).sort().reverse();
  sortedMonths.forEach((monthStr) => {
    const option = document.createElement("option");
    option.value = monthStr;
    const [year, mo] = monthStr.split("-");
    option.textContent = `${monthNumberToName(parseInt(mo, 10))} ${year}`;
    monthSelect.appendChild(option);
  });

  if (sortedMonths.length > 0) {
    monthSelect.value = sortedMonths[0];
  }
}

// Convert month number to name
function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[num - 1] || "Unknown";
}

// Event listener for month selection change
if (monthSelect) {
  monthSelect.addEventListener("change", updateDashboard);
}

// Update the dashboard
function updateDashboard() {
  if (!document.getElementById("monthSelect")) return;
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [year, month] = selectedMonth.split("-");

  const filteredData = allData.filter((row) => {
    if (!row.Date) return false;
    const [dd, mm, yyyy] = row.Date.split("/");
    return yyyy === year && mm === month;
  });

  // Update the table
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

  // Save current and previous month expenses to localStorage
  storedData.currentMonthExpenses = total;
  const previousMonth = getPreviousMonth(selectedMonth);
  const previousMonthExpenses = calculateMonthlyExpenses(previousMonth);
  storedData.previousMonthExpenses = previousMonthExpenses;
  localStorage.setItem("expensesData", JSON.stringify(storedData));

  // Update Last and Next Charges
  updateChargesFromStorage();

  // Update charts
  updateCharts(filteredData);
}

// Update Last and Next Charges directly from localStorage
function updateChargesFromStorage() {
  if (previousChargeSpan && nextChargeSpan) {
    const prevCharge = storedData.previousMonthExpenses || 0;
    const nextCharge = storedData.currentMonthExpenses || 0;

    if (!localStorage.getItem("expensesData") || prevCharge === 0) {
      previousChargeSpan.parentElement.remove(); // Remove the entire element
    } else {
      previousChargeSpan.textContent = `$${prevCharge.toFixed(2)}`;
    }

    if (!localStorage.getItem("expensesData") || nextCharge === 0) {
      nextChargeSpan.parentElement.remove(); // Remove the entire element
    } else {
      nextChargeSpan.textContent = `$${nextCharge.toFixed(2)}`;
    }
  }
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

// Update the charts
function updateCharts(filteredData) {
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
      datasets: [{ data: pieValues, backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] }]
    },
    options: { responsive: true }
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
      labels: sortedDays.map((d) => `Day ${d}`),
      datasets: [{ label: "Daily Expenses", data: barValues, backgroundColor: "#36A2EB" }]
    },
    options: { responsive: true }
  });
}
