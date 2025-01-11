// desktop view
const formContainer = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

const signupSwitch = document.querySelector(".signup .form-switch");
const signinSwitch = document.querySelector(".signin .form-switch");

// mobile view
function toggleActiveClass(isActive) {
  formContainer.classList.toggle("active", isActive);
}

[registerBtn, signinSwitch].forEach((element) => element?.addEventListener("click", () => toggleActiveClass(true)));
[loginBtn, signupSwitch].forEach((element) => element?.addEventListener("click", () => toggleActiveClass(false)));
