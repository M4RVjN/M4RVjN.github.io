const hamburger = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    // 切換 is-active class 來顯示或隱藏選單
    navLinks.classList.toggle('is-active');
});