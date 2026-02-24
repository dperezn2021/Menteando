/* =========================
   PERFIL – LÓGICA DE INTERFAZ (solo perfil.html)
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

    const perfil = getperfil();
    if (!perfil) return;

    // Mostrar datos
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("perfil-nombre", perfil.nombre);
    set("perfil-apodo", perfil.apodo);
    set("perfil-edad", perfil.edad);
    set("perfil-correo", perfil.correo);
    set("perfil-sesiones", perfil.sesiones);
    set("perfil-apodo-header", perfil.apodo);

    const nivel = ((perfil.atencion + perfil.control + perfil.reflejos + perfil.memoria) / 4) * 100;
    set("perfil-nivel", nivel.toFixed(0) + "%");

    // Rellenar formulario
    const fill = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    };

    fill("name", perfil.nombre);
    fill("nickname", perfil.apodo);
    fill("age", perfil.edad);
    fill("email", perfil.correo);

    // Botón editar
    const btn = document.getElementById("btn-editar");
    const form = document.getElementById("perfil-form-section");

    if (btn && form) {
        btn.addEventListener("click", () => {
            form.style.display = form.style.display === "none" ? "block" : "none";
        });
    }

    // Guardar cambios
    const formEl = document.getElementById("perfil-form");
    if (formEl) {
        formEl.addEventListener("submit", e => {
            e.preventDefault();

            perfil.nombre = document.getElementById("name").value;
            perfil.apodo = document.getElementById("nickname").value;
            perfil.edad = parseInt(document.getElementById("age").value);
            perfil.correo = document.getElementById("email").value;

            saveperfil(perfil);
            location.reload();
        });
    }

    // Animación de barras
    function animateBar(idFill, idText, value) {
        const fill = document.getElementById(idFill);
        const text = document.getElementById(idText);
        if (!fill || !text) return;

        const percent = (value * 100).toFixed(0);
        text.textContent = percent + "%";

        setTimeout(() => {
            fill.style.width = percent + "%";
        }, 200);
    }

    animateBar("stat-attention", "stat-attention-text", perfil.atencion);
    animateBar("stat-memory", "stat-memory-text", perfil.memoria);
    animateBar("stat-control", "stat-control-text", perfil.control);
    animateBar("stat-reflejos", "stat-reflejos-text", perfil.reflejos);

    // Juego más jugado
    const juegos = perfil.juegos || {};
    const masJugado = Object.keys(juegos).length
        ? Object.entries(juegos).sort((a, b) => b[1] - a[1])[0][0]
        : "Aún no has jugado lo suficiente";

    set("perfil-juego-mas-jugado", masJugado);

    // Consejos
    let consejo = "¡Sigue jugando para obtener recomendaciones!";
    if (perfil.atencion < 0.3) consejo = "Tu atención es baja. Prueba Orden Caótico o Detector de Intrusos.";
    else if (perfil.memoria < 0.3) consejo = "Tu memoria necesita refuerzo. Juega Simón Dice o Eco Visual.";
    else if (perfil.control < 0.3) consejo = "Tu control inhibitorio puede mejorar. Prueba Stroop o Silencio Mental.";
    else if (perfil.reflejos < 0.3) consejo = "Tus reflejos están por debajo de la media. Juega Tiempo de Reacción.";

    set("perfil-consejos", consejo);

    // Tests recomendados
    const tests = document.getElementById("perfil-tests");
    if (tests) {
        tests.innerHTML = "";

        if (perfil.atencion < 0.4) tests.innerHTML += "<li>Test de atención sostenida (TOVA)</li>";
        if (perfil.memoria < 0.4) tests.innerHTML += "<li>Test de memoria de trabajo (Digit Span)</li>";
        if (perfil.control < 0.4) tests.innerHTML += "<li>Test de inhibición (Go/No-Go)</li>";
        if (perfil.reflejos < 0.4) tests.innerHTML += "<li>Test de velocidad de reacción simple</li>";

        if (tests.innerHTML === "") tests.innerHTML = "<li>No necesitas tests adicionales por ahora.</li>";
    }
});
