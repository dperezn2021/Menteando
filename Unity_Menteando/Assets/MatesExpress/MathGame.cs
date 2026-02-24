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
    
    private int respuestaCorrecta;
    private int rachaActual = 0;
    private int rachaMaxima = 0;
    private int operacionesTotales = 0;

    private void Awake()
    {
        nombre = "math";
    }

    private void Start()
    {
        GameManager.Instance.EmpezarJuego(this);
        GenerarEstimulos();
    }

    public override void EvaluarRespuestas(bool correcta)
    {
        throw new System.NotImplementedException();
    }

    /*public override void GenerarEstimulos()
    {
        int nivel = DifficultyManager.Instance.nivelActual;

        int a = 0;
        int b = 0;
        int c = 0;

        string operacion = "";
        string operacion2 = "";

        if (nivel == 1)
        {
            a = Random.Range(1, 10);
            b = Random.Range(1, 10);
            operacion = Random.value > 0.5f ? "+" : "-";
            respuestaCorrecta = (operacion == "+") ? a + b : a - b;
            textoOperacion.text = a + " " + operacion + " " + b;
        }
        else if (nivel == 2)
        {
            a = Random.Range(5, 20);
            b = Random.Range(1, 20);
            operacion = Random.value > 0.5f ? "+" : "-";
            respuestaCorrecta = (operacion == "+") ? a + b : a - b;
            textoOperacion.text = a + " " + operacion + " " + b;
        }
        else if (nivel == 3)
        {
            a = Random.Range(2, 12);
            b = Random.Range(2, 12);
            operacion = "*";
            respuestaCorrecta = a * b;
            textoOperacion.text = a + " * " + b;
        }
        else
        {
            a = Random.Range(2, 15);
            b = Random.Range(2, 15);
            c = Random.Range(1, 10);

            operacion = Random.value > 0.5f ? "+" : "*";
            operacion2 = Random.value > 0.5f ? "+" : "-";

            int temp = (operacion == "+") ? a + b : a * b;
            respuestaCorrecta = (operacion2 == "+") ? temp + c : temp - c;

            textoOperacion.text = "(" + a + " " + operacion + " " + b + ") " + operacion2 + " " + c;
        }

        resultado.text = "";
        EmpezarIntento();
    }*/

    public override void GenerarEstimulos()
    {
        int nivel = DifficultyManager.Instance.nivelActual;

        // 1. Rango de números según nivel
        int max = 5 + nivel * 4;

        // 2. Número de operaciones según nivel
        int numOps = Mathf.Clamp(1 + nivel / 4, 1, 5);

        string[] ops = { "+", "-", "*", "/" };

        List<int> nums = new List<int>();
        List<string> operadores = new List<string>();

        // Generar números
        for (int i = 0; i < numOps + 1; i++)
            nums.Add(Random.Range(1, max));

        // Generar operadores aleatorios
        for (int i = 0; i < numOps; i++)
            operadores.Add(ops[Random.Range(0, ops.Length)]);

        // Ajustar divisiones para que sean exactas
        for (int i = 0; i < operadores.Count; i++)
        {
            if (operadores[i] == "/")
            {
                int divisor = nums[i + 1];
                int resultado = Random.Range(1, max);
                nums[i] = divisor * resultado;
            }
        }

        // Construir operación en texto
        string operacion = nums[0].ToString();
        for (int i = 0; i < operadores.Count; i++)
            operacion += " " + operadores[i] + " " + nums[i + 1];

        textoOperacion.text = operacion;

        // Calcular respuesta correcta
        respuestaCorrecta = EvaluarOperacion(nums, operadores);

        resultado.text = "";
        EmpezarIntento();
    }


    private int EvaluarOperacion(List<int> nums, List<string> ops)
    {
        int resultado = nums[0];

        for (int i = 0; i < ops.Count; i++)
        {
            switch (ops[i])
            {
                case "+": resultado += nums[i + 1]; break;
                case "-": resultado -= nums[i + 1]; break;
                case "*": resultado *= nums[i + 1]; break;
                case "/": resultado /= nums[i + 1]; break;
            }
        }

        return resultado;
    }



    public void CorregirRespuesta()
    {
        if (!int.TryParse(resultado.text, out int respuesta)) return;

        bool esCorrecta = respuesta == respuestaCorrecta;

        RegistrarRespuesta(esCorrecta);

        operacionesTotales++;

        if (esCorrecta)
        {
            rachaActual++;
            if(rachaActual > rachaMaxima)
            {
                rachaMaxima = rachaActual;
            }
        }
        else
        {
            rachaActual = 0;
        }

        textoRacha.text = "Racha:" + rachaActual;

        AdaptarDificultad();

        GenerarEstimulos();

        resultado.ActivateInputField();
        resultado.Select(); 
    }

    private void AdaptarDificultad()
    {
        if (tiemposReaccion.Count < 5) return;

        //--- 1. PRECISIÓN ---
        float precision = (float)respuestasCorrectas / (respuestasCorrectas + respuestasIncorrectas);
        
        // --- 2. VELOCIDAD ---
        float suma = 0f; 
        foreach (float t in tiemposReaccion) 
            suma += t; 
        float tiempoMedio = suma / tiemposReaccion.Count; 
        float velocidad = 1f - Mathf.Clamp(tiempoMedio / 5f, 0f, 1f);
        
        // --- 3. CONSISTENCIA ---
        float varianza = 0f; 
        foreach (float t in tiemposReaccion) 
            varianza += Mathf.Pow(t - tiempoMedio, 2); 
        float desviacion = Mathf.Sqrt(varianza / tiemposReaccion.Count); 
        float consistencia = 1f - Mathf.Clamp(desviacion / tiempoMedio, 0f, 1f);
        
        // --- 4. CONTROL INHIBITORIO ---
        int impulsivas = 0; 
        foreach (float t in tiemposReaccion) 
            if (t < 0.3f) 
                impulsivas++; 
        float controlInhibitorio = 1f - ((float)impulsivas / tiemposReaccion.Count);

        Debug.Log($"PRECISION: {precision}");
        Debug.Log($"VELOCIDAD: {velocidad}");
        Debug.Log($"CONSISTENCIA: {consistencia}");
        Debug.Log($"CONTROL: {controlInhibitorio}");
        Debug.Log("TIEMPOS: " + string.Join(", ", tiemposReaccion));


        // --- ACTUALIZAR DIFICULTAD ---
        DifficultyManager.Instance.ActualizarDificultad( precision, velocidad, consistencia, controlInhibitorio);
     
    }

    public override GameMetrics GetMetricas()
    {
        return MetricsManager.CalcularMetricas(
            respuestasCorrectas,
            respuestasIncorrectas,
            0, // omisiones si no las usas
            tiemposReaccion
        );
    }


}
