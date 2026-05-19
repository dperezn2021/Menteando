// === CLAVE DEL PERFIL ===
const perfil_KEY = "perfil_usuario";

// === PERFIL BASE COMPLETO ===
const perfilBase = {
    nombre: "Jugador Uno",
    apodo: "Invitado_01",
    edad: 0,
    desde: new Date().toISOString(),
    racha: 0,
    rachaMaxima: 0,
    nuevaRachaMaxima: false,
    puntos: 0,
    correo: "",
    sesiones: 0,
    nivel: 0,
    avatar: "../assets/icon/usuario.webp",
    ultimaSesion: null,
    ultimaSesionDia: null,
    sesionesDiarias: [0, 0, 0, 0, 0, 0, 0],
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
    const perfilLimpio = JSON.parse(JSON.stringify(perfilBase));
    perfilLimpio.desde = new Date().toISOString();
    perfilLimpio.racha = 0;
    perfilLimpio.ultimaSesion = null;
    perfilLimpio.sesiones = 0;
    perfilLimpio.puntos = 0;
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
    perfilLimpio.rachaMaxima = 0;
    perfilLimpio.nuevaRachaMaxima = false;

    saveperfil(perfilLimpio);
    localStorage.removeItem("medallas_completadas");
    localStorage.removeItem("ultimo_dia_jugado"); // ✅ Limpiar también esto
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

        perfil.detalle[skill] = previousValue * 0.9 + incomingValue * 0.1;
    });
    perfil.atencion =
        0.5 * (Number(perfil.detalle.atencionSostenida) || 0) +
        0.25 * (Number(perfil.detalle.atencionSelectiva) || 0) +
        0.25 * (Number(perfil.detalle.atencionDividida) || 0);
    perfil.atencion = Math.max(0, Math.min(1, perfil.atencion));

    perfil.memoria =
        0.6 * (Number(perfil.detalle.memoriaTrabajo) || 0) +
        0.4 * (Number(perfil.detalle.memoriaEspacial) || 0);
    perfil.memoria = Math.max(0, Math.min(1, perfil.memoria));

    perfil.control =
        0.5 * (Number(perfil.detalle.controlInhibitorio) || 0) +
        0.3 * (Number(perfil.detalle.flexibilidadCognitiva) || 0) +
        0.2 * (Number(perfil.detalle.planificacion) || 0);
    perfil.control = Math.max(0, Math.min(1, perfil.control));

    perfil.reflejos =
        0.5 * (Number(perfil.detalle.velocidadCognitiva) || 0) +
        0.5 * (Number(perfil.detalle.coordinacionVisomotora) || 0);
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

function getNivel(perfil) {
    let nivel = ((perfil.atencion + perfil.control + perfil.reflejos + perfil.memoria) / 4 * 100).toFixed(0);
    return nivel;
}

// ========== FUNCIÓN DE FORMATO DE PUNTOS ==========
function formatearPuntos(puntos) {
    if (typeof puntos !== 'number' || isNaN(puntos)) puntos = 0;
    if (puntos < 1000) return Math.floor(puntos).toString();
    if (puntos < 1000000) return (puntos / 1000).toFixed(1) + "K";
    return (puntos / 1000000).toFixed(1) + "M";
}

// ========== GET TIEMPO (para compatibilidad con HTML) ==========
function getTiempo(perfil) {
    const atencion = Number(perfil.atencion) || 0;
    const control = Number(perfil.control) || 0;
    const reflejos = Number(perfil.reflejos) || 0;
    const memoria = Number(perfil.memoria) || 0;
    const sesiones = Number(perfil.sesiones) || 0;
    const tiempo = (atencion * 0.25 + control * 0.25 + reflejos * 0.25 + memoria * 0.25) * 10000 * sesiones;
    return Math.floor(tiempo);
}

// ========== ACTUALIZAR RACHA POR SESIÓN COMPLETADA ==========
function actualizarRachaPorSesionCompletada(perfil) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const ultimoDiaJugadoStr = localStorage.getItem("ultimo_dia_jugado");

    let nuevaRacha = 1;

    if (ultimoDiaJugadoStr) {
        const ultimoDia = new Date(ultimoDiaJugadoStr);
        ultimoDia.setHours(0, 0, 0, 0);

        const diferenciaDias = Math.floor((hoy - ultimoDia) / 86400000);

        console.log(`📅 Diferencia de días: ${diferenciaDias} | Último día: ${ultimoDia.toLocaleDateString()} | Hoy: ${hoy.toLocaleDateString()}`);

        if (diferenciaDias === 0) {
            // Same day: keep existing racha (user may have multiple sessions today)
            nuevaRacha = perfil.racha || 1;
        } else if (diferenciaDias === 1) {
            // Played yesterday: increment racha
            nuevaRacha = (perfil.racha || 0) + 1;
        } else if (diferenciaDias > 1) {
            // Missed yesterday (or more): reset racha to 0 as requested
            nuevaRacha = 0;
        } else {
            // Fallback: start at 1
            nuevaRacha = 1;
        }
    }

    perfil.racha = nuevaRacha;

    if (nuevaRacha > (perfil.rachaMaxima || 0)) {
        perfil.rachaMaxima = nuevaRacha;
        perfil.nuevaRachaMaxima = true;
    }



    // Guardar el día actual
    localStorage.setItem("ultimo_dia_jugado", hoy.toISOString());

    console.log(`🔥 Racha actualizada: ${nuevaRacha} días | Máxima: ${perfil.rachaMaxima}`);

    return perfil;
}

function calcularRachaDiariaMaxima(arr) {
    return Math.max(...arr);
}

function calcularRachaDiariaMedia(arr) {
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(1);
}

function calcularRachaDiariaMinima(arr) {
    return Math.min(...arr);
}

function calcularRachaUltimos7Dias(arr) {
    let racha = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] > 0) racha++;
        else break;
    }
    return racha;
}


// ========== OBTENER ÚLTIMAS SESIONES ==========
function getUltimasSesiones(perfil, limite = 3) {
    const sesiones = [];

    for (const gameId in perfil.juegos) {
        perfil.juegos[gameId].forEach(s => {
            sesiones.push({
                juego: gameId,
                fecha: s.timestamp,
                puntuacion: formatearPuntos(s.puntosSesion) ?? 0  // ← PRIORIZAR puntosSesion
            });
        });
    }

    sesiones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return sesiones.slice(0, limite);
}
// ========== SESIONES DIARIAS ==========
function sincronizarSesionesDiarias(perfil) {
    const hoyStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

    if (!perfil.ultimaSesionDia) {
        perfil.sesionesDiarias = [0, 0, 0, 0, 0, 0, 0]; // ← LIMPIA
        perfil.ultimaSesionDia = hoyStr;
        saveperfil(perfil);
        return;
    }

    if (perfil.ultimaSesionDia === hoyStr) return;

    const diasPasados = calcularDiasPasados(perfil.ultimaSesionDia, hoyStr);
    if (diasPasados <= 0) return;

    for (let i = 0; i < diasPasados; i++) {
        perfil.sesionesDiarias.shift();
        perfil.sesionesDiarias.push(0);
    }

    perfil.ultimaSesionDia = hoyStr;
    saveperfil(perfil);
}

function getDiasJugadosSemana(perfil) {
    sincronizarSesionesDiarias(perfil);
    return [...perfil.sesionesDiarias];
}

function actualizarSesionesDiarias(perfil) {
    sincronizarSesionesDiarias(perfil);
    perfil.sesionesDiarias[6] += 1;
    saveperfil(perfil);
    return perfil;
}

function calcularDiasPasados(fechaAnteriorStr, fechaActualStr) {
    const [d1, m1] = fechaAnteriorStr.split("/").map(Number);
    const [d2, m2] = fechaActualStr.split("/").map(Number);

    const hoy = new Date();
    let añoAnterior = hoy.getFullYear();
    let añoActual = hoy.getFullYear();

    if (m1 > m2 || (m1 === m2 && d1 > d2)) {
        añoAnterior--;
    }

    const fecha1 = new Date(añoAnterior, m1 - 1, d1);
    const fecha2 = new Date(añoActual, m2 - 1, d2);

    return Math.floor((fecha2 - fecha1) / 86400000);
}



// ========== COACH ==========
function isCoachDisabled() {
    return localStorage.getItem("coach_disabled") === "true";
}

function activarCoach() {
    const btnActivarCoach = document.getElementById("btn-activar-coach");
    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");

    if (!badge || !dot) {
        console.warn("activarCoach(): elementos no encontrados");
        return;
    }

    badge.textContent = "Coach Cognitivo Activo";

    if (btnActivarCoach) btnActivarCoach.style.display = "none";

    badge.classList.remove("text-red-500");
    badge.classList.add("text-blue-500");

    dot.classList.remove("bg-blue-500");
    dot.classList.add("bg-green-500");

    localStorage.setItem("coach_disabled", "false");
}

function desactivarCoach() {
    const btnToggleCoach = document.getElementById("btn-toggle-coach");
    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");

    if (!badge || !dot) {
        console.warn("desactivarCoach(): elementos no encontrados");
        return;
    }

    badge.textContent = "Coach Cognitivo Desactivado";

    if (btnToggleCoach) btnToggleCoach.style.display = "block";

    badge.classList.remove("text-blue-500");
    badge.classList.add("text-red-500");

    dot.classList.remove("bg-green-500");
    dot.classList.add("bg-red-500");

    localStorage.setItem("coach_disabled", "true");


}

function disableCoachForever() {
    localStorage.setItem("coach_disabled", "true");
}

// ========== EXPORTS GLOBALES ==========
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
window.formatearPuntos = formatearPuntos;
window.getTiempo = getTiempo;
window.getUltimasSesiones = getUltimasSesiones;
window.calcularRachaUltimos7Dias = calcularRachaUltimos7Dias;
window.calcularRachaDiariaMaxima = calcularRachaDiariaMaxima;
window.calcularRachaDiariaMedia = calcularRachaDiariaMedia;
window.calcularRachaDiariaMinima = calcularRachaDiariaMinima;

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", () => {
    // 1. Actualizar UI del coach (badge y dot)
    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");

    if (badge && dot) {
        if (isCoachDisabled()) {
            badge.textContent = "Coach Cognitivo Desactivado";
            badge.classList.remove("text-green-500");
            badge.classList.add("text-red-500");
            dot.classList.remove("bg-green-500");
            dot.classList.add("bg-red-500");
        } else {
            badge.textContent = "Coach Cognitivo Activo";
            badge.classList.remove("text-red-500");
            badge.classList.add("text-green-500");
            dot.classList.remove("bg-red-500");
            dot.classList.add("bg-green-500");
        }
    }

    // 2. Botón toggle coach
    const btnToggleCoach = document.getElementById("btn-toggle-coach");
    if (btnToggleCoach) {
        if (isCoachDisabled()) {
            btnToggleCoach.textContent = "Activar Coach";
            btnToggleCoach.className = "flex-1 py-2 rounded-lg font-bold text-base transition-colors bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-300 dark:hover:bg-green-900/50";
        } else {
            btnToggleCoach.textContent = "Desactivar Coach";
            btnToggleCoach.className = "flex-1 py-2 rounded-lg font-bold text-base transition-colors bg-yellow-200 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-300 dark:hover:bg-yellow-900/50";
        }

        btnToggleCoach.addEventListener("click", () => {
            if (isCoachDisabled()) {
                localStorage.setItem("coach_disabled", "false");
            } else {
                localStorage.setItem("coach_disabled", "true");
            }
            location.reload();
        });
    }


});