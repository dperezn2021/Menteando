const CATALOGO_TESTS = [
    {
        "id": "d2",
        "nombre": "Test d2 de Atención",
        "categoria": "atencion",
        "habilidades": ["atencion_selectiva", "atencion_sostenida", "control_inhibitorio"],
        "duracion": "8 min",
        "descripcion": "Debes marcar rápidamente todas las letras 'd' que tengan exactamente dos rayas, ignorando las 'p' y las 'd' con otra cantidad de rayas. Cada línea tiene un tiempo límite, lo que mide tu precisión bajo presión.",
        "resumen": "Marca las 'd' con dos rayas.",
        "imagen": "assets/tests/d2.jpg",
        "url": "tests/d2-page.html",
        "completado": false,
        "heroEyebrow": "Atención selectiva",
        "bloques": ["Aparecen líneas de letras 'd' y 'p' con distintas rayas.", "Solo debes hacer clic en las 'd' con DOS rayas.", "Cada línea dura 20 segundos.", "Se mide tu precisión y capacidad de inhibición."]
    },
    {
        "id": "cpt",
        "nombre": "Continuous Performance Test (CPT)",
        "categoria": "atencion",
        "habilidades": ["atencion_sostenida", "control_inhibitorio", "atencion_selectiva", "velocidad_cognitiva"],
        "duracion": "12 min",
        "descripcion": "Presiona ESPACIO solo cuando aparezca una 'X' después de una 'A'. Mide vigilancia y control inhibitorio.",
        "resumen": "Pulsa ESPACIO solo tras ver 'X' precedida de 'A'.",
        "imagen": "assets/tests/cpt.jpg",
        "url": "tests/cpt-page.html",
        "completado": false,
        "heroEyebrow": "Vigilancia e inhibición",
        "bloques": ["Cada segundo aparece una letra mayúscula.", "Debes recordar la letra anterior.", "Objetivo: 'X' después de 'A'.", "Se registran aciertos, omisiones y comisiones."]
    },
    {
        "id": "corsi",
        "nombre": "Corsi Block-Tapping Test",
        "categoria": "memoria",
        "habilidades": ["memoria_espacial", "memoria_trabajo", "atencion_selectiva"],
        "duracion": "7 min",
        "descripcion": "Repite la secuencia de bloques que se iluminan en el mismo orden. La dificultad aumenta progresivamente.",
        "resumen": "Reproduce la secuencia de bloques.",
        "imagen": "assets/tests/corsi.jpg",
        "url": "tests/corsi-page.html",
        "completado": false,
        "heroEyebrow": "Memoria espacial",
        "bloques": ["Nueve bloques en cuadrícula.", "Se ilumina una secuencia.", "Toca los bloques en el mismo orden.", "Dos errores terminan el test."]
    },
    {
        "id": "tower-of-london",
        "nombre": "Tower of London",
        "categoria": "control",
        "habilidades": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
        "duracion": "10 min",
        "descripcion": "Mueve las bolas de colores para igualar una configuración objetivo. Solo puedes mover la bola superior de cada varilla.",
        "resumen": "Iguala la configuración objetivo en el menor número de movimientos.",
        "imagen": "assets/tests/tol.jpg",
        "url": "tests/tower-of-london-page.html",
        "completado": false,
        "heroEyebrow": "Planificación ejecutiva",
        "bloques": ["Tres varillas con bolas apilables.", "Selecciona varilla origen, luego destino.", "El objetivo cambia en cada nivel.", "Se evalúa eficiencia de movimientos."]
    },
    {
        "id": "wcst",
        "nombre": "Wisconsin Card Sorting Test",
        "categoria": "control",
        "habilidades": ["flexibilidad_cognitiva", "control_inhibitorio", "memoria_trabajo"],
        "duracion": "12 min",
        "descripcion": "Clasifica cada carta según una regla oculta (color, forma o número). La regla cambia tras 10 aciertos consecutivos sin aviso.",
        "resumen": "Deduce la regla y adáptate a los cambios.",
        "imagen": "assets/tests/wcst.png",
        "url": "tests/wcst-page.html",
        "completado": false,
        "heroEyebrow": "Flexibilidad cognitiva",
        "bloques": ["Cuatro cartas de estímulo fijas.", "Cada carta de respuesta tiene color, forma y número.", "Elige con qué carta de estímulo coincide.", "La regla cambia silenciosamente cada 10 aciertos."]
    },

    {
        "id": "mec",
        "nombre": "Mini-Examen Cognoscitivo de Lobo",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "planificacion", "velocidad_cognitiva", "flexibilidad_cognitiva", "control_inhibitorio"],
        "duracion": "12 min",
        "descripcion": "Versión digital del Mini-Examen Cognoscitivo de Lobo (30 puntos). Evalúa orientación, memoria, cálculo y lenguaje sin necesidad de elementos físicos.",
        "resumen": "Evalúa funciones cognitivas globales mediante preguntas de orientación, memoria y lenguaje.",
        "imagen": "assets/tests/mec.jpg",
        "url": "tests/mec-page.html",
        "completado": false,
        "heroEyebrow": "Cribado cognitivo",
        "bloques": [
            "Orientación temporal y espacial.",
            "Fijación y memoria diferida.",
            "Cálculo.",
            "Lenguaje: comprensión, repetición, fluencia verbal y antónimos."
        ]
    },
    {
        "id": "tavec",
        "nombre": "TAVEC – Test de Aprendizaje Verbal España-Complutense",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "planificacion", "atencion_sostenida", "flexibilidad_cognitiva"],
        "duracion": "15 min",
        "descripcion": "Aprende una lista de 16 palabras en 5 ensayos, luego lista de interferencia, recuerdo inmediato, demorado y reconocimiento.",
        "resumen": "Evalúa aprendizaje verbal, interferencia y olvido.",
        "imagen": "assets/tests/tavec.jpg",
        "url": "tests/tavec-page.html",
        "completado": false,
        "heroEyebrow": "Memoria verbal episódica",
        "bloques": ["Cinco ensayos de aprendizaje.", "Lista de interferencia.", "Recuerdo inmediato.", "Espera 20 segundos.", "Recuerdo demorado.", "Reconocimiento entre distractores."]
    },
    {
        "id": "stroop",
        "nombre": "Stroop Test",
        "categoria": "atencion",
        "habilidades": ["atencion_dividida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "6 min",
        "descripcion": "Di el color de la tinta, ignora el significado de la palabra. Mide control inhibitorio y resistencia a la interferencia.",
        "resumen": "Selecciona el color de la tinta, no la palabra.",
        "imagen": "assets/tests/stroop.jpg",
        "url": "tests/stroop-page.html",
        "completado": false,
        "heroEyebrow": "Interferencia cognitiva",
        "bloques": ["Palabra de color en tinta diferente.", "Botones con nombres de colores.", "Ensayo congruente o incongruente.", "Se mide tiempo y precisión."]
    },
    {
        "id": "digit-span",
        "nombre": "Digit Span",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida"],
        "duracion": "5 min",
        "descripcion": "Repite la secuencia de números en el mismo orden. La longitud aumenta con cada acierto.",
        "resumen": "Repite los números en el mismo orden.",
        "imagen": "assets/tests/digitspan.png",
        "url": "tests/digit-span-page.html",
        "completado": false,
        "heroEyebrow": "Memoria activa",
        "bloques": ["Aparece una serie de números.", "Desaparece tras 2 segundos.", "Escribe los números en el mismo orden.", "Dos errores terminan el test."]
    },
    {
        "id": "tmt",
        "nombre": "Trail Making Test A/B",
        "categoria": "reflejos",
        "habilidades": [ "velocidad_cognitiva", "coordinacion_visomotora", "atencion_dividida", "atencion_sostenida","control_inhibitorio", "flexibilidad_cognitiva",],
        "duracion": "6 min",
        "descripcion": "Parte A: conecta números en orden. Parte B: alterna números y letras (1-A-2-B...).",
        "resumen": "Conecta en orden ascendente o alternando números y letras.",
        "imagen": "assets/tests/tmt.png",
        "url": "tests/tmt-page.html",
        "completado": false,
        "heroEyebrow": "Flexibilidad y velocidad",
        "bloques": ["TMT-A: 1→2→3→...→8.", "TMT-B: 1→A→2→B→3→C→4→D.", "Se cronometra cada parte.", "Evalúa flexibilidad cognitiva, velocidad, coordinación visomotora y atención dividida."]
    },
    {
        "id": "symbol-search",
        "nombre": "Symbol Search",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "coordinacion_visomotora","atencion_selectiva", "atencion_sostenida"],
        "duracion": "4 min",
        "descripcion": "Decide cuál de dos opciones es igual al símbolo objetivo. Mide velocidad de procesamiento visual.",
        "resumen": "Encuentra el símbolo igual al objetivo.",
        "imagen": "assets/tests/symbol.png",
        "url": "tests/symbol-search-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad perceptiva",
        "bloques": ["Objetivo y dos opciones.", "Haz clic en la opción idéntica.", "20 ensayos.", "Se mide aciertos y tiempo total."]
    },
    {
        "id": "nback",
        "nombre": "N-Back",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "8 min",
        "descripcion": "Presiona ESPACIO si el número actual es igual al de hace 1 posición (1-back). Luego 2-back. Mide memoria de trabajo y atención.",
        "resumen": "Pulsa ESPACIO si coincide con el de hace 1 (y luego 2) posiciones.",
        "imagen": "assets/tests/n_back.png",
        "url": "tests/nback-page.html",
        "completado": false,
        "heroEyebrow": "Memoria dinámica",
        "bloques": ["Secuencia de números (1 por segundo).", "1-back: igual al inmediato anterior.", "2-back: igual al de hace dos.", "Se registra precisión."]
    },
    {
        "id": "gng",
        "nombre": "Go/No-Go Test",
        "categoria": "control",
        "habilidades": ["control_inhibitorio", "atencion_sostenida", "velocidad_cognitiva"],
        "duracion": "2 min",
        "descripcion": "Pulsa cuando veas una 'X', no pulses si la letra es 'O'. Mide inhibición motora.",
        "resumen": "Pulsa en las 'X', ignora las 'O'.",
        "imagen": "assets/tests/gonogo.jpg",
        "url": "tests/gng-page.html",
        "completado": false,
        "heroEyebrow": "Inhibición motora",
        "bloques": ["Pulsa en la 'X'.", "No pulses en 'O'.", "Tienes 1 segundo para responder.", "Se cuenta aciertos, comisiones y omisiones."]
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
    const testsCompletados = perfil?.testsCompletados || {};
    return CATALOGO_TESTS.map(test => ({
        ...test,
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