/*------------------ FUNCIONES AUXILIARES -------------------*/

function getRandomMessage(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function replacePlaceholders(msg, replacements) {
    if (!msg) return msg;
    let result = msg;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
}

function getFaseUsuario(perfil) {
    const sesiones = perfil.sesiones || 0;
    if (sesiones <= 3) return "novato";
    if (sesiones <= 10) return "explorador";
    if (sesiones <= 25) return "constante";
    if (sesiones <= 50) return "entrenado";
    if (sesiones <= 100) return "experto";
    return "maestro";
}

function getMejorHabilidad(perfil) {
    const habilidades = {
        atencion: perfil.atencion || 0,
        memoria: perfil.memoria || 0,
        control: perfil.control || 0,
        reflejos: perfil.reflejos || 0
    };
    let mejor = "atencion";
    let mejorValor = 0;
    for (const [key, val] of Object.entries(habilidades)) {
        if (val > mejorValor) {
            mejorValor = val;
            mejor = key;
        }
    }
    return mejor;
}

function getPeorHabilidad(perfil) {
    const habilidades = {
        atencion: perfil.atencion || 0,
        memoria: perfil.memoria || 0,
        control: perfil.control || 0,
        reflejos: perfil.reflejos || 0
    };
    let peor = "atencion";
    let peorValor = 1;
    for (const [key, val] of Object.entries(habilidades)) {
        if (val < peorValor) {
            peorValor = val;
            peor = key;
        }
    }
    return peor;
}

function getValorHabilidad(perfil, habilidad) {
    const habilidades = {
        atencion: perfil.atencion || 0,
        memoria: perfil.memoria || 0,
        control: perfil.control || 0,
        reflejos: perfil.reflejos || 0
    };
    return Math.round(habilidades[habilidad] * 100);
}

function normalizarSkill(skill) {
    const mapa = {
        atencion: "atención",
        memoria: "memoria",
        control: "control",
        reflejos: "reflejos"
    };
    return mapa[skill] || skill;
}

function getJuegoRecomendado(perfil) {
    const peor = getPeorHabilidad(perfil);
    const juegos = {
        atencion: "Detector de Intrusos",
        memoria: "Operaciones Encadenadas",
        control: "Detector de Intrusos",
        reflejos: "Misión Orbital"
    };
    return juegos[peor] || "juegos de esa categoría";
}

/*------------------ FUNCION PRINCIPAL -------------------*/

function getCoachMessage(perfil, contexto, subContexto = null, datos = {}) {
    const fase = getFaseUsuario(perfil);
    const mejor = getMejorHabilidad(perfil);
    const peor = getPeorHabilidad(perfil);
    const valorMejor = getValorHabilidad(perfil, mejor);
    const valorPeor = getValorHabilidad(perfil, peor);
    const diferencia = Math.abs(valorMejor - valorPeor);
    const juegoRec = getJuegoRecomendado(perfil);
    const juegoFav = perfil.juegoMasJugado || "ningún juego";
    const veces = perfil.juegos?.[juegoFav]?.length || 0;

    // ========== INICIO ==========
    if (contexto === "inicio") {
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.inicio);
        }
        if (fase === "explorador") {
            return getRandomMessage(CoachMessages.explorador.inicio);
        }
        if (fase === "constante") {
            return getRandomMessage(CoachMessages.constante.inicio);
        }
        if (fase === "entrenado") {
            return getRandomMessage(CoachMessages.entrenado.inicio);
        }
        if (fase === "experto") {
            return getRandomMessage(CoachMessages.experto.inicio);
        }
        if (fase === "maestro") {
            return getRandomMessage(CoachMessages.maestro.inicio);
        }
        return "Bienvenido a Menteando";
    }

    // ========== PERFIL ==========
    if (contexto === "perfil") {
        // Eventos especiales
        if (perfil.nuevaRachaMaxima && perfil.rachaMaxima > 0) {
            const mensajes = CoachMessages.constante.rachaMaxima;
            return replacePlaceholders(getRandomMessage(mensajes), { racha: perfil.rachaMaxima });
        }
        if (perfil.racha >= 7 && perfil.racha < 8) {
            return getRandomMessage(CoachMessages.constante.hito7Dias);
        }
        if (perfil.racha >= 14 && perfil.racha < 15) {
            const mensajes = CoachMessages.constante.hito14Dias;
            return replacePlaceholders(getRandomMessage(mensajes), { skillMejor: normalizarSkill(mejor) });
        }

        // Mensajes según fase
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.perfil);
        }
        if (fase === "explorador") {
            const mensajes = CoachMessages.explorador.perfil;
            return replacePlaceholders(getRandomMessage(mensajes), { sesiones: perfil.sesiones });
        }
        if (fase === "constante") {
            const mensajes = CoachMessages.constante.perfil;
            return replacePlaceholders(getRandomMessage(mensajes), {
                sesiones: perfil.sesiones,
                racha: perfil.racha,
                skillMejor: normalizarSkill(mejor),
                skillPeor: normalizarSkill(peor)
            });
        }
        if (fase === "entrenado") {
            const mensajes = CoachMessages.entrenado.perfil;
            return replacePlaceholders(getRandomMessage(mensajes), {
                nivel: perfil.nivel,
                skillMejor: normalizarSkill(mejor),
                skillPeor: normalizarSkill(peor),
                valorMejor: valorMejor,
                valorPeor: valorPeor,
                diferencia: diferencia,
                sesiones: perfil.sesiones
            });
        }
        if (fase === "experto") {
            const mensajes = CoachMessages.experto.perfil;
            return replacePlaceholders(getRandomMessage(mensajes), {
                nivel: perfil.nivel,
                percentil: "10",
                skillMejor: normalizarSkill(mejor),
                skillPeor: normalizarSkill(peor),
                diferencia: diferencia,
                sesiones: perfil.sesiones
            });
        }
        if (fase === "maestro") {
            const mensajes = CoachMessages.maestro.perfil;
            return replacePlaceholders(getRandomMessage(mensajes), {
                nivel: perfil.nivel,
                percentil: "5",
                skillMejor: normalizarSkill(mejor),
                skillPeor: normalizarSkill(peor),
                valorMejor: valorMejor,
                valorPeor: valorPeor,
                rachaMaxima: perfil.rachaMaxima,
                rachaActual: perfil.racha
            });
        }
    }

    // ========== JUEGOS ==========
    if (contexto === "juegos") {
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.juegos);
        }
        if (fase === "explorador") {
            const mensajes = CoachMessages.explorador.juegos;
            return replacePlaceholders(getRandomMessage(mensajes), { skill: normalizarSkill(peor) });
        }
        if (fase === "constante") {
            const mensajes = CoachMessages.constante.juegos;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skill: normalizarSkill(peor),
                juego: juegoRec
            });
        }
        if (fase === "entrenado") {
            const mensajes = CoachMessages.entrenado.juegos;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skillPeor: normalizarSkill(peor),
                juegoRecomendado: juegoRec,
                juegoFavorito: juegoFav,
                juegoAlternativo: "otros juegos",
                veces: veces
            });
        }
        if (fase === "experto" || fase === "maestro") {
            const mensajes = CoachMessages.experto.optimizacion;
            return replacePlaceholders(getRandomMessage(mensajes), {
                juegoFavorito: juegoFav,
                juegoAlternativo: "otros juegos",
                veces: veces
            });
        }
    }

    // ========== TESTS ==========
    if (contexto === "tests") {
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.tests);
        }
        if (fase === "explorador") {
            const mensajes = CoachMessages.explorador.tests;
            return replacePlaceholders(getRandomMessage(mensajes), { skill: normalizarSkill(peor) });
        }
        if (fase === "constante") {
            const mensajes = CoachMessages.constante.tests;
            return replacePlaceholders(getRandomMessage(mensajes), { skill: normalizarSkill(peor) });
        }
        if (fase === "entrenado") {
            const mensajes = CoachMessages.entrenado.tests;
            return replacePlaceholders(getRandomMessage(mensajes), { skillPeor: normalizarSkill(peor) });
        }
        if (fase === "experto" || fase === "maestro") {
            return getRandomMessage(CoachMessages.experto.tests);
        }
    }

    // ========== ABOUT ==========
    if (contexto === "about") {
        return getRandomMessage(CoachMessages.about);
    }

    // ========== RESULTADOS ==========
    if (contexto === "resultados") {
        const { skill, diferencia, nuevaMedalla } = datos;
        
        if (nuevaMedalla) {
            const mensajes = CoachMessages.resultados.nuevaMedalla;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skill: normalizarSkill(skill),
                objetivo: "75"
            });
        }
        if (diferencia > 5) {
            const mensajes = CoachMessages.resultados.mejoraGrande;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skill: normalizarSkill(skill),
                diferencia: diferencia
            });
        }
        if (diferencia > 0) {
            const mensajes = CoachMessages.resultados.mejoraPequeña;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skill: normalizarSkill(skill),
                diferencia: diferencia
            });
        }
        if (diferencia < 0) {
            const mensajes = CoachMessages.resultados.bajada;
            return replacePlaceholders(getRandomMessage(mensajes), {
                skill: normalizarSkill(skill),
                diferencia: Math.abs(diferencia)
            });
        }
        return getRandomMessage(CoachMessages.resultados.neutro);
    }

    // ========== STANDBY ==========
    if (contexto === "standby") {
        return getRandomMessage(CoachMessages.standby);
    }

    return "¿En qué puedo ayudarte?";
}

/*------------------ EXPORTS -------------------*/
window.getCoachMessage = getCoachMessage;
window.getFaseUsuario = getFaseUsuario;
window.getMejorHabilidad = getMejorHabilidad;
window.getPeorHabilidad = getPeorHabilidad;
window.getValorHabilidad = getValorHabilidad;
window.normalizarSkill = normalizarSkill;
window.getRandomMessage = getRandomMessage;