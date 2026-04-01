/*------------------ FUNCION PARA GENERAR EL MENSAJE DEL COACH PERSONALIZADO -------------------*/

function getCoachMessage(perfil, contexto, ultimoJuego, tendencia) {

    //si estoy en el perfil, el coach habla de temas relacionados con las estadísticas obtenidas
    if (contexto === "perfil") {
        const habilidades = Object.keys(perfil.detalle);

        const skillDebil = habilidades.reduce((a, b) =>
            perfil.detalle[a] < perfil.detalle[b] ? a : b
        );

        const skillFuerte = habilidades.reduce((a, b) =>
            perfil.detalle[a] > perfil.detalle[b] ? a : b
        );

        //genera un mensaje random para su skill mas fuerte o mas debil
        const tipo = Math.random() < 0.5 ? "fuerte" : "debil";
        const skillSinNormalizar = tipo === "fuerte" ? skillFuerte : skillDebil;
        const skill = normalizarSkill(skillSinNormalizar);

        const mensajes = CoachMessages.perfil[tipo];
        const msg = mensajes[Math.floor(Math.random() * mensajes.length)];

        return msg.replace("{skill}", skill);
    }

    //si estoy en inicio
    if (contexto === "inicio") {
        const mensajes = CoachMessages.inicio;
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }

    //si estoy en la pantalla de games, busca la habilidad debil y te recomienda juegos de dicha clase
    if (contexto === "juegos") {
        const habilidades = Object.keys(perfil.detalle);
        const skillSinNormalizar = habilidades.reduce((a, b) =>
            perfil.detalle[a] < perfil.detalle[b] ? a : b
        );

        const skill = normalizarSkill(skillSinNormalizar);


        const mensajes = CoachMessages.juegos.recomendacion;
        const msg = mensajes[Math.floor(Math.random() * mensajes.length)];

        return msg.replace("{skill}", skill);
    }

    // === RESULTADOS ===
    if (contexto === "resultados") {
        const tipo = tendencia > 0 ? "mejora" : "bajada";
        const mensajes = CoachMessages.resultados[tipo];

        const msg = mensajes[Math.floor(Math.random() * mensajes.length)];
        return msg.replace("{skill}", ultimoJuego);
    }

    if (contexto === "standby") {
        const mensajes = CoachMessages.standby;
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }

    if (contexto === "about") {
        const mensajes = CoachMessages.about;
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }

    if (contexto === "tests") {
        const mensajes = CoachMessages.tests;
        return mensajes[Math.floor(Math.random() * mensajes.length)];
    }
    return null;
}

function normalizarSkill(skill) {
    if (!skill) return "";

    const mapa = {
        capacidadCognitiva: "Capacidad Cognitiva",
        atencionSostenida: "Atención Sostenida",
        atencionSelectiva: "Atención Selectiva",
        atencionDividida: "Atención Dividida",
        memoriaTrabajo: "Memoria de Trabajo",
        memoriaEspacial: "Memoria Espacial",
        controlInhibitorio: "Control Inhibitorio",
        flexibilidadCognitiva: "Flexibilidad Cognitiva",
        planificacion: "Planificación",
        velocidadCognitiva: "Velocidad Cognitiva",
        coordinacionVisomotora: "Coordinación Visomotora"
    };

    return mapa[skill] || skill;
}


window.getCoachMessage = getCoachMessage;
