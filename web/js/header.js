// Header auto-ocultable para móvil
(function() {
    let lastScrollTop = 0;
    let header = document.querySelector('header');
    
    if (!header) return;
    
    // Solo aplicar en móvil (ancho menor a 768px)
    let isMobile = window.innerWidth <= 768;
    
    function handleScroll() {
        // Re-evaluar si es móvil (por si cambia orientación)
        if (window.innerWidth > 768) {
            if (header.classList.contains('header-hidden')) {
                header.classList.remove('header-hidden');
            }
            return;
        }
        
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // No ocultar si está en la parte superior
        if (scrollTop <= 20) {
            header.classList.remove('header-hidden');
            lastScrollTop = scrollTop;
            return;
        }
        
        // Determinar dirección del scroll
        if (scrollTop > lastScrollTop + 5) {
            // Scroll hacia abajo - ocultar header
            header.classList.add('header-hidden');
        } else if (scrollTop < lastScrollTop - 5) {
            // Scroll hacia arriba - mostrar header
            header.classList.remove('header-hidden');
        }
        
        lastScrollTop = scrollTop;
    }
    
    // Escuchar evento de scroll (con throttle para mejor rendimiento)
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    // Re-evaluar al cambiar orientación o tamaño de pantalla
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            header.classList.remove('header-hidden');
        }
    });
    
    // Ejecutar al cargar
    handleScroll();
})();