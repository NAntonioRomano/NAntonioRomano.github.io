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
    const slides = track.children;
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let index = 0;

    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth + 20; // 20px margen lateral
        track.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        index = Math.max(index - 1, 0);
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        index = Math.min(index + 1, slides.length - 1);
        updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
}

// Inicializamos los carruseles
initCarousel('carousel-fauna');
initCarousel('carousel-flora');
initCarousel('carousel-mapa');



