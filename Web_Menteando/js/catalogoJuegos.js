const SKILL_DEFINITIONS = {
    atencion_sostenida: {
        metricKey: "atencionSostenida",
        label: "Atencion sostenida",
        accent: "blue"
    },
    atencion_selectiva: {
        metricKey: "atencionSelectiva",
        label: "Atencion selectiva",
        accent: "sky"
    },
    atencion_dividida: {
        metricKey: "atencionDividida",
        label: "Atencion dividida",
        accent: "cyan"
    },
    velocidad_cognitiva: {
        metricKey: "velocidadCognitiva",
        label: "Velocidad cognitiva",
        accent: "green"
    },
    memoria_trabajo: {
        metricKey: "memoriaTrabajo",
        label: "Memoria de trabajo",
        accent: "indigo"
    },
    memoria_espacial: {
        metricKey: "memoriaEspacial",
        label: "Memoria espacial",
        accent: "blue"
    },
    control_inhibitorio: {
        metricKey: "controlInhibitorio",
        label: "Control inhibitorio",
        accent: "violet"
    },
    flexibilidad_cognitiva: {
        metricKey: "flexibilidadCognitiva",
        label: "Flexibilidad cognitiva",
        accent: "fuchsia"
    },
    planificacion: {
        metricKey: "planificacion",
        label: "Planificacion",
        accent: "amber"
    },
    coordinacion_visomotora: {
        metricKey: "coordinacionVisomotora",
        label: "Coordinacion visomotora",
        accent: "emerald"
    }
};



const CATALOGO_JUEGOS = [
    {
        id: "mates-express",
        aliases: ["math", "mates express"],
        nombre: "Mates Express",
        categoria: "atencion",
        subtitulo: "Ficha del juego",
        descripcion: "Arrastra el simbolo correcto para completar la operacion antes de que acabe el tiempo.",
        detalleDescripcion: "Mates Express esta pensado para obligarte a mantener operaciones y opciones en mente mientras tomas decisiones rapidas. Cuanto mas avanzas, mas exige tu memoria activa y tu control del error.",
        comoJugar: [
            "Lee la operacion que aparece en pantalla.",
            "Calcula mentalmente el resultado sin perder tiempo.",
            "Selecciona la respuesta correcta antes de que termine la ronda.",
            "Gestiona la dificultad creciente manteniendo precision y ritmo."
        ],
        habilidadesDetalle: [
            {
                nombre: "Memoria de trabajo",
                descripcion: "Retienes numeros y operaciones intermedias mientras decides la respuesta."
            },
            {
                nombre: "Velocidad cognitiva",
                descripcion: "Procesas informacion numerica con agilidad bajo presion temporal."
            },
            {
                nombre: "Control inhibitorio",
                descripcion: "Evitas respuestas impulsivas cuando aparecen opciones muy parecidas."
            },
            {
                nombre: "Coordinacion visomotora",
                descripcion: "Transformas el calculo mental en una seleccion precisa y rapida."
            }
        ],
        url: "games/mates-express/mates-express-page.html",
        buildUrl: "games/mates-express/mates-express-build.html",
        imagen: "assets/juegos/mates-express.png",
        logo: "assets/juegos/mates-express.png",
        heroEyebrow: "Entrenamiento destacado",
        destacado: true,
        skills: [
            "atencion_sostenida",
            "velocidad_cognitiva",
            "memoria_trabajo",
            "control_inhibitorio",
            "coordinacion_visomotora"
        ]
    },
    {
        id: "rosco",
        aliases: ["rosco"],
        nombre: "Rosco",
        categoria: "control",
        subtitulo: "Ficha del juego",
        descripcion: "Encuentra letras en orden entre distractores y acelera tu velocidad de procesamiento.",
        detalleDescripcion: "Rosco entrena la deteccion rapida de posiciones y la respuesta visual precisa. El reto no es solo ver la opcion correcta, sino hacerlo con velocidad mantenida y sin dejarte llevar por impulsos.",
        comoJugar: [
            "Observa la disposicion de las esferas o marcadores en pantalla.",
            "Localiza rapidamente la posicion objetivo.",
            "Haz clic con precision antes de que cambie el patron.",
            "Manten el rendimiento cuando aumente la velocidad de las rondas."
        ],
        habilidadesDetalle: [
            {
                nombre: "Atencion selectiva",
                descripcion: "Fijas el foco en la posicion correcta ignorando el resto de referencias."
            },
            {
                nombre: "Velocidad cognitiva",
                descripcion: "Procesas la informacion espacial con rapidez para responder sin retrasos."
            },
            {
                nombre: "Control inhibitorio",
                descripcion: "Te ayuda a no pulsar por impulso cuando varias posiciones compiten entre si."
            },
            {
                nombre: "Coordinacion visomotora",
                descripcion: "Combinas localizacion visual y movimiento exacto de forma sincronizada."
            }
        ],
        url: "games/rosco/rosco-page.html",
        buildUrl: "games/rosco/rosco-build.html",
        imagen: "assets/juegos/rosco.png",
        logo: "assets/juegos/rosco.png",
        heroEyebrow: "Recomendado hoy",
        destacado: true,
        skills: [
            "atencion_selectiva",
            "velocidad_cognitiva",
            "control_inhibitorio",
            "coordinacion_visomotora"
        ]
    },
    {
        id: "detectar-intruso",
        aliases: ["detector de intrusos", "detectar intruso", "detectar intrusos"],
        nombre: "Detectar Intruso",
        categoria: "atencion",
        subtitulo: "Ficha del juego",
        descripcion: "Identifica el elemento incorrecto entre distractores y responde con precision.",
        detalleDescripcion: "El objetivo es identificar rapidamente el elemento que rompe la categoria comun del grupo. A medida que avanzas, las relaciones entre objetos son mas sutiles y la toma de decisiones debe ser cada vez mas precisa.",
        comoJugar: [
            "Observa el conjunto de elementos que aparece en pantalla.",
            "Identifica la categoria comun entre los estimulos.",
            "Haz clic sobre el elemento que no encaja con el resto.",
        ],
        habilidadesDetalle: [
            {
                nombre: "Atencion selectiva",
                descripcion: "Filtras estimulos irrelevantes para quedarte con la pista importante."
            },
            {
                nombre: "Control inhibitorio",
                descripcion: "Evitas respuestas impulsivas ante distractores muy parecidos."
            },
            {
                nombre: "Velocidad cognitiva",
                descripcion: "Procesas rapidamente la informacion visual para responder a tiempo."
            },
            {
                nombre: "Coordinacion visomotora",
                descripcion: "Transformas lo que ves en una accion correcta de forma inmediata."
            }
        ],
        url: "games/detectar-intruso/detectar-intruso-page.html",
        buildUrl: "games/detectar-intruso/detectar-intruso-build.html",
        imagen: "assets/juegos/detectar-intruso.png",
        logo: "assets/juegos/detectar-intruso.png",
        heroEyebrow: "Juego recomendado",
        destacado: true,
        skills: [
            "atencion_selectiva",
            "control_inhibitorio",
            "velocidad_cognitiva",
            "coordinacion_visomotora"
        ]
    },
    {
        id: "prueba1",
        nombre: "Juego de prueba 1",
        categoria: "reflejos",
        subtitulo: "Ficha del juego",
        descripcion: "Descripcion breve del juego de prueba 1.",
        detalleDescripcion: "Descripcion detallada del juego de prueba 1, explicando su objetivo y mecÃ¡nicas principales.",
        comoJugar: [
            "Paso 1 para jugar al juego de prueba 1.",
            "Paso 2 para jugar al juego de prueba 1.",
            "Paso 3 para jugar al juego de prueba 1."
        ],
        habilidadesDetalle: [
            {
                nombre: "Habilidad A",
                descripcion: "Descripcion de la habilidad A entrenada por el juego de prueba 1."
            },
            {
                nombre: "Habilidad B",
                descripcion: "Descripcion de la habilidad B entrenada por el juego de prueba 1."
            }
        ],
        url: "games/prueba1/prueba1-page.html",
        buildUrl: "games/prueba1/prueba1-build.html",
        imagen: "assets/juegos/prueba1.png",
        logo: "assets/juegos/prueba1.png",
        heroEyebrow: "Nuevo juego",
        destacado: false,
        skills: [
            "planificacion",
            "velocidad_cognitiva"
        ]
    },
    {
        id: "prueba2",
        nombre: "Juego de prueba 2",
        categoria: "atencion",
        subtitulo: "Ficha del juego",
        descripcion: "Descripcion breve del juego de prueba 2.",
        detalleDescripcion: "Descripcion detallada del juego de prueba 2, explicando su objetivo y mecÃ¡nicas principales.",
        comoJugar: [
            "Paso 1 para jugar al juego de prueba 2.",
            "Paso 2 para jugar al juego de prueba 2.",
            "Paso 3 para jugar al juego de prueba 2."
        ],
        habilidadesDetalle: [
            {
                nombre: "Habilidad A",
                descripcion: "Descripcion de la habilidad A entrenada por el juego de prueba 2."
            },
            {
                nombre: "Habilidad B",
                descripcion: "Descripcion de la habilidad B entrenada por el juego de prueba 2."
            }
        ],
        url: "games/prueba2/prueba2-page.html",
        buildUrl: "games/prueba2/prueba2-build.html",
        imagen: "assets/juegos/prueba2.png",
        logo: "assets/juegos/prueba2.png",
        heroEyebrow: "Nuevo juego",
        destacado: false,
        skills: [
            "atencion_dividida",
            "flexibilidad_cognitiva"
        ]
    },
    {
        id: "prueba3",
        nombre: "Juego de prueba 3",
        categoria: "memoria",
        subtitulo: "Ficha del juego",
        descripcion: "Descripcion breve del juego de prueba 3.",
        detalleDescripcion: "Descripcion detallada del juego de prueba 3, explicando su objetivo y mecÃ¡nicas principales.",
        comoJugar: [
            "Paso 1 para jugar al juego de prueba 3.",
            "Paso 2 para jugar al juego de prueba 3.",
            "Paso 3 para jugar al juego de prueba 3."
        ],
        habilidadesDetalle: [
            {
                nombre: "Habilidad A",
                descripcion: "Descripcion de la habilidad A entrenada por el juego de prueba 3."
            },
            {
                nombre: "Habilidad B",
                descripcion: "Descripcion de la habilidad B entrenada por el juego de prueba 3."
            }
        ],
        url: "games/prueba3/prueba3-page.html",
        buildUrl: "games/prueba3/prueba3-build.html",
        imagen: "assets/juegos/prueba3.png",
        logo: "assets/juegos/prueba3.png",
        heroEyebrow: "Nuevo juego",
        destacado: false,
        skills: [
            "memoria_espacial",
            "memoria_trabajo"
        ]
    }
];

function normalizeGameKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCatalogoJuegos() {
    return CATALOGO_JUEGOS.map((juego) => ({ ...juego, skills: [...juego.skills] }));
}

function getJuegoById(gameId) {
    const normalizedId = normalizeGameKey(gameId);

    return CATALOGO_JUEGOS.find((juego) => {
        if (normalizeGameKey(juego.id) === normalizedId) return true;
        if (normalizeGameKey(juego.nombre) === normalizedId) return true;
        return (juego.aliases || []).some((alias) => normalizeGameKey(alias) === normalizedId);
    }) || null;
}

function getJuegoSkillsById(gameId) {
    const juego = getJuegoById(gameId);
    if (!juego) return [];

    return juego.skills
        .map((skillSlug) => SKILL_DEFINITIONS[skillSlug]?.metricKey)
        .filter(Boolean);
}

function getSkillDefinition(skillSlug) {
    return SKILL_DEFINITIONS[skillSlug] || null;
}


window.SKILL_DEFINITIONS = SKILL_DEFINITIONS;
window.CATALOGO_JUEGOS = CATALOGO_JUEGOS;  // ← añade esto
window.catalogoJuegos = getCatalogoJuegos();
window.getCatalogoJuegos = getCatalogoJuegos;
window.getJuegoById = getJuegoById;
window.getJuegoSkillsById = getJuegoSkillsById;
window.getSkillDefinition = getSkillDefinition;
window.normalizeGameKey = normalizeGameKey;

