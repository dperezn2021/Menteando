using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

public class ColorWheelUI : MonoBehaviour
{
    [Header("Contenedores")]
    public RectTransform wheelContainer;

    [Header("Configuración Visual")]
    public float radioExterno = 220f;
    public float radioInterno = 80f;

    [Header("Colores base (8 colores)")]
    public Color[] coloresBase = new Color[]
    {
        Color.red,           // 0: ROJO
        Color.blue,          // 1: AZUL
        Color.green,         // 2: VERDE
        Color.yellow,        // 3: AMARILLO
        new Color(0.8f, 0.2f, 0.9f),  // 4: MORADO
        Color.cyan,          // 5: CIAN
        new Color(1f, 0.5f, 0f),      // 6: NARANJA
        new Color(1f, 0.3f, 0.8f)     // 7: ROSA
    };

    [Header("Centro")]
    public TextMeshProUGUI centerText;

    [Header("Feedback")]
    public float duracionFlash = 0.15f;

    // 🔥 Lista pública de colores que están ACTUALMENTE en el rosco (según nivel)
    public List<Color> coloresEnRoscoActual = new List<Color>();

    private List<WheelSector> sectores = new List<WheelSector>();
    private ColorMatchGame gameLogic;

    void Start()
    {
        gameLogic = FindFirstObjectByType<ColorMatchGame>();
    }

    public void GenerarRosco(int nivel)
    {
        LimpiarSectores();
        coloresEnRoscoActual.Clear();

        int numSectores = CalcularSectoresPorNivel(nivel);

        // 🔥 Generar colores para los sectores (usando coloresBase)
        Color[] coloresSectores = GenerarColoresParaSectores(numSectores);

        for (int i = 0; i < numSectores; i++)
        {
            coloresEnRoscoActual.Add(coloresSectores[i]);
            CrearSectorAnillo(i, numSectores, coloresSectores[i]);
        }

        Debug.Log($"🎨 Rosco nivel {nivel}: {numSectores} sectores, colores: {string.Join(", ", coloresEnRoscoActual)}");
    }

    private Color[] GenerarColoresParaSectores(int numSectores)
    {
        Color[] resultado = new Color[numSectores];

        for (int i = 0; i < numSectores; i++)
        {
            resultado[i] = coloresBase[i % coloresBase.Length];
        }

        return resultado;
    }

    private void CrearSectorAnillo(int index, int total, Color color)
    {
        GameObject sectorGO = new GameObject($"Sector_{index}", typeof(RectTransform), typeof(Image), typeof(Button));
        sectorGO.transform.SetParent(wheelContainer, false);

        RectTransform rect = sectorGO.GetComponent<RectTransform>();
        rect.anchorMin = new Vector2(0.5f, 0.5f);
        rect.anchorMax = new Vector2(0.5f, 0.5f);
        rect.sizeDelta = new Vector2(radioExterno * 2, radioExterno * 2);
        rect.anchoredPosition = Vector2.zero;

        Texture2D textura = GenerarTexturaSectorAnillo(total, index, color);
        textura.Apply();

        Sprite sprite = Sprite.Create(textura, new Rect(0, 0, textura.width, textura.height), new Vector2(0.5f, 0.5f));

        Image img = sectorGO.GetComponent<Image>();
        img.sprite = sprite;
        img.type = Image.Type.Simple;
        img.alphaHitTestMinimumThreshold = 0.1f;

        Button btn = sectorGO.GetComponent<Button>();
        btn.targetGraphic = img;

        // 🔥 El índice del botón es el índice del color en coloresBase
        int indiceOriginal = index % coloresBase.Length;
        btn.onClick.AddListener(() => OnSectorClick(indiceOriginal));

        sectores.Add(new WheelSector
        {
            gameObject = sectorGO,
            image = img,
            button = btn,
            indice = indiceOriginal,
            colorOriginal = color
        });
    }

    private Texture2D GenerarTexturaSectorAnillo(int totalSectores, int indiceSector, Color color)
    {
        int resolucion = 512;
        Texture2D tex = new Texture2D(resolucion, resolucion, TextureFormat.RGBA32, false);
        Color[] pixeles = new Color[resolucion * resolucion];

        Vector2 centro = new Vector2(resolucion / 2, resolucion / 2);

        float radioExtPx = (resolucion / 2) * (radioExterno / (radioExterno + 50f));
        float radioIntPx = (resolucion / 2) * (radioInterno / (radioExterno + 50f));

        float anguloInicio = indiceSector * (360f / totalSectores);
        float anguloFin = (indiceSector + 1) * (360f / totalSectores);

        for (int x = 0; x < resolucion; x++)
        {
            for (int y = 0; y < resolucion; y++)
            {
                Vector2 pixel = new Vector2(x, y);
                float distancia = Vector2.Distance(pixel, centro);
                float angulo = Mathf.Atan2(y - centro.y, x - centro.x) * Mathf.Rad2Deg;
                if (angulo < 0) angulo += 360;

                bool dentroAnillo = (distancia >= radioIntPx && distancia <= radioExtPx);
                bool enSector = (angulo >= anguloInicio && angulo <= anguloFin);

                if (dentroAnillo && enSector)
                    pixeles[y * resolucion + x] = color;
                else
                    pixeles[y * resolucion + x] = Color.clear;
            }
        }

        tex.SetPixels(pixeles);
        tex.Apply();
        return tex;
    }

    private int CalcularSectoresPorNivel(int nivel)
    {
        if (nivel <= 2) return 4;
        if (nivel <= 4) return 5;
        if (nivel <= 6) return 6;
        if (nivel <= 8) return 7;
        return 8;
    }

    private void LimpiarSectores()
    {
        foreach (var s in sectores)
            if (s.gameObject != null) Destroy(s.gameObject);
        sectores.Clear();
    }

    private void OnSectorClick(int index)
    {
        if (gameLogic == null) return;
        Debug.Log($"🖱️ Click en sector índice: {index}");
        gameLogic.ProcesarRespuesta(index);
    }

    public void ActualizarCentro(string texto, Color color)
    {
        if (centerText != null)
        {
            centerText.text = texto;
            centerText.color = color;
        }
    }

    private class WheelSector
    {
        public GameObject gameObject;
        public Image image;
        public Button button;
        public int indice;
        public Color colorOriginal;
    }
}