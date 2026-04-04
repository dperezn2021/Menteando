const juegosBase = typeof window.getCatalogoJuegos === "function"
    ? window.getCatalogoJuegos()
    : [];

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

                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">${juego.nombre}</h3>
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
        <div class="w-full flex flex-col md:flex-row items-center gap-8 lg:gap-12">
            <img src="${juego.imagen}" alt="${juego.nombre}" class="h-full max-w-200 relative min-h-[18rem] md:min-h-[24rem] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 block">

            <div class="flex-1 flex flex-col justify-center gap-6">
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-full w-fit">
                    ${"Recomendado hoy"}
                </span>

                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 mb-3">${skillLabel}</p>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                        ${juego.nombre}
                    </h1>
                </div>

                <p class="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-xl">
                    ${juego.descripcion}
                </p>

                <div class="flex gap-4 pt-2 flex-wrap">
                    <a href="${juego.buildUrl}" class="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition">
                        Jugar ahora
                    </a>
                    <a href="${juego.url}" class="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                        Abrir Ficha técnica
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderJuegoRecomendado(cantidad = 1) {
    const contenedor = document.getElementById("juego-recomendado");
    if (!contenedor) return;

    const seleccion = juegosDelDia(cantidad);
    contenedor.innerHTML = seleccion.map(generarJuegoDelDia).join("");
}

window.juegosDelDia = juegosDelDia;
window.renderJuegos = renderJuegos;
window.renderJuegoRecomendado = renderJuegoRecomendado;
