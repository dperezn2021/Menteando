// ========== HEADER MEJORADO PARA MÓVIL ==========
(function() {
    const header = document.querySelector('header');
    if (!header) return;
    
    let lastScroll = 0;
    let ticking = false;
    let menuOpen = false;
    
    // Crear botón hamburguesa para móvil
    function crearMenuHamburguesa() {
        if (document.querySelector('.menu-hamburguesa')) return;
        
        const nav = header.querySelector('nav');
        if (!nav) return;
        
        // Crear botón hamburguesa
        const hamburger = document.createElement('button');
        hamburger.className = 'menu-hamburguesa';
        hamburger.innerHTML = '☰';
        hamburger.style.cssText = `
            display: none;
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: currentColor;
            padding: 0 8px;
        `;
        
        // Crear overlay
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        `;
        
        // Mover navegación dentro del overlay
        const navClone = nav.cloneNode(true);
        const navContainer = document.createElement('div');
        navContainer.className = 'menu-container';
        navContainer.style.cssText = `
            position: fixed;
            top: 0;
            right: -280px;
            width: 280px;
            height: 100%;
            background: var(--card-bg);
            z-index: 1000;
            transition: right 0.3s ease;
            padding: 80px 20px 20px;
            box-shadow: -2px 0 10px rgba(0,0,0,0.2);
        `;
        navContainer.appendChild(navClone);
        
        // Cerrar botón dentro del menú
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: currentColor;
        `;
        navContainer.appendChild(closeBtn);
        
        document.body.appendChild(overlay);
        document.body.appendChild(navContainer);
        
        // Función para abrir/cerrar menú
        function openMenu() {
            navContainer.style.right = '0';
            overlay.style.display = 'block';
            menuOpen = true;
        }
        
        function closeMenu() {
            navContainer.style.right = '-280px';
            overlay.style.display = 'none';
            menuOpen = false;
        }
        
        hamburger.onclick = openMenu;
        closeBtn.onclick = closeMenu;
        overlay.onclick = closeMenu;
        
        // Ocultar navegación original en móvil
        function updateMenu() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                hamburger.style.display = 'block';
                nav.style.display = 'none';
            } else {
                hamburger.style.display = 'none';
                nav.style.display = 'flex';
                closeMenu();
            }
        }
        
        // Insertar hamburguesa en el header
        const rightSection = header.querySelector('.flex.items-center.gap-3:last-child');
        if (rightSection) {
            rightSection.insertBefore(hamburger, rightSection.firstChild);
        } else {
            header.appendChild(hamburger);
        }
        
        updateMenu();
        window.addEventListener('resize', updateMenu);
    }
    
    // Auto-ocultación del header
    function handleScroll() {
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            if (header.classList.contains('header-hidden')) {
                header.classList.remove('header-hidden');
            }
            return;
        }
        
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 20) {
            header.classList.remove('header-hidden');
        } else if (currentScroll > lastScroll + 5 && !menuOpen) {
            header.classList.add('header-hidden');
        } else if (currentScroll < lastScroll - 5) {
            header.classList.remove('header-hidden');
        }
        
        lastScroll = currentScroll;
    }
    
    // Padding para compensar header fijo
    function adjustBodyPadding() {
        if (window.innerWidth <= 768) {
            document.body.style.paddingTop = '60px';
        } else {
            document.body.style.paddingTop = '';
        }
    }
    
    // Eventos
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    window.addEventListener('resize', adjustBodyPadding);
    adjustBodyPadding();
    
    // Iniciar menú hamburguesa
    crearMenuHamburguesa();
    
    console.log("✅ Header móvil mejorado activado");
})();