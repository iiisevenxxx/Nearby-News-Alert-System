document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  const backdrop = document.getElementById("backdrop");

  if (!menuBtn || !sideMenu || !backdrop) return;

  function openMenu() {
    sideMenu.classList.add("open");
    backdrop.classList.add("show");
  }

  function closeMenu() {
    sideMenu.classList.remove("open");
    backdrop.classList.remove("show");
  }

  menuBtn.addEventListener("click", () => {
    if (sideMenu.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener("click", closeMenu);
});
