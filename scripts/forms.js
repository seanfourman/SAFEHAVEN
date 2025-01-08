// Constants
const MINIMUM_AGE = 16;
const USERS_LIST_KEY = "listOfUsers";

/* FORM VALIDATION */
// Input specific validation functions
function validateEmail(input) {
  const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return regex.test(input);
}
function validatePassword(input) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8}$/;
  return regex.test(input);
}
function validateBirthdate(input) {
  const today = new Date();
  const age = today.getFullYear() - new Date(input).getFullYear(); // check if value empty
  return age >= MINIMUM_AGE; // maybe add after
}
function validateCardNumber(input) {
  input = input.replaceAll(" ", ""); // check empty
  const regex = /^\d{16}$/;
  return regex.test(input);
}
function validateExpirationDate(input) {
  if (!input) return false;
  const expirationDate = new Date(input + "-01");
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  return expirationDate >= thisMonth;
}
function validateCVV(input) {
  const regex = /^\d{3}$/;
  return regex.test(input);
}

// Form validation dictionary and errors
const validationDictionary = {
  email: { method: validateEmail, error: "Please enter a valid email address." },
  password: { method: validatePassword, error: "Password must be 8 characters long, must include a-z, A-Z, 0-9, special character" },
  birthdate: { method: validateBirthdate, error: `Must be at least ${MINIMUM_AGE} years old` },
  cardNumber: { method: validateCardNumber, error: "Card number must be 16 digits" },
  expirationDate: { method: validateExpirationDate, error: "Expiration date must be valid" },
  cvv: { method: validateCVV, error: "CVV must be exactly 3 digits" }
};

// Set error
function setErrorMessage(inputElement, message) {
  let errorSpan = inputElement.parentElement.querySelector(".error-message");
  if (!errorSpan) {
    errorSpan = document.createElement("span");
    errorSpan.classList.add("error-message");
    inputElement.parentElement.appendChild(errorSpan);
  }
  errorSpan.textContent = message;
  inputElement.classList.add("error");
}

function clearErrorMessage(inputElement) {
  let errorSpan = inputElement.parentElement.querySelector(".error-message");
  if (errorSpan) errorSpan.remove();
  inputElement.classList.remove("error");
}

// Form validation handlers
function validateFormInput(inputElement) {
  const name = inputElement.name;
  const validation = validationDictionary[name];
  if (!validation) return false;

  const valid = validation.method(inputElement.value);
  valid ? clearErrorMessage(inputElement) : setErrorMessage(inputElement, validation.error);
  return valid;
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll("input");

  inputs.forEach((input) => {
    if (!validateFormInput(input)) {
      isValid = false;
    }
  });
  return isValid;
}

function validateIfInput(event) {
  if (event.target.tagName === "INPUT") {
    validateFormInput(event.target);
  }
}

function attachFormsFunctionality(form) {
  const submitButton = form.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (validateForm(form)) {
        handleFormAction(form);
      }
    });
    form.addEventListener("change", validateIfInput);
    form.addEventListener("focusout", validateIfInput);
  }
}

/* END OF FORM VALIDATION */

/* FORM ACTIONS */
function addUser(values) {
  const users = getUsers();
  users.push(values);
  setUsers(users);
}
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_LIST_KEY) || "[]");
}
function setUsers(value) {
  value = typeof value != "object" ? JSON.parse(value || "[]") : value;
  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(value));
}
function initUsers() {
  setUsers(getUsers());
}

const actionsDictionary = {
  signup: addUser
};

function getFormValues(form) {
  const values = {};
  form.querySelectorAll("input").forEach((input) => (values[input.name] = input.value));
  return values;
}
function handleFormAction(form) {
  const actionName = form.dataset.action;
  const action = actionsDictionary[actionName];

  if (action) {
    action(getFormValues(form));
  }
}

function init() {
  const forms = document.querySelectorAll(".custom-form");
  forms.forEach((form) => attachFormsFunctionality(form));
  initUsers();
}

init();
