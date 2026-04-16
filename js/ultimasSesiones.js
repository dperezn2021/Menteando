function renderTablaSesiones() {
    const perfil = getperfil();
    const sesiones = getUltimasSesiones(perfil, 3);
    const tbody = document.getElementById("tabla-sesiones");

    tbody.innerHTML = ""; // limpiar

    sesiones.forEach(s => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="py-3 px-2 text-slate-900 dark:text-white font-medium capitalize">
                ${s.juego}
            </td>
            <td class="py-3 px-2 text-slate-500">
                ${formatearFecha(s.fecha)}
            </td>
            <td class="py-3 px-2 text-right text-blue-500 font-bold">
                ${s.puntuacion.toLocaleString()}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function mostrarHistorialCompleto() {
    const perfil = getperfil();
    document.getElementById("ver-historial-comprimido").classList.remove("hidden");
    document.getElementById("ver-historial-completo").classList.add("hidden");
    let numJuegos = 0;

    for (const gameId in perfil.juegos) {
        numJuegos += perfil.juegos[gameId].length;
    }

    console.log(perfil.juegos);
    console.log(numJuegos);

    const sesiones = getUltimasSesiones(perfil, numJuegos); // Obtener muchas para mostrar todo
    const tbody = document.getElementById("tabla-sesiones");

    tbody.innerHTML = ""; // limpiar

    sesiones.forEach(s => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="py-3 px-2 text-slate-900 dark:text-white font-medium capitalize">
                ${s.juego}
            </td>
            <td class="py-3 px-2 text-slate-500">
                ${formatearFecha(s.fecha)}
            </td>
            <td class="py-3 px-2 text-right text-blue-500 font-bold">
                ${s.puntuacion.toLocaleString()}
            </td>
        `;

        tbody.appendChild(tr);
    });
    const tablaSection = document.getElementById("ultimas-sesiones");
    if (tablaSection) tablaSection.scrollIntoView({ behavior: "smooth" });

}

function mostrarHistorialComprimido() {
    const perfil = getperfil();
    document.getElementById("ver-historial-comprimido").classList.add("hidden");
    document.getElementById("ver-historial-completo").classList.remove("hidden");

    const sesiones = getUltimasSesiones(perfil, 3);
    const tbody = document.getElementById("tabla-sesiones");

    tbody.innerHTML = ""; // limpiar
    sesiones.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="py-3 px-2 text-slate-900 dark:text-white font-medium capitalize">
                ${s.juego}
            </td>
            <td class="py-3 px-2 text-slate-500">
                ${formatearFecha(s.fecha)}
            </td>
            <td class="py-3 px-2 text-right text-blue-500 font-bold">
                ${s.puntuacion.toLocaleString()}
            </td>
        `;
        tbody.appendChild(tr);

    });
    const resumenSection = document.getElementById("mision-activa");
    if (resumenSection) resumenSection.scrollIntoView({ behavior: "smooth" });

}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}