/* Desktop */
const formContainer = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

const signupSwitch = document.querySelector(".signup .form-switch");
const signinSwitch = document.querySelector(".signin .form-switch");

function toggleActiveClass(isActive) {
  formContainer.classList.toggle("active", isActive);
}

[registerBtn, signinSwitch].forEach((el) => el?.addEventListener("click", () => toggleActiveClass(true)));
[loginBtn, signupSwitch].forEach((el) => el?.addEventListener("click", () => toggleActiveClass(false)));
