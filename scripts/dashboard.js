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
    //background.style.backgroundImage = 'url("https://picsum.photos/2560/1440")';
    const images = Array.from({ length: 30 }, (_, i) => i + 1);
    const randomImage = images[Math.floor(Math.random() * images.length)];
    background.style.backgroundImage = `url('../Images/dashboard-bg/${randomImage}.jpg')`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateRealTime();
  changeBackground();
  calculateCharges();
  generateBirthdayCoupon();
  checkMidnight();
});

setInterval(updateRealTime, 1000); // update every second

// calculates the total charges for the current and previous month and displays them on the dashboard
function calculateCharges() {
  const { currentMonth, previousMonth } = getCurrentAndPreviousMonth();
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  const transactions = [];
  user.cards.forEach((card) => transactions.push(...card.transactions));

  const currentMonthExpenses = calculateMonthlyExpenses(transactions, currentMonth);
  const previousMonthExpenses = calculateMonthlyExpenses(transactions, previousMonth);

  if (previousMonthExpenses > 0) {
    document.querySelector("#previous-charge span").textContent = `$${previousMonthExpenses}`;
    document.querySelector("#previous-charge").classList.remove("element-hidden");
  }
  if (currentMonthExpenses >= 0) {
    document.querySelector("#next-charge span").textContent = `$${currentMonthExpenses}`;
  }
  if (currentMonthExpenses < 0) {
    document.querySelector("#next-charge span").textContent = `$0`;
  }
}

// returns the current and previous month in the format "YYYY-MM"
function getCurrentAndPreviousMonth() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // subtract 1 month
  const previousMonth = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, "0")}`;
  return { currentMonth, previousMonth };
}

// calculates the total expenses for a given month
function calculateMonthlyExpenses(transactions, targetMonth) {
  let totalExpenses = 0;
  transactions.forEach((transaction) => {
    if (transaction.Date) {
      const dateParts = transaction.Date.split("/");
      const yearMonth = `${dateParts[2]}-${dateParts[1].padStart(2, "0")}`;
      // Add the amount to the total expenses if the month matches the target month
      if (yearMonth === targetMonth) {
        const amount = parseFloat(transaction.Amount) || 0;
        totalExpenses += amount;
      }
    }
  });
  return totalExpenses.toFixed(2); // returns a ***string with 2 decimal places
}

// get the current date in MM-DD format
function getTodayFormatted() {
  let today = new Date();
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let day = String(today.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

// format a given date to MM-DD format
function formatDate(date) {
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

// check if today is the user's birthday
function isTodayBirthday(birthdate) {
  const todayFormatted = getTodayFormatted();
  const userBirthdateFormatted = formatDate(new Date(birthdate));
  return todayFormatted === userBirthdateFormatted;
}

// generate the birthday coupon
function generateBirthdayCoupon() {
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  const birthdayCoupon = document.querySelector(".birthday-coupon");
  if (isTodayBirthday(user.birthdate) && !user.birthdayCouponTaken) {
    if (birthdayCoupon) {
      birthdayCoupon.addEventListener("click", () => {
        birthdayButtonOnClick(user);
      });
    }
  } else {
    if (birthdayCoupon) {
      birthdayCoupon.classList.add("element-hidden");
    }
  }
}

function birthdayButtonOnClick() {
  const birthdayCoupon = document.querySelector(".birthday-coupon");
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  if (birthdayCoupon) {
    birthdayCoupon.classList.add("element-hidden");
    // maybe add it to the selected card specifically but whatever
    user.cards[0].transactions.push({
      Amount: "-50.00",
      "Business Name": "Birthday Coupon",
      Category: "General",
      Date: new Date().toLocaleDateString("en-GB") // format DD/MM/YYYY
    });
    window.users.updateCard(user.email, user.cards[0]);
    user.birthdayCouponTaken = true;
    window.users.updateUser(user);
  }
}

function resetBirthdayCoupon() {
  const user = window.users.getUser(window.auth.getCurrentUserEmail());
  user.birthdayCouponTaken = false;
  window.users.updateUser(user);
}

function checkMidnight() {
  const now = new Date();
  const timeUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) - now;
  setTimeout(() => {
    resetBirthdayCoupon();
  }, timeUntilMidnight);
}
