using System.Collections;
using UnityEngine;

public class MisionOrbitalGame : BaseGame
{
    [Header("Referencias del juego")]
    public GameObject sistemaOrbital;
    public Transform anilloOrbital;
    public GameObject prefabBala;
    public float velocidadBala = 15f;

    [Header("Materiales")]
    public Material materialActivo;
    public Material materialObjetivo;
    public Material materialNeutral;
    public Material materialImpacto;

    // Métricas (solo las que realmente usas)
    private int totalIntentos = 0;
    private int aciertos = 0;
    private float sumaRT = 0f;
    private float sumaRT2 = 0f;
    // AÑADE ESTO con las otras variables
    private int rachaAciertos = 0;
    private int mejorRacha = 0;

    // Estadísticas antiguas (las mantengo)
    private int disparosTotales = 0;
    private int fallos = 0;
    private float sumaTiempos = 0f;
    private int maxLevelReached = 1;
    private int cambiosDireccion = 0;
    private int direccionAnterior = 1;

    // Variables internas
    private int totalAsteroides;
    private int indiceObjetivo;
    private int indiceActivo;
    private float radioOrbital;
    private float velocidadRotacion;
    private bool jugando = false;
    private bool girando = false;
    private bool finalizado = false;
    private GameObject[] asteroides;
    private int direccion;
    private Coroutine rutinaGiro;
    private float tiempoInicio;

    private void Awake()
    {
        nombre = "mision orbital";
    }

    private void Update() { }

    // ============================================================
    //  FLUJO DEL JUEGO
    // ============================================================

    public override void ResetGame()
    {
        disparosTotales = 0;
        fallos = 0;
        sumaTiempos = 0f;
        totalIntentos = 0;
        aciertos = 0;
        sumaRT = 0f;
        sumaRT2 = 0f;
        maxLevelReached = 1;
        cambiosDireccion = 0;
        direccionAnterior = 1;
        finalizado = false;
        DifficultyManager.Instance?.ResetDifficulty(1);

        sistemaOrbital.SetActive(true);
        GenerarEstimulos();
    }

    public override void OnGameStart()
    {
        sistemaOrbital.SetActive(true);
    }

    public override void OnGameFinished()
    {
        if (finalizado) return;

        finalizado = true;
        sistemaOrbital.SetActive(false);
        if (rutinaGiro != null) StopCoroutine(rutinaGiro);
        EnviarResultados();
    }

    // ============================================================
    //  GENERACIÓN DE ESTÍMULOS
    // ============================================================

    public void GenerarEstimulos()
    {
        AplicarDificultad();
        CrearAnilloAsteroides();

        indiceObjetivo = Random.Range(0, totalAsteroides);

        do
        {
            indiceActivo = Random.Range(0, totalAsteroides);
        }
        while (indiceActivo == indiceObjetivo);

        jugando = true;
        girando = true;
        ActualizarColores();

        direccion = (DifficultyManager.Instance.nivelActual >= 6)
            ? (Random.value < 0.5f ? 1 : -1)
            : 1;

        if (totalIntentos > 0 && direccion != direccionAnterior)
            cambiosDireccion++;

        direccionAnterior = direccion;

        if (rutinaGiro != null) StopCoroutine(rutinaGiro);
        rutinaGiro = StartCoroutine(RotarAnillo());

        tiempoInicio = Time.time;
    }

    private void AplicarDificultad()
    {
        int nivel = DifficultyManager.Instance.nivelActual;
        maxLevelReached = Mathf.Max(maxLevelReached, nivel);
        totalAsteroides = Mathf.RoundToInt(Mathf.Lerp(6, 22, nivel / 10f));
        velocidadRotacion = Mathf.Lerp(0.22f, 0.015f, nivel / 10f);
        AjustarRoscoACamara();
    }

    private void CrearAnilloAsteroides()
    {
        foreach (Transform t in anilloOrbital)
            Destroy(t.gameObject);

        asteroides = new GameObject[totalAsteroides];
        float angulo = 360f / totalAsteroides;

        for (int i = 0; i < totalAsteroides; i++)
        {
            GameObject ast = CrearAsteroide();
            ast.transform.SetParent(anilloOrbital);

            float rad = Mathf.Deg2Rad * (i * angulo);
            float x = Mathf.Cos(rad) * radioOrbital;
            float z = Mathf.Sin(rad) * radioOrbital;

            ast.transform.localPosition = new Vector3(x, 0, z);
            ast.transform.LookAt(anilloOrbital.position);
            ast.transform.Rotate(Random.Range(0, 360), Random.Range(0, 360), Random.Range(0, 360));

            asteroides[i] = ast;
        }

        anilloOrbital.LookAt(Camera.main.transform);
        anilloOrbital.rotation = Quaternion.Euler(
            Random.Range(-10.0f, 10.0f),
            Random.Range(30.0f, 90.0f),
            Random.Range(140.0f, 170.0f)
        );
    }

    private GameObject CrearAsteroide()
    {
        GameObject asteroide = new GameObject("Asteroide");

        GameObject cuerpo = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cuerpo.transform.SetParent(asteroide.transform);
        cuerpo.transform.localPosition = Vector3.zero;

        float escalaX = Random.Range(0.4f, 0.7f);
        float escalaY = Random.Range(0.35f, 0.65f);
        float escalaZ = Random.Range(0.45f, 0.75f);
        cuerpo.transform.localScale = new Vector3(escalaX, escalaY, escalaZ);

        int numBultos = Random.Range(3, 6);
        for (int j = 0; j < numBultos; j++)
        {
            GameObject bulto = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bulto.transform.SetParent(asteroide.transform);

            Vector3 pos = new Vector3(
                Random.Range(-0.5f, 0.5f),
                Random.Range(-0.5f, 0.5f),
                Random.Range(-0.5f, 0.5f)
            );
            pos = pos.normalized * (0.5f + Random.Range(0.1f, 0.3f));
            bulto.transform.localPosition = pos;

            float bEscala = Random.Range(0.15f, 0.35f);
            bulto.transform.localScale = new Vector3(bEscala, bEscala, bEscala);
        }

        Destroy(cuerpo.GetComponent<Collider>());

        SphereCollider collider = asteroide.AddComponent<SphereCollider>();
        collider.radius = 0.5f;

        return asteroide;
    }

    private void ActualizarColores()
    {
        for (int i = 0; i < totalAsteroides; i++)
        {
            if (i == indiceActivo)
                AsignarMaterial(asteroides[i], materialActivo);
            else if (i == indiceObjetivo)
                AsignarMaterial(asteroides[i], materialObjetivo);
            else
                AsignarMaterial(asteroides[i], materialNeutral);
        }
    }

    private void AsignarMaterial(GameObject ast, Material mat)
    {
        foreach (Renderer r in ast.GetComponentsInChildren<Renderer>())
            r.material = mat;
    }

    private IEnumerator RotarAnillo()
    {
        while (girando)
        {
            indiceActivo = (indiceActivo + direccion + totalAsteroides) % totalAsteroides;
            ActualizarColores();
            yield return new WaitForSeconds(velocidadRotacion);
        }
    }

    // ============================================================
    //  DISPARO
    // ============================================================

    public void Disparar()
    {
        if (!jugando) return;

        jugando = false;
        girando = false;

        if (rutinaGiro != null) StopCoroutine(rutinaGiro);

        float tiempoReaccion = Time.time - tiempoInicio;

        // Métricas
        totalIntentos++;
        sumaRT += tiempoReaccion;
        sumaRT2 += tiempoReaccion * tiempoReaccion;

        disparosTotales++;
        sumaTiempos += tiempoReaccion;

        bool impacto = (indiceActivo == indiceObjetivo);

        if (impacto)
        {
            aciertos++;
            rachaAciertos++;        // 🔥 AÑADE ESTA LÍNEA
            mejorRacha = Mathf.Max(mejorRacha, rachaAciertos); // 🔥 AÑADE ESTA LÍNEA
        }
        else
        {
            fallos++;
            rachaAciertos = 0;      // 🔥 AÑADE ESTA LÍNEA
        }

        DifficultyManager.Instance.ActualizarDificultad(
            impacto ? 1f : 0f,
            impacto,
            tiempoReaccion
        );

        if (prefabBala != null)
        {
            Vector3 ini = new Vector3(0.0f, 9.0f, -10.0f);
            Vector3 pos = asteroides[indiceActivo].transform.position;
            GameObject bala = Instantiate(prefabBala, ini, Quaternion.identity);
            StartCoroutine(MoverBala(bala, pos, impacto));
        }
        else
        {
            StartCoroutine(Feedback(impacto));
        }
    }

    private IEnumerator MoverBala(GameObject bala, Vector3 objetivo, bool impacto)
    {
        float dist = Vector3.Distance(bala.transform.position, objetivo);
        float tViaje = dist / velocidadBala;
        float t = 0;

        while (t < tViaje)
        {
            t += Time.deltaTime;
            bala.transform.position = Vector3.Lerp(Vector3.zero, objetivo, t / tViaje);
            yield return null;
        }

        Destroy(bala);

        AsignarMaterial(asteroides[indiceActivo], materialImpacto);
        AudioManager.Instance.Acierto();
        yield return new WaitForSeconds(0.2f);

        ActualizarColores();
        yield return new WaitForSeconds(0.2f);

        GenerarEstimulos();
    }

    private IEnumerator Feedback(bool impacto)
    {
        AsignarMaterial(asteroides[indiceActivo], materialImpacto);
        yield return new WaitForSeconds(0.2f);

        ActualizarColores();
        yield return new WaitForSeconds(0.2f);

        GenerarEstimulos();
    }

    // ============================================================
    //  POSICIONAMIENTO DEL ROSCO
    // ============================================================

    void AjustarRoscoACamara()
    {
        Camera cam = Camera.main;
        if (cam == null) return;

        float distancia = 10f;
        float altura = 2f * distancia * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
        float ancho = altura * cam.aspect;

        float tamañoPantalla = 0.35f;
        float tamaño = Mathf.Min(altura, ancho) * tamañoPantalla;

        radioOrbital = tamaño * 0.8f;

        anilloOrbital.position = cam.transform.position + cam.transform.forward * distancia;
    }

    // ============================================================
    //  MÉTRICAS COGNITIVAS
    // ============================================================

    private float ObtenerFactorNivel()
    {
        int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;
        return Mathf.Lerp(0.5f, 2f, (nivel - 1f) / 9f);
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        // Inicializar todas las métricas en 0
        m.atencionSelectiva = 0;
        m.atencionSostenida = 0;
        m.atencionDividida = 0;
        m.memoriaTrabajo = 0;
        m.memoriaEspacial = 0;
        m.controlInhibitorio = 0;

        if (totalIntentos == 0)
            return m;

        // 🔥 1. PRECISIÓN (más generosa)
        float precision = (float)aciertos / totalIntentos;
        // Antes: precision directa. Ahora: mínimo 0.3 incluso si falla
        precision = Mathf.Lerp(0.3f, 1f, precision);

        // 🔥 2. TIEMPO DE REACCIÓN (más permisivo)
        float rtMedio = sumaRT / totalIntentos;
        // Antes: 1.25s a 0.22s → Ahora: 2.0s a 0.35s
        float velocidadRaw = Mathf.InverseLerp(2.0f, 0.35f, rtMedio);
        velocidadRaw = Mathf.Clamp01(velocidadRaw);

        // 🔥 3. CONSISTENCIA (menos castigadora)
        float varianza = Mathf.Max(0f, (sumaRT2 / totalIntentos) - (rtMedio * rtMedio));
        float desviacion = Mathf.Sqrt(varianza);
        // Antes: penalizaba mucho. Ahora: más suave
        float consistencia = 1f - Mathf.Clamp01(desviacion / 1.2f);

        // 🔥 4. NIVEL ALCANZADO (bonificador)
        float factorNivel = Mathf.Lerp(0.7f, 1f, Mathf.Clamp01(maxLevelReached / 12f));

        // 🔥 5. RACHA (premia consistencia)
        float rachaBonus = Mathf.Clamp01(mejorRacha / 8f);

        // 🔥 6. ADAPTACIÓN A CAMBIOS DE DIRECCIÓN
        float adaptacionDireccion = 0.5f; // valor neutral por defecto
        if (totalIntentos > 0)
        {
            float tasaCambios = (float)cambiosDireccion / Mathf.Max(1, totalIntentos / 5);
            adaptacionDireccion = Mathf.Clamp01(1f - tasaCambios * 0.5f);
        }

        // 🔥 7. CÁLCULO DE MÉTRICAS (valores entre 0.2 y 0.95)
        m.velocidadCognitiva = Mathf.Clamp(velocidadRaw * 0.8f + 0.15f, 0.2f, 0.95f);
        m.coordinacionVisomotora = Mathf.Clamp((precision * 0.6f + velocidadRaw * 0.3f + rachaBonus * 0.1f) * factorNivel, 0.2f, 0.95f);
        m.flexibilidadCognitiva = Mathf.Clamp((precision * 0.4f + adaptacionDireccion * 0.4f + rachaBonus * 0.2f) * factorNivel, 0.15f, 0.9f);
        m.planificacion = Mathf.Clamp((precision * 0.5f + consistencia * 0.3f + rachaBonus * 0.2f) * factorNivel, 0.1f, 0.85f);

        Debug.Log($"📊 Misión Orbital - Aciertos:{aciertos}/{totalIntentos} ({precision:P1}) | RT medio:{rtMedio:F2}s | Nivel:{maxLevelReached} | Racha:{mejorRacha}");
        Debug.Log($"📊 Métricas - Vel:{m.velocidadCognitiva:F2} Coord:{m.coordinacionVisomotora:F2} Flex:{m.flexibilidadCognitiva:F2} Plan:{m.planificacion:F2}");

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        // Inicializar todas en 0
        p.atencionSelectiva = 0;
        p.atencionSostenida = 0;
        p.atencionDividida = 0;
        p.memoriaTrabajo = 0;
        p.memoriaEspacial = 0;
        p.controlInhibitorio = 0;

        // 🔥 Pesos redistribuidos (totales más altos)
        p.velocidadCognitiva = m.velocidadCognitiva * 0.40f;      // +5%
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.35f; // +5%
        p.flexibilidadCognitiva = m.flexibilidadCognitiva * 0.15f;    // igual
        p.planificacion = m.planificacion * 0.10f;                    // +5%

        return p;
    }

    public void EnviarResultados()
    {
        CognitiveMetrics m = CalcularCognicion();
        CognitiveMetrics p = AplicarPesos(m);

        WebExporter.EnviarSesion(nombre, p);
        Debug.Log($"📤 Resultados enviados - Velocidad: {p.velocidadCognitiva:F2}, Coordinación: {p.coordinacionVisomotora:F2}, Flexibilidad: {p.flexibilidadCognitiva:F2}, Planificación: {p.planificacion:F2}");
    }
}
