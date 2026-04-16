using UnityEngine;

public class MaterialesNave : MonoBehaviour
{
    public static MaterialesNave Instance;

    [Header("Materiales de las Naves")]
    public Material NaveActiva;     // Amarillo brillante
    public Material NaveObjetivo;   // Rojo intenso
    public Material NaveNeutral;    // Azul metálico
    public Material NaveImpacto;    // Verde para feedback

    private void Awake()
    {
        // Singleton para acceder desde cualquier script
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Start()
    {
        // Verificar que los materiales están asignados
        if (NaveActiva == null)
            Debug.LogWarning("⚠️ Asigna el material Nave Activa en el Inspector");
        if (NaveObjetivo == null)
            Debug.LogWarning("⚠️ Asigna el material Nave Objetivo en el Inspector");
        if (NaveNeutral == null)
            Debug.LogWarning("⚠️ Asigna el material Nave Neutral en el Inspector");
        if (NaveImpacto == null)
            Debug.LogWarning("⚠️ Asigna el material Nave Impacto en el Inspector");
        else
            Debug.Log("✅ Todos los materiales de naves están asignados correctamente");
    }
}