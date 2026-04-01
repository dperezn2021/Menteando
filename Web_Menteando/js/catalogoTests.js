const CATALOGO_TESTS = [
    {
        id: "d2",
        nombre: "Test d2",
        categoria: "atencion",
        habilidad: "Atencion selectiva",
        duracion: "5 min",
        descripcion: "Evalua atencion selectiva, velocidad de procesamiento y precision al discriminar estimulos visuales.",
        resumen: "Te ayuda a detectar si flojeas en concentracion sostenida, velocidad y control de distractores.",
        imagen: "assets/img/ilustracion-cognitiva.png",
        url: "tests/d2-page.html",
        destacado: true,
        heroEyebrow: "Evaluacion recomendada",
        bloques: [
            "14 lineas con letras d y p",
            "Debes marcar la letra d que tenga 2 lineas cortas",
            "20 segundos por linea",
            "Obliga a seleccionar estimulos relevantes e inhibir los irrelevantes"
        ]
    },
    {
        id: "cpt",
        nombre: "Continuous Performance Task",
        categoria: "atencion",
        habilidad: "Atencion sostenida",
        duracion: "8 min",
        descripcion: "Mide atencion sostenida, impulsividad y control frente a estimulos repetitivos.",
        resumen: "Sirve para ver si te cuesta mantener la concentracion o inhibir respuestas automaticas.",
        imagen: "assets/img/nabri-tareas.PNG",
        url: "tests/cpt-page.html",
        destacado: true,
        heroEyebrow: "Test clinico clasico",
        bloques: [
            "Presenta numeros o simbolos en pantalla",
            "Hay ensayos en los que debes pulsar y otros en los que no",
            "Evalua constancia atencional e impulsividad",
            "Es util para analizar fallos de concentracion"
        ]
    },
    {
        id: "corsi",
        nombre: "Corsi Block-Tapping Test",
        categoria: "memoria",
        habilidad: "Memoria de trabajo visuoespacial",
        duracion: "6 min",
        descripcion: "Evalua memoria de trabajo y habilidades visuoespaciales mediante secuencias de bloques.",
        resumen: "Detecta si flojeas al retener y reproducir posiciones o secuencias espaciales.",
        imagen: "assets/img/nabri-entrenando.png",
        url: "tests/corsi-page.html",
        destacado: true,
        heroEyebrow: "Memoria espacial",
        bloques: [
            "Se muestran bloques en una secuencia concreta",
            "Debes repetir el mismo orden presentado",
            "Puede ampliarse con variantes inversas o crecientes",
            "Mide retencion y manipulacion visuoespacial"
        ]
    },
    {
        id: "tower-of-london",
        nombre: "Tower of London",
        categoria: "control",
        habilidad: "Planificacion ejecutiva",
        duracion: "10 min",
        descripcion: "Prueba neuropsicologica para evaluar planificacion, control ejecutivo y anticipacion de movimientos.",
        resumen: "Permite detectar si te cuesta organizar pasos, prever errores o resolver problemas secuenciales.",
        imagen: "assets/img/logo2.png",
        url: "tests/tower-of-london-page.html",
        destacado: true,
        heroEyebrow: "Funcion ejecutiva",
        bloques: [
            "Debes reproducir una configuracion objetivo",
            "Trabaja con movimientos limitados y reglas fijas",
            "Esta relacionada con la Torre de Hanoi",
            "Evalua planificacion antes de actuar"
        ]
    }
];

function getCatalogoTests() {
    return CATALOGO_TESTS.map((test) => ({ ...test, bloques: [...test.bloques] }));
}

function getTestById(testId) {
    return CATALOGO_TESTS.find((test) => test.id === testId) || null;
}

window.catalogoTests = getCatalogoTests();
window.getCatalogoTests = getCatalogoTests;
window.getTestById = getTestById;
