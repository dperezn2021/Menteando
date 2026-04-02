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

    // Generar badges para TODAS las habilidades del test
    const skillsHTML = test.habilidades.map(skill => {
        const definicion = window.getSkillDefinition(skill);
        const colorLetra = "text-" + definicion.accent + "-500";
        const colorFondo = "bg-" + definicion.accent + "-200"
        const label = definicion?.label || skill;
        return `<span class="px-3 py-1 rounded-full text-sm font-bold ${colorFondo} ${colorLetra}">${label}</span>`;
    }).join('');

    const howItWorks = (test.bloques || []).map((step, index) => `
        <li class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center flex-shrink-0">${index + 1}</span>
            <span class="text-slate-600 dark:text-slate-300 leading-7">${step}</span>
        </li>
    `).join("");

    content.innerHTML = `
        <section class="max-w-7xl mx-auto py-8 lg:py-10">
            <div class="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-8">

                <!-- COLUMNA IZQUIERDA: TEST INTERACTIVO -->
                <article class="flex flex-col h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">

                    <div class="relative flex-1 aspect-video bg-slate-950 flex items-center justify-center">
                        <div id="container" class="w-full h-full flex items-center justify-center"></div>
                    </div>

                    <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                        <button id="start-btn"
                            class="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">
                            Iniciar ${test.nombre}
                        </button>
                    </div>
                </article>

                <!-- COLUMNA DERECHA: INFORMACIÓN -->
                <aside class="flex flex-col gap-6">

                    <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                        <span class="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold uppercase tracking-[0.2em] mb-5">
                            ${test.heroEyebrow || "Test cognitivo"}
                        </span>

                        <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                            ${test.nombre}
                        </h2>

                        <p class="text-lg leading-8 text-slate-600 dark:text-slate-300 mb-6">
                            ${test.descripcion}
                        </p>

                        <div class="flex flex-wrap gap-3">
                                ${skillsHTML}
                        </div>
                    </div>

                    <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-5">Cómo funciona</h3>
                        <ol class="space-y-4">${howItWorks}</ol>
                    </div>

                </aside>
            </div>

            <!-- RESULTADOS -->
            <div id="result" class="hidden mt-10 p-8 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl"></div>

        </section>
    `;

    lanzarLogicaDelTest(testId);
}

window.initTestDetailPage = function initTestDetailPage(testId) {
    const perfil = typeof window.getperfil === "function" ? window.getperfil() : null;
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const root = document.documentElement;
    const headerAvatar = document.getElementById("perfil-avatar-header");
    const headerApodo = document.getElementById("perfil-apodo-header");

    if (perfil?.avatar && headerAvatar) headerAvatar.src = perfil.avatar.replace("../", "../../../");
    if (perfil?.apodo && headerApodo) headerApodo.textContent = perfil.apodo;

    const syncThemeButton = () => {
        const isDark = root.classList.contains("dark");
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? "\u2600\uFE0F" : "\uD83C\uDF19";
            themeToggleBtn.setAttribute("aria-label", isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
        }
    };

    themeToggleBtn?.addEventListener("click", () => {
        const willUseDark = !root.classList.contains("dark");
        root.classList.toggle("dark", willUseDark);
        root.classList.toggle("light", !willUseDark);
        localStorage.setItem("theme", willUseDark ? "dark" : "light");
        syncThemeButton();
    });

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
        aciertos: '✅ Aciertos',
        errores: '❌ Errores totales',
        precision: '🎯 Precisión',
        tiempoTotalMs: '⏱️ Tiempo total (ms)',
        tiempoMedioRespuestaMs: '⚡ Tiempo medio respuesta (ms)',
        spanMaximo: '🧠 Span máximo',
        erroresComision: '⚠️ Errores de comisión',
        erroresOmision: '👻 Errores de omisión',
        totalMarcados: '✏️ Total marcados'
    };

    const metricasMostrables = Object.entries(metrics)
        .filter(([key, value]) => value !== undefined && value !== null && typeof value !== 'object')
        .map(([key, value]) => {
            const nombre = nombreMetrica[key] || key;
            const valorFormateado = typeof value === 'number' ? value.toFixed(2) : value;
            return `<li><strong>${nombre}:</strong> ${valorFormateado}</li>`;
        });

    if (metricasMostrables.length === 0) {
        return '<p>No hay métricas disponibles</p>';
    }

    return `<ul class="space-y-1">${metricasMostrables.join('')}</ul>`;
}

function normalizarSkill(skill) {
    if (typeof skill !== 'string') return '';
    return skill
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
}

function recomendarJuegos(habilidadesDebiles) {
    const juegos = window.catalogoJuegos || window.CATALOGO_JUEGOS || []; // ← prueba ambos
    if (!habilidadesDebiles.length) return [];

    const skillsDebilesNorm = habilidadesDebiles.map(s => normalizarSkill(s));
    console.log("🔎 Habilidades débiles normalizadas:", skillsDebilesNorm);

    return juegos.filter(juego => {
        const skillsJuegoNorm = juego.skills.map(s => normalizarSkill(s));
        const coincide = skillsDebilesNorm.some(skill => skillsJuegoNorm.includes(skill));
        if (coincide) console.log(`✅ Juego "${juego.nombre}" coincide con skills:`, skillsJuegoNorm);
        return coincide;
    });
}

function renderTarjetaJuego(juego, completado = false) {
    const tag = completado ? 'div' : 'a';
    const href = completado ? '' : `href="../${juego.url}"`;
    const tarjetaFondo = completado ? 'bg-green-50 dark:bg-green-950/30' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700';
    const textoCompletado = completado ? 'line-through text-green-600 dark:text-green-400' : '';
    const texto = completado ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400';
    const fondo = completado ? 'bg-green-500' : 'bg-blue-500';

    const categoria = juego.categoria || 'Cognitivo';
    const nombre = juego.nombre;

    return `
        <${tag} ${href}
            class="w-full my-3 p-3 ${tarjetaFondo} rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-${completado ? "default" : "pointer"} transition-all duration-200">

            <div>
                <div class="${textoCompletado} dark:text-white text-base font-bold">${nombre}</div>
                <div class="${texto} text-xs font-bold">Enfoque: ${categoria}</div>
            </div>

            <div class="w-5 h-5 ${fondo} rounded-full shadow-sm"></div>
        </${tag}>
    `;
}

function renderResultadosUniversales(resultado, habilidadesDebiles, juegosRecomendados) {
    const resultBox = document.getElementById("result");
    resultBox.classList.remove("hidden");

    const juegosHTML = juegosRecomendados.length
        ? juegosRecomendados.map(juego => renderTarjetaJuego(juego, false)).join('')
        : '<p class="text-slate-500 dark:text-slate-400">No hay juegos recomendados por ahora.</p>';

    resultBox.innerHTML = `
        <h3 class="text-3xl font-black mb-4">Resultados del test</h3>

        <div class="text-sm bg-slate-900 text-slate-200 p-4 rounded-xl mb-4 overflow-auto">
            ${renderMetricas(resultado.metrics)}
        </div>

        <h4 class="text-xl font-bold mt-6 mb-3">Habilidades con más dificultad</h4>

        ${habilidadesDebiles.length
            ? `<ul class="mb-6 space-y-1">
                ${habilidadesDebiles.map(h => `
                    <li class="flex items-center gap-2">
                        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span class="text-slate-700 dark:text-slate-300">${window.getSkillDefinition(h)?.label || h}</span>
                    </li>
                `).join("")}
            </ul>
            <h4 class="text-xl font-bold mb-3">🎮 Juegos recomendados para mejorar</h4>
            <div class="space-y-2">
                ${juegosHTML}
            </div>`
            : `<p class="mb-6 text-green-600 font-semibold">
                ¡Buen trabajo! No se detectan dificultades significativas.
            </p>
            <h4 class="text-xl font-bold mb-3">🎮 Sigue entrenando con estos juegos</h4>
            <div class="space-y-2">
                ${juegosHTML}
            </div>`
        }
    `;
}

function procesarResultadosTest(resultado) {
    const test = getTestById(resultado.testId);
    if (!test) return;

    const juegosRecomendados = recomendarJuegos(resultado.habilidadesDebiles);
    renderResultadosUniversales(resultado, resultado.habilidadesDebiles, juegosRecomendados);

    const perfil = window.getperfil();
    if (!perfil.tests[resultado.testId]) perfil.tests[resultado.testId] = [];
    perfil.tests[resultado.testId].push({
        testId: resultado.testId,
        timestamp: resultado.timestamp,
        metrics: resultado.metrics,
        habilidadesDebiles: resultado.habilidadesDebiles
    });
    window.saveperfil(perfil);
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
        case "corsi":
            initCorsiLogic(testId, procesarResultadosTest);
            return;
        case "d2":
            initD2Logic(testId, procesarResultadosTest);
            return;
        default:
            console.warn("⚠️ Test sin lógica asignada:", testId);
            return;
    }
}

// ======================================================
//  TEST CORSI — evalúa memoria_espacial, memoria_trabajo,
//  velocidad_cognitiva, atencion_sostenida
// ======================================================
function initCorsiLogic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    if (!container || !startBtn) {
        console.error("❌ No se encontró el contenedor del test Corsi");
        return;
    }

    let nivel = 2;
    let secuencia = [];
    let errores = 0;
    let erroresPorNivel = {};
    let tiemposRespuesta = [];
    let inicioTest = 0;
    let puedeResponder = false;

    function actualizarStatus() {
        if (!status) return;
        status.textContent = `Nivel: ${nivel} · Errores: ${errores}/2`;
    }

    function generarSecuencia(n) {
        return Array.from({ length: n }, () => Math.floor(Math.random() * 9));
    }

    function renderBloques() {
        container.innerHTML = `
            <div class="grid grid-cols-3 gap-4 w-80">
                ${Array.from({ length: 9 }).map((_, i) => `
                    <div data-id="${i}" class="w-24 h-24 rounded-xl bg-slate-700 cursor-pointer transition"></div>
                `).join("")}
            </div>
        `;
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
                }, 150);
                return;
            }

            bloques[seq[i]].classList.add("bg-blue-500");
            i++;
        }, 500);
    }

    function iniciarNivel() {
        actualizarStatus();
        renderBloques();
        secuencia = generarSecuencia(nivel);
        erroresPorNivel[nivel] = erroresPorNivel[nivel] || 0;

        iluminarSecuencia(secuencia, () => {
            let respuesta = [];
            let inicioRespuesta = performance.now();

            container.onclick = (e) => {
                if (!puedeResponder) return;

                const id = e.target.dataset.id;
                if (id === undefined) return;

                tiemposRespuesta.push(performance.now() - inicioRespuesta);
                inicioRespuesta = performance.now();

                respuesta.push(Number(id));

                if (respuesta.length === secuencia.length) {
                    if (JSON.stringify(respuesta) === JSON.stringify(secuencia)) {
                        nivel++;
                    } else {
                        errores++;
                        erroresPorNivel[nivel]++;
                    }

                    if (errores >= 2) return finalizarTest();
                    iniciarNivel();
                }
            };
        });
    }

    function finalizarTest() {
        container.innerHTML = "";
        startBtn.classList.remove("hidden");

        const spanMaximo = nivel - 1;
        const tiempoTotalMs = performance.now() - inicioTest;
        const tiempoMedioRespuestaMs = tiemposRespuesta.length
            ? tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length
            : 0;

        const metrics = {
            aciertos: spanMaximo,
            errores: errores,
            precision: spanMaximo / (spanMaximo + errores) || 0,
            tiempoTotalMs: Math.round(tiempoTotalMs),
            tiempoMedioRespuestaMs: Math.round(tiempoMedioRespuestaMs),
            spanMaximo: spanMaximo,
            erroresPorNivel: erroresPorNivel
        };

        // Detectar habilidades débiles según umbrales realistas
        const habilidadesDebiles = [];
        if (spanMaximo < 4) habilidadesDebiles.push("memoria_espacial");
        if (errores >= 2) habilidadesDebiles.push("memoria_trabajo");
        if (tiempoMedioRespuestaMs > 900) habilidadesDebiles.push("velocidad_cognitiva");
        const ultimoNivel = Math.max(...Object.keys(erroresPorNivel).map(Number), 0);
        if (erroresPorNivel[ultimoNivel] > 0) habilidadesDebiles.push("atencion_sostenida");

        console.log("🔍 Corsi - Habilidades débiles:", habilidadesDebiles);

        callback({
            testId,
            timestamp: Date.now(),
            metrics,
            habilidadesDebiles
        });
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        nivel = 2;
        errores = 0;
        erroresPorNivel = {};
        tiemposRespuesta = [];
        inicioTest = performance.now();
        iniciarNivel();
    };
}

// ======================================================
//  TEST d2 — evalúa atencion_selectiva, velocidad_cognitiva,
//  control_inhibitorio
// ======================================================
function initD2Logic(testId, callback) {
    const container = document.getElementById("container");
    const startBtn = document.getElementById("start-btn");
    const status = document.getElementById("status");

    if (!container || !startBtn) {
        console.error("❌ No se encontró el contenedor del test d2");
        return;
    }

    let lineaActual = 0;
    const totalLineas = 5;
    const tiempoPorLinea = 20000; // 10 segundos por línea
    const cuadrosPorLinea = 50;
    let timer = null;

    let totalMarcados = 0;
    let aciertos = 0;
    let erroresComision = 0;
    let erroresOmision = 0;
    let inicioTest = 0;

    function actualizarStatus() {
        if (!status) return;
        status.textContent = `Línea: ${lineaActual + 1}/${totalLineas}`;
    }

    function generarLinea() {
        const letras = ["d", "p"];
        const rayas = [1, 2, 3, 4];
        return Array.from({ length: cuadrosPorLinea }).map(() => ({
            letra: letras[Math.floor(Math.random() * letras.length)],
            nRayas: rayas[Math.floor(Math.random() * rayas.length)]
        }));
    }

    function renderLinea(linea) {
        container.innerHTML = `
            <div class="flex flex-wrap gap-2 w-full justify-center">
                ${linea.map((stim, i) => `
                    <div data-id="${i}"
                        class="px-2 py-1 rounded-lg border border-slate-600 cursor-pointer text-white text-lg select-none hover:bg-slate-700 transition">
                        ${stim.letra}<sub>${stim.nRayas}</sub>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function procesarLinea(linea, marcados) {
        linea.forEach((stim, i) => {
            const esObjetivo = stim.letra === "d" && stim.nRayas === 2;
            const marcado = marcados.includes(i);

            if (marcado) {
                totalMarcados++;
                if (esObjetivo) aciertos++;
                else erroresComision++;
            } else {
                if (esObjetivo) erroresOmision++;
            }
        });
    }

    function iniciarLinea() {
        if (lineaActual >= totalLineas) return finalizarTest();

        actualizarStatus();
        const linea = generarLinea();
        renderLinea(linea);

        let marcados = [];

        container.onclick = (e) => {
            const box = e.target.closest("[data-id]");
            if (!box) return;
            const id = Number(box.dataset.id);
            box.classList.toggle("bg-blue-600");
            if (marcados.includes(id)) {
                marcados = marcados.filter(x => x !== id);
            } else {
                marcados.push(id);
            }
        };

        timer = setTimeout(() => {
            procesarLinea(linea, marcados);
            lineaActual++;
            iniciarLinea();
        }, tiempoPorLinea);
    }

    function finalizarTest() {
        clearTimeout(timer);
        container.innerHTML = "";
        startBtn.classList.remove("hidden");

        const erroresTotales = erroresComision + erroresOmision;
        const precision = (aciertos + erroresComision) > 0 ? aciertos / (aciertos + erroresComision) : 0;
        const tiempoTotalMs = performance.now() - inicioTest;

        const metrics = {
            aciertos: aciertos,
            errores: erroresTotales,
            precision: precision,
            tiempoTotalMs: Math.round(tiempoTotalMs),
            tiempoMedioRespuestaMs: 0,
            erroresComision: erroresComision,
            erroresOmision: erroresOmision,
            totalMarcados: totalMarcados
        };

        // Detectar habilidades débiles
        const habilidadesDebiles = [];
        const precisionSelectiva = totalMarcados > 0 ? aciertos / totalMarcados : 0;
        if (precisionSelectiva < 0.7) habilidadesDebiles.push("atencion_selectiva");

        const estimulosPorLinea = (totalMarcados + erroresOmision) / totalLineas;
        if (estimulosPorLinea < cuadrosPorLinea * 0.6) habilidadesDebiles.push("velocidad_cognitiva");

        if (erroresComision > 5) habilidadesDebiles.push("control_inhibitorio");

        console.log("🔍 d2 - Habilidades débiles:", habilidadesDebiles);

        callback({
            testId,
            timestamp: Date.now(),
            metrics,
            habilidadesDebiles
        });
    }

    startBtn.onclick = () => {
        startBtn.classList.add("hidden");
        lineaActual = 0;
        totalMarcados = 0;
        aciertos = 0;
        erroresComision = 0;
        erroresOmision = 0;
        inicioTest = performance.now();
        iniciarLinea();
    };
}