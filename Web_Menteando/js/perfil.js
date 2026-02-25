// === CLAVE DEL PERFIL ===
const perfil_KEY = "perfil_usuario";

// === PERFIL BASE COMPLETO ===
const perfilBase = {
    nombre: "Jugador 1",
    apodo: "Invitado",
    edad: 0,
    correo: "",
    sesiones: 0,
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
    "detector de intrusos": ["atencionSelectiva", "controlInhibitorio"],
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
    "objeto movil": ["reflejos", "flexibilidadCognitiva"],
    "wisconsin": ["flexibilidadCognitiva"],
    "memory cronometrado": ["memoriaEspacial", "velocidadCognitiva"],
    "contador mental": ["memoriaTrabajo", "velocidadCognitiva"],
    "anticipacion patron": ["planificacion"],
    "multitarea": ["atencionDividida", "controlInhibitorio"],
    "math": ["memoriaTrabajo", "velocidadCognitiva"]
};

// === OBTENER PERFIL (SIEMPRE COMPLETO) ===
function getperfil() {
    let data = localStorage.getItem(perfil_KEY);

    if (!data) {
        saveperfil(perfilBase);
        return JSON.parse(JSON.stringify(perfilBase));
    }

    let perfil = JSON.parse(data);

    // Rellenar campos faltantes
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
    // Vuelve al perfil base
    saveperfil(perfilBase);
}


// === RECALCULAR PERFIL GLOBAL ===
function recalcularPerfilGlobal(perfil, metrics, gameId) {

    const skills = juegoSkills[gameId.toLowerCase()];
    if (!skills) return;

    // 1. MEDIA HISTÓRICA (85% viejo + 15% nuevo)
    skills.forEach(skill => {
        perfil.detalle[skill] =
            perfil.detalle[skill] * 0.85 +
            metrics[skill] * 0.15;
    });

    // 2. PROGRESO ACUMULADO (+1% por sesión)
    skills.forEach(skill => {
        perfil.detalle[skill] = Math.min(1, perfil.detalle[skill] + 0.01);
    });

    // 3. BARRAS PRINCIPALES
    perfil.atencion =
        (perfil.detalle.atencionSostenida * 0.6 +
         perfil.detalle.atencionSelectiva * 0.2 +
         perfil.detalle.atencionDividida * 0.2);

    perfil.memoria =
        (perfil.detalle.memoriaTrabajo * 0.7 +
         perfil.detalle.memoriaEspacial * 0.3);

    perfil.control = perfil.detalle.controlInhibitorio;

    perfil.reflejos =
        (perfil.detalle.velocidadCognitiva * 0.6 +
         perfil.detalle.coordinacionVisomotora * 0.4);


    // 4. JUEGO MÁS JUGADO
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