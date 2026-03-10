//--------------------------------------------------------------------------------------------------------
//--------------------------- LISTADO DE JUEGOS PARA ALEATORIEDAD SEGUN EL DIA ---------------------------
//--------------------------------------------------------------------------------------------------------
const contenedor = document.getElementById("juegos-dia");

if (contenedor) {
    const listaJuegos = [
        {
            nombre: "Orden Caótico",
            descripcion: "Encuentra números en orden entre distractores.",
            url: "games/orden-caotico/orden-caotico-page.html",
            skills: ["atencion sostenida"], 
        },
        {
            nombre: "Rosco",
            descripcion: "Encuentra letras en orden entre distractores.",
            url: "games/rosco/rosco-page.html",
            skills: [
                "atencion electiva",
                "velocidad ognitiva",
                "control inhibitorio",
                "coordinacion visomotora",
            ],
        },
        {
            nombre: "Detectar Intruso",
            descripcion: "Identifica el elemento incorrecto entre distractores.",
            url: "games/detectar-intruso/detectar-intruso-page.html",
            skills: [
                "atencion selectiva",
                "control inhibitorio",
                "velocidad cognitiva",
                "coordinacion visomotora",
            ],
        },
        {
            nombre: "3 Bolas",
            descripcion: "Sigue varios objetos en movimiento a la vez.",
            url: "games/tres-bolas/tres-bolas-page.html",
            skills: ["atencion dividida"],
        },
        {
            nombre: "Flash TikTok",
            descripcion: "Detecta números que aparecen durante milisegundos.",
            url: "games/flash-tiktok/flash-tiktok-page.html",
            skills: ["velocidad cognitiva", "atencion sostenida"],
        },
        {
            nombre: "Eco Visual",
            descripcion: "Recuerda la posición de varios objetos.",
            url: "games/eco-visual/eco-visual-page.html",
            skills: ["memoria espacial"],
        },
        {
            nombre: "Simón Dice",
            descripcion: "Repite secuencias cada vez más largas.",
            url: "games/simon-dice/simon-dice-page.html",
            skills: ["memoria trabajo", "memoria espacial"],
        },
        {
            nombre: "Asociación Rápida",
            descripcion: "Relaciona símbolos y palabras en poco tiempo.",
            url: "games/asociacion-rapida/asociacion-rapida-page.html",
            skills: ["velocidad cognitiva", "memoria trabajo"],
        },
        {
            nombre: "Secuencia Inversa",
            descripcion: "Repite la secuencia pero al revés.",
            url: "games/secuencia-inversa/secuencia-inversa-page.html",
            skills: ["memoria trabajo"],
        },
        {
            nombre: "Silencio Mental",
            descripcion: "Go/No-Go: pulsa solo cuando corresponde.",
            url: "games/silencio-mental/silencio-mental-page.html",
            skills: ["control inhibitorio"],
        },
        {
            nombre: "Stroop",
            descripcion: "Di el color, no la palabra.",
            url: "games/stroop/stroop-page.html",
            skills: ["control inhibitorio", "flexibilidad cognitiva"],
        },
        {
            nombre: "Doble Regla",
            descripcion: "Cambia de norma según el estímulo.",
            url: "games/doble-regla/doble-regla-page.html",
            skills: ["flexibilidad cognitiva", "control inhibitorio"],
        },
        {
            nombre: "Trayectorias Mentales",
            descripcion: "Planifica el recorrido antes de ejecutarlo.",
            url: "games/trayectorias-mentales/trayectorias-mentales-page.html",
            skills: ["planificacion"],
        },
        {
            nombre: "Tiempo de Reacción",
            descripcion: "Pulsa cuando cambie el color.",
            url: "games/tiempo-reaccion/tiempo-reaccion-page.html",
            skills: ["reflejos"],
        },
        {
            nombre: "Objeto Móvil",
            descripcion: "Haz clic en el objeto que se mueve.",
            url: "games/objeto-movil/objeto-movil-page.html",
            skills: ["reflejos", "flexibilidad cognitiva"],
        },
        {
            nombre: "Tarjetas Wisconsin",
            descripcion: "Cambia la regla de clasificación.",
            url: "games/wisconsin/wisconsin-page.html",
            skills: ["flexibilidad cognitiva"],
        },
        {
            nombre: "Memory Cronometrado",
            descripcion: "Encuentra parejas antes de que acabe el tiempo.",
            url: "games/memory-cronometrado/memory-cronometrado-page.html",
            skills: ["memoria espacial", "velocidad cognitiva"],
        },
        {
            nombre: "Contador Mental",
            descripcion: "Resuelve operaciones rápidas mentalmente.",
            url: "games/contador-mental/contador-mental-page.html",
            skills: ["memoria trabajo", "velocidad cognitiva"],
        },
        {
            nombre: "Anticipación de Patrón",
            descripcion: "Predice el siguiente elemento.",
            url: "games/anticipacion-patron/anticipacion-patron-page.html",
            skills: ["planificacion"],
        },
        {
            nombre: "Multitarea",
            descripcion: "Gestiona dos tareas a la vez.",
            url: "games/multitarea/multitarea-page.html",
            skills: ["atencion dividida", "control inhibitorio"],
        },
        {
            nombre: "Mates Express",
            descripcion: "Arrastra el símbolo correcto para completar la operación.",
            url: "games/mates-express/mates-express-page.html",
            skills: [
                "atencion sostenida",
                "velocidad cognitiva",
                "memoria trabajo",
                "control inhibitorio",
                "coordinacion visomotora",
            ],
        },
    ];

    function randomSeeded(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    function juegosDelDia(cantidad) {
        const hoy = new Date();
        const seed =
            hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();

        let indices = [...listaJuegos.keys()];

        for (let i = indices.length - 1; i > 0; i--) {
            const r = Math.floor(randomSeeded(seed + i) * (i + 1));
            [indices[i], indices[r]] = [indices[r], indices[i]];
        }

        return indices.slice(0, cantidad).map((i) => listaJuegos[i]);
    }

    const destacados = juegosDelDia(2);

    destacados.forEach((j) => {
        contenedor.innerHTML += `
            <button class="game-card" onclick="window.location.href='${j.url}'">
                <h4>${j.nombre}</h4>
                <p>${j.descripcion}</p>
                <p>Habilidades evaluadas: ${j.skills.length}</p>
                <p class="habilidades-evaluadas">Habilidad principal: ${j.skills[0]}</p>
            </button>
        `;
    });
}
