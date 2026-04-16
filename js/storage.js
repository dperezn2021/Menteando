window.SaveGameData = function(jsonString) {
    try {
        jsonString = jsonString
            .replace(/Infinity/g, "0")
            .replace(/-Infinity/g, "0")
            .replace(/NaN/g, "0");

        const data = JSON.parse(jsonString);
        const perfil = getperfil();

        perfil.sesiones++;
        perfil.ultimaSesion = data.timestamp;

        actualizarRachaPorSesionCompletada();

        let puntosAAñadir = Number(data.puntos);
        if (isNaN(puntosAAñadir)) puntosAAñadir = 0;
        
        // Sumar al total (para el acumulado)
        perfil.puntos += puntosAAñadir;

        actualizarSesionesDiarias(perfil);

        // Guardar el juego con la puntuación de esta sesión
        if (!perfil.juegos[data.gameId]) perfil.juegos[data.gameId] = [];
        
        // Crear objeto de la sesión con los puntos incluidos
        const sessionData = {
            ...data.metrics,  // Copiar todas las métricas
            timestamp: data.timestamp,
            puntosSesion: puntosAAñadir  // ← GUARDAR PUNTOS DE ESTA SESIÓN
        };
        
        perfil.juegos[data.gameId].push(sessionData);

        recalcularPerfilGlobal(perfil, data.metrics, data.gameId);

        perfil.nivel = getNivel(perfil);

        saveperfil(perfil);
        
        console.log(`Sesión guardada: ${puntosAAñadir} puntos para ${data.gameId}`);

    } catch (e) {
        console.error("Error al guardar datos del juego:", e, jsonString);
    }
};