function generateUserCards() {
  const templateCreditCard = document.querySelector(".user-card");
  if (!templateCreditCard) return;

  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  if (!user) return;

  user.cards.forEach((card) => generateCreditCard(card, templateCreditCard));
  templateCreditCard.classList.add("hidden");
}

function generateCreditCard(cardValues, template) {
  const clonedElement = template.cloneNode(true);
  new RenderData(cardValues, clonedElement);
  template.parentElement.append(clonedElement);
}

generateUserCards();
