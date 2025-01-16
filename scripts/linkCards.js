const selectedCardKey = "selectedCard";

// set the selected card in the local storage
function setSelectedCard(cardNumber) {
  localStorage.setItem(selectedCardKey, cardNumber);
}

// get the selected card from the local storage
function getSelectedCard() {
  return localStorage.getItem(selectedCardKey);
}

// render the card selection input element in the container element provided as an argument and set the selected card based on the user's selection or the default selected card
function renderCardsInput(containerElement) {
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  const cards = user.cards;
  const selectedCard = getSelectedCard();

  const selectElementLabel = document.createElement("label");
  selectElementLabel.htmlFor = "card-select";
  selectElementLabel.textContent = "Select a Card:";

  const selectElement = document.createElement("select");
  selectElement.name = "card-select";
  selectElement.id = "card-select";

  cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.displayCardNumber;
    option.textContent = card.displayCardNumber;
    option.selected = card.displayCardNumber === selectedCard;
    selectElement.appendChild(option);
  });

  containerElement.appendChild(selectElementLabel);
  containerElement.appendChild(selectElement);
  setSelectedCard(selectElement.value);

  selectElement.addEventListener("change", (event) => {
    const selectedCard = event.target.value;
    setSelectedCard(selectedCard);
  });
}

// observe file upload and update card transactions
function observeFileUpload() {
  setInterval(() => {
    const fileContent = window.fileLoader.getItem();
    if (fileContent) {
      upsertCardTransactions(fileContent);
    }
  }, 1000);
}

// update card transactions
function upsertCardTransactions(fileContent) {
  const activeCardNumber = getSelectedCard();
  const card = window.users.getCard(activeCardNumber);
  card.transactions = [...card.transactions, ...fileContent];
  window.users.updateCard(window.auth.getCurrentUserEmail(), card);
  window.fileLoader.clearItem();
}

// init
(function () {
  const container = document.getElementById("card-select-container");
  if (container) {
    renderCardsInput(container);
    observeFileUpload();
  }
})();
