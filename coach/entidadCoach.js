function CoachEntity(element, bubble) {
    this.element = element;
    this.bubble = bubble;
    this.visible = false;
    this.pointerEvents = "none";
}

CoachEntity.prototype.show = function(msg) {
    this.bubble.innerHTML = msg;
    if (this.element && this.element.style) this.element.style.pointerEvents = "auto"; // permitir clics cuando visible
    this.element.classList.add("visible");
    this.visible = true;
};

CoachEntity.prototype.hide = function() {
    this.element.classList.remove("visible");
    if (this.element && this.element.style) this.element.style.pointerEvents = "none"; // no captura clics cuando está oculto

    this.visible = false;
};


window.CoachEntity = CoachEntity;
