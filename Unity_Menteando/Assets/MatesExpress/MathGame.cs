using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using TMPro;

public class MathGame : BaseGame
{
    [Header("UI")]
    public TextMeshProUGUI textoOperacion;
    public TMP_InputField resultado;
    public TextMeshProUGUI textoRacha;
    public TextMeshProUGUI textoNivelActual;

    private int respuestaCorrecta;
    private int rachaActual = 0;
    private int operacionesTotales = 0;

    // Datos brutos para métricas
    private int aciertos = 0;
    private int errores = 0;
    private List<float> tiemposReaccion = new List<float>();

    private void Awake()
    {
        nombre = "math";
    }

    private void Start()
    {
        GameManager.Instance.EmpezarJuego(this);
        GenerarEstimulos();
    }

    public override void GenerarEstimulos()
    {
        int nivel = DifficultyManager.Instance.nivelActual;
        textoNivelActual.text = nivel.ToString();

        int tipo = Mathf.Clamp(nivel, 1, 5);

        int a = 0, b = 0, c = 0;
        string op1 = "", op2 = "";
        string operacionTexto = "";

        switch (tipo)
        {
            case 1: // sumas/restas 1 cifra
                a = Random.Range(1, 10);
                b = Random.Range(1, 10);
                op1 = Random.value > 0.5f ? "+" : "-";
                respuestaCorrecta = (op1 == "+") ? a + b : a - b;
                operacionTexto = $"{a} {op1} {b}";
                break;

            case 2: // multiplicaciones 1 cifra
                a = Random.Range(2, 10);
                b = Random.Range(2, 10);
                respuestaCorrecta = a * b;
                operacionTexto = $"{a} * {b}";
                break;

            case 3: // sumas/restas 2 cifras
                a = Random.Range(10, 50);
                b = Random.Range(10, 50);
                op1 = Random.value > 0.5f ? "+" : "-";
                respuestaCorrecta = (op1 == "+") ? a + b : a - b;
                operacionTexto = $"{a} {op1} {b}";
                break;

            case 4: // multiplicaciones/divisiones 2 y 1 cifra
                if (Random.value > 0.5f)
                {
                    a = Random.Range(10, 50);
                    b = Random.Range(2, 10);
                    respuestaCorrecta = a * b;
                    operacionTexto = $"{a} * {b}";
                }
                else
                {
                    b = Random.Range(2, 10);
                    int res = Random.Range(2, 20);
                    a = b * res;
                    respuestaCorrecta = res;
                    operacionTexto = $"{a} / {b}";
                }
                break;

            default: // combinadas
                a = Random.Range(5, 30);
                b = Random.Range(2, 15);
                c = Random.Range(1, 10);

                op1 = Random.value > 0.5f ? "+" : "*";
                op2 = Random.value > 0.5f ? "+" : "-";

                int temp = (op1 == "+") ? a + b : a * b;
                respuestaCorrecta = (op2 == "+") ? temp + c : temp - c;

                operacionTexto = $"({a} {op1} {b}) {op2} {c}";
                break;
        }

        textoOperacion.text = operacionTexto;
        resultado.text = "";
        EmpezarIntento();
    }

    public void CorregirRespuesta()
    {
        if (!int.TryParse(resultado.text, out int respuesta)) return;

        float tiempoReaccion = Time.time - tiempoInicio;
        tiemposReaccion.Add(tiempoReaccion);

        bool esCorrecta = respuesta == respuestaCorrecta;
        operacionesTotales++;

        if (esCorrecta)
        {
            aciertos++;
            rachaActual++;
        }
        else
        {
            errores++;
            rachaActual = 0;
        }

        textoRacha.text = "Racha: " + rachaActual;

        // Calcular rendimiento [0–1] para dificultad
        float precision = operacionesTotales > 0 ? (float)aciertos / operacionesTotales : 0f;

        float suma = 0f;
        foreach (float t in tiemposReaccion) suma += t;
        float tiempoMedio = suma / tiemposReaccion.Count;

        float velocidad = 1f - Mathf.Clamp(tiempoMedio / 5f, 0f, 1f);

        float rendimiento = 0.6f * precision + 0.4f * velocidad;

        DifficultyManager.Instance.ActualizarDificultad(rendimiento, esCorrecta, tiempoReaccion);
        GenerarEstimulos();

        resultado.ActivateInputField();
        resultado.Select();
    }

    public override CognitiveMetrics CalcularCognicion()
    {
        CognitiveMetrics c = new CognitiveMetrics();

        float precision = operacionesTotales > 0 ? (float)aciertos / operacionesTotales : 0f;

        float tiempoMedio = 0f;
        if (tiemposReaccion.Count > 0)
        {
            float suma = 0f;
            foreach (float t in tiemposReaccion) suma += t;
            tiempoMedio = suma / tiemposReaccion.Count;
        }

        float velocidad = tiempoMedio > 0 ? 1f / tiempoMedio : 0f;

        int impulsivas = 0;
        foreach (float t in tiemposReaccion)
            if (t < 0.3f) impulsivas++;

        float controlInhibitorio = tiemposReaccion.Count > 0
            ? 1f - ((float)impulsivas / tiemposReaccion.Count)
            : 0f;

        // Mapeo a taxonomía
        c.atencionSostenida = precision;
        c.velocidadCognitiva = Mathf.Clamp01(velocidad / 5f);
        c.memoriaTrabajo = Mathf.Clamp01(DifficultyManager.Instance.nivelActual / 10f);
        c.controlInhibitorio = controlInhibitorio;
        c.coordinacionVisomotora = Mathf.Clamp01(velocidad / 5f);

        c.atencionSelectiva = 0f;
        c.atencionDividida = 0f;
        c.memoriaEspacial = 0f;
        c.flexibilidadCognitiva = 0f;
        c.planificacion = 0f;

        return c;
    }

    public void ResetGame()
    {
        rachaActual = 0;
        operacionesTotales = 0;
        aciertos = 0;
        errores = 0;
        tiemposReaccion.Clear();

        DifficultyManager.Instance.nivelActual = 1;

        GenerarEstimulos();
    }

}
