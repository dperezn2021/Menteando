using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class UIColorMatch : MonoBehaviour
{
    [Header("Referencias")]
    public ColorWheelUI colorWheel;
    public ColorMatchGame colorGame;

    [Header("HUD")]
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;
    public TextMeshProUGUI textoRegla;

    [Header("Feedback")]
    public Image flashPanel;

    private Coroutine flashCoroutine;

    private void Awake() // 🔥 CAMBIO
    {
        CachearReferencias();
    }

    private void Start()
    {
        CachearReferencias(); // 🔥 CAMBIO

        if (colorGame != null)
        {
            colorGame.OnRachaActualizada += ActualizarRacha;
            colorGame.OnNivelActualizado += ActualizarNivel;
            colorGame.OnReglaActualizada += ManejarCambioRegla; // 🔥 CAMBIO
        }

        if (flashPanel != null) // 🔥 CAMBIO
        {
            Color c = flashPanel.color;
            c.a = 0f;
            flashPanel.color = c;
            flashPanel.gameObject.SetActive(false);
        }

        AjustarHudAContenedor();
        ActualizarRacha(0); // 🔥 CAMBIO
        ActualizarNivel(DifficultyManager.Instance?.nivelActual ?? 1); // 🔥 CAMBIO
        ManejarCambioRegla((DifficultyManager.Instance?.nivelActual ?? 1) >= 6);
    }

    private void ManejarCambioRegla(bool responderTexto)
    {
        MostrarReglaPermanente(responderTexto);
    }

    private void Update()
    {
        if (textoTiempo == null || GameManager.Instance == null)
            return;

        float tiempoRestante = GameManager.Instance.tiempoRestante;
        int segundos = Mathf.Max(0, Mathf.CeilToInt(tiempoRestante));
        textoTiempo.text = $"{segundos / 60:00}:{segundos % 60:00}";
    }

    public void Flash(Color color)
    {
        if (flashPanel == null) return;

        if (flashCoroutine != null)
            StopCoroutine(flashCoroutine);

        flashCoroutine = StartCoroutine(FlashRoutine(color));
    }

    private void MostrarReglaPermanente(bool responderTexto)
    {
        if (textoRegla == null)
            return;

        if (textoRegla.transform.parent != null && !textoRegla.transform.parent.gameObject.activeSelf)
            textoRegla.transform.parent.gameObject.SetActive(true);

        if (!textoRegla.gameObject.activeSelf)
            textoRegla.gameObject.SetActive(true);

        textoRegla.text = responderTexto
            ? "NORMA: COLOR ESCRITO"
            : "NORMA: COLOR PINTADO";
    }

    private IEnumerator FlashRoutine(Color color)
    {
        flashPanel.gameObject.SetActive(true);
        color.a = 0.35f;
        flashPanel.color = color;

        float duration = 0.15f;
        float t = 0f;

        while (t < 1f)
        {
            t += Time.deltaTime / duration;
            Color c = flashPanel.color;
            c.a = Mathf.Lerp(0.35f, 0f, t);
            flashPanel.color = c;
            yield return null;
        }

        Color finalColor = flashPanel.color; // 🔥 CAMBIO
        finalColor.a = 0f;
        flashPanel.color = finalColor;
        flashPanel.gameObject.SetActive(false);
        flashCoroutine = null;
    }

    private void ActualizarRacha(int racha)
    {
        if (textoRacha != null)
            textoRacha.text = $"RACHA: {racha}";
    }

    private void ActualizarNivel(int nivel)
    {
        if (textoNivel != null)
            textoNivel.text = $"NIVEL: {Mathf.Clamp(nivel, 1, 10)}/10"; // 🔥 CAMBIO
    }

    private void AjustarHudAContenedor()
    {
        ConfigurarTextoHud(textoRacha, 16f, 38f);
        ConfigurarTextoHud(textoTiempo, 16f, 38f);
        ConfigurarTextoHud(textoNivel, 16f, 38f);
        ConfigurarTextoHud(textoRegla, 18f, 42f);
    }

    private void ConfigurarTextoHud(TextMeshProUGUI texto, float min, float max)
    {
        if (texto == null)
            return;

        texto.enableAutoSizing = true;
        texto.fontSizeMin = min;
        texto.fontSizeMax = max;
        texto.textWrappingMode = TextWrappingModes.Normal;
        texto.overflowMode = TextOverflowModes.Ellipsis;
        texto.raycastTarget = false;
    }

    private void CachearReferencias() // 🔥 CAMBIO
    {
        if (colorGame == null)
            colorGame = FindFirstObjectByType<ColorMatchGame>(FindObjectsInactive.Include); // 🔥 CAMBIO

        if (colorWheel == null && colorGame != null)
            colorWheel = colorGame.colorWheel;

        if (colorWheel == null)
            colorWheel = FindFirstObjectByType<ColorWheelUI>(FindObjectsInactive.Include); // 🔥 CAMBIO

        if (colorGame != null && colorGame.uiColorMatch == null)
            colorGame.uiColorMatch = this;
    }

    private void OnDestroy()
    {
        if (colorGame != null)
        {
            colorGame.OnRachaActualizada -= ActualizarRacha;
            colorGame.OnNivelActualizado -= ActualizarNivel;
            colorGame.OnReglaActualizada -= ManejarCambioRegla; // 🔥 CAMBIO
        }
    }
}
