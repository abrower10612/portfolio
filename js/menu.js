function myFunction(x) {
  x.classList.toggle("change");
  document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("container").style.opacity = "100%";
}