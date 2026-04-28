/*------------------ FUNCIONES AUXILIARES -------------------*/

function getFaseUsuario(perfil) {
    const sesiones = perfil.sesiones || 0;
    const fechaInicio = new Date(perfil.desde);
    const diasDesdeInicio = Math.floor((new Date() - fechaInicio) / 86400000);

    if (sesiones <= 3 || diasDesdeInicio <= 2) return "novato";
    if (sesiones <= 10 || diasDesdeInicio <= 7) return "explorador";
    if (sesiones <= 25 || diasDesdeInicio <= 20) return "constante";
    if (sesiones <= 50 || diasDesdeInicio <= 40) return "entrenado";
    if (sesiones <= 100 || diasDesdeInicio <= 80) return "experto";
    return "maestro";
}

function getHabilidadesPrincipales(perfil) {
    return {
        atencion: perfil.atencion || 0,
        memoria: perfil.memoria || 0,
        control: perfil.control || 0,
        reflejos: perfil.reflejos || 0
    };
}

function getMejorHabilidad(perfil) {
    const habilidades = getHabilidadesPrincipales(perfil);
    return Object.entries(habilidades).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}

function getPeorHabilidad(perfil) {
    const habilidades = getHabilidadesPrincipales(perfil);
    return Object.entries(habilidades).reduce((a, b) => a[1] < b[1] ? a : b)[0];
}

function getValorHabilidad(perfil, habilidad) {
    const habilidades = getHabilidadesPrincipales(perfil);
    return Math.round(habilidades[habilidad] * 100);
}

function getRandomMessage(messageArray) {
    if (!messageArray || messageArray.length === 0) return null;
    return messageArray[Math.floor(Math.random() * messageArray.length)];
}

function replacePlaceholders(msg, replacements) {
    if (!msg) return msg;
    let result = msg;
    for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
}

function getMensajePorFase(fase, categoria, subcategoria = null, replacements = {}) {
    let mensajes = null;
    
    // Navegar por la estructura de CoachMessages
    if (subcategoria && CoachMessages[fase] && CoachMessages[fase][subcategoria]) {
        mensajes = CoachMessages[fase][subcategoria];
    } else if (CoachMessages[fase] && CoachMessages[fase][categoria]) {
        mensajes = CoachMessages[fase][categoria];
    } else if (CoachMessages[fase] && CoachMessages[fase][categoria]?.length) {
        mensajes = CoachMessages[fase][categoria];
    }
    
    const msg = getRandomMessage(mensajes);
    return msg ? replacePlaceholders(msg, replacements) : null;
}

/*------------------ FUNCION PRINCIPAL -------------------*/

function getCoachMessage(perfil, contexto, subContexto = null, datos = {}) {
    const fase = getFaseUsuario(perfil);
    const mejor = getMejorHabilidad(perfil);
    const peor = getPeorHabilidad(perfil);
    const valorMejor = getValorHabilidad(perfil, mejor);
    const valorPeor = getValorHabilidad(perfil, peor);
    
    const replacementsBase = {
        sesiones: perfil.sesiones,
        racha: perfil.racha,
        rachaMaxima: perfil.rachaMaxima,
        rachaActual: perfil.racha,
        nivel: perfil.nivel,
        skillMejor: normalizarSkill(mejor),
        skillPeor: normalizarSkill(peor),
        valorMejor: valorMejor,
        valorPeor: valorPeor,
        diferencia: Math.abs(valorMejor - valorPeor)
    };

    // ========== INICIO ==========
    if (contexto === "inicio") {
        // Primera visita del día para novato
        if (fase === "novato") {
            const ultimaVisita = localStorage.getItem("ultima_visita_inicio");
            const hoy = new Date().toDateString();
            if (ultimaVisita !== hoy) {
                localStorage.setItem("ultima_visita_inicio", hoy);
                return getRandomMessage(CoachMessages.novato.bienvenida);
            }
            
            const opciones = ["modoOscuro", "perfil", "juegos", "tests", "about"];
            const elegido = opciones[Math.floor(Math.random() * opciones.length)];
            return getRandomMessage(CoachMessages.novato[elegido]);
        }
        
        return getMensajePorFase(fase, "inicio", null, replacementsBase);
    }

    // ========== PERFIL ==========
    if (contexto === "perfil") {
        // Subcontextos específicos
        if (subContexto === "editar") {
            if (fase === "novato" || fase === "explorador") {
                return getRandomMessage(CoachMessages.novato.editar);
            }
            return null;
        }
        
        if (subContexto === "coach") {
            if (fase === "novato" || fase === "explorador" || fase === "constante") {
                return getRandomMessage(CoachMessages.novato.coach);
            }
            return null;
        }
        
        if (subContexto === "medallas") {
            if (fase === "novato" || fase === "explorador") {
                return getRandomMessage(CoachMessages.novato.medallas);
            }
            if (fase === "constante") {
                return getMensajePorFase("constante", "medallas", null, {
                    diasPara14: Math.max(0, 14 - perfil.racha),
                    siguienteMedalla: "14 días",
                    progreso: `${Math.min(100, Math.round(perfil.racha / 14 * 100))}%`
                });
            }
            return null;
        }
        
        // Eventos especiales
        if (perfil.nuevaRachaMaxima && perfil.rachaMaxima > 0) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.perfil.rachaMaxima),
                { racha: perfil.rachaMaxima }
            );
        }
        
        if (perfil.racha >= 7 && perfil.racha < 8) {
            return getRandomMessage(CoachMessages.perfil.hito7Dias);
        }
        
        if (perfil.racha >= 14 && perfil.racha < 15) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.perfil.hito14Dias),
                { skillMejor: normalizarSkill(mejor) }
            );
        }
        
        // Análisis por fase
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.perfil);
        }
        
        if (fase === "explorador") {
            return getMensajePorFase("explorador", "perfil", null, {
                sesiones: perfil.sesiones,
                skillMejor: normalizarSkill(mejor),
                skillPeor: normalizarSkill(peor)
            });
        }
        
        if (fase === "constante") {
            return getMensajePorFase("constante", "perfil", null, replacementsBase);
        }
        
        if (fase === "entrenado") {
            return getMensajePorFase("entrenado", "perfil", null, replacementsBase);
        }
        
        if (fase === "experto") {
            return getMensajePorFase("experto", "perfil", null, replacementsBase);
        }
        
        if (fase === "maestro") {
            return getMensajePorFase("maestro", "perfil", null, replacementsBase);
        }
    }

    // ========== JUEGOS ==========
    if (contexto === "juegos") {
        // Explicación de juego específico
        if (subContexto && CoachMessages.juegos?.explicacionesJuegos?.[subContexto]) {
            const juego = CoachMessages.juegos.explicacionesJuegos[subContexto];
            return `${juego.que}. ${juego.como} → ${juego.beneficio}.`;
        }
        
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.juegos);
        }
        
        if (fase === "explorador") {
            return getRandomMessage(CoachMessages.explorador.juegos);
        }
        
        if (fase === "constante") {
            const juegoRecomendado = getJuegoRecomendadoPorHabilidad(perfil);
            return getMensajePorFase("constante", "juegos", null, {
                skill: normalizarSkill(peor),
                juego: juegoRecomendado?.nombre || "juegos de esa categoría"
            });
        }
        
        if (fase === "entrenado") {
            const juegoRecomendado = getJuegoRecomendadoPorHabilidad(perfil);
            return getMensajePorFase("entrenado", "juegos", null, {
                skillPeor: normalizarSkill(peor),
                juegoRecomendado: juegoRecomendado?.nombre || "juegos de esa categoría",
                juegoFavorito: perfil.juegoMasJugado || "ninguno",
                veces: perfil.juegos[perfil.juegoMasJugado]?.length || 0,
                juegoAlternativo: "otros juegos"
            });
        }
        
        if (fase === "experto" || fase === "maestro") {
            const otrosJuegos = window.CATALOGO_JUEGOS?.filter(j => j.id !== perfil.juegoMasJugado && j.disponible === "Disponible") || [];
            return getMensajePorFase("experto", "optimizacion", null, {
                juegoFavorito: perfil.juegoMasJugado || "ninguno",
                veces: perfil.juegos[perfil.juegoMasJugado]?.length || 0,
                juegoAlternativo: otrosJuegos[0]?.nombre || "otros juegos"
            });
        }
    }

    // ========== TESTS ==========
    if (contexto === "tests") {
        if (subContexto && CoachMessages.tests?.explicacionesTests?.[subContexto]) {
            return CoachMessages.tests.explicacionesTests[subContexto];
        }
        
        if (fase === "novato") {
            return getRandomMessage(CoachMessages.novato.tests);
        }
        
        if (fase === "explorador") {
            return getRandomMessage(CoachMessages.explorador.tests);
        }
        
        if (fase === "constante" || fase === "entrenado") {
            return getMensajePorFase("entrenado", "tests", null, {
                skillPeor: normalizarSkill(peor)
            });
        }
        
        if (fase === "experto" || fase === "maestro") {
            return getRandomMessage(CoachMessages.experto.tests);
        }
    }

    // ========== ABOUT (siempre igual) ==========
    if (contexto === "about") {
        return getRandomMessage(CoachMessages.about);
    }

    // ========== RESULTADOS ==========
    if (contexto === "resultados") {
        const { skill, diferencia, nuevaMedalla } = datos;
        
        if (nuevaMedalla) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.resultados.nuevaMedalla),
                { skill: normalizarSkill(skill), objetivo: datos.objetivo || "75" }
            );
        }
        
        if (diferencia > 5) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.resultados.mejoraGrande),
                { skill: normalizarSkill(skill), diferencia: diferencia }
            );
        }
        
        if (diferencia > 0) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.resultados.mejoraPequeña),
                { skill: normalizarSkill(skill), diferencia: diferencia }
            );
        }
        
        if (diferencia < 0) {
            return replacePlaceholders(
                getRandomMessage(CoachMessages.resultados.bajada),
                { skill: normalizarSkill(skill), diferencia: Math.abs(diferencia) }
            );
        }
        
        return getRandomMessage(CoachMessages.resultados.neutro);
    }

    // ========== STANDBY ==========
    if (contexto === "standby") {
        return getRandomMessage(CoachMessages.standby);
    }

    return "¿En qué puedo ayudarte hoy?";
}

function normalizarSkill(skill) {
    if (!skill) return "";
    
    const mapa = {
        atencion: "atención",
        memoria: "memoria",
        control: "control",
        reflejos: "reflejos",
        atencionSostenida: "atención sostenida",
        atencionSelectiva: "atención selectiva",
        atencionDividida: "atención dividida",
        memoriaTrabajo: "memoria de trabajo",
        memoriaEspacial: "memoria espacial",
        controlInhibitorio: "control inhibitorio",
        flexibilidadCognitiva: "flexibilidad cognitiva",
        planificacion: "planificación",
        velocidadCognitiva: "velocidad cognitiva",
        coordinacionVisomotora: "coordinación visomotora"
    };
    
    return mapa[skill] || skill;
}

function verificarNuevaMedalla(perfil) {
    // Comprobar medallas completadas en localStorage
    const medallasCompletadas = JSON.parse(localStorage.getItem("medallas_completadas") || "[]");
    
    // Medallas posibles según el perfil actual
    const medallasPosibles = [];
    
    if (perfil.reflejos >= 0.75) medallasPosibles.push("reflejos_75");
    if (perfil.atencion >= 0.80) medallasPosibles.push("atencion_80");
    if (perfil.memoria >= 0.70) medallasPosibles.push("memoria_70");
    if (perfil.control >= 0.75) medallasPosibles.push("control_75");
    if (perfil.racha >= 7) medallasPosibles.push("racha_7");
    if (perfil.sesiones >= 20) medallasPosibles.push("sesiones_20");
    
    // Verificar si alguna es nueva
    for (const medalla of medallasPosibles) {
        if (!medallasCompletadas.includes(medalla)) {
            return true; // Hay al menos una medalla nueva
        }
    }
    return false;
}

/*------------------ EXPORTS -------------------*/
window.getCoachMessage = getCoachMessage;
window.getFaseUsuario = getFaseUsuario;
window.getMejorHabilidad = getMejorHabilidad;
window.getPeorHabilidad = getPeorHabilidad;
window.getValorHabilidad = getValorHabilidad;
window.verificarNuevaMedalla = verificarNuevaMedalla;