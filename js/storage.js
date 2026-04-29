window.SaveGameData = function(jsonString) {
    try {
        jsonString = jsonString
            .replace(/Infinity/g, "0")
            .replace(/-Infinity/g, "0")
            .replace(/NaN/g, "0");

        const data = JSON.parse(jsonString);
        const perfil = getperfil();

        // Guardar valores ANTES de actualizar
        const habilidadesAntes = {
            atencion: perfil.atencion || 0,
            memoria: perfil.memoria || 0,
            control: perfil.control || 0,
            reflejos: perfil.reflejos || 0
        };
        
        perfil.sesiones++;
        perfil.ultimaSesion = data.timestamp;
        
        // ACTUALIZAR RACHA - pasar el perfil como parámetro
        if (typeof actualizarRachaPorSesionCompletada === 'function') {
            actualizarRachaPorSesionCompletada(perfil);
        }

        let puntosAAñadir = Number(data.puntos);
        if (isNaN(puntosAAñadir)) puntosAAñadir = 0;
        
        perfil.puntos += puntosAAñadir;
        
        // ACTUALIZAR SESIONES DIARIAS
        if (typeof actualizarSesionesDiarias === 'function') {
            actualizarSesionesDiarias(perfil);
        }

        // ===== GUARDAR LA SESIÓN EN EL HISTORIAL =====
        if (!perfil.juegos[data.gameId]) {
            perfil.juegos[data.gameId] = [];
        }
        
        const sessionData = {
            ...data.metrics,
            timestamp: data.timestamp,
            puntosSesion: puntosAAñadir
        };
        
        perfil.juegos[data.gameId].push(sessionData);
        
        // RECALCULAR HABILIDADES
        if (typeof recalcularPerfilGlobal === 'function') {
            recalcularPerfilGlobal(perfil, data.metrics, data.gameId);
        }
        
        // Calcular la habilidad que más cambió
        const habilidades = ["atencion", "memoria", "control", "reflejos"];
        let skillCambiada = null;
        let mayorDiferencia = 0;
        
        for (const skill of habilidades) {
            const nuevoValor = perfil[skill] || 0;
            const valorAnterior = habilidadesAntes[skill] || 0;
            const diferencia = Math.abs((nuevoValor - valorAnterior) * 100);
            if (diferencia > mayorDiferencia) {
                mayorDiferencia = diferencia;
                skillCambiada = skill;
            }
        }
        
        // Verificar medallas nuevas (función simple)
        let nuevaMedalla = false;
        const medallasCompletadas = JSON.parse(localStorage.getItem("medallas_completadas") || "[]");
        
        if (perfil.reflejos >= 0.75 && !medallasCompletadas.includes("reflejos_75")) nuevaMedalla = true;
        if (perfil.atencion >= 0.80 && !medallasCompletadas.includes("atencion_80")) nuevaMedalla = true;
        if (perfil.memoria >= 0.70 && !medallasCompletadas.includes("memoria_70")) nuevaMedalla = true;
        if (perfil.control >= 0.75 && !medallasCompletadas.includes("control_75")) nuevaMedalla = true;
        if (perfil.racha >= 7 && !medallasCompletadas.includes("racha_7")) nuevaMedalla = true;
        if (perfil.sesiones >= 20 && !medallasCompletadas.includes("sesiones_20")) nuevaMedalla = true;
        
        perfil.nivel = typeof getNivel === 'function' ? getNivel(perfil) : 0;
        saveperfil(perfil);
        
        // Mostrar mensaje del coach si existe
        if (typeof coachController !== 'undefined' && coachController && typeof isCoachDisabled === 'function' && !isCoachDisabled()) {
            const diferenciaPorcentaje = Math.round(mayorDiferencia);
            if (typeof coachController.onResultados === 'function') {
                coachController.onResultados(skillCambiada, diferenciaPorcentaje, nuevaMedalla);
            }
        }
        
        console.log(`✅ Sesión guardada | Juego: ${data.gameId} | Puntos: ${puntosAAñadir} | Sesiones totales: ${perfil.sesiones}`);

    } catch (e) {
        console.error("❌ Error al guardar datos del juego:", e, jsonString);
    }
};