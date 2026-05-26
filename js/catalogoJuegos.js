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
    "subtitulo": "Atención selectiva",
    "descripcion": "Encuentra al sospechoso con camiseta blanca entre muchos expedientes antes de que se acabe el tiempo.",
    "detalleDescripcion": "Eres un detective revisando carpetas de criminales. En cada ronda debes localizar al intruso: el sospechoso que lleva camiseta blanca. A medida que avanzas aparecen más personas y tienes menos tiempo, por lo que debes filtrar distractores rápidamente y hacer clic con precisión.",
    "comoJugar": [
      "Observa todos los expedientes que aparecen en pantalla.",
      "Busca al sospechoso que lleva camiseta blanca.",
      "Haz clic sobre él antes de que termine el tiempo.",
      "En niveles altos habrá más sospechosos y menos tiempo para responder.",
      "Si aparece una ayuda visual, úsala con cuidado: puede distraerte."
    ],
    "habilidadesDetalle": [
      { "nombre": "Atención selectiva", "descripcion": "Habilidad principal. Mide tu precisión localizando el objetivo correcto entre muchos distractores." },
      { "nombre": "Velocidad cognitiva", "descripcion": "Evalúa lo rápido que procesas la escena y respondes dentro del tiempo disponible." },
      { "nombre": "Coordinación visomotora", "descripcion": "Combina precisión visual y clic correcto sobre el sospechoso." },
      { "nombre": "Atención dividida", "descripcion": "Valora tu capacidad para manejar una pantalla cada vez más cargada sin perder el objetivo." }
    ],
    "url": "games/detector-intrusos/detector-intrusos-page.html",
    "buildUrl": "games/detector-intrusos/detector-intrusos-build.html",
    "imagen": "assets/juegos/detector-intrusos.png",
    "logo": "assets/icon/juegos/detector-intrusos.png",
    "heroEyebrow": "Búsqueda visual bajo presión",
    "destacado": false,
    "skills": ["atencion_selectiva", "velocidad_cognitiva", "coordinacion_visomotora", "atencion_dividida"],
    "disponible": "Disponible"
  },
  {
    "id": "doble-canal",
    "aliases": ["dual-task", "doble tarea"],
    "nombre": "Doble Canal",
    "categoria": "atencion",
    "subtitulo": "Atención dividida",
    "descripcion": "Juega dos tareas a la vez: esquiva obstáculos y responde solo a las señales correctas.",
    "detalleDescripcion": "Doble Canal divide la pantalla en dos tareas simultáneas. En una controlas a un personaje que debe esquivar obstáculos. En la otra respondes a señales: la azul se pulsa y la roja se inhibe. El reto consiste en mantener buen rendimiento en ambos canales sin descuidar ninguno.",
    "comoJugar": [
      "Controla al personaje para esquivar los obstáculos.",
      "Cuando aparezca una señal azul, pulsa la respuesta.",
      "Cuando aparezca una señal roja, no pulses.",
      "Intenta mantener la atención en las dos tareas al mismo tiempo.",
      "La dificultad aumenta con más velocidad, más obstáculos y menos margen de reacción."
    ],
    "habilidadesDetalle": [
      { "nombre": "Atención dividida", "descripcion": "Habilidad principal. Mide cómo repartes tu atención entre la tarea motora y la tarea de señales." },
      { "nombre": "Coordinación visomotora", "descripcion": "Evalúa la precisión con la que controlas el personaje y esquivas obstáculos." },
      { "nombre": "Atención sostenida", "descripcion": "Valora si mantienes el rendimiento durante toda la partida." },
      { "nombre": "Velocidad cognitiva", "descripcion": "Mide tu rapidez al interpretar señales y responder." }
    ],
    "url": "games/doble-canal/doble-canal-page.html",
    "buildUrl": "games/doble-canal/doble-canal-build.html",
    "imagen": "assets/juegos/doble-canal.png",
    "logo": "assets/icon/juegos/doble-canal.png",
    "heroEyebrow": "Doble tarea simultánea",
    "destacado": false,
    "skills": ["atencion_dividida", "coordinacion_visomotora", "atencion_sostenida", "velocidad_cognitiva"],
    "disponible": "Disponible"
  },
  {
    "id": "silencio-mental",
    "aliases": ["cpt", "go-nogo"],
    "nombre": "Silencio Mental",
    "categoria": "atencion",
    "subtitulo": "Atención sostenida",
    "descripcion": "Memoriza la lección y levanta la mano solo cuando vuelva a aparecer el mismo símbolo.",
    "detalleDescripcion": "Estás en una clase. Al inicio de cada ronda se muestra una lección: un símbolo concreto con un color concreto. Después aparecen varios estímulos. Solo debes responder cuando vuelva a salir exactamente el símbolo aprendido. Si aparece otro, debes esperar.",
    "comoJugar": [
      "Memoriza el símbolo y el color que se muestran como lección.",
      "Observa los estímulos que aparecen después.",
      "Pulsa para levantar la mano solo si reaparece la misma lección.",
      "No pulses ante símbolos o colores diferentes.",
      "Mantén la concentración durante toda la sesión."
    ],
    "habilidadesDetalle": [
      { "nombre": "Atención sostenida", "descripcion": "Habilidad principal. Mide tu capacidad para mantener la vigilancia durante toda la tarea." },
      { "nombre": "Control inhibitorio", "descripcion": "Evalúa si evitas responder ante estímulos que no son la lección correcta." },
      { "nombre": "Atención selectiva", "descripcion": "Valora si distingues el objetivo real de los distractores." },
      { "nombre": "Memoria de trabajo", "descripcion": "Mide si mantienes activa la lección que debes reconocer." }
    ],
    "url": "games/silencio-mental/silencio-mental-page.html",
    "buildUrl": "games/silencio-mental/silencio-mental-build.html",
    "imagen": "assets/juegos/silencio-mental.png",
    "logo": "assets/icon/juegos/silencio-mental.png",
    "heroEyebrow": "Vigilancia e inhibición",
    "destacado": false,
    "skills": ["atencion_sostenida", "control_inhibitorio", "atencion_selectiva", "memoria_trabajo"],
    "disponible": "Disponible"
  },
  {
    "id": "operaciones-encadenadas",
    "aliases": ["math-chain", "operaciones"],
    "nombre": "Operaciones Encadenadas",
    "categoria": "memoria",
    "subtitulo": "Memoria de trabajo",
    "descripcion": "Recuerda un número y úsalo cuando aparezca una interrogación dentro de una operación.",
    "detalleDescripcion": "Trabajas con una calculadora. Primero memorizas un número. Después resuelves operaciones con sumas, restas, multiplicaciones o divisiones. A veces uno de los dígitos aparece como interrogación; en ese caso debes sustituirlo mentalmente por el número recordado.",
    "comoJugar": [
      "Memoriza el número que aparece al inicio.",
      "Resuelve las operaciones que te propone la calculadora.",
      "Cuando veas una interrogación, sustitúyela por el número memorizado.",
      "Introduce el resultado final de la operación.",
      "Si fallas, tendrás que volver a fijar el número en memoria."
    ],
    "habilidadesDetalle": [
      { "nombre": "Memoria de trabajo", "descripcion": "Habilidad principal. Mide si mantienes el número activo mientras haces cálculos." },
      { "nombre": "Planificación", "descripcion": "Evalúa cómo organizas mentalmente operaciones más largas o complejas." },
      { "nombre": "Velocidad cognitiva", "descripcion": "Valora la rapidez con la que resuelves las operaciones." },
      { "nombre": "Atención selectiva", "descripcion": "Mide si detectas correctamente cuándo aparece la interrogación relevante." }
    ],
    "url": "games/operaciones-encadenadas/operaciones-encadenadas-page.html",
    "buildUrl": "games/operaciones-encadenadas/operaciones-encadenadas-build.html",
    "imagen": "assets/juegos/operaciones-encadenadas.png",
    "logo": "assets/icon/juegos/operaciones-encadenadas.png",
    "heroEyebrow": "Memoria activa y cálculo",
    "destacado": false,
    "skills": ["memoria_trabajo", "planificacion", "velocidad_cognitiva", "atencion_selectiva"],
    "disponible": "Disponible"
  },
  {
    "id": "eco-visual",
    "aliases": ["corsi-visual", "memoria-espacial"],
    "nombre": "Eco Visual",
    "categoria": "memoria",
    "subtitulo": "Memoria espacial",
    "descripcion": "Observa varios objetos, recuerda dónde estaban y vuelve a colocarlos en su posición.",
    "detalleDescripcion": "Eco Visual es una tarea de memoria espacial. Primero se muestran objetos colocados en distintas posiciones. Después desaparecen o se desordenan, y debes arrastrarlos al lugar que recuerdas. Al terminar se compara tu colocación con la posición original.",
    "comoJugar": [
      "Observa con atención la posición de cada objeto.",
      "Memoriza la distribución antes de que cambie la pantalla.",
      "Arrastra cada objeto al lugar donde crees que estaba.",
      "Cuanto más cerca lo coloques, mejor será tu resultado.",
      "En niveles superiores aparecen más objetos y posiciones más difíciles."
    ],
    "habilidadesDetalle": [
      { "nombre": "Memoria espacial", "descripcion": "Habilidad principal. Mide la precisión con la que recuerdas ubicaciones." },
      { "nombre": "Atención selectiva", "descripcion": "Evalúa si atiendes a los objetos y posiciones relevantes." },
      { "nombre": "Flexibilidad cognitiva", "descripcion": "Valora tu capacidad para reorganizar mentalmente la escena." },
      { "nombre": "Atención sostenida", "descripcion": "Mide si mantienes el foco durante observación y reconstrucción." }
    ],
    "url": "games/eco-visual/eco-visual-page.html",
    "buildUrl": "games/eco-visual/eco-visual-build.html",
    "imagen": "assets/juegos/eco-visual.png",
    "logo": "assets/icon/juegos/eco-visual.png",
    "heroEyebrow": "Recuerdo de posiciones",
    "destacado": false,
    "skills": ["memoria_espacial", "atencion_selectiva", "flexibilidad_cognitiva", "atencion_sostenida"],
    "disponible": "Disponible"
  },
  {
    "id": "color-match",
    "aliases": ["stroop", "colores"],
    "nombre": "Color Match",
    "categoria": "control",
    "subtitulo": "Control inhibitorio",
    "descripcion": "Responde al color correcto aunque la palabra escrita intente confundirte.",
    "detalleDescripcion": "Color Match es una tarea tipo Stroop. Aparece una palabra de color pintada con otro color. Según la regla activa, debes responder al color de la tinta o al significado de la palabra. El reto es evitar la respuesta automática incorrecta.",
    "comoJugar": [
      "Lee la regla activa antes de responder.",
      "Si la regla pide color real, pulsa el color con el que está pintado el texto.",
      "Si la regla pide palabra, pulsa el color que la palabra dice.",
      "Ignora la información que no corresponda a la regla.",
      "Responde con precisión y rapidez."
    ],
    "habilidadesDetalle": [
      { "nombre": "Control inhibitorio", "descripcion": "Habilidad principal. Mide si bloqueas la respuesta automática que provoca interferencia." },
      { "nombre": "Velocidad cognitiva", "descripcion": "Evalúa la rapidez con la que procesas la regla y respondes." },
      { "nombre": "Atención dividida", "descripcion": "Valora cómo gestionas color visual y significado escrito al mismo tiempo." },
      { "nombre": "Memoria de trabajo", "descripcion": "Mide si mantienes activa la regla de respuesta." }
    ],
    "url": "games/color-match/color-match-page.html",
    "buildUrl": "games/color-match/color-match-build.html",
    "imagen": "assets/juegos/color-match.png",
    "logo": "assets/icon/juegos/color-match.png",
    "heroEyebrow": "Interferencia y respuesta",
    "destacado": false,
    "skills": ["control_inhibitorio", "velocidad_cognitiva", "atencion_dividida", "memoria_trabajo"],
    "disponible": "Disponible"
  },
  {
    "id": "cambio-de-reglas",
    "aliases": ["wcst-digital", "reglas"],
    "nombre": "Cambio de Reglas",
    "categoria": "control",
    "subtitulo": "Flexibilidad cognitiva",
    "descripcion": "Clasifica alimentos siguiendo una norma que cambia durante la partida.",
    "detalleDescripcion": "Estás en una cocina y debes tocar los alimentos que cumplen la norma activa. La regla puede pedir frutas, verduras, carnes, bebidas, alimentos verdes, rojos, dulces, fríos, cocinados u otras categorías. Cuando la norma cambia, debes abandonar la regla anterior y adaptarte rápido.",
    "comoJugar": [
      "Lee la norma que aparece en la parte superior.",
      "Toca solo los alimentos que cumplen esa norma.",
      "Si la regla dice evitar una categoría, no pulses esos alimentos.",
      "Cuando aparezca una norma nueva, cambia de estrategia inmediatamente.",
      "Intenta mantener la racha sin seguir aplicando la regla anterior."
    ],
    "habilidadesDetalle": [
      { "nombre": "Flexibilidad cognitiva", "descripcion": "Habilidad principal. Mide cómo te adaptas cuando cambia la norma de clasificación." },
      { "nombre": "Control inhibitorio", "descripcion": "Evalúa si evitas pulsar alimentos incorrectos o seguir la regla anterior." },
      { "nombre": "Planificación", "descripcion": "Valora cómo decides qué alimentos tocar primero para completar la ronda." },
      { "nombre": "Memoria espacial", "descripcion": "Mide si recuerdas dónde están los alimentos relevantes mientras cambia la regla." }
    ],
    "url": "games/cambio-de-reglas/cambio-de-reglas-page.html",
    "buildUrl": "games/cambio-de-reglas/cambio-de-reglas-build.html",
    "imagen": "assets/juegos/cambio-de-reglas.png",
    "logo": "assets/icon/juegos/cambio-de-reglas.png",
    "heroEyebrow": "Cambio de criterio",
    "destacado": false,
    "skills": ["flexibilidad_cognitiva", "control_inhibitorio", "planificacion", "memoria_espacial"],
    "disponible": "Disponible"
  },
  {
    "id": "trayectorias-mentales",
    "aliases": ["tol-digital", "trayectorias"],
    "nombre": "Trayectorias Mentales",
    "categoria": "control",
    "subtitulo": "Planificación",
    "descripcion": "Ayuda a la rata a escapar calculando la trayectoria y el número exacto de rebotes.",
    "detalleDescripcion": "Eres una rata que debe salir de una cueva siguiendo el olor del queso. Antes de moverte debes apuntar la dirección inicial. La rata avanzará sola, rebotando en paredes. Para superar el nivel debe escapar por la salida cumpliendo exactamente el número de rebotes indicado.",
    "comoJugar": [
      "Observa la cueva, la salida y el número de rebotes requerido.",
      "Mueve el ratón para orientar a la rata.",
      "Usa la vista previa limitada para imaginar la trayectoria.",
      "Haz clic para lanzar la rata; después no podrás corregirla.",
      "Evita trampas y usa power-ups si aparecen: rebote extra o vida extra."
    ],
    "habilidadesDetalle": [
      { "nombre": "Planificación", "descripcion": "Habilidad principal. Mide si anticipas la ruta antes de ejecutar el movimiento." },
      { "nombre": "Memoria de trabajo", "descripcion": "Evalúa si mantienes activo el número de rebotes y el plan de ruta." },
      { "nombre": "Memoria espacial", "descripcion": "Valora cómo representas mentalmente paredes, salida, trampas y rebotes." },
      { "nombre": "Atención sostenida", "descripcion": "Mide si mantienes el foco durante la planificación de cada intento." }
    ],
    "url": "games/trayectorias-mentales/trayectorias-mentales-page.html",
    "buildUrl": "games/trayectorias-mentales/trayectorias-mentales-build.html",
    "imagen": "assets/juegos/trayectorias-mentales.png",
    "logo": "assets/icon/juegos/trayectorias-mentales.png",
    "heroEyebrow": "Ruta antes de actuar",
    "destacado": false,
    "skills": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
    "disponible": "Disponible"
  },
  {
    "id": "mision-orbital",
    "aliases": ["mision", "timing", "orbital"],
    "nombre": "Misión Orbital",
    "categoria": "reflejos",
    "subtitulo": "Velocidad cognitiva",
    "descripcion": "Dispara cuando el selector amarillo coincida con el asteroide explosivo marcado en rojo.",
    "detalleDescripcion": "Estás en una misión espacial. En un anillo de asteroides hay un asteroide explosivo marcado en rojo. El selector amarillo va cambiando de asteroide. Debes disparar justo cuando el selector coincida con el objetivo rojo. En niveles altos hay más asteroides, más velocidad y cambios de dirección.",
    "comoJugar": [
      "Localiza el asteroide explosivo marcado en rojo.",
      "Observa el selector amarillo que va pasando por los asteroides.",
      "Dispara solo cuando el selector esté sobre el asteroide rojo.",
      "Anticipa el momento exacto para no disparar tarde ni pronto.",
      "En niveles altos el movimiento será más rápido y puede cambiar de dirección."
    ],
    "habilidadesDetalle": [
      { "nombre": "Velocidad cognitiva", "descripcion": "Habilidad principal. Mide lo rápido que procesas el movimiento del selector." },
      { "nombre": "Coordinación visomotora", "descripcion": "Evalúa la precisión temporal entre lo que ves y el disparo." },
      { "nombre": "Flexibilidad cognitiva", "descripcion": "Valora tu adaptación cuando aumenta la dificultad o cambia la dirección." },
      { "nombre": "Planificación", "descripcion": "Mide tu capacidad para anticipar el momento correcto de disparo." }
    ],
    "url": "games/mision-orbital/mision-orbital-page.html",
    "buildUrl": "games/mision-orbital/mision-orbital-build.html",
    "imagen": "assets/juegos/mision-orbital.png",
    "logo": "assets/icon/juegos/mision-orbital.png",
    "heroEyebrow": "Timing espacial",
    "destacado": false,
    "skills": ["velocidad_cognitiva", "coordinacion_visomotora", "flexibilidad_cognitiva", "planificacion"],
    "disponible": "Disponible"
  },
  {
    "id": "reflejos-cruzados",
    "aliases": ["reflejos", "cross-reflex", "cruzados"],
    "nombre": "Reflejos Cruzados",
    "categoria": "reflejos",
    "subtitulo": "Coordinación visomotora",
    "descripcion": "Eres un sheriff: dispara a las dianas correctas según la norma activa.",
    "detalleDescripcion": "Reflejos Cruzados te coloca como sheriff ante dianas que caen por la pantalla. Normalmente debes disparar a las verdes y evitar las rojas, pero durante la partida la norma puede invertirse. El reto es reaccionar rápido sin disparar a la diana equivocada.",
    "comoJugar": [
      "Lee la norma activa: indica si debes disparar a verdes o rojas.",
      "Haz clic sobre las dianas correctas antes de que desaparezcan.",
      "No dispares a las dianas que no correspondan a la norma.",
      "Cuando la regla se invierta, cambia tu respuesta inmediatamente.",
      "Mantén la racha mientras aumenta la velocidad."
    ],
    "habilidadesDetalle": [
      { "nombre": "Coordinación visomotora", "descripcion": "Habilidad principal. Mide la precisión con la que conviertes estímulos visuales en disparos." },
      { "nombre": "Control inhibitorio", "descripcion": "Evalúa si evitas disparar a dianas incorrectas." },
      { "nombre": "Memoria espacial", "descripcion": "Valora cómo sigues la posición y trayectoria de varias dianas." },
      { "nombre": "Planificación", "descripcion": "Mide cómo priorizas qué dianas disparar para mantener precisión y racha." }
    ],
    "url": "games/reflejos-cruzados/reflejos-cruzados-page.html",
    "buildUrl": "games/reflejos-cruzados/reflejos-cruzados-build.html",
    "imagen": "assets/juegos/reflejos-cruzados.png",
    "logo": "assets/icon/juegos/reflejos-cruzados.png",
    "heroEyebrow": "Disparo preciso",
    "destacado": false,
    "skills": ["coordinacion_visomotora", "control_inhibitorio", "memoria_espacial", "planificacion"],
    "disponible": "Disponible"
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

