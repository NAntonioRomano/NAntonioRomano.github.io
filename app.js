const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navBar = document.querySelector('.nav-bar');

// Toggle menú hamburguesa
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cierra menú al hacer click en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Cambia color de navbar al hacer scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
    } else {
        navBar.classList.remove('scrolled');
    }
});

function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const slides = track.children;
    const totalSlides = slides.length;
    let index = 0;

    function updateCarousel() {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    prevBtn.addEventListener('click', () => {
        index = (index - 1 + totalSlides) % totalSlides;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        index = (index + 1) % totalSlides;
        updateCarousel();
    });
}

// Inicializamos los tres carruseles
initCarousel('carousel-fauna');
initCarousel('carousel-flora');
initCarousel('carousel-mapa');

