document.addEventListener("DOMContentLoaded", () => {
    const perfil = getperfil();
    if (!perfil) return;

    // Mostrar datos básicos
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("perfil-nombre", perfil.nombre);
    set("perfil-edad", perfil.edad);
    set("perfil-correo", perfil.correo);
    set("perfil-sesiones", perfil.sesiones);
    set("perfil-apodo-header", perfil.apodo);
    set("perfil-juego-mas-jugado", perfil.juegoMasJugado);


    const nivel =
        ((perfil.atencion + perfil.memoria + perfil.control + perfil.reflejos) /
            4) *
        100;
    set("perfil-nivel", nivel.toFixed(0) + "%");

    // Animación de barras principales
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

    // SECCIONES DETALLADAS
    const detalle = perfil.detalle;

    const secciones = {
        Atención: [
            ["Atención sostenida", detalle.atencionSostenida],
            ["Atención selectiva", detalle.atencionSelectiva],
            ["Atención dividida", detalle.atencionDividida],
        ],
        Memoria: [
            ["Memoria de trabajo", detalle.memoriaTrabajo],
            ["Memoria espacial", detalle.memoriaEspacial],
        ],
        "Velocidad y reflejos": [
            ["Velocidad cognitiva", detalle.velocidadCognitiva],
            ["Coordinación visomotora", detalle.coordinacionVisomotora],
        ],
        "Funciones ejecutivas": [
            ["Control inhibitorio", detalle.controlInhibitorio],
            ["Flexibilidad cognitiva", detalle.flexibilidadCognitiva],
            ["Planificación", detalle.planificacion],
        ],
    };

    const contenedor = document.getElementById("perfil-detallado");
    if (contenedor) {
        contenedor.innerHTML = "";

        for (let titulo in secciones) {
            const bloque = document.createElement("section");
            bloque.classList.add("detalle-section");

            let html = `<div class="detalle-title">${titulo}</div>`;

            secciones[titulo].forEach(([nombre, valor]) => {
                const percent = (valor * 100).toFixed(0);

                html += `
    <div class="detalle-card">
        <div class="detalle-icon">⚡</div>
        <div class="detalle-info">
            <div class="detalle-nombre">${nombre}</div>
            <div class="detalle-valor">${percent}%</div>
        </div>
    </div>
`;

            });

            bloque.innerHTML = html;
            contenedor.appendChild(bloque);
        }
    }

    // Consejos personalizados
    let consejo = "¡Sigue jugando para mejorar tu perfil cognitivo!";
    if (perfil.atencion < 0.3)
        consejo = "Tu atención es baja. Prueba juegos de atención sostenida.";
    else if (perfil.memoria < 0.3)
        consejo =
            "Tu memoria necesita refuerzo. Prueba juegos de memoria de trabajo.";
    else if (perfil.control < 0.3)
        consejo =
            "Tu control inhibitorio puede mejorar. Prueba juegos tipo Stroop.";
    else if (perfil.reflejos < 0.3)
        consejo =
            "Tus reflejos están por debajo de la media. Prueba juegos de reacción.";

    set("perfil-consejos", consejo);

    // Tests recomendados
    const tests = document.getElementById("perfil-tests");
    if (tests) {
        tests.innerHTML = "";

        if (perfil.atencion < 0.4)
            tests.innerHTML += "<li>Test de atención sostenida (TOVA)</li>";
        if (perfil.memoria < 0.4)
            tests.innerHTML += "<li>Test de memoria de trabajo (Digit Span)</li>";
        if (perfil.control < 0.4)
            tests.innerHTML += "<li>Test de inhibición (Go/No-Go)</li>";
        if (perfil.reflejos < 0.4)
            tests.innerHTML += "<li>Test de velocidad de reacción simple</li>";

        if (tests.innerHTML === "")
            tests.innerHTML = "<li>No necesitas tests adicionales por ahora.</li>";
    }
});

// === MODAL ===
const modal = document.getElementById("modal-editar");
const btnEditar = document.getElementById("btn-editar");
const btnCerrar = document.getElementById("btn-cerrar-modal");
const formModal = document.getElementById("perfil-form");

// Abrir modal
btnEditar.addEventListener("click", () => {
    const perfil = getperfil();

    document.getElementById("name").value = perfil.nombre;
    document.getElementById("nickname").value = perfil.apodo;
    document.getElementById("age").value = perfil.edad;
    document.getElementById("email").value = perfil.correo;

    modal.style.display = "flex";
});

// Cerrar modal
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Guardar cambios
formModal.addEventListener("submit", (e) => {
    e.preventDefault();

    const perfil = getperfil();

    perfil.nombre = document.getElementById("name").value;
    perfil.apodo = document.getElementById("nickname").value;
    perfil.edad = parseInt(document.getElementById("age").value);
    perfil.correo = document.getElementById("email").value;

    saveperfil(perfil);

    modal.style.display = "none";
    location.reload();
});

const btnReset = document.getElementById("btn-reset-perfil");

if (btnReset) {
    btnReset.addEventListener("click", () => {
        if (confirm("¿Seguro que quieres reiniciar todo tu progreso cognitivo?")) {
            resetperfil();
            location.reload();
        }
    });
}
