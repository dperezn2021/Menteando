(function() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;
    let menuOpen = false;

    const isMobileDevice = () =>
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

    const isPortrait = () =>
        window.matchMedia('(orientation: portrait)').matches;

    // Cambiar sticky → fixed SOLO en móvil real
    function updateHeaderPosition() {
        if (isMobileDevice()) {
            header.style.position = "fixed";
            header.style.top = "0";
            document.body.style.paddingTop = header.offsetHeight + "px";
        } else {
            header.style.position = "sticky";
            header.style.top = "0";
            document.body.style.paddingTop = "";
        }
    }

    /* ============================
       MENÚ HAMBURGUESA
    ============================ */
    function crearMenuHamburguesa() {
        if (document.querySelector('.menu-hamburguesa')) return;

        const nav = header.querySelector('nav');
        if (!nav) return;

        // Páginas de juego/test: nav con un solo enlace (volver) → sin hamburguesa
        if (nav.querySelectorAll('a').length <= 1) return;

        const hamburger = document.createElement('button');
        hamburger.className = 'menu-hamburguesa';
        hamburger.innerHTML = '☰';

        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';

        const navClone = nav.cloneNode(true);
        const navContainer = document.createElement('div');
        navContainer.className = 'menu-container';
        navContainer.appendChild(navClone);

        document.body.appendChild(overlay);
        document.body.appendChild(navContainer);

        function openMenu() {
            navContainer.classList.add('open');
            overlay.classList.add('visible');
            menuOpen = true;
        }

        function closeMenu() {
            navContainer.classList.remove('open');
            overlay.classList.remove('visible');
            menuOpen = false;
        }

        hamburger.onclick = openMenu;
        overlay.onclick = closeMenu;

        // Cerrar el menú al pulsar cualquier enlace del panel
        navClone.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', closeMenu);
        });

        const rightSection = header.querySelector('.flex.items-center.gap-3:last-child');
        if (rightSection) rightSection.insertBefore(hamburger, rightSection.firstChild);

        function updateMenu() {
            if (isMobileDevice() && isPortrait()) {
                hamburger.style.display = 'block';
                nav.style.display = 'none';
            } else {
                hamburger.style.display = 'none';
                nav.style.display = 'flex';
                closeMenu();
            }
        }

        updateMenu();
        window.addEventListener('resize', updateMenu);
        window.addEventListener('orientationchange', updateMenu);
    }

    /* ============================
       AUTO-OCULTACIÓN DEL HEADER
    ============================ */
    function handleScroll() {
        if (!isMobileDevice()) {
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

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    window.addEventListener('resize', updateHeaderPosition);
    window.addEventListener('orientationchange', () => {
        updateHeaderPosition();
        crearMenuHamburguesa();
    });

    crearMenuHamburguesa();
    updateHeaderPosition();
})();
