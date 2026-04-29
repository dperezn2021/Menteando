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
            <div class="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-8">
                <!-- COLUMNA IZQUIERDA -->
                <div class="flex flex-col h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                    <div class="relative flex-1 bg-slate-900 min-h-[400px] flex items-center justify-center">
                        <div id="container" class="w-full h-full flex items-center justify-center"></div>
                    </div>
                    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <button id="start-btn" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all duration-200 shadow-md">
                            Iniciar ${test.nombre}
                        </button>
                    </div>
                </div>

                <!-- COLUMNA DERECHA -->
                <div class="flex flex-col gap-6">
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
            </div>

            <!-- RESULTADOS (mejorados) -->
            <div id="result" class="hidden mt-10"></div>
        </div>
    `;

    lanzarLogicaDelTest(testId);
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
        spanMaximo: 'Span máximo',
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
        
        // Scroll suave a resultados
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

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
// 1. CORSI (responsivo)
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
            <div class="grid grid-cols-3 gap-2 max-w-md mx-auto">
                ${Array(9).fill().map((_, i) => `
                    <div data-id="${i}" class="aspect-square rounded-xl bg-slate-700 cursor-pointer hover:bg-slate-600 transition-all"></div>
                `).join('')}
            </div>
        `);
    }

    function iluminarSecuencia(seq, callbackFn) {
        const bloques = container.querySelectorAll("[data-id]");
        let i = 0;
        puedeResponder = false;
        const interval = setInterval(() => {
            bloques.forEach(b => b.classList.remove("bg-blue-500"));
            if (i === seq.length) {
                clearInterval(interval);
                setTimeout(() => {
                    puedeResponder = true;
                    callbackFn();
                }, 300);
                return;
            }
            bloques[seq[i]].classList.add("bg-blue-500");
            i++;
        }, 600);
    }

    function iniciarNivel() {
        if (bloqueo) return;
        actualizarStatus();
        renderBloques();
        secuencia = generarSecuencia(nivel);
        erroresPorNivel[nivel] = erroresPorNivel[nivel] || 0;

        iluminarSecuencia(secuencia, () => {
            let respuesta = [];
            const clickHandler = (e) => {
                if (!puedeResponder) return;
                const id = e.target.closest("[data-id]")?.dataset.id;
                if (id === undefined) return;
                respuesta.push(Number(id));
                if (respuesta.length === secuencia.length) {
                    puedeResponder = false;
                    if (respuesta.join() === secuencia.join()) {
                        nivel++;
                        iniciarNivel();
                    } else {
                        errores++;
                        erroresPorNivel[nivel]++;
                        if (errores >= 2) finalizarTest();
                        else iniciarNivel();
                    }
                }
            };
            container.onclick = clickHandler;
        });
    }

    function finalizarTest() {
        bloqueo = true;
        container.onclick = null;
        const spanMaximo = nivel - 1;
        const tiempoTotal = performance.now() - inicioTest;
        const habilidades = [];
        if (spanMaximo < 4) habilidades.push("memoria_espacial");
        if (errores >= 2) habilidades.push("memoria_trabajo");
        callback({
            testId, timestamp: Date.now(),
            metrics: { spanMaximo, errores, precision: spanMaximo / (spanMaximo + errores) || 0, tiempoTotalMs: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2; errores = 0; erroresPorNivel = {}; tiemposRespuesta = []; inicioTest = performance.now(); bloqueo = false;
        iniciarNivel();
    };
}


// ======================================================
// 2. D2 (responsivo)
// ======================================================
function initD2Logic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let lineaActual = 0;
    const totalLineas = 5;
    const tiempoPorLinea = 20000;
    const itemsPorLinea = 50;
    let timer = null;
    let totalProcesados = 0;
    let aciertos = 0, erroresComision = 0, erroresOmision = 0;
    let inicioTest = 0;

    function generarLinea() {
        const linea = [];
        for (let i = 0; i < itemsPorLinea; i++) {
            const letra = Math.random() < 0.5 ? 'd' : 'p';
            const rayas = Math.floor(Math.random() * 4) + 1;
            linea.push({ letra, rayas });
        }
        return linea;
    }

    function renderLinea(linea) {
        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-wrap gap-1 sm:gap-2 w-full justify-center max-h-[60vh] overflow-y-auto p-2">
                ${linea.map((stim, idx) => `
                    <div data-idx="${idx}" class="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-slate-600 cursor-pointer text-white text-sm sm:text-lg select-none hover:bg-slate-700 transition">${stim.letra}<sub>${stim.rayas}</sub></div>
                `).join('')}
            </div>
        `, "max-h-[60vh]");
    }

    function procesarLinea(linea, marcados) {
        linea.forEach((stim, idx) => {
            const esObjetivo = (stim.letra === 'd' && stim.rayas === 2);
            const marcado = marcados.includes(idx);
            if (marcado) {
                if (esObjetivo) aciertos++;
                else erroresComision++;
            } else {
                if (esObjetivo) erroresOmision++;
            }
        });
        totalProcesados += marcados.length + erroresOmision;
    }

    function iniciarLinea() {
        if (lineaActual >= totalLineas) return finalizarTest();
        if (status) status.textContent = `Línea ${lineaActual + 1}/${totalLineas}`;
        const linea = generarLinea();
        renderLinea(linea);
        let marcados = [];
        const clickHandler = (e) => {
            const div = e.target.closest('[data-idx]');
            if (!div) return;
            const idx = parseInt(div.dataset.idx);
            if (marcados.includes(idx)) {
                marcados = marcados.filter(i => i !== idx);
                div.classList.remove('bg-blue-600');
            } else {
                marcados.push(idx);
                div.classList.add('bg-blue-600');
            }
        };
        container.onclick = clickHandler;
        timer = setTimeout(() => {
            procesarLinea(linea, marcados);
            lineaActual++;
            iniciarLinea();
        }, tiempoPorLinea);
    }

    function finalizarTest() {
        clearTimeout(timer);
        container.onclick = null;
        const tiempoTotal = performance.now() - inicioTest;
        const velocidad = totalProcesados / (totalLineas * (tiempoPorLinea / 1000));
        const precisionSelectiva = aciertos / (aciertos + erroresComision) || 0;
        const habilidades = [];
        if (precisionSelectiva < 0.7) habilidades.push("atencion_selectiva");
        if (velocidad < 4) habilidades.push("velocidad_cognitiva");
        if (erroresComision > 8) habilidades.push("control_inhibitorio");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos, erroresComision, erroresOmision, precision: precisionSelectiva, velocidad: velocidad.toFixed(2), tiempoTotalMs: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        lineaActual = 0; aciertos = 0; erroresComision = 0; erroresOmision = 0; totalProcesados = 0;
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
    const status = document.getElementById("status");

    const totalEstímulos = 40;
    let estímulos = [];
    let indice = 0;
    let aciertos = 0, comisiones = 0, omisiones = 0;
    let tiemposReaccion = [];
    let inicioTest = 0;
    let puedeResponder = true;

    function generarSecuencia() {
        const seq = [];
        let anterior = '';
        for (let i = 0; i < totalEstímulos; i++) {
            let letra;
            if (Math.random() < 0.2 && anterior === 'A') {
                letra = 'X';
            } else {
                do { letra = String.fromCharCode(65 + Math.floor(Math.random() * 26)); } while (letra === 'X' && anterior === 'A');
            }
            seq.push(letra);
            anterior = letra;
        }
        return seq;
    }

    function mostrarSiguiente() {
        if (indice >= totalEstímulos) return finalizarTest();
        const letra = estímulos[indice];
        container.innerHTML = makeResponsiveContainer(`<div class="text-6xl sm:text-8xl font-bold text-white text-center">${letra}</div>`);
        const esObjetivo = (letra === 'X' && (indice > 0 ? estímulos[indice - 1] === 'A' : false));
        const inicioRespuesta = performance.now();
        const handler = (e) => {
            if (e.code !== 'Space') return;
            e.preventDefault();
            if (!puedeResponder) return;
            const rt = performance.now() - inicioRespuesta;
            tiemposReaccion.push(rt);
            if (esObjetivo) aciertos++;
            else comisiones++;
            puedeResponder = false;
            window.removeEventListener('keydown', handler);
            setTimeout(() => { puedeResponder = true; }, 100);
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
            if (esObjetivo && puedeResponder) omisiones++;
            window.removeEventListener('keydown', handler);
            indice++;
            mostrarSiguiente();
        }, 1000);
    }

    function finalizarTest() {
        const tiempoTotal = performance.now() - inicioTest;
        const precision = aciertos / (aciertos + comisiones + omisiones) || 0;
        const rtMedio = tiemposReaccion.length ? tiemposReaccion.reduce((a, b) => a + b, 0) / tiemposReaccion.length : 0;
        const habilidades = [];
        if (precision < 0.7) habilidades.push("atencion_sostenida");
        if (comisiones > 5) habilidades.push("control_inhibitorio");
        if (rtMedio > 600) habilidades.push("velocidad_cognitiva");
        if (omisiones > 5) habilidades.push("atencion_selectiva");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos, comisiones, omisiones, precision, tiempoMedioRespuestaMs: Math.round(rtMedio), tiempoTotalMs: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        estímulos = generarSecuencia();
        indice = 0; aciertos = 0; comisiones = 0; omisiones = 0; tiemposReaccion = [];
        inicioTest = performance.now();
        puedeResponder = true;
        mostrarSiguiente();
    };
}

// ======================================================
// 4. WCST (responsivo)
// ======================================================
function initWCSTLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const colores = ['rojo', 'verde', 'azul', 'amarillo'];
    const formas = ['círculo', 'cuadrado', 'triángulo', 'cruz'];
    const numeros = [1, 2, 3, 4];

    let reglaActual = 'color';
    let aciertosConsec = 0;
    let totalAciertos = 0, totalErrores = 0, perseveraciones = 0;
    let cartaActual;
    let inicioTest = 0;

    function generarCarta() {
        return {
            color: colores[Math.floor(Math.random() * 4)],
            forma: formas[Math.floor(Math.random() * 4)],
            numero: numeros[Math.floor(Math.random() * 4)]
        };
    }

    function cambiarRegla() {
        const posibles = ['color', 'forma', 'numero'].filter(r => r !== reglaActual);
        reglaActual = posibles[Math.floor(Math.random() * posibles.length)];
        aciertosConsec = 0;
        if (status) status.textContent = `Nueva regla: ${reglaActual}`;
    }

    function evaluar(criterio) {
        let correcto = false;
        if (reglaActual === 'color') correcto = (criterio === cartaActual.color);
        else if (reglaActual === 'forma') correcto = (criterio === cartaActual.forma);
        else correcto = (parseInt(criterio) === cartaActual.numero);
        if (correcto) {
            totalAciertos++;
            aciertosConsec++;
            if (aciertosConsec >= 5) cambiarRegla();
        } else {
            totalErrores++;
            if (criterio !== (reglaActual === 'color' ? cartaActual.color : reglaActual === 'forma' ? cartaActual.forma : cartaActual.numero.toString())) {
                perseveraciones++;
            }
            aciertosConsec = 0;
        }
        cartaActual = generarCarta();
        renderCarta();
        if (totalAciertos + totalErrores >= 30) finalizarTest();
    }

    function renderCarta() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="text-center">
                <div class="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl inline-block mb-4 sm:mb-6">
                    <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto" style="background:${cartaActual.color};"></div>
                    <div class="text-xl sm:text-2xl mt-2">${cartaActual.forma} x${cartaActual.numero}</div>
                </div>
                <div class="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    <button data-crit="color" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 rounded text-sm sm:text-base">Color (${cartaActual.color})</button>
                    <button data-crit="forma" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-500 rounded text-sm sm:text-base">Forma (${cartaActual.forma})</button>
                    <button data-crit="numero" class="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 rounded text-sm sm:text-base">Número (${cartaActual.numero})</button>
                </div>
                <div class="mt-3 sm:mt-4 text-white text-sm sm:text-base">Aciertos: ${totalAciertos} | Errores: ${totalErrores}</div>
            </div>
        `);
        document.querySelectorAll('[data-crit]').forEach(btn => {
            btn.onclick = () => evaluar(btn.dataset.crit);
        });
    }

    function finalizarTest() {
        const precision = totalAciertos / (totalAciertos + totalErrores) || 0;
        const habilidades = [];
        if (perseveraciones > 8) habilidades.push("flexibilidad_cognitiva");
        if (precision < 0.6) habilidades.push("flexibilidad_cognitiva");
        if (totalErrores > 15) habilidades.push("control_inhibitorio");
        if (aciertosConsec < 2 && totalAciertos > 10) habilidades.push("memoria_trabajo");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos: totalAciertos, errores: totalErrores, precision, perseveraciones, cambiosRegla: Math.floor(totalAciertos / 5) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        reglaActual = 'color';
        aciertosConsec = 0;
        totalAciertos = totalErrores = perseveraciones = 0;
        cartaActual = generarCarta();
        inicioTest = performance.now();
        renderCarta();
        if (status) status.textContent = "Regla inicial: COLOR";
    };
}

// ======================================================
// 5. TOWER OF LONDON (responsivo con objetivo visible)
// ======================================================
function initTowerOfLondonLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let estado = [[], [], []];
    let objetivo = [[], [], []];
    let movimientos = 0;
    let seleccionada = null;
    let juegoActivo = false;
    let inicioTest = 0;

    function generarObjetivo() {
        const bolas = ['rojo', 'verde', 'azul'];
        let dist = [[], [], []];
        for (let bola of bolas) {
            let colocada = false;
            while (!colocada) {
                let v = Math.floor(Math.random() * 3);
                if (dist[v].length < 3) {
                    dist[v].push(bola);
                    colocada = true;
                }
            }
        }
        return dist;
    }

    function calcularOptimo() {
        let fuera = 0;
        for (let i = 0; i < 3; i++) {
            const estStr = estado[i].join(',');
            const objStr = objetivo[i].join(',');
            if (estStr !== objStr) fuera++;
        }
        return Math.max(fuera, Math.ceil(fuera / 2));
    }

    function render() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="flex flex-col lg:flex-row justify-center gap-4 sm:gap-8">
                <div class="text-center">
                    <h3 class="text-sm sm:text-lg font-bold mb-2">Tu configuración</h3>
                    <div class="flex justify-center gap-2 sm:gap-4">
                        ${estado.map((varilla, i) => `
                            <div data-varilla="${i}" class="bg-slate-700 w-16 sm:w-24 h-32 sm:h-48 rounded-b-2xl flex flex-col-reverse items-center p-1 sm:p-2 border-t-4 border-slate-500 cursor-pointer">
                                ${varilla.map(bola => `
                                    <div class="w-6 h-6 sm:w-10 sm:h-10 rounded-full ${bola === 'rojo' ? 'bg-red-500' : bola === 'verde' ? 'bg-green-500' : 'bg-blue-500'} m-0.5 sm:m-1"></div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="text-center">
                    <h3 class="text-sm sm:text-lg font-bold mb-2">Objetivo</h3>
                    <div class="flex justify-center gap-2 sm:gap-4">
                        ${objetivo.map(varilla => `
                            <div class="bg-slate-600 w-16 sm:w-24 h-32 sm:h-48 rounded-b-2xl flex flex-col-reverse items-center p-1 sm:p-2 border-t-4 border-slate-400 opacity-80">
                                ${varilla.map(bola => `
                                    <div class="w-6 h-6 sm:w-10 sm:h-10 rounded-full ${bola === 'rojo' ? 'bg-red-500' : bola === 'verde' ? 'bg-green-500' : 'bg-blue-500'} m-0.5 sm:m-1"></div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="text-center mt-4 sm:mt-6 font-bold text-sm sm:text-base">Movimientos: ${movimientos}</div>
        `);

        document.querySelectorAll('[data-varilla]').forEach(el => {
            el.onclick = () => manejarVarilla(parseInt(el.dataset.varilla));
        });
    }

    function manejarVarilla(idx) {
        if (!juegoActivo) return;
        if (seleccionada === null) {
            if (estado[idx].length > 0) {
                seleccionada = idx;
                document.querySelector(`[data-varilla="${idx}"]`).classList.add('ring-2', 'ring-yellow-400');
            }
        } else {
            if (seleccionada !== idx) {
                const bola = estado[seleccionada].pop();
                if (bola) {
                    estado[idx].push(bola);
                    movimientos++;
                    render();
                    if (JSON.stringify(estado) === JSON.stringify(objetivo)) finalizarTest(true);
                }
            }
            document.querySelectorAll('[data-varilla]').forEach(el => el.classList.remove('ring-2', 'ring-yellow-400'));
            seleccionada = null;
        }
    }

    function finalizarTest(completado) {
        juegoActivo = false;
        const opt = calcularOptimo();
        const exceso = Math.max(0, movimientos - opt);
        const habilidades = [];
        if (exceso > 3) habilidades.push("planificacion");
        if (movimientos > opt + 5) habilidades.push("memoria_trabajo");
        if (opt > 3 && exceso > 2) habilidades.push("memoria_espacial");
        if (movimientos > 15) habilidades.push("atencion_sostenida");
        callback({
            testId, timestamp: Date.now(),
            metrics: { completado, movimientos, optimo: opt, exceso, eficiencia: opt / movimientos || 0 },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        estado = [['rojo', 'verde', 'azul'], [], []];
        objetivo = generarObjetivo();
        movimientos = 0;
        seleccionada = null;
        juegoActivo = true;
        inicioTest = performance.now();
        render();
        if (status) status.textContent = "Mueve las bolas para igualar la configuración objetivo";
    };
}

// ======================================================
// 6. TAVEC (memoria_trabajo, memoria_espacial, planificacion, atencion_sostenida)
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
    let listaAprendizaje = [];
    let listaInterferencia = [];
    let listaReconocimiento = [];
    let fase = 0; // 0-4 ensayos, 5 interferencia, 6 recuerdo inmediato, 7 espera, 8 recuerdo demorado, 9 reconocimiento
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

    function renderEnsayo() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Ensayo ${ensayoActual}/5 - Memoriza estas palabras:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaAprendizaje.map(p => `<span class="bg-slate-100 dark:bg-slate-700 p-2 rounded">${p}</span>`).join('')}
                </div>
                <button id="siguiente" class="w-full py-2 bg-blue-600 text-white rounded-xl">He memorizado</button>
            </div>
        `;
        document.getElementById("siguiente").onclick = () => renderRecuerdoEnsayo();
    }

    function renderRecuerdoEnsayo() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Ensayo ${ensayoActual} - Escribe las palabras que recuerdes (separadas por comas):</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl">Continuar</button>
            </div>
        `;
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            const aciertos = palabras.filter(p => listaAprendizaje.includes(p)).length;
            aciertosPorEnsayo.push(aciertos);
            if (ensayoActual < 5) {
                ensayoActual++;
                renderEnsayo();
            } else {
                fase = 5;
                renderInterferencia();
            }
        };
    }

    function renderInterferencia() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Lista de interferencia - Memoriza estas palabras:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaInterferencia.map(p => `<span class="bg-slate-100 dark:bg-slate-700 p-2 rounded">${p}</span>`).join('')}
                </div>
                <button id="siguiente" class="w-full py-2 bg-blue-600 text-white rounded-xl">Continuar</button>
            </div>
        `;
        document.getElementById("siguiente").onclick = () => renderRecuerdoInmediato();
    }

    function renderRecuerdoInmediato() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Recuerdo inmediato - Escribe las palabras de la lista ORIGINAL que recuerdes:</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl">Continuar</button>
            </div>
        `;
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            recuerdoInmediato = palabras.filter(p => listaAprendizaje.includes(p)).length;
            fase = 7;
            renderEspera();
        };
    }

    function renderEspera() {
        container.innerHTML = `<div class="text-center p-8">Espera 20 segundos... <div id="contador">20</div></div>`;
        let seg = 20;
        const interval = setInterval(() => {
            seg--;
            const span = document.getElementById("contador");
            if (span) span.innerText = seg;
            if (seg <= 0) {
                clearInterval(interval);
                fase = 8;
                renderRecuerdoDemorado();
            }
        }, 1000);
    }

    function renderRecuerdoDemorado() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Recuerdo demorado - Escribe las palabras de la lista ORIGINAL que recuerdes:</p>
                <textarea id="recuerdo" rows="4" class="w-full p-3 border rounded-xl"></textarea>
                <button id="siguiente" class="mt-4 w-full py-2 bg-blue-600 text-white rounded-xl">Continuar</button>
            </div>
        `;
        document.getElementById("siguiente").onclick = () => {
            const texto = document.getElementById("recuerdo").value.toLowerCase();
            const palabras = texto.split(/[ ,]+/).filter(p => p);
            recuerdoDemorado = palabras.filter(p => listaAprendizaje.includes(p)).length;
            fase = 9;
            renderReconocimiento();
        };
    }

    function renderReconocimiento() {
        container.innerHTML = `
            <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl">
                <p class="text-lg font-bold mb-4">Reconocimiento - Marca las que estaban en la lista original:</p>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    ${listaReconocimiento.map((p, idx) => `<label class="flex items-center gap-2"><input type="checkbox" value="${p}" data-idx="${idx}"> ${p}</label>`).join('')}
                </div>
                <button id="finalizar" class="w-full py-2 bg-blue-600 text-white rounded-xl">Finalizar</button>
            </div>
        `;
        document.getElementById("finalizar").onclick = () => {
            const checks = document.querySelectorAll('input[type="checkbox"]:checked');
            const seleccionadas = Array.from(checks).map(cb => cb.value);
            const aciertosRec = seleccionadas.filter(p => listaAprendizaje.includes(p)).length;
            const falsos = seleccionadas.filter(p => !listaAprendizaje.includes(p)).length;
            const totalAprend = aciertosPorEnsayo.reduce((a, b) => a + b, 0);
            const olvido = recuerdoInmediato - recuerdoDemorado;
            const habilidades = [];
            if (aciertosPorEnsayo[4] < 8) habilidades.push("memoria_trabajo");
            if (olvido > 3) habilidades.push("memoria_trabajo");
            if (totalAprend < 40) habilidades.push("planificacion");
            if (recuerdoDemorado < 6) habilidades.push("atencion_sostenida");
            callback({
                testId, timestamp: Date.now(),
                metrics: { aprendizajeTotal: totalAprend, recuerdoInmediato, recuerdoDemorado, olvido, reconocimientoAciertos: aciertosRec, reconocimientoFalsos: falsos },
                habilidadesDebiles: habilidades
            });
            startBtn.classList.remove("hidden");
        };
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        generarListas();
        fase = 0; ensayoActual = 1; aciertosPorEnsayo = [];
        recuerdoInmediato = recuerdoDemorado = 0;
        inicioTest = performance.now();
        renderEnsayo();
    };
}

// ======================================================
// 7. MEC (memoria_trabajo, atencion_sostenida, planificacion)
// ======================================================
function initMECLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let puntuacion = 0;
    let indice = 0;
    let inicioTest = 0;
    const palabrasMemoria = [];

    const secciones = [
        {
            nombre: "Orientación temporal", puntMax: 5, ejecutar: (cb) => {
                const hoy = new Date();
                const preguntas = [
                    { text: "¿Qué año es?", val: hoy.getFullYear().toString() },
                    { text: "¿Qué mes es?", val: hoy.toLocaleString('es', { month: 'long' }) },
                    { text: "¿Qué día del mes es?", val: hoy.getDate().toString() },
                    { text: "¿Qué día de la semana es?", val: hoy.toLocaleString('es', { weekday: 'long' }) },
                    { text: "¿Qué estación del año es?", val: (Math.floor(hoy.getMonth() / 3) + 1).toString() }
                ];
                let aciertos = 0;
                let i = 0;
                function preguntar() {
                    if (i >= preguntas.length) { cb(aciertos); return; }
                    container.innerHTML = `<div class="p-6"><p class="text-xl">${preguntas[i].text}</p><input id="resp" class="w-full p-2 border rounded mt-2"><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                    document.getElementById("next").onclick = () => {
                        if (document.getElementById("resp").value.toLowerCase().trim() === preguntas[i].val.toLowerCase()) aciertos++;
                        i++; preguntar();
                    };
                }
                preguntar();
            }
        },
        {
            nombre: "Memoria inmediata", puntMax: 3, ejecutar: (cb) => {
                const palabras = ["casa", "perro", "flor", "sol", "luna", "mar"].sort(() => 0.5 - Math.random()).slice(0, 3);
                palabrasMemoria.push(...palabras);
                container.innerHTML = `<div class="p-6"><p class="text-xl">Repite estas palabras: ${palabras.join(', ')}</p><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                document.getElementById("next").onclick = () => cb(3);
            }
        },
        {
            nombre: "Cálculo", puntMax: 5, ejecutar: (cb) => {
                const inicioNum = 100 + Math.floor(Math.random() * 50);
                const restas = [inicioNum - 7, inicioNum - 14, inicioNum - 21, inicioNum - 28, inicioNum - 35];
                let aciertos = 0;
                let i = 0;
                function preguntarResta() {
                    if (i >= restas.length) { cb(aciertos); return; }
                    container.innerHTML = `<div class="p-6"><p class="text-xl">Resta 7 a ${i === 0 ? inicioNum : restas[i - 1]}</p><input id="resp" class="w-full p-2 border rounded mt-2"><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                    document.getElementById("next").onclick = () => {
                        if (parseInt(document.getElementById("resp").value) === restas[i]) aciertos++;
                        i++; preguntarResta();
                    };
                }
                preguntarResta();
            }
        },
        {
            nombre: "Memoria diferida", puntMax: 3, ejecutar: (cb) => {
                container.innerHTML = `<div class="p-6"><p class="text-xl">¿Recuerdas las tres palabras de antes? Escríbelas separadas por comas:</p><textarea id="resp" class="w-full p-2 border rounded mt-2"></textarea><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Comprobar</button></div>`;
                document.getElementById("next").onclick = () => {
                    const resp = document.getElementById("resp").value.toLowerCase();
                    const aciertos = palabrasMemoria.filter(p => resp.includes(p)).length;
                    cb(aciertos);
                };
            }
        },
        {
            nombre: "Lenguaje", puntMax: 9, ejecutar: (cb) => {
                let puntos = 0;
                const objetos = ["lápiz", "reloj"];
                let idxObj = 0;
                function preguntarObj() {
                    if (idxObj >= objetos.length) {
                        const frase = "En un trigal había cinco perros";
                        container.innerHTML = `<div class="p-6"><p class="text-xl">Repite esta frase: "${frase}"</p><input id="resp" class="w-full p-2 border rounded mt-2"><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                        document.getElementById("next").onclick = () => {
                            if (document.getElementById("resp").value.toLowerCase().includes("trigal") && document.getElementById("resp").value.includes("cinco")) puntos++;
                            container.innerHTML = `<div class="p-6"><p class="text-xl">Siga esta orden: "Coge el papel con la mano derecha, dóblalo por la mitad y déjalo en el suelo". Escribe qué hiciste:</p><textarea id="resp" class="w-full p-2 border rounded mt-2"></textarea><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                            document.getElementById("next").onclick = () => {
                                if (document.getElementById("resp").value.length > 10) puntos += 3;
                                container.innerHTML = `<div class="p-6"><p class="text-xl">Lea y obedezca: "Cierre los ojos"</p><button id="cerrar" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">He cerrado los ojos</button></div>`;
                                document.getElementById("cerrar").onclick = () => {
                                    puntos++;
                                    container.innerHTML = `<div class="p-6"><p class="text-xl">Escriba una frase con sentido:</p><textarea id="resp" class="w-full p-2 border rounded mt-2"></textarea><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                                    document.getElementById("next").onclick = () => {
                                        if (document.getElementById("resp").value.length > 5) puntos++;
                                        puntos += 1;
                                        cb(puntos);
                                    };
                                };
                            };
                        };
                        return;
                    }
                    container.innerHTML = `<div class="p-6"><p class="text-xl">¿Qué es esto? (${objetos[idxObj]})</p><input id="resp" class="w-full p-2 border rounded mt-2"><button id="next" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Siguiente</button></div>`;
                    document.getElementById("next").onclick = () => {
                        if (document.getElementById("resp").value.toLowerCase().includes(objetos[idxObj])) puntos += 2;
                        idxObj++;
                        preguntarObj();
                    };
                }
                preguntarObj();
            }
        }
    ];

    function runSeccion() {
        if (indice >= secciones.length) return finalizarTest();
        const sec = secciones[indice];
        if (status) status.textContent = `${sec.nombre} (${indice + 1}/${secciones.length})`;
        sec.ejecutar((puntos) => {
            puntuacion += puntos;
            indice++;
            runSeccion();
        });
    }

    function finalizarTest() {
        const max = 35;
        const habilidades = [];
        if (puntuacion < 23) habilidades.push("memoria_trabajo", "atencion_sostenida");
        else if (puntuacion < 28) habilidades.push("memoria_trabajo");
        if (puntuacion < 20) habilidades.push("planificacion");
        callback({
            testId, timestamp: Date.now(),
            metrics: { puntuacionTotal: puntuacion, maximoPosible: max, porcentaje: puntuacion / max },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        puntuacion = 0; indice = 0;
        palabrasMemoria.length = 0;
        inicioTest = performance.now();
        runSeccion();
    };
}

// ======================================================
// 8. STROOP (control_inhibitorio, velocidad_cognitiva, atencion_dividida, memoria_trabajo)
// ======================================================
function initStroopLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const colores = ["rojo", "verde", "azul", "amarillo"];
    const palabras = ["ROJO", "VERDE", "AZUL", "AMARILLO"];
    let ensayos = [];
    let indice = 0;
    let resultados = []; // guarda { correcto, tiempo, congruente }
    let inicioTest = 0;

    function generarEnsayo() {
        const palabra = palabras[Math.floor(Math.random() * 4)];
        const tinta = colores[Math.floor(Math.random() * 4)];
        const congruente = (palabra.toLowerCase() === tinta);
        return { palabra, tinta, congruente };
    }

    function iniciarEnsayo() {
        if (indice >= ensayos.length) return finalizarTest();
        const e = ensayos[indice];
        const inicioRespuesta = performance.now();
        container.innerHTML = `
            <div class="text-center">
                <div class="text-6xl font-bold mb-6" style="color: ${e.tinta};">${e.palabra}</div>
                <div class="grid grid-cols-2 gap-4">
                    ${colores.map(c => `<button data-color="${c}" class="px-4 py-2 bg-slate-700 rounded text-white">${c}</button>`).join('')}
                </div>
            </div>
        `;
        const handler = (e) => {
            const btn = e.target.closest('[data-color]');
            if (!btn) return;
            const respuesta = btn.dataset.color;
            const correcto = (respuesta === e.tinta);
            const tiempo = performance.now() - inicioRespuesta;
            resultados.push({ correcto, tiempo, congruente: e.congruente });
            indice++;
            iniciarEnsayo();
        };
        container.onclick = handler;
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
        if (precisionIncongruentes < 0.6) habilidades.push("control_inhibitorio");
        if (tiempoMedio > 1500) habilidades.push("velocidad_cognitiva");
        if (precisionCongruentes - precisionIncongruentes > 0.3) habilidades.push("atencion_dividida");
        if (precisionIncongruentes < 0.7 && tiempoMedio > 1200) habilidades.push("memoria_trabajo");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos, total,
                precision: aciertos / total,
                precisionCongruentes,
                precisionIncongruentes,
                tiempoMedioRespuestaMs: Math.round(tiempoMedio)
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
        if (status) status.textContent = "Elige el color de la tinta, ignora la palabra";
    };
}

// ======================================================
// 9. DIGIT SPAN (memoria_trabajo, atencion_sostenida, planificacion)
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

    function mostrarDigitos(digitos, callback) {
        container.innerHTML = `<div class="text-6xl font-bold text-center">${digitos.join(' ')}</div>`;
        setTimeout(() => {
            container.innerHTML = `<div class="text-center text-xl">Escribe los números en el MISMO orden:</div><input id="respuesta" class="w-full p-2 border rounded mt-4"><button id="enviar" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Comprobar</button>`;
            document.getElementById("enviar").onclick = () => {
                const respuesta = document.getElementById("respuesta").value.trim().split(/\s+/).map(Number);
                const correcto = JSON.stringify(respuesta) === JSON.stringify(digitos);
                callback(correcto);
            };
        }, 2000);
    }

    function iniciarNivel() {
        if (errores >= 2) return finalizarTest();
        const digitos = generarDigitos(nivel);
        mostrarDigitos(digitos, (correcto) => {
            if (correcto) {
                spanMaximo = nivel;
                nivel++;
                iniciarNivel();
            } else {
                errores++;
                if (errores >= 2) finalizarTest();
                else iniciarNivel();
            }
        });
    }

    function finalizarTest() {
        const habilidades = [];
        if (spanMaximo < 5) habilidades.push("memoria_trabajo");
        if (spanMaximo < 4) habilidades.push("atencion_sostenida");
        if (spanMaximo < 3) habilidades.push("planificacion");
        callback({
            testId, timestamp: Date.now(),
            metrics: { spanMaximo, errores },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2; errores = 0; spanMaximo = 0;
        inicioTest = performance.now();
        iniciarNivel();
    };
}

// ======================================================
// 10. TRAIL MAKING TEST (versión responsiva sin posiciones absolutas)
// ======================================================
function initTMTLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let fase = 'A';
    let elementos = [];
    let siguiente = 1;
    let inicioTest = 0;
    let inicioFase = 0;
    let tiempos = { A: 0, B: 0 };

    function generarElementos(fase) {
        const elementosArr = [];
        if (fase === 'A') {
            for (let i = 1; i <= 8; i++) {
                elementosArr.push({ valor: i, orden: i });
            }
        } else {
            const valores = [1, 'A', 2, 'B', 3, 'C', 4, 'D'];
            for (let i = 0; i < valores.length; i++) {
                elementosArr.push({ valor: valores[i], orden: i + 1 });
            }
        }
        // Mezclar posiciones
        return elementosArr.sort(() => Math.random() - 0.5).map((el, idx) => ({
            ...el,
            x: (idx % 4) * 70 + 20,
            y: Math.floor(idx / 4) * 70 + 20
        }));
    }

    function renderFase() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="relative w-full min-h-[300px] sm:min-h-[400px] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-auto p-2">
                <div class="relative w-full h-full" style="min-height: 300px;">
                    ${elementos.map(el => `
                        <div data-valor="${el.valor}" class="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 transition text-sm sm:text-base"
                            style="left: ${el.x}%; top: ${el.y}%; transform: translate(-50%, -50%);">
                            ${el.valor}
                        </div>
                    `).join('')}
                </div>
            </div>
        `);

        document.querySelectorAll('[data-valor]').forEach(el => {
            el.onclick = () => {
                const esperado = fase === 'A' ? siguiente : (siguiente % 2 === 1 ? siguiente : String.fromCharCode(64 + siguiente / 2));
                if (String(el.dataset.valor) === String(esperado)) {
                    el.classList.add('bg-green-500', 'opacity-50', 'cursor-default');
                    el.style.pointerEvents = 'none';
                    siguiente++;
                    if ((fase === 'A' && siguiente > 8) || (fase === 'B' && siguiente > 8)) {
                        tiempos[fase] = performance.now() - inicioFase;
                        if (fase === 'A') {
                            fase = 'B';
                            siguiente = 1;
                            elementos = generarElementos('B');
                            renderFase();
                            if (status) status.textContent = "TMT-B: Alterna números y letras (1→A→2→B→3→C→4→D)";
                        } else {
                            finalizarTest();
                        }
                    }
                } else {
                    el.classList.add('bg-red-500');
                    setTimeout(() => el.classList.remove('bg-red-500'), 300);
                }
            };
        });
    }

    function finalizarTest() {
        const tiempoTotal = tiempos.A + tiempos.B;
        const habilidades = [];
        if (tiempos.A > 30000) habilidades.push("velocidad_cognitiva");
        if (tiempos.B > 60000) habilidades.push("flexibilidad_cognitiva");
        if (tiempos.B - tiempos.A > 20000) habilidades.push("atencion_dividida");
        if (tiempos.A > 20000) habilidades.push("coordinacion_visomotora");
        callback({
            testId, timestamp: Date.now(),
            metrics: { tiempoA: Math.round(tiempos.A), tiempoB: Math.round(tiempos.B), tiempoTotal: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        fase = 'A';
        siguiente = 1;
        elementos = generarElementos('A');
        inicioTest = performance.now();
        inicioFase = performance.now();
        renderFase();
        if (status) status.textContent = "TMT-A: Conecta los números en orden ascendente (1→2→3→...→8)";
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

    function generarItem() {
        const objetivo = simbolos[Math.floor(Math.random() * simbolos.length)];
        const distractores = simbolos.filter(s => s !== objetivo);
        const opciones = [objetivo, distractores[Math.floor(Math.random() * distractores.length)]];
        opciones.sort(() => Math.random() - 0.5);
        const respuestaCorrecta = opciones[0] === objetivo ? 0 : 1;
        return { objetivo, opciones, respuestaCorrecta };
    }

    function mostrarItem() {
        if (indice >= 20) return finalizarTest();
        const item = items[indice];
        container.innerHTML = `
            <div class="text-center">
                <div class="text-4xl mb-4">Busca el símbolo: <span class="font-bold">${item.objetivo}</span></div>
                <div class="flex justify-center gap-8">
                    <button data-opcion="0" class="text-6xl p-4 bg-slate-700 rounded">${item.opciones[0]}</button>
                    <button data-opcion="1" class="text-6xl p-4 bg-slate-700 rounded">${item.opciones[1]}</button>
                </div>
            </div>
        `;
        const inicioRespuesta = performance.now();
        const handler = (e) => {
            const btn = e.target.closest('[data-opcion]');
            if (!btn) return;
            const seleccion = parseInt(btn.dataset.opcion);
            if (seleccion === item.respuestaCorrecta) aciertos++;
            indice++;
            mostrarItem();
        };
        container.onclick = handler;
    }

    function finalizarTest() {
        const precision = aciertos / items.length;
        const tiempoTotal = performance.now() - inicioTest;
        const habilidades = [];
        if (precision < 0.7) habilidades.push("velocidad_cognitiva");
        if (precision < 0.8) habilidades.push("atencion_selectiva");
        if (tiempoTotal > 60000) habilidades.push("coordinacion_visomotora");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos, total: items.length, precision, tiempoTotalMs: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        items = Array.from({ length: 20 }, () => generarItem());
        indice = 0; aciertos = 0;
        inicioTest = performance.now();
        mostrarItem();
    };
}

// ======================================================
// 12. N-BACK (memoria_trabajo, atencion_sostenida, control_inhibitorio, velocidad_cognitiva)
// ======================================================
function initNBackLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    let nivel = 1; // 1-back, luego 2-back
    let secuencia = [];
    let indice = 0;
    let aciertos = 0;
    let errores = 0;
    let inicioTest = 0;

    function generarSecuencia(n) {
        const seq = [];
        for (let i = 0; i < 20 + n; i++) {
            seq.push(Math.floor(Math.random() * 10));
        }
        return seq;
    }

    function mostrarSiguiente() {
        if (indice >= secuencia.length) return finalizarTest();
        const actual = secuencia[indice];
        const esObjetivo = (indice >= nivel && secuencia[indice - nivel] === actual);
        container.innerHTML = `<div class="text-8xl font-bold text-white">${actual}</div>`;
        const inicioRespuesta = performance.now();
        const handler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (esObjetivo) aciertos++;
                else errores++;
                window.removeEventListener('keydown', handler);
                setTimeout(() => {
                    indice++;
                    mostrarSiguiente();
                }, 300);
            } else if (e.code === 'KeyN') {
                e.preventDefault();
                if (!esObjetivo) aciertos++;
                else errores++;
                window.removeEventListener('keydown', handler);
                setTimeout(() => {
                    indice++;
                    mostrarSiguiente();
                }, 300);
            }
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
            window.removeEventListener('keydown', handler);
            if (!handler.used) {
                if (esObjetivo) errores++;
                else aciertos++;
                indice++;
                mostrarSiguiente();
            }
        }, 1500);
    }

    function finalizarTest() {
        const precision = aciertos / (aciertos + errores);
        const habilidades = [];
        if (precision < 0.7) habilidades.push("memoria_trabajo");
        if (precision < 0.6) habilidades.push("atencion_sostenida");
        if (errores > 10) habilidades.push("control_inhibitorio");
        if (nivel === 2 && precision < 0.5) habilidades.push("velocidad_cognitiva");
        callback({
            testId, timestamp: Date.now(),
            metrics: { nivel, aciertos, errores, precision },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 1;
        secuencia = generarSecuencia(nivel);
        indice = 0; aciertos = 0; errores = 0;
        inicioTest = performance.now();
        mostrarSiguiente();
        if (status) status.textContent = "N-Back: Presiona ESPACIO si el número es igual al de hace 1 posición, presiona N si es diferente";
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

    function generarSecuencia() {
        const seq = [];
        for (let i = 0; i < 30; i++) {
            const esGo = Math.random() < 0.7; // 70% Go
            seq.push(esGo);
        }
        return seq;
    }

    function mostrarSiguiente() {
        if (indice >= estímulos.length) return finalizarTest();
        const esGo = estímulos[indice];
        const letra = esGo ? 'X' : 'O';
        container.innerHTML = `<div class="text-8xl font-bold text-white">${letra}</div>`;
        const inicioRespuesta = performance.now();
        const handler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                const rt = performance.now() - inicioRespuesta;
                tiempos.push(rt);
                if (esGo) aciertos++;
                else comisiones++;
                window.removeEventListener('keydown', handler);
                setTimeout(() => {
                    indice++;
                    mostrarSiguiente();
                }, 300);
            }
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
            window.removeEventListener('keydown', handler);
            if (esGo) omisiones++;
            indice++;
            mostrarSiguiente();
        }, 1000);
    }

    function finalizarTest() {
        const precision = aciertos / (aciertos + omisiones);
        const rtMedio = tiempos.length ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length : 0;
        const habilidades = [];
        if (comisiones > 5) habilidades.push("control_inhibitorio");
        if (precision < 0.7) habilidades.push("atencion_sostenida");
        if (rtMedio > 600) habilidades.push("velocidad_cognitiva");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos, comisiones, omisiones, precision, tiempoMedioRespuestaMs: Math.round(rtMedio) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        estímulos = generarSecuencia();
        indice = 0; aciertos = 0; comisiones = 0; omisiones = 0; tiempos = [];
        inicioTest = performance.now();
        mostrarSiguiente();
        if (status) status.textContent = "Go/No-Go: Presiona ESPACIO solo cuando veas X, no presiones cuando veas O";
    };
}
