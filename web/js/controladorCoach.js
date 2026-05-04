function CoachController(perfil) {
    if (isCoachDisabled()) return;
    
    this.perfil = perfil;
    this.entity = new CoachEntity(
        document.getElementById("coach"),
        document.getElementById("coach-bubble")
    );
    
    this.timer = null;
    this.setupListeners();
    this.mostrarMensajeActual();
}

CoachController.prototype.setupListeners = function() {
    const self = this;
    const hideAndSchedule = function() {
        self.entity.hide();
        if (self.timer) clearTimeout(self.timer);
        self.timer = setTimeout(function() {
            self.mostrarMensajeActual();
        }, 5000);
    };
    document.addEventListener("click", hideAndSchedule);
    document.addEventListener("keydown", hideAndSchedule);
};

CoachController.prototype.mostrarMensajeActual = function() {
    const path = window.location.pathname;
    let contexto = "inicio";
    if (path.includes("perfil.html")) contexto = "perfil";
    else if (path.includes("games.html")) contexto = "juegos";
    else if (path.includes("tests.html")) contexto = "tests";
    else if (path.includes("about.html")) contexto = "about";
    
    const msg = getCoachMessage(this.perfil, contexto);
    if (msg) this.entity.show(msg);
};

CoachController.prototype.onResultados = function(skill, diferencia, nuevaMedalla) {
    const msg = getCoachMessage(this.perfil, "resultados", null, { skill, diferencia, nuevaMedalla });
    if (msg) this.entity.show(msg);
};

window.CoachController = CoachController;