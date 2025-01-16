// read and save file to local storage
class FileLoader {
  constructor() {
    this.key = "fromFile";
  }

  readSaveFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const csvText = e.target.result;
      const json = window.fileLoader.csvToJson(csvText);
      localStorage.setItem(window.fileLoader.key, JSON.stringify(json));

      if (!document.querySelector(".success")) {
        const fileAddedSpan = document.createElement("span");
        fileAddedSpan.textContent = "File successfully added!";
        fileAddedSpan.classList.add("success");
        csvFileInput.parentNode.appendChild(fileAddedSpan);
      }
    };
    reader.readAsText(file);
  }

  csvToJson(csvText) {
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

  getItem() {
    const item = localStorage.getItem(this.key);
    return item ? JSON.parse(item) : null;
  }

  clearItem() {
    localStorage.removeItem(this.key);
  }
}

// init
(function () {
  window.fileLoader = new FileLoader();
  document.querySelectorAll('input[type="file"]').forEach((element) => element.addEventListener("change", (event) => window.fileLoader.readSaveFile(event)));
})();
