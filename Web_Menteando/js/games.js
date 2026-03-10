//--------------------------------------------------------------------------------------------------------
//------------------------ FILTRADO DE JUEGOS POR NOMBRE Y HABILIDAD (GAMES.HTML) ------------------------
//--------------------------------------------------------------------------------------------------------
const barraBusqueda = document.getElementById('barra-busqueda');
const habilidadSeleccionada = document.getElementById('habilidad');

const juegos = document.querySelectorAll('.game-card');

function filterGames() {
    const searchValue = barraBusqueda.value.toLowerCase();
    const skillValue = habilidadSeleccionada.value;

    juegos.forEach(juego => {
        const nombre = juego.dataset.name;
        const habilidad1 = juego.dataset.skill1;
        const habilidad2 = juego.dataset.skill2;
        const habilidad3 = juego.dataset.skill3;
        const habilidad4 = juego.dataset.skill4;
        const habilidad5 = juego.dataset.skill5;

        const equivaleNombre = nombre.includes(searchValue);
        const equivaleHabilidad = skillValue === '' || habilidad1 === skillValue || habilidad2 === skillValue || habilidad3 === skillValue || habilidad4 === skillValue || habilidad5 === skillValue;

        juego.style.display = (equivaleNombre && equivaleHabilidad) ? 'block' : 'none';
    });
}

barraBusqueda.addEventListener('input', filterGames);
habilidadSeleccionada.addEventListener('change', filterGames);
