let allData = [];
let pieChartInstance = null;
let barChartInstance = null;

const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");

const storedData = JSON.parse(localStorage.getItem("expensesData")) || {};

// parse "DD/MM/YYYY" into { year, month }
function parseDateToYearMonth(dateStr) {
  if (!dateStr) return null;
  const [_, mm, yyyy] = dateStr.split("/");
  if (!mm || !yyyy) return null;
  return { year: yyyy, month: mm };
}

if (storedData.allData) {
  allData = storedData.allData;
}
buildMonthSelect(allData);

if (storedData.allData) {
  updateDashboard();
} else {
  chargesDashboard = document.querySelector(".charges-dashboard");
  chargesDashboard.remove();
  const centerFrame = document.createElement("div");
  centerFrame.style.display = "flex";
  centerFrame.style.justifyContent = "center";
  centerFrame.style.alignItems = "center";

  const text = document.createElement("h1");
  text.textContent = "No data available";
  document.body.appendChild(centerFrame);
  centerFrame.appendChild(text);
}

// Build the dropdown menu for selecting months
function buildMonthSelect(data) {
  const monthSelectElement = document.getElementById("monthSelect");
  if (!monthSelectElement) return;
  monthSelectElement.innerHTML = "";

  const uniqueMonths = new Set();
  data.forEach((row) => {
    const parsed = parseDateToYearMonth(row.Date);
    if (parsed) {
      const formattedMonth = `${parsed.year}-${parsed.month.padStart(2, "0")}`;
      uniqueMonths.add(formattedMonth);
    }
  });

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  uniqueMonths.add(currentMonth);

  const sortedMonths = Array.from(uniqueMonths).sort().reverse();
  sortedMonths.forEach((monthStr) => {
    const option = document.createElement("option");
    option.value = monthStr;
    const [yyyy, mm] = monthStr.split("-");
    option.textContent = `${monthNumberToName(parseInt(mm, 10))} ${yyyy}`;
    monthSelectElement.appendChild(option);
  });

  if (sortedMonths.length > 0) {
    monthSelectElement.value = sortedMonths[0];
  }
}

// month number to name
function monthNumberToName(num) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[num - 1] || "Unknown";
}

if (monthSelect) {
  monthSelect.addEventListener("change", updateDashboard);
}

// update the dashboard
function updateDashboard() {
  if (!monthSelect) return;
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [year, month] = selectedMonth.split("-");
  const filteredData = allData.filter((row) => {
    const parsed = parseDateToYearMonth(row.Date);
    return parsed && parsed.year === year && parsed.month === month;
  });

  // update the table
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

  // update charts
  updateCharts(filteredData);
}

// calculate total expenses for a given month
function calculateMonthlyExpenses(month) {
  const [year, mm] = month.split("-");
  return allData
    .filter((row) => {
      const [_, rowMM, rowYYYY] = row.Date.split("/");
      return rowYYYY === year && rowMM === mm;
    })
    .reduce((sum, row) => sum + (parseFloat(row.Amount) || 0), 0); // sum the amounts for the month
}

// get the previous month
function getPreviousMonth(currentMonth) {
  const [year, month] = currentMonth.split("-").map(Number);
  const previousMonth = new Date(year, month - 2, 1); // subtract 1 month
  const yyyy = previousMonth.getFullYear();
  const mm = String(previousMonth.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

// update the charges dashboard
function updateCharts(filteredData) {
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);

  // calculate the past three months
  const pastThreeMonths = [];
  for (let i = 2; i >= 0; i--) {
    const date = new Date(selectedYear, selectedMonthNumber - 1 - i, 1);
    pastThreeMonths.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  const monthlyTotals = {};
  pastThreeMonths.forEach((month) => {
    monthlyTotals[month] = allData
      .filter((row) => {
        const parsed = parseDateToYearMonth(row.Date);
        return parsed && `${parsed.year}-${parsed.month.padStart(2, "0")}` === month;
      })
      .reduce((acc, row) => acc + (parseFloat(row.Amount) || 0), 0);
  });

  // object to array conversion for the bar chart data
  const sortedMonths = Object.keys(monthlyTotals);
  const monthlyValues = Object.values(monthlyTotals);

  const categoryTotals = {};
  filteredData.forEach((row) => {
    const cat = row.Category || "Unknown";
    const amt = parseFloat(row.Amount) || 0;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
  });

  const pieLabels = Object.keys(categoryTotals);
  const pieValues = Object.values(categoryTotals);

  // --- PIE CHART ---
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

  // --- BAR CHART ---
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

// check if the page is scrollable and adjust the footer position (fixes stuff that I just don't have the mental capacity to fix through CSS)
function checkIfPageScrollable() {
  const isScrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight;
  const footerElement = document.querySelector(".footer");
  if (isScrollable) {
    footerElement.style.position = "relative";
  } else {
    footerElement.style.position = "absolute";
  }
}

checkIfPageScrollable();

window.addEventListener("resize", checkIfPageScrollable);
