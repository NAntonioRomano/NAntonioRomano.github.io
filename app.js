// ============================
// MENU HAMBURGUESA
// ============================
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navBar = document.querySelector('.nav-bar');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Cambia navbar al hacer scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
    } else {
        navBar.classList.remove('scrolled');
    }
});


// ============================
// CARRUSELES RESPONSIVE
// ============================
function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    const track = carousel.querySelector('.carousel-track');
    const slides = track.children;
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let index = 0;

    // Aseguramos que las imágenes estén cargadas
    const waitForImages = Array.from(slides).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
    });

    Promise.all(waitForImages).then(() => {
        updateCarousel();
    });

    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth + 20; // margen de 10px a cada lado
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

    // Ajustar al redimensionar ventana (desktop <-> móvil)
    window.addEventListener('resize', updateCarousel);
}

// Inicializamos todos los carruseles al cargar la página
window.addEventListener('load', () => {
    initCarousel('carousel-fauna');
    initCarousel('carousel-flora');
    initCarousel('carousel-mapa');
});






