class Users {
  _key = "listOfUsers";

  // constructor calls _init to set users
  constructor() {
    this._init();
  }

  // _init gets users from local storage and sets them to the class instance
  _init() {
    this._setUsers(this._getUsers());
  }
  // _getUsers gets users from local storage
  _getUsers() {
    return JSON.parse(localStorage.getItem(this._key) || "[]");
  }
  // _setUsers sets users to local storage as a string (JSON)
  // value is stringified if it is not an object
  _setUsers(value) {
    value = typeof value != "object" ? JSON.parse(value || "[]") : value;
    localStorage.setItem(this._key, JSON.stringify(value));
  }
  // addUser pushes a new user to the users array and sets it to local storage
  addUser(user) {
    const users = this._getUsers();
    users.push(user);
    this._setUsers(users);
  }
  // updateUser maps through the users array and updates the user with the given email
  updateUser(user) {
    const users = this._getUsers();
    const updatedUsers = users.map((dbUser) => (dbUser.email === user.email ? { ...dbUser, ...user } : dbUser));
    this._setUsers(updatedUsers);
    window.location.reload();
  }
  // removeUser filters the users array to remove the user with the given email
  removeUser(email) {
    let users = this._getUsers();
    users = users.filter((user) => user.email != email);
    this._setUsers(users);
  }
  // getUser finds a user in the users array with the given email (find method returns the first element that satisfies the condition)
  getUser(email) {
    return this._getUsers().find((user) => user.email === email);
  }
  getCard(displayCardNumber) {
    const dbUser = this._getUsers().find((user) => user.cards.find((card) => card.displayCardNumber === displayCardNumber));
    return dbUser ? dbUser.cards.find((card) => card.displayCardNumber === displayCardNumber) : null;
  }
  updateCard(email, cardValues) {
    const users = this._getUsers();
    const updatedUsers = users.map((dbUser) => {
      if (dbUser.email === email) {
        dbUser.cards = dbUser.cards.map((card) => (card.displayCardNumber === cardValues.displayCardNumber ? { ...card, ...cardValues } : card));
      }
      return dbUser;
    });
    this._setUsers(updatedUsers);
    window.location.reload();
  }
  addCard(email, cardValues) {
    this.ensureUniqueCardNumber(cardValues.displayCardNumber);
    const users = this._getUsers();
    const updatedUsers = users.map((dbUser) => {
      if (dbUser.email === email) {
        dbUser.cards.push(this.buildCard(cardValues));
      }
      return dbUser;
    });
    this._setUsers(updatedUsers);
    window.location.reload();
  }
  buildCard(cardValues) {
    return {
      cardNumber: cardValues.cardNumber.replaceAll(" ", ""),
      displayCardNumber: cardValues.cardNumber,
      expirationDate: cardValues.expirationDate,
      displayExpirationDate: cardValues.expirationDate.slice(2).replaceAll("-", "/").split("/").reverse().join("/"),
      cvv: cardValues.cvv,
      billingDay: 1, // default billing day
      cardHolder: cardValues.cardHolder,
      transactions: []
    };
  }
  ensureUniqueEmail(email) {
    if (this.getUser(email)) throw new Error("Email already exists");
  }
  ensureUniqueCardNumber(displayCardNumber) {
    if (this.getCard(displayCardNumber)) throw new Error("Card already exists");
  }
}

class Auth {
  // key for local storage
  _key = "loggedUser";

  // constructor sets users
  constructor(users) {
    this._users = users;
  }

  // signIn checks if user is already logged in, then checks if email exists in the database, then checks if the password is correct, then sets the user as logged in and redirects to the dashboard
  signIn(credentials) {
    this._ensureNotLogged();
    credentials.email = credentials.email.toLowerCase(); // convert email to lowercase
    const dbUser = this._users.getUser(credentials.email); // get user from database
    if (!dbUser) throw new Error("Email not found");
    if (credentials.password != dbUser.password) throw new Error("Wrong password");
    this._setLoggedUser(credentials.email);
    window.location.href = "./Dashboard.html";
  }
  // signUp checks if user is already logged in, then checks if email already exists in the database, then adds the user to the database and sets the user as logged in and redirects to the dashboard
  signUp(userValues) {
    this._ensureNotLogged();
    this._users.ensureUniqueEmail(userValues.email);
    this._users.ensureUniqueCardNumber(userValues.cardNumber);
    userValues.email = userValues.email.toLowerCase();

    // add card info to cards array
    userValues.cards = [this._users.buildCard(userValues)];
    userValues.userName = userValues.cardHolder;

    // remove card info from userValues, as it is now in the cards array
    delete userValues.cardNumber;
    delete userValues.expirationDate;
    delete userValues.cvv;

    // Add user to the local storage
    this._users.addUser(userValues);
    this._setLoggedUser(userValues.email);
    window.location.href = "./Dashboard.html";
  }
  // getCurrentUserEmail gets the email of the current user from local storage
  getCurrentUserEmail() {
    return localStorage.getItem(this._key);
  }
  // isLogged checks if the user is logged in
  isLogged() {
    if (this.getCurrentUserEmail()) return true;
    return false;
  }
  // _setLoggedUser sets the current user in local storage
  _setLoggedUser(email) {
    localStorage.setItem(this._key, email);
  }
  // _ensureNotLogged checks if the user is already logged in
  _ensureNotLogged() {
    if (this.isLogged()) throw new Error("Already logged in");
  }
  // logout removes the current user from local storage and redirects to the home page
  logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "./Home.html";
  }
}

// init
(function () {
  window.users = new Users();
  window.auth = new Auth(window.users);

  const isLogged = window.auth.isLogged(); // check if user is logged
  handleRestrictedPage(isLogged); // check if page is restricted

  // fill user data if logged
  if (isLogged) {
    new RenderData(window.users.getUser(window.auth.getCurrentUserEmail()), document.body);
  }

  // if logged and on dashboard, call function to change user content
  if (isLogged && document.querySelector(".logout")) {
    changeUserContent();
  }

  // if logged and on home, change account link
  if (isLogged && document.getElementById("accountLink")) {
    document.getElementById("accountLink").href = "./Dashboard.html";
  }
})();

function handleRestrictedPage(isLogged) {
  // check if page is restricted
  const pageAuthSettings = document.body.dataset.auth;

  if (!pageAuthSettings) return;
  if (pageAuthSettings === "true" && !isLogged) {
    document.documentElement.innerHTML = ""; // clears page content
    setTimeout(() => {
      alert("You are not logged in. Redirecting to the home page.");
      window.location.href = "./Home.html";
    }, 10); // delay for page to be blank
  }
}

// change user content for dashboard
function changeUserContent() {
  document.querySelectorAll(".logout").forEach((element) => {
    element.addEventListener("click", window.auth.logout);
  });
}
