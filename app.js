function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const slides = track.children;
    const totalSlides = slides.length;
    let index = 0;

    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth + 20; // 20px margen
        let visibleCount = window.innerWidth < 768 ? 1 : Math.min(3, totalSlides);
        track.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        const visibleCount = window.innerWidth < 768 ? 1 : Math.min(3, totalSlides);
        index = (index - 1 + totalSlides) % totalSlides;
        if(index > totalSlides - visibleCount) index = totalSlides - visibleCount;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        const visibleCount = window.innerWidth < 768 ? 1 : Math.min(3, totalSlides);
        index = (index + 1) % totalSlides;
        if(index > totalSlides - visibleCount) index = totalSlides - visibleCount;
        updateCarousel();
    });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
}

// Inicializamos los carruseles
initCarousel('carousel-fauna');
initCarousel('carousel-flora');
initCarousel('carousel-mapa');


