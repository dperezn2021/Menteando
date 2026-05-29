// ======================= FASE 0 ==========================
// ---------------------------------------------------------
// Encargada de renderizar la UI de la página del test 
// (bloques, descripcion, etc.) y de crear el contenedor y 
// el boton del test
// ---------------------------------------------------------
// =========================================================

function getTestById(testId) {
    return (window.CATALOGO_TESTS || []).find((test) => test.id === testId) || null;
}

function renderTestDetailPage(testId) {
    const test = getTestById(testId);
    const content = document.getElementById("test-detail-content");

    if (!test || !content) {
        console.error("❌ No se encontró el test o el contenedor");
        return;
    }

    document.title = `Menteando | ${test.nombre}`;

    const skillsHTML = test.habilidades.map(skill => {
        const definicion = window.getSkillDefinition?.(skill);
        const colorLetra = definicion ? `text-${definicion.accent}-500` : "text-blue-500";
        const colorFondo = definicion ? `bg-${definicion.accent}-100 dark:bg-${definicion.accent}-900/30` : "bg-blue-100 dark:bg-blue-900/30";
        const label = definicion?.label || skill.replace(/_/g, ' ');
        return `<span class="px-3 py-1 rounded-full text-xs font-bold ${colorFondo} ${colorLetra}">${label}</span>`;
    }).join('');

    const howItWorks = (test.bloques || []).map((step, index) => `
        <li class="flex items-start gap-3">
            <span class="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-sm font-bold flex items-center justify-center flex-shrink-0">${index + 1}</span>
            <span class="text-slate-600 dark:text-slate-300 leading-relaxed">${step}</span>
        </li>
    `).join("");

content.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <!-- En móvil: info arriba, test abajo. En desktop: info derecha, test izquierda -->
        <div class="grid grid-cols-1 xl:grid-cols-[0.9fr_1.4fr] gap-8">
            
            <!-- COLUMNA IZQUIERDA (ahora la INFO - en móvil aparece arriba) -->
            <div class="flex flex-col gap-6 order-1 xl:order-1">
                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
                    <span class="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                        ${test.heroEyebrow || "Test cognitivo"}
                    </span>
                    <h2 class="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                        ${test.nombre}
                    </h2>
                    <p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        ${test.descripcion}
                    </p>
                    <div class="flex flex-wrap gap-2">
                        ${skillsHTML}
                    </div>
                </div>

                <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-6">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Cómo funciona
                    </h3>
                    <ol class="space-y-3">
                        ${howItWorks}
                    </ol>
                </div>
            </div>

            <!-- COLUMNA DERECHA (ahora el TEST - en móvil aparece abajo) -->
            <div class="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg order-2 xl:order-2">
                <div class="relative flex-1 bg-slate-900 min-h-[400px] flex items-center justify-center">
                    <div id="container" class="w-full h-full flex items-center justify-center"></div>
                </div>
                <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex gap-2">
                    <button id="start-btn" class="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-200 shadow-md">
                        Iniciar ${test.nombre}
                    </button>
                    <button id="fullscreen-btn" class="hidden px-4 py-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold transition-all duration-200 shadow-md" title="Pantalla completa" style="touch-action:manipulation">
                        ⛶
                    </button>
                </div>
            </div>
        </div>

        <!-- RESULTADOS -->
        <div id="result" class="hidden mt-10"></div>

        <div class="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 mt-6">
            <div class="flex items-center gap-3 mb-3">
                <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                    </path>
                </svg>
                <p class="text-sm font-medium text-indigo-400">¿Qué te ha parecido este test?</p>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Tu opinión nos ayuda a mejorar.
                Comparte tu experiencia o reporta algún problema.</p>
            <div class="flex gap-3 mt-4">
                <button id="btn-opinar-juego"
                    class="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-bold transition">
                    💬 Escribir opinión
                </button>
                <button id="btn-reportar-juego"
                    class="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    🚩 Reportar problema
                </button>
            </div>
        </div>
    </div>
`;
    lanzarLogicaDelTest(testId);



    // Botón Escribir opinión
    const btnOpinar = document.getElementById("btn-opinar-juego");
    if (btnOpinar) {
        btnOpinar.addEventListener("click", () => {
            // Redirigir a about.html con categoría "juego" pre-seleccionada
            window.location.href = "../../about.html?categoria=juego#seccion-comentarios";
        });
    }

    // Botón Reportar problema
    const btnReportar = document.getElementById("btn-reportar-juego");
    if (btnReportar) {
        btnReportar.addEventListener("click", () => {
            // Redirigir al formulario de contacto
            window.location.href = "../../about.html?tipo=reporte#contacto";
        });
    }
}

window.initTestDetailPage = function initTestDetailPage(testId) {
    const perfil = typeof window.getperfil === "function" ? window.getperfil() : null;
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const root = document.documentElement;
    const headerAvatar = document.getElementById("perfil-avatar-header");

    if (perfil?.avatar && headerAvatar) headerAvatar.src = perfil.avatar;

    const syncThemeButton = () => {
        const isDark = root.classList.contains("dark");
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
        }
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const willUseDark = !root.classList.contains("dark");
            root.classList.toggle("dark", willUseDark);
            root.classList.toggle("light", !willUseDark);
            localStorage.setItem("theme", willUseDark ? "dark" : "light");
            syncThemeButton();
        });
    }

    syncThemeButton();
    renderTestDetailPage(testId);

    // After rendering, set header subtitle to the test category and attach fullscreen behavior to start button so tests open full-screen on any device
    setTimeout(() => {
        // set header subtitle to category from catalog
        try {
            const test = window.getTestById?.(testId) || null;
            if (test) {
                const categoriaDisplay = { atencion: 'Atención', memoria: 'Memoria', control: 'Control', reflejos: 'Reflejos' };
                const catLabel = categoriaDisplay[test.categoria] || (test.categoria.charAt(0).toUpperCase() + test.categoria.slice(1));
                // Update nav header: title → test name, subtitle → category
                const headerH1 = document.querySelector('header h1');
                if (headerH1) headerH1.textContent = test.nombre;
                if (headerH1.textContent === "TAVEC – Test de Aprendizaje Verbal España-Complutense") headerH1.textContent = "Test TAVEC";
                const headerSubtitle = document.querySelector('header .flex-col.leading-tight p');
                if (headerSubtitle) headerSubtitle.textContent = catLabel;
            }
        } catch (e) { /* ignore */ }

        const startBtn = document.getElementById('start-btn');
        const fsBtn = document.getElementById('fullscreen-btn');
        if (startBtn && fsBtn) {
            fsBtn.addEventListener('click', () => {
                try { enterTestFullscreen(); } catch (e) { /* ignore */ }
            });
            // Show fullscreen button while test is running (start-btn hidden), hide when test ends
            const fsObserver = new MutationObserver(() => {
                if (startBtn.classList.contains('hidden')) {
                    fsBtn.classList.remove('hidden');
                } else {
                    fsBtn.classList.add('hidden');
                }
            });
            fsObserver.observe(startBtn, { attributes: true, attributeFilter: ['class'] });
        }
    }, 80);
};



// ======================= FASE 1 ==========================
// ---------------------------------------------------------
// Evalua habilidades, recomienda juegos, renderiza 
// resultados, guarda metricas y llama al test correspondiente
// ---------------------------------------------------------
// =========================================================

// Función auxiliar para mostrar métricas con nombres amigables
function renderMetricas(metrics) {
    const nombreMetrica = {
        aciertos: 'Aciertos',
        errores: 'Errores totales',
        precision: 'Precisión',
        tiempoTotalMs: 'Tiempo total',
        tiempoMedioRespuestaMs: 'Tiempo medio respuesta',
        rachaMaxima: 'Racha máxima',
        erroresComision: 'Errores de comisión',
        erroresOmision: 'Errores de omisión',
        totalMarcados: 'Total marcados',
        velocidad: 'Velocidad (estímulos/seg)'
    };

    const metricasMostrables = Object.entries(metrics)
        .filter(([key, value]) => value !== undefined && value !== null && typeof value !== 'object')
        .map(([key, value]) => {
            const nombre = nombreMetrica[key] || key;
            let valorFormateado = value;
            if (key === 'tiempoTotalMs' || key === 'tiempoMedioRespuestaMs') {
                valorFormateado = `${Math.round(value)} ms`;
            } else if (key === 'precision' && typeof value === 'number') {
                valorFormateado = `${Math.round(value * 100)}%`;
            } else if (typeof value === 'number') {
                valorFormateado = value.toFixed(2);
            }
            return { nombre, valor: valorFormateado };
        });

    return metricasMostrables;
}

function renderTarjetaResultado(metricas, habilidadesDebiles, juegosRecomendados, test) {
    const metricasMostradas = renderMetricas(metricas);

    // Determinar color según rendimiento general
    const precision = metricas.precision || 0;
    let colorResultado = "blue";
    let mensajeResultado = "";

    if (precision >= 0.8) {
        colorResultado = "green";
        mensajeResultado = "Excelente rendimiento";
    } else if (precision >= 0.6) {
        colorResultado = "blue";
        mensajeResultado = "Buen trabajo";
    } else if (precision >= 0.4) {
        colorResultado = "yellow";
        mensajeResultado = "Puedes mejorar";
    } else {
        colorResultado = "red";
        mensajeResultado = "Áreas de mejora detectadas";
    }

    const bgColor = {
        green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
        blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        yellow: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
        red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
    };

    const iconColor = {
        green: "text-green-600",
        blue: "text-blue-600",
        yellow: "text-yellow-600",
        red: "text-red-600"
    };

    return `
        <div class="rounded-2xl border ${bgColor[colorResultado]} bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <!-- Cabecera -->
            <div class="px-6 py-4 border-b ${bgColor[colorResultado]}">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Resultados del test</h3>
                        <p class="text-sm ${iconColor[colorResultado]} font-medium mt-1">${mensajeResultado}</p>
                    </div>
                    <div class="w-12 h-12 rounded-full ${bgColor[colorResultado]} flex items-center justify-center">
                        <svg class="w-6 h-6 ${iconColor[colorResultado]}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- Métricas en grid -->
            <div class="p-6">
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    ${metricasMostradas.map(m => `
                        <div class="text-center">
                            <div class="text-2xl font-bold text-slate-900 dark:text-white">${m.valor}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">${m.nombre}</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Habilidades débiles -->
                ${habilidadesDebiles.length > 0 ? `
                    <div class="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <h4 class="font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Habilidades a mejorar
                        </h4>
                        <div class="flex flex-wrap gap-2">
                            ${habilidadesDebiles.map(h => {
        const def = window.getSkillDefinition?.(h);
        const color = def?.accent || "amber";
        return `<span class="px-3 py-1 rounded-full text-xs font-bold bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${def?.label || h}</span>`;
    }).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <p class="text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            ¡No se detectaron dificultades significativas! Tu rendimiento es excelente.
                        </p>
                    </div>
                `}
                
                <!-- Juegos recomendados -->
                ${juegosRecomendados.length > 0 ? `
                    <div>
                        <h4 class="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Juegos recomendados
                        </h4>
                        <div class="space-y-2">
                            ${juegosRecomendados.map(juego => `
                                <a href="../${juego.url}" class="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                                    <div>
                                        <div class="font-medium text-slate-900 dark:text-white">${juego.nombre}</div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400">Entrena: ${juego.categoria}</div>
                                    </div>
                                    <svg class="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function procesarResultadosTest(resultado) {
    const test = getTestById(resultado.testId);
    if (!test) return;

    const juegosRecomendados = recomendarJuegos(resultado.habilidadesDebiles);
    const resultBox = document.getElementById("result");

    if (resultBox) {
        resultBox.innerHTML = renderTarjetaResultado(
            resultado.metrics,
            resultado.habilidadesDebiles,
            juegosRecomendados,
            test
        );
        resultBox.classList.remove("hidden");

        // Exit fullscreen first if active, then scroll to results
        const isOverlayFullscreen = !!document.querySelector('.test-fullscreen-overlay');
        const isNativeFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const scrollDelay = (isOverlayFullscreen || isNativeFullscreen) ? 400 : 100;
        if (isOverlayFullscreen || isNativeFullscreen) {
            const exitBtn = document.querySelector('.test-exit-fullscreen');
            if (exitBtn) exitBtn.click();
        }
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, scrollDelay);
    }

    // Lock the start button after test ends (runs after test's finalizarTest shows it)
    setTimeout(() => {
        const startBtn = document.getElementById('start-btn');
        const fsBtn = document.getElementById('fullscreen-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '🔒 Test completado';
            startBtn.className = startBtn.className
                .replace(/bg-blue-\d+/g, 'bg-slate-500')
                .replace(/hover:bg-blue-\d+/g, 'cursor-not-allowed');
            startBtn.classList.add('opacity-70', 'cursor-not-allowed');
            startBtn.onclick = null;
        }
        if (fsBtn) fsBtn.classList.add('hidden');
    }, 80);

    const perfil = window.getperfil();
    if (!perfil.tests) perfil.tests = {};
    if (!perfil.tests[resultado.testId]) perfil.tests[resultado.testId] = [];
    perfil.tests[resultado.testId].push({
        testId: resultado.testId,
        timestamp: resultado.timestamp,
        metrics: resultado.metrics,
        habilidadesDebiles: resultado.habilidadesDebiles
    });

    if (!perfil.testsCompletados) perfil.testsCompletados = {};
    perfil.testsCompletados[resultado.testId] = true;

    window.saveperfil(perfil);

    if (typeof window.notificarTestCompletado === "function") {
        window.notificarTestCompletado();
    }
}

function recomendarJuegos(habilidadesDebiles) {
    const juegos = window.catalogoJuegos || window.CATALOGO_JUEGOS || [];
    if (!habilidadesDebiles.length) return [];

    const categoriasDebiles = new Set();
    habilidadesDebiles.forEach(h => {
        const cat = getCategoriaFromHabilidad(h);
        if (cat) categoriasDebiles.add(cat);
    });

    if (categoriasDebiles.size === 0) return [];

    return juegos.filter(juego => {
        const categoriaJuego = juego.categoria?.toLowerCase();
        return categoriasDebiles.has(categoriaJuego) && juego.disponible === "Disponible";
    }).slice(0, 4);
}

function getCategoriaFromHabilidad(habilidad) {
    const mapa = {
        atencion_selectiva: "atencion",
        atencion_sostenida: "atencion",
        atencion_dividida: "atencion",
        memoria_trabajo: "memoria",
        memoria_espacial: "memoria",
        velocidad_cognitiva: "reflejos",
        coordinacion_visomotora: "reflejos",
        control_inhibitorio: "control",
        planificacion: "control",
        flexibilidad_cognitiva: "control"
    };
    return mapa[habilidad] || null;
}

// ======================= FASE 2 ==========================
// ---------------------------------------------------------
// Se ejecuta cuando se pulsa iniciar, controla el flujo
// del test y calcula metricas para detectar habilidades
// falladas. Lanza callback
// ---------------------------------------------------------
// =========================================================

function lanzarLogicaDelTest(testId) {
    switch (testId) {
        case "corsi": initCorsiLogic(testId, procesarResultadosTest); break;
        case "d2": initD2Logic(testId, procesarResultadosTest); break;
        case "cpt": initCPTLogic(testId, procesarResultadosTest); break;
        case "wcst": initWCSTLogic(testId, procesarResultadosTest); break;
        case "tower-of-london": initTowerOfLondonLogic(testId, procesarResultadosTest); break;
        case "tavec": initTAVECLogic(testId, procesarResultadosTest); break;
        case "mec": initMECLogic(testId, procesarResultadosTest); break;
        case "stroop": initStroopLogic(testId, procesarResultadosTest); break;
        case "digit-span": initDigitSpanLogic(testId, procesarResultadosTest); break;
        case "tmt": initTMTLogic(testId, procesarResultadosTest); break;
        case "symbol-search": initSymbolSearchLogic(testId, procesarResultadosTest); break;
        case "nback": initNBackLogic(testId, procesarResultadosTest); break;
        case "gng": initGoNoGoLogic(testId, procesarResultadosTest); break;
        default: console.warn("Test sin lógica:", testId);
    }
}

function makeResponsiveContainer(innerHtml, customStyles = "") {
    return `
        <div class="w-full h-full overflow-auto p-4 flex items-center justify-center" style="max-height: 100%;">
            <div class="w-full max-w-full ${customStyles}">
                ${innerHtml}
            </div>
        </div>
    `;
}


// ======================================================
// 1. CORSI (responsivo) - CON VISUALIZACIÓN DEL ÚLTIMO BLOQUE
// ======================================================
function initCorsiLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let nivel = 2;
    let secuencia = [];
    let errores = 0;
    let erroresPorNivel = {};
    let tiemposRespuesta = [];
    let inicioTest = 0;
    let puedeResponder = false;
    let bloqueo = false;
    let esperandoTransicion = false;

    function actualizarStatus() {
        if (status) status.textContent = `Nivel ${nivel} · Errores ${errores}/2`;
    }

    function generarSecuencia(n) {
        const seq = [];
        for (let i = 0; i < n; i++) {
            let nuevo;
            do { nuevo = Math.floor(Math.random() * 9); } while (seq.includes(nuevo));
            seq.push(nuevo);
        }
        return seq;
    }

    function renderBloques() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col h-full">
                <div class="text-center mb-4">
                    <p class="text-sm text-slate-400">Nivel ${nivel} | ${errores}/2 errores</p>
                </div>
                <div class="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto w-full flex-1 items-center">
                    ${Array(9).fill().map((_, i) => `
                        <div data-id="${i}" class="aspect-square rounded-xl bg-slate-700 hover:bg-slate-600 transition-all cursor-pointer shadow-md"></div>
                    `).join('')}
                </div>
            </div>
        `);
    }

    function limpiarResaltados(bloques) {
        bloques.forEach(b => {
            b.classList.remove("bg-blue-500", "shadow-lg", "scale-95");
            b.classList.add("bg-slate-700");
        });
    }

    function iluminarSecuencia(seq, callbackFn) {
        const bloques = container.querySelectorAll("[data-id]");
        let i = 0;
        puedeResponder = false;

        const interval = setInterval(() => {
            // Limpiar todos los bloques
            bloques.forEach(b => {
                b.classList.remove("bg-blue-500", "shadow-lg", "scale-95");
                b.classList.add("bg-slate-700");
            });

            if (i === seq.length) {
                clearInterval(interval);
                setTimeout(() => {
                    puedeResponder = true;
                    callbackFn();
                }, 300);
                return;
            }

            // Iluminar el bloque actual
            const bloque = bloques[seq[i]];
            bloque.classList.remove("bg-slate-700");
            bloque.classList.add("bg-blue-500", "shadow-lg", "scale-95");
            i++;
        }, 600);
    }

    function mostrarFeedbackError() {
        const mensajeError = document.createElement('div');
        mensajeError.className = 'fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold z-50 animate-pulse';
        mensajeError.textContent = '✗ Secuencia incorrecta';
        document.body.appendChild(mensajeError);
        setTimeout(() => mensajeError.remove(), 1000);
    }

    function iniciarNivel() {
        if (bloqueo) return;
        actualizarStatus();
        renderBloques();

        secuencia = generarSecuencia(nivel);
        erroresPorNivel[nivel] = erroresPorNivel[nivel] || 0;

        iluminarSecuencia(secuencia, () => {
            let respuesta = [];
            const inicioRespuesta = performance.now();
            const bloques = container.querySelectorAll("[data-id]");

            const clickHandler = (e) => {
                if (!puedeResponder || esperandoTransicion) return;

                const bloque = e.target.closest("[data-id]");
                if (!bloque) return;

                const id = parseInt(bloque.dataset.id);

                // Si ya está seleccionado, no hacer nada
                if (respuesta.includes(id)) return;

                respuesta.push(id);

                // Resaltar el bloque seleccionado por el usuario (MISMO AZUL que la animación)
                bloque.classList.remove("bg-slate-700", "hover:bg-slate-600");
                bloque.classList.add("bg-blue-500", "shadow-lg", "scale-95");

                // Si es el último de la secuencia
                if (respuesta.length === secuencia.length) {
                    puedeResponder = false;
                    esperandoTransicion = true;

                    const tiempoRespuesta = performance.now() - inicioRespuesta;
                    tiemposRespuesta.push(tiempoRespuesta);

                    // Mantener el último bloque resaltado visiblemente
                    setTimeout(() => {
                        if (respuesta.join() === secuencia.join()) {
                            // Acierto
                            nivel++;
                            esperandoTransicion = false;
                            iniciarNivel();
                        } else {
                            // Error
                            errores++;
                            erroresPorNivel[nivel]++;
                            mostrarFeedbackError();

                            // Limpiar resaltados antes de reiniciar
                            limpiarResaltados(bloques);

                            if (errores >= 2) {
                                finalizarTest();
                            } else {
                                esperandoTransicion = false;
                                setTimeout(() => iniciarNivel(), 1000);
                            }
                        }
                    }, 400); // Tiempo para que el usuario vea el último bloque resaltado

                } else {
                    // No es el último, restaurar después de un breve momento
                    setTimeout(() => {
                        if (bloque && puedeResponder) {
                            bloque.classList.remove("bg-blue-500", "shadow-lg", "scale-95");
                            bloque.classList.add("bg-slate-700");
                        }
                    }, 200);
                }
            };

            container.onclick = clickHandler;
        });
    }

    function finalizarTest() {
        bloqueo = true;
        container.onclick = null;

        const rachaMaxima = nivel - 1;
        const tiempoTotal = performance.now() - inicioTest;
        const precision = rachaMaxima > 0 ? rachaMaxima / (rachaMaxima + errores) : 0;

        const habilidades = [];
        if (rachaMaxima < 4) habilidades.push("memoria_espacial");
        if (errores >= 2) habilidades.push("memoria_trabajo");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                rachaMaxima,
                errores,
                precision,
                tiempoTotalMs: Math.round(tiempoTotal)
            },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2;
        errores = 0;
        erroresPorNivel = {};
        tiemposRespuesta = [];
        inicioTest = performance.now();
        bloqueo = false;
        esperandoTransicion = false;
        iniciarNivel();
    };
}

// ======================================================
// 2. D2 (responsivo - CORREGIDO, SIN BLOQUEO DEL PRIMER CLICK)
// ======================================================
function initD2Logic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let lineaActual = 0;
    const totalLineas = 10;
    const tiempoPorLinea = 5000;
    const itemsPorLinea = 12;

    let aciertosPorLinea = [];
    let erroresComisionPorLinea = [];
    let erroresOmisionPorLinea = [];
    let timer = null;
    let aciertos = 0, erroresComision = 0, erroresOmision = 0;
    let inicioTest = 0;
    let puedeSeleccionar = true;
    let seleccionesEnLinea = new Set();

    // Comillas GRANDES
        function formatearConComillas(letra, rayas) {
        const combinaciones = {
            1: [{ arriba: 0, abajo: 1 }],
            2: [{ arriba: 2, abajo: 0 }, { arriba: 0, abajo: 2 }, { arriba: 1, abajo: 1 }],
            3: [{ arriba: 3, abajo: 0 }, { arriba: 0, abajo: 3 }, { arriba: 2, abajo: 1 }, { arriba: 1, abajo: 2 }],
            4: [{ arriba: 4, abajo: 0 }, { arriba: 0, abajo: 4 }, { arriba: 3, abajo: 1 }, { arriba: 1, abajo: 3 }, { arriba: 2, abajo: 2 }]
        };

        const opciones = combinaciones[rayas] || combinaciones[2];
        const seleccion = opciones[Math.floor(Math.random() * opciones.length)];

        return `
            <div class="d2-estimulo flex flex-col items-center justify-center min-w-[80px] sm:min-w-[100px] p-3">
                <div class="rayas-arriba text-3xl sm:text-5xl leading-none h-12 sm:h-16 text-blue-600 dark:text-blue-400 font-bold tracking-wider">
                    ${"'".repeat(seleccion.arriba) || " "}
                </div>
                <div class="letra text-5xl sm:text-7xl font-bold text-blue-600 dark:text-blue-400 my-2">
                    ${letra}
                </div>
                <div class="rayas-abajo text-3xl sm:text-5xl leading-none h-12 sm:h-16 text-blue-600 dark:text-blue-400 font-bold tracking-wider">
                    ${"'".repeat(seleccion.abajo) || " "}
                </div>
            </div>
        `;
    }

    function generarLinea() {
        const linea = [];
        for (let i = 0; i < itemsPorLinea; i++) {
            const letra = Math.random() < 0.5 ? 'd' : 'p';
            const rayas = Math.floor(Math.random() * 4) + 1;
            linea.push({ letra, rayas, marcado: false });
        }
        return linea;
    }

    function renderLinea(linea) {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col p-4" style="max-height:100%;">
                <div class="text-center mb-3">
                    <p class="text-lg font-bold text-blue-600 dark:text-blue-400">Línea ${lineaActual + 1}/${totalLineas}</p>
                    <p class="text-base text-blue-500">Tiempo restante: <span id="d2-timer" class="font-bold text-xl">${tiempoPorLinea/1000}</span> segundos</p>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <div class="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 w-full justify-center">
                        ${linea.map((stim, idx) => `
                            <div data-idx="${idx}"
                                 data-letra="${stim.letra}"
                                 data-rayas="${stim.rayas}"
                                 data-marcado="${stim.marcado}"
                                 class="estimulo cursor-pointer rounded-2xl transition-all duration-150 flex justify-center items-center bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:scale-95 shadow-md ${stim.marcado ? 'bg-blue-500 dark:bg-blue-600 ring-2 ring-blue-300 scale-95' : ''}"
                                 style="touch-action:manipulation; min-height:130px;">
                                ${formatearConComillas(stim.letra, stim.rayas)}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="text-center mt-3 text-sm text-blue-500">
                    Haz clic en las <span class="font-bold text-blue-600">'d' con DOS comillas</span>
                </div>
            </div>
        `;
    }

    function actualizarTimer(segundosRestantes) {
        const timerSpan = document.getElementById("d2-timer");
        if (timerSpan) {
            timerSpan.textContent = segundosRestantes;
            if (segundosRestantes <= 5) {
                timerSpan.classList.add("text-red-500");
            } else {
                timerSpan.classList.remove("text-red-500");
            }
        }
    }

    function iniciarLinea() {
        if (lineaActual >= totalLineas) {
            finalizarTest();
            return;
        }
        
        puedeSeleccionar = true;
        lineaCompletada = false;
        
        if (status) status.textContent = `Línea ${lineaActual + 1}/${totalLineas} · Haz clic en las 'd' con DOS comillas`;
        
        const linea = generarLinea();
        renderLinea(linea);
        
        let segundosRestantes = tiempoPorLinea / 1000;
        actualizarTimer(segundosRestantes);
        
        const timerInterval = setInterval(() => {
            if (lineaCompletada) return;
            segundosRestantes--;
            actualizarTimer(segundosRestantes);
            if (segundosRestantes <= 0 && !lineaCompletada) {
                clearInterval(timerInterval);
                procesarLinea(linea);
            }
        }, 1000);
        
        const clickHandler = (e) => {
            if (!puedeSeleccionar || lineaCompletada) return;
            
            const div = e.target.closest('.estimulo');
            if (!div) return;
            
            const idx = parseInt(div.dataset.idx);
            const yaMarcado = linea[idx].marcado;
            
            if (yaMarcado) {
                // Desmarcar
                linea[idx].marcado = false;
                div.dataset.marcado = "false";
                div.classList.remove('bg-blue-500', 'dark:bg-blue-600', 'ring-2', 'ring-blue-300', 'scale-95');
                div.classList.add('bg-white', 'dark:bg-slate-800');
            } else {
                // Marcar
                linea[idx].marcado = true;
                div.dataset.marcado = "true";
                div.classList.remove('bg-white', 'dark:bg-slate-800');
                div.classList.add('bg-blue-500', 'dark:bg-blue-600', 'ring-2', 'ring-blue-300', 'scale-95');
            }
        };
        
        container.onclick = clickHandler;
        
        timer = setTimeout(() => {
            if (!lineaCompletada) {
                clearInterval(timerInterval);
                procesarLinea(linea);
            }
        }, tiempoPorLinea);
    }
    
    function procesarLinea(linea) {
        if (lineaCompletada) return;
        lineaCompletada = true;
        puedeSeleccionar = false;
        if (timer) clearTimeout(timer);
        
        let aciertosLinea = 0, comisionesLinea = 0, omisionesLinea = 0;
        
        linea.forEach((stim, idx) => {
            const esObjetivo = (stim.letra === 'd' && stim.rayas === 2);
            const marcado = stim.marcado;
            
            if (esObjetivo) {
                if (marcado) aciertosLinea++;
                else omisionesLinea++;
            } else {
                if (marcado) comisionesLinea++;
            }
        });
        
        aciertosPorLinea.push(aciertosLinea);
        erroresComisionPorLinea.push(comisionesLinea);
        erroresOmisionPorLinea.push(omisionesLinea);
        
        aciertos += aciertosLinea;
        erroresComision += comisionesLinea;
        erroresOmision += omisionesLinea;
        
        lineaActual++;
        setTimeout(() => iniciarLinea(), 500);
    }
    
    function finalizarTest() {
        const totalObjetivos = aciertos + erroresOmision;
        const precision = totalObjetivos > 0 ? aciertos / totalObjetivos : 0;
        const tasaOmisiones = totalObjetivos > 0 ? erroresOmision / totalObjetivos : 0;
        
        const habilidades = [];
        
        if (precision < 0.7) habilidades.push("atencion_selectiva");
        if (tasaOmisiones > 0.3) habilidades.push("atencion_sostenida");
        if (erroresComision > 8) habilidades.push("control_inhibitorio");
        
        // Caída de rendimiento: diferencia entre primeras y últimas líneas
        const primerasLineas = aciertosPorLinea.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const ultimasLineas = aciertosPorLinea.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const caidaRendimiento = Math.max(0, primerasLineas - ultimasLineas);
        
        if (caidaRendimiento > 2) habilidades.push("atencion_sostenida");
        
        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos: aciertos,
                erroresComision: erroresComision,
                erroresOmision: erroresOmision,
                precision: Math.round(precision * 100),
                tasaOmisiones: Math.round(tasaOmisiones * 100) / 100,
                caidaRendimiento: Math.round(caidaRendimiento * 10) / 10
            },
            habilidadesDebiles: habilidades
        });
        
        startBtn.classList.remove("hidden");
        if (status) status.textContent = "";
    }
    
    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        lineaActual = 0;
        aciertos = 0;
        erroresComision = 0;
        erroresOmision = 0;
        inicioTest = performance.now();
        iniciarLinea();
    };
}


// ======================================================
// 3. CPT (responsivo)
// ======================================================
function initCPTLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");

    const totalEstímulos = 40;
    const numObjetivos = 10;
    let estímulos = [];
    let indice = 0;
    let aciertos = 0, comisiones = 0, omisiones = 0;
    let tiemposReaccion = [];
    let inicioTest = 0;
    let respondidoEnEsteTurno = false;

    function generarSecuencia() {
        let seq = Array(totalEstímulos).fill(null);
        let colocados = 0;

        // 1. Colocar los 10 pares objetivos (A -> X)
        while (colocados < numObjetivos) {
            let pos = Math.floor(Math.random() * (totalEstímulos - 1));
            if (seq[pos] === null && seq[pos + 1] === null) {
                seq[pos] = 'A'; seq[pos + 1] = 'X';
                colocados++;
            }
        }

        // 2. RELLENAR CON DISTRACTORES (Más A y X sueltas para confundir)
        for (let i = 0; i < totalEstímulos; i++) {
            if (seq[i] === null) {
                const azar = Math.random();
                if (azar < 0.2) seq[i] = 'A'; // 20% de 'A' extras (falsos inicios)
                else if (azar < 0.35) seq[i] = 'X'; // 15% de 'X' extras (falsas alarmas sin A previa)
                else {
                    // Letras aleatorias evitando X si la anterior fue A
                    let letra;
                    do {
                        letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    } while (letra === 'X' && i > 0 && seq[i - 1] === 'A');
                    seq[i] = letra;
                }
            }
        }
        return seq;
    }

    function mostrarSiguiente() {
        if (indice >= totalEstímulos) return finalizarTest();

        respondidoEnEsteTurno = false;
        const letra = estímulos[indice];
        const esObjetivo = (letra === 'X' && indice > 0 && estímulos[indice - 1] === 'A');
        const inicioRespuesta = performance.now();

        container.innerHTML = `
            <div class="flex flex-col items-center justify-center space-y-8">
                <div class="text-8xl font-black text-white select-none">${letra}</div>
                <button id="action-trigger" class="w-44 h-44 bg-blue-600 active:bg-blue-900 rounded-full border-4 border-white text-white font-bold text-2xl shadow-2xl touch-none select-none">
                    PULSAR
                </button>
            </div>
        `;

        const trigger = document.getElementById("action-trigger");

        const handleInput = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            if (respondidoEnEsteTurno) return;

            respondidoEnEsteTurno = true;
            const rt = performance.now() - inicioRespuesta;

            if (esObjetivo) {
                aciertos++;
                tiemposReaccion.push(rt);
                trigger.classList.replace('bg-blue-600', 'bg-green-500');
            } else {
                comisiones++;
                trigger.classList.replace('bg-blue-600', 'bg-red-500');
            }
        };

        window.addEventListener('keydown', handleInput);
        trigger.addEventListener('pointerdown', handleInput);

        setTimeout(() => {
            window.removeEventListener('keydown', handleInput);
            if (esObjetivo && !respondidoEnEsteTurno) omisiones++;
            indice++;
            container.innerHTML = "";
            setTimeout(mostrarSiguiente, 100);
        }, 850); // Un poco más rápido para aumentar dificultad
    }

    function finalizarTest() {
        const rtMedio = tiemposReaccion.length ? tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length : 0;

        // CÁLCULO DE PRECISIÓN REAL (0.0 a 1.0) para que tu UI no explote
        // Si tu UI multiplica por 100, aquí mandamos el decimal.
        const totalOportunidades = numObjetivos + comisiones;
        const precisionDecimal = Math.max(0, aciertos / (numObjetivos + comisiones) || 0);

        const habilidadesDebiles = [];
        if (aciertos < 8) habilidadesDebiles.push("atencion_sostenida");
        if (comisiones > 3) habilidadesDebiles.push("control_inhibitorio");
        if (rtMedio > 600) habilidadesDebiles.push("velocidad_cognitiva");
        if (omisiones > 2) habilidadesDebiles.push("atencion_selectiva");

        // Mensaje de rendimiento coherente
        let mensaje = "Necesitas mejorar tu enfoque";
        if (precisionDecimal > 0.85 && comisiones < 3) mensaje = "Excelente rendimiento";
        else if (precisionDecimal > 0.6) mensaje = "Rendimiento aceptable";

        callback({
            testId,
            timestamp: Date.now(),
            rendimiento: mensaje,
            metrics: {
                aciertos,
                comisiones,
                omisiones,
                precision: precisionDecimal, // Enviamos decimal (0.9 para 90%)
                tiempoMedioRespuestaMs: Math.round(rtMedio),
            },
            habilidadesDebiles
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        estímulos = generarSecuencia();
        indice = 0; aciertos = 0; comisiones = 0; omisiones = 0; tiemposReaccion = [];
        inicioTest = performance.now();
        mostrarSiguiente();
    };
}


// ======================================================
// 4. WCST (Wisconsin Card Sorting Test) - Versión profesional
// ======================================================
function initWCSTLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    // --- Cartas de estímulo fijas (según especificación) ---
    const cartasEstimulo = [
        { id: 'A', color: 'rojo', forma: 'triangulo', numero: 1, svg: getSvgTriangulo() },
        { id: 'B', color: 'verde', forma: 'estrella', numero: 2, svg: getSvgEstrella() },
        { id: 'C', color: 'amarillo', forma: 'cruz', numero: 3, svg: getSvgCruz() },
        { id: 'D', color: 'azul', forma: 'circulo', numero: 4, svg: getSvgCirculo() }
    ];

    // --- Funciones para obtener los SVG de las formas (estilo minimalista) ---
    function getSvgTriangulo() {
        return `<svg viewBox="0 0 40 40" fill="currentColor" class="w-8 h-8 mx-auto"><polygon points="20,5 35,35 5,35" /></svg>`;
    }
    function getSvgEstrella() {
        return `<svg viewBox="0 0 40 40" fill="currentColor" class="w-8 h-8 mx-auto"><polygon points="20,5 25,15 36,17 28,25 30,36 20,30 10,36 12,25 4,17 15,15" /></svg>`;
    }
    function getSvgCruz() {
        return `<svg viewBox="0 0 40 40" fill="currentColor" class="w-8 h-8 mx-auto"><path d="M15,5 L25,5 L25,15 L35,15 L35,25 L25,25 L25,35 L15,35 L15,25 L5,25 L5,15 L15,15 Z" /></svg>`;
    }
    function getSvgCirculo() {
        return `<svg viewBox="0 0 40 40" fill="currentColor" class="w-8 h-8 mx-auto"><circle cx="20" cy="20" r="15" /></svg>`;
    }

    // Posibles colores, formas y números
    const colores = ['rojo', 'verde', 'azul', 'amarillo'];
    const formas = ['triangulo', 'estrella', 'cruz', 'circulo'];
    const numeros = [1, 2, 3, 4];

    // Funciones para mapear forma a SVG
    function svgPorForma(forma) {
        switch (forma) {
            case 'triangulo': return getSvgTriangulo();
            case 'estrella': return getSvgEstrella();
            case 'cruz': return getSvgCruz();
            case 'circulo': return getSvgCirculo();
            default: return '';
        }
    }

    // Estado del test
    let reglaActual = 'color';        // 'color', 'forma', 'numero'
    let aciertosConsec = 0;
    let totalAciertos = 0;
    let totalErrores = 0;
    let reglasCompletadas = 0;        // número de cambios de regla
    let cartaActual = null;
    let inicioTest = 0;
    let esperandoFeedback = false;
    let tiemposReaccion = [];          // Array de tiempos de reacción por carta (ms)
    let historialReglas = [];          // Guarda las reglas anteriores para detectar perseveración
    let erroresPerseverativos = 0;

    // Configuración del test
    const TOTAL_CARTAS = 40;            // Número total de clasificaciones
    const ACIERTOS_PARA_CAMBIO = 10;    // Cambia regla tras 10 aciertos consecutivos
    let cartasProcesadas = 0;

    // --- Generar carta de respuesta aleatoria ---
    function generarCartaRespuesta() {
        return {
            color: colores[Math.floor(Math.random() * 4)],
            forma: formas[Math.floor(Math.random() * 4)],
            numero: numeros[Math.floor(Math.random() * 4)],
            colorClase: `text-${colores[Math.floor(Math.random() * 4)]}-500`
        };
    }

    // --- Mostrar feedback visual breve dentro del canvas ---
    function mostrarFeedback(acierto) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2`;
        msgDiv.innerHTML = `
            <div class="px-4 py-2 rounded-full text-white text-sm font-bold animate-pulse ${acierto ? 'bg-green-500' : 'bg-red-500'}">
                ${acierto ? '✓ CORRECTO' : '✗ INCORRECTO'}
            </div>
        `;
        const canvasContainer = document.querySelector('#container .relative');
        if (canvasContainer) {
            canvasContainer.appendChild(msgDiv);
            setTimeout(() => msgDiv.remove(), 800);
        }
    }

    // --- Cambio de regla (silencioso, sin aviso) ---
    function cambiarRegla() {
        // Guardar regla anterior para detectar perseveraciones
        const reglaAnterior = reglaActual;
        const posibles = ['color', 'forma', 'numero'].filter(r => r !== reglaActual);
        reglaActual = posibles[Math.floor(Math.random() * posibles.length)];
        aciertosConsec = 0;
        reglasCompletadas++;

        // Registrar el cambio en el historial
        historialReglas.push({ desde: reglaAnterior, hasta: reglaActual, momento: cartasProcesadas });
        console.log(`[WCST] Regla cambiada silenciosamente a: ${reglaActual} (${reglasCompletadas} cambios)`);
    }

    // --- Evaluar la clasificación seleccionada por el usuario ---
    function evaluar(cartaSeleccionada) {
        if (esperandoFeedback || !cartaActual) return;
        esperandoFeedback = true;

        const inicioRespuesta = performance.now();
        let correcto = false;

        if (reglaActual === 'color') correcto = (cartaSeleccionada.color === cartaActual.color);
        else if (reglaActual === 'forma') correcto = (cartaSeleccionada.forma === cartaActual.forma);
        else correcto = (cartaSeleccionada.numero === cartaActual.numero);

        // Calcular tiempo de reacción
        const tiempoReaccion = performance.now() - inicioRespuesta;
        tiemposReaccion.push(tiempoReaccion);

        // Detectar error perseverativo: el usuario sigue usando la regla anterior
        if (!correcto && historialReglas.length > 0) {
            const ultimoCambio = historialReglas[historialReglas.length - 1];
            const reglaAnterior = ultimoCambio.desde;
            let seguiriaReglaAnterior = false;
            if (reglaAnterior === 'color') seguiriaReglaAnterior = (cartaSeleccionada.color === cartaActual.color);
            else if (reglaAnterior === 'forma') seguiriaReglaAnterior = (cartaSeleccionada.forma === cartaActual.forma);
            else seguiriaReglaAnterior = (cartaSeleccionada.numero === cartaActual.numero);

            if (seguiriaReglaAnterior) {
                erroresPerseverativos++;
                console.log(`[WCST] Error perseverativo detectado (regla anterior: ${reglaAnterior})`);
            }
        }

        if (correcto) {
            totalAciertos++;
            aciertosConsec++;
            // Cambiar regla tras 10 aciertos consecutivos
            if (aciertosConsec >= ACIERTOS_PARA_CAMBIO && reglasCompletadas < 5) {
                cambiarRegla();
            }
            mostrarFeedback(true);
        } else {
            totalErrores++;
            aciertosConsec = 0;
            mostrarFeedback(false);
        }

        // Resaltar la carta de estímulo seleccionada (feedback visual)
        const cartaDiv = document.querySelector(`.carta-estimulo[data-carta-id="${cartaSeleccionada.id}"]`);
        if (cartaDiv) {
            cartaDiv.classList.add('ring-4', correcto ? 'ring-green-400' : 'ring-red-400');
            setTimeout(() => {
                cartaDiv.classList.remove('ring-4', 'ring-green-400', 'ring-red-400');
            }, 500);
        }

        // Actualizar contador de cartas procesadas
        cartasProcesadas++;

        // Generar siguiente carta o finalizar
        setTimeout(() => {
            if (cartasProcesadas < TOTAL_CARTAS) {
                cartaActual = generarCartaRespuesta();
                renderCarta();
            } else {
                finalizarTest();
            }
            esperandoFeedback = false;
        }, 800);
    }

    // --- Renderizar la interfaz actual ---
    function renderCarta() {
        if (!cartaActual) return;

        // Mapeo de color a clases de texto para el SVG
        const colorTexto = {
            rojo: 'text-red-600',
            verde: 'text-green-600',
            azul: 'text-blue-600',
            amarillo: 'text-yellow-600'
        };

        container.innerHTML = makeResponsiveContainer(`
            <div class="relative w-full h-full">
                <div class="flex flex-col h-full p-3 relative z-10">
                    <!-- Fila de cartas de estímulo -->
                    <div class="text-center mb-4">
                        <div class="text-xs text-slate-400 mb-2">Clasifica la carta inferior según la regla que debes descubrir:</div>
                        <div class="flex flex-wrap justify-center gap-3">
                            ${cartasEstimulo.map(carta => `
                                <div data-carta-id="${carta.id}" 
                                     data-color="${carta.color}"
                                     data-forma="${carta.forma}"
                                     data-numero="${carta.numero}"
                                     class="carta-estimulo w-24 h-32 bg-white dark:bg-slate-800 rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 p-2 flex flex-col items-center justify-center border border-slate-300 dark:border-slate-600">
                                    <div class="${colorTexto[carta.color]}">
                                        ${carta.svg}
                                    </div>
                                    <div class="text-2xl font-bold mt-1">${carta.numero}</div>
                                    <div class="text-xs text-slate-500">${carta.forma}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Indicador de regla oculta -->
                    <div class="text-center mb-2">
                        <div class="text-xs text-slate-500">Regla de clasificación (oculta)</div>
                        <div class="text-xl text-amber-400 font-mono">???</div>
                    </div>

                    <!-- Carta a clasificar -->
                    <div class="text-center mb-4">
                        <div class="text-sm text-slate-400 mb-2">¿Cómo clasificas esta carta?</div>
                        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg w-40 h-auto mx-auto border border-slate-300 dark:border-slate-600">
                            <div class="${colorTexto[cartaActual.color]}">
                                ${svgPorForma(cartaActual.forma)}
                            </div>
                            <div class="text-2xl font-bold mt-1">${cartaActual.numero}</div>
                            <div class="text-xs text-slate-500">${cartaActual.forma}</div>
                        </div>
                    </div>

                    <!-- Estadísticas -->
                    <div class="text-center text-sm text-slate-400 mt-2">
                        Aciertos: ${totalAciertos} | Errores: ${totalErrores} | Cartas: ${cartasProcesadas}/${TOTAL_CARTAS}
                    </div>
                    <div class="text-center text-xs text-slate-500">
                        Reglas descubiertas: ${reglasCompletadas}
                    </div>
                </div>
            </div>
        `);

        // Asignar eventos de click a las cartas de estímulo
        document.querySelectorAll('.carta-estimulo').forEach(el => {
            el.onclick = () => {
                if (!esperandoFeedback) {
                    evaluar({
                        id: el.dataset.cartaId,
                        color: el.dataset.color,
                        forma: el.dataset.forma,
                        numero: parseInt(el.dataset.numero)
                    });
                }
            };
        });
    }

    // --- Finalizar test, calcular resultados y enviar callback ---
    function finalizarTest() {
        const precision = totalAciertos / (totalAciertos + totalErrores) || 0;
        const tiempoTotal = performance.now() - inicioTest;
        const tiempoMedioReaccion = tiemposReaccion.length ? tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length : 0;

        // Detección de habilidades según métricas del WCST
        const habilidades = [];

        // Flexibilidad cognitiva: bajas reglas completadas o muchos errores perseverativos
        if (reglasCompletadas < 2) habilidades.push("flexibilidad_cognitiva");
        if (erroresPerseverativos > 8) habilidades.push("flexibilidad_cognitiva");

        // Control inhibitorio: muchos errores totales o baja precisión
        if (totalErrores > 15 || precision < 0.6) habilidades.push("control_inhibitorio");

        // Memoria de trabajo: solo si tiene baja racha final, pero además no logró completar al menos 2 reglas o tiene muchas perseveraciones
        const haCompletadoReglasSuficientes = reglasCompletadas >= 2;
        const muchasPerseveraciones = erroresPerseverativos > 5;

        if (aciertosConsec < 3 && totalAciertos > 10 && !haCompletadoReglasSuficientes || muchasPerseveraciones) {
            habilidades.push("memoria_trabajo");
        }
        // Planificación: lentitud excesiva en los primeros ensayos y/o muchos errores no perseverativos
        const primeros10Tiempos = tiemposReaccion.slice(0, 10);
        const tiempoMedioPrimeros = primeros10Tiempos.length ? primeros10Tiempos.reduce((a, b) => a + b, 0) / primeros10Tiempos.length : 0;
        const erroresNoPerseverativos = totalErrores - erroresPerseverativos;

        if (tiempoMedioPrimeros > 2500 || erroresNoPerseverativos > 8) {
            habilidades.push("planificacion");
        }
        // Registro en consola para depuración
        console.log(`[WCST] Resultados finales:
        - Aciertos: ${totalAciertos}
        - Errores: ${totalErrores}
        - Precisión: ${(precision * 100).toFixed(1)}%
        - Reglas completadas: ${reglasCompletadas}
        - Errores perseverativos: ${erroresPerseverativos}
        - Tiempo medio reacción: ${tiempoMedioReaccion.toFixed(0)} ms
        - Tiempo total: ${(tiempoTotal / 1000).toFixed(1)} s`);

        callback({
            testId,
            timestamp: Date.now(),
            metrics: {
                aciertos: totalAciertos,
                errores: totalErrores,
                precision: precision,
                reglasCompletadas: reglasCompletadas,
                perseveraciones: erroresPerseverativos,
                tiempoMedioReaccionMs: Math.round(tiempoMedioReaccion),
                tiempoTotalMs: Math.round(tiempoTotal)
            },
            habilidadesDebiles: habilidades
        });

        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Test completado. Precisión: ${(precision * 100).toFixed(0)}%`;
    }

    // --- Iniciar el test ---
    startBtn.onclick = () => {
        startBtn.classList.add("hidden");

        // Reiniciar todas las variables
        reglaActual = 'color';
        aciertosConsec = 0;
        totalAciertos = 0;
        totalErrores = 0;
        reglasCompletadas = 0;
        cartasProcesadas = 0;
        tiemposReaccion = [];
        historialReglas = [];
        erroresPerseverativos = 0;
        esperandoFeedback = false;

        cartaActual = generarCartaRespuesta();
        inicioTest = performance.now();
        renderCarta();

        if (status) status.textContent = "Clasifica cada carta. La regla cambiará sin previo aviso tras 10 aciertos.";
    };
}

// ======================================================
// 5. TOWER OF LONDON (corregido)
// ======================================================
function initTowerOfLondonLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    // Configuración
    let nivel = 1;
    let numBolas = 3;
    let estado = [[], [], []];
    let objetivo = [[], [], []];
    let objetivoVisible = true;
    let movimientos = 0;
    let movimientosTotales = 0;
    let movimientosPorNivel = [];
    let seleccionada = null;
    let juegoActivo = false;
    let inicioNivel = 0;
    let inicioTest = 0;
    let tiempoPorNivel = [];
    let nivelCompletado = false;
    let countdownInterval = null;

    const TIEMPOS_NIVEL = { 1: 10, 2: 20, 3: 30 }; // segundos por nivel

    const colores = ['rojo', 'verde', 'azul', 'amarillo', 'naranja'];
    const nombresColores = {
        rojo: 'bg-red-500',
        verde: 'bg-green-500',
        azul: 'bg-blue-500',
        amarillo: 'bg-yellow-500',
        naranja: 'bg-orange-500'
    };

    // Configuraciones variadas para cada nivel
    const configuraciones = {
        3: [
            { nombre: "una en cada varilla", objetivo: [[2], [1], [0]] },
            { nombre: "dos en varilla 0, una en varilla 1", objetivo: [[1, 0], [], [2]] },
            { nombre: "todas en varilla 1", objetivo: [[], [1, 2, 0], []] },
            { nombre: "todas en varilla 2", objetivo: [[], [], [2, 1, 0]] },
            { nombre: "una en varilla 0, dos en varilla 1", objetivo: [[1], [0, 2], []] },
            { nombre: "dos en varilla 0, una en varilla 2", objetivo: [[2, 1], [], [0]] },
        ],
        4: [
            { nombre: "dos y dos", objetivo: [[], [3, 1], [0, 2]] },
            { nombre: "tres en varilla 0, una en varilla 1", objetivo: [[2, 3, 1], [0], []] },
            { nombre: "una en varilla 0, tres en varilla 1", objetivo: [[3], [0, 2, 1], []] },
            { nombre: "todas en varilla 2", objetivo: [[], [], [1, 3, 0, 2]] },
            { nombre: "una, una, dos", objetivo: [[1], [0], [3, 2]] },
        ],
        5: [
            { nombre: "tres y dos", objetivo: [[1, 3, 4], [2, 0], []] },
            { nombre: "dos y tres", objetivo: [[4, 1], [0, 2, 3], []] },
            { nombre: "una y cuatro", objetivo: [[3], [0, 2, 1, 4], []] },
            { nombre: "todas en varilla 2", objetivo: [[], [], [3, 2, 4, 0, 1]] },
            { nombre: "dos, una, dos", objetivo: [[2, 4], [3], [1, 0]] },
        ]
    };

    function generarObjetivoValido() {
        const bolas = colores.slice(0, numBolas);
        const opciones = configuraciones[numBolas];
        if (!opciones) return [bolas, [], []];
        let seleccion;
        do {
            seleccion = opciones[Math.floor(Math.random() * opciones.length)];
        } while (JSON.stringify(seleccion.objetivo) === JSON.stringify([[0, 1, 2], [], []]) && numBolas === 3);
        const nuevoObjetivo = [[], [], []];
        for (let i = 0; i < 3; i++) {
            for (const pos of seleccion.objetivo[i] || []) {
                nuevoObjetivo[i].push(bolas[pos]);
            }
        }
        return nuevoObjetivo;
    }

    function mostrarMensajeEnCanvas(texto, esInfo = true, duration = 2000) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20`;
        msgDiv.innerHTML = `<div class="text-center px-4 py-2 rounded-full ${esInfo ? 'bg-blue-500' : 'bg-red-500'} text-white text-sm font-bold animate-pulse">${texto}</div>`;
        const canvasContainer = document.querySelector('#container .relative');
        if (canvasContainer) {
            canvasContainer.appendChild(msgDiv);
            setTimeout(() => msgDiv.remove(), duration);
        }
    }

    function mostrarObjetivoConMemoria() {
        return new Promise((resolve) => {
            objetivoVisible = true;
            render();
            mostrarMensajeEnCanvas(`Memoriza la configuración (3 segundos)`, true, 3000);
            setTimeout(() => {
                objetivoVisible = false;
                render();
                mostrarMensajeEnCanvas(`¡Ahora reproduce la configuración! Tienes ${TIEMPOS_NIVEL[nivel]} segundos`, true, 2000);
                resolve();
            }, 3000);
        });
    }

    function iniciarCuentaRegresiva() {
        if (countdownInterval) clearInterval(countdownInterval);
        let tiempoRestante = TIEMPOS_NIVEL[nivel];
        const updateCountdown = () => {
            let countdownDiv = document.getElementById('countdown-display');
            if (!countdownDiv) {
                countdownDiv = document.createElement('div');
                countdownDiv.id = 'countdown-display';
                countdownDiv.className = 'absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-30';
                const canvasContainer = document.querySelector('#container .relative');
                if (canvasContainer) canvasContainer.appendChild(countdownDiv);
            }
            countdownDiv.textContent = `⏱️ ${tiempoRestante}s`;
        };
        updateCountdown();
        countdownInterval = setInterval(() => {
            if (!juegoActivo) return;
            tiempoRestante--;
            updateCountdown();
            if (tiempoRestante <= 0) {
                clearInterval(countdownInterval);
                const cd = document.getElementById('countdown-display');
                if (cd) cd.remove();
                if (!nivelCompletado && juegoActivo) {
                    mostrarMensajeEnCanvas(`Tiempo agotado para el nivel ${nivel}`, false, 1500);
                    pasarAlSiguienteNivel();
                }
            }
        }, 1000);
    }

    function pasarAlSiguienteNivel() {
        const tiempoNivel = (Date.now() - inicioNivel) / 1000;
        tiempoPorNivel[nivel - 1] = tiempoNivel;
        movimientosPorNivel[nivel - 1] = movimientos;
        if (nivel < 3) {
            nivel++;
            numBolas = nivel === 2 ? 4 : 5;
            iniciarNivel();
        } else {
            finalizarTest();
        }
    }

    async function iniciarNivel() {
        nivelCompletado = false;
        inicioNivel = Date.now();
        if (countdownInterval) clearInterval(countdownInterval);
        const oldCd = document.getElementById('countdown-display');
        if (oldCd) oldCd.remove();
        objetivo = generarObjetivoValido();
        estado = [colores.slice(0, numBolas), [], []];
        movimientos = 0;
        seleccionada = null;
        await mostrarObjetivoConMemoria();
        if (juegoActivo) {
            render();
            if (status) status.textContent = `Nivel ${nivel}/3 (${numBolas} bolas) | Completados: ${movimientosPorNivel.filter(m => m !== undefined).length}`;
            iniciarCuentaRegresiva();
        }
    }

    function render() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="relative w-full h-full">
                <div class="flex flex-col gap-4 h-full p-3 relative z-10">
                    <div class="text-center">
                        <div class="text-xs text-slate-400">Nivel ${nivel}/3 (${numBolas} bolas) - Tiempo: ${TIEMPOS_NIVEL[nivel]}s</div>
                        <div class="text-xs text-slate-500">Completados: ${movimientosPorNivel.filter(m => m !== undefined).length}/2</div>
                        ${!objetivoVisible ? '<div class="text-xs text-amber-400 mt-1">🔒 Confía en tu memoria</div>' : '<div class="text-xs text-green-400 mt-1">👁️ Memoriza la posición</div>'}
                    </div>
                    <div class="text-center">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tu configuración</h3>
                        <div class="flex justify-center gap-3">
                            ${estado.map((varilla, i) => `
                                <div class="flex flex-col items-center">
                                    <div data-varilla="${i}" class="varilla w-16 sm:w-20 h-48 sm:h-56 bg-slate-800 rounded-b-2xl flex flex-col-reverse items-center pt-2 pb-1 border-t-4 ${seleccionada === i ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-blue-500'} cursor-pointer transition-all">
                                        ${varilla.map(bola => `<div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-md mb-1 ${nombresColores[bola]}"></div>`).join('')}
                                    </div>
                                    <div class="text-xs text-slate-500 mt-1">Varilla ${i + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="text-center ${!objetivoVisible ? 'opacity-40' : ''}">
                        <div class="text-center text-slate-600 text-xl">↓</div>
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Objetivo</h3>
                        <div class="flex justify-center gap-3">
                            ${objetivo.map((varilla, i) => `
                                <div class="flex flex-col items-center">
                                    <div class="w-16 sm:w-20 h-48 sm:h-56 bg-slate-700/50 rounded-b-2xl flex flex-col-reverse items-center pt-2 pb-1 border-t-4 border-slate-600">
                                        ${varilla.map(bola => `<div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full ${objetivoVisible ? `opacity-50 ${nombresColores[bola]}` : 'bg-gray-600'} mb-1"></div>`).join('')}
                                    </div>
                                    <div class="text-xs text-slate-500 mt-1">Varilla ${i + 1}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="text-center mt-2">
                        <div class="text-xl font-bold text-blue-400">${movimientos}</div>
                        <div class="text-xs text-slate-500">movimientos este nivel</div>
                    </div>
                </div>
            </div>
        `);
        document.querySelectorAll('[data-varilla]').forEach(el => {
            el.onclick = () => manejarVarilla(parseInt(el.dataset.varilla));
        });
    }

    function manejarVarilla(idx) {
        if (!juegoActivo || objetivoVisible) return;
        if (seleccionada === null) {
            if (estado[idx].length > 0) {
                seleccionada = idx;
                render();
            } else {
                mostrarMensajeEnCanvas("Varilla vacía", false, 1000);
            }
        } else {
            if (seleccionada !== idx) {
                const bola = estado[seleccionada].pop();
                if (bola && estado[idx].length < numBolas) {
                    estado[idx].push(bola);
                    movimientos++;
                    movimientosTotales++;
                    seleccionada = null;
                    render();
                    if (JSON.stringify(estado) === JSON.stringify(objetivo)) {
                        nivelCompletado = true;
                        if (countdownInterval) clearInterval(countdownInterval);
                        const cd = document.getElementById('countdown-display');
                        if (cd) cd.remove();
                        mostrarMensajeEnCanvas(`¡Nivel ${nivel} completado!`, true, 1500);
                        pasarAlSiguienteNivel();
                    }
                } else {
                    estado[seleccionada].push(bola);
                    seleccionada = null;
                    render();
                    mostrarMensajeEnCanvas("Varilla llena", false, 1000);
                }
            } else {
                seleccionada = null;
                render();
            }
        }
    }

    function calcularMovimientosOptimosPorNivel() {
        // Movimientos óptimos aproximados según la configuración
        const base = { 3: 4, 4: 6, 5: 8 };
        return base[numBolas] || 4;
    }

    function finalizarTest() {
        juegoActivo = false;
        if (countdownInterval) clearInterval(countdownInterval);

        // Niveles completados: aquellos donde se alcanzó el objetivo (movimientosPorNivel tiene valor)
        const nivelesCompletados = movimientosPorNivel.filter(m => m !== undefined).length;

        // Tiempo promedio solo de niveles completados (si hay)
        let tiempoPromedioNivel = 0;
        if (tiempoPorNivel.length > 0) {
            tiempoPromedioNivel = tiempoPorNivel.reduce((a, b) => a + b, 0) / tiempoPorNivel.length;
        } else {
            // Si no completó ningún nivel, usar tiempo total / 3 como aproximación
            const tiempoTotal = (Date.now() - inicioTest) / 1000;
            tiempoPromedioNivel = tiempoTotal / 3;
        }

        // Movimientos óptimos SEGÚN LOS NIVELES COMPLETADOS
        const movimientosOptimosPorNivel = [4, 6, 8];
        let totalOptimos = 0;
        for (let i = 0; i < nivelesCompletados; i++) {
            totalOptimos += movimientosOptimosPorNivel[i];
        }

        // Si no completó ningún nivel, totalOptimos se queda en 0
        let precision = 0;
        if (movimientosTotales > 0 && totalOptimos > 0) {
            precision = Math.min(100, Math.round((totalOptimos / movimientosTotales) * 100));
        } else if (nivelesCompletados === 0) {
            precision = 0; // Si no completó ninguno, precisión 0
        } else if (nivelesCompletados === 3 && movimientosTotales > 0) {
            precision = Math.min(100, Math.round((totalOptimos / movimientosTotales) * 100));
        } else if (nivelesCompletados === 3 && movimientosTotales === 0) {
            precision = 0; // No puede ser 100% sin mover
        }

        const habilidades = [];

        // MEMORIA DE TRABAJO: si no completó al menos 2 niveles (solo si hizo movimientos)
        if (nivelesCompletados < 2 && movimientosTotales > 0) {
            habilidades.push("memoria_trabajo");
        }

        // MEMORIA ESPACIAL: movimientos extra > 60% (más generoso)
        if (totalOptimos > 0) {
            const extra = Math.max(0, movimientosTotales - totalOptimos);
            const porcentajeExtra = (extra / totalOptimos) * 100;
            if (porcentajeExtra > 60) {
                habilidades.push("memoria_espacial");
            }
        }

        // PLANIFICACIÓN: si no completó los 3 niveles O movimientos extra > 100%
        if (nivelesCompletados < 3) {
            habilidades.push("planificacion");
        } else if (totalOptimos > 0 && (movimientosTotales / totalOptimos) > 2) {
            habilidades.push("planificacion");
        }

        // ATENCIÓN SOSTENIDA: tiempo promedio alto (> 15s) o empeoramiento claro entre niveles
        if (tiempoPromedioNivel > 15) {
            habilidades.push("atencion_sostenida");
        }
        if (tiempoPorNivel.length >= 3) {
            const t1 = tiempoPorNivel[0];
            const t3 = tiempoPorNivel[2];
            if (t3 > t1 * 2) {
                if (!habilidades.includes("atencion_sostenida")) habilidades.push("atencion_sostenida");
            }
        }


        callback({
            testId, timestamp: Date.now(),
            metrics: {
                completado: nivelesCompletados === 3 ? "Si" : "No",
                nivelAlcanzado: nivelesCompletados,
                movimientosTotales: movimientosTotales,
                tiempoPromedioNivel: Math.round(tiempoPromedioNivel * 10) / 10,
                precision: precision / 100, // Enviamos decimal (0.85 para 85%)
            },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
        if (status) status.textContent = nivelesCompletados === 3 ? "Test completado" : `Completaste ${nivelesCompletados}/3 niveles`;
    }

    startBtn.onclick = async () => {
        startBtn.classList.add("hidden");
        nivel = 1;
        numBolas = 3;
        movimientosTotales = 0;
        movimientosPorNivel = [];
        tiempoPorNivel = [];
        juegoActivo = true;
        inicioTest = Date.now();
        await iniciarNivel();
    };
}


// ======================================================
// 6. TAVEC (memoria_trabajo, planificacion, atencion_sostenida)
// ======================================================
function initTAVECLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const categorias = {
        frutas: ["manzana", "pera", "plátano", "naranja", "fresa", "melón", "sandía", "kiwi"],
        animales: ["perro", "gato", "ratón", "caballo", "vaca", "cerdo", "oveja", "conejo"],
        herramientas: ["martillo", "destornillador", "llave", "alicate", "sierra", "taladro", "tenaza", "clavo"]
    };
    let listaAprendizaje = [], listaInterferencia = [], listaReconocimiento = [];
    let ensayoActual = 1;
    let aciertosPorEnsayo = [];
    let recuerdoInmediato = 0, recuerdoDemorado = 0;
    let inicioTest = 0;

    function generarListas() {
        const todas = [...categorias.frutas, ...categorias.animales, ...categorias.herramientas];
        const shuffled = todas.sort(() => Math.random() - 0.5);
        listaAprendizaje = shuffled.slice(0, 16);
        const restantes = todas.filter(p => !listaAprendizaje.includes(p));
        listaInterferencia = restantes.sort(() => Math.random() - 0.5).slice(0, 6);
        const nuevas = todas.filter(p => !listaAprendizaje.includes(p) && !listaInterferencia.includes(p));
        listaReconocimiento = [
            ...listaAprendizaje.slice(0, 8),
            ...listaInterferencia.slice(0, 4),
            ...nuevas.slice(0, 4)
        ].sort(() => Math.random() - 0.5);
    }

    function autoFocus() {
        setTimeout(() => {
            const input = document.querySelector("input, textarea");
            if (input) input.focus();
        }, 100);
    }

    function renderEnsayo() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Ensayo ${ensayoActual}/5 - Memoriza estas palabras:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaAprendizaje.map(p => `<span class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center text-blue-700 dark:text-blue-300">${p}</span>`).join('')}
                </div>
                <button id="siguiente" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">He memorizado</button>
            </div>
        `);
        autoFocus();
        document.getElementById("siguiente").onclick = () => renderRecuerdoEnsayo();
    }

    function renderRecuerdoEnsayo() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Ensayo ${ensayoActual} - Escribe las palabras que recuerdes (separadas por comas):</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Continuar</button>
            </div>
        `);
        autoFocus();
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            const aciertos = palabras.filter(p => listaAprendizaje.includes(p)).length;
            aciertosPorEnsayo.push(aciertos);
            if (ensayoActual < 5) {
                ensayoActual++;
                renderEnsayo();
            } else {
                renderInterferencia();
            }
        };
    }

    function renderInterferencia() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Lista de interferencia - Memoriza estas palabras:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaInterferencia.map(p => `<span class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded text-center text-blue-700 dark:text-blue-300">${p}</span>`).join('')}
                </div>
                <button id="siguiente" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Continuar</button>
            </div>
        `);
        autoFocus();
        document.getElementById("siguiente").onclick = () => renderRecuerdoInmediato();
    }

    function renderRecuerdoInmediato() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Recuerdo inmediato - Escribe las palabras de la lista ORIGINAL que recuerdes:</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Continuar</button>
            </div>
        `);
        autoFocus();
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            recuerdoInmediato = palabras.filter(p => listaAprendizaje.includes(p)).length;
            renderEspera();
        };
    }

    function renderEspera() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl max-w-md mx-auto">
                <p class="text-xl text-blue-600 dark:text-blue-400 mb-4">Espera 20 segundos...</p>
                <div id="contador" class="text-3xl font-bold text-blue-500">20</div>
            </div>
        `);
        let seg = 20;
        const interval = setInterval(() => {
            seg--;
            const span = document.getElementById("contador");
            if (span) span.innerText = seg;
            if (seg <= 0) {
                clearInterval(interval);
                renderRecuerdoDemorado();
            }
        }, 1000);
    }

    function renderRecuerdoDemorado() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Recuerdo demorado - Escribe las palabras de la lista ORIGINAL que recuerdes:</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Continuar</button>
            </div>
        `);
        autoFocus();
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            recuerdoDemorado = palabras.filter(p => listaAprendizaje.includes(p)).length;
            renderReconocimiento();
        };
    }

    function renderReconocimiento() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl mx-auto">
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-4">Reconocimiento - Marca las que estaban en la lista original:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaReconocimiento.map((p, idx) => `<label class="flex items-center gap-2 text-blue-700 dark:text-blue-300"><input type="checkbox" value="${p}" data-idx="${idx}" class="reco-check"> ${p}</label>`).join('')}
                </div>
                <button id="finalizar" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Finalizar</button>
            </div>
        `);
        autoFocus();
        document.getElementById("finalizar").onclick = () => {
            const checks = document.querySelectorAll('.reco-check:checked');
            const seleccionadas = Array.from(checks).map(cb => cb.value);
            const aciertosRec = seleccionadas.filter(p => listaAprendizaje.includes(p)).length;
            const falsos = seleccionadas.filter(p => !listaAprendizaje.includes(p)).length;
            const totalAprend = aciertosPorEnsayo.reduce((a, b) => a + b, 0);
            const olvido = recuerdoInmediato - recuerdoDemorado;

            const habilidades = [];
            if (aciertosPorEnsayo[4] < 8) habilidades.push("memoria_trabajo");
            if (olvido > 3) habilidades.push("memoria_trabajo");
            if (totalAprend < 50) habilidades.push("planificacion");
            if (recuerdoDemorado < 6) habilidades.push("atencion_sostenida");
            if (falsos > 3 || olvido > 4) habilidades.push("flexibilidad_cognitiva");

            const precision = totalAprend / 80;
            callback({
                testId, timestamp: Date.now(),
                metrics: {
                    aprendizajeTotal: totalAprend,
                    ultimoEnsayo: aciertosPorEnsayo[4],
                    recuerdoInmediato,
                    recuerdoDemorado,
                    olvido,
                    reconocimientoAciertos: aciertosRec,
                    reconocimientoFalsos: falsos,
                    precision
                },
                habilidadesDebiles: habilidades
            });
            startBtn.classList.remove("hidden");
        };
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        generarListas();
        ensayoActual = 1;
        aciertosPorEnsayo = [];
        recuerdoInmediato = recuerdoDemorado = 0;
        inicioTest = performance.now();
        renderEnsayo();
        if (status) status.textContent = "TAVEC: Aprendizaje verbal - Ensayo 1/5";
    };
}

// ======================================================
// 7. MEC (Mini-Examen Cognoscitivo) - COMPLETO
// ======================================================
function initMECLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let puntuacion = 0;
    let indice = 0;
    let inicioTest = 0;
    let tiemposRespuesta = [];
    let palabrasRecuerdo = [];
    let secuenciaPalabras = [];

    // ========== VARIABLES ALEATORIAS ==========
    const bancosPalabras = [
        ["PESETA", "CABALLO", "MANZANA"],
        ["SILLA", "MESA", "PERRO"],
        ["CIELO", "MARTILLO", "NARANJA"],
        ["ZAPATO", "GATO", "FLOR"],
        ["CAMINO", "MADRID", "AZUL"]
    ];
    const palabrasAleatorias = bancosPalabras[Math.floor(Math.random() * bancosPalabras.length)];
    palabrasRecuerdo = [...palabrasAleatorias];

    const letrasPosibles = ["P", "M", "C", "A", "S"];
    const letraElegida = letrasPosibles[Math.floor(Math.random() * letrasPosibles.length)];
    const antónimosBase = { "ALTO": "BAJO", "GRANDE": "PEQUEÑO", "RÁPIDO": "LENTO", "FUERTE": "DÉBIL", "CLARO": "OSCURO" };
    const palabraAntonimo = Object.keys(antónimosBase)[Math.floor(Math.random() * Object.keys(antónimosBase).length)];
    const antonimoCorrecto = antónimosBase[palabraAntonimo];

    const secuenciaPalabrasMostrar = ["CASA", "PERRO", "SOL", "LUNA", "FLOR", "CIELO", "AGUA", "FUEGO"].sort(() => 0.5 - Math.random()).slice(0, 3);
    secuenciaPalabras = secuenciaPalabrasMostrar;

    // Normalización de texto
    function normalizar(texto) {
        return texto.toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, "");
    }

    // Obtener datos automáticos del entorno
    function obtenerDatosEntorno() {
        const hora = new Date().getHours();
        let momento = "";
        if (hora >= 6 && hora < 12) momento = "mañana";
        else if (hora >= 12 && hora < 20) momento = "tarde";
        else momento = "noche";
        const esDia = (hora >= 6 && hora < 20) ? "día" : "noche";
        let navegador = "desconocido";
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("chrome")) navegador = "chrome";
        else if (ua.includes("firefox")) navegador = "firefox";
        else if (ua.includes("safari")) navegador = "safari";
        else if (ua.includes("edg")) navegador = "edge";
        const esMovil = window.matchMedia("(max-width: 768px)").matches ? "móvil" : "ordenador";
        let conexion = navigator.connection?.effectiveType || "desconocida";
        if (conexion === "wifi") conexion = "wifi";
        else if (conexion === "ethernet") conexion = "cable";
        return { momento, esDia, navegador, esMovil, conexion };
    }
    const datosEntorno = obtenerDatosEntorno();

    function autoFocus() {
        setTimeout(() => {
            const input = document.querySelector("input, select, textarea");
            if (input) input.focus();
        }, 100);
    }

    // ========== FUNCIONES DE UI CON CUADRO ADAPTATIVO ==========
    function mostrarInput(pregunta, onRespuesta) {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl mx-auto">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">${pregunta}</p>
                    <input id="resp" type="text" 
                           class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600">
                    <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Responder</button>
                </div>
            </div>
        `);
        autoFocus();
        document.getElementById("next").onclick = () => onRespuesta(document.getElementById("resp").value.trim());
    }

    function mostrarSelect(pregunta, opciones, onRespuesta) {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl mx-auto">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">${pregunta}</p>
                    <select id="resp" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600">
                        ${opciones.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                    <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Responder</button>
                </div>
            </div>
        `);
        autoFocus();
        document.getElementById("next").onclick = () => onRespuesta(document.getElementById("resp").value);
    }

    function mostrarConDesaparicion(contenidoHtml, callback) {
        container.innerHTML = makeResponsiveContainer(`
            <div class="w-full max-w-2xl mx-auto">
                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 text-center">
                    ${contenidoHtml}
                </div>
            </div>
        `);
        autoFocus();
        setTimeout(() => {
            callback();
        }, 3000);
    }

    // ========== SECCIONES ==========
    const secciones = [
        // 1. ORIENTACIÓN TEMPORAL (5 puntos)
        {
            nombre: "Orientación temporal",
            puntMax: 5,
            ejecutar: (cb) => {
                const hoy = new Date();
                const año = hoy.getFullYear().toString();
                const mesNum = hoy.getMonth() + 1;
                let estacion;
                if (mesNum >= 3 && mesNum <= 5) estacion = "primavera";
                else if (mesNum >= 6 && mesNum <= 8) estacion = "verano";
                else if (mesNum >= 9 && mesNum <= 11) estacion = "otoño";
                else estacion = "invierno";
                const mesTexto = hoy.toLocaleString('es', { month: 'long' });
                const diaSemana = hoy.toLocaleString('es', { weekday: 'long' });
                const diaMes = hoy.getDate().toString();
                let aciertos = 0;
                let paso = 0;
                function siguiente() {
                    if (paso === 0) {
                        mostrarInput("¿En qué año estamos?", (v) => { if (v === año) aciertos++; paso++; siguiente(); });
                    } else if (paso === 1) {
                        mostrarSelect("¿En qué estación del año estamos?", ["primavera", "verano", "otoño", "invierno"], (v) => { if (v === estacion) aciertos++; paso++; siguiente(); });
                    } else if (paso === 2) {
                        mostrarSelect("¿En qué mes estamos?", ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], (v) => { if (normalizar(v) === normalizar(mesTexto)) aciertos++; paso++; siguiente(); });
                    } else if (paso === 3) {
                        mostrarSelect("¿Qué día de la semana es hoy?", ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"], (v) => { if (normalizar(v) === normalizar(diaSemana)) aciertos++; paso++; siguiente(); });
                    } else if (paso === 4) {
                        mostrarInput("¿Qué día del mes es hoy?", (v) => { if (parseInt(v) === parseInt(diaMes)) aciertos++; cb(aciertos); });
                    }
                }
                siguiente();
            }
        },
        // 2. ORIENTACIÓN ESPACIAL (4 puntos)
        {
            nombre: "Orientación espacial",
            puntMax: 4,
            ejecutar: (cb) => {
                let aciertos = 0;
                let paso = 0;
                function siguiente() {
                    if (paso === 0) {
                        mostrarSelect("¿Qué navegador estás usando?", ["chrome", "firefox", "safari", "edge", "otro"], (v) => { if (v === datosEntorno.navegador) aciertos++; paso++; siguiente(); });
                    } else if (paso === 1) {
                        mostrarSelect("¿Qué dispositivo estás usando?", ["móvil", "ordenador"], (v) => { if (v === datosEntorno.esMovil) aciertos++; paso++; siguiente(); });
                    } else if (paso === 2) {
                        mostrarSelect("¿Es de día o de noche?", ["día", "noche"], (v) => { if (v === datosEntorno.esDia) aciertos++; paso++; siguiente(); });
                    } else if (paso === 3) {
                        mostrarSelect("¿Qué tipo de conexión usas?", ["wifi", "cable", "4g", "3g", "desconocida"], (v) => { if (v === datosEntorno.conexion) aciertos++; cb(aciertos); });
                    }
                }
                siguiente();
            }
        },
        // 3. FIJACIÓN (palabras aleatorias)
        {
            nombre: "Fijación",
            puntMax: 3,
            ejecutar: (cb) => {
                mostrarConDesaparicion(`
                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Memoriza estas palabras:</p>
                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">${palabrasRecuerdo.join(" - ")}</div>
                `, () => {
                    const opciones = [...palabrasRecuerdo, "PERRO", "GATO", "SOL", "LUNA", "COCHE", "CASA", "MESA", "FLOR"];
                    const opcionesUnicas = [...new Set(opciones)].sort(() => 0.5 - Math.random());
                    container.innerHTML = makeResponsiveContainer(`
                        <div class="w-full max-w-2xl mx-auto">
                            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                                <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">¿Qué palabras recordabas?</p>
                                <div class="grid grid-cols-2 gap-3 mb-4">
                                    ${opcionesUnicas.map(p => `<label class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><input type="checkbox" value="${p}" class="palabra-check"> ${p}</label>`).join('')}
                                </div>
                                <button id="next" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Comprobar</button>
                            </div>
                        </div>
                    `);
                    autoFocus();
                    document.getElementById("next").onclick = () => {
                        const checks = document.querySelectorAll('.palabra-check:checked');
                        const seleccionadas = Array.from(checks).map(cb => cb.value);
                        let aciertos = 0;
                        if (seleccionadas.includes(palabrasRecuerdo[0])) aciertos++;
                        if (seleccionadas.includes(palabrasRecuerdo[1])) aciertos++;
                        if (seleccionadas.includes(palabrasRecuerdo[2])) aciertos++;
                        cb(aciertos);
                    };
                });
            }
        },
        // 4. CÁLCULO (restas de 7 desde 100)
        {
            nombre: "Concentración y Cálculo",
            puntMax: 5,
            ejecutar: (cb) => {
                let aciertos = 0;
                let current = 100;
                let step = 0;
                function siguiente() {
                    if (step >= 5) { cb(aciertos); return; }
                    container.innerHTML = makeResponsiveContainer(`
                        <div class="w-full max-w-2xl mx-auto">
                            <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                                <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Resta 7 a ${current}</p>
                                <input id="resp" type="number" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600">
                                <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Responder</button>
                            </div>
                        </div>
                    `);
                    autoFocus();
                    const btn = document.getElementById("next");
                    const input = document.getElementById("resp");
                    btn.onclick = () => {
                        const val = parseInt(input.value);
                        const esperado = current - 7;
                        if (val === esperado) aciertos++;
                        current = esperado;
                        step++;
                        siguiente();
                    };
                }
                siguiente();
            }
        },
        // 5. MEMORIA DIFERIDA (recordar palabras iniciales)
        {
            nombre: "Memoria diferida",
            puntMax: 3,
            ejecutar: (cb) => {
                const opciones = [...palabrasRecuerdo, "PERRO", "GATO", "SOL", "LUNA", "COCHE", "CASA", "MESA", "FLOR"];
                const opcionesUnicas = [...new Set(opciones)].sort(() => 0.5 - Math.random());
                container.innerHTML = makeResponsiveContainer(`
                    <div class="w-full max-w-2xl mx-auto">
                        <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                            <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">¿Recuerdas las tres palabras del principio?</p>
                            <div class="grid grid-cols-2 gap-3 mb-4">
                                ${opcionesUnicas.map(p => `<label class="flex items-center gap-2 text-slate-700 dark:text-slate-300"><input type="checkbox" value="${p}" class="palabra-check-dif"> ${p}</label>`).join('')}
                            </div>
                            <button id="next" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Comprobar</button>
                        </div>
                    </div>
                `);
                autoFocus();
                document.getElementById("next").onclick = () => {
                    const checks = document.querySelectorAll('.palabra-check-dif:checked');
                    const seleccionadas = Array.from(checks).map(cb => cb.value);
                    let aciertos = 0;
                    if (seleccionadas.includes(palabrasRecuerdo[0])) aciertos++;
                    if (seleccionadas.includes(palabrasRecuerdo[1])) aciertos++;
                    if (seleccionadas.includes(palabrasRecuerdo[2])) aciertos++;
                    cb(aciertos);
                };
            }
        },
        // 6. LENGUAJE
        {
            nombre: "Lenguaje",
            puntMax: 7,
            ejecutar: (cb) => {
                let puntos = 0;
                let paso = 0;
                function siguiente() {
                    if (paso === 0) {
                        mostrarConDesaparicion(`
                            <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Repite esta secuencia de palabras en el mismo orden:</p>
                            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">${secuenciaPalabras.join(" → ")}</div>
                        `, () => {
                            container.innerHTML = makeResponsiveContainer(`
                                <div class="w-full max-w-2xl mx-auto">
                                    <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                                        <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Escribe las palabras en el mismo orden (separadas por espacios):</p>
                                        <textarea id="resp" rows="3" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600"></textarea>
                                        <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Comprobar</button>
                                    </div>
                                </div>
                            `);
                            autoFocus();
                            document.getElementById("next").onclick = () => {
                                const texto = document.getElementById("resp").value.trim().toUpperCase().split(/\s+/);
                                if (texto[0] === secuenciaPalabras[0] && texto[1] === secuenciaPalabras[1] && texto[2] === secuenciaPalabras[2]) puntos += 2;
                                paso++; siguiente();
                            };
                        });
                    } else if (paso === 1) {
                        container.innerHTML = makeResponsiveContainer(`
                            <div class="w-full max-w-2xl mx-auto">
                                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Escribe una palabra que empiece por la letra "${letraElegida}"</p>
                                    <input id="resp" type="text" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600">
                                    <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Comprobar</button>
                                </div>
                            </div>
                        `);
                        autoFocus();
                        document.getElementById("next").onclick = () => {
                            const palabra = document.getElementById("resp").value.trim().toUpperCase();
                            if (palabra.length > 1 && palabra.startsWith(letraElegida) && !palabra.includes(" ")) puntos += 2;
                            paso++; siguiente();
                        };
                    } else if (paso === 2) {
                        container.innerHTML = makeResponsiveContainer(`
                            <div class="w-full max-w-2xl mx-auto">
                                <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Escribe el antónimo (lo contrario) de "${palabraAntonimo}"</p>
                                    <input id="resp" type="text" class="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-300 dark:border-slate-600">
                                    <button id="next" class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">Comprobar</button>
                                </div>
                            </div>
                        `);
                        autoFocus();
                        document.getElementById("next").onclick = () => {
                            const palabra = document.getElementById("resp").value.trim().toUpperCase();
                            if (palabra === antonimoCorrecto) puntos += 3;
                            cb(puntos);
                        };
                    }
                }
                siguiente();
            }
        }
    ];

    function runSeccion() {
        if (indice >= secciones.length) return finalizarTest();
        const sec = secciones[indice];
        if (status) status.textContent = `${sec.nombre} (${indice + 1}/${secciones.length})`;
        const inicio = performance.now();
        sec.ejecutar((puntos) => {
            tiemposRespuesta.push(performance.now() - inicio);
            puntuacion += puntos;
            indice++;
            runSeccion();
        });
    }

    function finalizarTest() {
        const max = 30;
        const precision = puntuacion / max;
        const tiempoMedio = tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length;
        const habilidades = [];

        if (puntuacion < 23) habilidades.push("memoria_trabajo", "atencion_sostenida");
        else if (puntuacion < 26) habilidades.push("memoria_trabajo");
        if (puntuacion < 20) habilidades.push("planificacion");
        if (tiempoMedio > 15000) habilidades.push("velocidad_cognitiva");
        if (puntuacion < 18 && tiempoMedio > 12000) habilidades.push("flexibilidad_cognitiva");
        if (puntuacion < 15) habilidades.push("control_inhibitorio");

        callback({
            testId,
            timestamp: Date.now(),
            metrics: {
                puntuacionTotal: puntuacion,
                maximoPosible: max,
                porcentaje: precision,
                precision,
                tiempoMedioRespuestaMs: Math.round(tiempoMedio)
            },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Test completado. Puntuación: ${puntuacion}/${max}`;
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        puntuacion = 0;
        indice = 0;
        tiemposRespuesta = [];
        inicioTest = performance.now();
        runSeccion();
        if (status) status.textContent = "Mini-examen Cognoscitivo - Comenzando...";
    };
}

// ======================================================
// 8. STROOP (control_inhibitorio, velocidad_cognitiva, atencion_dividida)
// ======================================================
function initStroopLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const colores = [
        { nombre: "rojo", code: "#ef4444", class: "bg-red-500 hover:bg-red-600" },
        { nombre: "verde", code: "#22c55e", class: "bg-green-500 hover:bg-green-600" },
        { nombre: "azul", code: "#3b82f6", class: "bg-blue-500 hover:bg-blue-600" },
        { nombre: "amarillo", code: "#eab308", class: "bg-yellow-500 hover:bg-yellow-600" }
    ];
    const palabras = ["ROJO", "VERDE", "AZUL", "AMARILLO"];
    let ensayos = [];
    let indice = 0;
    let resultados = [];
    let inicioTest = 0;

    function generarEnsayo() {
        const palabra = palabras[Math.floor(Math.random() * 4)];
        const tinta = colores[Math.floor(Math.random() * 4)];
        const congruente = (palabra.toLowerCase() === tinta.nombre);
        return { palabra, tinta, congruente };
    }

    function iniciarEnsayo() {
        if (indice >= ensayos.length) return finalizarTest();
        const e = ensayos[indice];
        const inicioRespuesta = performance.now();

        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col items-center justify-center min-h-[400px] p-4">
                <div class="text-center mb-8">
                    <div class="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6 px-4 py-6 rounded-2xl transition-all"
                         style="color: ${e.tinta.code}; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                        ${e.palabra}
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Ignora la palabra. Elige el COLOR de la tinta.</p>
                </div>
                <div class="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
                    ${colores.map(c => `
                        <button data-color="${c.nombre}" 
                                class="${c.class} px-4 py-3 rounded-xl text-white font-bold text-lg shadow-md transition-all active:scale-95">
                            ${c.nombre}
                        </button>
                    `).join('')}
                </div>
                <div class="text-center mt-6 text-sm text-slate-400">
                    Ensayo ${indice + 1}/${ensayos.length}
                </div>
            </div>
        `);

        const handler = (ev) => {
            const btn = ev.target.closest('[data-color]');
            if (!btn) return;
            const respuesta = btn.dataset.color;
            const correcto = (respuesta === e.tinta.nombre);
            const tiempo = performance.now() - inicioRespuesta;
            resultados.push({ correcto, tiempo, congruente: e.congruente });
            indice++;
            iniciarEnsayo();
        };
        container.onclick = handler;

        // Auto-focus para que Enter funcione
        const firstBtn = container.querySelector('button');
        if (firstBtn) firstBtn.focus();
    }

    function finalizarTest() {
        const total = resultados.length;
        const aciertos = resultados.filter(r => r.correcto).length;
        const aciertosCongruentes = resultados.filter(r => r.congruente && r.correcto).length;
        const aciertosIncongruentes = resultados.filter(r => !r.congruente && r.correcto).length;
        const totalCongruentes = resultados.filter(r => r.congruente).length;
        const totalIncongruentes = resultados.filter(r => !r.congruente).length;
        const precisionCongruentes = totalCongruentes ? aciertosCongruentes / totalCongruentes : 1;
        const precisionIncongruentes = totalIncongruentes ? aciertosIncongruentes / totalIncongruentes : 1;
        const tiempos = resultados.map(r => r.tiempo);
        const tiempoMedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;

        const habilidades = [];

        // Control inhibitorio: baja precisión en ensayos incongruentes
        if (precisionIncongruentes < 0.6) habilidades.push("control_inhibitorio");

        // Velocidad cognitiva: tiempo medio alto
        if (tiempoMedio > 1500) habilidades.push("velocidad_cognitiva");

        // Atención dividida: gran diferencia entre congruente e incongruente
        if (precisionCongruentes - precisionIncongruentes > 0.3) habilidades.push("atencion_dividida");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos, total,
                precision: aciertos / total,
                precisionCongruentes,
                precisionIncongruentes,
                tiempoMedioRespuestaMs: Math.round(tiempoMedio),
                diferenciaCongruenteIncongruente: Math.round((precisionCongruentes - precisionIncongruentes) * 100)
            },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        ensayos = Array.from({ length: 20 }, () => generarEnsayo());
        indice = 0;
        resultados = [];
        inicioTest = performance.now();
        iniciarEnsayo();
        if (status) status.textContent = "Stroop: Elige el COLOR de la tinta (ignora la palabra)";
    };
}

// ======================================================
// 9. DIGIT SPAN (memoria_trabajo, atencion_sostenida)
// ======================================================
function initDigitSpanLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let nivel = 2;
    let errores = 0;
    let spanMaximo = 0;
    let inicioTest = 0;

    function generarDigitos(n) {
        return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
    }

    function normalizarEntrada(texto) {
        const limpio = texto.replace(/[\s,;.-]/g, '');
        return limpio.split('').map(c => parseInt(c, 10));
    }

    function autoFocus() {
        setTimeout(() => {
            const input = document.getElementById("respuesta");
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    function mostrarFeedbackNumerico(acertado, mensajeExtra) {
        const fb = document.createElement('div');
        fb.className = `fixed top-1/3 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-white text-base font-bold z-50 ${acertado ? 'bg-green-500' : 'bg-red-500'} animate-pulse`;
        fb.textContent = acertado ? '✓ Correcto' : `✗ ${mensajeExtra || 'Incorrecto'}`;
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 1000);
    }

    function mostrarDigitos(digitos, callbackFn) {
        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col items-center justify-center min-h-[300px] p-4">
                <div class="text-center mb-8">
                    <p class="text-sm text-blue-500 mb-2">Nivel ${nivel} | ${errores}/2 errores</p>
                    <div class="text-5xl sm:text-7xl lg:text-8xl font-bold text-center text-blue-600 dark:text-blue-400 tracking-wide space-x-2">
                        ${digitos.join(' ')}
                    </div>
                </div>
                <div class="text-center text-blue-500 text-sm">
                    Memoriza la secuencia...
                </div>
            </div>
        `);

        setTimeout(() => {
            container.innerHTML = makeResponsiveContainer(`
                <div class="flex flex-col items-center justify-center min-h-[300px] p-4">
                    <p class="text-xl mb-4 text-blue-600 dark:text-blue-400">Escribe los números en el <strong>mismo orden</strong>:</p>
                    <input id="respuesta" type="tel" inputmode="numeric" pattern="[0-9]*" 
                           class="w-full max-w-md p-4 text-center rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-2xl tracking-wider"
                           placeholder="Ej: 3528"
                           autocomplete="off">
                    <div class="flex gap-3 mt-6">
                        <button id="enviar" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition">Comprobar</button>
                        <button id="borrar" class="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition">Borrar</button>
                    </div>
                </div>
            `);

            autoFocus();

            const input = document.getElementById("respuesta");
            const btnEnviar = document.getElementById("enviar");
            const btnBorrar = document.getElementById("borrar");

            if (input) {
                input.setAttribute('inputmode', 'numeric');
                input.setAttribute('pattern', '[0-9]*');
            }

            btnBorrar.onclick = () => {
                if (input) input.value = '';
                autoFocus();
            };

            btnEnviar.onclick = () => {
                const respuestaRaw = input.value.trim();
                if (!respuestaRaw) {
                    mostrarFeedbackNumerico(false, "Escribe los números");
                    return;
                }

                const respuesta = normalizarEntrada(respuestaRaw);
                const correcto = JSON.stringify(respuesta) === JSON.stringify(digitos);
                callbackFn(correcto);
            };

            input.addEventListener("keypress", (e) => {
                if (e.key === "Enter") btnEnviar.click();
                if (!/[0-9]/.test(e.key) && e.key !== "Enter" && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                    e.preventDefault();
                }
            });
        }, 3000);
    }

    function iniciarNivel() {
        if (errores >= 2) return finalizarTest();

        const digitos = generarDigitos(nivel);

        mostrarDigitos(digitos, (correcto) => {
            if (correcto) {
                mostrarFeedbackNumerico(true);
                spanMaximo = nivel;
                nivel++;
                if (status) status.textContent = `¡Correcto! Siguiente nivel: ${nivel} dígitos`;
                setTimeout(() => iniciarNivel(), 500);
            } else {
                errores++;
                mostrarFeedbackNumerico(false, `Era: ${digitos.join(' ')}`);
                if (status) status.textContent = `Error (${errores}/2). Nivel actual: ${nivel}`;
                if (errores < 2) {
                    setTimeout(() => iniciarNivel(), 1500);
                } else {
                    setTimeout(() => finalizarTest(), 1000);
                }
            }
        });
    }

    function finalizarTest() {
        const habilidades = [];
        if (spanMaximo < 5) habilidades.push("memoria_trabajo");
        if (spanMaximo < 4 || errores >= 2) habilidades.push("atencion_sostenida");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                spanMaximo,
                errores,
                nivelAlcanzado: spanMaximo,
                precision: spanMaximo / 10
            },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Test completado. Span máximo: ${spanMaximo}`;
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2;
        errores = 0;
        spanMaximo = 0;
        inicioTest = performance.now();
        if (status) status.textContent = "Digit Span: Memoriza la secuencia de números";
        iniciarNivel();
    };
}

// ======================================================
// 10. TRAIL MAKING TEST (flexibilidad, velocidad, coordinación, atención dividida)
// ======================================================
function initTMTLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let fase = 'A';
    let elementos = [];
    let ordenCorrectoTotal = [];
    let ordenPulsados = [];
    let siguienteIndex = 0;
    let inicioTest = 0;
    let inicioFase = 0;
    let tiempos = { A: 0, B: 0 };
    let numeroInicio = 1;
    let letraInicio = 'A';
    let errorTimeout = null;
    let erroresFaseA = 0;
    let erroresFaseB = 0;
    let clicsFueraA = 0;
    let clicsFueraB = 0;

    function generarPosicionAleatoria() {
        return { x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 };
    }

    function generarElementosFaseA() {
        const elementosArr = [];
        for (let i = 1; i <= 8; i++) {
            elementosArr.push({
                valor: i.toString(),
                ...generarPosicionAleatoria(),
                completado: false
            });
        }
        ordenCorrectoTotal = [];
        for (let i = numeroInicio; i <= 8; i++) ordenCorrectoTotal.push(i.toString());
        for (let i = 1; i < numeroInicio; i++) ordenCorrectoTotal.push(i.toString());
        return elementosArr;
    }
    function generarElementosFaseB() {
        const elementosArr = [];
        const secuenciaCompleta = ['1', 'A', '2', 'B', '3', 'C', '4', 'D'];

        // Generar todos los elementos (siempre todos)
        for (let i = 0; i < secuenciaCompleta.length; i++) {
            elementosArr.push({
                valor: secuenciaCompleta[i],
                ...generarPosicionAleatoria(),
                completado: false
            });
        }

        // Orden correcto: desde letraInicio hasta el final, luego desde el principio hasta letraInicio-1
        const idxInicio = secuenciaCompleta.findIndex(v => v === letraInicio);
        ordenCorrectoTotal = [];
        for (let i = idxInicio; i < secuenciaCompleta.length; i++) ordenCorrectoTotal.push(secuenciaCompleta[i]);
        for (let i = 0; i < idxInicio; i++) ordenCorrectoTotal.push(secuenciaCompleta[i]);

        return elementosArr;
    }

    function getValorEsperado() {
        if (siguienteIndex >= ordenCorrectoTotal.length) return null;
        return ordenCorrectoTotal[siguienteIndex];
    }

    function dibujarLineas() {
        const canvas = document.getElementById('tmt-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (ordenPulsados.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (let i = 0; i < ordenPulsados.length - 1; i++) {
            const desde = ordenPulsados[i];
            const hasta = ordenPulsados[i + 1];
            if (desde && hasta) {
                const x1 = (desde.x / 100) * canvas.width;
                const y1 = (desde.y / 100) * canvas.height;
                const x2 = (hasta.x / 100) * canvas.width;
                const y2 = (hasta.y / 100) * canvas.height;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    }

    function mostrarFeedbackError(elementoDiv) {
        if (errorTimeout) clearInterval(errorTimeout);
        elementoDiv.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        elementoDiv.classList.add('bg-red-500', 'scale-95', 'ring-4', 'ring-red-300');
        let flashCount = 0;
        errorTimeout = setInterval(() => {
            flashCount++;
            if (flashCount % 2 === 0) {
                elementoDiv.classList.remove('bg-red-500');
                elementoDiv.classList.add('bg-blue-500');
            } else {
                elementoDiv.classList.remove('bg-blue-500');
                elementoDiv.classList.add('bg-red-500');
            }
            if (flashCount >= 3) {
                clearInterval(errorTimeout);
                errorTimeout = null;
                elementoDiv.classList.remove('bg-red-500', 'scale-95', 'ring-4', 'ring-red-300');
                elementoDiv.classList.add('bg-blue-500');
            }
        }, 150);
    }

    function mostrarFeedbackAcierto(elementoDiv) {
        elementoDiv.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        elementoDiv.classList.add('bg-green-500', 'ring-4', 'ring-green-300');
        setTimeout(() => {
            elementoDiv.classList.remove('ring-4', 'ring-green-300');
        }, 300);
    }

    // En initTMTLogic, modifica la función mostrarInstruccionInicio:

    function mostrarInstruccionInicio(callback) {
        let mensaje = '';
        let elementoInicio = '';
        if (fase === 'A') {
            elementoInicio = numeroInicio.toString();
            mensaje = `Empieza por el número <span class="text-6xl font-black block mt-2">${numeroInicio}</span>
                   <p class="text-sm text-slate-300 mt-4">Después sigue la secuencia ascendente: ${numeroInicio} → ... → 8 → 1 → ... hasta ${numeroInicio - 1}</p>`;
        } else {
            elementoInicio = letraInicio;
            const ordenMostrar = ordenCorrectoTotal.slice(0, 5).join(' → ');
            mensaje = `Empieza por la letra/número <span class="text-6xl font-black block mt-2">${letraInicio}</span>
                   <p class="text-sm text-slate-300 mt-4">Secuencia: alterna números y letras en orden ascendente</p>
                   <p class="text-xs text-slate-400 mt-2">Ejemplo: 1 → A → 2 → B → 3 → C...</p>`;
        }

        container.innerHTML = makeResponsiveContainer(`
        <div class="flex flex-col items-center justify-center h-full min-h-[400px] bg-slate-900 rounded-2xl">
            <div class="text-center text-white p-8">
                <div class="animate-pulse">
                    <p class="text-xl mb-4">🎯 Haz clic en el primer elemento</p>
                    ${mensaje}
                </div>
                <div class="mt-8 p-4 bg-blue-500/20 rounded-xl inline-block">
                    <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold mx-auto shadow-lg">
                        ${elementoInicio}
                    </div>
                    <p class="text-xs text-slate-300 mt-2">Elemento inicial</p>
                </div>
                <p class="text-sm text-slate-400 mt-6" id="cuenta-regresiva">⏱️ El test comenzará en 3 segundos</p>
            </div>
        </div>
    `);

        let segundos = 3;
        const intervalo = setInterval(() => {
            segundos--;
            const cuentaDiv = document.getElementById("cuenta-regresiva");
            if (cuentaDiv && segundos > 0) {
                cuentaDiv.textContent = `⏱️ El test comenzará en ${segundos} segundos`;
            }
            if (segundos <= 0) {
                clearInterval(intervalo);
                // Resaltar el primer elemento visualmente antes de empezar
                setTimeout(() => {
                    callback();
                }, 100);
            }
        }, 1000);
    }

    // También modifica la función renderFase para resaltar el siguiente elemento:

    function renderFase() {
        const valorEsperado = getValorEsperado();

        container.innerHTML = `
        <div class="w-full h-full flex flex-col p-2">
            <div class="flex justify-between items-center mb-2 px-1">
                <div class="text-sm font-bold ${fase === 'A' ? 'text-blue-500' : 'text-green-500'}">
                    Fase ${fase}
                </div>
                <div id="tmt-progreso" class="text-sm text-slate-500 dark:text-slate-400">
                    Progreso: ${siguienteIndex}/${ordenCorrectoTotal.length}
                </div>
            </div>
            <div class="text-center mb-2">
                <p class="text-xs text-slate-400">Siguiente: <span class="font-bold text-lg text-yellow-400">${valorEsperado || 'FIN'}</span></p>
            </div>
            <div id="tmt-play-area" class="relative flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden" style="min-height:260px;">
                <canvas id="tmt-canvas" class="absolute top-0 left-0 w-full h-full pointer-events-none" style="z-index:1;"></canvas>
                <div class="relative w-full h-full" style="z-index:2;">
                    ${elementos.map(el => {
            const esCompletado = el.completado === true;
            const esSiguiente = !esCompletado && el.valor === valorEsperado;
            return `
                            <div data-valor="${el.valor}"
                                 data-x="${el.x}" data-y="${el.y}"
                                 class="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all text-xs sm:text-sm font-bold shadow-md
                                        ${esCompletado ? 'bg-green-500 text-white opacity-80 cursor-default' :
                    (esSiguiente ? 'bg-yellow-500 text-black hover:bg-yellow-600 ring-4 ring-yellow-300 scale-110' : 'bg-blue-500 text-white hover:bg-blue-600')}"
                                 style="left:${el.x}%;top:${el.y}%;transform:translate(-50%,-50%);z-index:3;touch-action:manipulation;">
                                ${el.valor}
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        </div>
    `;

        setTimeout(() => dibujarLineas(), 50);
        asignarEventos();
        // ... resto del código
    }
    function renderFase() {
        container.innerHTML = `
            <div class="w-full h-full flex flex-col p-2">
                <div class="flex justify-between items-center mb-2 px-1">
                    <div class="text-sm font-bold ${fase === 'A' ? 'text-blue-500' : 'text-green-500'}">
                        Fase ${fase}
                    </div>
                    <div id="tmt-progreso" class="text-sm text-slate-500 dark:text-slate-400">
                        Progreso: ${siguienteIndex}/${ordenCorrectoTotal.length}
                    </div>
                </div>
                <div id="tmt-play-area" class="relative flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden" style="min-height:260px;">
                    <canvas id="tmt-canvas" class="absolute top-0 left-0 w-full h-full pointer-events-none" style="z-index:1;"></canvas>
                    <div class="relative w-full h-full" style="z-index:2;">
                        ${elementos.map(el => {
            const esCompletado = el.completado === true;
            return `
                                <div data-valor="${el.valor}"
                                     data-x="${el.x}" data-y="${el.y}"
                                     class="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors text-xs sm:text-sm font-bold shadow-md
                                            ${esCompletado ? 'bg-green-500 text-white opacity-80 cursor-default' : 'bg-blue-500 text-white hover:bg-blue-600'}"
                                     style="left:${el.x}%;top:${el.y}%;transform:translate(-50%,-50%);z-index:3;touch-action:manipulation;">
                                    ${el.valor}
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => dibujarLineas(), 50);
        asignarEventos();

        // Single outside-click listener per render (tracks precision metric)
        const playArea = document.getElementById('tmt-play-area');
        if (playArea) {
            playArea.addEventListener('click', (e) => {
                if (!e.target.closest('[data-valor]')) {
                    if (fase === 'A') clicsFueraA++;
                    else clicsFueraB++;
                    const msg = document.createElement('div');
                    msg.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 z-20';
                    msg.innerHTML = `<div class="px-4 py-2 rounded-full text-white text-sm font-bold bg-yellow-500 animate-pulse">¡Haz clic en los círculos!</div>`;
                    playArea.appendChild(msg);
                    setTimeout(() => msg.remove(), 800);
                }
            });
        }
    }

    function asignarEventos() {
        document.querySelectorAll('[data-valor]').forEach(el => {
            if (el.classList.contains('cursor-default')) return;

            el.onclick = () => {
                const valorEsperadoActual = getValorEsperado();
                const valorClickeado = el.dataset.valor;
                const elemento = elementos.find(e => e.valor === valorClickeado);
                if (!elemento || elemento.completado) return;

                if (valorClickeado === valorEsperadoActual) {
                    elemento.completado = true;
                    ordenPulsados.push({ x: elemento.x, y: elemento.y, valor: elemento.valor });
                    mostrarFeedbackAcierto(el);
                    siguienteIndex++;

                    // Update progress counter live
                    const progresoEl = document.getElementById('tmt-progreso');
                    if (progresoEl) progresoEl.textContent = `Progreso: ${siguienteIndex}/${ordenCorrectoTotal.length}`;
                    // Redraw connecting lines after each correct click
                    setTimeout(() => dibujarLineas(), 10);

                    if (siguienteIndex >= ordenCorrectoTotal.length) {
                        tiempos[fase] = performance.now() - inicioFase;
                        if (fase === 'A') {
                            fase = 'B';
                            const secuenciaCompleta = ['1', 'A', '2', 'B', '3', 'C', '4', 'D'];
                            letraInicio = secuenciaCompleta[Math.floor(Math.random() * secuenciaCompleta.length)];
                            elementos = generarElementosFaseB();
                            siguienteIndex = 0;
                            ordenPulsados = [];
                            inicioFase = performance.now();
                            mostrarInstruccionInicio(() => renderFase());
                            if (status) status.textContent = `TMT-B: Desde ${letraInicio}`;
                        } else {
                            finalizarTest();
                        }
                    }
                } else {
                    mostrarFeedbackError(el);
                    if (fase === 'A') erroresFaseA++;
                    else erroresFaseB++;
                }
            };
        });
    }

    function iniciarTest() {
        // Número de inicio A: puede ser del 1 al 8
        numeroInicio = Math.floor(Math.random() * 8) + 1;  // 1-8
        fase = 'A';
        elementos = generarElementosFaseA();
        siguienteIndex = 0;
        ordenPulsados = [];
        erroresFaseA = 0;
        erroresFaseB = 0;
        clicsFueraA = 0;
        clicsFueraB = 0;
        inicioTest = performance.now();
        inicioFase = performance.now();
        mostrarInstruccionInicio(() => renderFase());
        if (status) status.textContent = `TMT-A: Desde el ${numeroInicio}`;
    }
    function finalizarTest() {
        const tiempoA = tiempos.A || 0;
        const tiempoB = tiempos.B || 0;
        const diferencia = tiempoB - tiempoA;
        const erroresA = erroresFaseA || 0;
        const erroresB = erroresFaseB || 0;
        const totalErrores = erroresA + erroresB;
        const totalClicsFuera = (clicsFueraA || 0) + (clicsFueraB || 0);
        const tiempoTotal = tiempoA + tiempoB;

        const habilidades = [];

        // ========== 1. VELOCIDAD COGNITIVA ==========
        // Tiempo lento en tarea simple
        if (tiempoA > 40000) habilidades.push("velocidad_cognitiva");

        // ========== 2. FLEXIBILIDAD COGNITIVA ==========
        // Tiempo lento en tarea compleja O muchos errores en fase B
        if (tiempoB > 80000) habilidades.push("flexibilidad_cognitiva");
        if (erroresB > 5) habilidades.push("flexibilidad_cognitiva");

        // ========== 3. ATENCIÓN DIVIDIDA ==========
        // Gran diferencia entre fase B y fase A (cuesta cambiar)
        if (diferencia > 35000) habilidades.push("atencion_dividida");

        // ========== 4. COORDINACIÓN VISOMOTORA ==========
        // Muchos clics fuera de los círculos (mala puntería)
        if (totalClicsFuera > 8) habilidades.push("coordinacion_visomotora");
        // O muchos errores en fase A que no son de impulsividad (tiempo normal pero falla)
        if (erroresA > 6 && tiempoA < 50000) habilidades.push("coordinacion_visomotora");

        // ========== 5. CONTROL INHIBITORIO ==========
        // Rápido pero comete muchos errores (impulsividad)
        if (tiempoA < 35000 && erroresA > 3) habilidades.push("control_inhibitorio");
        if (tiempoB < 70000 && erroresB > 4) habilidades.push("control_inhibitorio");

        // ========== 6. ATENCIÓN SOSTENIDA ==========
        // Muchos errores totales O tiempo total muy alto
        if (totalErrores > 12) habilidades.push("atencion_sostenida");
        if (tiempoTotal > 150000) habilidades.push("atencion_sostenida");

        // Eliminar duplicados
        const habilidadesUnicas = [...new Set(habilidades)];

        console.log(`📊 TMT: TiempoA=${Math.round(tiempoA / 1000)}s, ErroresA=${erroresA}, ClicsFueraA=${clicsFueraA || 0}`);
        console.log(`📊 TMT: TiempoB=${Math.round(tiempoB / 1000)}s, ErroresB=${erroresB}, ClicsFueraB=${clicsFueraB || 0}`);
        console.log(`📊 Habilidades: ${habilidadesUnicas.length ? habilidadesUnicas.join(', ') : 'NINGUNA'}`);

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                tiempoA: Math.round(tiempoA),
                tiempoB: Math.round(tiempoB),
                diferencia: Math.round(diferencia),
                erroresA: erroresA,
                erroresB: erroresB,
                totalErrores: totalErrores,
                clicsFueraA: clicsFueraA || 0,
                clicsFueraB: clicsFueraB || 0,
                precision: Math.max(0, 1 - (totalErrores / 25) - (totalClicsFuera / 50))
            },
            habilidadesDebiles: habilidadesUnicas
        });

        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Test completado. TMT-A: ${Math.round(tiempoA / 1000)}s (${erroresA} err, ${clicsFueraA || 0} fuera), TMT-B: ${Math.round(tiempoB / 1000)}s (${erroresB} err, ${clicsFueraB || 0} fuera)`;
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        iniciarTest();
    };


}
// ======================================================
// 11. SYMBOL SEARCH (velocidad_cognitiva, atencion_selectiva, coordinacion_visomotora)
// ======================================================
function initSymbolSearchLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const simbolos = ['★', '♠', '♥', '♦', '♣', '●', '▲', '■'];
    let items = [];
    let indice = 0;
    let aciertos = 0;
    let inicioTest = 0;
    let tiempos = [];
    let testFinalizado = false;
    let respuestas = []; // Guardar las respuestas del usuario

    function generarItem(numEnsayo) {
        const objetivo = simbolos[Math.floor(Math.random() * simbolos.length)];
        const distractores = simbolos.filter(s => s !== objetivo);

        let numOpciones;
        if (numEnsayo <= 6) {
            numOpciones = 2;
        } else if (numEnsayo <= 14) {
            numOpciones = 3;
        } else {
            numOpciones = 4;
        }

        const distractoresSeleccionados = [];
        while (distractoresSeleccionados.length < numOpciones - 1) {
            const d = distractores[Math.floor(Math.random() * distractores.length)];
            if (!distractoresSeleccionados.includes(d)) {
                distractoresSeleccionados.push(d);
            }
        }

        let opciones = [objetivo, ...distractoresSeleccionados];
        opciones.sort(() => Math.random() - 0.5);
        const respuestaCorrecta = opciones.findIndex(o => o === objetivo);

        return { objetivo, opciones, respuestaCorrecta, seleccion: null };
    }

    function deshabilitarJuego() {
        testFinalizado = true;
        const botones = document.querySelectorAll('[data-opcion]');
        botones.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.classList.add('opacity-50', 'cursor-default');
        });
    }

    function mostrarItem() {
        if (testFinalizado) return;
        if (indice >= 20) {
            finalizarTest();
            return;
        }

        const item = items[indice];
        const inicioRespuesta = performance.now();

        const numOpciones = item.opciones.length;
        let gridClass = '';
        if (numOpciones === 2) gridClass = 'grid-cols-2';
        else if (numOpciones === 3) gridClass = 'grid-cols-3';
        else gridClass = 'grid-cols-2 sm:grid-cols-4';

        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col items-center justify-center min-h-[400px] p-4">
                <div class="text-center mb-8">
                    <p class="text-lg text-slate-500 dark:text-slate-400 mb-4">Ensayo ${indice + 1}/20 
                        ${numOpciones === 2 ? '🔵 Fácil' : (numOpciones === 3 ? '🟡 Medio' : '🔴 Difícil')}
                    </p>
                    <div class="text-3xl mb-4 text-slate-900 dark:text-white">Busca el símbolo:</div>
                    <div class="text-7xl font-bold mb-8 p-6 bg-slate-200 dark:bg-slate-700 rounded-2xl inline-block">${item.objetivo}</div>
                </div>
                <div class="grid ${gridClass} gap-4 max-w-2xl mx-auto">
                    ${item.opciones.map((opcion, idx) => `
                        <button data-opcion="${idx}" class="text-6xl p-4 bg-slate-700 hover:bg-slate-600 rounded-2xl transition-all active:scale-95 shadow-lg">${opcion}</button>
                    `).join('')}
                </div>
            </div>
        `);

        const firstBtn = container.querySelector('button');
        if (firstBtn) firstBtn.focus();

        const handler = (e) => {
            if (testFinalizado) return;
            const btn = e.target.closest('[data-opcion]');
            if (!btn) return;
            const seleccion = parseInt(btn.dataset.opcion);
            const tiempo = performance.now() - inicioRespuesta;
            tiempos.push(tiempo);

            // Guardar la selección del usuario
            items[indice].seleccion = seleccion;

            if (seleccion === item.respuestaCorrecta) aciertos++;
            indice++;
            mostrarItem();
        };

        container.onclick = handler;
    }

    function finalizarTest() {
        if (testFinalizado) return;
        testFinalizado = true;
        deshabilitarJuego();

        const precision = aciertos / items.length;
        const tiempoMedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
        const tiempoTotal = performance.now() - inicioTest;

        // Calcular aciertos por nivel de dificultad
        let aciertosFaciles = 0;
        let aciertosMedios = 0;
        let aciertosDificiles = 0;

        for (let i = 0; i < items.length; i++) {
            const esCorrecto = items[i].seleccion === items[i].respuestaCorrecta;
            if (i < 6) {
                if (esCorrecto) aciertosFaciles++;
            } else if (i < 14) {
                if (esCorrecto) aciertosMedios++;
            } else {
                if (esCorrecto) aciertosDificiles++;
            }
        }

        const habilidades = [];

        // VELOCIDAD COGNITIVA - SOLO si es LENTO
        if (tiempoMedio > 3000) habilidades.push("velocidad_cognitiva");

        // ATENCIÓN SELECTIVA - Baja precisión
        if (precision < 0.7) habilidades.push("atencion_selectiva");

        // COORDINACIÓN VISOMOTORA - Muy lento
        if (tiempoMedio > 4000) habilidades.push("coordinacion_visomotora");

        // ATENCIÓN SOSTENIDA - Empeora en niveles difíciles
        if (aciertosDificiles < 2 && aciertosFaciles > 4) {
            habilidades.push("atencion_sostenida");
        }

        const habilidadesUnicas = [...new Set(habilidades)];

        console.log(`📊 Symbol Search: ${aciertos}/20 aciertos (${Math.round(precision * 100)}%), tiempo medio: ${Math.round(tiempoMedio)}ms`);
        console.log(`📊 Por nivel: Fáciles=${aciertosFaciles}/6, Medios=${aciertosMedios}/8, Difíciles=${aciertosDificiles}/6`);
        console.log(`📊 Habilidades: ${habilidadesUnicas.length ? habilidadesUnicas.join(', ') : 'NINGUNA'}`);

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos,
                total: items.length,
                precision: Math.round(precision * 100) / 100,
                aciertosFaciles,
                aciertosMedios,
                aciertosDificiles,
                tiempoMedioRespuestaMs: Math.round(tiempoMedio),
                tiempoTotalMs: Math.round(tiempoTotal)
            },
            habilidadesDebiles: habilidadesUnicas
        });

        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Symbol Search: ${aciertos}/20 aciertos (${Math.round(precision * 100)}%)`;
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        testFinalizado = false;
        items = [];
        for (let i = 1; i <= 20; i++) {
            items.push(generarItem(i));
        }
        indice = 0;
        aciertos = 0;
        tiempos = [];
        respuestas = [];
        inicioTest = performance.now();
        mostrarItem();
        if (status) status.textContent = "Symbol Search: Elige el símbolo igual al objetivo";
    };
}

// ======================================================
// 12. N-BACK (memoria_trabajo, atencion_sostenida, control_inhibitorio, velocidad_cognitiva)
// ======================================================
function initNBackLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let nivel = 1;
    let secuencia = [];
    let indice = 0;
    let aciertos = 0, comisiones = 0, omisiones = 0;
    let tiemposReaccion = [];
    let testActivo = true;
    let puedeResponder = false;
    let respondidoEnEsteEnsayo = false;
    let temporizadorNumero = null;
    let tiempoInicioEnsayo = 0;
    let enTransicion = false;

    const TOTAL_ESTIMULOS_POR_NIVEL = 20;
    const TIEMPOS_VISUALIZACION = { 1: 1800, 2: 1500 };
    const TIEMPO_TRANSICION = 100;

    function generarSecuencia() {
        const seq = [];
        for (let i = 0; i < nivel; i++) {
            seq.push(Math.floor(Math.random() * 10));
        }
        for (let i = nivel; i < TOTAL_ESTIMULOS_POR_NIVEL; i++) {
            const esObjetivo = Math.random() < 0.5;
            if (esObjetivo) {
                seq.push(seq[i - nivel]);
            } else {
                let nuevo;
                do {
                    nuevo = Math.floor(Math.random() * 10);
                } while (nuevo === seq[i - nivel]);
                seq.push(nuevo);
            }
        }
        return seq;
    }

    function actualizarContadores() {
        const contadorDiv = document.getElementById("contador-info");
        if (contadorDiv) {
            contadorDiv.innerHTML = `✅ ${aciertos} | ⚠️ ${comisiones} | ❌ ${omisiones}`;
        }
    }

    function mostrarFeedback(acertado) {
        const fb = document.createElement('div');
        fb.className = `fixed top-1/3 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-bold z-50 ${acertado ? 'bg-green-500' : 'bg-red-500'}`;
        fb.textContent = acertado ? '✓' : '✗';
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 400);
    }

    function deshabilitarBoton() {
        const btn = document.getElementById("btn-coincide");
        if (btn) {
            btn.disabled = true;
            btn.classList.add("opacity-50", "cursor-not-allowed");
        }
    }

    function habilitarBoton() {
        const btn = document.getElementById("btn-coincide");
        if (btn) {
            btn.disabled = false;
            btn.classList.remove("opacity-50", "cursor-not-allowed");
        }
    }

    function procesarRespuesta() {
        if (!puedeResponder || respondidoEnEsteEnsayo || !testActivo || enTransicion) return;

        respondidoEnEsteEnsayo = true;
        if (temporizadorNumero) clearTimeout(temporizadorNumero);

        const esObjetivo = (indice >= nivel && secuencia[indice - nivel] === secuencia[indice]);
        const tiempo = performance.now() - tiempoInicioEnsayo;
        tiemposReaccion.push(tiempo);

        if (esObjetivo) {
            aciertos++;
            mostrarFeedback(true);
        } else {
            comisiones++;
            mostrarFeedback(false);
        }

        actualizarContadores();
        puedeResponder = false;
        deshabilitarBoton();

        setTimeout(() => {
            indice++;
            mostrarSiguiente();
        }, 400);
    }

    function mostrarNumero(numero, esObjetivo) {
        const tiempoVisualizacion = TIEMPOS_VISUALIZACION[nivel];
        puedeResponder = true;
        respondidoEnEsteEnsayo = false;
        tiempoInicioEnsayo = performance.now();

        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col items-center justify-center min-h-[400px] p-4">
                <div class="text-center mb-2">
                    <p class="text-sm text-slate-400">N-Back (${nivel === 1 ? '1-back' : '2-back'})</p>
                    <div id="contador-info" class="text-xs text-slate-500 mb-4">✅ ${aciertos} | ⚠️ ${comisiones} | ❌ ${omisiones}</div>
                </div>
                <div id="numero-container" class="w-full flex justify-center items-center mb-6 min-h-[150px]">
                    <div id="numero-display" class="text-8xl sm:text-9xl font-bold text-white p-4 bg-slate-800 rounded-2xl inline-block shadow-lg"
                         style="transition: opacity 0.1s ease; opacity: 1;">
                        ${numero}
                    </div>
                </div>
                <button id="btn-coincide" class="w-full max-w-xs py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-2xl transition-all active:scale-95">
                    🔄 COINCIDE
                </button>
                <p class="text-sm text-slate-400 mt-4">
                    ${nivel === 1 ? "¿Es igual al número anterior?" : "¿Es igual al de hace 2 posiciones?"}
                </p>
            </div>
        `);

        actualizarContadores();
        habilitarBoton();

        const btn = document.getElementById("btn-coincide");
        btn.onclick = procesarRespuesta;

        temporizadorNumero = setTimeout(() => {
            if (!respondidoEnEsteEnsayo && testActivo && !enTransicion) {
                respondidoEnEsteEnsayo = true;
                if (esObjetivo) {
                    omisiones++;
                    mostrarFeedback(false);
                }
                actualizarContadores();
                puedeResponder = false;
                deshabilitarBoton();

                setTimeout(() => {
                    indice++;
                    mostrarSiguiente();
                }, 400);
            }
        }, tiempoVisualizacion);
    }

    function mostrarSiguiente() {
        if (!testActivo) return;

        if (indice >= secuencia.length) {
            if (nivel === 1) {
                nivel = 2;
                mostrarTransicion("✅ Nivel 1 superado", "Ahora: ¿igual al de hace 2 posiciones?").then(() => {
                    aciertos = 0;
                    comisiones = 0;
                    omisiones = 0;
                    tiemposReaccion = [];
                    indice = 0;
                    secuencia = generarSecuencia();
                    mostrarSiguiente();
                });
            } else {
                finalizarTest();
            }
            return;
        }

        const esObjetivo = (indice >= nivel && secuencia[indice - nivel] === secuencia[indice]);
        const numero = secuencia[indice];

        // Si no es el primer elemento, hacer la transición
        if (indice > 0) {
            enTransicion = true;
            deshabilitarBoton();

            const numeroDisplay = document.getElementById("numero-display");
            if (numeroDisplay) {
                numeroDisplay.style.opacity = '0';
                setTimeout(() => {
                    mostrarNumero(numero, esObjetivo);
                    enTransicion = false;
                }, TIEMPO_TRANSICION);
                return;
            }
        }

        mostrarNumero(numero, esObjetivo);
    }

    function mostrarTransicion(mensaje, subtitulo) {
        return new Promise((resolve) => {
            container.innerHTML = makeResponsiveContainer(`
                <div class="flex flex-col items-center justify-center min-h-[400px] bg-slate-800 rounded-2xl p-6 text-center">
                    <p class="text-2xl font-bold text-white mb-2">${mensaje}</p>
                    <p class="text-md text-slate-300">${subtitulo}</p>
                    <p class="text-xs text-slate-400 mt-4">Comenzando en 2 segundos...</p>
                </div>
            `);
            setTimeout(resolve, 2000);
        });
    }

    function finalizarTest() {
        testActivo = false;
        enTransicion = false;

        const totalRespuestas = aciertos + comisiones + omisiones;
        const precision = totalRespuestas ? aciertos / totalRespuestas : 0;
        const tiempoMedio = tiemposReaccion.length ? tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length : 0;

        const habilidades = [];

        if (precision < 0.65) habilidades.push("memoria_trabajo");
        if (aciertos < 8) habilidades.push("atencion_sostenida");
        if (comisiones > 5) habilidades.push("control_inhibitorio");
        if (omisiones > 5) habilidades.push("atencion_sostenida");
        if (tiempoMedio > 1300) habilidades.push("velocidad_cognitiva");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                nivelAlcanzado: nivel,
                aciertos,
                comisiones,
                omisiones,
                precision: Math.round(precision * 100) / 100,
                tiempoMedioReaccionMs: Math.round(tiempoMedio)
            },
            habilidadesDebiles: [...new Set(habilidades)]
        });

        startBtn.classList.remove("hidden");
        if (status) status.textContent = `N-Back: ${aciertos} aciertos, ${comisiones} comisiones, ${omisiones} omisiones`;
    }

    startBtn.onclick = async () => {
        startBtn.classList.add("hidden");
        testActivo = true;
        nivel = 1;
        aciertos = 0;
        comisiones = 0;
        omisiones = 0;
        tiemposReaccion = [];
        enTransicion = false;
        await mostrarTransicion("🧠 Test N-Back", "Pulsa COINCIDE si el número es igual al anterior");
        secuencia = generarSecuencia();
        indice = 0;
        mostrarSiguiente();
        if (status) status.textContent = "N-Back (1‑back) – Pulsa COINCIDE cuando corresponda";
    };
}


// ======================================================
// 13. GO/NO-GO (control_inhibitorio, atencion_sostenida, velocidad_cognitiva)
// ======================================================
function initGoNoGoLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let estímulos = [];
    let indice = 0;
    let aciertos = 0, comisiones = 0, omisiones = 0;
    let tiempos = [];
    let inicioTest = 0;
    let puedeResponder = true;
    let tiempoInicioEstímulo = 0;
    let testActivo = true;
    let temporizadorEstímulo = null;

    const TOTAL_ESTIMULOS = 30;
    const TIEMPO_RESPUESTA = 1000;

    function generarSecuencia() {
        const seq = [];
        for (let i = 0; i < TOTAL_ESTIMULOS; i++) {
            seq.push(Math.random() < 0.7);
        }
        return seq;
    }

    function mostrarFeedback(acertado) {
        const fb = document.createElement('div');
        fb.className = `fixed top-1/3 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-bold z-50 ${acertado ? 'bg-green-500' : 'bg-red-500'}`;
        fb.textContent = acertado ? '✓' : '✗';
        document.body.appendChild(fb);
        setTimeout(() => fb.remove(), 400);
    }

    function procesarRespuesta() {
        if (!puedeResponder || !testActivo) return;

        const esGo = estímulos[indice];
        const tiempo = performance.now() - tiempoInicioEstímulo;
        tiempos.push(tiempo);

        if (esGo) {
            aciertos++;
            mostrarFeedback(true);
        } else {
            comisiones++;
            mostrarFeedback(false);
        }

        puedeResponder = false;
        if (temporizadorEstímulo) clearTimeout(temporizadorEstímulo);

        // Siguiente estímulo después de 400ms
        setTimeout(() => {
            indice++;
            mostrarSiguiente();
        }, 400);
    }

    function mostrarSiguiente() {
        if (!testActivo) return;
        if (indice >= estímulos.length) {
            finalizarTest();
            return;
        }

        const esGo = estímulos[indice];
        const letra = esGo ? 'X' : 'O';
        const restantes = estímulos.length - indice;

        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col items-center justify-center min-h-[400px] p-4">
                <div class="text-center mb-6">
                    <p class="text-sm text-slate-400 mb-2">Go/No-Go</p>
                    <p class="text-xs text-slate-500 mb-3">Restantes: ${restantes} | ✅ ${aciertos} | ⚠️ ${comisiones} | ❌ ${omisiones}</p>
                    <div id="letra-container" class="text-8xl sm:text-9xl font-bold text-white mb-6 p-4 bg-slate-800 rounded-2xl inline-block shadow-lg"
                         style="transition: opacity 0.1s ease;">
                        ${letra}
                    </div>
                </div>
                <div class="w-full max-w-xs">
                    <button id="btn-pulsar" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-2xl transition-all active:scale-95">
                        🔘 PULSAR
                    </button>
                </div>
            </div>
        `);

        // Hacer el efecto de desaparición/aparición solo si no es el primero
        const letraContainer = document.getElementById("letra-container");
        if (indice > 0 && letraContainer) {
            letraContainer.style.opacity = '0';
            setTimeout(() => {
                letraContainer.style.opacity = '1';
            }, 100);
        }

        const btn = document.getElementById("btn-pulsar");
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");
        btn.onclick = procesarRespuesta;

        tiempoInicioEstímulo = performance.now();
        puedeResponder = true;

        temporizadorEstímulo = setTimeout(() => {
            if (puedeResponder && testActivo) {
                const esGoActual = estímulos[indice];
                if (esGoActual) {
                    omisiones++;
                    mostrarFeedback(false);
                }
                puedeResponder = false;

                setTimeout(() => {
                    indice++;
                    mostrarSiguiente();
                }, 400);
            }
        }, TIEMPO_RESPUESTA);
    }

    function finalizarTest() {
        testActivo = false;

        const totalRespuestas = aciertos + comisiones + omisiones;
        const precision = totalRespuestas > 0 ? aciertos / totalRespuestas : 0;
        const rtMedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;

        const habilidades = [];

        if (comisiones > 3) habilidades.push("control_inhibitorio");
        if (omisiones > 5) habilidades.push("atencion_sostenida");
        if (rtMedio > 700) habilidades.push("velocidad_cognitiva");

        const habilidadesUnicas = [...new Set(habilidades)];

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos,
                comisiones,
                omisiones,
                precision: Math.round(precision * 100) / 100,
                tiempoMedioRespuestaMs: Math.round(rtMedio)
            },
            habilidadesDebiles: habilidadesUnicas
        });

        startBtn.classList.remove("hidden");
        if (status) status.textContent = `Go/No-Go: ${aciertos} aciertos, ${comisiones} comisiones, ${omisiones} omisiones`;
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        testActivo = true;
        estímulos = generarSecuencia();
        indice = 0;
        aciertos = 0;
        comisiones = 0;
        omisiones = 0;
        tiempos = [];
        inicioTest = performance.now();
        mostrarSiguiente();
        if (status) status.textContent = "Go/No-Go: Pulsa el botón solo cuando veas la letra X";
    };
}




// Pone el área del test en pantalla completa con botón de salida siempre visible
function enterTestFullscreen() {
    const container = document.getElementById('container');
    if (!container) return;

    // Evitar doble llamada
    if (document.querySelector('.test-exit-fullscreen')) return;

    const orig = {
        position: container.style.position || '',
        top: container.style.top || '',
        left: container.style.left || '',
        width: container.style.width || '',
        height: container.style.height || '',
        zIndex: container.style.zIndex || ''
    };

    function restaurar() {
        container.style.position = orig.position;
        container.style.top = orig.top;
        container.style.left = orig.left;
        container.style.width = orig.width;
        container.style.height = orig.height;
        container.style.zIndex = orig.zIndex;
        document.querySelector('.test-fullscreen-overlay')?.remove();
        document.querySelector('.test-exit-fullscreen')?.remove();
    }

    function aplicarOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'test-fullscreen-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9998;';
        document.body.appendChild(overlay);
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.zIndex = '9999';
    }

    function crearBotonSalir() {
        const exit = document.createElement('button');
        exit.textContent = '✕ Salir';
        exit.className = 'test-exit-fullscreen';
        exit.style.cssText = [
            'position:fixed', 'top:16px', 'right:16px', 'z-index:10000',
            'padding:10px 14px', 'border-radius:999px',
            'background:rgba(0,0,0,0.75)', 'color:#fff', 'border:0',
            'font-weight:700', 'cursor:pointer', 'font-size:1rem',
            'touch-action:manipulation'
        ].join(';');
        exit.addEventListener('click', () => {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { }
            }
            restaurar();
        });
        document.body.appendChild(exit);
    }

    // Intentar fullscreen nativo
    try {
        if (container.requestFullscreen) {
            container.requestFullscreen()
                .then(crearBotonSalir)
                .catch(() => { aplicarOverlay(); crearBotonSalir(); });
            document.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) restaurar();
            }, { once: true });
            return;
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
            crearBotonSalir();
            document.addEventListener('webkitfullscreenchange', () => {
                if (!document.webkitFullscreenElement) restaurar();
            }, { once: true });
            return;
        }
    } catch (e) { /* ignorar */ }

    // Fallback: overlay manual
    aplicarOverlay();
    crearBotonSalir();
}