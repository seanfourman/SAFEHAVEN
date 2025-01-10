const emailAddress = localStorage.getItem("loggedUser");
const username = emailAddress.split("@")[0];

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("loggedUser")) {
    alert("You are not logged in. Redirecting to the home page.");
    window.location.href = "./Home.html";
  }
  changeConnectedEmail();
});

function changeConnectedEmail() {
  document.getElementById("emailAddress").innerHTML = emailAddress;
  document.getElementById("logout").addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("loggedUser");
  window.location.href = "./Home.html";
}
