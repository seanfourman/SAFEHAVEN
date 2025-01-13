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

// Function to calculate total expenses for a given month
function calculateMonthlyExpenses(data, targetMonth) {
  return data
    .filter((row) => {
      if (!row.Date) return false;
      const [dd, mm, yyyy] = row.Date.split("/");
      return `${yyyy}-${mm.padStart(2, "0")}` === targetMonth;
    })
    .reduce((total, row) => total + (parseFloat(row.Amount) || 0), 0);
}

// Function to get current and previous months in YYYY-MM format
function getCurrentAndPreviousMonth() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Subtract 1 month
  const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return { currentMonth, previousMonth };
}

// Attach event listener to the file input
const csvFileInput = document.getElementById("csvFileInput");

csvFileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    const allData = csvToJson(csvText);

    // Get current and previous months
    const { currentMonth, previousMonth } = getCurrentAndPreviousMonth();

    // Calculate expenses
    const currentMonthExpenses = calculateMonthlyExpenses(allData, currentMonth);
    const previousMonthExpenses = calculateMonthlyExpenses(allData, previousMonth);

    // Save the data to localStorage
    const storedData = {
      allData,
      currentMonthExpenses,
      previousMonthExpenses
    };

    localStorage.setItem("expensesData", JSON.stringify(storedData));
  };
  reader.readAsText(file);
});
