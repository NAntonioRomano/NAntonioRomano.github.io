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
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIndex = 0;

    // Actualiza la posición del carrusel para mostrar solo una imagen
    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    // Navegación con botón "Anterior"
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        updateCarousel();
    });

    // Navegación con botón "Siguiente"
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateCarousel();
    });

    // Actualiza el carrusel si la ventana cambia de tamaño
    window.addEventListener('resize', updateCarousel);
    
    // Inicializa el carrusel
    updateCarousel();
}

// Inicializamos los carruseles
window.addEventListener('load', () => {
    initCarousel('carousel-fauna');
    initCarousel('carousel-flora');
    initCarousel('carousel-mapa');
});




