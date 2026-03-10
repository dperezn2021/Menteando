using UnityEngine;
using System.Collections;

public class BotonCentralController : MonoBehaviour
{
    [Header("Parte móvil del botón")]
    public Transform parteMovil;
    public float distancia = 0.2f;
    public float velocidad = 10f;

    private bool animando = false;
    private Vector3 posInicial;

    private RoscoGame juego; // ← ahora es privado

    void Start()
    {
        posInicial = parteMovil.localPosition;
    }

    public void SetJuego(RoscoGame g)
    {
        juego = g;
    }

    void OnMouseDown()
    {
        if (animando) return;
        if (juego == null) return; // seguridad

        juego.PulsarBoton();
        StartCoroutine(Animar());
    }

    IEnumerator Animar()
    {
        animando = true;

        Vector3 abajo = posInicial - new Vector3(0, distancia, 0);

        while (Vector3.Distance(parteMovil.localPosition, abajo) > 0.01f)
        {
            parteMovil.localPosition = Vector3.Lerp(parteMovil.localPosition, abajo, Time.deltaTime * velocidad);
            yield return null;
        }

        yield return new WaitForSeconds(0.05f);

        while (Vector3.Distance(parteMovil.localPosition, posInicial) > 0.01f)
        {
            parteMovil.localPosition = Vector3.Lerp(parteMovil.localPosition, posInicial, Time.deltaTime * velocidad);
            yield return null;
        }

        parteMovil.localPosition = posInicial;
        animando = false;
    }
}
