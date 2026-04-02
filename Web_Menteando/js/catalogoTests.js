const CATALOGO_TESTS = [
    {
        id: "pfeiffer",
        nombre: "Test de Pfeiffer",
        categoria: "memoria",
        habilidades: ["memoria_trabajo"],
        duracion: "5 min",
        descripcion: "Cuestionario breve de 10 ítems diseñado para detectar deterioro cognitivo en adultos mayores. Evalúa orientación temporal y espacial, memoria inmediata, información general y cálculo mental. Es una herramienta de cribado ampliamente utilizada en atención primaria y geriatría para identificar deterioro cognitivo de forma rápida y fiable.",
        resumen: "Evalúa orientación, memoria inmediata y cálculo para detectar deterioro cognitivo.",
        imagen: "assets/tests/pfeiffer.png",
        url: "tests/pfeiffer-page.html",
        completado: false,
        heroEyebrow: "Cribado cognitivo breve",
        bloques: [
            "10 preguntas breves de orientación, memoria e información general",
            "Se suma 1 punto por cada error cometido",
            "A mayor puntuación, mayor deterioro cognitivo",
            "Útil para cribado rápido en población mayor"
        ]
    },

    {
        id: "tavec",
        nombre: "TAVEC",
        categoria: "memoria",
        habilidades: ["memoria_trabajo"],
        duracion: "15-20 min",
        descripcion: "Prueba neuropsicológica que evalúa memoria episódica verbal mediante el aprendizaje repetido de una lista de palabras. Incluye recuerdo inmediato, recuerdo demorado, lista de interferencia y reconocimiento. Permite diferenciar entre fallos de atención, almacenamiento o recuperación, y es una de las herramientas más completas para estudiar el aprendizaje verbal.",
        resumen: "Evalúa memoria verbal episódica y estrategias de aprendizaje.",
        imagen: "assets/tests/tavec.png",
        url: "tests/tavec-page.html",
        completado: false,
        heroEyebrow: "Memoria verbal episódica",
        bloques: [
            "5 ensayos de aprendizaje de una lista de 16 palabras",
            "Lista de interferencia para evaluar distracción",
            "Recuerdo inmediato y demorado",
            "Reconocimiento entre distractores"
        ]
    },

    {
        id: "corsi",
        nombre: "Corsi Block-Tapping Test",
        categoria: "memoria",
        habilidades: ["memoria_espacial", "memoria_trabajo", "velocidad_cognitiva", "atencion_sostenida"],
        duracion: "5-10 min",
        descripcion: "Evalúa memoria de trabajo visuoespacial mediante la reproducción de secuencias de bloques. Es una de las pruebas más utilizadas para medir la capacidad de retener y manipular información espacial en tiempo real. Permite detectar dificultades en la memoria visuoespacial y en la manipulación activa de secuencias.",
        resumen: "Evalúa memoria visuoespacial y retención de secuencias.",
        imagen: "assets/tests/corsi.png",
        url: "tests/corsi-page.html",
        completado: false,
        heroEyebrow: "Memoria visuoespacial",
        bloques: [
            "Secuencias de bloques iluminados",
            "Repetición en el mismo orden",
            "Variantes inversas o crecientes",
            "Evalúa retención y manipulación espacial"
        ]
    },

    {
        id: "d2",
        nombre: "Test d2",
        categoria: "atencion",
        habilidades: ["atencion_selectiva", "velocidad_cognitiva", "control_inhibitorio"],
        duracion: "5 min",
        descripcion: "Herramienta clásica para evaluar atención selectiva, velocidad de procesamiento y precisión bajo presión temporal. El participante debe discriminar estímulos relevantes entre distractores, manteniendo rapidez y exactitud. Es uno de los tests más utilizados para medir concentración y control de interferencias.",
        resumen: "Evalúa atención selectiva, velocidad y precisión.",
        imagen: "assets/tests/d2.png",
        url: "tests/d2-page.html",
        completado: false,
        heroEyebrow: "Atención selectiva visual",
        bloques: [
            "14 líneas de estímulos con letras d y p",
            "Marcar únicamente las 'd' con dos rayas",
            "20 segundos por línea",
            "Evalúa velocidad, precisión e inhibición de distractores"
        ]
    },

    {
        id: "cpt",
        nombre: "Continuous Performance Task",
        categoria: "atencion",
        habilidades: ["atencion_sostenida", "control_inhibitorio"],
        duracion: "8-15 min",
        descripcion: "Prueba neuropsicológica diseñada para evaluar atención sostenida, impulsividad y control inhibitorio. El participante debe responder o inhibir respuesta ante estímulos repetitivos durante un periodo prolongado. Es una herramienta clave para estudiar TDAH, fallos de vigilancia y problemas de constancia atencional.",
        resumen: "Evalúa atención sostenida e impulsividad.",
        imagen: "assets/tests/cpt.png",
        url: "tests/cpt-page.html",
        completado: false,
        heroEyebrow: "Atención sostenida continua",
        bloques: [
            "Presentación continua de números o símbolos",
            "Responder solo a estímulos objetivo",
            "Inhibir respuesta ante estímulos no objetivo",
            "Evalúa vigilancia, constancia e impulsividad"
        ]
    },

    {
        id: "tower-of-london",
        nombre: "Tower of London",
        categoria: "control",
        habilidades: ["planificacion"],
        duracion: "10 min",
        descripcion: "Prueba neuropsicológica que evalúa planificación ejecutiva, control de secuencias y capacidad para anticipar consecuencias. El participante debe reproducir una configuración objetivo siguiendo reglas estrictas de movimiento. Es una medida clásica de la capacidad de planificar antes de actuar.",
        resumen: "Evalúa planificación y control ejecutivo.",
        imagen: "assets/tests/tol.png",
        url: "tests/tol-page.html",
        completado: false,
        heroEyebrow: "Planificación ejecutiva",
        bloques: [
            "Reproducir una configuración objetivo",
            "Movimientos limitados por reglas fijas",
            "Relacionada con la Torre de Hanói",
            "Evalúa anticipación y organización de pasos"
        ]
    },

    {
        id: "wcst",
        nombre: "Wisconsin Card Sorting Test",
        categoria: "control",
        habilidades: ["flexibilidad_cognitiva"],
        duracion: "15-20 min",
        descripcion: "Prueba clásica que evalúa flexibilidad cognitiva, razonamiento abstracto y capacidad para adaptarse a reglas cambiantes. El participante debe descubrir la regla de clasificación y ajustarse cuando esta cambia sin aviso. Es una de las herramientas más sensibles para detectar rigidez cognitiva.",
        resumen: "Evalúa flexibilidad cognitiva y razonamiento.",
        imagen: "assets/tests/wcst.png",
        url: "tests/wcst-page.html",
        completado: false,
        heroEyebrow: "Flexibilidad cognitiva",
        bloques: [
            "Clasificar tarjetas por color, forma o número",
            "La regla cambia sin aviso",
            "Evalúa razonamiento abstracto",
            "Detecta perseveración y rigidez cognitiva"
        ]
    },

    {
        id: "mec",
        nombre: "Mini-Examen Cognoscitivo (MEC)",
        categoria: "memoria",
        habilidades: ["memoria_trabajo", "atencion_sostenida"],
        duracion: "10 min",
        descripcion: "Versión española del MMSE, utilizada como herramienta de cribado para detectar deterioro cognitivo. Evalúa orientación temporal y espacial, memoria inmediata, cálculo, atención, lenguaje y praxias. Es una prueba rápida y ampliamente utilizada en contextos clínicos.",
        resumen: "Evalúa orientación, memoria, cálculo y lenguaje.",
        imagen: "assets/tests/mec.png",
        url: "tests/mec-page.html",
        completado: false,
        heroEyebrow: "Cribado cognitivo global",
        bloques: [
            "Orientación temporal y espacial",
            "Memoria inmediata y diferida",
            "Cálculo y atención",
            "Lenguaje y praxias"
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
    return CATALOGO_TESTS.map((test) => ({ ...test, bloques: [...test.bloques] }));
}

function getTestById(testId) {
    const normalizedId = normalizeTestKey(testId);

    return CATALOGO_TESTS.find(test => {
        if (normalizeTestKey(test.id) === normalizedId) return true;
        if (normalizeTestKey(test.nombre) === normalizedId) return true;
        return (test.aliases || []).some(alias => normalizeTestKey(alias) === normalizedId);
    }) || null;
}


window.catalogoTests = getCatalogoTests();
window.getCatalogoTests = getCatalogoTests;
window.getTestById = getTestById;
