using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class UISilencioMental : MonoBehaviour
{
    [Header("Referencias")]
    public SilencioMentalGame juego;

    [Header("Textos UI")]
    public TextMeshProUGUI textoObjetivoText;
    public TextMeshProUGUI textoObjetivo;
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;

    [Header("Objetivo (imagen fija)")]
    public Image imagenObjetivo;

    [Header("Estímulo (icono TMP)")]
    public TextMeshProUGUI textoEstimulo;

    [Header("Botón")]
    public Button botonRespuesta;

    private void Start()
    {
        // Botón
        if (botonRespuesta != null)
            botonRespuesta.onClick.AddListener(() => juego?.Responder());

        // Objetivo visible al inicio
        if (imagenObjetivo != null)
            imagenObjetivo.gameObject.SetActive(true);

        // Estímulo oculto al inicio
        if (textoEstimulo != null)
            textoEstimulo.gameObject.SetActive(false);
    }

    // ============================================================
    //  MÉTODOS LLAMADOS POR EL JUEGO
    // ============================================================

    public void ActualizarRacha(int rachaActual, int mejorRacha)
    {
        if (textoRacha != null)
            textoRacha.text = $"Racha: {rachaActual}";
    }

    public void ActualizarTiempo(float tiempoRestante)
    {
        if (textoTiempo != null)
            textoTiempo.text = $"Tiempo de lección: {Mathf.CeilToInt(tiempoRestante)}s";
    }

    public void ActualizarNivel(int nivel)
    {
        if (textoNivel != null)
            textoNivel.text = $"Nivel: {nivel}";
    }

    public void MostrarObjetivo(Sprite sprite, string nombre)
    {
        if (textoObjetivoText != null)
            textoObjetivoText.text = "El objetivo de la lección de hoy es:";

        if (imagenObjetivo != null)
        {
            imagenObjetivo.sprite = sprite;
            imagenObjetivo.color = Color.white;
            imagenObjetivo.material = null;
            imagenObjetivo.gameObject.SetActive(true);
        }

        if (textoObjetivo != null)
            textoObjetivo.text = nombre;
    }

    public void OcultarObjetivo()
    {
        // No ocultamos la imagen del objetivo
        if (textoObjetivo != null)
            textoObjetivo.text = "";
    }

    // ============================================================
    //  NUEVO ESTÍMULO: ICONO ALEATORIO TMP
    // ============================================================

    public void MostrarIconoAleatorio(string icono, Color color, int fontSize)
    {
        if (textoEstimulo == null)
            return;

        textoEstimulo.text = icono;
        textoEstimulo.color = color;
        textoEstimulo.fontSize = fontSize;

        // Reset transform
        RectTransform rect = textoEstimulo.GetComponent<RectTransform>();
        rect.anchoredPosition = Vector2.zero;
        rect.localScale = Vector3.one;

        textoEstimulo.gameObject.SetActive(true);
    }

    public void OcultarEstimulo()
    {
        if (textoEstimulo != null)
            textoEstimulo.gameObject.SetActive(false);
    }

    private void OnDestroy()
    {
        if (botonRespuesta != null)
            botonRespuesta.onClick.RemoveAllListeners();
    }
}
