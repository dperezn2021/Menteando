const TEST_CATEGORY_STYLES = {
    atencion: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    memoria: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    control: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    reflejos: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
};

function getTestsCatalog() {
    return typeof window.getCatalogoTests === "function" ? window.getCatalogoTests() : [];
}

function getTestBadgeClasses(categoria) {
    return TEST_CATEGORY_STYLES[categoria] || TEST_CATEGORY_STYLES.atencion;
}

function getDurationColor(duracion) {
    const minutos = parseInt(duracion);
    if (minutos <= 5) return "text-green-600 dark:text-green-400";
    if (minutos <= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
}

function createTestCard(test) {
    const duracionColor = getDurationColor(test.duracion);
    
    const categoriaColor = {
        atencion: "violet",
        memoria: "emerald",
        control: "amber",
        reflejos: "rose"
    }[test.categoria] || "blue";
    
    return `
        <article class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <a href="${test.url}" class="block h-40 overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src="${test.imagen}" alt="${test.nombre}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">
            </a>
            <div class="p-5 flex flex-col gap-3">
                <!-- Badges: duración izquierda, categoría derecha -->
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold ${duracionColor}">${test.duracion}</span>
                    <span class="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-${categoriaColor}-100 dark:bg-${categoriaColor}-900/30 text-${categoriaColor}-700 dark:text-${categoriaColor}-300">
                        ${test.categoria}
                    </span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white line-clamp-2">${test.nombre}</h3>
                <p class="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">${test.descripcion.substring(0, 100)}${test.descripcion.length > 100 ? '...' : ''}</p>
                
                <!-- Habilidades con colores de SKILL_DEFINITIONS -->
                <div class="flex flex-wrap gap-1.5 mt-1">
                    ${test.habilidades.slice(0, 3).map(h => {
                        const def = SKILL_DEFINITIONS[h];
                        const color = def?.accent || "slate";
                        const label = def?.label || h.substring(0, 8);
                        return `<span class="px-2 py-0.5 rounded-full text-xs bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${label}</span>`;
                    }).join('')}
                    ${test.habilidades.length > 3 ? `<span class="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-500">+${test.habilidades.length - 3}</span>` : ''}
                </div>
                
                <a href="${test.url}" class="mt-2 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all">
                    Realizar test
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </a>
            </div>
        </article>
    `;
}

function createFeaturedTest(test, habilidadRecomendada = null, porcentaje = null) {
    const duracionColor = getDurationColor(test.duracion);
    
    // Obtener el color de la categoría desde las habilidades del test
    const categoriaColor = {
        atencion: "violet",
        memoria: "emerald",
        control: "amber",
        reflejos: "rose"
    }[test.categoria] || "blue";
    
    let mensajeRecomendacion = '';
    if (habilidadRecomendada && porcentaje !== null) {
        const habilidadNombre = {
            atencion: 'atención',
            memoria: 'memoria',
            control: 'control',
            reflejos: 'reflejos'
        }[habilidadRecomendada] || habilidadRecomendada;
        
        mensajeRecomendacion = `
            <div class="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <p class="text-sm text-amber-700 dark:text-amber-300">
                    Tu habilidad más baja es <strong>${habilidadNombre}</strong> (${porcentaje}%)
                </p>
            </div>
        `;
    }
    
    return `
  
        <div class="w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 lg:p-8 shadow-lg">

            <!-- Imagen -->
            <a href="${test.url}" class="relative w-full lg:flex-1 min-h-[200px] lg:min-h-[240px] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src="${test.imagen}" alt="${test.nombre}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
            </a>
            
            <!-- Contenido -->
            <div class="w-full lg:flex-1 flex flex-col gap-4">
                
                <!-- Badges: recomendado + duración a la izquierda, categoría a la derecha -->
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">Recomendado</span>
                        <span class="text-xs font-semibold ${duracionColor}">${test.duracion}</span>
                    </div>
                    <span class="px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-${categoriaColor}-100 dark:bg-${categoriaColor}-900/30 text-${categoriaColor}-700 dark:text-${categoriaColor}-300">
                        ${test.categoria}
                    </span>
                </div>
                
                <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">${test.nombre}</h2>
                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">${test.resumen}</p>
                
                <!-- Habilidades del test (usando SKILL_DEFINITIONS) -->
                <div class="flex flex-wrap gap-2">
                    ${test.habilidades.slice(0, 3).map(h => {
                        const def = SKILL_DEFINITIONS[h];
                        const color = def?.accent || "slate";
                        const label = def?.label || h.replace(/_/g, ' ');
                        return `<span class="px-2 py-1 rounded-full text-xs bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${label}</span>`;
                    }).join('')}
                    ${test.habilidades.length > 3 ? `<span class="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-500">+${test.habilidades.length - 3}</span>` : ''}
                </div>
                
                <!-- Botones -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="${test.url}" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all">
                        Comenzar
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </a>
                    <a href="#tests-grid" class="flex items-center justify-center px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        Otros
                    </a>

                </div>
                
            </div>
        </div>
        <div class="mt-6">
          ${mensajeRecomendacion}
        </div>
    `;
}

function renderFeaturedTest() {
    const contenedor = document.getElementById("test-recomendado");
    if (!contenedor) return;
    
    const perfil = window.getperfil();
    const tests = getTestsCatalog();
    if (!tests.length) return;
    
    // Obtener habilidades del perfil (valores 0-1)
    const habilidades = {
        atencion: perfil.atencion || 0,
        memoria: perfil.memoria || 0,
        control: perfil.control || 0,
        reflejos: perfil.reflejos || 0
    };
    
    // Encontrar la habilidad más baja
    let habilidadMasBaja = "atencion";
    let valorMasBajo = 1;
    for (const [key, val] of Object.entries(habilidades)) {
        if (val < valorMasBajo) {
            valorMasBajo = val;
            habilidadMasBaja = key;
        }
    }
    
    // Buscar tests de esa categoría
    const testsDeHabilidad = tests.filter(test => test.categoria === habilidadMasBaja);
    
    // Si hay tests de esa categoría, recomendar uno aleatorio
    let testRecomendado;
    if (testsDeHabilidad.length > 0) {
        testRecomendado = testsDeHabilidad[Math.floor(Math.random() * testsDeHabilidad.length)];
    } else {
        // Si no hay tests de esa categoría, recomendar el primer test disponible
        testRecomendado = tests[0];
    }
    
    // Calcular porcentaje para mostrar en mensaje
    const porcentaje = Math.round(valorMasBajo * 100);
    
    // Crear HTML con indicación de por qué se recomienda
    contenedor.innerHTML = createFeaturedTest(testRecomendado, habilidadMasBaja, porcentaje);
}

function renderTestsPage({ search = "", category = "" } = {}) {
    const contenedor = document.getElementById("tests-grid");
    if (!contenedor) return;

    const normalizedSearch = search.trim().toLowerCase();
    const tests = getTestsCatalog().filter((test) => {
        const matchesSearch = !normalizedSearch || test.nombre.toLowerCase().includes(normalizedSearch);
        const matchesCategory = !category || test.categoria === category;
        return matchesSearch && matchesCategory;
    });

    if (!tests.length) {
        contenedor.innerHTML = `
            <div class="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-12 text-center">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No encontramos tests</h3>
                <p class="text-slate-600 dark:text-slate-400">Prueba con otro nombre o cambia la categoría.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = tests.map(createTestCard).join('');
}

window.setTestCategory = function setTestCategory(category) {
    const buttons = document.querySelectorAll("[data-test-category]");
    buttons.forEach((button) => {
        const isActive = button.dataset.testCategory === category;
        button.classList.toggle("bg-blue-500", isActive);
        button.classList.toggle("text-white", isActive);
        button.classList.toggle("bg-slate-100", !isActive);
        button.classList.toggle("dark:bg-slate-800", !isActive);
        button.classList.toggle("text-slate-700", !isActive);
    });
    window.__testCategoryFilter = category;
    window.__syncTestsPage?.();
};

window.initTestsPage = function initTestsPage() {
    const barraBusqueda = document.getElementById("tests-barra-busqueda");
    const sync = () => {
        renderTestsPage({
            search: barraBusqueda?.value || "",
            category: window.__testCategoryFilter || ""
        });
    };
    window.__syncTestsPage = sync;
    window.__testCategoryFilter = window.__testCategoryFilter || "";
    barraBusqueda?.addEventListener("input", sync);
    sync();
};

window.renderFeaturedTest = renderFeaturedTest;