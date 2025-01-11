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

// eventListeners for getting the height of the navbar and footer
document.addEventListener("DOMContentLoaded", initInject);
document.addEventListener("resize", initInject);
document.addEventListener("scroll", initInject);
