const testsDisponibles = typeof window.getCatalogoTests === "function"
    ? window.getCatalogoTests()
    : [];

function randomSeeded(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function testsDelDia(cantidad = 3) {
    console.log("Tests disponibles:", testsDisponibles);
    console.log("Generando tests del día...");

    const hoy = new Date();
    const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    const indices = [...testsDisponibles.keys()];

    console.log(`Seed para hoy: ${seed}`);
    console.log(`Tests disponibles: ${testsDisponibles.length}`);

    for (let i = indices.length - 1; i > 0; i -= 1) {
        const r = Math.floor(randomSeeded(seed + i) * (i + 1));
        [indices[i], indices[r]] = [indices[r], indices[i]];
        console.log(`Test seleccionado: ${testsDisponibles[indices[i]].nombre}`);
    }

    return indices.slice(0, cantidad).map((index) => testsDisponibles[index]);
}

function generarTarjeta(test) {
    const { nombre, categoria, heroEyebrow, url, completado } = test;

    // Colores por categoría
    const coloresCategoria = {
        memoria:  { fondo: "bg-green-500",  texto: "text-green-500" },
        atencion: { fondo: "bg-indigo-500", texto: "text-indigo-500" },
        control:  { fondo: "bg-amber-500",  texto: "text-amber-500" },
        reflejos: { fondo: "bg-red-500",    texto: "text-red-500" }
    };

    const { fondo, texto } = coloresCategoria[categoria] || coloresCategoria.reflejos;

    // Estado completado
    const tarjetaFondo = completado ? "bg-gray-200" : "bg-slate-50";
    const textoCompletado = completado ? "text-slate-400" : "text-slate-900";

    // Si está completado → NO es clicable
    const tag = completado ? "div" : "a";
    const href = completado ? "" : `href="${url}"`;

    return `
        <${tag} ${href}
            class="w-full my-4 p-3 ${tarjetaFondo} rounded-lg border border-slate-100 dark:border-slate-600 flex justify-between items-center cursor-${completado ? "default" : "pointer"}">

            <div>
                <div class="${textoCompletado} dark:text-white text-base font-bold">${nombre}</div>
                <div class="${texto} text-xs font-bold">Enfoque: ${categoria}</div>
            </div>

            <div class="w-5 h-5 ${fondo} rounded"></div>
        </${tag}>
    `;
}


function renderTests(cantidad = 3) {
    const contenedor = document.getElementById("tests-grid");
    if (!contenedor) return;

    const seleccion = testsDelDia(cantidad);
    contenedor.innerHTML = seleccion.map(generarTarjeta).join("");
}


window.testsDelDia = testsDelDia;
window.renderTests = renderTests;
