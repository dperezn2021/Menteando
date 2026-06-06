const CATALOGO_TESTS = [
    {
        "id": "mec",
        "nombre": "Mini-Examen Cognoscitivo (MEC) de Lobo",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "planificacion", "velocidad_cognitiva", "flexibilidad_cognitiva", "control_inhibitorio"],
        "duracion": "~10 min",
        "descripcion": "Versión adaptada y validada en España del MMSE de Folstein. Se utiliza como herramienta de cribado (screening) rápido para detectar la presencia de deterioro cognitivo o demencia en adultos y ancianos. Evalúa cinco áreas cognitivas: orientación temporal y espacial, fijación (memoria inmediata), concentración y cálculo, memoria diferida y lenguaje/praxias. La puntuación máxima es de 35 puntos y un resultado por debajo de 23-24 puntos suele indicar sospecha de deterioro cognitivo.",
        "resumen": "Evaluación global de tu estado cognitivo: orientación, memoria, cálculo y lenguaje.",
        "imagen": "assets/tests/mec.jpg",
        "url": "tests/mec-page.html",
        "completado": false,
        "heroEyebrow": "Cribado cognitivo global",
        "bloques": [
            " Orientación temporal (5 preguntas): año, estación, mes, día de la semana, día del mes.",
            " Orientación espacial (4 preguntas): navegador, dispositivo, día/noche, tipo de conexión.",
            " Fijación (3 puntos): memoriza 3 palabras que luego tendrás que recordar.",
            " Concentración y cálculo (5 puntos): resta 7 desde 100 (5 veces).",
            " Memoria diferida (3 puntos): recuerda las 3 palabras del principio.",
            "6️⃣ Lenguaje (7 puntos): repite una secuencia, escribe una palabra con letra específica, encuentra antónimos."
        ]
    },
    {
        "id": "tavec",
        "nombre": "TAVEC – Test de Aprendizaje Verbal España-Complutense",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "planificacion", "atencion_sostenida", "flexibilidad_cognitiva"],
        "duracion": "~12 min",
        "descripcion": "Permite distinguir entre déficits de atención, almacenamiento o recuperación de información. Consiste en el aprendizaje de una lista de 16 palabras de tres categorías distintas que se lee al sujeto en cinco ensayos. Incluye una lista de interferencia posterior para evaluar el olvido por distracción. Evalúa recuerdo inmediato, recuerdo demorado (tras 20 minutos) y reconocimiento entre una lista más amplia. Permite identificar estrategias de categorización y detectar efectos de primacía y recencia.",
        "resumen": "Aprende 16 palabras en 5 rondas, resiste la interferencia y recuérdalas después.",
        "imagen": "assets/tests/tavec.jpg",
        "url": "tests/tavec-page.html",
        "completado": false,
        "heroEyebrow": "Aprendizaje y memoria verbal",
        "bloques": [
            " 5 ensayos de aprendizaje: memoriza las 16 palabras y escribe las que recuerdes.",
            " Lista de interferencia: memoriza 6 palabras diferentes.",
            " Recuerdo inmediato: escribe las palabras de la lista ORIGINAL.",
            " Espera 20 segundos (distracción).",
            " Recuerdo demorado: vuelve a escribir las palabras ORIGINALES.",
            "6️⃣ Reconocimiento: marca cuáles de 16 palabras estaban en la lista original."
        ]
    },
    {
        "id": "d2",
        "nombre": "Test d2 de Atención",
        "categoria": "atencion",
        "habilidades": ["atencion_selectiva", "atencion_sostenida", "control_inhibitorio"],
        "duracion": "~2 min",
        "descripcion": "Herramienta que mide atención selectiva, velocidad de procesamiento y precisión en la concentración mental. El sujeto debe marcar la letra 'd' que tenga exactamente 2 rayas (comillas) en total, ignorando las 'p' y las 'd' con otras cantidades de rayas. Seleccionar estímulos relevantes e inhibir los irrelevantes.",
        "resumen": "Marca solo las 'd' con exactamente dos rayas antes de que se acabe el tiempo.",
        "imagen": "assets/tests/d2.jpg",
        "url": "tests/d2-page.html",
        "completado": false,
        "heroEyebrow": "Atención selectiva",
        "bloques": [
            " Aparecerán 5 líneas con letras 'd' y 'p'.",
            " Cada letra tiene entre 1 y 4 rayas (encima o debajo).",
            " Haz clic SOLO en las letras 'd' que tengan EXACTAMENTE 2 rayas en total.",
            " Tienes 15 segundos por línea. El test pasa solo cuando se acaba el tiempo.",
            " Puedes marcar y desmarcar las que quieras antes de que termine la línea."
        ]
    },
    {
        "id": "cpt",
        "nombre": "Continuous Performance Test (CPT)",
        "categoria": "atencion",
        "habilidades": ["atencion_sostenida", "control_inhibitorio", "atencion_selectiva", "velocidad_cognitiva"],
        "duracion": "~1 min",
        "descripcion": "Herramienta neuropsicológica que evalúa la atención sostenida, la impulsividad y el control. Fue creada para detectar daño cerebral y trastornos como la esquizofrenia o TDAH. Evalúa la capacidad de concentración ante estímulos repetitivos mediante pulsaciones o no pulsaciones tras ver letras en pantalla.",
        "resumen": "Pulsa solo cuando veas 'X' precedida de 'A'. Todo lo demás, ignóralo.",
        "imagen": "assets/tests/cpt.jpg",
        "url": "tests/cpt-page.html",
        "completado": false,
        "heroEyebrow": "Vigilancia sostenida",
        "bloques": [
            " Aparecerán 40 letras, una cada segundo.",
            " Solo debes pulsar el botón cuando veas una 'X'.",
            " Pero OJO: la 'X' solo cuenta si la letra anterior era una 'A'.",
            " Si pulsas cuando no toca → error de comisión (impulsividad).",
            " Si no pulsas cuando tocaba → error de omisión (falta de atención)."
        ]
    },
    {
        "id": "corsi",
        "nombre": "Corsi Block-Tapping Test (CBT)",
        "categoria": "memoria",
        "habilidades": ["memoria_espacial", "memoria_trabajo", "atencion_selectiva"],
        "duracion": "~3 min",
        "descripcion": "Herramienta neuropsicológica utilizada para evaluar habilidades visuoespaciales y capacidad de memoria de trabajo. El participante debe tocar los bloques en el mismo orden en que se iluminaron. Es un método que puede evaluar diferentes funciones cognitivas en entornos de investigación.",
        "resumen": "Memoriza y repite el orden en que se iluminan los bloques.",
        "imagen": "assets/tests/corsi.jpg",
        "url": "tests/corsi-page.html",
        "completado": false,
        "heroEyebrow": "Memoria espacial",
        "bloques": [
            " Observa los 9 bloques que se iluminan, uno tras otro.",
            " Después, pulsa los mismos bloques en el MISMO orden.",
            " Si aciertas, la siguiente secuencia tendrá un bloque más.",
            " Si fallas dos veces seguidas, el test termina."
        ]
    },
    {
        "id": "tower-of-london",
        "nombre": "Tower of London",
        "categoria": "control",
        "habilidades": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
        "duracion": "~4 min",
        "descripcion": "Test neuropsicológico para evaluar fallos en la planificación ejecutiva. Está muy relacionada con el rompecabezas de la torre de Hanói. Se trata de conseguir configurar un tablero desordenado según un tablero ejemplo, moviendo solo la bola que está en la cima de cada varilla.",
        "resumen": "Reorganiza las bolas para igualar la configuración objetivo, pensando bien cada movimiento.",
        "imagen": "assets/tests/tol.jpg",
        "url": "tests/tower-of-london-page.html",
        "completado": false,
        "heroEyebrow": "Planificación ejecutiva",
        "bloques": [
            " Memoriza la configuración objetivo (la de abajo) durante 3 segundos.",
            " Tus bolas están al principio todas en la varilla izquierda.",
            " Solo puedes mover la bola que está ARRIBA de cada varilla.",
            " Tienes tiempo límite por nivel: 10s, 20s y 30s.",
            " Completa los 3 niveles para obtener la puntuación máxima."
        ]
    },
    {
        "id": "wcst",
        "nombre": "Wisconsin Card Sorting Test (WCST)",
        "categoria": "control",
        "habilidades": ["flexibilidad_cognitiva", "control_inhibitorio", "memoria_trabajo"],
        "duracion": "~5 min",
        "descripcion": "Evaluación neurológica que mide el pensamiento abstracto y la flexibilidad cognitiva, crucial para adaptarse a reglas cambiantes. Los participantes tienen que clasificar tarjetas según colores, formas y cantidades según una regla no establecida que deben deducir, y que cambia sin previo aviso.",
        "resumen": "Descubre la regla oculta y adáptate cuando cambie sin previo aviso.",
        "imagen": "assets/tests/wcst.png",
        "url": "tests/wcst-page.html",
        "completado": false,
        "heroEyebrow": "Flexibilidad cognitiva",
        "bloques": [
            " Hay 4 cartas fijas: rojo triángulo, verde estrella, amarillo cruz, azul círculo.",
            " Te llega una carta. Decide con cuál de las 4 fijas coincide.",
            " El test te dirá si has acertado o no. Así descubrirás la regla.",
            " Cuando lleves 10 aciertos seguidos, la regla cambiará sin avisar.",
            " Debes detectar el cambio por ti mismo y adaptarte."
        ]
    },
    {
        "id": "stroop",
        "nombre": "Stroop Test",
        "categoria": "atencion",
        "habilidades": ["atencion_dividida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "~2 min",
        "descripcion": "Aparece la palabra 'ROJO' escrita en tinta azul. Tu cerebro quiere leer la palabra automáticamente, pero debes ignorarla y fijarte solo en el color de la tinta. Cuando la palabra y el color no coinciden, el cerebro entra en conflicto. Mide con qué eficacia puedes bloquear una respuesta automática para hacer lo correcto.",
        "resumen": "Selecciona el color de la tinta, sin dejarte llevar por lo que dice la palabra.",
        "imagen": "assets/tests/stroop.jpg",
        "url": "tests/stroop-page.html",
        "completado": false,
        "heroEyebrow": "Control bajo interferencia",
        "bloques": [
            " Verás una palabra de color escrita en una tinta de otro color.",
            " Ignora completamente lo que dice la palabra.",
            " Pulsa el botón del COLOR de la tinta (rojo, verde, azul o amarillo).",
            " 20 ensayos. Algunos son fáciles (palabra y tinta coinciden).",
            " Los difíciles son cuando NO coinciden. Ahí se mide tu control."
        ]
    },
    {
        "id": "digit-span",
        "nombre": "Digit Span",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida"],
        "duracion": "~3 min",
        "descripcion": "Aparece una secuencia de números durante unos segundos y desaparece. Tú debes escribirlos en el mismo orden. Con cada acierto, la secuencia se alarga. La longitud máxima que alguien puede retener (amplitud de dígitos) es uno de los indicadores más fiables de la memoria de trabajo, que usas para razonar, calcular y seguir conversaciones.",
        "resumen": "Memoriza y repite la secuencia de números que aparece en pantalla.",
        "imagen": "assets/tests/digitspan.png",
        "url": "tests/digit-span-page.html",
        "completado": false,
        "heroEyebrow": "Amplitud de memoria activa",
        "bloques": [
            " Aparecerá una secuencia de números (ej: 3 5 2 8).",
            " Memorízala durante 3 segundos.",
            " Después escríbela en el mismo orden (ej: 3528).",
            " Si aciertas, la siguiente secuencia tendrá un número más.",
            " Si fallas dos veces, el test termina."
        ]
    },
    {
        "id": "tmt",
        "nombre": "Trail Making Test A/B",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "coordinacion_visomotora", "atencion_dividida", "atencion_sostenida", "control_inhibitorio", "flexibilidad_cognitiva"],
        "duracion": "~3 min",
        "descripcion": "Dos partes cronometradas. Antes de empezar cada parte se te indica el número o letra por el que debes arrancar, y siempre debes seguir el orden ascendente. En la parte B alternas números y letras (1→A→2→B...), lo que obliga al cerebro a gestionar dos secuencias a la vez. La diferencia de tiempo entre ambas partes es la medida más directa de flexibilidad mental.",
        "resumen": "Conecta en orden ascendente desde el punto de inicio que te indican.",
        "imagen": "assets/tests/tmt.png",
        "url": "tests/tmt-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad y flexibilidad mental",
        "bloques": [
            " Se te dice el número o letra por el que debes empezar en cada parte.",
            " Parte A: conecta los 8 números en orden ascendente.",
            " Parte B: alterna número y letra en orden ascendente.",
            " Ambas partes cronometradas. Hazlo lo más rápido posible.",
            " La diferencia de tiempo entre A y B mide tu flexibilidad mental."
        ]
    },
    {
        "id": "symbol-search",
        "nombre": "Symbol Search",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "coordinacion_visomotora", "atencion_selectiva", "atencion_sostenida"],
        "duracion": "~2 min",
        "descripcion": "Ves un símbolo objetivo y varias opciones. Debes elegir cuál es idéntica al objetivo. La dificultad aumenta a lo largo del test: empiezas con 2 opciones, subes a 3 y terminas con 4 entre las que elegir. Los símbolos son abstractos y parecidos. Mide la velocidad con la que tu cerebro compara información visual y decide.",
        "resumen": "Identifica cuál de las opciones es igual al símbolo objetivo.",
        "imagen": "assets/tests/symbol.png",
        "url": "tests/symbol-search-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad de procesamiento visual",
        "bloques": [
            " Aparece un símbolo objetivo arriba.",
            " Abajo tienes varias opciones.",
            " Pulsa la opción que sea IDÉNTICA al objetivo.",
            " 20 ensayos. La dificultad sube: 2 opciones, luego 3, luego 4."
        ]
    },
    {
        "id": "nback",
        "nombre": "N-Back",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "~4 min",
        "descripcion": "Aparecen números uno a uno. Primero en nivel 1-back: debes pulsar si el número actual es igual al anterior. Luego en nivel 2-back: debes compararlo con el de hace dos posiciones. Mientras avanza la secuencia, tienes que mantener los últimos números en mente y actualizar esa memoria constantemente. Está considerado uno de los mejores entrenamientos de memoria de trabajo.",
        "resumen": "Pulsa cuando el número actual coincida con el de 1 (o 2) posiciones atrás.",
        "imagen": "assets/tests/n_back.png",
        "url": "tests/nback-page.html",
        "completado": false,
        "heroEyebrow": "Memoria de trabajo activa",
        "bloques": [
            " Aparece un número nuevo cada 1.5-2 segundos.",
            " Nivel 1: pulsa COINCIDE si el número es igual al ANTERIOR.",
            " Nivel 2: pulsa COINCIDE si el número es igual al de HACE 2 POSICIONES.",
            " Tienes que mantener actualizada la secuencia en tu mente.",
            " 20 números por nivel. Pasa al nivel 2 si superas el nivel 1."
        ]
    },
    {
        "id": "gng",
        "nombre": "Go/No-Go Test",
        "categoria": "control",
        "habilidades": ["control_inhibitorio", "atencion_sostenida", "velocidad_cognitiva"],
        "duracion": "~1 min",
        "descripcion": "Aparecen 'X' o 'O' una a una, bastante rápido. Regla sencilla: pulsa cuando veas una 'X', no pulses si ves una 'O'. El ritmo y la repetición hacen que el cerebro quiera pulsar por inercia aunque salga una 'O'. Eso es exactamente lo que mide: tu capacidad de frenar un impulso cuando toca. Es el test más directo de control de impulsos.",
        "resumen": "Pulsa en la 'X', pero no en la 'O'.",
        "imagen": "assets/tests/gonogo.jpg",
        "url": "tests/gng-page.html",
        "completado": false,
        "heroEyebrow": "Control de impulsos",
        "bloques": [
            " Aparecerán 30 letras: 'X' o 'O'.",
            " Pulsa el botón cuando veas una 'X'.",
            " NO pulses cuando veas una 'O'.",
            " Tienes 1 segundo para responder cada letra.",
            " Se mide cuántas aciertas, cuántas pulsas sin deber y cuántas se te pasan."
        ]
    }
];

function normalizeTestKey(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getCatalogoTests() {
    const perfil = window.getperfil();
    // Asegurar que testsCompletados existe
    const testsCompletados = perfil?.testsCompletados || {};

    return CATALOGO_TESTS.map(test => ({
        ...test,
        // Solo marcar como completado si está explícitamente en testsCompletados
        completado: testsCompletados[test.id] === true
    }));
}
function getTestById(testId) {
    const normalizedId = normalizeTestKey(testId);

    return CATALOGO_TESTS.find(test => {
        if (normalizeTestKey(test.id) === normalizedId) return true;
        if (normalizeTestKey(test.nombre) === normalizedId) return true;
        return (test.aliases || []).some(alias => normalizeTestKey(alias) === normalizedId);
    }) || null;
}

// ========== EXPORTS GLOBALES ==========
window.CATALOGO_TESTS = CATALOGO_TESTS;
window.getCatalogoTests = getCatalogoTests;
window.getTestById = getTestById;
window.normalizeTestKey = normalizeTestKey;

// También exportar para que esté disponible inmediatamente
if (typeof CATALOGO_TESTS !== 'undefined') {
    console.log("✅ catalogoTests.js cargado correctamente:", CATALOGO_TESTS.length, "tests");
}