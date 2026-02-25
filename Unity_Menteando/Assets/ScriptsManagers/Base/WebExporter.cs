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
        Debug.Log("Simulación SaveGameData: " + json);
    }
#endif

    public static void EnviarSesion(string nombreJuego, CognitiveMetrics metricas)
    {
        GameSessionData data = new GameSessionData
        {
            gameId = nombreJuego,
            timestamp = System.DateTime.UtcNow.ToString("o"),
            metrics = metricas
        };

        string json = JsonUtility.ToJson(data);
        Debug.Log("LLAMANDO A SaveGameData DESDE UNITY: " + json);
        SaveGameData(json);
    }
}
