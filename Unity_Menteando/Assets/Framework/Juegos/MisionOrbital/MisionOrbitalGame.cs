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

    // Estadísticas antiguas (las mantengo)
    private int disparosTotales = 0;
    private int fallos = 0;
    private float sumaTiempos = 0f;

    // Variables internas
    private int totalAsteroides;
    private int indiceObjetivo;
    private int indiceActivo;
    private float radioOrbital;
    private float velocidadRotacion;
    private bool jugando = false;
    private bool girando = false;
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

        sistemaOrbital.SetActive(true);
        GenerarEstimulos();
    }

    public override void OnGameStart()
    {
        sistemaOrbital.SetActive(true);
    }

    public override void OnGameFinished()
    {
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

        if (rutinaGiro != null) StopCoroutine(rutinaGiro);
        rutinaGiro = StartCoroutine(RotarAnillo());

        tiempoInicio = Time.time;
    }

    private void AplicarDificultad()
    {
        int nivel = DifficultyManager.Instance.nivelActual;
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
            aciertos++;
        else
            fallos++;

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

        if (totalIntentos == 0)
            return m;

        float precision = (float)aciertos / totalIntentos;
        float rtMedio = Mathf.Max(0.01f, sumaRT / totalIntentos);
        float factorNivel = ObtenerFactorNivel();

        // ✅ Solo estas dos métricas
        m.velocidadCognitiva = Mathf.Clamp01((1f / rtMedio) * factorNivel);
        m.coordinacionVisomotora = Mathf.Clamp01(precision * (1f / rtMedio));

        // ❌ Las demás a 0
        m.flexibilidadCognitiva = 0f;
        m.planificacion = 0f;
        m.atencionSelectiva = 0f;
        m.atencionDividida = 0f;
        m.atencionSostenida = 0f;
        m.memoriaTrabajo = 0f;
        m.memoriaEspacial = 0f;
        m.controlInhibitorio = 0f;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        // Pesos ajustados solo para las dos métricas que existen
        p.velocidadCognitiva = m.velocidadCognitiva * 0.55f;
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.45f;

        // El resto a 0
        p.flexibilidadCognitiva = 0f;
        p.planificacion = 0f;
        p.atencionSelectiva = 0f;
        p.atencionDividida = 0f;
        p.atencionSostenida = 0f;
        p.memoriaTrabajo = 0f;
        p.memoriaEspacial = 0f;
        p.controlInhibitorio = 0f;

        return p;
    }

    public void EnviarResultados()
    {
        CognitiveMetrics m = CalcularCognicion();
        CognitiveMetrics p = AplicarPesos(m);

        WebExporter.EnviarSesion(nombre, p);
        Debug.Log($"📤 Resultados enviados - Velocidad: {p.velocidadCognitiva:F2}, Coordinación: {p.coordinacionVisomotora:F2}");
    }
}