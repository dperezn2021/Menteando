window.SaveGameData = function(jsonString) {
    try {
        jsonString = jsonString
            .replace(/Infinity/g, "0")
            .replace(/-Infinity/g, "0")
            .replace(/NaN/g, "0");

        const data = JSON.parse(jsonString);
        const perfil = getperfil();

        // Guardar valores ANTES de actualizar para calcular diferencia
        const habilidadAnterior = perfil[data.skill] || 0;
        
        perfil.sesiones++;
        perfil.ultimaSesion = data.timestamp;
        
        actualizarRachaPorSesionCompletada(perfil);

        let puntosAAñadir = Number(data.puntos);
        if (isNaN(puntosAAñadir)) puntosAAñadir = 0;
        
        perfil.puntos += puntosAAñadir;
        actualizarSesionesDiarias(perfil);

        if (!perfil.juegos[data.gameId]) perfil.juegos[data.gameId] = [];
        
        const sessionData = {
            ...data.metrics,
            timestamp: data.timestamp,
            puntosSesion: puntosAAñadir
        };
        
        perfil.juegos[data.gameId].push(sessionData);
        recalcularPerfilGlobal(perfil, data.metrics, data.gameId);
        
        // Calcular la habilidad que más cambió
        const habilidades = ["atencion", "memoria", "control", "reflejos"];
        let skillCambiada = null;
        let mayorDiferencia = 0;
        
        for (const skill of habilidades) {
            const nuevoValor = perfil[skill] || 0;
            const diferencia = Math.abs(nuevoValor * 100 - habilidadAnterior * 100);
            if (diferencia > mayorDiferencia) {
                mayorDiferencia = diferencia;
                skillCambiada = skill;
            }
        }
        
        const nuevaMedalla = verificarNuevaMedalla(perfil); // Función que detecta medallas nuevas
        
        perfil.nivel = getNivel(perfil);
        saveperfil(perfil);
        
        // ========== MOSTRAR MENSAJE DEL COACH ==========
        if (typeof coachController !== 'undefined' && coachController && !isCoachDisabled()) {
            const diferenciaPorcentaje = Math.round(mayorDiferencia);
            coachController.onResultados(skillCambiada, diferenciaPorcentaje, nuevaMedalla);
        }
        
        console.log(`✅ Sesión guardada | Puntos: ${puntosAAñadir} | Mejora en: ${skillCambiada}: ${mayorDiferencia}%`);

    } catch (e) {
        console.error("Error al guardar datos del juego:", e, jsonString);
    }
};