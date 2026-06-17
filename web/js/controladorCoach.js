function CoachController(perfil, options = {}) {
    if (isCoachDisabled()) return;
    
    this.perfil = perfil;
    this.contextoFijo = options.contexto || null;
    this.datosContexto = options.datos || {};
    this.entity = null;
    this.timer = null;
    this.init();
}

CoachController.prototype.init = function() {
    const self = this;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            self.setupCoach();
        });
    } else {
        this.setupCoach();
    }
};

CoachController.prototype.setupCoach = function() {
    const coachElement = document.getElementById("coach");
    const bubbleElement = document.getElementById("coach-bubble");
    if (!coachElement || !bubbleElement) return;
    
    this.entity = new CoachEntity(coachElement, bubbleElement);
    this.setupListeners();
    this.ajustarPosicion();
    this.mostrarMensajeActual();
    
    window.addEventListener('resize', () => this.ajustarPosicion());
    window.addEventListener('orientationchange', () => setTimeout(() => this.ajustarPosicion(), 100));
};

CoachController.prototype.ajustarPosicion = function() {
    // El CSS se encarga de todo, no hacemos nada aquí
    return;
};

CoachController.prototype.setupListeners = function() {
    const self = this;
    const hideAndSchedule = function() {
        if (self.entity) self.entity.hide();
        if (self.timer) clearTimeout(self.timer);
        self.timer = setTimeout(function() {
            if (self.entity) self.mostrarMensajeActual();
        }, 15000);
        
    };
    document.addEventListener("click", hideAndSchedule);
    document.addEventListener("keydown", hideAndSchedule);
};

CoachController.prototype.mostrarMensajeActual = function() {
    if (!this.entity) return;
    
    this.ajustarPosicion();
    
    if (typeof getperfil === "function") {
        this.perfil = getperfil();
    }

    const path = window.location.pathname;
    let contexto = this.contextoFijo || "inicio";
    if (!this.contextoFijo) {
        if (path.includes("perfil.html")) contexto = "perfil";
        else if (path.includes("games.html")) contexto = "juegos";
        else if (path.includes("tests.html")) contexto = "tests";
        else if (path.includes("about.html")) contexto = "about";
    }
    
    const msg = getCoachMessage(this.perfil, contexto, null, this.datosContexto);
    if (msg) this.entity.show(msg);
};

CoachController.prototype.setContextoFijo = function(contexto, datos = {}) {
    this.contextoFijo = contexto;
    this.datosContexto = datos;
    this.mostrarMensajeActual();
};

CoachController.prototype.onResultados = function(skill, diferencia, nuevaMedalla) {
    if (!this.entity) return;
    const msg = getCoachMessage(this.perfil, "resultados", null, { skill, diferencia, nuevaMedalla });
    if (msg) this.entity.show(msg);
};

window.CoachController = CoachController;
