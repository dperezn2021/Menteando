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
}