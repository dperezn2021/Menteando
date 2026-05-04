
const SESION_TESTS_KEY = "tests_recomendados_sesion";
const EXPIRACION_HORAS = 0.25;
const ICONOS_CATEGORIA = {
    memoria: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke-width="2"/>
        </svg>
    `,
    atencion: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
    control: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="9" stroke-width="2"/>
        </svg>
    `,
    reflejos: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `
};

// Añade esta función para resetear tests completados después de X días
function resetearTestsCompletados() {
    const perfil = getperfil();
    const ultimoReset = localStorage.getItem("ultimoResetTests");
    const hoy = new Date().toDateString();
    
    if (ultimoReset !== hoy) {
        // Resetear tests completados cada día (o semana)
        perfil.testsCompletados = {};
        saveperfil(perfil);
        localStorage.setItem("ultimoResetTests", hoy);
        localStorage.removeItem(SESION_TESTS_KEY);
        console.log("✅ Tests completados reseteados");
    }
}

// Llama a esta función al inicio
resetearTestsCompletados();

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
    console.log("🔄 Generando nuevos tests recomendados...");
    const catalogo = window.getCatalogoTests?.() || [];
    const testsNoCompletados = catalogo.filter(t => !t.completado);
    if (testsNoCompletados.length === 0) return [];

    // Obtener habilidades ordenadas de menor a mayor
    const habilidades = [
        { nombre: "atencion", valor: perfil.atencion || 0, porcentaje: Math.round((perfil.atencion || 0) * 100) },
        { nombre: "memoria", valor: perfil.memoria || 0, porcentaje: Math.round((perfil.memoria || 0) * 100) },
        { nombre: "control", valor: perfil.control || 0, porcentaje: Math.round((perfil.control || 0) * 100) },
        { nombre: "reflejos", valor: perfil.reflejos || 0, porcentaje: Math.round((perfil.reflejos || 0) * 100) }
    ];
    
    // Ordenar de menor a mayor
    const habilidadesOrdenadas = [...habilidades].sort((a, b) => a.valor - b.valor);
    
    console.log("📊 TUS HABILIDADES (de peor a mejor):");
    habilidadesOrdenadas.forEach((h, i) => {
        console.log(`   ${i+1}. ${h.nombre}: ${h.porcentaje}%`);
    });

    const seleccionados = [];
    const yaConsiderados = new Set();

    // PRIMERO: 2 tests de la habilidad MÁS BAJA
    const habilidadPeor = habilidadesOrdenadas[0];
    console.log(`🎯 Seleccionando 2 tests de ${habilidadPeor.nombre} (${habilidadPeor.porcentaje}%)`);
    
    let disponiblesPeor = testsNoCompletados.filter(t => {
        const categoriaMatch = t.categoria?.toLowerCase() === habilidadPeor.nombre;
        const noConsiderado = !yaConsiderados.has(t.id);
        return categoriaMatch && noConsiderado;
    });
    
    disponiblesPeor = shuffleArrayDeterminista(disponiblesPeor, habilidadPeor.valor * 10000);
    
    for (let test of disponiblesPeor) {
        if (seleccionados.length >= 2) break;
        seleccionados.push(test);
        yaConsiderados.add(test.id);
        console.log(`   ✅ Test ${seleccionados.length}: ${test.nombre} (${habilidadPeor.nombre})`);
    }

    // SEGUNDO: 1 test de la SEGUNDA MÁS BAJA
    if (seleccionados.length < limite && habilidadesOrdenadas.length > 1) {
        const habilidadSegunda = habilidadesOrdenadas[1];
        console.log(`🎯 Seleccionando 1 test de ${habilidadSegunda.nombre} (${habilidadSegunda.porcentaje}%)`);
        
        let disponiblesSegunda = testsNoCompletados.filter(t => {
            const categoriaMatch = t.categoria?.toLowerCase() === habilidadSegunda.nombre;
            const noConsiderado = !yaConsiderados.has(t.id);
            return categoriaMatch && noConsiderado;
        });
        
        disponiblesSegunda = shuffleArrayDeterminista(disponiblesSegunda, habilidadSegunda.valor * 10000);
        
        for (let test of disponiblesSegunda) {
            if (seleccionados.length >= limite) break;
            seleccionados.push(test);
            yaConsiderados.add(test.id);
            console.log(`   ✅ Test ${seleccionados.length}: ${test.nombre} (${habilidadSegunda.nombre})`);
        }
    }

    // TERCERO: Si aún faltan, completar con la tercera o aleatorios
    if (seleccionados.length < limite && habilidadesOrdenadas.length > 2) {
        const habilidadTercera = habilidadesOrdenadas[2];
        console.log(`🎯 Completando con test de ${habilidadTercera.nombre}`);
        
        let disponiblesTercera = testsNoCompletados.filter(t => {
            const categoriaMatch = t.categoria?.toLowerCase() === habilidadTercera.nombre;
            const noConsiderado = !yaConsiderados.has(t.id);
            return categoriaMatch && noConsiderado;
        });
        
        disponiblesTercera = shuffleArrayDeterminista(disponiblesTercera, habilidadTercera.valor * 10000);
        
        for (let test of disponiblesTercera) {
            if (seleccionados.length >= limite) break;
            seleccionados.push(test);
            yaConsiderados.add(test.id);
            console.log(`   ✅ Test ${seleccionados.length}: ${test.nombre} (${habilidadTercera.nombre})`);
        }
    }

    // Si aún faltan, completar con cualquier test
    if (seleccionados.length < limite) {
        console.log("   ⚠️ Completando con tests generales...");
        let restantes = testsNoCompletados.filter(t => !yaConsiderados.has(t.id));
        restantes = shuffleArrayDeterminista(restantes, Date.now());
        while (seleccionados.length < limite && restantes.length > 0) {
            const test = restantes.shift();
            seleccionados.push(test);
            yaConsiderados.add(test.id);
            console.log(`   📝 Añadido: ${test.nombre} (${test.categoria})`);
        }
    }

    console.log(`🎯 Tests finales (${seleccionados.length}/${limite}):`);
    seleccionados.forEach(t => console.log(`   - ${t.nombre} (${t.categoria})`));

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
    
    return nuevaSesion.tests;
}

// Función auxiliar para ordenar habilidades
function obtenerHabilidadesOrdenadas(perfil) {
    return [
        { nombre: "atencion", valor: perfil.atencion },
        { nombre: "memoria", valor: perfil.memoria },
        { nombre: "control", valor: perfil.control },
        { nombre: "reflejos", valor: perfil.reflejos }
    ].sort((a, b) => a.valor - b.valor);
}

// Generar tarjeta (con soporte para bloqueo si completado)
function generarTarjeta(test) {
    const { nombre, categoria, url, completado } = test;

    const coloresCategoria = {
        memoria: { fondo: "bg-emerald-400/20", icono: "text-emerald-500 dark:text-emerald-400" },
        atencion: { fondo: "bg-indigo-400/20", icono: "text-indigo-500 dark:text-indigo-400" },
        control: { fondo: "bg-amber-400/20", icono: "text-amber-500 dark:text-amber-400" },
        reflejos: { fondo: "bg-red-400/20", icono: "text-red-500 dark:text-red-400" }
    };

    const { fondo, icono } = coloresCategoria[categoria] || coloresCategoria.atencion;

    const iconoSVG = ICONOS_CATEGORIA[categoria] || ICONOS_CATEGORIA.atencion;

    const fondoNormal = "bg-slate-100 dark:bg-slate-700/40";
    const fondoHover = "hover:bg-slate-200 dark:hover:bg-slate-600";
    const fondoBloqueado = "bg-slate-300 dark:bg-slate-800 opacity-60";
    const bordeHover = "hover:border-blue-500/50";

    const tarjetaBase =
        "flex items-center justify-between p-3 rounded-lg transition cursor-pointer border border-transparent";

    const tarjetaFondo = completado
        ? `${fondoBloqueado} cursor-not-allowed`
        : `${fondoNormal} ${fondoHover} ${bordeHover}`;

    const textoNombre = completado
        ? "font-semibold text-sm text-slate-500 dark:text-slate-500 line-through"
        : "font-semibold text-sm text-slate-900 dark:text-white";

    const textoTiempo = "text-xs text-slate-500 dark:text-slate-400";

    const tag = completado ? "div" : "a";
    const href = completado ? "" : `href="${url}"`;

    return `
        <${tag} ${href} class="${tarjetaBase} ${tarjetaFondo} my-5">
            <div class="flex items-center gap-3">
                <div class="p-2 ${fondo} rounded ${icono}">
                    ${iconoSVG}
                </div>
                <div>
                    <p class="${textoNombre}">${nombre}</p>
                    <p class="${textoTiempo}">Enfoque: ${categoria}</p>
                </div>
            </div>

            <span class="text-xs font-bold ${icono}">
                ${completado ? "COMPLETADO" : "COMENZAR"}
            </span>
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
