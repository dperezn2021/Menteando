const CATALOGO_TESTS = [
    {
        "id": "d2",
        "nombre": "Test d2 de Atención",
        "categoria": "atencion",
        "habilidades": ["atencion_selectiva", "velocidad_cognitiva", "control_inhibitorio"],
        "duracion": "8 min",
        "descripcion": "Debes marcar rápidamente todas las letras 'd' que tengan exactamente dos rayas, ignorando las 'p' y las 'd' con otra cantidad de rayas. Cada línea tiene un tiempo límite, lo que mide tu velocidad de procesamiento y precisión bajo presión.",
        "resumen": "Marca las 'd' con dos rayas, evita las 'p' y otros distractores.",
        "imagen": "assets/tests/d2.png",
        "url": "tests/d2-page.html",
        "completado": false,
        "heroEyebrow": "Atención selectiva",
        "bloques": [
            "Aparecen líneas de letras 'd' y 'p' con distintas rayas.",
            "Solo debes hacer clic en las 'd' que tengan **dos rayas**.",
            "Cada línea se muestra durante 20 segundos.",
            "Se evalúa tu velocidad (cuántos estímulos procesas) y tu precisión (aciertos vs errores)."
        ]
    },
    {
        "id": "cpt",
        "nombre": "Continuous Performance Test (CPT)",
        "categoria": "atencion",
        "habilidades": ["atencion_sostenida", "control_inhibitorio", "atencion_selectiva", "velocidad_cognitiva"],
        "duracion": "12 min",
        "descripcion": "Se mostrarán una tras otra letras mayúsculas. Debes presionar la barra espaciadora **solo cuando aparezca una 'X' y la letra anterior sea una 'A'**. En cualquier otro caso (incluyendo 'X' sin 'A' previa), no debes pulsar. El test mide tu capacidad de mantener la atención durante un periodo prolongado y de inhibir respuestas impulsivas.",
        "resumen": "Pulsa ESPACIO solo cuando veas una 'X' después de una 'A'.",
        "imagen": "assets/tests/cpt.png",
        "url": "tests/cpt-page.html",
        "completado": false,
        "heroEyebrow": "Vigilancia e inhibición",
        "bloques": [
            "Cada segundo aparece una letra mayúscula aleatoria.",
            "Debes recordar siempre la letra anterior.",
            "Solo se considera objetivo si la letra actual es 'X' y la anterior 'A'.",
            "Se registran aciertos, omisiones (no pulsar cuando tocaba) y comisiones (pulsar cuando no tocaba)."
        ]
    },
    {
        "id": "corsi",
        "nombre": "Corsi Block-Tapping Test",
        "categoria": "memoria",
        "habilidades": ["memoria_espacial", "memoria_trabajo", "atencion_selectiva"],
        "duracion": "7 min",
        "descripcion": "Se iluminan una serie de bloques en una secuencia. Debes repetir la secuencia tocando los bloques en el **mismo orden**. Cada nivel aumenta la longitud de la secuencia. El test evalúa tu memoria visuoespacial y tu capacidad de retener secuencias temporales.",
        "resumen": "Reproduce la secuencia de bloques iluminados en el mismo orden.",
        "imagen": "assets/tests/corsi.png",
        "url": "tests/corsi-page.html",
        "completado": false,
        "heroEyebrow": "Memoria espacial",
        "bloques": [
            "Se muestran 9 bloques en una cuadrícula.",
            "Una secuencia de bloques se ilumina uno tras otro.",
            "Debes hacer clic en los mismos bloques **en el mismo orden**.",
            "Si aciertas, la siguiente secuencia será más larga. Dos errores terminan el test."
        ]
    },
    {
        "id": "tower-of-london",
        "nombre": "Tower of London",
        "categoria": "control",
        "habilidades": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
        "duracion": "10 min",
        "descripcion": "Dispones de tres varillas y tres bolas de colores (rojo, verde, azul). El estado inicial tiene todas las bolas en la primera varilla. Debes mover las bolas (una a la vez, solo la superior de cada varilla) hasta alcanzar una configuración objetivo que se muestra al inicio. El test mide tu capacidad de planificar secuencias de movimientos y de ejecutarlos eficientemente.",
        "resumen": "Mueve las bolas para igualar la configuración objetivo en el menor número de movimientos.",
        "imagen": "assets/tests/tower-of-london.png",
        "url": "tests/tower-of-london-page.html",
        "completado": false,
        "heroEyebrow": "Planificación ejecutiva",
        "bloques": [
            "Tres varillas con capacidad para apilar bolas.",
            "Haz clic en una varilla para seleccionar la bola superior, luego en otra varilla para moverla.",
            "El objetivo es una distribución aleatoria de las tres bolas.",
            "Se compara el número de movimientos realizados con la solución óptima."
        ]
    },
    {
        "id": "wcst",
        "nombre": "Wisconsin Card Sorting Test",
        "categoria": "control",
        "habilidades": ["flexibilidad_cognitiva", "control_inhibitorio", "planificacion", "memoria_trabajo"],
        "duracion": "12 min",
        "descripcion": "Se te muestra una carta con un color, una forma y un número. Tu tarea es clasificarla según una regla oculta (por color, forma o número). Después de cada respuesta, el sistema te dice si es correcta o no. Cada vez que aciertas 5 veces seguidas, la regla cambia sin aviso. El test mide tu capacidad de adaptarte a nuevas reglas y de inhibir la perseveración.",
        "resumen": "Deduce la regla de clasificación y adáptate cuando cambie.",
        "imagen": "assets/tests/wcst.png",
        "url": "tests/wcst-page.html",
        "completado": false,
        "heroEyebrow": "Cambio de criterio",
        "bloques": [
            "Cada carta tiene color, forma y número.",
            "Debes elegir si clasificarla por color, forma o número.",
            "El sistema te dirá si has acertado según la regla oculta.",
            "Cada 5 aciertos consecutivos, la regla cambia sin previo aviso."
        ]
    },
    {
        "id": "mec",
        "nombre": "Mini-Examen Cognoscitivo (MEC)",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "planificacion"],
        "duracion": "10 min",
        "descripcion": "Es una versión adaptada del MMSE que evalúa varias áreas cognitivas: orientación temporal (fecha actual), memoria inmediata (repetición de tres palabras), cálculo (restas sucesivas), memoria diferida (recuerdo de las palabras), y lenguaje (nombrar objetos, repetir una frase, seguir órdenes, escribir una frase y copiar un dibujo). Todas las respuestas se introducen mediante teclado o clics.",
        "resumen": "Responde preguntas de orientación, memoria, cálculo y lenguaje.",
        "imagen": "assets/tests/mec.png",
        "url": "tests/mec-page.html",
        "completado": false,
        "heroEyebrow": "Cribado cognitivo global",
        "bloques": [
            "Orientación temporal (año, mes, día, fecha, estación).",
            "Memoria inmediata (repetir tres palabras).",
            "Cálculo (restar 7 cinco veces desde un número aleatorio).",
            "Memoria diferida (recordar las tres palabras).",
            "Lenguaje (nombrar objetos, repetir frase, seguir orden, escribir frase, copiar dibujo)."
        ]
    },
    {
        "id": "tavec",
        "nombre": "TAVEC – Test de Aprendizaje Verbal España-Complutense",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "memoria_espacial", "planificacion", "atencion_sostenida"],
        "duracion": "15 min",
        "descripcion": "Debes aprender una lista de 16 palabras (generada aleatoriamente cada vez) a lo largo de 5 ensayos. Después de cada ensayo, se te pide que escribas las que recuerdas. Luego se presenta una lista de interferencia (otras palabras) que también debes memorizar. Finalmente, se evalúa el recuerdo inmediato, el recuerdo tras 20 segundos y el reconocimiento entre varias palabras. Mide tu memoria episódica verbal, la curva de aprendizaje y la resistencia a la interferencia.",
        "resumen": "Aprende una lista de palabras, sufre interferencia y luego recuerda.",
        "imagen": "assets/tests/tavec.png",
        "url": "tests/tavec-page.html",
        "completado": false,
        "heroEyebrow": "Memoria verbal episódica",
        "bloques": [
            "Cinco ensayos de aprendizaje de 16 palabras (distintas cada vez).",
            "Después de cada ensayo, escribe las palabras que recuerdas.",
            "A continuación, memoriza una lista de interferencia.",
            "Recuerdo inmediato de la lista original.",
            "Espera 20 segundos y recuerdo demorado.",
            "Finalmente, reconocimiento seleccionando palabras entre distractores."
        ]
    },
    {
        "id": "stroop",
        "nombre": "Stroop Test",
        "categoria": "control",
        "habilidades": ["control_inhibitorio", "velocidad_cognitiva", "atencion_dividida", "memoria_trabajo"],
        "duracion": "6 min",
        "descripcion": "Aparece una palabra escrita en un color de tinta. Debes ignorar el significado de la palabra y seleccionar el color de la tinta. Por ejemplo, si ves la palabra 'ROJO' escrita en color azul, debes responder 'azul'. El test mide tu capacidad de inhibir la respuesta automática de lectura y tu velocidad de procesamiento bajo interferencia.",
        "resumen": "Di el color de la tinta, no la palabra.",
        "imagen": "assets/tests/stroop.png",
        "url": "tests/stroop-page.html",
        "completado": false,
        "heroEyebrow": "Interferencia cognitiva",
        "bloques": [
            "Se muestra una palabra de color (ROJO, VERDE, AZUL, AMARILLO) con un color de tinta aleatorio.",
            "Debes hacer clic en el botón que corresponde al **color de la tinta**, no al significado.",
            "Hay ensayos congruentes (palabra y color coinciden) e incongruentes (difieren).",
            "Se mide la diferencia de tiempo y precisión entre ambos tipos."
        ]
    },
    {
        "id": "digit-span",
        "nombre": "Digit Span",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "planificacion"],
        "duracion": "5 min",
        "descripcion": "Se te muestra una secuencia de dígitos durante unos segundos. Luego debes escribir los dígitos en el **mismo orden**. La longitud de la secuencia aumenta si aciertas, y disminuye si fallas. El test mide tu memoria de trabajo verbal (span de dígitos).",
        "resumen": "Repite la secuencia de números en el mismo orden.",
        "imagen": "assets/tests/digit-span.png",
        "url": "tests/digit-span-page.html",
        "completado": false,
        "heroEyebrow": "Memoria activa",
        "bloques": [
            "Aparece una serie de números (por ejemplo, 3 - 8 - 2).",
            "Después de 2 segundos, la serie desaparece.",
            "Debes escribir los números en el mismo orden en un campo de texto.",
            "Cada acierto aumenta la longitud de la siguiente serie; dos errores terminan el test."
        ]
    },
    {
        "id": "tmt",
        "nombre": "Trail Making Test A/B",
        "categoria": "control",
        "habilidades": ["flexibilidad_cognitiva", "velocidad_cognitiva", "coordinacion_visomotora", "atencion_dividida"],
        "duracion": "6 min",
        "descripcion": "En la parte A, aparecen círculos con números del 1 al 8 en posiciones aleatorias. Debes hacer clic en ellos en orden ascendente (1,2,3...). En la parte B, aparecen números y letras (1, A, 2, B, 3, C, 4, D) y debes alternar entre números y letras (1 → A → 2 → B ...). Se mide el tiempo que tardas en completar cada parte. Evalúa velocidad psicomotora, flexibilidad cognitiva y atención dividida.",
        "resumen": "Conecta los números en orden (A) o alterna números y letras (B).",
        "imagen": "assets/tests/tmt.png",
        "url": "tests/tmt-page.html",
        "completado": false,
        "heroEyebrow": "Flexibilidad y velocidad",
        "bloques": [
            "TMT-A: haz clic en los números del 1 al 8 en orden ascendente.",
            "TMT-B: haz clic alternando: 1, A, 2, B, 3, C, 4, D.",
            "El cronómetro mide el tiempo total de cada parte.",
            "Se evalúa la diferencia de tiempo entre ambas condiciones."
        ]
    },
    {
        "id": "symbol-search",
        "nombre": "Symbol Search",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "atencion_selectiva", "coordinacion_visomotora"],
        "duracion": "4 min",
        "descripcion": "Se te muestra un símbolo objetivo y dos opciones. Debes decidir cuál de las dos opciones es igual al símbolo objetivo. Hay 20 ensayos. El test mide tu velocidad de procesamiento visual y tu capacidad de discriminación rápida.",
        "resumen": "Encuentra qué símbolo coincide con el objetivo.",
        "imagen": "assets/tests/symbol-search.png",
        "url": "tests/symbol-search-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad perceptiva",
        "bloques": [
            "Cada ensayo muestra un símbolo objetivo y dos opciones.",
            "Haz clic en la opción que sea idéntica al objetivo.",
            "Hay 20 ensayos; se mide el número de aciertos y el tiempo total."
        ]
    },
    {
        "id": "nback",
        "nombre": "N-Back",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "8 min",
        "descripcion": "Aparece una secuencia de números uno tras otro. Debes presionar ESPACIO si el número actual es igual al que apareció **hace 1 posición** (1-back). Luego se pasa a 2-back (igual al de hace 2 posiciones). El test mide tu capacidad de actualizar y mantener información en memoria de trabajo mientras ignoras distractores.",
        "resumen": "Pulsa ESPACIO si el número actual es igual al de hace 1 (y luego 2) posiciones.",
        "imagen": "assets/tests/nback.png",
        "url": "tests/nback-page.html",
        "completado": false,
        "heroEyebrow": "Memoria dinámica",
        "bloques": [
            "Cada segundo aparece un número del 0 al 9.",
            "Debes recordar los números anteriores.",
            "Primero se evalúa 1-back: pulsa ESPACIO si el número es igual al inmediatamente anterior.",
            "Luego 2-back: igual al de hace dos posiciones.",
            "Se mide precisión y tiempo de reacción."
        ]
    },
    {
        "id": "gng",
        "nombre": "Go/No-Go Test",
        "categoria": "control",
        "habilidades": ["control_inhibitorio", "atencion_sostenida", "velocidad_cognitiva"],
        "duracion": "5 min",
        "descripcion": "Aparecen estímulos visuales: una 'X' (Go) o una 'O' (No-Go). Debes presionar la barra espaciadora lo más rápido posible cuando veas una 'X', y NO presionar cuando veas una 'O'. El test mide tu capacidad de inhibición motora y tu atención sostenida.",
        "resumen": "Presiona ESPACIO solo cuando veas 'X', ignora la 'O'.",
        "imagen": "assets/tests/gng.png",
        "url": "tests/gng-page.html",
        "completado": false,
        "heroEyebrow": "Inhibición motora",
        "bloques": [
            "Secuencia aleatoria de 30 estímulos (70% 'X', 30% 'O').",
            "Debes pulsar ESPACIO al ver 'X' (Go) y no pulsar al ver 'O' (No-Go).",
            "Se registran aciertos, omisiones (no pulsar en 'X') y comisiones (pulsar en 'O').",
            "También se mide el tiempo de reacción en los aciertos."
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