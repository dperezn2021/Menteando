const SKILL_DEFINITIONS = {
    // 🟣 ATENCIÓN (morados)
    atencion_sostenida: {
        metricKey: "atencionSostenida",
        label: "Atención sostenida",
        accent: "violet"
    },
    atencion_selectiva: {
        metricKey: "atencionSelectiva",
        label: "Atención selectiva",
        accent: "purple"
    },
    atencion_dividida: {
        metricKey: "atencionDividida",
        label: "Atención dividida",
        accent: "fuchsia"
    },

    // 🟢 MEMORIA (verdes)
    memoria_trabajo: {
        metricKey: "memoriaTrabajo",
        label: "Memoria de trabajo",
        accent: "green"
    },
    memoria_espacial: {
        metricKey: "memoriaEspacial",
        label: "Memoria espacial",
        accent: "emerald"
    },

    // 🔴 VELOCIDAD / REFLEJOS (rojos)
    velocidad_cognitiva: {
        metricKey: "velocidadCognitiva",
        label: "Velocidad cognitiva",
        accent: "red"
    },
    coordinacion_visomotora: {
        metricKey: "coordinacionVisomotora",
        label: "Coordinación visomotora",
        accent: "rose"
    },

    // 🟠 CONTROL EJECUTIVO (naranjas)
    control_inhibitorio: {
        metricKey: "controlInhibitorio",
        label: "Control inhibitorio",
        accent: "orange"
    },
    flexibilidad_cognitiva: {
        metricKey: "flexibilidadCognitiva",
        label: "Flexibilidad cognitiva",
        accent: "amber"
    },
    planificacion: {
        metricKey: "planificacion",
        label: "Planificación",
        accent: "yellow"
    }
};


const CATALOGO_JUEGOS = [
    {
        "id": "detector-intrusos",
        "aliases": ["intrusos", "detector", "odd-one-out"],
        "nombre": "Detector de Intrusos",
        "categoria": "atencion",
        "subtitulo": "Encuentra al sospechoso",
        "descripcion": "Eres un detective que debe encontrar entre los archivos al sospechoso, el cual lleva una camiseta blanca. Cada vez hay más informes y menos tiempo para resolverlo. La lupa puede ayudar... o molestar más de lo que ayuda.",
        "detalleDescripcion": "Detector de Intrusos entrena tu atención selectiva y velocidad de procesamiento. Actúas como detective: debes localizar al sospechoso (camiseta blanca) entre muchos informes (distractores). Cada nivel añade más archivos y reduce el tiempo disponible. La lupa aparece para ayudarte a enfocar, pero a veces señala al sitio equivocado, obligándote a inhibir esa distracción. La dificultad aumenta progresivamente.",
        "comoJugar": [
            "Eres un detective. Examina los archivos en pantalla.",
            "Busca al sospechoso: el que lleva camiseta BLANCA.",
            "Haz clic en él antes de que se acabe el tiempo.",
            "Cada nivel hay MÁS informes y MENOS tiempo.",
            "La lupa aparece para ayudarte... pero a veces señala al lugar equivocado. No te dejes engañar."
        ],
        "habilidadesDetalle": [
            { "nombre": "Atención selectiva", "descripcion": "Detectas al sospechoso entre muchos distractores visuales." },
            { "nombre": "Atención dividida", "descripcion": "Gestionas la lupa y los archivos al mismo tiempo." },
            { "nombre": "Velocidad cognitiva", "descripcion": "Procesas rápido porque el tiempo se reduce." },
            { "nombre": "Coordinación visomotora", "descripcion": "Transformas lo que ves en un clic preciso." }
        ],
        "url": "games/detector-intrusos/detector-intrusos-page.html",
        "buildUrl": "games/detector-intrusos/detector-intrusos-build.html",
        "imagen": "assets/juegos/detector-intrusos.png",
        "logo": "assets/icon/juegos/detector-intrusos.png",
        "heroEyebrow": "Búsqueda visual bajo presión",
        "destacado": false,
        "skills": ["atencion_selectiva", "atencion_dividida", "velocidad_cognitiva", "coordinacion_visomotora"],
        "disponible": "Disponible"
    },

    {
        "id": "doble-canal",
        "aliases": ["dual-task", "doble tarea"],
        "nombre": "Doble Canal",
        "categoria": "atencion",
        "subtitulo": "Doble tarea simultánea",
        "descripcion": "Gestiona dos tareas simultáneas: esquivar obstáculos y responder a estímulos.",
        "detalleDescripcion": "Doble Canal entrena tu capacidad de dividir la atención entre dos flujos de información. Requiere mantener el foco, inhibir errores y coordinar acciones rápidas.",
        "comoJugar": [
            "Controla al personaje del lado izquierdo para esquivar obstáculos.",
            "Responde a los estímulos del lado derecho según la regla.",
            "Mantén el rendimiento en ambos canales.",
            "Gestiona la interferencia entre tareas."
        ],
        "habilidadesDetalle": [
            { "nombre": "Atención dividida", "descripcion": "Gestionas dos tareas simultáneas sin perder precisión." },
            { "nombre": "Atención sostenida", "descripcion": "Mantienes el rendimiento en ambos canales durante toda la partida." },
            { "nombre": "Flexibilidad cognitiva", "descripcion": "Cambias rápidamente entre estímulos y acciones." },
            { "nombre": "Planificación", "descripcion": "Anticipas movimientos y respuestas en paralelo." },
            { "nombre": "Velocidad cognitiva", "descripcion": "Procesas información de dos fuentes a gran velocidad." },
            { "nombre": "Coordinación visomotora", "descripcion": "Controlas el movimiento del personaje con precisión." }
        ],
        "url": "games/doble-canal/doble-canal-page.html",
        "buildUrl": "games/doble-canal/doble-canal-build.html",
        "imagen": "assets/juegos/doble-canal.png",
        "logo": "assets/icon/juegos/doble-canal.png",
        "heroEyebrow": "Atención dual",
        "destacado": false,
        "skills": ["atencion_dividida", "atencion_sostenida", "flexibilidad_cognitiva", "planificacion", "velocidad_cognitiva", "coordinacion_visomotora"],
        "disponible": "No disponible"
    },

    {
        "id": "silencio-mental",
        "aliases": ["cpt", "go-nogo"],
        "nombre": "Silencio Mental",
        "categoria": "atencion",
        "subtitulo": "Vigilancia e inhibición",
        "descripcion": "Pulsa solo cuando aparece el estímulo objetivo. Inhibe el resto.",
        "detalleDescripcion": "Silencio Mental es un CPT/Go-NoGo puro que entrena vigilancia, inhibición y discriminación rápida. Mantener la regla activa exige memoria de trabajo.",
        "comoJugar": [
            "Observa los estímulos que aparecen en pantalla.",
            "Pulsa solo cuando aparezca el objetivo.",
            "Inhibe la respuesta ante distractores.",
            "Mantén la precisión durante toda la sesión."
        ],
        "habilidadesDetalle": [
            { "nombre": "Atención selectiva", "descripcion": "Distingues estímulos relevantes de distractores." },
            { "nombre": "Atención sostenida", "descripcion": "Mantienes la vigilancia durante toda la tarea." },
            { "nombre": "Memoria de trabajo", "descripcion": "Mantienes activa la regla de respuesta." },
            { "nombre": "Control inhibitorio", "descripcion": "Evitas pulsar cuando aparece un estímulo no objetivo." }
        ],
        "url": "games/silencio-mental/silencio-mental-page.html",
        "buildUrl": "games/silencio-mental/silencio-mental-build.html",
        "imagen": "assets/juegos/silencio-mental.png",
        "logo": "assets/icon/juegos/silencio-mental.png",
        "heroEyebrow": "Gestión controlada",
        "destacado": false,
        "skills": ["atencion_sostenida", "atencion_selectiva", "memoria_trabajo", "control_inhibitorio"],
        "disponible": "Disponible"
    },

    {
        "id": "operaciones-encadenadas",
        "aliases": ["math-chain", "operaciones"],
        "nombre": "Operaciones Encadenadas",
        "categoria": "memoria",
        "subtitulo": "Memoria y cálculo bajo presión",
        "descripcion": "Recuerda un número mientras resuelves operaciones. Si fallas, el número se reinicia.",
        "detalleDescripcion": "Primero memorizas un número que aparece en la calculadora. Luego resuelves operaciones (sumas, restas, multiplicaciones o divisiones). Cuando aparece un signo de interrogación (?) como dígito, debes sustituirlo por el número que memorizaste. Si fallas cualquier operación, el número se reinicia. La dificultad aumenta progresivamente. Entrena memoria de trabajo, atención sostenida y control inhibitorio.",
        "comoJugar": [
            "Memoriza el número que aparece en la calculadora.",
            "Resuelve las operaciones que aparecen (+, -, ×, ÷).",
            "Cuando veas un signo '?', sustitúyelo por el número que memorizaste.",
            "Si fallas CUALQUIER operación, el número se reinicia.",
            "¡Mantén la atención! La dificultad aumenta con cada acierto."
        ],
        "habilidadesDetalle": [
            { "nombre": "Memoria de trabajo", "descripcion": "Mantienes el número activo mientras resuelves operaciones." },
            { "nombre": "Control inhibitorio", "descripcion": "Evitas respuestas impulsivas antes de verificar." },
            { "nombre": "Planificación", "descripcion": "Anticipas los pasos para resolver la cadena." },
            { "nombre": "Velocidad cognitiva", "descripcion": "Procesas operaciones rápidamente bajo presión." },
            { "nombre": "Atención selectiva", "descripcion": "Distingues el '?' de los demás dígitos." }
        ],
        "url": "games/operaciones-encadenadas/operaciones-encadenadas-page.html",
        "buildUrl": "games/operaciones-encadenadas/operaciones-encadenadas-build.html",
        "imagen": "assets/juegos/operaciones-encadenadas.png",
        "logo": "assets/icon/juegos/operaciones-encadenadas.png",
        "heroEyebrow": "Memoria activa y cálculo",
        "destacado": false,
        "skills": ["memoria_trabajo", "control_inhibitorio", "planificacion", "velocidad_cognitiva", "atencion_selectiva"],
        "disponible": "Disponible"
    },

    {
        "id": "eco-visual",
        "aliases": ["corsi-visual", "memoria-espacial"],
        "nombre": "Eco Visual",
        "categoria": "memoria",
        "subtitulo": "Memoria espacial",
        "descripcion": "Memoriza la posición de varios objetos y colócalos después en su sitio.",
        "detalleDescripcion": "Eco Visual es un Corsi adaptado que entrena memoria espacial, atención selectiva y reorganización mental.",
        "comoJugar": [
            "Observa la posición de los objetos.",
            "Memoriza su distribución.",
            "Arrástralos a su lugar correcto.",
            "Completa niveles cada vez más complejos."
        ],
        "habilidadesDetalle": [
            { "nombre": "Memoria espacial", "descripcion": "Retienes la ubicación de varios objetos simultáneamente." },
            { "nombre": "Atención selectiva", "descripcion": "Distingues formas y posiciones relevantes." },
            { "nombre": "Atención sostenida", "descripcion": "Mantienes el foco durante la reconstrucción." },
            { "nombre": "Flexibilidad cognitiva", "descripcion": "Reorganizas mentalmente la escena cuando es necesario." }
        ],
        "url": "games/eco-visual/eco-visual-page.html",
        "buildUrl": "games/eco-visual/eco-visual-build.html",
        "imagen": "assets/juegos/eco-visual.png",
        "logo": "assets/icon/juegos/eco-visual.png",
        "heroEyebrow": "Memoria espacial",
        "destacado": false,
        "skills": ["memoria_espacial", "atencion_selectiva", "atencion_sostenida", "flexibilidad_cognitiva"],
        "disponible": "No disponible"
    },

    {
        "id": "color-match",
        "aliases": ["stroop", "colores"],
        "nombre": "Color Match",
        "categoria": "control",
        "subtitulo": "Control inhibitorio",
        "descripcion": "Pulsa el color correcto ignorando la palabra escrita.",
        "detalleDescripcion": "Color Match es un Stroop digital que entrena inhibición, velocidad y gestión de interferencias.",
        "comoJugar": [
            "Lee la palabra que aparece.",
            "Ignora su significado.",
            "Pulsa el color real del texto.",
            "Evita caer en la interferencia."
        ],
        "habilidadesDetalle": [
            { "nombre": "Control inhibitorio", "descripcion": "Bloqueas la lectura automática de la palabra." },
            { "nombre": "Velocidad cognitiva", "descripcion": "Procesas el estímulo rápidamente para responder a tiempo." },
            { "nombre": "Atención dividida", "descripcion": "Gestionas simultáneamente color y palabra." },
            { "nombre": "Memoria de trabajo", "descripcion": "Mantienes activa la regla de respuesta." }
        ],
        "url": "games/color-match/color-match-page.html",
        "buildUrl": "games/color-match/color-match-build.html",
        "imagen": "assets/juegos/color-match.png",
        "logo": "assets/icon/juegos/color-match.png",
        "heroEyebrow": "Control inhibitorio",
        "destacado": false,
        "skills": ["control_inhibitorio", "velocidad_cognitiva", "atencion_dividida", "memoria_trabajo"],
        "disponible": "No disponible"
    },

    {
        "id": "cambio-de-reglas",
        "aliases": ["wcst-digital", "reglas"],
        "nombre": "Cambio de Reglas",
        "categoria": "control",
        "subtitulo": "Flexibilidad cognitiva",
        "descripcion": "La regla cambia sin aviso. Adáptate rápidamente.",
        "detalleDescripcion": "Este juego entrena flexibilidad cognitiva, inhibición y planificación al cambiar criterios de clasificación sin previo aviso.",
        "comoJugar": [
            "Lee la regla actual.",
            "Toca los estímulos que cumplan la norma.",
            "Adáptate cuando la regla cambie.",
            "Evita perseverar en la regla anterior."
        ],
        "habilidadesDetalle": [
            { "nombre": "Flexibilidad cognitiva", "descripcion": "Cambias de estrategia cuando la regla se actualiza." },
            { "nombre": "Control inhibitorio", "descripcion": "Evitas seguir aplicando la regla anterior." },
            { "nombre": "Planificación", "descripcion": "Decides qué estímulos tocar primero según la norma." },
            { "nombre": "Memoria espacial", "descripcion": "Recuerdas dónde están los estímulos relevantes." }
        ],
        "url": "games/cambio-de-reglas/cambio-de-reglas-page.html",
        "buildUrl": "games/cambio-de-reglas/cambio-de-reglas-build.html",
        "imagen": "assets/juegos/cambio-de-reglas.png",
        "logo": "assets/icon/juegos/cambio-de-reglas.png",
        "heroEyebrow": "Flexibilidad cognitiva",
        "destacado": false,
        "skills": ["flexibilidad_cognitiva", "control_inhibitorio", "planificacion", "memoria_espacial"],
        "disponible": "No disponible"
    },

    {
        "id": "trayectorias-mentales",
        "aliases": ["tol-digital", "trayectorias"],
        "nombre": "Trayectorias Mentales",
        "categoria": "control",
        "subtitulo": "Planificación estratégica",
        "descripcion": "Planifica el recorrido antes de mover el punto.",
        "detalleDescripcion": "Un Tower of London adaptado que entrena planificación, memoria activa y representación espacial.",
        "comoJugar": [
            "Observa el mapa.",
            "Elige dirección, fuerza y rebotes.",
            "Planifica antes de ejecutar.",
            "Optimiza tus movimientos."
        ],
        "habilidadesDetalle": [
            { "nombre": "Planificación", "descripcion": "Organizas mentalmente los pasos antes de actuar." },
            { "nombre": "Memoria de trabajo", "descripcion": "Mantienes el plan activo mientras decides." },
            { "nombre": "Memoria espacial", "descripcion": "Representas mentalmente el mapa y los rebotes." },
            { "nombre": "Atención sostenida", "descripcion": "Mantienes el foco durante la planificación." }
        ],
        "url": "games/trayectorias-mentales/trayectorias-mentales-page.html",
        "buildUrl": "games/trayectorias-mentales/trayectorias-mentales-build.html",
        "imagen": "assets/juegos/trayectorias-mentales.png",
        "logo": "assets/icon/juegos/trayectorias-mentales.png",
        "heroEyebrow": "Planificación estratégica",
        "destacado": false,
        "skills": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
        "disponible": "No disponible"
    },

    {
        "id": "mision-orbital",
        "aliases": ["mision", "timing", "orbital"],
        "nombre": "Misión Orbital",
        "categoria": "reflejos",
        "subtitulo": "Reflejos y sincronización",
        "descripcion": "Eres un piloto con la misión de destruir el asteroide indicado. Tu nave tiene un selector de asteroides.",
        "detalleDescripcion": "Eres un piloto de una nave con la misión de destruir el asteroide MALO. Tu nave tiene un selector de asteroides: debes pulsar la cruceta cuando el asteroide SELECCIONADO coincida con el asteroide MALO. Cada estación (nivel) es más complicado: más asteroides, más velocidad. Además, la nave se queda sin combustible progresivamente. Consigue destruir el máximo de asteroides malos antes de quedarte sin combustible. Entrena velocidad cognitiva, coordinación visomotora y atención selectiva.",
        "comoJugar": [
            "Eres un piloto. Observa el selector de asteroides de tu nave.",
            "Identifica el asteroide MALO (objetivo a destruir).",
            "Pulsa la cruceta CUANDO el selector coincida con el asteroide malo.",
            "Cada nivel (estación) es más complicado: más asteroides y más velocidad.",
            "¡La nave pierde combustible! Destruye asteroides antes de quedarte sin él."
        ],
        "habilidadesDetalle": [
            { "nombre": "Velocidad cognitiva", "descripcion": "Procesas el movimiento y el selector rápidamente para acertar en el momento exacto." },
            { "nombre": "Coordinación visomotora", "descripcion": "Sincronizas percepción visual y acción motora con precisión milimétrica." },
            { "nombre": "Atención selectiva", "descripcion": "Distingues el asteroide malo entre los distractores y el selector." }
        ],
        "url": "games/mision-orbital/mision-orbital-page.html",
        "buildUrl": "games/mision-orbital/mision-orbital-build.html",
        "imagen": "assets/juegos/mision-orbital.png",
        "logo": "assets/icon/juegos/mision-orbital.png",
        "heroEyebrow": "Reflejos y sincronización",
        "destacado": false,
        "skills": ["velocidad_cognitiva", "coordinacion_visomotora"],
        "disponible": "Disponible"
    },

    {
        "id": "reflejos-cruzados",
        "aliases": ["reflejos", "cross-reflex", "cruzados"],
        "nombre": "Reflejos Cruzados",
        "categoria": "reflejos",
        "subtitulo": "Velocidad e inhibición",
        "descripcion": "Toca los objetos verdes y esquiva los rojos. A veces cambian de comportamiento.",
        "detalleDescripcion": "Reflejos Cruzados combina velocidad visomotora con control inhibitorio. Exige discriminar estímulos rápidamente, adaptarse a cambios inesperados y mantener precisión bajo presión.",
        "comoJugar": [
            "Toca los objetos verdes que caen por la pantalla.",
            "Evita tocar los objetos rojos.",
            "Reacciona rápido si un objeto cambia de comportamiento.",
            "Mantén la precisión mientras aumenta la velocidad."
        ],
        "habilidadesDetalle": [
            { "nombre": "Atención dividida", "descripcion": "Gestionas simultáneamente varios objetos en movimiento." },
            { "nombre": "Memoria espacial", "descripcion": "Recuerdas la trayectoria y posición de los objetos relevantes." },
            { "nombre": "Control inhibitorio", "descripcion": "Evitas tocar los estímulos incorrectos incluso bajo presión." },
            { "nombre": "Flexibilidad cognitiva", "descripcion": "Te adaptas cuando un objeto cambia su comportamiento." },
            { "nombre": "Coordinación visomotora", "descripcion": "Sincronizas tus movimientos con la caída de los objetos." }
        ],
        "url": "games/reflejos-cruzados/reflejos-cruzados-page.html",
        "buildUrl": "games/reflejos-cruzados/reflejos-cruzados-build.html",
        "imagen": "assets/juegos/reflejos-cruzados.png",
        "logo": "assets/icon/juegos/reflejos-cruzados.png",
        "heroEyebrow": "Reflejos y precisión",
        "destacado": false,
        "skills": ["coordinacion_visomotora", "atencion_dividida", "memoria_espacial", "control_inhibitorio", "flexibilidad_cognitiva"],
        "disponible": "No disponible"
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

function getJuegosBySkills(skills) {
    return CATALOGO_JUEGOS
        .map(juego => ({
            juego,
            coincidencias: juego.skills.filter(s => skills.includes(s)).length
        }))
        .filter(item => item.coincidencias > 0)
        .sort((a, b) => b.coincidencias - a.coincidencias)
        .map(item => item.juego);
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

