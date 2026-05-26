const CATALOGO_TESTS = [
    {
        "id": "d2",
        "nombre": "Test d2 de Atención",
        "categoria": "atencion",
        "habilidades": ["atencion_selectiva", "atencion_sostenida", "control_inhibitorio"],
        "duracion": "8 min",
        "descripcion": "Se te presentan 5 líneas llenas de letras 'd' y 'p' con rayas encima y debajo. Tu tarea es marcar solo las 'd' que tengan exactamente dos rayas en total, ignorando todo lo demás. Cada línea dura 10 segundos. Es uno de los tests de atención más utilizados en neuropsicología porque separa con precisión cuánto atinas, cuánto te saltas y cuánto marcas por error.",
        "resumen": "Marca solo las 'd' con exactamente dos rayas antes de que se acabe el tiempo.",
        "imagen": "assets/tests/d2.jpg",
        "url": "tests/d2-page.html",
        "completado": false,
        "heroEyebrow": "Atención selectiva",
        "bloques": ["5 líneas de 30 letras 'd' y 'p', cada una con entre 1 y 4 rayas.", "Solo debes marcar las 'd' con exactamente DOS rayas en total.", "Tienes 10 segundos por línea: el test avanza solo.", "Se mide cuántos aciertos consigues, cuántos te saltas y cuántos marcas por error."]
    },
    {
        "id": "cpt",
        "nombre": "Continuous Performance Test (CPT)",
        "categoria": "atencion",
        "habilidades": ["atencion_sostenida", "control_inhibitorio", "atencion_selectiva", "velocidad_cognitiva"],
        "duracion": "12 min",
        "descripcion": "Aparecen letras sueltas a buen ritmo. Tu única regla: pulsa el botón cuando veas una 'X', pero solo si la letra anterior era una 'A'. Todo lo demás, ignóralo. Parece sencillo al principio, pero mantener la concentración sin equivocarte durante 40 estímulos seguidos es más difícil de lo que parece. Mide tu capacidad de mantener la atención y de evitar respuestas impulsivas.",
        "resumen": "Pulsa solo cuando veas 'X' precedida de 'A'. Todo lo demás, ignóralo.",
        "imagen": "assets/tests/cpt.jpg",
        "url": "tests/cpt-page.html",
        "completado": false,
        "heroEyebrow": "Vigilancia sostenida",
        "bloques": ["Aparece una letra cada segundo.", "Solo pulsa cuando sea 'X' y la anterior fuera 'A'.", "Si pulsas cuando no toca, cuenta como error.", "Si no pulsas cuando toca, también cuenta como error."]
    },
    {
        "id": "corsi",
        "nombre": "Corsi Block-Tapping Test",
        "categoria": "memoria",
        "habilidades": ["memoria_espacial", "memoria_trabajo", "atencion_selectiva"],
        "duracion": "7 min",
        "descripcion": "Una cuadrícula de 9 bloques. Algunos se iluminan en un orden concreto, uno a uno. Después, tú debes pulsar esos mismos bloques en el mismo orden. Con cada acierto, la secuencia se alarga. Evalúa tu memoria espacial a corto plazo: la capacidad de retener y reproducir posiciones en el espacio, que se relaciona con orientación, conducción y muchas tareas cotidianas.",
        "resumen": "Memoriza y repite el orden en que se iluminan los bloques.",
        "imagen": "assets/tests/corsi.jpg",
        "url": "tests/corsi-page.html",
        "completado": false,
        "heroEyebrow": "Memoria espacial",
        "bloques": ["9 bloques en cuadrícula se iluminan en secuencia.", "Observa el orden con atención.", "Pulsa los mismos bloques en el mismo orden.", "Dos errores consecutivos terminan el test."]
    },
    {
        "id": "tower-of-london",
        "nombre": "Tower of London",
        "categoria": "control",
        "habilidades": ["planificacion", "memoria_trabajo", "memoria_espacial", "atencion_sostenida"],
        "duracion": "10 min",
        "descripcion": "Tres varillas, varias bolas de colores. Ves una configuración objetivo y debes reorganizar las bolas para igualarla, pero solo puedes mover la bola de encima de cada varilla. La clave está en pensar antes de actuar: si mueves sin planificar, te bloqueas. Mide tu capacidad de resolver problemas paso a paso, prever consecuencias y mantener en mente un plan mientras lo ejecutas.",
        "resumen": "Reorganiza las bolas para igualar la configuración objetivo, pensando bien cada movimiento.",
        "imagen": "assets/tests/tol.jpg",
        "url": "tests/tower-of-london-page.html",
        "completado": false,
        "heroEyebrow": "Planificación ejecutiva",
        "bloques": ["Observa la configuración objetivo durante 3 segundos.", "Mueve las bolas para igualarla: solo puedes coger la de encima.", "Tienes un tiempo límite por nivel.", "Se mide cuántos movimientos haces y si llegas a la solución."]
    },
    {
        "id": "wcst",
        "nombre": "Wisconsin Card Sorting Test",
        "categoria": "control",
        "habilidades": ["flexibilidad_cognitiva", "control_inhibitorio", "memoria_trabajo"],
        "duracion": "12 min",
        "descripcion": "Hay cuatro cartas fijas y tú recibes cartas una a una. Tu misión: decidir con cuál de las cuatro coincide cada carta. El truco es que no te dicen la regla: solo sabrás si acertaste o fallaste. La regla puede ser por color, por forma o por número, y cambia sin avisarte cuando llevas 10 aciertos seguidos. Evalúa tu capacidad de aprender de los errores, detectar patrones y adaptarte cuando las reglas cambian, algo fundamental en el trabajo y en la vida cotidiana.",
        "resumen": "Descubre la regla oculta y adáptate cuando cambie sin previo aviso.",
        "imagen": "assets/tests/wcst.png",
        "url": "tests/wcst-page.html",
        "completado": false,
        "heroEyebrow": "Flexibilidad cognitiva",
        "bloques": ["4 cartas fijas (referencia). Te llegan cartas una a una.", "Decide con cuál de las 4 coincide: el juego te dice si has acertado.", "La regla (color, forma o número) cambia sola tras 10 aciertos.", "No te avisa del cambio: debes detectarlo por ti mismo."]
    },

    {
        "id": "mec",
        "nombre": "Mini-Examen Cognoscitivo de Lobo",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "planificacion", "velocidad_cognitiva", "flexibilidad_cognitiva", "control_inhibitorio"],
        "duracion": "12 min",
        "descripcion": "Versión digital del Mini-Examen Cognoscitivo de Lobo, uno de los instrumentos de cribado cognitivo más usados en medicina y neuropsicología. Incluye preguntas de orientación (fecha, lugar), memoria de palabras, cálculo mental, comprensión de instrucciones y lenguaje. No hay preguntas trampa: es una evaluación honesta de cómo funciona tu mente en este momento. Puntuación máxima 30 puntos.",
        "resumen": "Evaluación global de tu estado cognitivo: orientación, memoria, cálculo y lenguaje.",
        "imagen": "assets/tests/mec.jpg",
        "url": "tests/mec-page.html",
        "completado": false,
        "heroEyebrow": "Cribado cognitivo global",
        "bloques": [
            "Orientación: fecha, día de la semana, lugar donde estás.",
            "Memoria: aprende 3 palabras, recuérdalas más tarde.",
            "Cálculo mental en varias operaciones seguidas.",
            "Lenguaje: comprensión, repetición de frases y vocabulario."
        ]
    },
    {
        "id": "tavec",
        "nombre": "TAVEC – Test de Aprendizaje Verbal España-Complutense",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "planificacion", "atencion_sostenida", "flexibilidad_cognitiva"],
        "duracion": "15 min",
        "descripcion": "Se te muestran 16 palabras. Debes recordar todas las que puedas, cinco veces seguidas. Luego aparece una lista de palabras diferentes que 'interfiere' con lo aprendido. Después tienes que recuperar las palabras originales, primero de inmediato y luego tras una espera. Evalúa con detalle cómo aprendes palabras nuevas, a qué ritmo las retienes, cuánto te afectan las interferencias y cuánto olvidas con el tiempo.",
        "resumen": "Aprende 16 palabras en 5 rondas, resiste la interferencia y recuérdalas después.",
        "imagen": "assets/tests/tavec.jpg",
        "url": "tests/tavec-page.html",
        "completado": false,
        "heroEyebrow": "Aprendizaje y memoria verbal",
        "bloques": ["5 ensayos: escucha las 16 palabras y recuerda cuantas puedas.", "Lista de interferencia: 16 palabras nuevas que pueden confundirte.", "Recuerdo libre inmediato de la lista original.", "Recuerdo demorado tras una breve espera.", "Reconocimiento: ¿está esta palabra en la lista original?"]
    },
    {
        "id": "stroop",
        "nombre": "Stroop Test",
        "categoria": "atencion",
        "habilidades": ["atencion_dividida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "6 min",
        "descripcion": "Aparece la palabra 'ROJO' escrita en tinta azul. ¿Cuál es el color de la tinta? Azul. Tu cerebro quiere leer la palabra automáticamente, pero debes ignorarla y fijarte solo en el color de la tinta. Cuando la palabra y el color no coinciden, el cerebro entra en conflicto. Es un test clásico que mide con qué eficacia puedes bloquear una respuesta automática para hacer lo correcto.",
        "resumen": "Selecciona el color de la tinta, sin dejarte llevar por lo que dice la palabra.",
        "imagen": "assets/tests/stroop.jpg",
        "url": "tests/stroop-page.html",
        "completado": false,
        "heroEyebrow": "Control bajo interferencia",
        "bloques": ["Aparece una palabra de color escrita en una tinta diferente.", "Pulsa el botón del color de la tinta, no el de la palabra.", "Habrá ensayos en los que palabra y tinta coinciden (más fácil).", "Y ensayos en los que no coinciden (ahí se mide el control real)."]
    },
    {
        "id": "digit-span",
        "nombre": "Digit Span",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida"],
        "duracion": "5 min",
        "descripcion": "Aparece una secuencia de números durante unos segundos y desaparece. Tú debes escribirlos en el mismo orden. Con cada acierto, la secuencia se alarga. Parece un juego simple, pero la longitud máxima que alguien puede retener (llamada 'amplitud de dígitos') es uno de los indicadores más fiables de la memoria de trabajo, que es la memoria que usas para razonar, calcular y seguir conversaciones.",
        "resumen": "Memoriza y repite la secuencia de números que aparece en pantalla.",
        "imagen": "assets/tests/digitspan.png",
        "url": "tests/digit-span-page.html",
        "completado": false,
        "heroEyebrow": "Amplitud de memoria activa",
        "bloques": ["Aparece una serie de números durante 2 segundos.", "Desaparece: escríbelos en el mismo orden.", "Cada acierto añade un número más a la secuencia.", "Dos errores terminan el test. ¿Hasta dónde llegas?"]
    },
    {
        "id": "tmt",
        "nombre": "Trail Making Test A/B",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "coordinacion_visomotora", "atencion_dividida", "atencion_sostenida", "control_inhibitorio", "flexibilidad_cognitiva",],
        "duracion": "6 min",
        "descripcion": "Dos partes cronometradas. Antes de empezar cada parte se te indica el número o letra por el que debes arrancar, y siempre debes seguir el orden ascendente: si te dicen que empieces en el 3, irás 3→4→5→6→7→8→1→2. En la parte B alternas números y letras (1→A→2→B...), lo que obliga al cerebro a gestionar dos secuencias a la vez. La diferencia de tiempo entre ambas partes es la medida más directa de flexibilidad mental.",
        "resumen": "Conecta en orden ascendente desde el punto de inicio que te indican: números en parte A, alternando con letras en parte B.",
        "imagen": "assets/tests/tmt.png",
        "url": "tests/tmt-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad y flexibilidad mental",
        "bloques": ["Se te dice el número o letra por el que debes empezar en cada parte.", "Parte A: conecta los 8 números en orden ascendente (si empiezas en 5: 5→6→7→8→1→2→3→4).", "Parte B: alterna número y letra en orden ascendente (ej: 3→C→4→D→1→A→2→B).", "Ambas partes cronometradas. La diferencia de tiempo A↔B mide tu flexibilidad mental."]
    },
    {
        "id": "symbol-search",
        "nombre": "Symbol Search",
        "categoria": "reflejos",
        "habilidades": ["velocidad_cognitiva", "coordinacion_visomotora", "atencion_selectiva", "atencion_sostenida"],
        "duracion": "4 min",
        "descripcion": "Ves un símbolo objetivo y varias opciones. Debes elegir cuál es idéntica al objetivo. La dificultad aumenta a lo largo del test: empiezas con 2 opciones, subes a 3 y terminas con 4 entre las que elegir. Los símbolos son abstractos y parecidos, así que hay que fijarse. Mide la velocidad con la que tu cerebro compara información visual y decide, una capacidad que suele ser de las primeras en detectar cambios con la edad.",
        "resumen": "Identifica cuál de las opciones es igual al símbolo objetivo. La dificultad sube añadiendo más opciones.",
        "imagen": "assets/tests/symbol.png",
        "url": "tests/symbol-search-page.html",
        "completado": false,
        "heroEyebrow": "Velocidad de procesamiento visual",
        "bloques": ["Aparece un símbolo objetivo y varias opciones.", "Pulsa la opción que sea idéntica al objetivo.", "La dificultad sube: 2 opciones al inicio → 3 en el tramo medio → 4 al final.", "20 ensayos en total. Se mide velocidad de respuesta y aciertos."]
    },
    {
        "id": "nback",
        "nombre": "N-Back",
        "categoria": "memoria",
        "habilidades": ["memoria_trabajo", "atencion_sostenida", "control_inhibitorio", "velocidad_cognitiva"],
        "duracion": "8 min",
        "descripcion": "Aparecen números uno a uno. Primero en nivel 1-back: debes pulsar si el número actual es igual al anterior. Luego en nivel 2-back: debes compararlo con el de hace dos posiciones. Mientras avanza la secuencia, tienes que mantener los últimos números en mente y actualizar esa memoria constantemente. Está considerado uno de los mejores entrenamientos de memoria de trabajo que existen.",
        "resumen": "Pulsa cuando el número actual coincida con el de 1 (o 2) posiciones atrás.",
        "imagen": "assets/tests/n_back.png",
        "url": "tests/nback-page.html",
        "completado": false,
        "heroEyebrow": "Memoria de trabajo activa",
        "bloques": ["Aparece un número nuevo cada segundo.", "Nivel 1-back: pulsa si es igual al número inmediatamente anterior.", "Nivel 2-back: pulsa si es igual al de hace dos posiciones.", "Tienes que actualizar mentalmente la secuencia en tiempo real."]
    },
    {
        "id": "gng",
        "nombre": "Go/No-Go Test",
        "categoria": "control",
        "habilidades": ["control_inhibitorio", "atencion_sostenida", "velocidad_cognitiva"],
        "duracion": "2 min",
        "descripcion": "Aparecen 'X' o 'O' una a una, bastante rápido. Regla sencilla: pulsa cuando veas una 'X', no pulses si ves una 'O'. El ritmo y la repetición hacen que el cerebro quiera pulsar por inercia aunque salga una 'O'. Eso es exactamente lo que mide: tu capacidad de frenar un impulso cuando toca. Es el test más directo de control de impulsos que existe.",
        "resumen": "Pulsa en la 'X', pero no en la 'O'. El ritmo hará que quieras pulsar aunque no debas.",
        "imagen": "assets/tests/gonogo.jpg",
        "url": "tests/gng-page.html",
        "completado": false,
        "heroEyebrow": "Control de impulsos",
        "bloques": ["Aparecen letras una a una, rápido.", "Pulsa el botón grande si ves una 'X'.", "No pulses si ves una 'O' (aunque las ganas estén ahí).", "Se mide cuántas veces aciertas, fallas por pulsar o fallas por no pulsar."]
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