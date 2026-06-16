// header.js - Versión corregida
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
        
        const navClone = nav.cloneNode(true);
        navClone.querySelectorAll('a').forEach(a => {
            a.classList.add('menu-link');
        });
        navContainer.appendChild(navClone);

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
            closeMenu();
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

    // Event listeners
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();