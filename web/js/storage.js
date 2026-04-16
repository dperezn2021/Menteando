window.SaveGameData = function (jsonString) {
    try {
        jsonString = jsonString
            .replace(/Infinity/g, "0")
            .replace(/-Infinity/g, "0")
            .replace(/NaN/g, "0");

        const data = JSON.parse(jsonString);
        const perfil = getperfil();

        // Guardar sesión
        perfil.sesiones++;
        perfil.ultimaSesion = data.timestamp;
        
        // Actualizar racha
        actualizarRachaPorSesionCompletada();
        
        // Sumar puntos (solo el número)
        let puntosAAñadir = Number(data.puntos);
        if (isNaN(puntosAAñadir)) puntosAAñadir = 0;
        perfil.puntos += puntosAAñadir;

        // Actualizar sesiones diarias
        actualizarSesionesDiarias(perfil);

        // Guardar juego
        if (!perfil.juegos[data.gameId]) perfil.juegos[data.gameId] = [];
        perfil.juegos[data.gameId].push(data.metrics);
        perfil.juegos[data.gameId][perfil.juegos[data.gameId].length - 1].timestamp = data.timestamp;

        // Recalcular perfil
        recalcularPerfilGlobal(perfil, data.metrics, data.gameId);

        // Actualizar nivel y tiempo
        perfil.nivel = getNivel(perfil);
        perfil.tiempo = getTiempo(perfil);

        // Guardar
        saveperfil(perfil);

    } catch (e) {
        console.error("Error al guardar datos del juego:", e, jsonString);
    }
};