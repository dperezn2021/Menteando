
const SESION_TESTS_KEY = "tests_recomendados_sesion";
const EXPIRACION_HORAS = 1;

// Función para barajar un array de forma determinista con una semilla
function shuffleArrayDeterminista(array, semilla) {
    const resultado = [...array];
    let seed = semilla;
    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(seed * (i + 1)) % (i + 1);
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
        seed = seed * 1664525 + 1013904223; // LCG
    }
    return resultado;
}

function obtenerSesionTests(perfil, limite = 3) {
    const ahora = Date.now();
    const guardado = localStorage.getItem(SESION_TESTS_KEY);
    let sesion = guardado ? JSON.parse(guardado) : null;

    let sesionValida = false;
    if (sesion && sesion.expiraEn && sesion.expiraEn > ahora) {
        sesionValida = true;
        console.log(`Sesión válida hasta ${new Date(sesion.expiraEn).toLocaleString()}`);
    } else if (sesion) {
        console.log(`Sesión expirada (expiraba ${new Date(sesion.expiraEn).toLocaleString()})`);
    } else {
        console.log("No hay sesión guardada");
    }

    if (sesionValida) {
        const catalogo = window.getCatalogoTests?.() || [];
        const testsActualizados = sesion.tests.map(testGuardado => {
            const testActual = catalogo.find(t => t.id === testGuardado.id);
            return {
                ...testGuardado,
                completado: testActual ? testActual.completado : testGuardado.completado
            };
        });
        return testsActualizados;
    }

    // --- Generar nueva selección ---
    console.log("Generando nueva selección de tests...");
    const catalogo = window.getCatalogoTests?.() || [];
    const testsNoCompletados = catalogo.filter(t => !t.completado);
    if (testsNoCompletados.length === 0) return [];

    // Obtener habilidades ordenadas de menor a mayor
    const habilidadesOrdenadas = [
        { nombre: "atencion", valor: perfil.atencion },
        { nombre: "memoria",  valor: perfil.memoria },
        { nombre: "control",  valor: perfil.control },
        { nombre: "reflejos", valor: perfil.reflejos }
    ].sort((a, b) => a.valor - b.valor);

    // Semilla que cambia cada 2 minutos (para pruebas). En producción: cada 8 horas.
    const intervaloMs = 2 * 60 * 1000; // 2 minutos
    const semilla = Math.floor(ahora / intervaloMs);
    console.log(`Semilla actual: ${semilla}`);

    const seleccionados = [];
    const yaConsiderados = new Set();

    for (let habilidad of habilidadesOrdenadas) {
        if (seleccionados.length >= limite) break;
        let disponibles = testsNoCompletados.filter(t =>
            t.categoria?.toLowerCase() === habilidad.nombre &&
            !yaConsiderados.has(t.id)
        );
        // Barajar de forma determinista según la semilla
        disponibles = shuffleArrayDeterminista(disponibles, semilla);
        for (let test of disponibles) {
            if (seleccionados.length >= limite) break;
            seleccionados.push(test);
            yaConsiderados.add(test.id);
        }
    }

    // Rellenar si faltan (con cualquier test no completado, también barajado)
    if (seleccionados.length < limite) {
        let restantes = testsNoCompletados.filter(t => !yaConsiderados.has(t.id));
        restantes = shuffleArrayDeterminista(restantes, semilla + 1);
        seleccionados.push(...restantes.slice(0, limite - seleccionados.length));
    }

    console.log("Tests seleccionados:", seleccionados.map(t => t.nombre));

    // Guardar sesión con expiración
    const nuevaSesion = {
        tests: seleccionados.map(t => ({
            id: t.id,
            nombre: t.nombre,
            categoria: t.categoria,
            url: t.url,
            completado: false
        })),
        expiraEn: ahora + EXPIRACION_HORAS * 60 * 60 * 1000,
        generadoEn: ahora
    };
    localStorage.setItem(SESION_TESTS_KEY, JSON.stringify(nuevaSesion));
    console.log(`Nueva sesión guardada, expira ${new Date(nuevaSesion.expiraEn).toLocaleString()}`);
    return nuevaSesion.tests;
}

// Función auxiliar para ordenar habilidades
function obtenerHabilidadesOrdenadas(perfil) {
    return [
        { nombre: "atencion", valor: perfil.atencion },
        { nombre: "memoria",  valor: perfil.memoria },
        { nombre: "control",  valor: perfil.control },
        { nombre: "reflejos", valor: perfil.reflejos }
    ].sort((a, b) => a.valor - b.valor);
}

// Generar tarjeta (con soporte para bloqueo si completado)
function generarTarjeta(test) {
    const { nombre, categoria, url, completado } = test;

    const coloresCategoria = {
        memoria:  { fondo: "bg-green-500",  texto: "text-green-500" },
        atencion: { fondo: "bg-indigo-500", texto: "text-indigo-500" },
        control:  { fondo: "bg-amber-500",  texto: "text-amber-500" },
        reflejos: { fondo: "bg-red-500",    texto: "text-red-500" }
    };
    const { fondo, texto } = coloresCategoria[categoria] || coloresCategoria.reflejos;

    const tarjetaFondo = completado ? "bg-gray-200 dark:bg-gray-700 opacity-75" : "bg-slate-50 dark:bg-slate-800";
    const textoCompletado = completado ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-white";

    const tag = completado ? "div" : "a";
    const href = completado ? "" : `href="${url}"`;

    return `
        <${tag} ${href}
            class="w-full my-4 p-3 ${tarjetaFondo} rounded-lg border ${completado ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'} border-slate-100 dark:border-slate-600 flex justify-between items-center">
            <div>
                <div class="${textoCompletado} text-base font-bold">${nombre}</div>
                <div class="${texto} text-xs font-bold">Enfoque: ${categoria}</div>
            </div>
            <div class="w-5 h-5 ${fondo} rounded"></div>
        </${tag}>
    `;
}

// Renderizar los tests en el grid usando la sesión actual (no recalcula hasta expirar)
function renderTestsRecomendados(limite = 3) {
    const contenedor = document.getElementById("tests-grid");
    if (!contenedor) return;

    const perfil = getperfil();
    const testsSesion = obtenerSesionTests(perfil, limite);

    if (testsSesion.length === 0) {
        contenedor.innerHTML = `<div class="text-center text-slate-500 dark:text-slate-400 p-4">
            ✅ ¡Todos los tests completados! Vuelve más tarde.
        </div>`;
        return;
    }

    // Asegurar que cada test tiene el estado de completado actualizado (por si se completó después de guardar la sesión)
    const catalogo = typeof window.getCatalogoTests === "function" ? window.getCatalogoTests() : [];
    const testsConEstado = testsSesion.map(tSesion => {
        const actual = catalogo.find(c => c.id === tSesion.id);
        return { ...tSesion, completado: actual ? actual.completado : tSesion.completado };
    });

    contenedor.innerHTML = testsConEstado.map(generarTarjeta).join("");
}

// Notificar que se completó un test (se llama desde procesarResultadosTest)
function notificarTestCompletado() {
    // No regeneramos la selección, solo refrescamos la UI para que la tarjeta se bloquee
    // (el estado "completado" ya se actualizó en el perfil y en el catálogo)
    setTimeout(() => {
        renderTestsRecomendados(3);
    }, 100);
}

function forzarExpiracionTests() {
    localStorage.removeItem(SESION_TESTS_KEY);
    location.reload(); // o llama a renderTestsRecomendados()
}

// ----- 3. Exponer funciones globales -----
window.renderTestsRecomendados = renderTestsRecomendados;
window.notificarTestCompletado = notificarTestCompletado;
window.forzarExpiracionTests = forzarExpiracionTests;
