window.SaveGameData = function(jsonString) {
    const data = JSON.parse(jsonString);
    const perfil = getperfil();

    // Guardar sesión
    perfil.sesiones++;
    perfil.ultimaSesion = data.timestamp;

    // Guardar juego
    if (!perfil.juegos[data.gameId]) perfil.juegos[data.gameId] = [];
    perfil.juegos[data.gameId].push(data.metrics);

    // Recalcular perfil
    recalcularPerfilGlobal(perfil, data.metrics, data.gameId);

    // Actualizar juego más jugado
    perfil.juegoMasJugado = getJuegoMasJugado(perfil);

    //Actualizar nivel
    perfil.nivel = getNivel(perfil);

    // Guardar
    saveperfil(perfil);
};
