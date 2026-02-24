const perfil_KEY = 'menteando_perfil';

/* ===== Inicializar perfil ===== */
function initperfil() {
    if (!getperfil()) {
        saveperfil({
            nombre: 'Jugador 1',
            apodo: 'Invitado',
            edad: 0,
            correo: '',
            memoria: 0,
            atencion: 0,
            control: 0,
            reflejos: 0,
            sesiones: 0,
            ultimaSesion: null,
            juegos: {}
        });
    }
}

function getperfil() {
    const data = localStorage.getItem(perfil_KEY);
    return data ? JSON.parse(data) : null;
}

function saveperfil(perfil) {
    localStorage.setItem(perfil_KEY, JSON.stringify(perfil));
}

/* ===== Registrar sesión desde Unity ===== */
function mapSessionToSkills(session) {
    const m = session.metrics || {};

    if (session.gameId === "math") {
        return {
            memoria: 0,
            atencion: m.precision || 0,
            control: m.controlInhibitorio || 0,
            reflejos: (m.indiceVelocidad || 0) / 100
        };
    }

    return {};
}

function updateGlobalProfile(session) {
    const perfil = getperfil();
    const skills = mapSessionToSkills(session);

    perfil.atencion = Math.min((perfil.atencion || 0) + (skills.atencion || 0) * 0.2, 1);
    perfil.control  = Math.min((perfil.control  || 0) + (skills.control  || 0) * 0.2, 1);
    perfil.memoria  = Math.min((perfil.memoria  || 0) + (skills.memoria  || 0) * 0.2, 1);
    perfil.reflejos = Math.min((perfil.reflejos || 0) + (skills.reflejos || 0) * 0.2, 1);

    perfil.sesiones = (perfil.sesiones || 0) + 1;

    if (!perfil.juegos) perfil.juegos = {};
    perfil.juegos[session.gameId] = (perfil.juegos[session.gameId] || 0) + 1;

    perfil.ultimaSesion = new Date().toISOString();

    saveperfil(perfil);
    return perfil;
}

initperfil();
