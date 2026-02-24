using UnityEngine;

public class ScoreManager : MonoBehaviour
{
    public static ScoreManager Instance;
    

    private void Awake()
    {
        if(Instance == null) Instance = this;
        else Destroy(gameObject);
    }

    public void ProcesarMetricas(GameMetrics m)
    {
        Debug.Log("----- RESULTADOS FINALES -----");
        Debug.Log($"Precisión: {(m.precision * 100f):F1}%");
        Debug.Log($"Velocidad media: {m.velocidadMedia:F2} s");
        Debug.Log($"Consistencia: {m.consistencia:F2}");
        Debug.Log($"Control inhibitorio: {m.controlInhibitorio:F2}");
        Debug.Log($"Índice de Atención: {m.indiceAtencion:F1}");
        Debug.Log($"Índice de Velocidad: {m.indiceVelocidad:F1}");
    }

}
