function openNav(x) {
  // x.classList.toggle("change");
  mySidenav.classList.toggle("change");
  document.getElementById("mySidenav").style.width = "175px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  mySidenav.classList.toggle("change");
}