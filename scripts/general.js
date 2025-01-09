/* maybe need to change how this script works later for using percentages for navbar and footer */
/* it breaks with all the responsivity bs */

const elementVariables = ["navbar", "footer"];

function init() {
  elementVariables.forEach((varName) => injectCssVariables(varName));
}

function injectCssVariables(varName) {
  const element = document.querySelector(`.${varName}`);

  if (element) {
    document.documentElement.style.setProperty(`--${varName}Height`, getElementHeight(element));
    /*console.log(getElementHeight(element));*/
  }
}

function getElementHeight(element) {
  return `${element.clientHeight}px`;
}

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("resize", init);
document.addEventListener("scroll", init);
