const elementVariables = ["navbar", "footer"];

function init() {
  elementVariables.forEach((varName) => injectCssVariables(varName));
}

// create properties for each element in the elementVariables array
function injectCssVariables(varName) {
  const element = document.querySelector(`.${varName}`);

  if (element) {
    document.documentElement.style.setProperty(`--${varName}Height`, getElementHeight(element));
  }
}

function getElementHeight(element) {
  return `${element.clientHeight}px`;
}

// if the user is logged in, change the account link to the dashboard instead of the authentication page
document.addEventListener("DOMContentLoaded", function () {
  const accountLink = document.getElementById("accountLink");
  if (localStorage.getItem("loggedUser") && accountLink) {
    accountLink.href = "./Dashboard.html";
  }
});

// eventListeners for getting the height of the navbar and footer
document.addEventListener("DOMContentLoaded", init);
document.addEventListener("resize", init);
document.addEventListener("scroll", init);
