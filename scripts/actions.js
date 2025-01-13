function checkIfPageScrollable() {
  const isScrollable = document.documentElement.scrollHeight > document.documentElement.clientHeight;
  if (isScrollable) {
    console.log("The page is now scrollable.");
  } else {
    console.log("The page is not scrollable.");
  }
}

// Run the function initially to check the current state
checkIfPageScrollable();

// Add a resize event listener to detect dynamic changes
window.addEventListener("resize", checkIfPageScrollable);
