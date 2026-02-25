using UnityEngine;

public abstract class BaseGame : MonoBehaviour
{
    protected float tiempoInicio;
    public string nombre;

    public abstract void GenerarEstimulos();
    public abstract CognitiveMetrics CalcularCognicion();

    protected void EmpezarIntento()
    {
        tiempoInicio = Time.time;
    }
}



// CognitiveMetrics.cs
[System.Serializable]
public class CognitiveMetrics
{
    public float atencionSostenida;
    public float atencionSelectiva;
    public float atencionDividida;
    public float velocidadCognitiva;
    public float memoriaTrabajo;
    public float memoriaEspacial;
    public float controlInhibitorio;
    public float flexibilidadCognitiva;
    public float planificacion;
    public float coordinacionVisomotora;
}


[System.Serializable]
public class GameSessionData
{
    public string gameId;
    public string timestamp;
    public CognitiveMetrics metrics;
}
