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

    // MOSTRAR RACHA VISIBLE (sin modificar el perfil)
    const rachaVisible = obtenerRachaVisible();
    set("perfil-racha-total", rachaVisible);

    // Opcional: mostrar tooltip si la racha se perdió
    if (rachaVisible === 0 && perfil.racha > 0) {
        const rachaElement = document.getElementById("perfil-racha-total");
        if (rachaElement) {
            rachaElement.title = "Racha perdida por inactividad. ¡Juega hoy para recuperarla!";
            rachaElement.classList.add("text-red-500");
        }
    }

    // Puntos formateados
    const puntosFormateados = formatearPuntos(perfil.puntos);
    set("perfil-puntos", puntosFormateados);

    // Tiempo (compatibilidad)
    set("perfil-tiempo", getTiempo(perfil));

    set("perfil-sesiones", perfil.sesiones);
    set("perfil-apodo-header", perfil.apodo);
    set("perfil-juego-mas-jugado", perfil.juegoMasJugado);

    // Nivel cognitivo
    function actualizarNivelCognitivo(valor) {
        const span = document.getElementById("perfil-nivel");
        if (!span) return;

        if (valor === 0 || valor === null || valor === undefined || isNaN(valor)) {
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

    actualizarNivelCognitivo(perfil.nivel);

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
            { nombre: "Atención sostenida", clave: "atencionSostenida", descripcion: "Capacidad de mantener la atención en una tarea durante un período prolongado." },
            { nombre: "Atención selectiva", clave: "atencionSelectiva", descripcion: "Capacidad de enfocarse en un estímulo relevante ignorando distracciones." },
            { nombre: "Atención dividida", clave: "atencionDividida", descripcion: "Capacidad de atender a múltiples estímulos o tareas simultáneamente." }
        ],
        Memoria: [
            { nombre: "Memoria de trabajo", clave: "memoriaTrabajo", descripcion: "Capacidad de retener y manipular información temporalmente." },
            { nombre: "Memoria espacial", clave: "memoriaEspacial", descripcion: "Capacidad de recordar la ubicación de objetos en el espacio." }
        ],
        Control: [
            { nombre: "Control inhibitorio", clave: "controlInhibitorio", descripcion: "Capacidad de suprimir respuestas automáticas o irrelevantes." },
            { nombre: "Flexibilidad cognitiva", clave: "flexibilidadCognitiva", descripcion: "Capacidad de alternar entre tareas o reglas mentales." },
            { nombre: "Planificación", clave: "planificacion", descripcion: "Capacidad de establecer pasos para alcanzar un objetivo." }
        ],
        Reflejos: [
            { nombre: "Velocidad cognitiva", clave: "velocidadCognitiva", descripcion: "Rapidez para procesar información y tomar decisiones." },
            { nombre: "Coordinación visomotora", clave: "coordinacionVisomotora", descripcion: "Coordinación entre lo que se ve y la respuesta motora." }
        ]
    };

    function getColorPorValor(valor) {
        const percent = valor * 100;
        if (percent < 20) return "bg-red-500";
        if (percent < 40) return "bg-orange-500";
        if (percent < 60) return "bg-yellow-500";
        if (percent < 75) return "bg-blue-500";
        if (percent < 90) return "bg-green-500";
        return "bg-purple-500";
    }

    function getNivelTexto(valor) {
        const percent = valor * 100;
        if (percent < 20) return "Muy bajo";
        if (percent < 40) return "Bajo";
        if (percent < 60) return "Medio";
        if (percent < 75) return "Alto";
        if (percent < 90) return "Muy alto";
        return "Excelente";
    }

    const contenedor = document.getElementById("perfil-detallado");
    if (contenedor) {
        contenedor.innerHTML = "";

        for (let titulo in secciones) {
            const bloque = document.createElement("div");
            bloque.className = "mb-8";

            bloque.innerHTML = `<h4 class="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">${titulo}</h4>`;

            const grid = document.createElement("div");
            grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

            secciones[titulo].forEach(item => {
                const valor = detalle[item.clave] || 0;
                const percent = (valor * 100).toFixed(0);
                const colorBarra = getColorPorValor(valor);
                const nivelTexto = getNivelTexto(valor);

                const tarjeta = document.createElement("div");
                tarjeta.className = "bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 group";
                tarjeta.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <div class="font-semibold text-slate-700 dark:text-slate-200">${item.nombre}</div>
                        <div class="text-sm font-bold ${colorBarra.replace('bg-', 'text-')}">${percent}%</div>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-3">
                        <div class="${colorBarra} h-2.5 rounded-full transition-all duration-500" style="width: ${percent}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span class="capitalize">${nivelTexto}</span>
                        <span class="cursor-help" title="${item.descripcion}">ⓘ</span>
                    </div>
                `;
                grid.appendChild(tarjeta);
            });

            bloque.appendChild(grid);
            contenedor.appendChild(bloque);
        }
    }

    // === PINTAR GRÁFICA SEMANAL ===
    function formatDay(resta) {
        return new Date(Date.now() - resta * 86400000).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
    }

    function renderGraficoSemanal(datos) {
        const contenedorGrafico = document.getElementById("grafico-semanal");
        if (!contenedorGrafico) return;

        const max = Math.max(...datos, 1);

        contenedorGrafico.innerHTML = datos.map(valor => {
            const altura = (valor / max) * 100;
            return `<div class="flex-1 bg-blue-500/40 dark:bg-blue-900/60 rounded-t hover:bg-blue-500 transition-all duration-300" style="height: ${altura}%;"></div>`;
        }).join("");
    }

    function calcularRachaDiariaMaxima(sesionesDiarias) {
        return Math.max(...sesionesDiarias);
    }

    function calcularRachaDiariaMedia(sesionesDiarias) {
        const max = Math.max(...sesionesDiarias);
        const min = Math.min(...sesionesDiarias);
        const media = (max + min) / 2;
        return (media === max || media === min) ? "" : media;
    }

    function calcularRachaDiariaMinima(sesionesDiarias) {
        return Math.min(...sesionesDiarias);
    }

    set("hoy", formatDay(0));
    set("hace-1-dia", formatDay(1));
    set("hace-2-dias", formatDay(2));
    set("hace-3-dias", formatDay(3));
    set("hace-4-dias", formatDay(4));
    set("hace-5-dias", formatDay(5));
    set("hace-6-dias", formatDay(6));

    set("maxima-racha-diaria", calcularRachaDiariaMaxima(perfil.sesionesDiarias));
    set("media-racha-diaria", calcularRachaDiariaMedia(perfil.sesionesDiarias));
    set("minima-racha-diaria", calcularRachaDiariaMinima(perfil.sesionesDiarias));

    const diasJugados = getDiasJugadosSemana(perfil);
    renderGraficoSemanal(diasJugados);

    // === MODAL DEL PERFIL ===
    const modal = document.getElementById("modal-editar");
    const btnEditar = document.getElementById("btn-editar");
    const btnCerrar = document.getElementById("btn-cerrar-modal");
    const btnGuardar = document.getElementById("btn-guardar");
    const formModal = document.getElementById("perfil-form");

    // Botón del coach (versión original)
    const btnActivarCoach = document.getElementById("btn-activar-coach");
    if (btnActivarCoach) {
        btnActivarCoach.style.display = isCoachDisabled() ? "block" : "none";

        btnActivarCoach.addEventListener("click", () => {
            localStorage.removeItem("coach_disabled");
            location.reload();
        });
    }

    // Abrir modal
    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            const perfilActual = getperfil();

            const nameInput = document.getElementById("name");
            const nicknameInput = document.getElementById("nickname");
            const ageInput = document.getElementById("age");
            const emailInput = document.getElementById("email");

            if (nameInput) nameInput.value = perfilActual.nombre;
            if (nicknameInput) nicknameInput.value = perfilActual.apodo;
            if (ageInput) ageInput.value = perfilActual.edad;
            if (emailInput) emailInput.value = perfilActual.correo;

            if (modal) modal.style.display = "flex";
        });
    }

    // Cerrar modal
    if (btnCerrar && modal) {
        btnCerrar.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

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



    // Cerrar modal si se clica fuera
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // === BOTÓN RESET PERFIL ===
    const btnReset = document.getElementById("btn-reset-perfil");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            if (confirm("¿Seguro que quieres reiniciar todo tu progreso cognitivo?")) {
                resetperfil();
            }
        });
    }

    // === MODAL DEL AVATAR ===
    const modalAvatar = document.getElementById("modal-avatar");
    const btnCambiarAvatar = document.getElementById("btn-cambiar-avatar");
    const btnCerrarModalAvatar = document.getElementById("cerrar-modal-avatar");

    if (btnCambiarAvatar && modalAvatar) {
        btnCambiarAvatar.addEventListener("click", () => {
            modalAvatar.classList.remove("hidden");
        });
    }

    if (btnCerrarModalAvatar && modalAvatar) {
        btnCerrarModalAvatar.addEventListener("click", () => {
            modalAvatar.classList.add("hidden");
        });
    }

    if (modalAvatar) {
        modalAvatar.addEventListener("click", (e) => {
            if (e.target === modalAvatar) {
                modalAvatar.classList.add("hidden");
            }
        });
    }
});