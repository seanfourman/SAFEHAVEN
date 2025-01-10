document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("loggedUser")) {
    alert("You are not logged in. Redirecting to the home page.");
    window.location.href = "./Home.html";
  }
});
