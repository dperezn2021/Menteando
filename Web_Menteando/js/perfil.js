// === CLAVE DEL PERFIL ===
const perfil_KEY = "perfil_usuario";

// === PERFIL BASE COMPLETO ===
const perfilBase = {
    nombre: "Jugador Uno",
    apodo: "Invitado_01",
    edad: 0,
    correo: "",
    sesiones: 0,
    nivel: 0,
    ultimaSesion: null,
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

const juegoSkills = {
    "orden caotico": ["atencionSostenida"],
    "detector de intrusos": ["atencionSelectiva", "controlInhibitorio", "velocidadCognitiva", "coordinacionVisomotora"],
    "tres bolas": ["atencionDividida"],
    "flash tiktok": ["velocidadCognitiva", "atencionSostenida"],
    "eco visual": ["memoriaEspacial"],
    "simon dice": ["memoriaTrabajo", "memoriaEspacial"],
    "asociacion rapida": ["velocidadCognitiva", "memoriaTrabajo"],
    "secuencia inversa": ["memoriaTrabajo"],
    "silencio mental": ["controlInhibitorio"],
    "stroop": ["controlInhibitorio", "flexibilidadCognitiva"],
    "doble regla": ["flexibilidadCognitiva", "controlInhibitorio"],
    "trayectorias mentales": ["planificacion"],
    "tiempo de reaccion": ["velocidadCognitiva"],
    "objeto movil": ["coordinacionVisomotora", "flexibilidadCognitiva"],
    "wisconsin": ["flexibilidadCognitiva"],
    "memory cronometrado": ["memoriaEspacial", "velocidadCognitiva"],
    "contador mental": ["memoriaTrabajo", "velocidadCognitiva"],
    "anticipacion patron": ["planificacion"],
    "multitarea": ["atencionDividida", "controlInhibitorio"],
    "math": ["memoriaTrabajo", "velocidadCognitiva", "controlInhibitorio", "coordinacionVisomotora"],
    "rosco": ["atencionSelectiva", "velocidadCognitiva", "controlInhibitorio", "coordinacionVisomotora"]
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

    const skills = juegoSkills[gameId.toLowerCase()];
    if (!skills) return;

    skills.forEach(skill => {
        perfil.detalle[skill] =
            perfil.detalle[skill] * 0.9 +
            metrics[skill] * 0.1;
    });

    perfil.atencion =
        0.6 * perfil.detalle.atencionSostenida +
        0.2 * perfil.detalle.atencionSelectiva +
        0.2 * perfil.detalle.atencionDividida;

    perfil.memoria =
        0.7 * perfil.detalle.memoriaTrabajo +
        0.3 * perfil.detalle.memoriaEspacial;

    perfil.control =
        0.5 * perfil.detalle.controlInhibitorio +
        0.3 * perfil.detalle.flexibilidadCognitiva +
        0.2 * perfil.detalle.planificacion;

    perfil.reflejos =
        0.5 * perfil.detalle.velocidadCognitiva +
        0.4 * perfil.detalle.coordinacionVisomotora - 
        0.1 * perfil.detalle.controlInhibitorio;

    perfil.juegoMasJugado = getJuegoMasJugado(perfil);

    perfil.nivel = getNivel(perfil);
    console.log(perfil.nivel)
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

//-------------------------- ENVIAR METRICAS POR CORREO ---------------------------

function enviarMetricasPorCorreo(perfil) {
    if (!perfil.correo) {
        console.warn("El usuario no tiene correo, no se envía nada.");
        return;
    }

    const data = {
        name:"Menteando",
        email:"no-reply@menteando.com",
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