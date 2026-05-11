using System.Collections;
using System.Collections.Generic;
using System.Linq;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class EcoVisualGame : BaseGame, IBeginDragHandler, IDragHandler, IEndDragHandler
{
    [Header("Configuración")]
    public int numeroObjetos = 4;
    public float tiempoMemorizacion = 3f;
    public float distanciaAceptable = 50f;

    [Header("Prefabs")]
    public GameObject prefabObjeto;  // Debe tener Image + CanvasGroup

    [Header("UI")]
    public RectTransform zonaJuego;
    public TextMeshProUGUI textoInstruccion;
    public TextMeshProUGUI textoPuntuacion;

    [Header("Colores")]
    public Color colorAcierto = Color.green;
    public Color colorError = Color.red;

    // Estado
    private List<ObjetoMemoria> objetos = new List<ObjetoMemoria>();
    private bool faseMemorizacion = true;
    private bool juegoActivo = false;
    private bool juegoFinalizado = false;
    private int puntuacion = 0;
    private int totalColocados = 0;

    // Arrastre
    private GameObject objetoArrastrando;
    private Vector2 posicionOriginalArrastre;
    private RectTransform objetoArrastrandoRect;
    private Canvas canvas;

    private class ObjetoMemoria
    {
        public GameObject go;
        public Vector2 posicionOriginal;
        public bool colocado;
        public Color color;
    }

    private void Awake()
    {
        nombre = "eco-visual";
        canvas = GetComponentInParent<Canvas>();
    }

    public override void ResetGame()
    {
        // Limpiar objetos
        foreach (var obj in objetos)
            if (obj.go != null) Destroy(obj.go);
        objetos.Clear();

        faseMemorizacion = true;
        juegoActivo = true;
        juegoFinalizado = false;
        puntuacion = 0;
        totalColocados = 0;
        DifficultyManager.Instance?.ResetDifficulty(1);

        if (textoInstruccion != null)
            textoInstruccion.text = "MEMORIZA LAS POSICIONES...";

        ActualizarUI();

        GenerarObjetos();
        StartCoroutine(FaseMemorizacion());
    }

    private void GenerarObjetos()
    {
        if (zonaJuego == null)
        {
            Debug.LogError("zonaJuego no asignada en el Inspector");
            return;
        }

        float ancho = zonaJuego.rect.width;
        float alto = zonaJuego.rect.height;
        float margen = 80f;

        for (int i = 0; i < numeroObjetos; i++)
        {
            // Posición aleatoria
            float x = Random.Range(-ancho / 2 + margen, ancho / 2 - margen);
            float y = Random.Range(-alto / 2 + margen, alto / 2 - margen);
            Vector2 posicion = new Vector2(x, y);

            // Instanciar objeto
            GameObject obj = Instantiate(prefabObjeto, zonaJuego);
            RectTransform rect = obj.GetComponent<RectTransform>();
            rect.anchoredPosition = posicion;

            // Color aleatorio
            Color color = ObtenerColorAleatorio();
            Image img = obj.GetComponent<Image>();
            if (img != null) img.color = color;

            // Asegurar CanvasGroup para arrastre
            CanvasGroup cg = obj.GetComponent<CanvasGroup>();
            if (cg == null) cg = obj.AddComponent<CanvasGroup>();

            objetos.Add(new ObjetoMemoria
            {
                go = obj,
                posicionOriginal = posicion,
                colocado = false,
                color = color
            });
        }
    }

    private Color ObtenerColorAleatorio()
    {
        Color[] colores = { Color.red, Color.blue, Color.green, Color.yellow, Color.magenta, Color.cyan };
        return colores[Random.Range(0, colores.Length)];
    }

    private IEnumerator FaseMemorizacion()
    {
        yield return new WaitForSeconds(tiempoMemorizacion);

        // Ocultar todos los objetos (fin de la memorización)
        foreach (var obj in objetos)
            obj.go.SetActive(false);

        faseMemorizacion = false;

        textoInstruccion.text = "ARRastra cada objeto a su posición original";

        // Mostrar sombras
        MostrarSombras();

        // 🔥 REAPARECER los objetos para que el jugador pueda arrastrarlos
        yield return new WaitForSeconds(0.5f);

        foreach (var obj in objetos)
        {
            obj.go.SetActive(true);  // ¡Aquí reaparecen!
                                     // Ponerlos en una posición inicial (por ejemplo, abajo o en un lateral)
            obj.go.GetComponent<RectTransform>().anchoredPosition = ObtenerPosicionInicialArrastre();
        }
    }

    private Vector2 ObtenerPosicionInicialArrastre()
    {
        // Posición inicial: abajo del todo, centrado, con offset
        float x = 0f;
        float y = -zonaJuego.rect.height / 2 + 80f;
        return new Vector2(x, y);
    }
    private void MostrarSombras()
    {
        foreach (var obj in objetos)
        {
            GameObject sombra = new GameObject("Sombra");
            sombra.transform.SetParent(zonaJuego, false);
            RectTransform rect = sombra.AddComponent<RectTransform>();
            rect.anchoredPosition = obj.posicionOriginal;
            rect.sizeDelta = new Vector2(70, 70);

            Image img = sombra.AddComponent<Image>();
            img.color = new Color(1, 1, 1, 0.3f);

            // Copiar sprite del objeto original
            Image originalImg = obj.go.GetComponent<Image>();
            if (originalImg != null && originalImg.sprite != null)
                img.sprite = originalImg.sprite;

            Destroy(sombra, 0.5f);
        }
    }

    public void OnBeginDrag(PointerEventData eventData)
    {
        if (faseMemorizacion || !juegoActivo) return;

        objetoArrastrando = eventData.pointerDrag;
        if (objetoArrastrando == null) return;

        ObjetoMemoria objMem = objetos.Find(o => o.go == objetoArrastrando);
        if (objMem == null || objMem.colocado) return;

        objetoArrastrandoRect = objetoArrastrando.GetComponent<RectTransform>();
        posicionOriginalArrastre = objetoArrastrandoRect.anchoredPosition;
        objetoArrastrando.transform.SetAsLastSibling();
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (objetoArrastrando == null || faseMemorizacion || !juegoActivo) return;

        Vector2 pos;
        RectTransformUtility.ScreenPointToLocalPointInRectangle(zonaJuego, eventData.position, canvas.worldCamera, out pos);
        objetoArrastrandoRect.anchoredPosition = pos;
    }

    public void OnEndDrag(PointerEventData eventData)
    {
        if (objetoArrastrando == null || faseMemorizacion || !juegoActivo) return;

        ObjetoMemoria objMem = objetos.Find(o => o.go == objetoArrastrando);
        if (objMem == null || objMem.colocado)
        {
            objetoArrastrando = null;
            return;
        }

        Vector2 posFinal = objetoArrastrandoRect.anchoredPosition;
        float distancia = Vector2.Distance(posFinal, objMem.posicionOriginal);

        if (distancia <= distanciaAceptable)
        {
            // ACIERTO
            objMem.colocado = true;
            puntuacion += 10;
            totalColocados++;

            Image img = objetoArrastrando.GetComponent<Image>();
            if (img != null) img.color = colorAcierto;

            objetoArrastrandoRect.anchoredPosition = objMem.posicionOriginal;

            // Bloquear arrastre
            CanvasGroup cg = objetoArrastrando.GetComponent<CanvasGroup>();
            if (cg != null) cg.blocksRaycasts = false;
        }
        else
        {
            // ERROR: volver a posición original
            objetoArrastrandoRect.anchoredPosition = posicionOriginalArrastre;
            StartCoroutine(FeedbackError(objetoArrastrando));
        }

        ActualizarUI();
        objetoArrastrando = null;

        if (totalColocados >= numeroObjetos)
        {
            TerminarJuego();
        }
    }

    private IEnumerator FeedbackError(GameObject obj)
    {
        Image img = obj.GetComponent<Image>();
        if (img == null) yield break;

        Color original = img.color;
        img.color = colorError;
        yield return new WaitForSeconds(0.2f);
        img.color = original;
    }

    private void ActualizarUI()
    {
        if (textoPuntuacion != null)
            textoPuntuacion.text = $"PUNTUACIÓN: {puntuacion} / {numeroObjetos * 10}";
    }

    private void TerminarJuego()
    {
        juegoActivo = false;
        if (textoInstruccion != null)
            textoInstruccion.text = "¡COMPLETADO!";
        OnGameFinished();
    }

    public override void OnGameStart() => ResetGame();

    public override void OnGameFinished()
    {
        if (juegoFinalizado) return;

        juegoFinalizado = true;
        juegoActivo = false;
        CognitiveMetrics m = CalcularCognicion();
        WebExporter.EnviarSesion(nombre, AplicarPesos(m));
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics m = new CognitiveMetrics();
        float precision = totalColocados > 0 ? (float)totalColocados / numeroObjetos : 0;

        m.memoriaEspacial = precision;
        m.atencionSelectiva = precision;
        m.flexibilidadCognitiva = precision;
        m.atencionSostenida = precision;

        return m;
    }

    public override CognitiveMetrics AplicarPesos(CognitiveMetrics m)
    {
        CognitiveMetrics p = new CognitiveMetrics();
        p.memoriaEspacial = m.memoriaEspacial * 0.60f;
        p.atencionSelectiva = m.atencionSelectiva * 0.20f;
        p.flexibilidadCognitiva = m.flexibilidadCognitiva * 0.10f;
        p.atencionSostenida = m.atencionSostenida * 0.10f;
        return p;
    }

    public override void PausarJuego(bool pausar)
    {
        base.PausarJuego(pausar);
        juegoActivo = !pausar;
    }
}
