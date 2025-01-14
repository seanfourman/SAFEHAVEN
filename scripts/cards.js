// generateUserCards() -> generateCreditCard() -> RenderData()
// generateUserCards find the credit card template and the user data to generate the credit cards
function generateUserCards() {
  const templateCreditCard = document.querySelector(".user-card");
  if (!templateCreditCard) return;

  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  if (!user) return;

  user.cards.forEach((card) => generateCreditCard(card, templateCreditCard));
  templateCreditCard.classList.add("card-hidden");
}

// RenderData renders the user data in the credit card template and appends it to the parent element of the template
function generateCreditCard(cardValues, template) {
  const clonedElement = template.cloneNode(true);
  new RenderData(cardValues, clonedElement);
  template.parentElement.append(clonedElement);
}

generateUserCards();
