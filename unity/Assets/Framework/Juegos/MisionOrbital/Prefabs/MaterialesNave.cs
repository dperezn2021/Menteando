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

    
}