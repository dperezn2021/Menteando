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
        const rachaMaxima = nivel - 1;
        const tiempoTotal = performance.now() - inicioTest;
        const habilidades = [];
        if (rachaMaxima < 4) habilidades.push("memoria_espacial");
        if (errores >= 2) habilidades.push("memoria_trabajo");
        callback({
            testId, timestamp: Date.now(),
            metrics: { rachaMaxima, errores, precision: rachaMaxima / (rachaMaxima + errores) || 0, tiempoTotalMs: Math.round(tiempoTotal) },
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
    const tiempoPorLinea = 10000;  // 20 segundos por línea
    const itemsPorLinea = 30;      // 30 estímulos por línea

    // Añadir al inicio de la función
    let aciertosPorLinea = [];
    let erroresComisionPorLinea = [];
    let erroresOmisionPorLinea = [];
    let timer = null;
    let totalProcesados = 0;
    let aciertos = 0, erroresComision = 0, erroresOmision = 0;
    let inicioTest = 0;

    function formatearConComillas(letra, rayas) {
        // Generar todas las combinaciones posibles según el número de rayas
        const combinaciones = {
            1: [
                { arriba: 0, abajo: 1 }
            ],
            2: [
                { arriba: 2, abajo: 0 },
                { arriba: 0, abajo: 2 },
                { arriba: 1, abajo: 1 }
            ],
            3: [
                { arriba: 3, abajo: 0 },
                { arriba: 0, abajo: 3 },
                { arriba: 2, abajo: 1 },
                { arriba: 1, abajo: 2 }
            ],
            4: [
                { arriba: 4, abajo: 0 },
                { arriba: 0, abajo: 4 },
                { arriba: 3, abajo: 1 },
                { arriba: 1, abajo: 3 },
                { arriba: 2, abajo: 2 }
            ]
        };

        const opciones = combinaciones[rayas] || combinaciones[2];
        const seleccion = opciones[Math.floor(Math.random() * opciones.length)];

        const comillasArriba = "'".repeat(seleccion.arriba);
        const comillasAbajo = "'".repeat(seleccion.abajo);

        // Para mantener altura constante (evita desplazamiento al hacer hover)
        const alturaArriba = seleccion.arriba === 0 ? 'invisible' : '';

        return `
        <div class="d2-estimulo flex flex-col items-center justify-center min-w-[48px]">
            <div class="rayas-arriba text-lg leading-none h-6 ${alturaArriba}">${comillasArriba || "'"}</div>
            <div class="letra text-xl font-bold">${letra}</div>
            <div class="rayas-abajo text-lg leading-none mt-1">${comillasAbajo}</div>
        </div>
    `;
    }
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
            <div class="flex flex-wrap gap-3 sm:gap-4 w-full justify-center p-2">
                ${linea.map((stim, idx) => `
                    <div data-idx="${idx}" 
                         data-letra="${stim.letra}" 
                         data-rayas="${stim.rayas}"
                         class="estimulo cursor-pointer rounded-lg transition-all duration-150 p-2 flex justify-center items-center ">
                        ${formatearConComillas(stim.letra, stim.rayas)}
                    </div>
                `).join('')}
            </div>
        `);
    }

    // En procesarLinea, guardar métricas de esa línea
    function procesarLinea(linea, marcados, lineaIndex) {
        let aciertosLinea = 0, comisionesLinea = 0, omisionesLinea = 0;

        linea.forEach((stim, idx) => {
            const esObjetivo = (stim.letra === 'd' && stim.rayas === 2);
            const marcado = marcados.includes(idx);
            if (marcado) {
                if (esObjetivo) aciertosLinea++;
                else comisionesLinea++;
            } else {
                if (esObjetivo) omisionesLinea++;
            }
        });

        aciertosPorLinea.push(aciertosLinea);
        erroresComisionPorLinea.push(comisionesLinea);
        erroresOmisionPorLinea.push(omisionesLinea);

        aciertos += aciertosLinea;
        erroresComision += comisionesLinea;
        erroresOmision += omisionesLinea;
        totalProcesados += marcados.length + omisionesLinea;
    }

    function iniciarLinea() {
        if (lineaActual >= totalLineas) return finalizarTest();
        if (status) status.textContent = `Línea ${lineaActual + 1}/${totalLineas} · Haz clic en las 'd' con DOS comillas (una arriba y una abajo)`;

        const linea = generarLinea();
        renderLinea(linea);
        let marcados = [];

        const clickHandler = (e) => {
            const div = e.target.closest('.estimulo');
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

        // Calcular precisión selectiva (capacidad de discriminar objetivos)
        const precisionSelectiva = aciertos / (aciertos + erroresComision) || 0;

        // Calcular atención sostenida (caída de rendimiento entre líneas)
        // Necesitaríamos registrar aciertos/errores por línea para calcular la tendencia
        // Por ahora, usamos una aproximación con omisiones
        const tasaOmisiones = erroresOmision / (aciertos + erroresOmision) || 0;

        const habilidades = [];

        // Atención selectiva: baja precisión para discriminar
        if (precisionSelectiva < 0.7) habilidades.push("atencion_selectiva");

        // Atención sostenida: muchas omisiones (no marcó objetivos)
        if (tasaOmisiones > 0.3) habilidades.push("atencion_sostenida");

        // Control inhibitorio: muchas comisiones (marcó distractores)
        if (erroresComision > 8) habilidades.push("control_inhibitorio");

        // Calcular caída de atención sostenida (diferencia entre primeras y últimas líneas)
        const primerasLineas = aciertosPorLinea.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const ultimasLineas = aciertosPorLinea.slice(-2).reduce((a, b) => a + b, 0) / 2;
        const caidaRendimiento = Math.max(0, primerasLineas - ultimasLineas);

        if (caidaRendimiento > 5) habilidades.push("atencion_sostenida");

        callback({
            testId, timestamp: Date.now(),
            metrics: {
                aciertos,
                erroresComision,
                erroresOmision,
                precision: precisionSelectiva,
                tasaOmisiones: tasaOmisiones.toFixed(2),
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
        totalProcesados = 0;
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
            if (totalAprend < 50) habilidades.push("planificacion");
            if (recuerdoDemorado < 6) habilidades.push("atencion_sostenida");
            const precision = totalAprend / 80; // máximo 80 aciertos posibles (16x5)
            callback({
                testId, timestamp: Date.now(),
                metrics: {
                    aprendizajeTotal: totalAprend,
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
        fase = 0; ensayoActual = 1; aciertosPorEnsayo = [];
        recuerdoInmediato = recuerdoDemorado = 0;
        inicioTest = performance.now();
        renderEnsayo();
        if (status) status.textContent = "TAVEC: Aprendizaje verbal - Ensayo 1/5";
    };
}

// ======================================================
// 7. MEC (memoria_trabajo, atencion_sostenida)
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
        const precision = puntuacion / max;
        const habilidades = [];
        if (puntuacion < 23) habilidades.push("memoria_trabajo", "atencion_sostenida");
        else if (puntuacion < 28) habilidades.push("memoria_trabajo");
        callback({
            testId, timestamp: Date.now(),
            metrics: { puntuacionTotal: puntuacion, maximoPosible: max, porcentaje: precision, precision },
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
        if (status) status.textContent = "MEC - Comienza la evaluación";
    };
}

// ======================================================
// 8. STROOP (control_inhibitorio, velocidad_cognitiva, atencion_dividida)
// ======================================================
function initStroopLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    const colores = ["rojo", "verde", "azul", "amarillo"];
    const palabras = ["ROJO", "VERDE", "AZUL", "AMARILLO"];
    let ensayos = [];
    let indice = 0;
    let resultados = [];
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
        container.innerHTML = makeResponsiveContainer(`
            <div class="text-center p-4">
                <div class="text-5xl sm:text-7xl font-bold mb-6" style="color: ${e.tinta};">${e.palabra}</div>
                <div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                    ${colores.map(c => `<button data-color="${c}" style="background-color: ${c};" class="px-4 py-2 rounded-lg text-white font-bold shadow">${c}</button>`).join('')}
                </div>
            </div>
        `);
        const handler = (ev) => {
            const btn = ev.target.closest('[data-color]');
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
        indice = 0; resultados = [];
        inicioTest = performance.now();
        iniciarEnsayo();
        if (status) status.textContent = "Stroop: Elige el color de la tinta (no la palabra)";
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

    function mostrarDigitos(digitos, callbackFn) {
        container.innerHTML = makeResponsiveContainer(`<div class="text-5xl sm:text-7xl font-bold text-center">${digitos.join(' ')}</div>`);
        setTimeout(() => {
            container.innerHTML = makeResponsiveContainer(`
                <div class="text-center">
                    <p class="text-xl mb-4">Escribe los números en el MISMO orden:</p>
                    <input id="respuesta" class="w-full max-w-md p-3 border rounded-xl mx-auto">
                    <button id="enviar" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl">Comprobar</button>
                </div>
            `);
            document.getElementById("enviar").onclick = () => {
                const respuesta = document.getElementById("respuesta").value.trim().split(/\s+/).map(Number);
                const correcto = JSON.stringify(respuesta) === JSON.stringify(digitos);
                callbackFn(correcto);
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
                if (errores < 2) iniciarNivel();
                else finalizarTest();
            }
        });
    }

    function finalizarTest() {
        const habilidades = [];
        if (spanMaximo < 5) habilidades.push("memoria_trabajo");
        if (spanMaximo < 4) habilidades.push("atencion_sostenida");
        callback({
            testId, timestamp: Date.now(),
            metrics: { spanMaximo, errores, precision: spanMaximo / 10 },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2; errores = 0; spanMaximo = 0;
        inicioTest = performance.now();
        iniciarNivel();
        if (status) status.textContent = "Digit Span: Repite la secuencia de números";
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
    let siguiente = 1;
    let inicioTest = 0;
    let inicioFase = 0;
    let tiempos = { A: 0, B: 0 };

    function generarElementos(fase) {
        const elementosArr = [];
        if (fase === 'A') {
            for (let i = 1; i <= 8; i++) elementosArr.push({ valor: i, orden: i });
        } else {
            const valores = [1, 'A', 2, 'B', 3, 'C', 4, 'D'];
            for (let i = 0; i < valores.length; i++) elementosArr.push({ valor: valores[i], orden: i + 1 });
        }
        // Distribución en cuadrícula de 4x2 o 4x2 para móvil
        return elementosArr.map((el, idx) => ({
            ...el,
            x: (idx % 4) * 25 + 10,
            y: Math.floor(idx / 4) * 30 + 10
        }));
    }

    function renderFase() {
        container.innerHTML = makeResponsiveContainer(`
            <div class="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-auto p-4">
                <div class="relative w-full h-full" style="min-height: 350px;">
                    ${elementos.map(el => `
                        <div data-valor="${el.valor}" class="absolute w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 transition text-sm font-bold shadow"
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
                            if (status) status.textContent = "TMT-B: Alterna números y letras (1→A→2→B...)";
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
        const habilidades = [];
        if (tiempos.A > 60000) habilidades.push("velocidad_cognitiva");
        if (tiempos.B > 120000) habilidades.push("flexibilidad_cognitiva");
        if (tiempos.B - tiempos.A > 30000) habilidades.push("atencion_dividida");
        if (tiempos.A > 40000) habilidades.push("coordinacion_visomotora");
        callback({
            testId, timestamp: Date.now(),
            metrics: { tiempoA: Math.round(tiempos.A), tiempoB: Math.round(tiempos.B), tiempoTotal: Math.round(tiempos.A + tiempos.B) },
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
        if (status) status.textContent = "TMT-A: Conecta los números en orden ascendente (1→2→3...)";
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
        const inicioRespuesta = performance.now();
        container.innerHTML = makeResponsiveContainer(`
            <div class="text-center p-4">
                <div class="text-3xl mb-4">Busca el símbolo: <span class="font-bold text-5xl">${item.objetivo}</span></div>
                <div class="flex justify-center gap-8">
                    <button data-opcion="0" class="text-6xl p-4 bg-slate-700 rounded-xl hover:bg-slate-600 transition">${item.opciones[0]}</button>
                    <button data-opcion="1" class="text-6xl p-4 bg-slate-700 rounded-xl hover:bg-slate-600 transition">${item.opciones[1]}</button>
                </div>
            </div>
        `);
        const handler = (e) => {
            const btn = e.target.closest('[data-opcion]');
            if (!btn) return;
            const seleccion = parseInt(btn.dataset.opcion);
            const tiempo = performance.now() - inicioRespuesta;
            tiempos.push(tiempo);
            if (seleccion === item.respuestaCorrecta) aciertos++;
            indice++;
            mostrarItem();
        };
        container.onclick = handler;
    }

    function finalizarTest() {
        const precision = aciertos / items.length;
        const tiempoMedio = tiempos.reduce((a,b)=>a+b,0)/tiempos.length || 0;
        const tiempoTotal = performance.now() - inicioTest;
        const habilidades = [];
        if (precision < 0.7) habilidades.push("velocidad_cognitiva");
        if (precision < 0.8) habilidades.push("atencion_selectiva");
        if (tiempoMedio > 3000) habilidades.push("coordinacion_visomotora");
        callback({
            testId, timestamp: Date.now(),
            metrics: { aciertos, total: items.length, precision, tiempoMedioRespuestaMs: Math.round(tiempoMedio), tiempoTotalMs: Math.round(tiempoTotal) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        items = Array.from({ length: 20 }, () => generarItem());
        indice = 0; aciertos = 0; tiempos = [];
        inicioTest = performance.now();
        mostrarItem();
        if (status) status.textContent = "Symbol Search: Encuentra el símbolo igual";
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
    let aciertos = 0, errores = 0;
    let inicioTest = 0;
    let puedeResponder = true;
    let tiempoInicioEstímulo = 0;
    let tiemposReaccion = [];

    function generarSecuencia(longitud) {
        return Array.from({ length: longitud }, () => Math.floor(Math.random() * 10));
    }

    function mostrarSiguiente() {
        if (indice >= secuencia.length) {
            if (nivel === 1) {
                // Pasar a 2-back
                nivel = 2;
                indice = 0;
                secuencia = generarSecuencia(25); // 25 estímulos para 2-back
                aciertos = 0; errores = 0; tiemposReaccion = [];
                if (status) status.textContent = "Ahora N=2: presiona ESPACIO si el número es igual al de hace 2 posiciones";
                mostrarSiguiente();
            } else {
                finalizarTest();
            }
            return;
        }
        const actual = secuencia[indice];
        const esObjetivo = (indice >= nivel && secuencia[indice - nivel] === actual);
        container.innerHTML = makeResponsiveContainer(`<div class="text-7xl sm:text-8xl font-bold text-white text-center">${actual}</div>`);
        tiempoInicioEstímulo = performance.now();
        puedeResponder = true;

        const handler = (e) => {
            if (e.code !== 'Space' || !puedeResponder) return;
            e.preventDefault();
            const rt = performance.now() - tiempoInicioEstímulo;
            tiemposReaccion.push(rt);
            if (esObjetivo) aciertos++;
            else errores++;
            puedeResponder = false;
            window.removeEventListener('keydown', handler);
            setTimeout(() => {
                indice++;
                mostrarSiguiente();
            }, 300);
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
            if (puedeResponder) {
                // No respondió a tiempo → omisión
                if (esObjetivo) errores++;
                else aciertos++; // No es objetivo y no pulsó, es correcto (no error)
                puedeResponder = false;
                window.removeEventListener('keydown', handler);
                indice++;
                mostrarSiguiente();
            }
        }, 1500);
    }

    function finalizarTest() {
        const precision = aciertos / (aciertos + errores) || 0;
        const rtMedio = tiemposReaccion.length ? tiemposReaccion.reduce((a,b)=>a+b,0)/tiemposReaccion.length : 0;
        const habilidades = [];
        if (precision < 0.7) habilidades.push("memoria_trabajo");
        if (precision < 0.6) habilidades.push("atencion_sostenida");
        if (errores > 10) habilidades.push("control_inhibitorio");
        if (rtMedio > 800) habilidades.push("velocidad_cognitiva");
        callback({
            testId, timestamp: Date.now(),
            metrics: { nivelAlcanzado: nivel, aciertos, errores, precision, tiempoMedioReaccionMs: Math.round(rtMedio) },
            habilidadesDebiles: habilidades
        });
        startBtn.classList.remove("hidden");
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 1;
        secuencia = generarSecuencia(25); // 25 estímulos para 1-back
        indice = 0; aciertos = 0; errores = 0; tiemposReaccion = [];
        inicioTest = performance.now();
        puedeResponder = true;
        mostrarSiguiente();
        if (status) status.textContent = "N-Back (1-back): presiona ESPACIO si el número es igual al inmediato anterior";
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

    function generarSecuencia() {
        const seq = [];
        for (let i = 0; i < 30; i++) {
            seq.push(Math.random() < 0.7); // 70% Go (X)
        }
        return seq;
    }

    function mostrarSiguiente() {
        if (indice >= estímulos.length) return finalizarTest();
        const esGo = estímulos[indice];
        const letra = esGo ? 'X' : 'O';
        container.innerHTML = makeResponsiveContainer(`<div class="text-7xl sm:text-8xl font-bold text-white text-center">${letra}</div>`);
        tiempoInicioEstímulo = performance.now();
        puedeResponder = true;

        const handler = (e) => {
            if (e.code !== 'Space' || !puedeResponder) return;
            e.preventDefault();
            const rt = performance.now() - tiempoInicioEstímulo;
            tiempos.push(rt);
            if (esGo) aciertos++;
            else comisiones++;
            puedeResponder = false;
            window.removeEventListener('keydown', handler);
            setTimeout(() => {
                indice++;
                mostrarSiguiente();
            }, 300);
        };
        window.addEventListener('keydown', handler);
        setTimeout(() => {
            if (puedeResponder) {
                if (esGo) omisiones++;
                puedeResponder = false;
                window.removeEventListener('keydown', handler);
                indice++;
                mostrarSiguiente();
            }
        }, 1000);
    }

    function finalizarTest() {
        const precision = aciertos / (aciertos + omisiones) || 0;
        const rtMedio = tiempos.length ? tiempos.reduce((a,b)=>a+b,0)/tiempos.length : 0;
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
        if (status) status.textContent = "Go/No-Go: Presiona ESPACIO solo para 'X'";
    };
}
