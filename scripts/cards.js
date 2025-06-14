// generateUserCards find the credit card template and the user data to generate the credit cards
function generateUserCards() {
  const templateCreditCard = document.querySelector(".user-card");
  if (!templateCreditCard) return;

  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  if (!user) return;

  user.cards.forEach((card, index) => generateCreditCard(index, card, templateCreditCard));

  // add the plus card to the end of the list
  const templateCardAdd = document.querySelector(".card-add");
  if (templateCardAdd) {
    templateCreditCard.parentElement.append(templateCardAdd);
  }

  templateCreditCard.remove();
}

// RenderData renders the user data in the credit card template and appends it to the parent element of the template
function generateCreditCard(index, cardValues, template) {
  const clonedElement = template.cloneNode(true);
  new RenderData(cardValues, clonedElement);
  clonedElement.setAttribute("data-index", index);
  clonedElement.setAttribute("data-display-card-number", cardValues.displayCardNumber);
  template.parentElement.append(clonedElement);

  if (clonedElement.querySelector("[data-transaction-link]")) {
    clonedElement.addEventListener("click", (event) => bindCardClickEventToTransactions(event, clonedElement));
  }
}

// sets the selected card in local storage and redirects the user to the transactions page
function bindCardClickEventToTransactions(event, containerElement) {
  event.preventDefault();
  setSelectedCard(containerElement.dataset.displayCardNumber); // setSelectedCard sets the selected card in local storage
  window.location.href = "./Transactions.html";
}

generateUserCards();
