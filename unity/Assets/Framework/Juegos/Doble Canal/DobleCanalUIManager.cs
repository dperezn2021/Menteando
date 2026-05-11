using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class DobleCanalUI : MonoBehaviour
{
    [Header("HUD")]
    public TextMeshProUGUI textoPuntuacion;
    public TextMeshProUGUI textoAciertos;
    public TextMeshProUGUI textoFallos;
    public TextMeshProUGUI textoDistancia;

    [Header("Estímulos")]
    public TextMeshProUGUI textoEstimulo;

    [Header("Feedback")]
    public TextMeshProUGUI textoFeedback;

    [Header("Botón")]
    public Button botonRespuesta;

    private DobleCanalGame juego;
    private Coroutine feedbackCoroutine;

    private void Start()
    {
        juego = FindFirstObjectByType<DobleCanalGame>();
        if (botonRespuesta != null)
            botonRespuesta.onClick.AddListener(() => juego?.Responder());
    }

    public void ActualizarPuntuacion(int puntos) => SetText(textoPuntuacion, $"PUNTOS\n{puntos}");
    public void ActualizarAciertos(int aciertos) => SetText(textoAciertos, $"ACIERTOS\n{aciertos}");
    public void ActualizarFallos(int fallos) => SetText(textoFallos, $"FALLOS\n{fallos}");
    public void ActualizarDistancia(int distancia) => SetText(textoDistancia, $"DISTANCIA\n{distancia}m");

    public void MostrarEstimulo(string icono, Color color, int fontSize)
    {
        if (textoEstimulo == null) return;
        textoEstimulo.text = icono;
        textoEstimulo.color = color;
        textoEstimulo.fontSize = fontSize;
        textoEstimulo.gameObject.SetActive(true);
    }

    public void OcultarEstimulo()
    {
        if (textoEstimulo != null)
            textoEstimulo.gameObject.SetActive(false);
    }

    public void MostrarFeedback(string msg, Color color)
    {
        if (feedbackCoroutine != null) StopCoroutine(feedbackCoroutine);
        if (textoFeedback != null)
        {
            textoFeedback.text = msg;
            textoFeedback.color = color;
            textoFeedback.gameObject.SetActive(true);
        }
    }

    public void FeedbackTerminado()
    {
        if (textoFeedback != null)
            textoFeedback.gameObject.SetActive(false);
    }

    private void SetText(TextMeshProUGUI tmp, string txt) { if (tmp != null) tmp.text = txt; }
}