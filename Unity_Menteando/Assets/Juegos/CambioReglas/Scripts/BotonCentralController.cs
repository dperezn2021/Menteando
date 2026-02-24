using UnityEngine;
using System.Collections;

public class BotonCentralController : MonoBehaviour
{
    public ControladorCambioReglas controlador;

    [Header("Animación física")]
    public Transform pulsador;              // Parte que baja
    public float distanciaBajada = 500.0f;
    public float velocidad = 5.0f;

    private Vector3 posicionInicial;
    private bool estaAnimando = false;

    void Start()
    {
        posicionInicial = pulsador.localPosition;
    }

    void OnMouseDown()
    {
        if (!estaAnimando)
        {
            StartCoroutine(AnimarBoton());
            controlador.RegistrarPulsacion();
        }
    }

    IEnumerator AnimarBoton()
    {
        estaAnimando = true;

        Vector3 posicionObjetivo = posicionInicial - new Vector3(distanciaBajada, 0, 0);

        // Baja
        while (Vector3.Distance(pulsador.localPosition, posicionObjetivo) > 0.001f)
        {
            pulsador.localPosition = Vector3.Lerp(
                pulsador.localPosition,
                posicionObjetivo,
                Time.deltaTime * velocidad
            );
            yield return null;
        }

        yield return new WaitForSeconds(0.1f);

        // Sube
        while (Vector3.Distance(pulsador.localPosition, posicionInicial) > 0.001f)
        {
            pulsador.localPosition = Vector3.Lerp(
                pulsador.localPosition,
                posicionInicial,
                Time.deltaTime * velocidad
            );
            yield return null;
        }

        pulsador.localPosition = posicionInicial;
        estaAnimando = false;
    }
}
