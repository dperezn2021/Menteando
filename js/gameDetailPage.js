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

    // Iniciar pantalla completa
    iniciarPantallaCompleta(content);
}


function iniciarPantallaCompleta(content) {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const iframe = document.getElementById("game-iframe");
    
    if (!fullscreenBtn || !iframe) return;
    
    let exitBtn = null;
    let originalContainerStyles = {};
    let originalIframeStyles = {};
    let originalBodyOverflow = "";
    let originalHtmlOverflow = "";
    
    // Función para restaurar todo al estado original
    function restoreOriginalState() {
        const container = iframe.parentElement;
        
        // Restaurar estilos del contenedor
        container.style.position = originalContainerStyles.position || "";
        container.style.top = originalContainerStyles.top || "";
        container.style.left = originalContainerStyles.left || "";
        container.style.width = originalContainerStyles.width || "";
        container.style.height = originalContainerStyles.height || "";
        container.style.zIndex = originalContainerStyles.zIndex || "";
        container.style.borderRadius = originalContainerStyles.borderRadius || "";
        
        // Restaurar estilos del iframe
        iframe.style.width = originalIframeStyles.width || "";
        iframe.style.height = originalIframeStyles.height || "";
        
        // Restaurar scroll del body
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        
        // Eliminar botón flotante si existe
        if (exitBtn) {
            exitBtn.remove();
            exitBtn = null;
        }
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
            borderRadius: container.style.borderRadius
        };
        
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
        
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.zIndex = "9999";
        container.style.borderRadius = "0";
        
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
        
        exitBtn.onclick = () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        };
        
        document.body.appendChild(exitBtn);
    }
    
    // Evento para cuando se activa el fullscreen nativo del navegador
    function onFullscreenChange() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            applyFullscreenStyles();
            createExitButton();
        } else {
            restoreOriginalState();
            document.removeEventListener("fullscreenchange", onFullscreenChange);
        }
    }
    
    // Botón principal para entrar en pantalla completa
    fullscreenBtn.addEventListener("click", async () => {
        try {
            const container = iframe.parentElement;
            
            saveOriginalStyles();
            
            if (container.requestFullscreen) {
                await container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                await container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                await container.msRequestFullscreen();
            }
            
            document.addEventListener("fullscreenchange", onFullscreenChange);
            
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                applyFullscreenStyles();
                createExitButton();
            }
            
        } catch (error) {
            console.error("Error al entrar en pantalla completa:", error);
        }
    });
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