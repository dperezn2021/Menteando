/*------------------ FUNCIONES AUXILIARES -------------------*/

function getRandomMessage(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSequentialCoachMessage(storageKey, messages) {
    if (!messages || messages.length === 0) return null;

    try {
        const currentIndex = Number.parseInt(localStorage.getItem(storageKey) || "0", 10);
        if (Number.isNaN(currentIndex) || currentIndex < 0) {
            localStorage.setItem(storageKey, "1");
            return messages[0];
        }
        if (currentIndex >= messages.length) return null;

        localStorage.setItem(storageKey, String(currentIndex + 1));
        return messages[currentIndex];
    } catch (error) {
        return getRandomMessage(messages);
    }
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

function getSkillLabel(skillSlug) {
    const definition = window.getSkillDefinition?.(skillSlug);
    return definition?.label || String(skillSlug || "").replace(/_/g, " ");
}

function getMetricKeyFromSkill(skillSlug) {
    return window.getSkillDefinition?.(skillSlug)?.metricKey || skillSlug;
}

function formatCoachPercent(value) {
    const number = Number(value) || 0;
    return Math.round(Math.max(0, Math.min(1, number)) * 100);
}

function formatCoachPoints(value) {
    const number = Number(value) || 0;
    if (typeof window.formatearPuntos === "function") return window.formatearPuntos(number);
    return Math.round(number).toString();
}

function getHistorialPorId(collection, id, normalizer) {
    if (!collection || !id) return [];
    if (Array.isArray(collection[id])) return collection[id];

    const normalizedId = normalizer ? normalizer(id) : String(id);
    const matchedKey = Object.keys(collection).find((key) => {
        const normalizedKey = normalizer ? normalizer(key) : String(key);
        return normalizedKey === normalizedId;
    });

    return matchedKey && Array.isArray(collection[matchedKey]) ? collection[matchedKey] : [];
}

function getSkillObjetivoDesdePerfil(perfil, skillSlugs = []) {
    if (!skillSlugs.length) {
        const peorGlobal = getPeorHabilidad(perfil);
        return {
            label: normalizarSkill(peorGlobal),
            value: getValorHabilidad(perfil, peorGlobal)
        };
    }

    const candidates = skillSlugs.map((skillSlug) => {
        const metricKey = getMetricKeyFromSkill(skillSlug);
        const rawValue = Number(perfil.detalle?.[metricKey]) || 0;
        return {
            slug: skillSlug,
            label: getSkillLabel(skillSlug),
            value: formatCoachPercent(rawValue),
            rawValue
        };
    });

    return candidates.sort((a, b) => a.rawValue - b.rawValue)[0] || {
        label: getSkillLabel(skillSlugs[0]),
        value: 0
    };
}

function getCoachMessageFromGroup(group, replacements, preferredKeys = []) {
    const messages = [];

    preferredKeys.forEach((key) => {
        if (Array.isArray(group?.[key])) messages.push(...group[key]);
    });

    if (Array.isArray(group?.habilidad)) messages.push(...group.habilidad);
    if (Array.isArray(group?.ayuda)) messages.push(...group.ayuda);

    return replacePlaceholders(getRandomMessage(messages), replacements);
}

function getGameDetailCoachMessage(perfil, datos = {}) {
    const juego = datos.juego || window.getJuegoById?.(datos.gameId);
    if (!juego) return getRandomMessage(CoachMessages.novato.juegos);

    const historial = getHistorialPorId(perfil.juegos, juego.id, window.normalizeGameKey);
    const ultimaSesion = historial[historial.length - 1] || {};
    const puntosUltima = Number(ultimaSesion.puntosSesion) || 0;
    const puntosMejor = historial.reduce((max, sesion) => {
        return Math.max(max, Number(sesion?.puntosSesion) || 0);
    }, 0);
    const skillObjetivo = getSkillObjetivoDesdePerfil(perfil, juego.skills || []);
    const replacements = {
        juego: juego.nombre,
        sesionesJuego: historial.length,
        puntosUltima: formatCoachPoints(puntosUltima),
        puntosMejor: formatCoachPoints(puntosMejor),
        skills: (juego.skills || []).map(getSkillLabel).join(", "),
        skillObjetivo: skillObjetivo.label,
        valorSkill: skillObjetivo.value
    };

    return getCoachMessageFromGroup(
        CoachMessages.juegoDetalle,
        replacements,
        historial.length > 0 ? ["conHistorial"] : ["primeraVez"]
    );
}

function resumirMetricasTest(metrics = {}) {
    if (typeof metrics.precision === "number") {
        const precision = metrics.precision <= 1 ? metrics.precision * 100 : metrics.precision;
        return `precisión ${Math.round(precision)}%`;
    }
    if (typeof metrics.aciertos === "number") return `${metrics.aciertos} aciertos`;
    if (typeof metrics.puntuacion === "number") return `${Math.round(metrics.puntuacion)} puntos`;
    if (typeof metrics.score === "number") return `${Math.round(metrics.score)} puntos`;
    return "resultados guardados";
}

function getTestDetailCoachMessage(perfil, datos = {}) {
    const test = datos.test || window.getTestById?.(datos.testId);
    if (!test) return getRandomMessage(CoachMessages.novato.tests);

    const historial = getHistorialPorId(perfil.tests, test.id, window.normalizeTestKey);
    const ultimoResultado = historial[historial.length - 1] || {};
    const skillObjetivo = getSkillObjetivoDesdePerfil(perfil, test.habilidades || []);
    const replacements = {
        test: test.nombre,
        vecesTest: historial.length,
        resumenUltimo: resumirMetricasTest(ultimoResultado.metrics),
        skills: (test.habilidades || []).map(getSkillLabel).join(", "),
        skillObjetivo: skillObjetivo.label,
        valorSkill: skillObjetivo.value
    };

    return getCoachMessageFromGroup(
        CoachMessages.testDetalle,
        replacements,
        historial.length > 0 ? ["conHistorial"] : ["primeraVez"]
    );
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

    // ========== FICHAS DE JUEGO / TEST ==========
    if (contexto === "juegoDetalle") {
        return getGameDetailCoachMessage(perfil, datos);
    }

    if (contexto === "testDetalle") {
        return getTestDetailCoachMessage(perfil, datos);
    }

    // ========== INICIO ==========
    if (contexto === "inicio") {
        if (fase === "novato") {
            const onboardingMsg = getSequentialCoachMessage("menteandoCoachInicioGuiado", CoachMessages.novato.inicioGuiado);
            if (onboardingMsg) return onboardingMsg;
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
