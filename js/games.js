const PAGE_SIZE = 5;
let randomizedGamesCatalog = null;

function getGamesCatalog() {
    if (randomizedGamesCatalog) {
        return randomizedGamesCatalog;
    }

    const catalog = typeof window.getCatalogoJuegos === "function"
        ? window.getCatalogoJuegos()
        : [];

    randomizedGamesCatalog = shuffleGames(catalog);
    return randomizedGamesCatalog;
}

function shuffleGames(games) {
    const shuffled = [...games];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
}

function getBadgeClasses(skillSlug) {
    const accent = window.getSkillDefinition?.(skillSlug)?.accent || "blue";
    const badgeMap = {
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
        green: "bg-green-500/10 text-green-600 dark:text-green-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        red: "bg-red-500/10 text-red-600 dark:text-red-400",
        rose: "bg-rose-200/10 text-rose-500 dark:text-rose-400",
        orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    };

    return badgeMap[accent] || badgeMap.blue;
}

function getSkillLabel(skillSlug) {
    return window.getSkillDefinition?.(skillSlug)?.label || "Entrenamiento cognitivo";
}

function createLargeCard(juego) {
    return `
        <article class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col lg:col-span-2 ${juego.fullWidth ? "lg:col-span-3" : ""}">
            <div class="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 gap-4">
                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 mb-2">${juego.heroEyebrow || "Destacado"}</p>
                   <div class="flex flex-row gap-2 grow">
                    ${juego.logo ? `<img src="${juego.logo}" alt="${juego.nombre}" class="w-10 h-10 object-cover">` : ""}
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${juego.nombre}</h3>
                   </div>
                    <p class="text-slate-500 dark:text-slate-300 text-base mt-2">${juego.descripcion}</p>
                </div>

                 <div class="flex flex-wrap gap-2">
                    ${juego.skills.slice(0, 3).map((skill) => `<span class="px-3 py-1 text-xs font-bold uppercase rounded-full ${getBadgeClasses(skill)}">${getSkillLabel(skill)}</span>`).join("")}
                </div>
            </div>

            <a href="${juego.url}" class="relative block bg-slate-950 h-[22rem] md:h-[28rem]">
                <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full h-full object-cover opacity-20">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-450 via-slate-450/35 to-transparent"></div>
                <div class="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <p class="text-white text-xl md:text-2xl font-bold">Juega ya a ${juego.nombre}</p>
                    <div class="group-hover:bg-blue-500 w-36 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center text-white text-sm font-black">JUGAR</div>
                </div>
            </a>
        </article>
    `;
}

function createCompactCard(juego) {
    const skillSlug = juego.skills[0];

    return `
        <article class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group">
            <a href="${juego.url}" class="h-28 sm:h-48 overflow-hidden bg-slate-200 dark:bg-slate-700 block">
                <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
            </a>

            <div class="p-3 sm:p-6 flex flex-col gap-2 sm:gap-3 grow">
                <span class="px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold uppercase rounded-full w-fit ${getBadgeClasses(skillSlug)}">
                    ${getSkillLabel(skillSlug)}
                </span>
                <div class="flex flex-row gap-2 grow">
                    ${juego.logo ? `<img src="${juego.logo}" alt="${juego.nombre}" class="w-8 h-8 sm:w-10 sm:h-10 object-cover">` : ""}
                    <h3 class="text-base sm:text-2xl font-bold text-slate-900 dark:text-white">${juego.nombre}</h3>
                </div>
                <p class="hidden sm:block text-slate-600 dark:text-slate-300 text-base">${juego.descripcion}</p>
                <a href="${juego.url}" class="mt-auto w-full py-2 sm:py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-base font-bold text-center hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">
                    Entrenar
                </a>
            </div>
        </article>
    `;
}

function createEmptyState() {
    return `
        <div class="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-10 text-center">
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">No hemos encontrado juegos</h3>
            <p class="text-slate-600 dark:text-slate-300">Prueba con otro nombre o cambia el filtro de habilidad.</p>
        </div>
    `;
}

// ======================================================
// HERRAMIENTA QA LOCAL DE FULLSCREEN
// ======================================================
function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isLocalFullscreenQaHost() {
    return ["localhost", "127.0.0.1", "::1", "[::1]", ""].includes(window.location.hostname);
}

function getFullscreenQaGames() {
    const catalog = typeof window.getCatalogoJuegos === "function"
        ? window.getCatalogoJuegos()
        : getGamesCatalog();

    return catalog
        .filter((juego) => juego.fullscreenOrientation === "landscape" && juego.url)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function buildFullscreenQaUrl(gameUrl) {
    const url = new URL(gameUrl, window.location.href);
    url.searchParams.set("fullscreenQa", "1");
    url.searchParams.set("forceFallback", "1");
    url.searchParams.set("qaPortrait", "1");
    return `${url.pathname}${url.search}${url.hash}`;
}

function renderFullscreenQaPanel() {
    if (!isLocalFullscreenQaHost()) return;

    const gamesGrid = document.getElementById("games-grid");
    if (!gamesGrid) return;

    const qaGames = getFullscreenQaGames();
    if (!qaGames.length) return;

    let panel = document.getElementById("fullscreen-qa-panel");
    if (!panel) {
        panel = document.createElement("section");
        panel.id = "fullscreen-qa-panel";
        gamesGrid.parentElement.insertBefore(panel, gamesGrid);
    }

    panel.innerHTML = `
        <div class="mb-8 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 p-4 sm:p-5">
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <p class="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">QA local</p>
                    <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Comprobacion de pantalla completa movil</h3>
                    <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Solo aparece en local. Fuerza fallback, movil vertical y juego horizontal.</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <select id="fullscreen-qa-game" class="w-full sm:w-72 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white">
                        ${qaGames.map((juego) => `<option value="${escapeHtml(juego.id)}">${escapeHtml(juego.nombre)}</option>`).join("")}
                    </select>
                    <button id="fullscreen-qa-open" type="button" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700 transition">
                        Probar fullscreen
                    </button>
                </div>
            </div>
        </div>
    `;

    const select = document.getElementById("fullscreen-qa-game");
    const openButton = document.getElementById("fullscreen-qa-open");

    openButton?.addEventListener("click", () => {
        const selectedGame = qaGames.find((juego) => juego.id === select?.value) || qaGames[0];
        if (selectedGame) {
            window.location.href = buildFullscreenQaUrl(selectedGame.url);
        }
    });
}

// ======================================================
// FUNCIÓN PARA DETECTAR EL TIPO DE PANTALLA
// ======================================================
function getLayoutByScreenSize() {
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width >= 768 && width < 1024) return 'tablet';
    return 'desktop';
}

// ======================================================
// CALCULAR NÚMERO ÓPTIMO DE DESTACADOS SEGÚN TOTAL
// ======================================================
function calcularNumeroDestacados(totalJuegos, screenType) {
    // En móvil: máximo 4, pero si hay menos de 4 se muestran todos
    if (screenType === 'mobile') {
        return Math.min(4, totalJuegos);
    }
    
    // En tablet: máximo 6, pero si hay menos de 6 se muestran todos
    if (screenType === 'tablet') {
        return Math.min(6, totalJuegos);
    }
    
    // En desktop: máximo 5, pero si hay menos de 5 se muestran todos
    // Además, si el total es exactamente 5, mostramos 5 (no 4)
    if (screenType === 'desktop') {
        // Si hay exactamente 5 juegos, mostramos 5 (todos)
        if (totalJuegos === 5) return 5;
        // Si hay más de 5, mostramos 5
        if (totalJuegos > 5) return 5;
        // Si hay menos de 5, mostramos todos
        return totalJuegos;
    }
    
    return Math.min(5, totalJuegos);
}

// ======================================================
// VERIFICAR SI EL LAYOUT ES VÁLIDO (sin huecos)
// ======================================================
function isValidLayout(numDestacados, screenType) {
    // En móvil: 2 o 4 juegos (pares para grid de 2 columnas)
    if (screenType === 'mobile') {
        return numDestacados === 2 || numDestacados === 4;
    }
    
    // En tablet: 2, 3, 4 o 6 juegos
    if (screenType === 'tablet') {
        return numDestacados === 2 || numDestacados === 3 || numDestacados === 4 || numDestacados === 6;
    }
    
    // En desktop: cualquier número es válido (el layout se adapta)
    return true;
}

// ======================================================
// RENDERIZAR JUEGOS DESTACADOS (responsive)
// ======================================================
function renderFeaturedGames(destacados, screenType) {
    if (!destacados.length) return "";
    const total = destacados.length;
    
    // MÓVIL: grid de 2 columnas
    if (screenType === 'mobile') {
        return `
            <div class="grid grid-cols-2 gap-4 my-6">
                ${destacados.map(createCompactCard).join("")}
            </div>
        `;
    }
    
    // TABLET: grid adaptable
    if (screenType === 'tablet') {
        if (total === 1) {
            return `<div class="grid grid-cols-1 gap-6 my-6">${createLargeCard(destacados[0])}</div>`;
        }
        if (total === 2) {
            return `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">${destacados.map(createCompactCard).join("")}</div>`;
        }
        if (total === 3) {
            return `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">${destacados.map(createCompactCard).join("")}</div>`;
        }
        if (total === 4) {
            const [primero, segundo, tercero, cuarto] = destacados;
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    ${createLargeCard(primero)}
                    ${createCompactCard(segundo)}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${createCompactCard(tercero)}
                    ${createCompactCard(cuarto)}
                </div>
            `;
        }
        // total >= 5
        const [principal, lateral, ...resto] = destacados;
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
                ${createLargeCard(principal)}
                <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${resto.slice(0, 2).map(createCompactCard).join("")}
                </div>
            </div>
            ${resto.length > 2 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    ${resto.slice(2).map(createCompactCard).join("")}
                </div>
            ` : ''}
        `;
    }
    
    // DESKTOP: layouts complejos
    if (total === 1) {
        return `<div class="grid grid-cols-1 gap-8 my-6">${createLargeCard({ ...destacados[0], fullWidth: true })}</div>`;
    }
    
    if (total === 2) {
        return `<div class="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">${destacados.map(createCompactCard).join("")}</div>`;
    }
    
    if (total === 3) {
        return `<div class="grid grid-cols-1 md:grid-cols-3 gap-8 my-6">${destacados.map(createCompactCard).join("")}</div>`;
    }
    
    if (total === 4) {
        const [primero, segundo, tercero, cuarto] = destacados;
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 my-6">
                ${createLargeCard(primero)}
                ${createLargeCard(segundo)}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${createCompactCard(tercero)}
                ${createCompactCard(cuarto)}
            </div>
        `;
    }
    
    // total >= 5 en desktop
    let [principal, lateral, ...inferiores] = destacados;
    
    // Layout alternativo según el ancho
    const layoutIndex = Math.floor(window.innerWidth / 100) % 3;
    
    if (layoutIndex === 0) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 my-6">
                ${createLargeCard(principal)}
                ${createCompactCard(lateral)}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                ${inferiores.map(createCompactCard).join("")}
            </div>
        `;
    }
    
    if (layoutIndex === 1) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 my-6">
                ${createCompactCard(lateral)}
                ${createLargeCard(principal)}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                ${inferiores.map(createCompactCard).join("")}
            </div>
        `;
    }
    
    // layoutIndex === 2
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 my-6">
            ${inferiores.map(createCompactCard).join("")}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            ${createLargeCard(principal)}
            ${createCompactCard(lateral)}
        </div>
    `;
}

// ======================================================
// FUNCIÓN PRINCIPAL DE RENDERIZADO
// ======================================================
function renderGamesPage(options = {}) {
    const {
        search = "",
        skill = "",
        generalSkill = "",
        expanded = false
    } = options;

    const contenedor = document.getElementById("games-grid");
    if (!contenedor) return;

    const normalizedSearch = search.trim().toLowerCase();
    const juegosFiltrados = getGamesCatalog().filter((juego) => {
        const matchesSearch = !normalizedSearch
            || juego.nombre.toLowerCase().includes(normalizedSearch)
            || juego.descripcion.toLowerCase().includes(normalizedSearch);
        const matchesSkill = !skill || juego.skills.includes(skill);
        const matchesCategory = !generalSkill || juego.categoria === generalSkill;

        return matchesSearch && matchesSkill && matchesCategory;
    });

    if (!juegosFiltrados.length) {
        contenedor.innerHTML = createEmptyState();
        return;
    }

    const screenType = getLayoutByScreenSize();
    const totalJuegos = juegosFiltrados.length;
    
    // Calcular número óptimo de destacados
    let numDestacados = calcularNumeroDestacados(totalJuegos, screenType);
    
    // Ajustar para evitar layouts con huecos en móvil/tablet
    if (!isValidLayout(numDestacados, screenType) && totalJuegos > numDestacados) {
        // Intentar con un número menor
        if (screenType === 'mobile') {
            numDestacados = 2;
        } else if (screenType === 'tablet') {
            if (totalJuegos >= 6) numDestacados = 6;
            else if (totalJuegos >= 4) numDestacados = 4;
            else if (totalJuegos >= 3) numDestacados = 3;
            else numDestacados = totalJuegos;
        }
    }
    
    const destacados = juegosFiltrados.slice(0, numDestacados);
    const resto = juegosFiltrados.slice(numDestacados);

    const restoGrid = resto.length
        ? `
            <div class="${expanded ? "block" : "hidden"}" id="games-resto-grid">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
                    ${resto.map(createCompactCard).join("")}
                </div>
            </div>
        `
        : "";

    const toggleButton = resto.length
        ? `
            <div class="pt-8 text-center">
                <button id="games-toggle-btn" type="button" class="w-1/1.5 p-3 bg-blue-500 text-white rounded-xl font-bold text-sm md:text-base hover:scale-105 transition">
                    ${expanded ? "Mostrar menos juegos" : "Mostrar todos los juegos"}
                </button>
            </div>
        `
        : "";

    contenedor.innerHTML = `
        ${renderFeaturedGames(destacados, screenType)}
        ${restoGrid}
        ${toggleButton}
    `;
}

// ======================================================
// FUNCIONES GLOBALES
// ======================================================
window.setFiltro = function setFiltro(skill) {
    const buttons = document.querySelectorAll("[data-game-category]");

    buttons.forEach((button) => {
        const isActive = button.dataset.gameCategory === skill;
        button.classList.toggle("bg-blue-500", isActive);
        button.classList.toggle("text-white", isActive);
        button.classList.toggle("bg-slate-100", !isActive);
        button.classList.toggle("dark:bg-slate-800", !isActive);
        button.classList.toggle("border-slate-200", !isActive);
        button.classList.toggle("dark:border-slate-700", !isActive);
        button.classList.toggle("text-slate-700", !isActive);
        button.classList.toggle("dark:text-slate-200", !isActive);
    });

    const select = document.getElementById("habilidad-general");
    if (!select) return;

    select.value = skill;
    select.dispatchEvent(new Event("change"));
};

window.initGamesPage = function initGamesPage() {
    const barraBusqueda = document.getElementById("barra-busqueda");
    const habilidadSeleccionada = document.getElementById("habilidad");
    const categoriaSeleccionada = document.getElementById("habilidad-general");

    let expanded = false;
    let resizeTimeout = null;

    renderFullscreenQaPanel();
    
    const sync = () => {
        renderGamesPage({
            search: barraBusqueda?.value || "",
            skill: habilidadSeleccionada?.value || "",
            generalSkill: categoriaSeleccionada?.value || "",
            expanded
        });

        const toggleBtn = document.getElementById("games-toggle-btn");
        if (toggleBtn) {
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
            
            newToggleBtn.addEventListener("click", (e) => {
                e.preventDefault();
                const wasExpanded = expanded;
                expanded = !expanded;
                sync();
                
                setTimeout(() => {
                    if (!wasExpanded && expanded) {
                        const restoGrid = document.getElementById("games-resto-grid");
                        if (restoGrid) restoGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (wasExpanded && !expanded) {
                        const gamesGrid = document.getElementById("games-grid");
                        if (gamesGrid) gamesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 150);
            });
        }
    };

    barraBusqueda?.addEventListener("input", () => {
        expanded = false;
        sync();
    });

    habilidadSeleccionada?.addEventListener("change", () => {
        expanded = false;
        sync();
    });

    categoriaSeleccionada?.addEventListener("change", () => {
        expanded = false;
        sync();
    });

    window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            sync();
        }, 200);
    });

    sync();
};
