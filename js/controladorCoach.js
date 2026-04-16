function CoachController(perfil) {

    // Si está desactivado → no crear nada
    if (isCoachDisabled()) {
        console.warn("Coach desactivado permanentemente.");
        return;
    }

    this.perfil = perfil;
    this.entity = new CoachEntity(
        document.getElementById("coach"),
        document.getElementById("coach-bubble")
    );

    this.inactivityTimer = null;
    this.setupUserInteractionListeners();
}


CoachController.prototype.setupUserInteractionListeners = function () {
    document.addEventListener("click", this.onUserInteraction.bind(this));
    document.addEventListener("keydown", this.onUserInteraction.bind(this));
    document.addEventListener("keydown", function (e) {
        if (e.key.toLowerCase() === "h") {
            desactivarCoach();

            const coach = document.getElementById("coach");
            if (coach) coach.remove();

            console.warn("Coach desactivado permanentemente por el usuario.");
        }
    });
};

CoachController.prototype.onUserInteraction = function () {
    this.entity.hide();
    clearTimeout(this.inactivityTimer);

    this.inactivityTimer = setTimeout(() => {
        this.showContext("standby");
    }, 5000);
};

CoachController.prototype.showContext = function (contexto, ultimoJuego, tendencia) {
    if (isCoachDisabled()) return;
    const msg = getCoachMessage(this.perfil, contexto, ultimoJuego, tendencia);
    if (msg) this.entity.show(msg);
};

// === EVENTOS ===
CoachController.prototype.onPantallaPerfil = function () {
    this.showContext("perfil");
};

CoachController.prototype.onMenuPrincipal = function () {
    this.showContext("inicio");
};

CoachController.prototype.onSeleccionJuego = function () {
    this.showContext("juegos");
};

CoachController.prototype.onPantallaAbout = function () {
    this.showContext("about");
};

CoachController.prototype.onPantallaTests = function () {
    this.showContext("tests");
};

CoachController.prototype.onResultados = function (ultimoJuego, tendencia) {
    this.showContext("resultados", ultimoJuego, tendencia);
};

CoachController.prototype.onResultados = function () {
    this.showContext("standby");
};



window.CoachController = CoachController;
