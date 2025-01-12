function updateMonthSelect() {
  const monthSelect = document.getElementById("monthSelect");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = new Date().getMonth(); // 0-based index
  const years = [2024, 2025]; // Include 2024 and 2025

  years.reverse().forEach((year) => {
    months
      .slice()
      .reverse()
      .forEach((month, index) => {
        if (year === 2025 && 11 - index > currentMonth) return;
        const option = document.createElement("option");
        option.value = `${year}-${String(12 - index).padStart(2, "0")}`;
        option.textContent = `${month} ${year}`;
        monthSelect.appendChild(option);
      });
  });
}

const data = {
  "2024-10": [
    { date: "10/01/2024", name: "Store A", category: "Food", amount: 50 },
    { date: "10/10/2024", name: "Store B", category: "Retail", amount: 100 }
  ],
  "2024-11": [
    { date: "11/05/2024", name: "Store C", category: "Utilities", amount: 75 },
    { date: "11/15/2024", name: "Store D", category: "Food", amount: 120 }
  ],
  "2024-12": [
    { date: "12/03/2024", name: "Store E", category: "Food", amount: 60 },
    { date: "12/20/2024", name: "Store F", category: "Retail", amount: 150 }
  ]
};

const categories = {
  Food: "rgba(255, 99, 132, 0.6)",
  Retail: "rgba(54, 162, 235, 0.6)",
  Utilities: "rgba(255, 206, 86, 0.6)"
};

function updateContent(month) {
  const tableBody = document.querySelector("#details tbody");
  tableBody.innerHTML = "";
  let total = 0;
  const categorySums = {};

  data[month].forEach((entry) => {
    total += entry.amount;
    categorySums[entry.category] = (categorySums[entry.category] || 0) + entry.amount;

    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.name}</td>
                    <td>${entry.category}</td>
                    <td>${entry.amount}</td>
                `;
    tableBody.appendChild(row);
  });

  document.getElementById("totalExpenses").innerText = total;

  updateBarChart(month, total);
  updatePieChart(categorySums);
}

function updateBarChart(month, total) {
  const ctx = document.getElementById("barChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["October 2024", "November 2024", "December 2024"],
      datasets: [
        {
          label: "Total Expenses",
          data: [data["2024-10"].reduce((sum, d) => sum + d.amount, 0), data["2024-11"].reduce((sum, d) => sum + d.amount, 0), data["2024-12"].reduce((sum, d) => sum + d.amount, 0)],
          backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)"]
        }
      ]
    },
    options: {
      responsive: true
    }
  });
}

function updatePieChart(categorySums) {
  const ctx = document.getElementById("pieChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categorySums),
      datasets: [
        {
          data: Object.values(categorySums),
          backgroundColor: Object.keys(categorySums).map((cat) => categories[cat] || "rgba(0, 0, 0, 0.6)")
        }
      ]
    },
    options: {
      responsive: true
    }
  });
}

document.getElementById("monthSelect").addEventListener("change", (e) => {
  updateContent(e.target.value);
});

updateContent("2024-12"); // Initialize with December 2024 data
updateMonthSelect();
