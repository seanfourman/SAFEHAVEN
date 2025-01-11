document.addEventListener("DOMContentLoaded", () => {
  const currentUserEmail = window.auth.getCurrentUserEmail();
  if (!currentUserEmail) return;

  const user = window.users.getUser(currentUserEmail);
  if (!user || !Array.isArray(user.cards)) return;

  const userCardsContainer = document.getElementById("userCards");
  if (!userCardsContainer) return;

  // Clear any existing children
  while (userCardsContainer.firstChild) {
    userCardsContainer.removeChild(userCardsContainer.firstChild);
  }

  user.cards.forEach((card) => {
    // Create link
    const cardLink = document.createElement("a");
    cardLink.classList.add("card");
    cardLink.href = "./Transactions.html";

    // Create card container
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    // Card header
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header");

    const spanLogo = document.createElement("span");
    spanLogo.classList.add("card-logo");

    const logoImg = document.createElement("img");
    logoImg.src = "../Images/CreditCard/logo.png";
    logoImg.alt = "";

    const logoText = document.createElement("h5");
    logoText.textContent = "Master Card";

    // Append logo elements
    spanLogo.appendChild(logoImg);
    spanLogo.appendChild(logoText);
    cardHeader.appendChild(spanLogo);

    const chipImg = document.createElement("img");
    chipImg.src = "../Images/CreditCard/chip.png";
    chipImg.alt = "";
    chipImg.classList.add("chip");
    cardHeader.appendChild(chipImg);

    // Card details
    const cardDetails = document.createElement("div");
    cardDetails.classList.add("card-details");

    const nameNumber = document.createElement("div");
    nameNumber.classList.add("name-number");

    const h6CardNumLabel = document.createElement("h6");
    h6CardNumLabel.textContent = "Card Number";
    const h5CardNum = document.createElement("h5");
    h5CardNum.classList.add("number");
    h5CardNum.textContent = card.styledCN || "0000 0000 0000 0000";

    const h5Name = document.createElement("h5");
    h5Name.classList.add("name");
    h5Name.textContent = user.username || "XXXXX-XXXXX";

    nameNumber.appendChild(h6CardNumLabel);
    nameNumber.appendChild(h5CardNum);
    nameNumber.appendChild(h5Name);

    const validDate = document.createElement("div");
    validDate.classList.add("valid-date");

    const h6ValidDateLabel = document.createElement("h6");
    h6ValidDateLabel.textContent = "Valid Thru";
    const h5ValidDate = document.createElement("h5");
    h5ValidDate.textContent = card.styledED || "XX/XX";

    validDate.appendChild(h6ValidDateLabel);
    validDate.appendChild(h5ValidDate);

    cardDetails.appendChild(nameNumber);
    cardDetails.appendChild(validDate);

    // Monthly charges
    const monthlyCharges = document.createElement("div");
    monthlyCharges.classList.add("monthlyCharges");
    const pLastCharge = document.createElement("p");
    pLastCharge.textContent = "Last Charge: $0.00";
    const pNextCharge = document.createElement("p");
    pNextCharge.textContent = "Next Charge: $0.00";
    monthlyCharges.appendChild(pLastCharge);
    monthlyCharges.appendChild(pNextCharge);

    // Assemble card
    cardContainer.appendChild(cardHeader);
    cardContainer.appendChild(cardDetails);
    cardContainer.appendChild(monthlyCharges);

    cardLink.appendChild(cardContainer);
    userCardsContainer.appendChild(cardLink);
  });
});
