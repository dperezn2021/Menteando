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
    set("perfil-desde", new Date(perfil.desde).toLocaleDateString("es-ES", { year: "numeric", month: "long" }));
    set("perfil-correo", perfil.correo);
    set("perfil-racha", perfil.racha);
    set("perfil-puntos", perfil.puntos);
    set("perfil-tiempo", perfil.tiempo);
    set("perfil-sesiones", perfil.sesiones);
    set("perfil-apodo-header", perfil.apodo);
    set("perfil-juego-mas-jugado", perfil.juegoMasJugado);

    actualizarNivelCognitivo(perfil.nivel);
    function actualizarNivelCognitivo(valor) {
        const span = document.getElementById("perfil-nivel");
        if (!span) return;

        // Si está vacío, null, undefined o NaN → Nulo
        if (valor === null || valor === undefined || isNaN(valor)) {
            span.textContent = "Nulo";
            span.className = "px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium";
            return;
        }

        let texto = "";
        let clases = "";

        if (valor < 20) {
            texto = "Básico";
            clases = "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200";
        } else if (valor < 40) {
            texto = "Bajo";
            clases = "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200";
        } else if (valor < 60) {
            texto = "Medio";
            clases = "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200";
        } else if (valor < 75) {
            texto = "Alto";
            clases = "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200";
        } else if (valor < 90) {
            texto = "Muy alto";
            clases = "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200";
        } else {
            texto = "Maestría";
            clases = "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200";
        }

        span.textContent = texto;
        span.className = `px-2 py-1 rounded font-medium ${clases}`;
    }

    // Animación de barras principales
    function animateBar(idFill, idText, value) {
        const fill = document.getElementById(idFill);
        const text = document.getElementById(idText);
        if (!fill || !text) return;

        const percent = (value * 100).toFixed(2);
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
                    <div class="detalle-info mt-6">
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

    // === Pintar etiquetas de días ===
    set("hoy", formatDay(0));
    set("hace-1-dia", formatDay(1));
    set("hace-2-dias", formatDay(2));
    set("hace-3-dias", formatDay(3));
    set("hace-4-dias", formatDay(4));
    set("hace-5-dias", formatDay(5));
    set("hace-6-dias", formatDay(6));

    set("maxima-racha", calcularRachaMaxima(perfil.sesionesDiarias));
    set("media-racha", calcularRachaMedia(perfil.sesionesDiarias));
    set("minima-racha", calcularRachaMinima(perfil.sesionesDiarias));

    // === Pintar gráfica ===
    const diasJugados = getDiasJugadosSemana(perfil);
    renderGraficoSemanal(diasJugados);

    // Devuelve fecha restando X días
    function formatDay(resta) {
        return new Date(Date.now() - resta * 86400000)
            .toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
    }

    // Pinta barras
    function renderGraficoSemanal(datos) {
        const contenedor = document.getElementById("grafico-semanal");
        if (!contenedor) return;

        const max = Math.max(...datos, 1);

        contenedor.innerHTML = datos.map(valor => {
            const altura = (valor / max) * 100;

            return `
            <div class="flex-1 bg-blue-500/40 dark:bg-blue-900/60 rounded-t 
                        hover:bg-blue-500 transition-all duration-300"
                 style="height: ${altura}%;">
            </div>
        `;
        }).join("");
    }

    function calcularRachaMaxima(sesionesDiarias) {
        return Math.max(...sesionesDiarias);
    }

    function calcularRachaMedia(sesionesDiarias) {
        const max = Math.max(...sesionesDiarias);
        const min = Math.min(...sesionesDiarias);
        const sum = max + min;
        let media = (sum / 2);

        if (media === max || media === min) {
            return "";
        } else {
            return media;
        }

    }

    function calcularRachaMinima(sesionesDiarias) {
        return Math.min(...sesionesDiarias);
    }

    // === MODAL DEL PERFIL ===
    const modal = document.getElementById("modal-editar");
    const btnEditar = document.getElementById("btn-editar");
    const btnCerrar = document.getElementById("btn-cerrar-modal");
    const formModal = document.getElementById("perfil-form");

    const btnActivarCoach = document.getElementById("btn-activar-coach");

    btnActivarCoach.style.display = isCoachDisabled() ? "block" : "none";

    btnActivarCoach.addEventListener("click", () => {
        localStorage.removeItem("coach_disabled");
        location.reload();
        btnActivarCoach.style.display = "none";
        tituloCoach.style.display = "none";
        activarCoach();
    });

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
            if (
                confirm("¿Seguro que quieres reiniciar todo tu progreso cognitivo?")
            ) {
                resetperfil();
                location.reload();
            }
        });
    }


    // === MODAL DEL AVATAR ===
    const modalAvatar = document.getElementById("modal-avatar");
    const btnCambiarAvatar = document.getElementById("btn-cambiar-avatar");
    const btnCerrarModal = document.getElementById("cerrar-modal-avatar");

    btnCambiarAvatar.addEventListener("click", () => {
        modalAvatar.classList.remove("hidden");
    });

    btnCerrarModal.addEventListener("click", () => {
        modalAvatar.classList.add("hidden");
    });

    // Cerrar si clicas fuera del modal
    modalAvatar.addEventListener("click", (e) => {
        if (e.target === modalAvatar) {
            modalAvatar.classList.add("hidden");
        }
    });


});
