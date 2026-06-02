function getSkillToneClasses(skillSlug) {
    const accent = window.getSkillDefinition?.(skillSlug)?.accent || "blue";
    const badgeMap = {
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
        green: "bg-green-500/10 text-green-600 dark:text-green-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        red: "bg-red-500/10 text-red-600 dark:text-red-400",
        rose: "bg-rose-200/10 text-rose-500 dark:text-rose-400",
        orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    };
    return badgeMap[accent] || badgeMap.blue;
}

function iniciarCoachDetalle(contexto, datos) {
    if (typeof window.initDetalleCoach === "function") {
        window.initDetalleCoach(contexto, datos);
        return;
    }

    const existing = document.querySelector('script[data-coach-detail-loader="true"]');
    if (existing) {
        existing.addEventListener("load", () => window.initDetalleCoach?.(contexto, datos), { once: true });
        return;
    }

    const script = document.createElement("script");
    script.src = "/js/detalleCoach.js";
    script.dataset.coachDetailLoader = "true";
    script.onload = () => window.initDetalleCoach?.(contexto, datos);
    document.head.appendChild(script);
}

function renderGameDetailPage(gameId) {
    const juego = window.getJuegoById?.(gameId);
    const content = document.getElementById("game-detail-content");

    if (!juego || !content) return;

    document.title = `Menteando | ${juego.nombre}`;

    const logo = document.getElementById("game-logo");
    const title = document.getElementById("game-title");
    const subtitle = document.getElementById("game-subtitle");

    if (logo) {
        logo.src = `../../${juego.logo || juego.imagen}`;
        logo.alt = `Logo ${juego.nombre}`;
    }

    if (title) title.textContent = juego.nombre;
    if (subtitle) subtitle.textContent = juego.heroEyebrow || juego.subtitulo || "Ficha del juego";

    const skillChips = juego.skills.map((skillSlug) => {
        const label = window.getSkillDefinition?.(skillSlug)?.label || skillSlug;
        return `<span class="px-3 py-1 rounded-full text-sm font-bold ${getSkillToneClasses(skillSlug)}">${label}</span>`;
    }).join("");

    const skillColorClasses = juego.skills.map((skillSlug) => {
        const accent = window.getSkillDefinition?.(skillSlug)?.accent || "blue";
        const badgeMap = {
            violet: "bg-violet-500",
            purple: "bg-purple-500",
            fuchsia: "bg-fuchsia-500",
            green: "bg-green-500",
            emerald: "bg-emerald-500",
            red: "bg-red-500",
            rose: "bg-rose-400",
            orange: "bg-orange-500",
            amber: "bg-amber-500",
            yellow: "bg-yellow-500"
        };
        return badgeMap[accent];
    });

    const howToPlay = (juego.comoJugar || []).map((step, index) => `
        <li class="flex items-start gap-4">
            <span class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center flex-shrink-0">${index + 1}</span>
            <span class="text-slate-600 dark:text-slate-300 leading-7">${step}</span>
        </li>
    `).join("");

    const skillsDetail = (juego.habilidadesDetalle || []).map((item, index) => `
        <li class="flex items-start gap-4">
            <span class="w-3 h-3 rounded-full ${skillColorClasses[index]} mt-2 flex-shrink-0"></span>
            <div>
                <p class="text-base font-bold text-slate-900 dark:text-white mb-1">${item.nombre}</p>
                <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">${item.descripcion}</p>
            </div>
        </li>
    `).join("");

    let color = juego.disponible === "Disponible" ? 'bg-green-500' : 'bg-red-500';

    content.innerHTML = `
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        
        <!-- ============================================================ -->
        <!-- 1. EYEBROWN + TÍTULO + DESCRIPCIÓN + SOBRE EL JUEGO         -->
        <!-- ============================================================ -->
        <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8 mb-8">
            <span class="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold uppercase tracking-[0.2em] mb-5">
                ${juego.heroEyebrow || "Juego recomendado"}
            </span>
            <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                ${juego.nombre}
            </h2>
            <p class="text-lg leading-8 text-slate-600 dark:text-slate-300 mb-6">
                ${juego.descripcion}
            </p>
            
            <div class="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3 mb-3">
                    <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Sobre el juego</h3>
                </div>
                <p class="text-slate-600 dark:text-slate-300 leading-8">${juego.detalleDescripcion || juego.descripcion}</p>
            </div>
            <div class="flex flex-wrap mt-6 gap-3">
                ${skillChips}
            </div>
        </div>

        <!-- ============================================================ -->
        <!-- 2. CÓMO SE JUEGA + JUEGO (2 columnas en desktop)            -->
        <!-- ============================================================ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            <!-- Cómo se juega -->
            <div class="rounded-3xl border lg:col-span-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                <div class="flex items-center gap-3 mb-5">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Cómo se juega</h3>
                </div>
                <ol class="space-y-4">${howToPlay}</ol>
            </div>

            <!-- Juego (iframe) -->
            <article class="flex flex-col h-full lg:col-span-2 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                <div class="sticky flex-1 aspect-video bg-slate-950">
                    <iframe 
                        id="game-iframe" 
                        src="${juego.buildUrl.split("/").pop()}" 
                        title="Juego ${juego.nombre}" 
                        class="absolute inset-0 w-full h-full border-0" 
                        allow="fullscreen; screen-orientation"
                        allowfullscreen
                        referrerpolicy="no-referrer"
                        loading="eager">
                    </iframe>
                    

                </div>
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                    <span class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <span class="w-2.5 h-2.5 rounded-full ${color} inline-block"></span>
                        ${juego.disponible}
                    </span>
                    <button id="fullscreen-btn" class="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold hover:bg-blue-500 dark:hover:bg-blue-500 dark:hover:text-white transition-colors">
                        Pantalla completa
                    </button>
                </div>
            </article>
        </div>

        <!-- ============================================================ -->
        <!-- 3. HABILIDADES COGNITIVAS                                   -->
        <!-- ============================================================ -->
        <div class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8 mb-8">
            <div class="flex items-center gap-3 mb-5">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Habilidades cognitivas</h3>
            </div>
            <ul class="space-y-5">${skillsDetail}</ul>
        </div>

        <!-- ============================================================ -->
        <!-- 4. PROBLEMAS TÉCNICOS + OPINIÓN (2 columnas en desktop)     -->
        <!-- ============================================================ -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Problemas técnicos -->
            <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                <div class="flex items-center gap-3 mb-3">
                    <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <p class="text-sm font-medium text-amber-600 dark:text-amber-400">Problemas técnicos</p>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Si el juego no carga correctamente, prueba a recargar la página o revisa tu conexión.</p>
                <div class="flex gap-3 mt-4">
                    <button id="reload-game-btn" class="flex-1 rounded-lg bg-slate-900 text-white py-2 text-sm font-bold hover:bg-blue-500 transition">Recargar juego</button>
                    <button id="contactar-btn" class="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Contactar</button>
                </div>
            </div>

            <!-- Opinión -->
            <div class="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                <div class="flex items-center gap-3 mb-3">
                    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                        </path>
                    </svg>
                    <p class="text-sm font-medium text-indigo-400">¿Qué te ha parecido este juego?</p>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Tu opinión nos ayuda a mejorar. Comparte tu experiencia o reporta algún problema.</p>
                <div class="flex gap-3 mt-4">
                    <button id="btn-opinar-juego" class="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-bold transition">Escribir opinión</button>
                    <button id="btn-reportar-juego" class="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Reportar problema</button>
                </div>
            </div>
        </div>
    </section>
`;

    // Botón Recargar juego
    const recargarBtn = Array.from(content.querySelectorAll("button")).find(btn => btn.textContent.includes("Recargar juego"));
    if (recargarBtn) {
        recargarBtn.addEventListener("click", () => {
            location.reload();
        });
    }

    // Botón Contactar
    const contactarBtn = Array.from(content.querySelectorAll("button")).find(btn => btn.textContent.includes("Contactar"));
    if (contactarBtn) {
        contactarBtn.addEventListener("click", () => {
            window.location.href = "../../about.html#contacto";
        });
    }



    // Botón Escribir opinión
    const btnOpinar = document.getElementById("btn-opinar-juego");
    if (btnOpinar) {
        btnOpinar.addEventListener("click", () => {
            // Redirigir a about.html con categoría "juego" pre-seleccionada
            window.location.href = "../../about.html?categoria=juego#seccion-comentarios";
        });
    }

    // Botón Reportar problema
    const btnReportar = document.getElementById("btn-reportar-juego");
    if (btnReportar) {
        btnReportar.addEventListener("click", () => {
            // Redirigir al formulario de contacto
            window.location.href = "../../about.html?tipo=reporte#contacto";
        });
    }

    // Iniciar pantalla completa
    iniciarPantallaCompleta(content, juego);
}


function iniciarPantallaCompleta(content, juego = {}) {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const iframe = document.getElementById("game-iframe");

    if (!fullscreenBtn || !iframe) return;

    // Asegurar que el botón no actúe como submit en ningún contexto
    try { fullscreenBtn.setAttribute('type', 'button'); } catch (e) { }

    let exitBtn = null;
    let originalContainerStyles = {};
    let originalIframeStyles = {};
    let originalBodyOverflow = "";
    let originalHtmlOverflow = "";
    let overlayEl = null;
    let originalParent = null;
    let originalNextSibling = null;
    let usingOverlayFallback = false;
    let orientationLockedByPage = false;
    const requiresLandscapeFullscreen = juego.fullscreenOrientation === "landscape";

    function isMobileLikeViewport() {
        return window.matchMedia("(hover: none) and (pointer: coarse)").matches
            || window.matchMedia("(max-width: 900px)").matches;
    }

    function isPortraitViewport() {
        return window.innerHeight > window.innerWidth;
    }

    function shouldRotateLandscapeFallback() {
        return requiresLandscapeFullscreen && isMobileLikeViewport() && isPortraitViewport();
    }

    async function lockLandscapeOrientation() {
        if (!requiresLandscapeFullscreen || !isMobileLikeViewport()) return;

        try {
            if (screen.orientation?.lock) {
                await screen.orientation.lock("landscape");
                orientationLockedByPage = true;
            }
        } catch (err) {
            orientationLockedByPage = false;
        }
    }

    function unlockLandscapeOrientation() {
        if (!orientationLockedByPage) return;

        try {
            if (screen.orientation?.unlock) {
                screen.orientation.unlock();
            }
        } catch (err) { }

        orientationLockedByPage = false;
    }

    // Función para restaurar todo al estado original
    function restoreOriginalState() {
        const container = iframe.parentElement;

        unlockLandscapeOrientation();

        // Si usamos overlay fallback, NO movimos el contenedor — solo restauramos estilos y quitamos el backdrop
        if (usingOverlayFallback && overlayEl) {
            container.style.position = originalContainerStyles.position || "";
            container.style.top = originalContainerStyles.top || "";
            container.style.left = originalContainerStyles.left || "";
            container.style.width = originalContainerStyles.width || "";
            container.style.height = originalContainerStyles.height || "";
            container.style.zIndex = originalContainerStyles.zIndex || "";
            container.style.borderRadius = originalContainerStyles.borderRadius || "";
            container.style.transform = originalContainerStyles.transform || "";
            container.style.transformOrigin = originalContainerStyles.transformOrigin || "";

            iframe.style.width = originalIframeStyles.width || "";
            iframe.style.height = originalIframeStyles.height || "";

            if (overlayEl.parentElement) overlayEl.parentElement.removeChild(overlayEl);
            overlayEl = null;
            usingOverlayFallback = false;
        } else {
            // Restaurar estilos del contenedor (fullscreen nativo)
            container.style.position = originalContainerStyles.position || "";
            container.style.top = originalContainerStyles.top || "";
            container.style.left = originalContainerStyles.left || "";
            container.style.width = originalContainerStyles.width || "";
            container.style.height = originalContainerStyles.height || "";
            container.style.zIndex = originalContainerStyles.zIndex || "";
            container.style.borderRadius = originalContainerStyles.borderRadius || "";
            container.style.transform = originalContainerStyles.transform || "";
            container.style.transformOrigin = originalContainerStyles.transformOrigin || "";

            // Restaurar estilos del iframe
            iframe.style.width = originalIframeStyles.width || "";
            iframe.style.height = originalIframeStyles.height || "";
        }

        // Restaurar scroll del body
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;

        // Eliminar botón flotante si existe
        if (exitBtn) {
            exitBtn.remove();
            exitBtn = null;
        }

        // limpiar listeners extras
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('orientationchange', onOrientationChange);
        window.removeEventListener('resize', onOrientationChange);
    }

    // Función para guardar estilos originales
    function saveOriginalStyles() {
        const container = iframe.parentElement;
        originalContainerStyles = {
            position: container.style.position,
            top: container.style.top,
            left: container.style.left,
            width: container.style.width,
            height: container.style.height,
            zIndex: container.style.zIndex,
            borderRadius: container.style.borderRadius,
            transform: container.style.transform,
            transformOrigin: container.style.transformOrigin
        };
        originalParent = container.parentElement;
        originalNextSibling = container.nextElementSibling;

        originalIframeStyles = {
            width: iframe.style.width,
            height: iframe.style.height
        };

        originalBodyOverflow = document.body.style.overflow;
        originalHtmlOverflow = document.documentElement.style.overflow;
    }

    // Función para aplicar estilos de pantalla completa
    function applyFullscreenStyles() {
        const container = iframe.parentElement;
        // Asegurarnos que el contenedor ocupa toda la pantalla
        container.style.position = "fixed";
        container.style.zIndex = "9999";
        container.style.borderRadius = "0";

        if (shouldRotateLandscapeFallback()) {
            container.style.top = "50%";
            container.style.left = "50%";
            container.style.width = "100vh";
            container.style.height = "100vw";
            container.style.transform = "translate(-50%, -50%) rotate(90deg)";
            container.style.transformOrigin = "center center";
        } else {
            container.style.top = "0";
            container.style.left = "0";
            container.style.width = "100vw";
            container.style.height = "100vh";
            container.style.transform = "";
            container.style.transformOrigin = "";
        }

        iframe.style.width = "100%";
        iframe.style.height = "100%";

        // Ocultar scroll
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
    }

    // Función para crear botón flotante de salir
    function createExitButton() {
        if (exitBtn) return;

        exitBtn = document.createElement("button");
        // evitar comportamiento por defecto
        try { exitBtn.setAttribute('type', 'button'); } catch (e) { }
        exitBtn.id = "exit-fullscreen-btn";
        exitBtn.textContent = "✕ Salir";
        exitBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background-color: rgba(0,0,0,0.8);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 40px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            backdrop-filter: blur(10px);
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
            z-index: 10001;
        `;

        exitBtn.onmouseenter = () => {
            exitBtn.style.backgroundColor = "rgba(255,0,0,0.8)";
            exitBtn.style.transform = "scale(1.05)";
        };

        exitBtn.onmouseleave = () => {
            exitBtn.style.backgroundColor = "rgba(0,0,0,0.8)";
            exitBtn.style.transform = "scale(1)";
        };

        exitBtn.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else if (usingOverlayFallback) {
                // salir del overlay fallback
                restoreOriginalState();
            }
        });

        document.body.appendChild(exitBtn);
    }

    // Evento para cuando se activa el fullscreen nativo del navegador
    function onFullscreenChange() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            usingOverlayFallback = false;
            applyFullscreenStyles();
            createExitButton();
        } else {
            // Salida del fullscreen nativo
            restoreOriginalState();
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
        }
    }

    // Botón principal para entrar en pantalla completa
    fullscreenBtn.addEventListener("click", async (ev) => {
        // evitar que un submit u otro handler recargue la página
        if (ev && typeof ev.preventDefault === 'function') {
            ev.preventDefault();
            if (typeof ev.stopPropagation === 'function') ev.stopPropagation();
        }
        try {
            const container = iframe.parentElement;
            saveOriginalStyles();

            // Intentar fullscreen nativo
            let enteredNativeFullscreen = false;
            try {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                    enteredNativeFullscreen = true;
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                    enteredNativeFullscreen = true;
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                    enteredNativeFullscreen = true;
                }
            } catch (err) {
                // fallo en requestFullscreen (posible en iframes o móviles)
                enteredNativeFullscreen = false;
            }

            document.addEventListener("fullscreenchange", onFullscreenChange);
            document.addEventListener("webkitfullscreenchange", onFullscreenChange);

            if (enteredNativeFullscreen && (document.fullscreenElement || document.webkitFullscreenElement)) {
                usingOverlayFallback = false;
                await lockLandscapeOrientation();
                applyFullscreenStyles();
                createExitButton();
            } else {
                // Fallback: overlay/backdrop sin mover el contenedor para evitar recarga del iframe
                usingOverlayFallback = true;
                overlayEl = document.createElement('div');
                overlayEl.className = 'unity-fullscreen-overlay';
                overlayEl.style.cssText = 'position:fixed;inset:0;background:#000;z-index:9998;';

                // Append backdrop (no mover el contenedor)
                try {
                    document.body.appendChild(overlayEl);

                    // aplicar estilos para ocupar pantalla al contenedor SIN moverlo
                    applyFullscreenStyles();

                    createExitButton();
                } catch (err) {
                    console.error('Error al crear overlay backdrop:', err);
                }
            }

            // listeners para teclado y rotación
            document.addEventListener('keydown', onKeyDown);
            window.addEventListener('orientationchange', onOrientationChange);
            window.addEventListener('resize', onOrientationChange);

        } catch (error) {
            console.error("Error al entrar en pantalla completa:", error);
        }
    });

    // Manejar tecla Escape para salir tanto de fullscreen nativo como de nuestro overlay
    function onKeyDown(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } else if (usingOverlayFallback) {
                restoreOriginalState();
            }
        }
    }

    // Ajustes al rotar o redimensionar: reaplicar estilos para cubrir toda la pantalla
    function onOrientationChange() {
        // pequeño timeout para permitir que el navegador finalice la rotación
        setTimeout(() => {
            if (document.fullscreenElement || usingOverlayFallback) {
                applyFullscreenStyles();
            }
        }, 200);
    }
}


window.initGameDetailPage = function initGameDetailPage(gameId) {
    const perfil = typeof window.getperfil === "function" ? window.getperfil() : null;
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const root = document.documentElement;
    const headerAvatar = document.getElementById("perfil-avatar-header");
    const headerApodo = document.getElementById("perfil-apodo-header");

    if (perfil?.avatar && headerAvatar) headerAvatar.src = perfil.avatar.replace("../", "../../../");
    if (perfil?.apodo && headerApodo) headerApodo.textContent = perfil.apodo;

    const syncThemeButton = () => {
        const isDark = root.classList.contains("dark");
        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
        }
    };

    themeToggleBtn?.addEventListener("click", () => {
        const willUseDark = !root.classList.contains("dark");
        root.classList.toggle("dark", willUseDark);
        root.classList.toggle("light", !willUseDark);
        localStorage.setItem("theme", willUseDark ? "dark" : "light");
        syncThemeButton();
    });

    syncThemeButton();
    renderGameDetailPage(gameId);
    iniciarCoachDetalle("juegoDetalle", { gameId });
};
