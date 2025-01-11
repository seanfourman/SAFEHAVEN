const elementVariables = ["navbar", "footer"];

// initialize the injectCssVariables function
function initInject() {
  elementVariables.forEach((varName) => injectCssVariables(varName));
}

// create properties for each element in the elementVariables array
function injectCssVariables(varName) {
  const element = document.querySelector(`.${varName}`);

  if (element) {
    document.documentElement.style.setProperty(`--${varName}Height`, getElementHeight(element));
  }
}

// get the height of the element
function getElementHeight(element) {
  return `${element.clientHeight}px`;
}

// change title to page name
function changePageName() {
  const path = window.location.pathname;
  let pageName = path.split("/").pop().split(".")[0];
  pageName = pageName.toUpperCase() + " / SafeHaven";
  document.title = pageName;
}

// hamburger menu
function initHamburgerMenu() {
  if (!document.querySelector(".hamburger-menu") && !document.querySelector(".nav-links-mobile")) return;
  const hamburger = document.querySelector(".hamburger-menu");
  const mobileNavLinks = document.querySelector(".nav-links-mobile");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileNavLinks.classList.toggle("active");
  });
}

// eventListeners for getting the height of the navbar and footer
document.addEventListener("DOMContentLoaded", () => {
  initInject();
  initHamburgerMenu();
  changePageName();
});

document.addEventListener("resize", initInject);
document.addEventListener("scroll", initInject);
