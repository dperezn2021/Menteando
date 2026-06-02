const ICONOS = {
    reflejos: "⚡",
    atencion: "👁️",
    memoria: "🧠",
    control: "🛡️",
    racha: "🔥",
    sesiones: "🏆",
    email: "📧",
    puntos: "📊",
    puntos2: "💎",
};

// Definición de medallas
const MEDALLAS = [
    {
        id: "reflejos_75",
        nombre: "Maestro de los reflejos",
        descripcion: "Consigue más de un 75% en Reflejos",
        categoria: "reflejos",
        color: "red",
        icono: ICONOS.reflejos,
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
        color: "purple",
        icono: ICONOS.atencion,
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
        icono: ICONOS.memoria,
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
        icono: ICONOS.control,
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
        color: "orange",
        icono: ICONOS.racha,
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
        icono: ICONOS.sesiones,
        completa: false,
        condicion: (perfil) => {
            const actual = perfil.sesiones || 0;
            const objetivo = 20;
            return { actual, objetivo };
        }
    },
    {
        id: "envio_metricas",
        nombre: "Conexion establecida",
        descripcion: "Usa el boton de enviar métricas al menos una vez",
        categoria: "experiencia",
        color: "emerald",
        icono: ICONOS.email,
        completa: false,
        condicion: (perfil) => {
            let actual = perfil.metricasEnviadas ? 1 : 0;
            if(perfil.correo) actual = 0.9;
            if(perfil.metricasEnviadas && perfil.correo) actual = 1;
            const objetivo = 1;
            return { actual, objetivo };
        }
    },
    {
        id: "puntos_5000",
        nombre: "Puntos redondos",
        descripcion: "Alcanza 5000 puntos en el juego",
        categoria: "puntos",
        color: "yellow",
        icono: ICONOS.puntos,
        completa: false,
        condicion: (perfil) => {
            const actual = perfil.puntos || 0;
            const objetivo = 5000;
            return { actual, objetivo };
        }
    },
    {
        id: "puntos_10000",
        nombre: "Puntos legendarios",
        descripcion: "Alcanza 10000 puntos en el juego",
        categoria: "puntos",
        color: "blue",
        icono: ICONOS.puntos2,
        completa: false,
        condicion: (perfil) => {
            const actual = perfil.puntos || 0;
            const objetivo = 10000;
            return { actual, objetivo };
        }
    }
];

// key para localStorage donde guardamos las medallas completadas
const STORAGE_KEY_MEDALLAS = "medallas_completadas";
const colaMedallas = [];
let modalAbierto = false;

function mostrarSiguienteMedalla() {

    if (modalAbierto) return;

    const medalla = colaMedallas.shift();

    if (!medalla) return;

    modalAbierto = true;

    document.getElementById("modal-medalla-icono").textContent =
        medalla.icono;

    document.getElementById("modal-medalla-nombre").textContent =
        medalla.nombre;

    document.getElementById("modal-medalla-descripcion").textContent =
        medalla.descripcion;

    const modal = document.getElementById("modal-medalla");

    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function desbloquearMedalla(medalla) {

    marcarMedallaComoCompleta(medalla.id);

    colaMedallas.push(medalla);

    mostrarSiguienteMedalla();
}

document.getElementById("cerrar-modal-medalla")?.addEventListener("click", () => {

    const modal = document.getElementById("modal-medalla");

    modal.classList.add("hidden");
    modal.style.display = "none";

    modalAbierto = false;

    mostrarSiguienteMedalla();
});


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
            desbloquearMedalla(medalla);
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

function mostrarModalMedalla(medalla) {
    const modal = document.getElementById("modal-medalla");

    document.getElementById("modal-medalla-icono").textContent =
        medalla.icono;

    document.getElementById("modal-medalla-nombre").textContent =
        medalla.nombre;

    document.getElementById("modal-medalla-descripcion").textContent =
        medalla.descripcion;

    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

document.getElementById("cerrar-modal-medalla")?.addEventListener("click", () => {
    const modal = document.getElementById("modal-medalla");
    modal.classList.add("hidden");
    modal.style.display = "none";
});



// Renderizar la tarjeta de misión actual (en el elemento con id "mision-actual")
function renderizarMisionActual() {
    const contenedor = document.getElementById("mision-actual");
    if (!contenedor) return;

    const perfil = getperfil();
    const mision = obtenerMisionActual(perfil);
    const actual = mision;

    if (!mision) {
        contenedor.innerHTML = `
            <div class="bg-gradient-to-r from-yellow-200 to-yellow-400 
                        dark:from-yellow-700 dark:to-yellow-900
                        my-8 p-6 rounded-2xl outline outline-1 
                        outline-yellow-400 shadow-lg shadow-yellow-500/20">

                <h3 class="text-sm font-bold uppercase tracking-wide 
                           text-yellow-900 dark:text-yellow-100">
                    ¡Maestría completa!
                </h3>

                <p class="mt-3 text-base font-bold text-yellow-900 dark:text-white">
                    Has completado todas las misiones
                </p>

                <p class="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                    Dominio total alcanzado. Sigue mejorando tus habilidades.
                </p>

                <div class="w-full h-2 bg-yellow-300 dark:bg-yellow-800 rounded-full mt-4">
                    <div class="w-full h-full bg-yellow-500 rounded-full"></div>
                </div>

                <div class="text-right text-[10px] text-yellow-800 dark:text-yellow-200 mt-2">
                    100%
                </div>
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
    const todoCompletado = completadas.length === total;

    const contadorSpan = document.getElementById("medallas-contador");
    if (contadorSpan) {
        contadorSpan.textContent = `${completadas.length}/${total}`;
    }

    const colorMap = {
        red: "border-red-500 bg-red-50 dark:bg-red-900/20",
        blue: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
        green: "border-green-500 bg-green-50 dark:bg-green-900/20",
        amber: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
        purple: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
        cyan: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20",
        emerald: "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
        yellow: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
        orange: "border-orange-500 bg-orange-50 dark:bg-orange-900/20",

        // 🔥 GOLD MODE
        gold: "border-yellow-300 bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800 shadow-yellow-500/30"
    };

    contenedor.innerHTML = medallas.map(medalla => {
        const completada = medalla.completada;

        // color base
        let color = medalla.color;

        // si todo completado → gold global
        if (todoCompletado) {
            color = "gold";
        }

        // si no está completada y no es modo gold → gris
        const colorClase = (completada || todoCompletado)
            ? colorMap[color]
            : "border-zinc-300 bg-stone-100 dark:border-zinc-600 dark:bg-stone-800";

        return `
            <div class="flex flex-col items-center justify-center w-24 gap-2 text-center">

                <div class="w-16 h-16 ${colorClase} rounded-full border-4 
                            flex items-center justify-center transition-all duration-200
                            ${completada || todoCompletado ? 'shadow-md' : 'opacity-50'}">

                    <div class="text-3xl ${completada || todoCompletado ? '' : 'opacity-0'}">
                        ${medalla.icono}
                    </div>

                </div>

                <p class="text-xs font-semibold uppercase text-center tracking-wide 
                          text-${todoCompletado ? 'yellow' : medalla.color}-500 
                          dark:text-${todoCompletado ? 'yellow' : medalla.color}-600">

                    ${medalla.nombre}
                </p>

            </div>
        `;
    }).join("");

    // ===============================
    // BLOQUE "TODAS COMPLETADAS"
    // ===============================
    if (todoCompletado) {
        contenedor.innerHTML += `
            <div class="mt-6 border-2 border-yellow-400 p-4 rounded-xl 
                        bg-gradient-to-r from-yellow-100 to-yellow-300 
                        dark:from-yellow-900 dark:to-yellow-700 
                        flex flex-col items-center justify-center w-full gap-4 text-center shadow-lg">

                <p class="text-lg font-bold text-yellow-900 dark:text-yellow-100">
                    🏆 ¡Maestro absoluto!
                </p>

                <p class="text-md text-yellow-800 dark:text-yellow-200">
                    Has desbloqueado todas las medallas.
                </p>

            </div>
        `;
        return;
    }
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