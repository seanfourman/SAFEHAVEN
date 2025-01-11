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
    users.push(user);
    this._setUsers(users);
  }
  removeUser(email) {
    let users = this._getUsers();
    users = users.filter((user) => user.email != email);
    this._setUsers(users);
  }
  getUser(email) {
    return this._getUsers().find((user) => user.email === email);
  }
}

class Auth {
  _key = "loggedUser";

  constructor(users) {
    this._users = users;
  }

  signin(credentials) {
    this._ensureNotLogged();
    credentials.email = credentials.email.toLowerCase();
    const dbUser = this._users.getUser(credentials.email);
    if (!dbUser) throw new Error("Email not found");
    if (credentials.password != dbUser.password) throw new Error("Wrong password");
    this._setLoggedUser(credentials.email);
    window.location.href = "./Dashboard.html";
  }
  signUp(userValues) {
    this._ensureNotLogged();
    userValues.email = userValues.email.toLowerCase();
    const dbUser = this._users.getUser(userValues.email);
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

  logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "./Home.html";
  }
}

class ActiveUserData {
  constructor(user, bodyElement) {
    this._user = user;
    this._bodyElement = bodyElement;
    this._init();
    this._fillData();
  }

  _init() {
    this.$fields = Array.from(this._bodyElement.querySelectorAll("[data-user-field]"));
  }
  _fillData() {
    this.$fields.forEach((element) => {
      element.textContent = this._user[element.dataset.userField];
    });
  }
}

// init
(function () {
  window.users = new Users();
  window.auth = new Auth(window.users);

  const isLogged = window.auth.isLogged();
  handleRestrictedPage(isLogged);

  // fill user data if logged
  if (isLogged) {
    new ActiveUserData(window.users.getUser(window.auth.getCurrentUserEmail()), document.body);
  }

  // if logged and on dashboard, call function to change user content
  if (isLogged && document.getElementById("emailAddress")) {
    changeUserContent(window.auth.getCurrentUserEmail());
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
    }, 1); // delay for page to be blank
  }
}

function changeUserContent(emailAddress) {
  document.getElementById("emailAddress").innerHTML = emailAddress;
  document.getElementById("username").innerHTML = emailAddress.split("@")[0];
  document.getElementById("logout").addEventListener("click", auth.logout);
}
