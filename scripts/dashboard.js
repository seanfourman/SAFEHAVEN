if (window.auth.isLogged()) {
  console.log(`User is connected: ${window.auth.getCurrentUserEmail()}`);
} else {
  console.log("No user is connected.");
}

let emailAddress = document.querySelector(".connected-user h1");
let userName = emailAddress.textContent.split("@")[0];

console.log(userName);
