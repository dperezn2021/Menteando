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
        // 🟣 ATENCIÓN (morados)
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",

        // 🟢 MEMORIA (verdes)
        green: "bg-green-500/10 text-green-600 dark:text-green-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

        // 🔴 VELOCIDAD / REFLEJOS
        red: "bg-red-500/10 text-red-600 dark:text-red-400",
        rose: "bg-rose-200/10 text-rose-500 dark:text-rose-400",

        // 🟠 CONTROL EJECUTIVO
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
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent"></div>
                <div class="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <p class="text-white text-xl md:text-2xl font-bold">Juega ya a ${juego.nombre}</p>
                    <div class="group-hover:bg-blue-500 w-36 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur  flex items-center justify-center text-white text-sm font-black">JUGAR</div>
                </div>
            </a>
        </article>
    `;
}

function createCompactCard(juego) {
    const skillSlug = juego.skills[0];

    return `
        <article class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group">
            <a href="${juego.url}" class="h-48 overflow-hidden bg-slate-200 dark:bg-slate-700 block">
                <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
            </a>

            <div class="p-6 flex flex-col gap-3 grow">
                <span class="px-3 py-1 text-sm font-bold uppercase rounded-full w-fit ${getBadgeClasses(skillSlug)}">
                    ${getSkillLabel(skillSlug)} 
                </span>
                   <div class="flex flex-row gap-2 grow">
                    ${juego.logo ? `<img src="${juego.logo}" alt="${juego.nombre}" class="w-10 h-10 object-cover">` : ""}
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${juego.nombre}</h3>
                   </div>
               
                <p class="text-slate-600 dark:text-slate-300 text-base">${juego.descripcion}</p>

                <a href="${juego.url}" class="mt-auto w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-center hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">
                    Entrenar
                </a>
            </div>
        </article>
    `;
}

function renderFeaturedGames(destacados) {

    // 1. Obtener o crear sessionId
    let sessionId = sessionStorage.getItem("gamesSessionId");
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("gamesSessionId", sessionId);
    }

    // 2. Obtener sessionId guardado en localStorage
    let lastSessionId = localStorage.getItem("gamesLastSessionId");
    let layoutMode = localStorage.getItem("gamesLayoutMode");

    // 3. Si la sesión cambió → refresco → generar layout nuevo
    if (sessionId !== lastSessionId) {
        layoutMode = Math.floor(Math.random() * 4);
        localStorage.setItem("gamesLayoutMode", layoutMode);
        localStorage.setItem("gamesLastSessionId", sessionId);
    } else {
        layoutMode = parseInt(layoutMode, 10);
    }

    if (!destacados.length) return "";

    // CASOS ESPECIALES
    if (destacados.length === 1) {
        return `
            <div class="grid grid-cols-1 gap-8 items-stretch">
                ${createLargeCard({ ...destacados[0], fullWidth: true })}
            </div>
        `;
    }

    if (destacados.length === 2) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                ${destacados.map(createCompactCard).join("")}
            </div>
        `;
    }

    if (destacados.length === 3) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                ${destacados.map(createCompactCard).join("")}
            </div>
        `;
    }

    // MÁS DE 3 DESTACADOS
    let [principal, lateral, ...inferiores] = destacados;

    // USAR layoutMode — NO generar uno nuevo
    if (layoutMode === 0) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch my-8">
                ${createLargeCard(principal)}
                ${createCompactCard(lateral)}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                ${inferiores.map(createCompactCard).join("")}
            </div>
        `;
    }

    if (layoutMode === 1) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch my-8">
                ${createCompactCard(lateral)}
                ${createLargeCard(principal)}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                ${inferiores.map(createCompactCard).join("")}
            </div>
        `;
    }

    if (layoutMode === 2) {
        return `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 my-8">
            ${inferiores.map(createCompactCard).join("")}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            ${createCompactCard(lateral)}
            ${createLargeCard(principal)}
        </div>
    `;
    }

    // MODO 3 — Todas pequeñas → grandes al final
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 my-8">
            ${inferiores.map(createCompactCard).join("")}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            ${createLargeCard(principal)}
            ${createCompactCard(lateral)}
        </div>
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

    const destacados = juegosFiltrados.slice(0, PAGE_SIZE);
    const resto = juegosFiltrados.slice(PAGE_SIZE);

    const restoGrid = resto.length
        ? `
            <div class="${expanded ? "block" : "hidden"}" id="games-resto-grid">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-8">
                    ${resto.map(createCompactCard).join("")}
                </div>
            </div>
        `
        : "";

    const toggleButton = resto.length
        ? `
            <div class="pt-8">
                <button id="games-toggle-btn" type="button" class="w-full py-3 text-blue-500 font-bold hover:text-blue-600 transition-colors">
                    ${expanded ? "Mostrar menos juegos" : "Ver todo el catalogo de juegos"}
                </button>
            </div>
        `
        : "";

    contenedor.innerHTML = `
        ${renderFeaturedGames(destacados)}
        ${restoGrid}
        ${toggleButton}
    `;
}

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

    const sync = () => {
        renderGamesPage({
            search: barraBusqueda?.value || "",
            skill: habilidadSeleccionada?.value || "",
            generalSkill: categoriaSeleccionada?.value || "",
            expanded
        });

        const toggleBtn = document.getElementById("games-toggle-btn");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", () => {
                expanded = !expanded;
                sync();
            }, { once: true });
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

    sync();
};
