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

// Attach event listener to the file input
const csvFileInput = document.getElementById("csvFileInput");

csvFileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const csvText = e.target.result;
    const allData = csvToJson(csvText);

    // Save the data to localStorage
    const storedData = {
      allData,
      currentMonthExpenses: 0, // Reset when loading new data
      previousMonthExpenses: 0 // Reset when loading new data
    };
    localStorage.setItem("expensesData", JSON.stringify(storedData));

    alert("Data successfully loaded and saved! You can now view transactions.");
  };
  reader.readAsText(file);
});
