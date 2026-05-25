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
    sincronizarSesionesDiarias(perfil);
    saveperfil(perfil);

    const diasJugados = [...perfil.sesionesDiarias];
    const ultimos7 = diasJugados; // array EXACTO de lo que se pinta



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

    // Función para mostrar la racha con colores (similar a nivel cognitivo)
    function mostrarRachaConColor(racha) {
        const span = document.getElementById("perfil-racha-color");
        if (!span) return;

        if (racha === 0 || racha === null || racha === undefined) {
            span.textContent = "0 días";
            span.className = "px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-medium";
            return;
        }

        let texto = "";
        let clases = "";

        if (racha < 3) {
            texto = `${racha} ${racha === 1 ? 'día' : 'días'}`;
            clases = "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
        } else if (racha < 7) {
            texto = `${racha} días`;
            clases = "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300";
        } else if (racha < 14) {
            texto = `${racha} días 🔥`;
            clases = "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
        } else if (racha < 21) {
            texto = `${racha} días ⭐`;
            clases = "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
        } else if (racha < 30) {
            texto = `${racha} días 🏆`;
            clases = "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
        } else {
            texto = `${racha} días 👑`;
            clases = "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300";
        }

        span.textContent = texto;
        span.className = `px-3 py-1.5 rounded-lg font-medium ${clases}`;
    }

    // Llamar a la función con la racha actual
    const rachaMaxima = perfil.rachaMaxima || 0;
    mostrarRachaConColor(rachaMaxima);

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





    set("hoy", formatDay(0));
    set("hace-1-dia", formatDay(1));
    set("hace-2-dias", formatDay(2));
    set("hace-3-dias", formatDay(3));
    set("hace-4-dias", formatDay(4));
    set("hace-5-dias", formatDay(5));
    set("hace-6-dias", formatDay(6));


    set("maxima-racha-diaria", calcularRachaDiariaMaxima(ultimos7));
    set("media-racha-diaria", calcularRachaDiariaMedia(ultimos7));
    set("minima-racha-diaria", calcularRachaDiariaMinima(ultimos7));
    set("perfil-racha-total", perfil.racha);  // usa la racha real guardada

    renderGraficoSemanal(diasJugados);

    // === MODAL DEL PERFIL ===
    const modal = document.getElementById("modal-editar");
    const btnEditar = document.getElementById("btn-editar");
    const btnCerrar = document.getElementById("btn-cerrar-modal");

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

    // Guardar cambios - con verificación de existencia
    // Guardar cambios - con verificación de existencia y flujo asíncrono corregido
    const formModal = document.getElementById("perfil-form");
    if (formModal) {
        formModal.addEventListener("submit", async (e) => { // Añadido async aquí
            e.preventDefault();

            const perfil = getperfil();

            const nameInput = document.getElementById("name");
            const nicknameInput = document.getElementById("nickname");
            const ageInput = document.getElementById("age");
            const emailInput = document.getElementById("email");

            if (nameInput) {
                const newName = nameInput.value.trim();

                // Si intenta convertirse en 'admin' y no lo era antes, requiere contraseña
                if (newName === 'admin' && perfil.nombre !== 'admin') {

                    const askAdminPassword = () => {
                        return new Promise((resolve) => {
                            const existing = document.getElementById('perfil-admin-prompt');
                            if (existing) existing.remove();

                            const modal = document.createElement('div');
                            modal.id = 'perfil-admin-prompt';
                            modal.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);z-index:10000;';
                            modal.innerHTML = `
                            <div style="background:white;padding:20px;border-radius:12px;max-width:420px;width:90%;box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
                                <h3 style="margin:0 0 8px;font-size:16px;color:#0f172a;">Contraseña de administrador</h3>
                                <p style="margin:0 0 12px;color:#334155;font-size:13px;">Introduce la contraseña para confirmar el uso del nombre <strong>admin</strong>.</p>
                                <input id="perfil-admin-input" type="password" placeholder="Contraseña" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:12px;" />
                                <div style="display:flex;justify-content:flex-end;gap:8px;">
                                    <button id="perfil-admin-cancel" style="padding:8px 12px;border-radius:8px;background:#e5e7eb;border:none;cursor:pointer;">Cancelar</button>
                                    <button id="perfil-admin-ok" style="padding:8px 12px;border-radius:8px;background:#3b82f6;color:white;border:none;cursor:pointer;">Aceptar</button>
                                </div>
                            </div>
                        `;
                            document.body.appendChild(modal);

                            const input = document.getElementById('perfil-admin-input');
                            setTimeout(() => input.focus(), 50);

                            document.getElementById('perfil-admin-cancel').onclick = () => { modal.remove(); resolve(null); };
                            document.getElementById('perfil-admin-ok').onclick = () => { const v = input.value.trim(); modal.remove(); resolve(v || null); };
                            modal.onclick = (e) => { if (e.target === modal) { modal.remove(); resolve(null); } };
                        });
                    };

                    // Esperamos activamente la respuesta del modal antes de seguir con el submit
                    const pass = await askAdminPassword();

                    if (!pass) {
                        mostrarModal('Contraseña requerida para usar el nombre admin', 'error');
                        return;
                    }

                    const knownFallback = 'https://menteando-comentarios.d-perezn-2021.workers.dev/';
                    const base = (typeof API_URL !== 'undefined' && API_URL) || (window.API_URL) || knownFallback;
                    const verifyUrl = base.endsWith('/') ? (base + 'verify') : (base + '/verify');

                    try {
                        console.log('Verificando contraseña admin via POST en', verifyUrl);

                        // CORRECCIÓN: Petición POST unificada e idéntica a la de comentarios.js
                        const resp = await fetch(verifyUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ password: pass })
                        });

                        if (resp.status === 401) {
                            mostrarModal('Contraseña incorrecta', 'error');
                            return;
                        }

                        if (!resp.ok) {
                            let info = '';
                            try { const j = await resp.json(); info = j.error || JSON.stringify(j); } catch (_) { info = await resp.text().catch(() => ''); }
                            mostrarModal('Error de verificación: ' + (info || resp.status), 'error');
                            return;
                        }

                        const json = await resp.json();
                        if (json && json.ok) {
                            // Guardar privilegios tanto en SessionStorage como en Window para consistencia global
                            sessionStorage.setItem('ADMIN_BEARER', pass);
                            window.ADMIN_BEARER = pass;
                            perfil.nombre = 'admin';
                        } else {
                            mostrarModal('Contraseña incorrecta', 'error');
                            return;
                        }
                    } catch (e) {
                        console.error('Error al conectar con el endpoint de verificación', e);
                        mostrarModal('No se pudo contactar con el servidor de verificación.', 'error');
                        return;
                    }
                } else {
                    perfil.nombre = newName;
                }
            }

            // Mapeo del resto de inputs del perfil
            if (nicknameInput) perfil.apodo = nicknameInput.value.trim();
            if (ageInput) perfil.edad = parseInt(ageInput.value) || 0;
            if (emailInput) perfil.correo = emailInput.value.trim();

            // Ejecución unificada del guardado final
            saveperfil(perfil);
            const modalEditar = document.getElementById("modal-editar");
            if (modalEditar) modalEditar.style.display = "none";

            mostrarModal('Perfil actualizado correctamente', 'success');

            // Recarga para forzar a comentarios.js a leer el nuevo estado de "admin" con su token Bearer activado
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
    }

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


    if (perfil.nuevaRachaMaxima) {
        const modal = document.getElementById("modal-racha-maxima");
        const numero = document.getElementById("modal-racha-numero");

        if (modal && numero) {
            numero.textContent = `${perfil.rachaMaxima} ${perfil.rachaMaxima === 1 ? 'día' : 'días'}`;

            // FORZAR display flex para centrar
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';

            // Opcional: quitar hidden si existe
            modal.classList.remove("hidden");
        }
    }
    // Botón cerrar modal - AQUÍ se resetea la bandera
    const btnCerrarRacha = document.getElementById("cerrar-modal-racha");
    if (btnCerrarRacha) {
        const nuevoBoton = btnCerrarRacha.cloneNode(true);
        btnCerrarRacha.parentNode.replaceChild(nuevoBoton, btnCerrarRacha);

        nuevoBoton.addEventListener("click", () => {
            const perfilActual = getperfil();
            perfilActual.nuevaRachaMaxima = false;
            saveperfil(perfilActual);

            const modal = document.getElementById("modal-racha-maxima");
            if (modal) {
                modal.style.display = 'none';  // ← usar style en lugar de classList
                modal.classList.add("hidden");
            }

            // Actualizar la UI de la racha después de cerrar
            mostrarRachaConColor(perfilActual.rachaMaxima || 0);

            // Actualizar medallas por si acaso
            if (typeof actualizarLogrosYMedallas === 'function') {
                actualizarLogrosYMedallas();
            }
        });
    }

});