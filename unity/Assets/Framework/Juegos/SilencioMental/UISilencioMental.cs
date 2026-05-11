using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

public class UISilencioMental : MonoBehaviour
{
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoTiempo;
    public TextMeshProUGUI textoNivel;

    public TextMeshProUGUI textoMensaje;   // SOLO lección
    public TextMeshProUGUI textoIcono;     // icono actual
    public TextMeshProUGUI textoFeedback;  // SOLO acierto/error

    public Button botonRespuesta;

    private SilencioMentalGame juego;

    private void Awake()
    {
        if (textoMensaje != null) textoMensaje.text = "";
        if (textoIcono != null) textoIcono.text = "";
        if (textoFeedback != null) textoFeedback.text = "";
    }

    private void Start()
    {
        juego = FindFirstObjectByType<SilencioMentalGame>();
        if (botonRespuesta != null)
            botonRespuesta.onClick.AddListener(() => juego?.Responder());
    }

    public void ActualizarRacha(int racha) =>
        SetText(textoRacha, $"RACHA: {racha}");

    public void ActualizarTiempo(float t)
    {
        int segundos = Mathf.Max(0, Mathf.FloorToInt(t));
        if (textoTiempo != null)
            textoTiempo.text = $"TIEMPO: {segundos:00}";
    }

    public void ActualizarNivel(int nivel) =>
        SetText(textoNivel, $"NIVEL: {nivel}/10");

    public void MostrarIcono(string icono, Color color, int fontSize)
    {
        if (textoIcono != null)
        {
            textoIcono.text = icono;
            textoIcono.color = color;
            textoIcono.fontSize = fontSize;
            textoIcono.gameObject.SetActive(true);
        }
    }

    public void MostrarMensaje(string msg, Color color)
    {
        if (textoMensaje != null)
        {
            textoMensaje.text = msg;
            textoMensaje.color = color;
            textoMensaje.gameObject.SetActive(true);
        }
    }

    public IEnumerator MostrarFeedbackTemporal(string msg, Color color)
    {
        if (textoFeedback != null)
        {
            textoFeedback.text = msg;
            textoFeedback.color = color;
            textoFeedback.gameObject.SetActive(true);
        }

        yield return new WaitForSeconds(1f);

        if (textoFeedback != null)
        {
            textoFeedback.text = "";
            textoFeedback.gameObject.SetActive(false);
        }
    }

    public void OcultarTodo()
    {
        if (textoIcono != null) textoIcono.text = "";
        if (textoMensaje != null) textoMensaje.text = "";
    }

    private void SetText(TextMeshProUGUI tmp, string txt)
    {
        if (tmp != null) tmp.text = txt;
    }
}