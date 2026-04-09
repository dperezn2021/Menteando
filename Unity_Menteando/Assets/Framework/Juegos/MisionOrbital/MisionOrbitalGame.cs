using System.Collections;
using UnityEngine;

public class MisionOrbitalGame : BaseGame
{
    [Header("Referencias del juego")]
    public GameObject sistemaOrbital;      // Se activa/desactiva según estado del juego
    public Transform anilloOrbital;        // Donde se generan los asteroides
    public GameObject prefabBala;
    public float velocidadBala = 15f;

    [Header("Materiales")]
    public Material materialActivo;
    public Material materialObjetivo;
    public Material materialNeutral;
    public Material materialImpacto;

    // Métricas crudas (cognitivas)
    private int totalIntentos = 0;
    private int aciertos = 0;
    private int errores = 0;
    private int omisiones = 0;

    private float sumaRT = 0f;
    private float sumaRT2 = 0f;

    private int cambiosSentido = 0;
    private int anticipacionesCorrectas = 0;
    private int anticipacionesTotales = 0;

    private float tiempoInicio;
    private int mejorNivel = 0;

    private int adaptacionesTotales = 0;
    private int adaptacionesCorrectas = 0;
    private bool adaptacionActiva = false;
    private int ciclosDesdeCambio = 0;


    // Estadísticas antiguas (las mantengo para no romper nada)
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


    private void Awake()
    {
        nombre = "mision-orbital";
    }

    private void Start()
    {
        // ❗ NO GENERAR NADA AQUÍ
        // El juego solo empieza cuando GameManager llama a ResetGame()
    }

    private void Update()
    {
        if (!GameManager.Instance.estaJugando) return;
        // Aquí podrías actualizar cosas visuales si quieres
    }

    // ============================================================
    //  FLUJO DEL JUEGO
    // ============================================================

    public override void ResetGame()
    {
        // Reset de estadísticas antiguas
        disparosTotales = 0;
        fallos = 0;
        sumaTiempos = 0f;

        totalIntentos = 0;
        aciertos = 0;
        errores = 0;
        omisiones = 0;

        sumaRT = 0f;
        sumaRT2 = 0f;

        cambiosSentido = 0;
        adaptacionesTotales = 0;
        adaptacionesCorrectas = 0;

        anticipacionesTotales = 0;
        anticipacionesCorrectas = 0;

        mejorNivel = 0;

        // Reactivar sistema orbital
        sistemaOrbital.SetActive(true);

        // Generar asteroides
        GenerarEstimulos();
    }

    public override void OnGameStart()
    {
        sistemaOrbital.SetActive(true);
    }

    public override void OnGameFinished()
    {
        // Apagar el sistema orbital
        sistemaOrbital.SetActive(false);

        // Detener rotación
        girando = false;
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

        if (nivel > mejorNivel) mejorNivel = nivel;

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
            Random.Range(-10.0f,10.0f) ,
            Random.Range(30.0f, 90.0f),
            Random.Range(140.0f, 170.0f)
        );

    }

    private GameObject CrearAsteroide()
    {
        GameObject asteroide = new GameObject("Asteroide");

        // Cuerpo principal (cubo deformado)
        GameObject cuerpo = GameObject.CreatePrimitive(PrimitiveType.Cube);
        cuerpo.transform.SetParent(asteroide.transform);
        cuerpo.transform.localPosition = Vector3.zero;

        // Escala irregular (parece una roca)
        float escalaX = Random.Range(0.4f, 0.7f);
        float escalaY = Random.Range(0.35f, 0.65f);
        float escalaZ = Random.Range(0.45f, 0.75f);
        cuerpo.transform.localScale = new Vector3(escalaX, escalaY, escalaZ);

        // Añadir bultos (cubos pequeños pegados)
        int numBultos = Random.Range(3, 6);
        for (int j = 0; j < numBultos; j++)
        {
            GameObject bulto = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bulto.transform.SetParent(asteroide.transform);

            // Posición aleatoria alrededor del cuerpo
            Vector3 pos = new Vector3(
                Random.Range(-0.5f, 0.5f),
                Random.Range(-0.5f, 0.5f),
                Random.Range(-0.5f, 0.5f)
            );
            pos = pos.normalized * (0.5f + Random.Range(0.1f, 0.3f));
            bulto.transform.localPosition = pos;

            // Escala pequeña y variada
            float bEscala = Random.Range(0.15f, 0.35f);
            bulto.transform.localScale = new Vector3(bEscala, bEscala, bEscala);
        }

        // Eliminar el collider del cuerpo para que no interfiera
        Destroy(cuerpo.GetComponent<Collider>());

        // Añadir un collider al asteroide principal
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

        // Métricas crudas
        totalIntentos++;
        sumaRT += tiempoReaccion;
        sumaRT2 += tiempoReaccion * tiempoReaccion;

        // Estadísticas antiguas
        disparosTotales++;
        sumaTiempos += tiempoReaccion;

        bool impacto = (indiceActivo == indiceObjetivo);

        if (impacto)
            aciertos++;
        else
        {
            errores++;
            fallos++;
        }

        if (prefabBala != null)
        {
            Vector3 pos = asteroides[indiceActivo].transform.position;
            GameObject bala = Instantiate(prefabBala, Vector3.zero, Quaternion.identity);
            StartCoroutine(MoverBala(bala, pos, impacto));
        }
        else
        {
            StartCoroutine(Feedback(impacto));
        }

        if (adaptacionActiva)
        {
            if (impacto) adaptacionesCorrectas++;
            adaptacionActiva = false;
        }


        int distancia = Mathf.Abs(indiceActivo - indiceObjetivo);
        if (distancia == 1 || distancia == totalAsteroides - 1)
        {
            anticipacionesTotales++;
            if (impacto) anticipacionesCorrectas++;
        }


        DifficultyManager.Instance.ActualizarDificultad(
            impacto ? 1f : 0f,
            impacto,
            tiempoReaccion
        );
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

    // Métodos de registro extra (si los usas desde fuera, siguen siendo válidos)
    public void RegistrarIntento(bool acierto, float tiempoReaccion)
    {
        totalIntentos++;

        if (acierto)
            aciertos++;
        else
            errores++;

        sumaRT += tiempoReaccion;
        sumaRT2 += tiempoReaccion * tiempoReaccion;
    }

    public void RegistrarOmisión()
    {
        totalIntentos++;
        omisiones++;
    }



    public void RegistrarCambioSentido()
    {
        cambiosSentido++;
        adaptacionesTotales++;
        adaptacionActiva = true;
        ciclosDesdeCambio = 0;
    }

    public void RegistrarAnticipacion(bool correcta)
    {
        anticipacionesTotales++;

        if (correcta)
            anticipacionesCorrectas++;
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
        // Nivel 1 = 0.5, Nivel 10 = 2.0
        return Mathf.Lerp(0.5f, 2f, (nivel - 1f) / 9f);
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        if (totalIntentos == 0)
            return m;

        float precision = (float)aciertos / totalIntentos;
        float omissionRate = (float)omisiones / totalIntentos;

        float rtMedio = Mathf.Max(0.01f, sumaRT / Mathf.Max(1, totalIntentos - omisiones));
        float varRT = Mathf.Max(0, (sumaRT2 / totalIntentos) - (rtMedio * rtMedio));

        float factorNivel = ObtenerFactorNivel();
        float penalizacionOmisiones = 1f - omissionRate;

        m.velocidadCognitiva = Mathf.Clamp01((1f / rtMedio) * factorNivel * penalizacionOmisiones);
        m.coordinacionVisomotora = Mathf.Clamp01(precision * (1f / rtMedio));
        m.flexibilidadCognitiva = adaptacionesTotales > 0
            ? (float)adaptacionesCorrectas / adaptacionesTotales
            : 0f;
        m.planificacion = anticipacionesTotales > 0
            ? (float)anticipacionesCorrectas / anticipacionesTotales
            : 0f;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();

        p.velocidadCognitiva = m.velocidadCognitiva * 0.45f;
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.35f;
        p.flexibilidadCognitiva = m.flexibilidadCognitiva * 0.15f;
        p.planificacion = m.planificacion * 0.05f;

        // No entrenadas en este juego
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
        Debug.Log("📤 Resultados enviados a WebExporter");
    }
}
