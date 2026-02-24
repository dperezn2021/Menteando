using System.Collections.Generic;
using UnityEngine;

public abstract class BaseGame : MonoBehaviour
{
    protected float tiempoInicio;
    protected int respuestasCorrectas;
    protected int respuestasIncorrectas;
    protected int omisiones;
    protected List<float> tiemposReaccion = new List<float>();
    private const int VENTANA_TIEMPOS = 10; // o 15 si quieres más inercia

    public string nombre;

    public abstract void GenerarEstimulos();
    public abstract void EvaluarRespuestas(bool correcta);

    protected void EmpezarIntento()
    {
        tiempoInicio = Time.time;
    }
    protected void RegistrarRespuesta(bool esCorrecta)
    {
        float tiempoReaccion = Time.time - tiempoInicio;
        tiemposReaccion.Add(tiempoReaccion);

        // Ventana móvil: solo guardamos los últimos N tiempos
        if (tiemposReaccion.Count > VENTANA_TIEMPOS)
            tiemposReaccion.RemoveAt(0);

        if (esCorrecta) respuestasCorrectas++;
        else respuestasIncorrectas++;

    }

    public virtual GameMetrics GetMetricas()
    {
        return MetricsManager.CalcularMetricas(
            respuestasCorrectas,
            respuestasIncorrectas,
            omisiones,
            tiemposReaccion
        );
    }

}

[System.Serializable]
public class GameMetrics
{
    public float precision;
    public float velocidadMedia;
    public float consistencia;
    public float controlInhibitorio;

    public float indiceAtencion;
    public float indiceVelocidad;
}

[System.Serializable]
public class GameSessionData
{
    public string gameId;
    public string timestamp;
    public GameMetrics metrics;
}
