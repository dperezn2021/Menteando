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
    metricasEnviadas: false,
    avatar: "../assets/icon/usuario.webp",
    ultimaSesion: null,
    ultimaSesionDia: null,
    ultimoDiaJugado: null,
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
    perfil.puntos = Number(perfil.puntos || 0);
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
    perfilLimpio.metricasEnviadas = false;
    perfilLimpio.detalle = JSON.parse(JSON.stringify(perfilBase.detalle));
    perfilLimpio.sesionesDiarias = [0, 0, 0, 0, 0, 0, 0];
    perfilLimpio.ultimaSesionDia = null;
    perfilLimpio.ultimoDiaJugado = null;
    perfilLimpio.rachaMaxima = 0;
    perfilLimpio.nuevaRachaMaxima = false;

    saveperfil(perfilLimpio);
    localStorage.removeItem("medallas_completadas");
    localStorage.removeItem("ultimo_dia_jugado");
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
    puntos = Math.ceil(Number(puntos) || 0);
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
const MS_DIA = 86400000;

function getFechaLocalKey(fecha = new Date()) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getFechaDesdeLocalKey(fechaKey) {
    if (!fechaKey || typeof fechaKey !== "string") return null;

    const match = fechaKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const [, year, month, day] = match.map(Number);
    return new Date(year, month - 1, day);
}

function normalizarFechaLocalKey(valor) {
    if (!valor || typeof valor !== "string") return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return valor;
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return null;

    return getFechaLocalKey(fecha);
}

function getFechaDiaMesKey(valor) {
    if (!valor || typeof valor !== "string") return null;

    const partes = valor.split("/").map(Number);
    if (partes.length < 2 || partes.some(Number.isNaN)) return null;

    const hoy = new Date();
    const fecha = new Date(hoy.getFullYear(), partes[1] - 1, partes[0]);
    fecha.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setHours(0, 0, 0, 0);
    manana.setDate(manana.getDate() + 1);

    if (fecha >= manana) {
        fecha.setFullYear(fecha.getFullYear() - 1);
    }

    return getFechaLocalKey(fecha);
}

function calcularDiferenciaDias(fechaKeyNueva, fechaKeyAnterior) {
    const fechaNueva = getFechaDesdeLocalKey(fechaKeyNueva);
    const fechaAnterior = getFechaDesdeLocalKey(fechaKeyAnterior);

    if (!fechaNueva || !fechaAnterior) return null;

    return Math.floor((fechaNueva - fechaAnterior) / MS_DIA);
}

function asegurarSesionesDiarias(perfil) {
    if (!Array.isArray(perfil.sesionesDiarias)) {
        perfil.sesionesDiarias = [0, 0, 0, 0, 0, 0, 0];
        return;
    }

    perfil.sesionesDiarias = perfil.sesionesDiarias
        .slice(-7)
        .map(valor => Math.max(0, Number(valor) || 0));

    while (perfil.sesionesDiarias.length < 7) {
        perfil.sesionesDiarias.unshift(0);
    }
}

function contarSesionesDiariasDesdeHistorial(perfil, hoyKey = getFechaLocalKey()) {
    const conteos = [0, 0, 0, 0, 0, 0, 0];
    let total = 0;
    const juegos = perfil.juegos || {};

    Object.values(juegos).forEach(sesiones => {
        if (!Array.isArray(sesiones)) return;

        sesiones.forEach(sesion => {
            const diaSesion = normalizarFechaLocalKey(sesion?.timestamp);
            if (!diaSesion) return;

            total += 1;
            const diffDias = calcularDiferenciaDias(hoyKey, diaSesion);

            if (diffDias !== null && diffDias >= 0 && diffDias < 7) {
                conteos[6 - diffDias] += 1;
            }
        });
    });

    return { conteos, total };
}

function sumarDiasAFechaKey(fechaKey, dias) {
    const fecha = getFechaDesdeLocalKey(fechaKey);
    if (!fecha) return null;

    fecha.setDate(fecha.getDate() + dias);
    return getFechaLocalKey(fecha);
}

function getDiasJugadosDesdeHistorial(perfil) {
    const dias = new Set();
    let total = 0;
    const juegos = perfil.juegos || {};

    Object.values(juegos).forEach(sesiones => {
        if (!Array.isArray(sesiones)) return;

        sesiones.forEach(sesion => {
            const diaSesion = normalizarFechaLocalKey(sesion?.timestamp);
            if (!diaSesion) return;

            total += 1;
            dias.add(diaSesion);
        });
    });

    return { dias, total };
}

function calcularRachaActualDesdeDias(dias, hoyKey = getFechaLocalKey()) {
    let cursor = dias.has(hoyKey) ? hoyKey : sumarDiasAFechaKey(hoyKey, -1);
    let racha = 0;

    while (cursor && dias.has(cursor)) {
        racha += 1;
        cursor = sumarDiasAFechaKey(cursor, -1);
    }

    return racha;
}

function calcularRachaMaximaDesdeDias(dias) {
    let rachaMaxima = 0;
    let rachaActual = 0;
    let diaAnterior = null;

    [...dias].sort().forEach(dia => {
        const diferencia = diaAnterior ? calcularDiferenciaDias(dia, diaAnterior) : null;
        rachaActual = diferencia === 1 ? rachaActual + 1 : 1;
        rachaMaxima = Math.max(rachaMaxima, rachaActual);
        diaAnterior = dia;
    });

    return rachaMaxima;
}

function getUltimoDiaDesdeDias(dias) {
    const ordenados = [...dias].sort();
    return ordenados.length ? ordenados[ordenados.length - 1] : null;
}

function getUltimoDiaJugado(perfil) {
    const desdePerfil = normalizarFechaLocalKey(perfil.ultimoDiaJugado);
    if (desdePerfil) {
        perfil.ultimoDiaJugado = desdePerfil;
        localStorage.setItem("ultimo_dia_jugado", desdePerfil);
        return desdePerfil;
    }

    const desdeStorage = normalizarFechaLocalKey(localStorage.getItem("ultimo_dia_jugado"));
    if (desdeStorage) {
        perfil.ultimoDiaJugado = desdeStorage;
        localStorage.setItem("ultimo_dia_jugado", desdeStorage);
        return desdeStorage;
    }

    const desdeUltimaSesion = normalizarFechaLocalKey(perfil.ultimaSesion);
    if (desdeUltimaSesion) {
        perfil.ultimoDiaJugado = desdeUltimaSesion;
        localStorage.setItem("ultimo_dia_jugado", desdeUltimaSesion);
        return desdeUltimaSesion;
    }

    return null;
}

function normalizarRachaActual(perfil) {
    const ultimoDiaJugado = getUltimoDiaJugado(perfil);
    if (!ultimoDiaJugado) {
        perfil.racha = 0;
        return perfil;
    }

    const diferenciaDias = calcularDiferenciaDias(getFechaLocalKey(), ultimoDiaJugado);

    if (diferenciaDias !== null && diferenciaDias > 1) {
        perfil.racha = 0;
    }

    return perfil;
}

function sincronizarRachasDesdeHistorial(perfil) {
    const historial = getDiasJugadosDesdeHistorial(perfil);
    const sesionesTotales = Number(perfil.sesiones) || 0;

    if (!historial.total || historial.total < sesionesTotales) {
        return normalizarRachaActual(perfil);
    }

    const rachaMaximaAnterior = Number(perfil.rachaMaxima) || 0;
    const rachaMaximaHistorial = calcularRachaMaximaDesdeDias(historial.dias);
    const ultimoDiaJugado = getUltimoDiaDesdeDias(historial.dias);

    perfil.racha = calcularRachaActualDesdeDias(historial.dias);
    perfil.rachaMaxima = rachaMaximaHistorial;

    if (ultimoDiaJugado) {
        perfil.ultimoDiaJugado = ultimoDiaJugado;
        localStorage.setItem("ultimo_dia_jugado", ultimoDiaJugado);
    }

    if (rachaMaximaHistorial > rachaMaximaAnterior) {
        perfil.nuevaRachaMaxima = true;
    } else if (rachaMaximaHistorial < rachaMaximaAnterior && perfil.nuevaRachaMaxima) {
        perfil.nuevaRachaMaxima = false;
    }

    return perfil;
}

function actualizarRachaPorSesionCompletada(perfil) {
    const hoyKey = getFechaLocalKey();
    const ultimoDiaJugado = getUltimoDiaJugado(perfil);

    let nuevaRacha = 1;

    if (ultimoDiaJugado) {
        const diferenciaDias = calcularDiferenciaDias(hoyKey, ultimoDiaJugado);

        if (diferenciaDias === 0) {
            nuevaRacha = Math.max(1, Number(perfil.racha) || 1);
        } else if (diferenciaDias === 1) {
            nuevaRacha = (Number(perfil.racha) || 0) + 1;
        } else if (diferenciaDias !== null && diferenciaDias > 1) {
            nuevaRacha = 1;
        } else {
            nuevaRacha = Math.max(1, Number(perfil.racha) || 1);
        }
    }

    perfil.racha = nuevaRacha;

    if (nuevaRacha > (perfil.rachaMaxima || 0)) {
        perfil.rachaMaxima = nuevaRacha;
        perfil.nuevaRachaMaxima = true;
    }



    perfil.ultimoDiaJugado = hoyKey;
    localStorage.setItem("ultimo_dia_jugado", hoyKey);

    console.log(`Racha actualizada: ${nuevaRacha} días | Máxima: ${perfil.rachaMaxima}`);

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
    asegurarSesionesDiarias(perfil);

    const hoyKey = getFechaLocalKey();
    const historial = contarSesionesDiariasDesdeHistorial(perfil, hoyKey);

    if (historial.total > 0 || Number(perfil.sesiones || 0) === 0) {
        perfil.sesionesDiarias = historial.conteos;
        perfil.ultimaSesionDia = hoyKey;
        sincronizarRachasDesdeHistorial(perfil);
        return perfil;
    }

    const ultimaSesionDiaKey = normalizarFechaLocalKey(perfil.ultimaSesionDia) || getFechaDiaMesKey(perfil.ultimaSesionDia);

    if (!ultimaSesionDiaKey) {
        perfil.ultimaSesionDia = hoyKey;
        sincronizarRachasDesdeHistorial(perfil);
        return perfil;
    }

    const diffDias = calcularDiferenciaDias(hoyKey, ultimaSesionDiaKey);

    if (diffDias !== null && diffDias > 0) {
        const diasDesplazar = Math.min(diffDias, 7);
        for (let i = 0; i < diasDesplazar; i++) {
            perfil.sesionesDiarias.shift();
            perfil.sesionesDiarias.push(0);
        }
    }

    perfil.ultimaSesionDia = hoyKey;
    sincronizarRachasDesdeHistorial(perfil);

    return perfil;
}


function getDiasJugadosSemana(perfil) {
    sincronizarSesionesDiarias(perfil);
    return [...perfil.sesionesDiarias];
}

function actualizarSesionesDiarias(perfil) {
    const hoyKey = getFechaLocalKey();
    const historial = contarSesionesDiariasDesdeHistorial(perfil, hoyKey);

    if (historial.total > 0 || Number(perfil.sesiones || 0) <= 1) {
        perfil.sesionesDiarias = historial.conteos;
        perfil.ultimaSesionDia = hoyKey;
        normalizarRachaActual(perfil);
    } else {
        sincronizarSesionesDiarias(perfil);
    }

    perfil.sesionesDiarias[6] += 1;
    perfil.ultimaSesionDia = hoyKey;
    saveperfil(perfil);
    return perfil;
}

function calcularDiasPasados(fechaStr1, fechaStr2) {
    const [d1, m1] = fechaStr1.split('/').map(Number);
    const [d2, m2] = fechaStr2.split('/').map(Number);
    
    const fecha1 = new Date(new Date().getFullYear(), m1 - 1, d1);
    const fecha2 = new Date(new Date().getFullYear(), m2 - 1, d2);
    
    const diff = Math.floor((fecha2 - fecha1) / 86400000);
    return Math.max(0, diff);
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




// ========== EXPORTAR METRICAS ==========
// ====================
// EXPORTAR PERFIL
// ====================

function exportarPerfil() {

    const perfil = getperfil();

    const contenido = JSON.stringify({
        version: "1.0",
        fechaExportacion: new Date().toISOString(),
        perfil
    }, null, 2);

    const blob = new Blob(
        [contenido],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;

    enlace.download =
        `menteando-${perfil.nombre || "perfil"}.json`;

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);

    mostrarModal(
        "Perfil exportado correctamente.",
        "success"
    );
}

document
    .getElementById("btn-exportar")
    ?.addEventListener("click", exportarPerfil);


// ====================
// IMPORTAR PERFIL
// ====================

document
    .getElementById("btn-importar")
    ?.addEventListener("click", () => {

        document
            .getElementById("input-importar-perfil")
            .click();

    });

document
    .getElementById("input-importar-perfil")
    ?.addEventListener("change", importarPerfil);

function importarPerfil(event) {

    const archivo = event.target.files[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = function(e) {

        try {

            const datos =
                JSON.parse(e.target.result);

            if (!datos.perfil) {

                throw new Error(
                    "Formato de archivo inválido"
                );

            }

            saveperfil(datos.perfil);

            mostrarModal(
                "Perfil importado correctamente.",
                "success"
            );

            setTimeout(() => {
                location.reload();
            }, 1000);

        } catch (error) {

            console.error(error);

            mostrarModal(
                "El archivo seleccionado no es válido.",
                "error"
            );

        }

    };

    lector.readAsText(archivo);
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
            btnToggleCoach.innerHTML = '<img src="assets/icon/coach.png" alt="Icono Coach" class="w-5 h-5 inline-block mr-1 mb-1"> Activar Coach';
            btnToggleCoach.className = "flex-1 py-2 rounded-lg font-bold text-base transition-colors bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-300 dark:hover:bg-green-900/50";
        } else {
            btnToggleCoach.innerHTML = '<img src="assets/icon/coach2.png" alt="Icono Coach" class="w-5 h-5 inline-block mr-1 mb-1">Desactivar Coach';
            btnToggleCoach.className = "flex-1 py-2  rounded-lg font-bold text-base transition-colors bg-yellow-200 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-300 dark:hover:bg-yellow-900/50";
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
