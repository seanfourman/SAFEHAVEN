// getRealTime returns the current time in HH:MM format
function getRealTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes;
  return strTime;
}

// getWeekday returns the current weekday
function getWeekday() {
  let date = new Date();
  let weekday = date.getDay();
  let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekdays[weekday];
}

// getRealDate returns the current date in Month DD format
function getRealDate() {
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
  let strDate = monthName + " " + day;
  return strDate;
}

// update time, date and welcome message based on real time for dashboard
function updateRealTime() {
  document.getElementById("time").innerHTML = getRealTime();
  document.getElementById("date").innerHTML = getWeekday() + ", " + getRealDate();

  if (document.getElementById("welcome-message")) {
    if (getRealTime() >= "06:00" && getRealTime() < "12:00") {
      document.getElementById("welcome-message").innerHTML = "Good Morning!";
    } else if (getRealTime() >= "12:00" && getRealTime() < "18:00") {
      document.getElementById("welcome-message").innerHTML = "Good Afternoon!";
    } else if (getRealTime() >= "18:00" && getRealTime() < "24:00") {
      document.getElementById("welcome-message").innerHTML = "Good Evening!";
    } else {
      document.getElementById("welcome-message").innerHTML = "Good Night!";
    }
  }
}

// change background image
function changeBackground() {
  let background = document.querySelector(".page-image");

  if (background) {
    //background.style.backgroundImage = 'url("https://picsum.photos/1920/1080")';
    background.style.backgroundImage = 'url("https://picsum.photos/2560/1440")';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateRealTime();
  changeBackground();
});

setInterval(updateRealTime, 1000); // update every second
