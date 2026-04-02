window.SaveGameData = function (jsonString) {
    try {
        // 1. Reemplazar valores inválidos ANTES de parsear
        jsonString = jsonString
            .replace(/Infinity/g, "0")
            .replace(/-Infinity/g, "0")
            .replace(/NaN/g, "0");

        // 2. Parsear con seguridad
        const data = JSON.parse(jsonString);

        const perfil = getperfil();

        // Guardar sesión
        perfil.sesiones++;
        perfil.ultimaSesion = data.timestamp;
        // Actualizar semana
        actualizarSesionesDiarias(perfil);

      

        // Guardar juego
        if (!perfil.juegos[data.gameId]) perfil.juegos[data.gameId] = [];
        perfil.juegos[data.gameId].push(data.metrics);
        perfil.juegos[data.gameId][perfil.juegos[data.gameId].length - 1].timestamp = data.timestamp;

        // Recalcular perfil
        recalcularPerfilGlobal(perfil, data.metrics, data.gameId);

        //Actualizar puntos y tiempo
        perfil.nivel = getNivel(perfil);
        perfil.puntos = getPuntos(perfil);
        perfil.tiempo = getTiempo(perfil);

        // Guardar
        saveperfil(perfil);

    } catch (e) {
        console.error("Error al guardar datos del juego:", e, jsonString);
    }
};