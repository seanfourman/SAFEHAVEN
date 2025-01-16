class CustomForm {
  // constructor sets form elements and initializes error handler, validator, and action handler and binds event listeners
  constructor(formElement) {
    this.$form = formElement;
    this._init();

    this._errorHandler = new CustomFormErrorHandler(this);
    this._validator = new CustomFormValidator(this, this._errorHandler);
    this._actionHandler = new CustomFormActionHandler(this, this._errorHandler);

    // if the form has a data-init attribute, it will initiate the form values from the source
    if (this._initiateSource) this._initiator = new CustomFormValuesInitiator(this, this._initiateSource);
    this._bindEventListeners();
  }

  // _init gets all input elements and the submit button
  _init() {
    this.$inputs = Array.from(this.$form.querySelectorAll("input"));
    this.$submitBtn = this.$form.querySelector('button[type="submit"]');
    this._initiateSource = this.$form.dataset.init;
  }

  // _bindEventListeners binds submit, change, and focusout events to the form
  _bindEventListeners() {
    this.$form.addEventListener("submit", (event) => this._handleSubmit(event));
    this.$form.addEventListener("change", (event) => this._validator.validateIfInput(event));
    this.$form.addEventListener("focusout", (event) => this._validator.validateIfInput(event));
  }

  // _handleSubmit prevents default form submission, validates form, and calls action handler
  // preventDefault disables the URL from changing on submit, useless in vanilla JS since it's not a SPA anyway
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
    cvv: { method: CustomFormValidator._validateCVV, error: "CVV must be exactly 3 digits" },
    userName: { method: CustomFormValidator._validateUserName, error: "Username must be at least 3 characters" },
    billingDay: { method: CustomFormValidator._validateBillingDay, error: "Billing day must be 1 - 28" },
    cardHolder: { method: CustomFormValidator._validateCardHolder, error: "Card Holder must be a valid name" }
  };

  // constructor sets form and error handler
  constructor(customForm, errorHandler) {
    this._customForm = customForm;
    this._errorHandler = errorHandler;
  }

  // validateForm checks if all inputs are valid
  // every returns true if all elements in the array pass the test
  validateForm() {
    return this._customForm.$inputs.every((inputElement) => this.validateInput(inputElement));
  }

  // validateInput checks if the input is valid and sets or clears the error message
  validateInput(inputElement) {
    const name = inputElement.name;
    const validation = CustomFormValidator._dictionary[name]; // get validation method and error message from dictionary
    if (!validation) return true;

    const valid = validation.method(inputElement.value); // call validation method in dictionary
    valid ? this._errorHandler.clearInputErrorMessage(inputElement) : this._errorHandler.setInputErrorMessage(inputElement, validation.error); // set or clear error message
    return valid;
  }

  // validateIfInput checks if the event target is an input and calls validateInput (used for change and focusout events)
  validateIfInput(event) {
    if (event.target.localName === "input") {
      this.validateInput(event.target);
    }
  }

  // validation methods
  // Checks if the email is valid (if it has an @ and a .)
  static _validateEmail(value) {
    const regex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return regex.test(value);
  }

  // Checks if the password is valid (8 characters, at least one lowercase, one uppercase, one number, and ONLY one special character)
  static _validatePassword(value) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{8}$/;
    const specialCharRegex = /[@$!%*?&#]/g;
    if (!regex.test(value)) return false;
    const specialCharMatches = value.match(specialCharRegex);
    if (!specialCharMatches || specialCharMatches.length !== 1) return false;
    return true;
  }

  // Checks if the birthdate is valid (at least 16 years old)
  static _validateBirthdate(value) {
    const today = new Date();
    const birthdate = new Date(value);
    let age = today.getFullYear() - birthdate.getFullYear(); // calculate age only by year

    // check if birthday has passed this year, if not, subtract 1 from age
    const isBeforeBirthday = today.getMonth() < birthdate.getMonth() || (today.getMonth() === birthdate.getMonth() && today.getDate() < birthdate.getDate());
    if (isBeforeBirthday) {
      age -= 1;
    }
    return age >= CustomFormValidator._minimumAge;
  }

  // Checks if the card number is valid (16 digits)
  static _validateCardNumber(value) {
    value = value.replaceAll(" ", ""); // remove spaces
    const regex = /^\d{16}$/;
    return regex.test(value);
  }

  // Checks if the expiration date is valid (not before this month)
  static _validateExpirationDate(value) {
    if (!value) return false;
    const expirationDate = new Date(value + "-01"); // add a string "-01" to the end of the date, so it becomes the first day of the month
    const thisMonth = new Date();
    thisMonth.setDate(1); // set the date to the first day of the month
    thisMonth.setHours(0, 0, 0, 0); // set the time to exactly 00:00:00
    return expirationDate >= thisMonth;
  }

  // Checks if the CVV is valid (3 digits)
  static _validateCVV(value) {
    const regex = /^\d{3}$/;
    return regex.test(value);
  }

  // Checks if the userName is valid (at least 3 characters)
  static _validateUserName(value) {
    value = value.trim();
    const regex = /^[A-Za-z0-9\s!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|-]{3,}$/;
    return regex.test(value);
  }

  // Checks if the billing day is valid (1-28)
  static _validateBillingDay(value) {
    value = value.trim();
    const regex = /^(1[0-9]|2[0-8]|[1-9])$/;
    return regex.test(value);
  }

  // Checks if the card holder is valid (text)
  static _validateCardHolder(value) {
    value = value.trim();
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(value);
  }
}

class CustomFormErrorHandler {
  // constructor sets form
  constructor(customForm) {
    this._customForm = customForm;
  }

  // setFormErrorMessage sets the error message for the form
  setFormErrorMessage(message) {
    this._setErrorMessage(this._customForm.$form, message);
  }

  // clearFormErrorMessage clears the error message for the form
  clearFormErrorMessage() {
    this._clearErrorMessage(this._customForm.$form);
  }

  // setInputErrorMessage sets the error message for the input
  setInputErrorMessage(inputElement, message) {
    this._setErrorMessage(inputElement, message);
  }

  // clearInputErrorMessage clears the error message for the input
  clearInputErrorMessage(inputElement) {
    this._clearErrorMessage(inputElement);
  }

  // _setErrorMessage sets the error message for the element (input or form)
  // the code is kinda meh, but we need to access the "form-group" element for input messages, but for form messages, we need to access the form itself
  // so one needs to use parentElement and the other doesn't. I could've made a separate function for each, but then I'd have to duplicate the code
  _setErrorMessage(element, message) {
    let errorSpan = element.parentElement.querySelector(`.${element.localName}-error-message`);
    if (!errorSpan) {
      if (element.localName === "input") {
        errorSpan = document.createElement("span");
        errorSpan.classList.add(`${element.localName}-error-message`);
        element.parentElement.appendChild(errorSpan);
      } else if (element.localName === "form") {
        errorSpan = document.createElement("span");
        errorSpan.classList.add(`${element.localName}-error-message`);
        element.appendChild(errorSpan);
      }
    }
    errorSpan.textContent = message;
    if (element.localName === "input") element.classList.add("error"); // add error class to input (red border around input)
  }

  // _clearErrorMessage clears the error message for the element (input or form)
  _clearErrorMessage(element) {
    let errorSpan = element.parentElement.querySelector(`.${element.localName}-error-message`);
    if (errorSpan) errorSpan.remove();
    if (element.localName === "input") element.classList.remove("error"); // add error class to input (red border around input)
  }
}

class CustomFormActionHandler {
  // dictionary of actions and their corresponding functions (signup, signin and updateUser)
  _dictionary = {
    signup: (values) => window.auth.signUp(values),
    signin: (values) => window.auth.signIn(values),
    updateUser: (values) => window.users.updateUser(values),
    addCard: (values) => window.users.addCard(window.auth.getCurrentUserEmail(), values),
    updateCard: (values) => window.users.updateCard(window.auth.getCurrentUserEmail(), values)
  };

  // constructor sets form, error handler, and action
  constructor(customForm, errorHandler) {
    this._customForm = customForm;
    this._errorHandler = errorHandler;
    this._action = this._customForm.$form.dataset.action;
  }

  // handleFormAction calls the corresponding function from the dictionary
  handleFormAction() {
    try {
      if (this._action in this._dictionary) {
        this._dictionary[this._action](this._getFormValues());
      } else throw new Error("Invalid form action");
      this._errorHandler.clearFormErrorMessage(); // clear form error message if there was one
    } catch (error) {
      this._errorHandler.setFormErrorMessage(error.message); // set form error message
    }
  }

  // _getFormValues gets the values from the form inputs
  _getFormValues() {
    const values = {};
    this._customForm.$inputs.forEach((inputElement) => (values[inputElement.name] = inputElement.value)); // set values object with input name as key and input value as value
    return values;
  }
}

// CustomFormValuesInitiator initiates form values from a source (user or card)
class CustomFormValuesInitiator {
  static _dictionary = {
    user: () => window.users.getUser(window.auth.getCurrentUserEmail()),
    card: (index) => window.users.getUser(window.auth.getCurrentUserEmail()).cards[index]
  };

  constructor(customForm, sourceName) {
    this._customForm = customForm;
    this._sourceName = sourceName;

    this._init();
    this._initiateValues();
  }

  _init() {
    this._sourceMethod = CustomFormValuesInitiator._dictionary[this._sourceName];

    if (this._sourceMethod.length) {
      this._source = this._sourceMethod(this._customForm.$form.dataset.index);
    } else {
      this._source = this._sourceMethod();
    }

    this.$inputs = this._customForm.$inputs.filter((inputElement) => !inputElement.hasAttribute("data-init-skip")); // skip inputs with data-init-skip attribute
  }

  _initiateValues() {
    this.$inputs.forEach((inputElement) => (inputElement.value = this._source[inputElement.name]));
  }
}

// IIFE to initialize all forms on the page
(function () {
  const forms = document.querySelectorAll(".custom-form");
  forms.forEach((form) => {
    if (!form.hasAttribute("data-template")) {
      new CustomForm(form);
    }
  });
})();
