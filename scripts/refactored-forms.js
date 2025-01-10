let users;
let auth;

class CustomForm {
  constructor(formElement) {
    this.$form = formElement;
    this._init();

    this._errorHandler = new CustomFormErrorHandler(this);
    this._validator = new CustomFormValidator(this, this._errorHandler);
    this._actionHandler = new CustomFormActionHandler(this, this._errorHandler);
    this._bindEventListeners();
  }

  _init() {
    this.$inputs = Array.from(this.$form.querySelectorAll("input"));
    this.$submitBtn = this.$form.querySelector('button[type="submit"]');
  }
  _bindEventListeners() {
    this.$form.addEventListener("submit", (event) => this._handleSubmit(event));
    this.$form.addEventListener("change", (event) => this._validator.validateIfInput(event));
    this.$form.addEventListener("focusout", (event) => this._validator.validateIfInput(event));
  }
  _handleSubmit(event) {
    event.preventDefault();
    if (this._validator.validateForm()) {
      this._actionHandler.handleFormAction();
    }
  }
}

class CustomFormValidator {
  static _minimumAge = 16;
  static _dictionary = {
    email: { method: CustomFormValidator._validateEmail, error: "Please enter a valid email address." },
    password: { method: CustomFormValidator._validatePassword, error: "Password must be 8 characters and include a-z, A-Z, 0-9, special character" },
    birthdate: { method: CustomFormValidator._validateBirthdate, error: `Must be at least ${CustomFormValidator._minimumAge} years old` },
    cardNumber: { method: CustomFormValidator._validateCardNumber, error: "Card number must be 16 digits" },
    expirationDate: { method: CustomFormValidator._validateExpirationDate, error: "Expiration date must be valid" },
    cvv: { method: CustomFormValidator._validateCVV, error: "CVV must be exactly 3 digits" }
  };

  constructor(customForm, errorHandler) {
    this._customForm = customForm;
    this._errorHandler = errorHandler;
  }

  validateForm() {
    return this._customForm.$inputs.every((inputElement) => this.validateInput(inputElement));
  }
  validateInput(inputElement) {
    const name = inputElement.name;
    const validation = CustomFormValidator._dictionary[name];
    if (!validation) return false;

    const valid = validation.method(inputElement.value);
    valid ? this._errorHandler.clearInputErrorMessage(inputElement) : this._errorHandler.setInputErrorMessage(inputElement, validation.error);
    return valid;
  }
  validateIfInput(event) {
    if (event.target.localName === "input") {
      this.validateInput(event.target);
    }
  }
  static _validateEmail(value) {
    const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return regex.test(value);
  }
  static _validatePassword(value) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8}$/;
    return regex.test(value);
  }
  static _validateBirthdate(value) {
    const today = new Date();
    const birthdate = new Date(value);
    let age = today.getFullYear() - birthdate.getFullYear();
    const isBeforeBirthday = today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate());
    if (isBeforeBirthday) {
      age -= 1;
    }
    return age >= CustomFormValidator._minimumAge; // maybe add after
  }
  static _validateCardNumber(value) {
    value = value.replaceAll(" ", ""); // check empty
    const regex = /^\d{16}$/;
    return regex.test(value);
  }
  static _validateExpirationDate(value) {
    if (!value) return false;
    const expirationDate = new Date(value + "-01");
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    return expirationDate >= thisMonth;
  }
  static _validateCVV(value) {
    const regex = /^\d{3}$/;
    return regex.test(value);
  }
}

class CustomFormErrorHandler {
  constructor(customForm) {
    this._customForm = customForm;
  }

  setFormErrorMessage(message) {
    this._setErrorMessage(this._customForm.$form, message);
  }
  clearFormErrorMessage() {
    this._clearErrorMessage(this._customForm.$form);
  }
  setInputErrorMessage(inputElement, message) {
    this._setErrorMessage(inputElement, message);
  }
  clearInputErrorMessage(inputElement) {
    this._clearErrorMessage(inputElement);
  }
  _setErrorMessage(element, message) {
    // need to change this for something else
    let errorSpan = element.parentElement.querySelector(`.${element.localName}-error-message`);
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add(`${element.localName}-error-message`);
      element.parentElement.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
    if (element.localName === "input") element.classList.add("error");
  }
  _clearErrorMessage(element) {
    let errorSpan = element.parentElement.querySelector(`.${element.localName}-error-message`);
    if (errorSpan) errorSpan.remove();
    if (element.localName === "input") element.classList.remove("error");
  }
}

class CustomFormActionHandler {
  _dictionary = { signup: (values) => auth.signUp(values), signin: (values) => auth.signin(values) };

  constructor(customForm, errorHandler) {
    this._customForm = customForm;
    this._errorHandler = errorHandler;
    this._action = this._customForm.$form.dataset.action;
  }

  handleFormAction() {
    try {
      if (this._action in this._dictionary) {
        this._dictionary[this._action](this._getFormValues());
      } else throw new Error("Invalid form action");
      this._errorHandler.clearFormErrorMessage();
    } catch (error) {
      this._errorHandler.setFormErrorMessage(error.message);
    }
  }
  _getFormValues() {
    const values = {};
    this._customForm.$inputs.forEach((inputElement) => (values[inputElement.name] = inputElement.value));
    return values;
  }
}

class Users {
  _key = "listOfUsers";

  constructor() {
    this._init();
  }

  _init() {
    this._setUsers(this._getUsers());
  }
  _getUsers() {
    return JSON.parse(localStorage.getItem(this._key) || "[]");
  }
  _setUsers(value) {
    value = typeof value != "object" ? JSON.parse(value || "[]") : value;
    localStorage.setItem(this._key, JSON.stringify(value));
  }
  addUser(user) {
    const users = this._getUsers();
    user.email = user.email.toLowerCase(); // convert email to lowercase
    users.push(user);
    this._setUsers(users);
  }
  removeUser(email) {
    let users = this._getUsers();
    users = users.filter((user) => user.email != email.toLowerCase());
    this._setUsers(users);
  }
  getUser(email) {
    return this._getUsers().find((user) => user.email === email.toLowerCase());
  }
}

class Auth {
  _key = "loggedUser";

  constructor(users) {
    this._users = users;
  }

  signin(credentials) {
    this._ensureNotLogged();
    const dbUser = this._users.getUser(credentials.email.toLowerCase());
    if (!dbUser) throw new Error("Email not found");
    if (credentials.password != dbUser.password) throw new Error("Wrong password");
    this._setLoggedUser(credentials.email.toLowerCase());
    window.location.href = "./Dashboard.html";
  }
  signUp(userValues) {
    this._ensureNotLogged();
    const dbUser = this._users.getUser(userValues.email.toLowerCase());
    if (dbUser) throw new Error("Email already exists");
    this._users.addUser(userValues);
    this._setLoggedUser(userValues.email);
    window.location.href = "./Dashboard.html";
  }
  getCurrentUserEmail() {
    return localStorage.getItem(this._key);
  }
  isLogged() {
    if (this.getCurrentUserEmail()) return true;
    return false;
  }
  _setLoggedUser(email) {
    localStorage.setItem(this._key, email);
  }
  _ensureNotLogged() {
    if (this.isLogged()) throw new Error("Already logged in");
  }
}

function init() {
  users = new Users();
  auth = new Auth(users);

  const forms = document.querySelectorAll(".custom-form");
  forms.forEach((form) => new CustomForm(form));
}

init();
