const TEST_CATEGORY_STYLES = {
    atencion: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    memoria: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    control: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    reflejos: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
};

function getTestsCatalog() {
    return typeof window.getCatalogoTests === "function"
        ? window.getCatalogoTests()
        : [];
}

function getTestBadgeClasses(categoria) {
    return TEST_CATEGORY_STYLES[categoria] || TEST_CATEGORY_STYLES.atencion;
}

function createTestCard(test) {
    return `
        <article class="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden group">
            <a href="${test.url}" class="block h-52 overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img src="${test.imagen}" alt="${test.nombre}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
            </a>

            <div class="p-6 flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-3">
                    <span class="px-3 py-1 text-sm font-bold uppercase rounded-full ${getTestBadgeClasses(test.categoria)}">
                        ${test.habilidad}
                    </span>
                    <span class="text-sm font-semibold text-slate-500 dark:text-slate-300">${test.duracion}</span>
                </div>

                <div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">${test.nombre}</h3>
                    <p class="text-slate-600 dark:text-slate-300">${test.descripcion}</p>
                </div>

                <p class="text-sm text-slate-500 dark:text-slate-400">${test.resumen}</p>

                <a href="${test.url}" class="mt-auto inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">
                    Ver test
                </a>
            </div>
        </article>
    `;
}

function createFeaturedTest(test) {
    return `
        <div class="w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <a href="${test.url}" class="relative flex-1 min-h-[18rem] md:min-h-[24rem] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 block">
                <img src="${test.imagen}" alt="${test.nombre}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/25 to-transparent"></div>
            </a>

            <div class="flex-1 flex flex-col gap-6">
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-full w-fit">
                    ${test.heroEyebrow || "Test recomendado"}
                </span>

                <div>
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 mb-3">${test.habilidad}</p>
                    <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">${test.nombre}</h1>
                </div>

                <p class="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-xl">${test.resumen}</p>

                <ul class="space-y-3 text-slate-600 dark:text-slate-300">
                    ${test.bloques.slice(0, 3).map((bloque) => `<li class="flex gap-3"><span class="text-blue-500 font-black">-</span><span>${bloque}</span></li>`).join("")}
                </ul>

                <div class="flex gap-4 flex-wrap">
                    <a href="${test.url}" class="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition">
                        Abrir test
                    </a>
                    <a href="#tests-grid" class="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                        Ver bateria
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderFeaturedTest() {
    const contenedor = document.getElementById("test-recomendado");
    if (!contenedor) return;

    const [test] = getTestsCatalog();
    if (!test) return;

    contenedor.innerHTML = createFeaturedTest(test);
}

function renderTestsPage({ search = "", category = "" } = {}) {
    const contenedor = document.getElementById("tests-grid");
    if (!contenedor) return;

    const normalizedSearch = search.trim().toLowerCase();
    const tests = getTestsCatalog().filter((test) => {
        const matchesSearch = !normalizedSearch
            || test.nombre.toLowerCase().includes(normalizedSearch)
            || test.descripcion.toLowerCase().includes(normalizedSearch)
            || test.habilidad.toLowerCase().includes(normalizedSearch);
        const matchesCategory = !category || test.categoria === category;

        return matchesSearch && matchesCategory;
    });

    if (!tests.length) {
        contenedor.innerHTML = `
            <div class="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/40 p-10 text-center">
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">No hemos encontrado tests</h3>
                <p class="text-slate-600 dark:text-slate-300">Prueba con otro nombre o cambia la categoria.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div class="grid grid-cols-2 gap-8">
            ${tests.map(createTestCard).join("")}
        </div>
    `;
}

window.setTestCategory = function setTestCategory(category) {
    const buttons = document.querySelectorAll("[data-test-category]");

    buttons.forEach((button) => {
        const isActive = button.dataset.testCategory === category;
        button.classList.toggle("bg-blue-500", isActive);
        button.classList.toggle("text-white", isActive);
        button.classList.toggle("bg-slate-100", !isActive);
        button.classList.toggle("dark:bg-slate-800", !isActive);
    });

    window.__testCategoryFilter = category;
    window.__syncTestsPage?.();
};

window.initTestsPage = function initTestsPage() {
    const barraBusqueda = document.getElementById("tests-barra-busqueda");

    const sync = () => {
        renderTestsPage({
            search: barraBusqueda?.value || "",
            category: window.__testCategoryFilter || ""
        });
    };

    window.__syncTestsPage = sync;
    window.__testCategoryFilter = window.__testCategoryFilter || "";

    barraBusqueda?.addEventListener("input", sync);

    sync();
};

window.renderFeaturedTest = renderFeaturedTest;

