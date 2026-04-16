// === CLAVE DEL PERFIL ===
const perfil_KEY = "perfil_usuario";

// === PERFIL BASE COMPLETO ===
const perfilBase = {
    nombre: "Jugador Uno",
    apodo: "Invitado_01",
    edad: 0,
    desde: new Date().toISOString(),
    racha: 0,
    tiempo: 0,
    puntos: 0,
    correo: "",
    sesiones: 0,
    nivel: 0,
    avatar: "../assets/icon/usuario.webp",
    ultimaSesion: null,
    ultimaSesionDia: null,
    sesionesDiarias: [0,0,0,0,0,0,0], 
    juegos: {},
    juegoMasJugado: "Cargando...",
    tests: {},

    atencion: 0,
    memoria: 0,
    control: 0,
    reflejos: 0,

    detalle: {
        atencionSostenida: 0,
        atencionSelectiva: 0,
        atencionDividida: 0,
        velocidadCognitiva: 0,
        memoriaTrabajo: 0,
        memoriaEspacial: 0,
        controlInhibitorio: 0,
        flexibilidadCognitiva: 0,
        planificacion: 0,
        coordinacionVisomotora: 0
    }
};

// === OBTENER PERFIL ===
function getperfil() {
    let data = localStorage.getItem(perfil_KEY);

    if (!data) {
        saveperfil(perfilBase);
        return JSON.parse(JSON.stringify(perfilBase));
    }

    let perfil = JSON.parse(data);

    perfil = Object.assign({}, perfilBase, perfil);
    perfil.detalle = Object.assign({}, perfilBase.detalle, perfil.detalle);

    return perfil;
}

// === GUARDAR PERFIL ===
function saveperfil(perfil) {
    localStorage.setItem(perfil_KEY, JSON.stringify(perfil));
}

// === REINICIAR PERFIL ===
function resetperfil() {
    // Crear copia limpia del perfilBase
    const perfilLimpio = JSON.parse(JSON.stringify(perfilBase));
    perfilLimpio.desde = new Date().toISOString();
    perfilLimpio.racha = 0;
    perfilLimpio.ultimaSesion = null;  // Importante para que la racha se reinicie
    perfilLimpio.sesiones = 0;
    perfilLimpio.puntos = 0;
    perfilLimpio.puntosString = "";
    perfilLimpio.tiempo = 0;
    perfilLimpio.nivel = 0;
    perfilLimpio.juegos = {};
    perfilLimpio.juegoMasJugado = "Cargando...";
    perfilLimpio.atencion = 0;
    perfilLimpio.memoria = 0;
    perfilLimpio.control = 0;
    perfilLimpio.reflejos = 0;
    perfilLimpio.detalle = JSON.parse(JSON.stringify(perfilBase.detalle));
    perfilLimpio.sesionesDiarias = [0, 0, 0, 0, 0, 0, 0];
    perfilLimpio.ultimaSesionDia = null;
    
    saveperfil(perfilLimpio);
    localStorage.removeItem("medallas_completadas");
    location.reload();
}

// === RECALCULAR PERFIL GLOBAL ===
function recalcularPerfilGlobal(perfil, metrics, gameId) {
    const skills = typeof window.getJuegoSkillsById === "function"
        ? window.getJuegoSkillsById(gameId)
        : [];
    if (!skills.length) return;

    skills.forEach(skill => {
        const previousValue = Number(perfil.detalle[skill]) || 0;
        const incomingValue = Number(metrics?.[skill]) || 0;

        perfil.detalle[skill] =
            previousValue * 0.9 +
            incomingValue * 0.1;
    });

    perfil.atencion =
        0.6 * (Number(perfil.detalle.atencionSostenida) || 0) +
        0.2 * (Number(perfil.detalle.atencionSelectiva) || 0) +
        0.2 * (Number(perfil.detalle.atencionDividida) || 0);
    perfil.atencion = Math.max(0, Math.min(1, perfil.atencion));

    perfil.memoria =
        0.7 * (Number(perfil.detalle.memoriaTrabajo) || 0) +
        0.3 * (Number(perfil.detalle.memoriaEspacial) || 0);

    perfil.memoria = Math.max(0, Math.min(1, perfil.memoria));


    perfil.control =
        0.5 * (Number(perfil.detalle.controlInhibitorio) || 0) +
        0.3 * (Number(perfil.detalle.flexibilidadCognitiva) || 0) +
        0.2 * (Number(perfil.detalle.planificacion) || 0);

    perfil.control = Math.max(0, Math.min(1, perfil.control));

    perfil.reflejos =
        0.5 * (Number(perfil.detalle.velocidadCognitiva) || 0) +
        0.4 * (Number(perfil.detalle.coordinacionVisomotora) || 0) -
        0.1 * (Number(perfil.detalle.controlInhibitorio) || 0);

    perfil.reflejos = Math.max(0, Math.min(1, perfil.reflejos));

    perfil.juegoMasJugado = getJuegoMasJugado(perfil);
    

}

function getJuegoMasJugado(perfil) {
    let maxSesiones = 0;
    let juegoMasJugado = "Ninguno";

    for (const juego in perfil.juegos) {
        const sesiones = perfil.juegos[juego].length;
        if (sesiones > maxSesiones) {
            maxSesiones = sesiones;
            juegoMasJugado = juego;
        }
    }

    return juegoMasJugado;
}

function getNivel(perfil){
    let nivel;
    nivel = ((perfil.atencion + perfil.control + perfil.reflejos + perfil.memoria)/4*100).toFixed(0);

    return nivel;
}


// ========== FUNCIÓN DE FORMATO ==========
function formatearPuntos(puntos) {
    if (typeof puntos !== 'number' || isNaN(puntos)) puntos = 0;
    if (puntos < 1000) return Math.floor(puntos).toString();
    if (puntos < 1000000) return (puntos / 1000).toFixed(1) + "K";
    return (puntos / 1000000).toFixed(1) + "M";
}
// ========== ACTUALIZAR PUNTOS STRING ==========
function actualizarPuntosString(perfil) {
    perfil.puntosString = formatPuntos(perfil.puntos);
    return perfil.puntosString;
}

// ========== GET PUNTOS (para mostrar) ==========
function getPuntos(perfil) {
    return perfil.puntos;
}



function getTiempo(perfil) {
    const atencion = Number(perfil.atencion) || 0;
    const control = Number(perfil.control) || 0;
    const reflejos = Number(perfil.reflejos) || 0;
    const memoria = Number(perfil.memoria) || 0;
    const sesiones = Number(perfil.sesiones) || 0;
    const tiempo = (atencion * 0.25 + control * 0.25 + reflejos * 0.25 + memoria * 0.25) * 10000 * sesiones;

    return tiempo;
}

// Renombrar para claridad - esta función se llama SOLO al completar una sesión de juego
function actualizarRachaPorSesionCompletada() {
    const perfil = getperfil();
    
    // Usar ultimaSesion que ya guarda la fecha de la última partida completada
    const ultimaFechaStr = perfil.ultimaSesion;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let nuevaRacha = perfil.racha || 0;
    
    if (!ultimaFechaStr) {
        // Primera sesión de su vida
        nuevaRacha = 1;
    } else {
        const ultimaFecha = new Date(ultimaFechaStr);
        ultimaFecha.setHours(0, 0, 0, 0);
        
        const diferenciaDias = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24));
        
        if (diferenciaDias === 0) {
            // Ya jugó hoy, no aumentar (evita múltiples sesiones el mismo día)
            nuevaRacha = perfil.racha;
        } else if (diferenciaDias === 1) {
            // Jugó ayer, aumentar racha
            nuevaRacha = (perfil.racha || 0) + 1;
        } else {
            // Pasó más de un día sin jugar, reiniciar racha
            nuevaRacha = 1;
        }
    }
    
    perfil.racha = nuevaRacha;
    saveperfil(perfil);
    
    // Verificar medallas después de actualizar racha
    if (typeof actualizarLogrosYMedallas === 'function') {
        actualizarLogrosYMedallas();
    }
    
    // Notificación al alcanzar racha de 7
    if (nuevaRacha === 7) {
        console.log("🎉 ¡Medalla desbloqueada! Racha imparable - 7 días seguidos jugando");
    }
    
    return nuevaRacha;
}


// Para mostrar la racha correcta en la UI (no modifica el perfil)
function obtenerRachaVisible() {
    const perfil = getperfil();
    
    if (!perfil.ultimaSesion) return perfil.racha || 0;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const ultimaSesion = new Date(perfil.ultimaSesion);
    ultimaSesion.setHours(0, 0, 0, 0);
    
    const diferenciaDias = Math.floor((hoy - ultimaSesion) / (1000 * 60 * 60 * 24));
    
    // Si pasó más de 1 día sin jugar, mostrar 0
    if (diferenciaDias > 1) {
        return 0;
    }
    
    return perfil.racha;
}

function getUltimasSesiones(perfil, limite = 3) {
    const sesiones = [];

    for (const gameId in perfil.juegos) {
        perfil.juegos[gameId].forEach(s => {
            sesiones.push({
                juego: gameId,
                fecha: s.timestamp,
                puntuacion: s.score ?? s.puntos ?? 0
            });
        });
    }

    // Ordenar por fecha descendente
    sesiones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return sesiones.slice(0, limite);
}



// Sincroniza el array sesionesDiarias con la fecha real
function sincronizarSesionesDiarias(perfil) {
    const hoyStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
    
    if (!perfil.ultimaSesionDia) {
        perfil.ultimaSesionDia = hoyStr;
        saveperfil(perfil);
        return;
    }

    if (perfil.ultimaSesionDia === hoyStr) return;

    const diasPasados = calcularDiasPasados(perfil.ultimaSesionDia, hoyStr);
    if (diasPasados <= 0) return;

    // Rotar el array: eliminar los días más antiguos y añadir ceros
    for (let i = 0; i < diasPasados; i++) {
        perfil.sesionesDiarias.shift();
        perfil.sesionesDiarias.push(0);
    }

    perfil.ultimaSesionDia = hoyStr;
    saveperfil(perfil);
}

function getDiasJugadosSemana(perfil) {
    sincronizarSesionesDiarias(perfil);  // Asegura que el array esté al día
    return [...perfil.sesionesDiarias];
}

// ========== MODIFICADA: actualizarSesionesDiarias (se llama al jugar) ==========
function actualizarSesionesDiarias(perfil) {
    sincronizarSesionesDiarias(perfil);  // Primero rota si es necesario
    perfil.sesionesDiarias[6] += 1;      // Luego suma la sesión de hoy
    saveperfil(perfil);
    return perfil;
}
// Calcula días entre dos fechas dd/mm
function calcularDiasPasados(fechaAnteriorStr, fechaActualStr) {
    const [d1, m1] = fechaAnteriorStr.split("/").map(Number);
    const [d2, m2] = fechaActualStr.split("/").map(Number);
    
    const hoy = new Date();
    let añoAnterior = hoy.getFullYear();
    let añoActual = hoy.getFullYear();
    
    // Si la fecha anterior es posterior en el año (ej. dic vs ene), asumimos año anterior
    if (m1 > m2 || (m1 === m2 && d1 > d2)) {
        añoAnterior--;
    }
    
    const fecha1 = new Date(añoAnterior, m1 - 1, d1);
    const fecha2 = new Date(añoActual, m2 - 1, d2);
    
    return Math.floor((fecha2 - fecha1) / 86400000);
}


//-------------------------- ENVIAR METRICAS POR CORREO ---------------------------

function enviarMetricasPorCorreo(perfil) {
    if (!perfil.correo) {
        console.warn("El usuario no tiene correo, no se envía nada.");
        return;
    }

    const data = {
        name: "Menteando",
        email: "no-reply@menteando.com",
        time: new Date(),
        seasons: perfil.sesiones,
        user_name: perfil.nombre,
        user_email: perfil.correo,
        metrics_json: JSON.stringify(perfil.detalle, null, 2),
        memoria: (perfil.memoria * 100).toFixed(0),
        control: (perfil.control * 100).toFixed(0),
        atencion: (perfil.atencion * 100).toFixed(0),
        reflejos: (perfil.reflejos * 100).toFixed(0),
        nivel: perfil.nivel
    };

    emailjs.send("service_uzpz3sb", "template_n0n5tvp", data)
        .then(() => console.log("Correo enviado correctamente"))
        .catch(err => console.error("Error enviando correo:", err));
}

// ------------------------- COACH GLOBAL ---------------------------

// Estado global del coach
function isCoachDisabled() {
    return localStorage.getItem("coach_disabled") === "true";
}

function activarCoach() {
    localStorage.setItem("coach_disabled", "false");
}

function desactivarCoach() {
    localStorage.setItem("coach_disabled", "true");
}

// Actualiza el badge y el botón del perfil
function actualizarUICoach() {
    const disabled = isCoachDisabled();

    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");
    const btn = document.getElementById("btn-toggle-coach");

    if (!badge || !dot || !btn) return;

    if (disabled) {
        // Coach desactivado → botón verde para ACTIVAR
        badge.textContent = "Coach Cognitivo Desactivado";
        badge.className = "text-red-500 font-semibold";

        dot.className = "w-3 h-3 bg-red-500 rounded-full";

        btn.textContent = "Activar Coach";
        btn.className =
            "py-2 px-8 rounded-lg font-bold text-base transition-colors " +
            "bg-green-200 dark:bg-green-900/30 hover:bg-green-300 dark:hover:bg-green-900/50 " +
            "text-green-700 dark:text-green-400";

    } else {
        // Coach activado → botón amarillo para DESACTIVAR
        badge.textContent = "Coach Cognitivo Activo";
        badge.className = "text-green-500 font-semibold";

        dot.className = "w-3 h-3 bg-green-500 rounded-full";

        btn.textContent = "Desactivar Coach";
        btn.className =
            "py-2 px-8 rounded-lg font-bold text-base transition-colors " +
            "bg-yellow-200 dark:bg-yellow-900/30 hover:bg-yellow-300 dark:hover:bg-yellow-900/50 " +
            "text-yellow-700 dark:text-yellow-400";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    actualizarUICoach();

    const btn = document.getElementById("btn-toggle-coach");
    if (!btn) return;

    btn.addEventListener("click", () => {
        if (isCoachDisabled()) activarCoach();
        else desactivarCoach();

        actualizarUICoach();
        location.reload(); // Para eliminar el coach del DOM si se desactiva
    });

    // Si está desactivado → eliminar coach del DOM
    if (isCoachDisabled()) {
        const coach = document.getElementById("coach");
        const bubble = document.getElementById("coach-bubble");
        if (coach) coach.remove();
        if (bubble) bubble.remove();
    }
});

// -------------------------------- RESET PERFIL ------------------------------------

const btnReset = document.getElementById("btn-reset-perfil");

if (btnReset) {
    btnReset.addEventListener("click", () => {
        if (confirm("¿Seguro que quieres reiniciar todo tu progreso cognitivo?")) {
            resetperfil();
            location.reload();
        }
    });
}


// === HACER TODO GLOBAL PARA UNITY ===
window.getperfil = getperfil;
window.saveperfil = saveperfil;
window.resetperfil = resetperfil;
window.recalcularPerfilGlobal = recalcularPerfilGlobal;
window.getJuegoMasJugado = getJuegoMasJugado;
window.disableCoachForever = disableCoachForever;
window.isCoachDisabled = isCoachDisabled;
window.activarCoach = activarCoach;
window.desactivarCoach = desactivarCoach;
window.getDiasJugadosSemana = getDiasJugadosSemana;
window.actualizarSesionesDiarias = actualizarSesionesDiarias;
window.actualizarRachaPorSesionCompletada = actualizarRachaPorSesionCompletada;
window.obtenerRachaVisible = obtenerRachaVisible;

