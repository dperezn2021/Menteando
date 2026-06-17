// header.js - Versión SIMPLE
(function() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;
    let menuOpen = false;
    let resizeTimeout = null;

    /* ============================
       MENÚ HAMBURGUESA
    ============================ */
    let overlay = null;
    let navContainer = null;
    let hamburger = null;

    function closeMenu() {
        if (navContainer) navContainer.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
        menuOpen = false;
    }

    function openMenu() {
        if (navContainer) navContainer.classList.add('open');
        if (overlay) overlay.classList.add('visible');
        menuOpen = true;
    }

    // ============================================================
    // FUNCIÓN PARA OCULTAR PERMANENTEMENTE (con localStorage)
    // ============================================================
    function ocultarBotonOpinionPermanente() {
        try {
            localStorage.setItem('feedbackDismissed', '1');
        } catch (e) {}

        // Ocultar el botón fixed del main
        const mainBtn = document.getElementById('feedback-btn');
        if (mainBtn) {
            mainBtn.style.transition = 'all .3s ease';
            mainBtn.style.opacity = '0';
            mainBtn.style.transform = 'scale(.9)';
            setTimeout(() => {
                mainBtn.style.display = 'none';
            }, 300);
        }

        // Ocultar el botón del menú
        const menuBtn = document.querySelector('.menu-opinion-btn');
        if (menuBtn) {
            menuBtn.style.transition = 'all .3s ease';
            menuBtn.style.opacity = '0';
            menuBtn.style.transform = 'scale(.9)';
            setTimeout(() => {
                menuBtn.style.display = 'none';
            }, 300);
        }
    }

    function crearMenuHamburguesa() {
        // Eliminar elementos existentes
        const existingHamburger = document.querySelector('.menu-hamburguesa');
        const existingOverlay = document.querySelector('.menu-overlay');
        const existingContainer = document.querySelector('.menu-container');
        if (existingHamburger) existingHamburger.remove();
        if (existingOverlay) existingOverlay.remove();
        if (existingContainer) existingContainer.remove();

        const nav = header.querySelector('nav');
        if (!nav) return;

        const navLinks = nav.querySelectorAll('a');
        if (navLinks.length <= 1) return;

        // Crear hamburguesa
        hamburger = document.createElement('button');
        hamburger.className = 'menu-hamburguesa';
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-label', 'Abrir menú');

        // Crear overlay
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';

        // Crear contenedor del menú
        navContainer = document.createElement('div');
        navContainer.className = 'menu-container';
        
        // Clonar navegación
        const navClone = nav.cloneNode(true);
        navClone.querySelectorAll('a').forEach(a => {
            a.classList.add('menu-link');
        });
        navContainer.appendChild(navClone);

        // ============================================================
        // BOTÓN DE OPINIÓN EN EL MENÚ (SOLO MÓVIL)
        // ============================================================
        const mainBtn = document.getElementById('feedback-btn');
        const opinionBtn = document.createElement('a');
        opinionBtn.className = 'menu-opinion-btn';
        opinionBtn.id = 'menu-feedback-btn';
        
        if (mainBtn) {
            opinionBtn.innerHTML = mainBtn.innerHTML;
            opinionBtn.href = mainBtn.href || 'https://forms.gle/whPgPDtptPN632Sh6';
            opinionBtn.target = mainBtn.target || '_blank';
            opinionBtn.rel = mainBtn.rel || 'noopener noreferrer';
        } else {
            opinionBtn.innerHTML = '💭 Dejar opinión';
            opinionBtn.href = 'https://forms.gle/whPgPDtptPN632Sh6';
            opinionBtn.target = '_blank';
            opinionBtn.rel = 'noopener noreferrer';
        }
        
        // Si ya se ocultó permanentemente, ocultar también
        if (localStorage.getItem('feedbackDismissed') === '1') {
            opinionBtn.style.display = 'none';
        }
        
        // Evento para ocultar permanentemente
        opinionBtn.addEventListener('click', function(e) {
            ocultarBotonOpinionPermanente();
        });
        
        navContainer.appendChild(opinionBtn);

        document.body.appendChild(overlay);
        document.body.appendChild(navContainer);

        // Eventos
        hamburger.onclick = openMenu;
        overlay.onclick = closeMenu;
        navClone.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', closeMenu);
        });

        // Insertar hamburguesa
        const rightSection = header.querySelector('.flex.items-center.gap-3:last-child');
        if (rightSection) {
            rightSection.insertBefore(hamburger, rightSection.firstChild);
        }

        updateMenuVisibility();
        
        // Si ya está oculto permanentemente, ocultar el main
        if (localStorage.getItem('feedbackDismissed') === '1') {
            const btn = document.getElementById('feedback-btn');
            if (btn) btn.style.display = 'none';
        }
    }

    function updateMenuVisibility() {
        const nav = header.querySelector('nav');
        if (!hamburger || !nav) return;

        if (window.innerWidth < 1024) {
            hamburger.style.display = 'block';
            nav.style.display = 'none';
        } else {
            hamburger.style.display = 'none';
            nav.style.display = 'flex';
            if (menuOpen) {
                closeMenu();
            }
        }
    }

    /* ============================
       AUTO-OCULTACIÓN DEL HEADER
    ============================ */
    function handleScroll() {
        if (window.innerWidth >= 1024) {
            header.classList.remove('header-hidden');
            return;
        }

        const currentScroll = window.pageYOffset;
        
        if (menuOpen) {
            header.classList.remove('header-hidden');
            lastScroll = currentScroll;
            return;
        }

        if (currentScroll <= 40) {
            header.classList.remove('header-hidden');
        } else if (currentScroll > lastScroll + 15) {
            header.classList.add('header-hidden');
        } else if (currentScroll < lastScroll - 15) {
            header.classList.remove('header-hidden');
        }

        lastScroll = currentScroll;
    }

    function handleResize() {
        updateMenuVisibility();
        
        if (menuOpen && window.innerWidth >= 1024) {
            closeMenu();
        }
        
        if (window.innerWidth >= 1024) {
            header.classList.remove('header-hidden');
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });

    function init() {
        crearMenuHamburguesa();
        updateMenuVisibility();
        
        // Evento para el botón del main
        const btn = document.getElementById('feedback-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                ocultarBotonOpinionPermanente();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();