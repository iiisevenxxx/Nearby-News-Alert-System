// nav.js
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const backdrop = document.getElementById('backdrop');

  if (!menuToggle || !sideMenu || !backdrop) return;

  const openMenu = () => {
    sideMenu.classList.add('open');
    backdrop.classList.add('show');
  };

  const closeMenu = () => {
    sideMenu.classList.remove('open');
    backdrop.classList.remove('show');
  };

  menuToggle.addEventListener('click', () => {
    if (sideMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);
});
