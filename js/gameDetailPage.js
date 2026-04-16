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
    if (subtitle) subtitle.textContent = juego.subtitulo || "Ficha del juego";

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
        <section class="max-w-7xl mx-auto py-8 lg:py-10">
            <div class="items-stretch grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-8 ">
                <article class="flex flex-col h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                    <div class="relative flex-1 aspect-video bg-slate-950">
                        <iframe id="game-iframe" src="${juego.buildUrl.split("/").pop()}" title="Juego ${juego.nombre}" class="absolute inset-0 w-full h-full border-0" allowfullscreen></iframe>
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
                <!-- El resto del contenido (aside, etc.) se mantiene igual -->
                <div class="flex flex-col gap-6">
                    <aside class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                        <span class="inline-flex px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold uppercase tracking-[0.2em] mb-5">
                            ${juego.heroEyebrow || "Juego recomendado"}
                        </span>
                        <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                            ${juego.nombre}
                        </h2>
                        <p class="text-lg leading-8 text-slate-600 dark:text-slate-300 mb-6">
                            ${juego.descripcion}
                        </p>
                        <div class="flex flex-wrap gap-3">
                            ${skillChips}
                        </div>
                    </aside>
                    <div class="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                        <p class="text-sm font-medium text-indigo-400">¿Problemas técnicos?</p>
                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Si el juego no carga correctamente, prueba a recargar la página o revisa tu conexión.</p>
                        <button class="mt-4 w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-bold hover:bg-blue-500 transition">Recargar juego</button>
                        <button class="mt-2 w-full rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-2 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Contactar</button>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-[1.35fr_0.85fr] gap-8 mt-8">
                <div class="space-y-8">
                    <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sobre el juego</h3>
                        <p class="text-slate-600 dark:text-slate-300 leading-8">${juego.detalleDescripcion || juego.descripcion}</p>
                    </section>
                    <section class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-5">Como se juega</h3>
                        <ol class="space-y-4">${howToPlay}</ol>
                    </section>
                </div>
                <aside class="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-6 lg:p-8">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-5">Habilidades cognitivas</h3>
                    <ul class="space-y-5">${skillsDetail}</ul>
                </aside>
            </div>
        </section>
    `;
    // Botón Recargar juego (recarga la página completa)
    const recargarBtn = Array.from(content.querySelectorAll("button")).find(btn => btn.textContent.includes("Recargar juego"));
    if (recargarBtn) {
        recargarBtn.addEventListener("click", () => {
            location.reload();
        });
    }

    // Botón Contactar (lleva a about.html)
    const contactarBtn = Array.from(content.querySelectorAll("button")).find(btn => btn.textContent.includes("Contactar"));
    if (contactarBtn) {
        contactarBtn.addEventListener("click", () => {
            window.location.href = "../../about.html#contacto";
        });
    }
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const container = document.querySelector("#game-detail-content .relative");
    const iframe = container?.querySelector("iframe");

    if (fullscreenBtn && container && iframe) {
        fullscreenBtn.addEventListener("click", async () => {
            try {
                // Guardar estilos originales
                const originalBorderRadius = container.style.borderRadius;
                const originalAspectRatio = container.style.aspectRatio;
                const originalOverflow = container.style.overflow;

                // Quitar bordes y aspect-ratio temporalmente
                container.style.borderRadius = "0";
                container.style.aspectRatio = "auto";
                container.style.overflow = "visible";

                // Poner el contenedor en fullscreen
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                }

                // Forzar orientación horizontal en móvil
                if (screen.orientation && screen.orientation.lock) {
                    try {
                        await screen.orientation.lock("landscape");
                    } catch (e) { }
                }

                // === AÑADIR BOTÓN FLOTANTE PARA SALIR (solo en móvil) ===
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile && !document.getElementById("exit-fullscreen-btn")) {
                    const exitBtn = document.createElement("button");
                    exitBtn.id = "exit-fullscreen-btn";
                    exitBtn.textContent = "✕ Salir";
                    exitBtn.style.position = "fixed";
                    exitBtn.style.top = "20px";
                    exitBtn.style.right = "20px";
                    exitBtn.style.zIndex = "10000";
                    exitBtn.style.backgroundColor = "rgba(0,0,0,0.7)";
                    exitBtn.style.color = "white";
                    exitBtn.style.border = "none";
                    exitBtn.style.borderRadius = "30px";
                    exitBtn.style.padding = "10px 20px";
                    exitBtn.style.fontSize = "16px";
                    exitBtn.style.fontWeight = "bold";
                    exitBtn.style.cursor = "pointer";
                    exitBtn.style.backdropFilter = "blur(10px)";
                    exitBtn.style.webkitBackdropFilter = "blur(10px)";

                    exitBtn.addEventListener("click", () => {
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        } else if (document.msExitFullscreen) {
                            document.msExitFullscreen();
                        }
                    });

                    document.body.appendChild(exitBtn);
                }

                // Al salir de fullscreen, restaurar estilos y quitar botón
                const exitHandler = () => {
                    if (!document.fullscreenElement) {
                        container.style.borderRadius = originalBorderRadius || "16px";
                        container.style.aspectRatio = originalAspectRatio || "16 / 9";
                        container.style.overflow = originalOverflow || "hidden";

                        // Quitar botón flotante
                        const exitBtn = document.getElementById("exit-fullscreen-btn");
                        if (exitBtn) exitBtn.remove();

                        document.removeEventListener("fullscreenchange", exitHandler);
                    }
                };
                document.addEventListener("fullscreenchange", exitHandler);

            } catch (e) {
                console.error("Error:", e);
            }
        });
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
};