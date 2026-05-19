const juegosBase = (typeof window.getCatalogoJuegos === "function"
    ? window.getCatalogoJuegos()
    : []
).filter(j => j.disponible === "Disponible");

function randomSeeded(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function juegosDelDia(cantidad = 3) {
    const hoy = new Date();
    const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    const indices = [...juegosBase.keys()];

    for (let i = indices.length - 1; i > 0; i -= 1) {
        const r = Math.floor(randomSeeded(seed + i) * (i + 1));
        [indices[i], indices[r]] = [indices[r], indices[i]];
    }

    return indices.slice(0, cantidad).map((index) => juegosBase[index]);
}

function getBadgeClasses(skillSlug) {
    const accent = window.getSkillDefinition?.(skillSlug)?.accent || "blue";
    const badgeMap = {
        // 🟣 ATENCIÓN (morados)
        violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
        fuchsia: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",

        // 🟢 MEMORIA (verdes)
        green: "bg-green-500/10 text-green-600 dark:text-green-400",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

        // 🔴 VELOCIDAD / REFLEJOS
        red: "bg-red-500/10 text-red-600 dark:text-red-400",
        rose: "bg-rose-200/10 text-rose-500 dark:text-rose-400",

        // 🟠 CONTROL EJECUTIVO
        orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    };


    return badgeMap[accent] || badgeMap.blue;
}

function generarTarjeta(juego) {
    const skillSlug = juego.skills[0];
    const skillLabel = juego.categoria;

    return `
        <article class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden group">
            <a href="${juego.url}" class="block h-48 overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
            </a>

            <div class="p-6 flex flex-col gap-3">
                <span class="px-3 py-1 text-sm font-bold uppercase rounded-full w-fit ${getBadgeClasses(skillSlug)}">
                    ${skillLabel}
                </span>

                 <div class="flex flex-row gap-2 grow">
                    ${juego.logo ? `<img src="${juego.logo}" alt="${juego.nombre}" class="w-10 h-10 object-cover">` : ""}
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${juego.nombre}</h3>
                   </div>
                <p class="text-slate-600 dark:text-slate-300 text-base">${juego.descripcion}</p>

                <a href="${juego.url}" class="mt-auto w-full py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-center hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors">
                    Entrenar
                </a>
            </div>
        </article>
    `;
}

function renderJuegos(cantidad = 3) {
    const contenedor = document.getElementById("juegos-grid");
    if (!contenedor) return;

    const seleccion = juegosDelDia(cantidad);
    contenedor.innerHTML = seleccion.map(generarTarjeta).join("");
}

function generarJuegoDelDia(juego) {
    const skillLabel = window.getSkillDefinition?.(juego.skills[0])?.label || juego.badge;

    return `
        <div class="w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 sm:p-10 lg:p-14 shadow-lg">

            <!-- Contenido -->
            <div class="w-full lg:flex-1 flex flex-col gap-4">

                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                        Recomendado para ti
                    </span>
                </div>

                <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                    ${juego.nombre}
                </h2>

                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    ${juego.descripcion}
                </p>

                <div class="flex flex-wrap gap-2">
                    ${juego.skills.slice(0, 3).map(s => {
                    const def = window.getSkillDefinition?.(s);
                    const color = def?.accent || "slate";
                    const label = def?.label || s;
                    return `<span class="px-2 py-1 rounded-full text-xs bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300">${label}</span>`;
                    }).join("")}
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href="${juego.url}" class="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all">
                        Jugar ahora
                    </a>
                    <a href="about.html#seccion-comentarios" class="flex items-center justify-center px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        Opina sobre el juego
                    </a>
                </div>

            </div>

            
            <!-- Imagen -->
            <a href="${juego.url}" class="relative w-full lg:flex-1 min-h-[200px] lg:min-h-[240px] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
            </a>

        </div>
    `;
}


function juegoRecomendadoPersonalizado() {
    const perfil = window.getperfil?.();
    if (perfil) {
        const categorias = {
            atencion: perfil.atencion || 0,
            memoria: perfil.memoria || 0,
            control: perfil.control || 0,
            reflejos: perfil.reflejos || 0
        };
        const totalScore = Object.values(categorias).reduce((a, b) => a + b, 0);
        if (totalScore > 0) {
            const categoriaFloja = Object.entries(categorias).sort((a, b) => a[1] - b[1])[0][0];
            const juegosFiltrados = juegosBase.filter(j => j.categoria === categoriaFloja);
            if (juegosFiltrados.length > 0) {
                const hoy = new Date();
                const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
                const idx = Math.floor(randomSeeded(seed) * juegosFiltrados.length);
                return juegosFiltrados[idx];
            }
        }
    }
    return juegosDelDia(1)[0];
}

function renderJuegoRecomendado() {
    const contenedor = document.getElementById("juego-recomendado");
    if (!contenedor) return;

    const juego = juegoRecomendadoPersonalizado();
    contenedor.innerHTML = generarJuegoDelDia(juego);
}

window.juegosDelDia = juegosDelDia;
window.renderJuegos = renderJuegos;
window.renderJuegoRecomendado = renderJuegoRecomendado;
