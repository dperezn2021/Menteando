using UnityEngine;
using UnityEngine.UI;

public class IntruderGame : BaseGame
{
    [Header("UI")]
    public Transform grid;
    public GameObject prefabIcono;

    private int filas;
    private int columnas;

    private int intrusoIndex;
    private int totalIntentos;
    private int aciertos;
    private int erroresImpulsivos;
    private float sumaTiempos;

    private bool rondaActiva = false;

    private void Awake()
    {
        nombre = "detector de intrusos";
    }

    // ---------------------------------------------------------
    // GRID SEGÚN NIVEL
    // ---------------------------------------------------------
    private void ObtenerGridPorNivel(int nivel, out int f, out int c)
    {
        if (nivel <= 2) { f = 2; c = 3; }      // 2x3
        else if (nivel <= 3) { f = 3; c = 3; } // 3x3
        else if (nivel <= 4) { f = 4; c = 3; } // 4x3
        else if (nivel <= 5) { f = 4; c = 4; } // 4x4
        else if (nivel <= 6) { f = 5; c = 4; } // 5x4
        else if (nivel <= 7) { f = 5; c = 4; } // 5x4
        else if (nivel <= 8) { f = 5; c = 4; } // 5x4
        else { f = 5; c = 5; }                 // 5x5
    }

    // ---------------------------------------------------------
    // COLORES
    // ---------------------------------------------------------
    private Color ColorIntruso(int nivel)
    {
        return Color.red;
    }

    private Color ColorDistractor(int nivel)
    {
        float similitud = Mathf.Lerp(0.1f, 0.9f, nivel / 10f);
        return new Color(1f, 0f, 0f, similitud);
    }

    // ---------------------------------------------------------
    // GENERAR ESTÍMULOS
    // ---------------------------------------------------------
    public override void GenerarEstimulos()
    {
        int nivel = DifficultyManager.Instance.nivelActual;

        ObtenerGridPorNivel(nivel, out filas, out columnas);
        int cantidadIconos = filas * columnas;

        rondaActiva = true;
        totalIntentos++;

        // Limpiar grid
        foreach (Transform child in grid)
            Destroy(child.gameObject);

        // Ajustar GridLayoutGroup
        GridLayoutGroup glg = grid.GetComponent<GridLayoutGroup>();
        glg.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
        glg.constraintCount = columnas;

        // Elegir intruso
        intrusoIndex = Random.Range(0, cantidadIconos);

        // Generar iconos
        for (int i = 0; i < cantidadIconos; i++)
        {
            GameObject icono = Instantiate(prefabIcono, grid);

            Button btn = icono.GetComponentInChildren<Button>();
            Image img = icono.GetComponentInChildren<Image>();

            bool esIntruso = (i == intrusoIndex);

            img.color = esIntruso ? ColorIntruso(nivel) : ColorDistractor(nivel);

            btn.onClick.AddListener(() => ClickIcono(esIntruso));
        }

        EmpezarIntento();
    }

    // ---------------------------------------------------------
    // CLICK
    // ---------------------------------------------------------
    private void ClickIcono(bool esIntruso)
    {
        if (!rondaActiva) return;

        rondaActiva = false;

        float tiempo = Time.time - tiempoInicio;
        sumaTiempos += tiempo;

        if (esIntruso) aciertos++;
        else erroresImpulsivos++;

        float rendimiento = esIntruso ? 1f : 0f;
        DifficultyManager.Instance.ActualizarDificultad(rendimiento, esIntruso, tiempo);

        GenerarEstimulos();
    }

    // ---------------------------------------------------------
    // RESET
    // ---------------------------------------------------------
    public void ResetGame()
    {
        totalIntentos = 0;
        aciertos = 0;
        erroresImpulsivos = 0;
        sumaTiempos = 0f;

        DifficultyManager.Instance.nivelActual = 1;

        GenerarEstimulos();
    }

    // ---------------------------------------------------------
    // MÉTRICAS
    // ---------------------------------------------------------
    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();

        float precision = totalIntentos > 0 ? (float)aciertos / totalIntentos : 0f;
        float tiempoMedio = totalIntentos > 0 ? sumaTiempos / totalIntentos : 1f;
        float velocidad = 1f / tiempoMedio;

        m.atencionSelectiva = precision;
        m.controlInhibitorio = 1f - ((float)erroresImpulsivos / Mathf.Max(1, totalIntentos));
        m.velocidadCognitiva = velocidad;
        m.coordinacionVisomotora = velocidad * precision;

        return m;
    }
}
