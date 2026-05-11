using UnityEngine;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// Juego: Reflejos Cruzados
/// - Caen aliens (verde/rojo/dorado)
/// - Según la regla actual, el jugador debe tocarlos o evitarlos
/// - Integra DifficultyManager, GameManager, AudioManager y WebExporter
/// </summary>
public class ReflejosCruzadosGame : BaseGame
{
    [Header("Prefabs de aliens")]
    public AlienReflejo prefabAlienVerde;
    public AlienReflejo prefabAlienRojo;
    public AlienReflejo prefabAlienDorado;

    [Header("Zona de spawn")]
    public Transform spawnTop;          // punto superior (y)
    public float minX = -7f;
    public float maxX = 7f;

    [Header("Parámetros de caída")]
    public float velocidadBase = 3f;
    public float velocidadMax = 9f;

    [Header("Tiempos de spawn")]
    public float spawnIntervalMin = 0.8f;
    public float spawnIntervalMax = 1.6f;

    [Header("Partículas")]
    public ParticleSystem particulasAcierto;
    public ParticleSystem particulasError;

    [Header("Fondo parallax (opcional)")]
    public ParallaxFondo parallaxFondo;

    // Estado interno
    private bool activo = false;
    private bool reglasInvertidas = false;   // a partir de cierto nivel
    private bool finalizado = false;
    private List<AlienReflejo> aliensVivos = new List<AlienReflejo>();

    // Métricas
    private int toquesCorrectos = 0;
    private int toquesIncorrectos = 0;
    private int omitidosCorrectos = 0;   // no tocar cuando había que evitar
    private int omitidosIncorrectos = 0; // no tocar cuando había que tocar

    private int totalAliens = 0;

    private Coroutine rutinaSpawn;

    private void Awake()
    {
        nombre = "reflejos-cruzados";
    }

    public override void ResetGame()
    {
        // Reset estado
        activo = true;
        reglasInvertidas = false;
        finalizado = false;
        toquesCorrectos = toquesIncorrectos = 0;
        omitidosCorrectos = omitidosIncorrectos = 0;
        totalAliens = 0;

        // Limpiar aliens vivos
        LimpiarAliens();

        // Nivel inicial
        DifficultyManager.Instance?.ResetDifficulty(1);

        // Empezar spawn
        if (rutinaSpawn != null) StopCoroutine(rutinaSpawn);
        rutinaSpawn = StartCoroutine(RutinaSpawn());
    }

    public override void OnGameStart()
    {
        ResetGame();
    }

    public override void OnGameFinished()
    {
        if (finalizado) return;

        finalizado = true;
        activo = false;
        LimpiarAliens();
        WebExporter.EnviarSesion(nombre, AplicarPesos(CalcularCognicion()));
    }

    private void LimpiarAliens()
    {
        foreach (var a in aliensVivos)
        {
            if (a != null) Destroy(a.gameObject);
        }
        aliensVivos.Clear();
    }

    private IEnumerator RutinaSpawn()
    {
        while (activo)
        {
            // Esperar si el juego está pausado
            while (juegoPausado) yield return null;

            int nivel = DifficultyManager.Instance != null ? DifficultyManager.Instance.nivelActual : 1;

            // Ajustar dificultad según nivel
            float tMin = Mathf.Lerp(spawnIntervalMax, spawnIntervalMin, (nivel - 1) / 9f);
            float tMax = Mathf.Lerp(spawnIntervalMax + 0.4f, spawnIntervalMin + 0.2f, (nivel - 1) / 9f);
            float espera = Random.Range(tMin, tMax);

            // Reglas invertidas a partir de nivel 5
            reglasInvertidas = nivel >= 5;

            // Crear alien
            SpawnAlien(nivel);

            yield return new WaitForSeconds(espera);
        }
    }

    private void SpawnAlien(int nivel)
    {
        if (!activo) return;

        // Elegir tipo según nivel
        AlienTipo tipo = ElegirTipoAlien(nivel);

        float x = Random.Range(minX, maxX);
        Vector3 pos = new Vector3(x, spawnTop.position.y, 0f);

        AlienReflejo prefab = null;
        switch (tipo)
        {
            case AlienTipo.Verde: prefab = prefabAlienVerde; break;
            case AlienTipo.Rojo: prefab = prefabAlienRojo; break;
            case AlienTipo.Dorado: prefab = prefabAlienDorado; break;
        }
        if (prefab == null) return;

        AlienReflejo alien = Instantiate(prefab, pos, Quaternion.identity);
        alien.Inicializar(this, tipo, CalcularVelocidadCaida(nivel));
        aliensVivos.Add(alien);
        totalAliens++;
    }

    private float CalcularVelocidadCaida(int nivel)
    {
        float t = (nivel - 1) / 9f;
        return Mathf.Lerp(velocidadBase, velocidadMax, t);
    }

    private AlienTipo ElegirTipoAlien(int nivel)
    {
        // Distribución básica:
        // Niveles bajos: más verdes
        // Medios: mezcla
        // Altos: más rojos y dorados
        float pVerde, pRojo, pDorado;

        if (nivel <= 2)
        {
            pVerde = 0.7f; pRojo = 0.3f; pDorado = 0f;
        }
        else if (nivel <= 4)
        {
            pVerde = 0.5f; pRojo = 0.5f; pDorado = 0f;
        }
        else if (nivel <= 6)
        {
            pVerde = 0.3f; pRojo = 0.6f; pDorado = 0.1f;
        }
        else if (nivel <= 8)
        {
            pVerde = 0.25f; pRojo = 0.5f; pDorado = 0.25f;
        }
        else
        {
            pVerde = 0.2f; pRojo = 0.5f; pDorado = 0.3f;
        }

        float r = Random.value;
        if (r < pVerde) return AlienTipo.Verde;
        if (r < pVerde + pRojo) return AlienTipo.Rojo;
        return AlienTipo.Dorado;
    }

    /// <summary>
    /// Llamado por AlienReflejo cuando el jugador toca un alien.
    /// </summary>
    public void NotificarToque(AlienReflejo alien)
    {
        if (!activo) return;

        bool deberiaTocarse = DebeTocarse(alien.tipo);
        if (deberiaTocarse)
        {
            toquesCorrectos++;
            AudioManager.Instance?.Acierto();
            if (particulasAcierto != null)
                Instantiate(particulasAcierto, alien.transform.position, Quaternion.identity);
        }
        else
        {
            toquesIncorrectos++;
            AudioManager.Instance?.Error();
            if (particulasError != null)
                Instantiate(particulasError, alien.transform.position, Quaternion.identity);
        }

        // Feedback visual del alien
        alien.ReproducirHit(deberiaTocarse);

        // Actualizar dificultad
        float rendimiento = CalcularRendimientoInstantaneo();
        DifficultyManager.Instance?.ActualizarDificultad(rendimiento, deberiaTocarse, 0f);
    }

    /// <summary>
    /// Llamado por AlienReflejo cuando sale de pantalla sin ser tocado.
    /// </summary>
    public void NotificarSalida(AlienReflejo alien)
    {
        if (!activo) return;

        bool deberiaTocarse = DebeTocarse(alien.tipo);
        if (deberiaTocarse)
        {
            // Debería haberlo tocado y no lo hizo
            omitidosIncorrectos++;
        }
        else
        {
            // Correcto: no tocar algo que había que evitar
            omitidosCorrectos++;
        }
    }

    private bool DebeTocarse(AlienTipo tipo)
    {
        // Reglas:
        // - Normal: tocar verdes (y dorados si nivel alto), evitar rojos
        // - Invertidas: tocar rojos, evitar verdes; dorados siempre se tocan
        if (tipo == AlienTipo.Dorado) return true;

        if (!reglasInvertidas)
        {
            return tipo == AlienTipo.Verde;
        }
        else
        {
            return tipo == AlienTipo.Rojo;
        }
    }

    private float CalcularRendimientoInstantaneo()
    {
        int totalAcciones = toquesCorrectos + toquesIncorrectos + omitidosCorrectos + omitidosIncorrectos;
        if (totalAcciones == 0) return 0.5f;
        float correctos = toquesCorrectos + omitidosCorrectos;
        return correctos / Mathf.Max(1f, totalAcciones);
    }

    private void Update()
    {
        if (!activo) return;

        // Parallax opcional
        if (parallaxFondo != null && !juegoPausado)
            parallaxFondo.Mover();
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        // No hace falta parar corutinas si dentro de ellas respetamos juegoPausado
        // pero sí podemos congelar movimiento de aliens
        foreach (var alien in aliensVivos)
        {
            if (alien != null)
                alien.SetPausado(pausar);
        }
    }

    // ============================
    // MÉTRICAS COGNITIVAS
    // ============================
    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        int totalAcciones = toquesCorrectos + toquesIncorrectos + omitidosCorrectos + omitidosIncorrectos;
        if (totalAcciones == 0) return m;

        float precision = (float)(toquesCorrectos + omitidosCorrectos) / totalAcciones;
        float inhibicion = (float)omitidosCorrectos / Mathf.Max(1, omitidosCorrectos + toquesIncorrectos);
        float visomotora = (float)toquesCorrectos / Mathf.Max(1, toquesCorrectos + toquesIncorrectos);
        float planif = Mathf.Clamp01((float)toquesCorrectos / Mathf.Max(1, totalAliens));

        m.coordinacionVisomotora = visomotora;
        m.controlInhibitorio = inhibicion;
        m.memoriaEspacial = precision;   // aquí lo usamos como proxy de consistencia
        m.planificacion = planif;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.coordinacionVisomotora = m.coordinacionVisomotora * 0.50f;
        p.controlInhibitorio = m.controlInhibitorio * 0.25f;
        p.memoriaEspacial = m.memoriaEspacial * 0.15f;
        p.planificacion = m.planificacion * 0.10f;
        return p;
    }
}

/// <summary>
/// Tipo de alien
/// </summary>
public enum AlienTipo { Verde, Rojo, Dorado }

/// <summary>
/// Script que va en cada prefab de alien.
/// Se encarga de caer, detectar clic y notificar al juego.
/// </summary>
public class AlienReflejo : MonoBehaviour
{
    public AlienTipo tipo;
    public float velocidadCaida = 3f;
    public SpriteRenderer spriteRenderer;

    private ReflejosCruzadosGame juego;
    private bool pausado = false;
    private bool destruido = false;

    public void Inicializar(ReflejosCruzadosGame juego, AlienTipo tipo, float velocidad)
    {
        this.juego = juego;
        this.tipo = tipo;
        this.velocidadCaida = velocidad;
    }

    private void Update()
    {
        if (pausado || destruido) return;

        transform.position += Vector3.down * velocidadCaida * Time.deltaTime;

        // Si sale de pantalla por abajo
        if (transform.position.y < -6f)
        {
            destruido = true;
            juego.NotificarSalida(this);
            Destroy(gameObject);
        }
    }

    private void OnMouseDown()
    {
        if (pausado || destruido) return;

        destruido = true;
        juego.NotificarToque(this);
        Destroy(gameObject);
    }

    public void SetPausado(bool p)
    {
        pausado = p;
    }

    public void ReproducirHit(bool acierto)
    {
        if (spriteRenderer == null) return;
        // Pequeño flash de color
        Color original = spriteRenderer.color;
        spriteRenderer.color = acierto ? Color.green : Color.red;
        // Podrías añadir aquí una pequeña corrutina de fade si quieres
    }
}

/// <summary>
/// Parallax simple para fondo de estrellas (opcional).
/// </summary>
public class ParallaxFondo : MonoBehaviour
{
    public float velocidad = 0.1f;
    public Renderer rend;

    public void Mover()
    {
        if (rend == null) return;
        Vector2 offset = rend.material.mainTextureOffset;
        offset.y -= velocidad * Time.deltaTime;
        rend.material.mainTextureOffset = offset;
    }
}
