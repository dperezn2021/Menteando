function CoachController(perfil) {
    if (isCoachDisabled()) {
        console.warn("Coach desactivado");
        return;
    }

    this.perfil = perfil;
    this.entity = new CoachEntity(
        document.getElementById("coach"),
        document.getElementById("coach-bubble")
    );

    this.reappearTimer = null;
    this.currentContext = null;
    this.currentSubContexto = null;
    this.messageQueue = [];
    this.currentMessageIndex = 0;
    
    this.setupUserInteractionListeners();
    this.detectPantallaActual();
}

CoachController.prototype.detectPantallaActual = function () {
    const path = window.location.pathname;
    console.log("📄 Detectando página:", path);
    
    if (path.includes("perfil.html")) {
        this.onPantallaPerfil();
    } else if (path.includes("games.html")) {
        this.onPantallaJuegos();
    } else if (path.includes("tests.html")) {
        this.onPantallaTests();
    } else if (path.includes("about.html")) {
        this.onPantallaAbout();
    } else {
        this.onMenuPrincipal();
    }
};

CoachController.prototype.setupUserInteractionListeners = function () {
    const onInteraction = () => {
        this.entity.hide();
        
        if (this.reappearTimer) {
            clearTimeout(this.reappearTimer);
        }
        
        this.reappearTimer = setTimeout(() => {
            this.showCurrentMessage();
        }, 3000);
    };
    
    document.addEventListener("click", onInteraction);
    document.addEventListener("keydown", onInteraction);
};

CoachController.prototype.showCurrentMessage = function () {
    if (this.messageQueue.length === 0) return;
    
    const msg = this.messageQueue[this.currentMessageIndex % this.messageQueue.length];
    this.currentMessageIndex++;
    
    if (msg) {
        this.entity.show(msg);
    }
};

// Generar cola de mensajes según fase y contexto
CoachController.prototype.generateMessageQueue = function (contexto, subContexto = null) {
    const queue = [];
    const fase = getFaseUsuario(this.perfil);
    
    // ========== INICIO ==========
    if (contexto === "inicio") {
        if (fase === "novato") {
            // Primera visita: bienvenida
            const ultimaVisita = localStorage.getItem("ultima_visita_inicio");
            const hoy = new Date().toDateString();
            if (ultimaVisita !== hoy) {
                localStorage.setItem("ultima_visita_inicio", hoy);
                queue.push(...CoachMessages.novato.bienvenida);
            }
            // Tutorial rotativo
            queue.push(...CoachMessages.novato.modoOscuro);
            queue.push(...CoachMessages.novato.perfil);
            queue.push(...CoachMessages.novato.juegos);
            queue.push(...CoachMessages.novato.tests);
            queue.push(...CoachMessages.novato.about);
        } else if (fase === "explorador") {
            queue.push(...(CoachMessages.explorador.inicio || CoachMessages.constante.inicio));
        } else if (fase === "constante") {
            queue.push(...CoachMessages.constante.inicio);
        } else if (fase === "entrenado") {
            queue.push(...CoachMessages.entrenado.inicio);
        } else if (fase === "experto") {
            queue.push(...CoachMessages.experto.inicio);
        } else if (fase === "maestro") {
            queue.push(...CoachMessages.maestro.inicio);
        }
    }
    
    // ========== PERFIL ==========
    else if (contexto === "perfil") {
        
        // Subcontexto editar
        if (subContexto === "editar") {
            if (fase === "novato" || fase === "explorador") {
                queue.push(...CoachMessages.novato.editar);
            }
        }
        // Subcontexto coach
        else if (subContexto === "coach") {
            if (fase === "novato" || fase === "explorador" || fase === "constante") {
                queue.push(...CoachMessages.novato.coach);
            }
        }
        // Subcontexto medallas
        else if (subContexto === "medallas") {
            if (fase === "novato" || fase === "explorador") {
                queue.push(...CoachMessages.novato.medallas);
            } else if (fase === "constante") {
                queue.push(...CoachMessages.constante.medallas);
            }
        }
        // Análisis normal del perfil
        else {
            // Eventos especiales primero
            if (this.perfil.nuevaRachaMaxima && this.perfil.rachaMaxima > 0) {
                const msg = CoachMessages.perfil.rachaMaxima[0].replace("{racha}", this.perfil.rachaMaxima);
                queue.push(msg);
            } else if (this.perfil.racha >= 7 && this.perfil.racha < 8) {
                queue.push(...CoachMessages.perfil.hito7Dias);
            } else if (this.perfil.racha >= 14 && this.perfil.racha < 15) {
                const mejor = this.getMejorHabilidadNombre();
                const msg = CoachMessages.perfil.hito14Dias[0].replace("{skillMejor}", normalizarSkill(mejor));
                queue.push(msg);
            } else {
                // Mensajes según fase
                if (fase === "novato") {
                    queue.push(...CoachMessages.novato.perfil);
                } else if (fase === "explorador") {
                    queue.push(...CoachMessages.explorador.perfil);
                } else if (fase === "constante") {
                    const mejor = this.getMejorHabilidadNombre();
                    const peor = this.getPeorHabilidadNombre();
                    CoachMessages.constante.perfil.forEach(msg => {
                        queue.push(msg
                            .replace("{sesiones}", this.perfil.sesiones)
                            .replace("{racha}", this.perfil.racha)
                            .replace("{skillMejor}", normalizarSkill(mejor))
                            .replace("{skillPeor}", normalizarSkill(peor))
                        );
                    });
                } else if (fase === "entrenado") {
                    const mejor = this.getMejorHabilidadNombre();
                    const peor = this.getPeorHabilidadNombre();
                    const diferencia = Math.abs(this.getValorHabilidad(mejor) - this.getValorHabilidad(peor));
                    CoachMessages.entrenado.perfil.forEach(msg => {
                        queue.push(msg
                            .replace("{nivel}", this.perfil.nivel)
                            .replace("{skillMejor}", normalizarSkill(mejor))
                            .replace("{skillPeor}", normalizarSkill(peor))
                            .replace("{diferencia}", diferencia)
                        );
                    });
                } else if (fase === "experto") {
                    const mejor = this.getMejorHabilidadNombre();
                    const peor = this.getPeorHabilidadNombre();
                    const diferencia = Math.abs(this.getValorHabilidad(mejor) - this.getValorHabilidad(peor));
                    CoachMessages.experto.perfil.forEach(msg => {
                        queue.push(msg
                            .replace("{nivel}", this.perfil.nivel)
                            .replace("{skillMejor}", normalizarSkill(mejor))
                            .replace("{skillPeor}", normalizarSkill(peor))
                            .replace("{diferencia}", diferencia)
                        );
                    });
                } else if (fase === "maestro") {
                    const mejor = this.getMejorHabilidadNombre();
                    const peor = this.getPeorHabilidadNombre();
                    const valorMejor = this.getValorHabilidad(mejor);
                    const valorPeor = this.getValorHabilidad(peor);
                    CoachMessages.maestro.perfil.forEach(msg => {
                        queue.push(msg
                            .replace("{nivel}", this.perfil.nivel)
                            .replace("{skillMejor}", normalizarSkill(mejor))
                            .replace("{skillPeor}", normalizarSkill(peor))
                            .replace("{valorMejor}", valorMejor)
                            .replace("{valorPeor}", valorPeor)
                            .replace("{rachaMaxima}", this.perfil.rachaMaxima)
                            .replace("{rachaActual}", this.perfil.racha)
                        );
                    });
                }
            }
        }
    }
    
    // ========== JUEGOS ==========
    else if (contexto === "juegos") {
        // Explicación de juego específico
        if (subContexto && CoachMessages.juegos?.explicacionesJuegos?.[subContexto]) {
            const juego = CoachMessages.juegos.explicacionesJuegos[subContexto];
            queue.push(`${juego.que}. ${juego.como} → ${juego.beneficio}.`);
        } else {
            if (fase === "novato") {
                queue.push(...CoachMessages.novato.juegos);
            } else if (fase === "constante") {
                const peor = this.getPeorHabilidadNombre();
                const juegoRecomendado = getJuegoRecomendadoPorHabilidad(this.perfil);
                const nombreJuego = juegoRecomendado ? juegoRecomendado.nombre : "juegos de esa categoría";
                CoachMessages.constante.juegos.forEach(msg => {
                    queue.push(msg
                        .replace("{skill}", normalizarSkill(peor))
                        .replace("{juego}", nombreJuego)
                    );
                });
            } else if (fase === "entrenado") {
                const peor = this.getPeorHabilidadNombre();
                const juegoRecomendado = getJuegoRecomendadoPorHabilidad(this.perfil);
                const nombreJuego = juegoRecomendado ? juegoRecomendado.nombre : "juegos de esa categoría";
                CoachMessages.entrenado.juegos.forEach(msg => {
                    queue.push(msg
                        .replace("{skillPeor}", normalizarSkill(peor))
                        .replace("{juegoRecomendado}", nombreJuego)
                    );
                });
            } else if (fase === "experto" || fase === "maestro") {
                const juegoFavorito = this.perfil.juegoMasJugado || "ninguno";
                const veces = this.perfil.juegos[juegoFavorito]?.length || 0;
                const otrosJuegos = window.CATALOGO_JUEGOS?.filter(j => j.id !== juegoFavorito && j.disponible === "Disponible") || [];
                const juegoAlternativo = otrosJuegos.length > 0 ? otrosJuegos[0] : null;
                CoachMessages.experto.optimizacion.forEach(msg => {
                    queue.push(msg
                        .replace("{juegoFavorito}", juegoFavorito)
                        .replace("{veces}", veces)
                        .replace("{juegoAlternativo}", juegoAlternativo?.nombre || "otros juegos")
                    );
                });
            }
        }
    }
    
    // ========== TESTS ==========
    else if (contexto === "tests") {
        if (subContexto && CoachMessages.tests?.explicacionesTests?.[subContexto]) {
            queue.push(CoachMessages.tests.explicacionesTests[subContexto]);
        } else {
            if (fase === "novato") {
                queue.push(...CoachMessages.novato.tests);
            } else if (fase === "constante" || fase === "entrenado") {
                const peor = this.getPeorHabilidadNombre();
                CoachMessages.entrenado.tests.forEach(msg => {
                    queue.push(msg.replace("{skillPeor}", normalizarSkill(peor)));
                });
            } else if (fase === "experto" || fase === "maestro") {
                queue.push(...CoachMessages.experto.tests);
            }
        }
    }
    
    // ========== ABOUT ==========
    else if (contexto === "about") {
        queue.push(...CoachMessages.about);
    }
    
    return queue;
};

// Métodos auxiliares
CoachController.prototype.getMejorHabilidadNombre = function () {
    const habilidades = {
        atencion: this.perfil.atencion || 0,
        memoria: this.perfil.memoria || 0,
        control: this.perfil.control || 0,
        reflejos: this.perfil.reflejos || 0
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
};

CoachController.prototype.getPeorHabilidadNombre = function () {
    const habilidades = {
        atencion: this.perfil.atencion || 0,
        memoria: this.perfil.memoria || 0,
        control: this.perfil.control || 0,
        reflejos: this.perfil.reflejos || 0
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
};

CoachController.prototype.getValorHabilidad = function (habilidad) {
    const mapa = {
        atencion: this.perfil.atencion || 0,
        memoria: this.perfil.memoria || 0,
        control: this.perfil.control || 0,
        reflejos: this.perfil.reflejos || 0
    };
    return Math.round(mapa[habilidad] * 100);
};

// === EVENTOS PARA CADA PANTALLA ===
CoachController.prototype.onPantallaPerfil = function (subContexto = null) {
    const fase = getFaseUsuario(this.perfil);
    
    // Editar perfil: solo para novato y explorador
    if (subContexto === "editar") {
        if (fase === "novato" || fase === "explorador") {
            this.messageQueue = this.generateMessageQueue("perfil", subContexto);
            this.currentMessageIndex = 0;
            if (this.messageQueue.length > 0) {
                this.entity.show(this.messageQueue[0]);
                this.currentMessageIndex = 1;
            }
        }
        return;
    }
    
    // Coach: solo para novato, explorador y constante
    if (subContexto === "coach") {
        if (fase === "novato" || fase === "explorador" || fase === "constante") {
            this.messageQueue = this.generateMessageQueue("perfil", subContexto);
            this.currentMessageIndex = 0;
            if (this.messageQueue.length > 0) {
                this.entity.show(this.messageQueue[0]);
                this.currentMessageIndex = 1;
            }
        }
        return;
    }
    
    // Medallas: para todos excepto experto y maestro
    if (subContexto === "medallas") {
        if (fase !== "experto" && fase !== "maestro") {
            this.messageQueue = this.generateMessageQueue("perfil", subContexto);
            this.currentMessageIndex = 0;
            if (this.messageQueue.length > 0) {
                this.entity.show(this.messageQueue[0]);
                this.currentMessageIndex = 1;
            }
        }
        return;
    }
    
    // Análisis normal del perfil
    this.messageQueue = this.generateMessageQueue("perfil");
    this.currentMessageIndex = 0;
    if (this.messageQueue.length > 0) {
        this.entity.show(this.messageQueue[0]);
        this.currentMessageIndex = 1;
    }
};

CoachController.prototype.onMenuPrincipal = function () {
    this.messageQueue = this.generateMessageQueue("inicio");
    this.currentMessageIndex = 0;
    if (this.messageQueue.length > 0) {
        this.entity.show(this.messageQueue[0]);
        this.currentMessageIndex = 1;
    }
};

CoachController.prototype.onPantallaJuegos = function (juegoEspecifico = null) {
    this.messageQueue = this.generateMessageQueue("juegos", juegoEspecifico);
    this.currentMessageIndex = 0;
    if (this.messageQueue.length > 0) {
        this.entity.show(this.messageQueue[0]);
        this.currentMessageIndex = 1;
    }
};

CoachController.prototype.onPantallaTests = function (testEspecifico = null) {
    this.messageQueue = this.generateMessageQueue("tests", testEspecifico);
    this.currentMessageIndex = 0;
    if (this.messageQueue.length > 0) {
        this.entity.show(this.messageQueue[0]);
        this.currentMessageIndex = 1;
    }
};

CoachController.prototype.onPantallaAbout = function () {
    this.messageQueue = this.generateMessageQueue("about");
    this.currentMessageIndex = 0;
    if (this.messageQueue.length > 0) {
        this.entity.show(this.messageQueue[0]);
        this.currentMessageIndex = 1;
    }
};

CoachController.prototype.onResultados = function (skill, diferencia, nuevaMedalla = false) {
    const datos = { skill, diferencia, nuevaMedalla, objetivo: 75 };
    const msg = getCoachMessage(this.perfil, "resultados", null, datos);
    if (msg) this.entity.show(msg);
};

CoachController.prototype.mostrarExplicacionJuego = function (juegoId) {
    if (!isCoachDisabled()) {
        const msg = getCoachMessage(this.perfil, "juegos", juegoId);
        if (msg) this.entity.show(msg);
    }
};

CoachController.prototype.mostrarExplicacionTest = function (testId) {
    if (!isCoachDisabled()) {
        const msg = getCoachMessage(this.perfil, "tests", testId);
        if (msg) this.entity.show(msg);
    }
};

window.CoachController = CoachController;