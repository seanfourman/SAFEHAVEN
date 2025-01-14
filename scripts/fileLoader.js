// Function to parse CSV text into JSON
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

// calculate total expenses for a given month
function calculateMonthlyExpenses(data, targetMonth) {
  return data
    .filter((row) => {
      if (!row.Date) return false;
      const [dd, mm, yyyy] = row.Date.split("/");
      return `${yyyy}-${mm.padStart(2, "0")}` === targetMonth;
    })
    .reduce((total, row) => total + (parseFloat(row.Amount) || 0), 0);
}

// update Last and Next Charges directly from localStorage
function updateChargesFromStorage() {
  const storedData = JSON.parse(localStorage.getItem("expensesData")) || {};
  const previousChargeSpan = document.getElementById("previous-charge");
  const nextChargeSpan = document.getElementById("next-charge");

  if (previousChargeSpan && nextChargeSpan) {
    const prevCharge = storedData.previousMonthExpenses || 0;
    const nextCharge = storedData.currentMonthExpenses || 0;

    if (!localStorage.getItem("expensesData") || prevCharge === 0) {
      previousChargeSpan.remove();
    } else {
      previousChargeSpan.innerHTML = `Last Charge: <span style="color: #ff5733;">$${prevCharge.toFixed(2)}</span>`;
    }

    if (localStorage.getItem("expensesData")) {
      nextChargeSpan.innerHTML = `Next Charge: <span style="color: #ff5733;">$${nextCharge.toFixed(2)}</span>`;
    }
  }
}

updateChargesFromStorage();

// get current and previous months in YYYY-MM format
function getCurrentAndPreviousMonth() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Subtract 1 month
  const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return { currentMonth, previousMonth };
}

// attach event listener to the file input
const csvFileInput = document.getElementById("csvFileInput");

if (csvFileInput) {
  csvFileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const csvText = e.target.result;
      const newData = csvToJson(csvText);

      // Retrieve existing data from localStorage
      const storedData = JSON.parse(localStorage.getItem("expensesData")) || { allData: [], currentMonthExpenses: 0, previousMonthExpenses: 0 };

      // Merge existing data with new data
      const combinedData = [...storedData.allData, ...newData];

      // Get current and previous months
      const { currentMonth, previousMonth } = getCurrentAndPreviousMonth();

      // Recalculate expenses
      const currentMonthExpenses = calculateMonthlyExpenses(combinedData, currentMonth);
      const previousMonthExpenses = calculateMonthlyExpenses(combinedData, previousMonth);

      // Save the combined data and updated expenses to localStorage
      const updatedData = {
        allData: combinedData,
        currentMonthExpenses,
        previousMonthExpenses
      };

      localStorage.setItem("expensesData", JSON.stringify(updatedData));

      // Update charges from storage after saving
      updateChargesFromStorage();

      // Add a span to show that a file was added
      if (!document.querySelector(".success")) {
        const fileAddedSpan = document.createElement("span");
        fileAddedSpan.textContent = "File successfully added!";
        fileAddedSpan.classList.add("success");
        csvFileInput.parentNode.appendChild(fileAddedSpan);
      }
      clearButtonBind();

      // Reset the file input value to allow re-uploading the same file
      csvFileInput.value = "";
    };
    reader.readAsText(file);
  });
}

function clearButtonBind() {
  const clearButton = document.getElementById("clearButton");
  if (localStorage.getItem("expensesData") && clearButton) {
    clearButton.textContent = "Want to clear all data?";
    clearButton.classList.add("clear-button");
    clearButton.addEventListener("click", clearAllData);
  } else if (clearButton) {
    clearButton.textContent = "No data loaded";
    clearButton.classList.remove("clear-button");
  }
}

// clear all data from localStorage
function clearAllData() {
  if (localStorage.getItem("expensesData")) {
    localStorage.removeItem("expensesData");
    updateChargesFromStorage();
    clearButtonBind();

    const fileAddedSpan = document.querySelector(".success");
    if (fileAddedSpan) {
      fileAddedSpan.remove();
    }
  }
}

clearButtonBind();
