let pieChartInstance = null;
let barChartInstance = null;

const API_URL = "https://yael-ex-expenses-services-299199094731.me-west1.run.app/get-recommendations?lang=en&apiKay=afGre4Eerf223432AXE";
const TRANSACTIONS_THRESHOLD = 5;
var requestInProgress = false;
const mainContainer = document.querySelector(".transactions-page");
const monthSelect = document.getElementById("monthSelect");
const tableBody = document.querySelector("#details tbody");
const totalExpensesSpan = document.getElementById("totalExpenses");
const chargesDashboard = document.querySelector(".charges-dashboard");
const centerFrame = createCenterFrame();
const text = document.createElement("h1");
text.textContent = "No data available";
document.body.appendChild(centerFrame);
centerFrame.appendChild(text);

function addSuggestionsSection() {
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  const transactions = [];
  user.cards.forEach((card) => transactions.push(...card.transactions)); // get all transactions from all cards of the user

  if (!mainContainer) return;

  const suggestionsContainer = document.createElement("div");
  suggestionsContainer.classList.add("suggestions-container", "element-hidden");
  mainContainer.appendChild(suggestionsContainer);

  const suggestionsButton = document.createElement("button");
  suggestionsButton.textContent = "AI Suggestions";
  suggestionsContainer.appendChild(suggestionsButton);

  const suggestionsList = document.createElement("div");
  suggestionsList.classList.add("suggestions-list");
  suggestionsContainer.appendChild(suggestionsList);

  suggestionsButton.addEventListener("click", () => {
    if (requestInProgress) return;
    suggestionsList.innerHTML = "";
    suggestionsList.classList.remove("suggestions-background");
    getSuggestions(transactions, suggestionsList, suggestionsContainer);
    requestInProgress = true;
  });
}

function getSuggestions(transactions, suggestionsList, suggestionsContainer) {
  const textSpan = document.createElement("span");
  textSpan.textContent = "Analyzing transactions...";
  textSpan.classList.add("loading");
  suggestionsList.appendChild(textSpan);
  suggestionsContainer.classList.remove("element-hidden");

  if (transactions.length < TRANSACTIONS_THRESHOLD) {
    textSpan.textContent = "Not enough transactions to generate recommendations.";
    textSpan.classList.add("api-error");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ transactions })
  })
    .then((response) => {
      requestInProgress = false;
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      requestInProgress = false;
      displayRecommendations(data, suggestionsList);
    })
    .catch((error) => {
      requestInProgress = false;
      console.error("Error fetching recommendations:", error);
      textSpan.classList.add("api-error");
      textSpan.textContent = "Failed to fetch recommendations. Please try again later or check your internet connection.";
    });
}

function displayRecommendations(data, suggestionsList) {
  if (!data.recommendations || data.recommendations.length === 0) {
    suggestionsList.innerHTML = '<div class="no-recommendations">No recommendations available.</div>';
    return;
  }

  // clear artifacts
  const cleanedRecommendations = data.recommendations
    .replace(/```(html|css|javascript)?/g, "")
    .replace(/```/g, "")
    .replace(/<>/g, "")
    .replace(/<\s*lang="en"\s*>/g, "")
    .trim();

  suggestionsList.classList.add("suggestions-background");
  suggestionsList.innerHTML = cleanedRecommendations;
}

addSuggestionsSection();

// parse "DD/MM/YYYY" into { year, month }
function parseDateToYearMonth(dateStr) {
  if (!dateStr) return null;
  const [_, mm, yyyy] = dateStr.split("/");
  if (!mm || !yyyy) return null;
  return { year: yyyy, month: mm };
}

// create a div element with flex centering for hiding stuff when there's no data
function createCenterFrame() {
  const centerFrame = document.createElement("div");
  centerFrame.style.display = "flex";
  centerFrame.style.justifyContent = "center";
  centerFrame.style.alignItems = "center";
  return centerFrame;
}

// generate the card transactions content
function generateCardTransactionsContent(cardTransactions) {
  const suggestionsContainer = document.querySelector(".suggestions-container");
  buildMonthSelect(cardTransactions);

  if (cardTransactions.length) {
    chargesDashboard.classList.remove("element-hidden");
    text.classList.add("element-hidden"); // hide the "No data available" text
    if (suggestionsContainer) {
      suggestionsContainer.classList.remove("element-hidden");
    }
    updateDashboard();
  } else {
    chargesDashboard.classList.add("element-hidden");
    text.classList.remove("element-hidden"); // show the "No data available" text
    totalExpensesSpan.textContent = `$0`;
  }
}

let cardTransactions = [];
const cardSelectElement = document.getElementById("card-select");

// get the selected card from the local storage and update the card transactions
function handleCardChange() {
  const card = window.users.getCard(cardSelectElement.value);
  cardTransactions = [...card.transactions];
  generateCardTransactionsContent(card.transactions || []);
}

cardSelectElement.addEventListener("change", () => {
  handleCardChange();
});

// Build the dropdown menu for selecting months
function buildMonthSelect(data) {
  const monthSelectElement = document.getElementById("monthSelect");
  if (!monthSelectElement) return;
  monthSelectElement.innerHTML = "";

  const uniqueMonths = [];
  data.forEach((row) => {
    const parsed = parseDateToYearMonth(row.Date);
    if (parsed) {
      const formattedMonth = `${parsed.year}-${parsed.month.padStart(2, "0")}`;
      if (!uniqueMonths.includes(formattedMonth)) {
        uniqueMonths.push(formattedMonth);
      }
    }
  });

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  if (!uniqueMonths.includes(currentMonth)) {
    uniqueMonths.push(currentMonth);
  }

  const sortedMonths = uniqueMonths.sort().reverse();
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
  if (document.getElementById("card-select").value !== getSelectedCard()) return;
  if (!monthSelect) return;
  const selectedMonth = monthSelect.value;
  if (!selectedMonth) return;

  const [year, month] = selectedMonth.split("-");
  const filteredData = cardTransactions.filter((row) => {
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

  if (total < 0) {
    total = 0;
  }
  totalExpensesSpan.textContent = `$${total.toFixed(2)}`;

  // update charts
  updateCharts(filteredData);
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
  if (!cardTransactions.length) return;
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
    monthlyTotals[month] = cardTransactions
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

document.addEventListener("DOMContentLoaded", () => {
  handleCardChange();
  checkIfPageScrollable();
  window.addEventListener("resize", checkIfPageScrollable);
});
