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
    sesionesDiarias: [0,0,0,0,0,0,0], // Lunes a Domingo
    juegos: {},
    juegoMasJugado: "Cargando...",

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
    saveperfil(perfilBase);
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



function getPuntos(perfil) {
    const atencion = Number(perfil.atencion) || 0;
    const control = Number(perfil.control) || 0;
    const reflejos = Number(perfil.reflejos) || 0;
    const memoria = Number(perfil.memoria) || 0;
    const sesiones = Number(perfil.sesiones) || 0;
    const puntos = (atencion * 0.25 + control * 0.25 + reflejos * 0.25 + memoria * 0.25) * 10000 * sesiones;

    return puntos;
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
function actualizarRacha() {
    const perfil = getperfil();

    const hoy = new Date().toDateString(); // Fecha sin horas
    const ultimaFecha = perfil.ultimaRacha || null;

    // Si es la primera vez
    if (!ultimaFecha) {
        perfil.racha = 1;
        perfil.ultimaRacha = hoy;
        saveperfil(perfil);
        return perfil.racha;
    }

    // Si ya entró hoy → no aumentar
    if (ultimaFecha === hoy) {
        return perfil.racha;
    }

    // Calcular diferencia de días
    const diffDias = Math.floor(
        (new Date(hoy) - new Date(ultimaFecha)) / (1000 * 60 * 60 * 24)
    );

    if (diffDias === 1) {
        // Día consecutivo → aumentar racha
        perfil.racha += 1;
    } else {
        // Se rompió la racha
        perfil.racha = 1;
    }

    perfil.ultimaRacha = hoy;
    saveperfil(perfil);

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




// Devuelve array de 7 días (ordenado)
function getDiasJugadosSemana(perfil) {
    return [...perfil.sesionesDiarias];
}

// Calcula días entre dos fechas dd/mm
function calcularDiasPasados(fechaAnteriorStr, fechaActualStr) {
    const [d1, m1] = fechaAnteriorStr.split("/").map(Number);
    const [d2, m2] = fechaActualStr.split("/").map(Number);

    const f1 = new Date(new Date().getFullYear(), m1 - 1, d1);
    const f2 = new Date(new Date().getFullYear(), m2 - 1, d2);

    return Math.floor((f2 - f1) / 86400000);
}

// Actualiza sesiones semanales
function actualizarSesionesDiarias(perfil) {
    const hoyStr = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

    if (!perfil.ultimaSesionDia) {
        perfil.ultimaSesionDia = hoyStr;
    }

    // Mismo día → sumar
    if (perfil.ultimaSesionDia === hoyStr) {
        perfil.sesionesDiarias[6] += 1;
        return perfil;
    }

    // Día distinto → desplazar
    const diasPasados = calcularDiasPasados(perfil.ultimaSesionDia, hoyStr);

    if (diasPasados >= 7) {
        perfil.sesionesDiarias = [0,0,0,0,0,0,1];
    } else {
        for (let i = 0; i < diasPasados; i++) {
            perfil.sesionesDiarias.shift();
            perfil.sesionesDiarias.push(0);
        }
        perfil.sesionesDiarias[6] = 1;
    }

    perfil.ultimaSesionDia = hoyStr;
    return perfil;
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



//------------------------- COACH ---------------------------

function disableCoachForever() {
    localStorage.setItem("coach_disabled", "true");
}

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
    const btnActivarCoach = document.getElementById("btn-activar-coach");
    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");

    if (!badge || !dot) {
        console.warn("desactivarCoach(): elementos no encontrados");
        return;
    }

    badge.textContent = "Coach Cognitivo Desactivado";

    if (btnActivarCoach) btnActivarCoach.style.display = "block";

    badge.classList.remove("text-blue-500");
    badge.classList.add("text-red-500");

    dot.classList.remove("bg-green-500");
    dot.classList.add("bg-red-500");

    localStorage.setItem("coach_disabled", "true");
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


window.addEventListener("DOMContentLoaded", () => {
    const badge = document.getElementById("titulo-activar-coach");
    const dot = document.getElementById("coach-status-dot");
    const btn = document.getElementById("btn-activar-coach");

    // Si la página NO tiene elementos del coach, no hacemos nada
    if (!badge || !dot) return;

    if (isCoachDisabled()) {
        desactivarCoach();
        const coach = document.getElementById("coach");
        if (coach) coach.remove();
    } else {
        activarCoach();
    }
});
