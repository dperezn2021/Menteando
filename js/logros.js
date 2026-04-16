

// Definición de medallas (pueden ser las mismas que los logros)
const MEDALLAS = [
    {
        id: "reflejos_75",
        nombre: "Maestro de los reflejos",
        descripcion: "Consigue más de un 75% en Reflejos",
        categoria: "reflejos",
        color: "red",
        icono: "../assets/icon/medallas/reflejos_75.webp",
        completa: false,

        condicion: (perfil) => {
            const actual = Math.round(perfil.reflejos * 100);
            const objetivo = 75;
            return { actual, objetivo };
        }
    },
    {
        id: "atencion_80",
        nombre: "Atención de élite",
        descripcion: "Alcanza un 80% en Atención",
        categoria: "atencion",
        color: "blue",
        icono: "../assets/icon/medallas/reflejos_75.webp",

        completa: false,

        condicion: (perfil) => {
            const actual = Math.round(perfil.atencion * 100);
            const objetivo = 80;
            return { actual, objetivo };
        }
    },
    {
        id: "memoria_70",
        nombre: "Memoria prodigiosa",
        descripcion: "Supera el 70% en Memoria",
        categoria: "memoria",
        color: "green",
        icono: "../assets/icon/medallas/reflejos_75.webp",

        completa: false,

        condicion: (perfil) => {
            const actual = Math.round(perfil.memoria * 100);
            const objetivo = 70;
            return { actual, objetivo };
        }
    },
    {
        id: "control_75",
        nombre: "Control total",
        descripcion: "Logra un 75% en Control inhibitorio",
        categoria: "control",
        color: "amber",
        icono: "../assets/icon/medallas/reflejos_75.webp",

        completa: false,

        condicion: (perfil) => {
            const actual = Math.round(perfil.control * 100);
            const objetivo = 75;
            return { actual, objetivo };
        }
    },
    {
        id: "racha_7",
        nombre: "Racha imparable",
        descripcion: "Mantén una racha de 7 días jugando",
        categoria: "racha",
        color: "purple",
        icono: "../assets/icon/medallas/reflejos_75.webp",

        completa: false,

        condicion: (perfil) => {
            const actual = perfil.racha || 0;
            const objetivo = 7;
            return { actual, objetivo };
        }
    },
    {
        id: "sesiones_20",
        nombre: "Dedicación total",
        descripcion: "Completa 20 sesiones de juego",
        categoria: "sesiones",
        color: "cyan",
        icono: "../assets/icon/medallas/reflejos_75.webp",

        completa: false,
        condicion: (perfil) => {
            const actual = perfil.sesiones || 0;
            const objetivo = 20;
            return { actual, objetivo };
        }
    }
];

// key para localStorage donde guardamos las medallas completadas
const STORAGE_KEY_MEDALLAS = "medallas_completadas";

// Leer medallas completadas desde localStorage (devuelve Set de ids)
function obtenerMedallasCompletadasGuardadas() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_MEDALLAS);
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) {
        console.error("Error leyendo medallas guardadas:", e);
        return new Set();
    }
}

// Guardar Set de ids en localStorage
function guardarMedallasCompletadasSet(set) {
    try {
        localStorage.setItem(STORAGE_KEY_MEDALLAS, JSON.stringify(Array.from(set)));
    } catch (e) {
        console.error("Error guardando medallas:", e);
    }
}

// Marcar una medalla como completa (persistir)
function marcarMedallaComoCompleta(id) {
    const set = obtenerMedallasCompletadasGuardadas();
    if (!set.has(id)) {
        set.add(id);
        guardarMedallasCompletadasSet(set);
    }
}

// Obtener estado completo de todas las medallas (ahora con persistencia)
// Reemplaza la función anterior obtenerEstadoMedallas
function obtenerEstadoMedallas(perfil) {
    const guardadas = obtenerMedallasCompletadasGuardadas();

    return MEDALLAS.map(medalla => {
        const { actual, objetivo } = medalla.condicion(perfil);
        const cumpleAhora = actual >= objetivo;
        // Si está guardada como completada o se cumple ahora, es completada
        const completada = guardadas.has(medalla.id) || cumpleAhora;

        // Si se cumple ahora y no estaba guardada, guardamos para persistirla
        if (cumpleAhora && !guardadas.has(medalla.id)) {
            marcarMedallaComoCompleta(medalla.id);
        }

        const progreso = completada ? 100 : (objetivo ? (actual / objetivo) * 100 : 0);

        return {
            ...medalla,
            actual,
            objetivo,
            completada,
            progreso
        };
    });
}



// Obtener la medalla no completada con mayor progreso (misión actual)
function obtenerMisionActual(perfil) {
    const medallas = obtenerEstadoMedallas(perfil);
    const noCompletadas = medallas.filter(m => !m.completada);
    if (noCompletadas.length === 0) return null;
    noCompletadas.sort((a, b) => b.progreso - a.progreso);
    return noCompletadas[0];
}



// Renderizar la tarjeta de misión actual (en el elemento con id "mision-actual")
function renderizarMisionActual() {
    const contenedor = document.getElementById("mision-actual");
    if (!contenedor) return;

    const perfil = getperfil();
    const mision = obtenerMisionActual(perfil);
    const actual = mision;

    if (!mision) {
        contenedor.innerHTML = `
            <div class="bg-gradient-to-r from-green-100 to-slate-50 my-8 dark:from-green-900/30 dark:to-slate-900 p-6 rounded-2xl outline outline-1 outline-green-500 dark:outline-green-700">
                <h3 class="text-sm font-bold uppercase tracking-wide text-green-600 dark:text-green-400">¡Misiones completadas!</h3>
                <p class="mt-3 text-base font-bold text-slate-900 dark:text-white">Eres un campeón</p>
                <p class="text-xs text-green-600 dark:text-green-400 mt-1">Has superado todos los desafíos. ¡Sigue entrenando!</p>
                <div class="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full mt-4">
                    <div class="w-full h-full bg-green-500 rounded-full"></div>
                </div>
                <div class="text-right text-[10px] text-green-600 dark:text-green-400 mt-2">100%</div>
            </div>
        `;
        return;
    }

    const porcentaje = mision.progreso;
    const anchoBarra = `${porcentaje}%`;

    contenedor.innerHTML = `
        <div class="bg-gradient-to-r from-${actual.color}-50 to-${actual.color}-50 my-8 dark:from-slate-800 dark:to-${actual.color}-600 p-6 rounded-2xl outline outline-1 outline-${actual.color}-500 dark:outline-${actual.color}-900">
            <h3 class="text-sm font-bold uppercase tracking-wide text-${actual.color}-500 dark:text-${actual.color}-600">Misión actual</h3>
            <p class="text-xl mt-3 font-bold text-slate-900 dark:text-white">${mision.nombre}</p>
            <p class="text-lg text-${actual.color}-600 mt-1">${mision.descripcion}</p>
            <div class="relative w-full h-2 bg-indigo-950/50 rounded-full mt-4">
                <div class="h-full bg-${actual.color}-500 rounded-full shadow-[0px_0px_8px_rgba(99,102,241,0.6)]" style="width: ${anchoBarra};"></div>
            </div>
            <div class="text-right text-lg text-${actual.color}-600 dark:text-${actual.color}-200 mt-2">${mision.actual} / ${mision.objetivo}</div>
        </div>
    `;
}

// Renderizar las medallas (en el elemento con id "medallas-container")
function renderizarMedallas() {
    const contenedor = document.getElementById("medallas-container");
    if (!contenedor) return;

    const perfil = getperfil();
    const medallas = obtenerEstadoMedallas(perfil);
    const completadas = medallas.filter(m => m.completada);
    const total = medallas.length;

    // Actualizar contador
    const contadorSpan = document.getElementById("medallas-contador");
    if (contadorSpan) {
        contadorSpan.textContent = `${completadas.length}/${total}`;
    }

    // Generar HTML de medallas (mostrar todas, completadas con color, no completadas grises)
    contenedor.innerHTML = medallas.map(medalla => {
        const completada = medalla.completada;
        const colorMap = {
            red: "border-red-500 bg-red-50 dark:bg-red-900/20",
            blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
            green: "border-green-500 bg-green-50 dark:bg-green-900/20",
            amber: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
            purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
            cyan: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
        };
        const colorClase = completada ? colorMap[medalla.color] : "border-zinc-300 bg-stone-100 dark:border-zinc-600 dark:bg-stone-800";
        const iconoClase = completada ? `<img class="" src="${medalla.icono}"></img>` : `<div class=" w-8 h-8 rounded-full bg-zinc-400 dark:bg-zinc-600">
        </div>`;

        return `
        <div class=" flex flex-col items-center justify-center w-24 gap-2 text-center">
            <div class="w-16 h-16  ${colorClase} rounded-full border-4 flex items-center justify-center transition-all duration-200 ${completada ? `shadow-md` : `opacity-50`}" title="${completada ? `${medalla.nombre} (${medalla.actual}/${medalla.objetivo})` : `Bloqueada`}">
                <div class="rounded-full">${iconoClase}</div>
            </div>
            
            <p class="text-xs font-semibold uppercase test-center tracking-wide text-${medalla.color}-500 dark:text-${medalla.color}-600">${medalla.nombre}</p>
        </div>`;

    }).join("");
}

// Función para actualizar toda la UI de misiones y medallas
function actualizarLogrosYMedallas() {
    renderizarMedallas();
    renderizarMisionActual();
}

// Exponer funciones globalmente
window.renderizarMedallas = renderizarMedallas;
window.renderizarMisionActual = renderizarMisionActual;
window.actualizarLogrosYMedallas = actualizarLogrosYMedallas;