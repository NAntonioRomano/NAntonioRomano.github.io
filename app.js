// SELECCIÓN DE ELEMENTOS DEL DOM
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navBar = document.querySelector('.nav-bar');

// --- LÓGICA PARA EL MENÚ DE NAVEGACIÓN ---
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
    } else {
        navBar.classList.remove('scrolled');
    }
});


// --- LÓGICA PARA LOS CAROUSELES ---
/**
 * Inicializa un carrusel en la página.
 * @param {string} carouselId El ID del elemento carrusel a inicializar.
 */
function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIndex = 0;

    // Llama a esta función al cargar la página para establecer la posición inicial
    window.addEventListener('load', () => {
        updateCarousel();
    });

    /**
     * Actualiza la posición del carrusel para mostrar la imagen actual.
     */
    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    // Configura el botón "Anterior"
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
        updateCarousel();
    });

    // Configura el botón "Siguiente"
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
        updateCarousel();
    });

    // Vuelve a calcular el desplazamiento si el tamaño de la ventana cambia
    window.addEventListener('resize', updateCarousel);
}

// Inicializa todos los carruseles que existen en la página
document.addEventListener('DOMContentLoaded', () => {
    initCarousel('carousel-fauna');
    initCarousel('carousel-flora');
    initCarousel('carousel-mapa');
});







