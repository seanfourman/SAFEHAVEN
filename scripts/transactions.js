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

if (storedData.allData) {
  allData = storedData.allData;
  buildMonthSelect(allData);
  updateDashboard();
} else {
  removeElements();
}

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

  // Update charts
  updateCharts(filteredData);
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

function updateCharts() {
  // Get the selected month from the dropdown
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);

  // Calculate the past three months relative to the selected month
  const pastThreeMonths = [];
  for (let i = 2; i >= 0; i--) {
    const date = new Date(selectedYear, selectedMonthNumber - 1 - i, 1); // Adjust for 0-based index
    pastThreeMonths.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  // Aggregate expenses by month
  const monthlyTotals = {};
  pastThreeMonths.forEach((month) => {
    monthlyTotals[month] = allData
      .filter((row) => {
        if (!row.Date) return false;
        const [dd, mm, yyyy] = row.Date.split("/");
        return `${yyyy}-${mm.padStart(2, "0")}` === month;
      })
      .reduce((total, row) => total + (parseFloat(row.Amount) || 0), 0);
  });

  const sortedMonths = Object.keys(monthlyTotals);
  const monthlyValues = Object.values(monthlyTotals);

  // --- Pie Chart (Category Totals for Current Data) ---
  const categoryTotals = {};
  allData.forEach((row) => {
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
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#FFCD56"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Category Breakdown",
          color: "#ffffff"
        },
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      }
    }
  });

  // --- Bar Chart (Relative to Selected Month) ---
  if (barChartInstance) {
    barChartInstance.destroy();
  }

  const barCtx = document.getElementById("barChart").getContext("2d");
  barChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: sortedMonths.map((month) => {
        const [year, mm] = month.split("-");
        return `${monthNumberToName(parseInt(mm))} ${year}`;
      }),
      datasets: [
        {
          label: "Monthly Expenses",
          data: monthlyValues,
          backgroundColor: "#ff5733"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Expenses for the Past Months",
          color: "#ffffff"
        },
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#ffffff"
          }
        },
        x: {
          ticks: {
            color: "#ffffff"
          }
        }
      }
    }
  });
}

// Helper: Convert month number to name
function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[num - 1] || "Unknown";
}

function removeElements() {
  if (!storedData.allData) {
    const elementsToRemove = [document.querySelector(".charges-title"), document.querySelector(".charges-dashboard")];
    elementsToRemove.forEach((element) => {
      if (element) {
        element.remove();
      }
    });

    const centerFrame = document.querySelector(".page-image");
    centerFrame.style.display = "flex";

    const text = document.createElement("h1");
    text.textContent = "No data available";
    document.body.appendChild(centerFrame);
    centerFrame.appendChild(text);
  }
}
