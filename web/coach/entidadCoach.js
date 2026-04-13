function CoachEntity(element, bubble) {
    this.element = element;
    this.bubble = bubble;
    this.visible = false;
}

CoachEntity.prototype.show = function(msg) {
    this.bubble.innerText = msg;
    this.element.classList.add("visible");
    this.visible = true;
};

CoachEntity.prototype.hide = function() {
    this.element.classList.remove("visible");
    this.visible = false;
};


window.CoachEntity = CoachEntity;
