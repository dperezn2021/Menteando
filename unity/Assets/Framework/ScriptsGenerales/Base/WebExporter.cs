using System.Runtime.InteropServices;
using UnityEngine;

public static class WebExporter
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void SaveGameData(string json);
#else
    private static void SaveGameData(string json)
    {
        Debug.Log("Simulaci�n SaveGameData: " + json);  
    }
#endif

    public static void EnviarSesion(string nombreJuego, CognitiveMetrics metricas)
    {
        float scoreTotal =
            metricas.atencionSelectiva +
            metricas.atencionSostenida +
            metricas.atencionDividida +
            metricas.memoriaTrabajo +
            metricas.memoriaEspacial +
            metricas.controlInhibitorio +
            metricas.flexibilidadCognitiva +
            metricas.planificacion +
            metricas.velocidadCognitiva +
            metricas.coordinacionVisomotora;



        float puntos = scoreTotal * 100; // si genera 0.7 de scoretotal, mandamos 70 puntos

        GameSessionData data = new GameSessionData
        {
            gameId = nombreJuego,
            timestamp = System.DateTime.UtcNow.ToString("o"),
            metrics = metricas,
            puntos = puntos
        };

        string json = JsonUtility.ToJson(data);
        SaveGameData(json);
    }

    public static void EnviarSesionCruda(string nombreJuego, RawEcoVisualData rawData)
    {
        float puntos = CalcularPuntosDesdeRendimiento(rawData);

        RawGameSessionData data = new RawGameSessionData
        {
            gameId = nombreJuego,
            timestamp = System.DateTime.UtcNow.ToString("o"),
            rawGameData = rawData,
            puntos = puntos
        };

        string json = JsonUtility.ToJson(data);
        SaveGameData(json);
    }

    private static float CalcularPuntosDesdeRendimiento(RawEcoVisualData rawData)
    {
        if (rawData.puntuacionMaximaTotal <= 0) return 0f;
        float rendimiento = (float)rawData.puntuacionTotal / rawData.puntuacionMaximaTotal;
        return rendimiento * 100f;
    }

}
