//using UnityEngine;
//using System.Collections;

//public class BotonCentralController : MonoBehaviour
//{
//    [Header("Parte móvil del botón")]
//    public Transform parteMovil;
//    public float distancia = 0.2f;
//    public float velocidad = 10f;

//    private bool animando = false;
//    private Vector3 posInicial;
//    private RoscoExpressGame juego; // ← referencia al juego

//    void Start()
//    {
//        posInicial = parteMovil.localPosition;

//        // Asegurar que tiene collider para detectar clicks
//        if (GetComponent<Collider>() == null)
//        {
//            BoxCollider collider = gameObject.AddComponent<BoxCollider>();
//            Debug.Log("Añadido BoxCollider automáticamente al botón");
//        }
//    }

//    public void SetJuego(RoscoExpressGame g)
//    {
//        juego = g;
//        Debug.Log("Botón conectado al juego MisionOrbitalGame");
//    }

//    void OnMouseDown()
//    {
//        if (animando) return;
//        if (juego == null)
//        {
//            Debug.LogError("Botón: juego es NULL. Llama a SetJuego() primero");
//            return;
//        }

//        Debug.Log("Botón pulsado - Disparando");
//        juego.Disparar();
//        StartCoroutine(Animar());
//    }

//    IEnumerator Animar()
//    {
//        animando = true;

//        Vector3 abajo = posInicial - new Vector3(0, distancia, 0);

//        // Animación hacia abajo
//        float tiempo = 0;
//        while (tiempo < 0.15f)  // Animación más controlada
//        {
//            tiempo += Time.deltaTime;
//            float t = tiempo / 0.15f;
//            parteMovil.localPosition = Vector3.Lerp(posInicial, abajo, t);
//            yield return null;
//        }

//        yield return new WaitForSeconds(0.05f);

//        // Animación hacia arriba
//        tiempo = 0;
//        while (tiempo < 0.15f)
//        {
//            tiempo += Time.deltaTime;
//            float t = tiempo / 0.15f;
//            parteMovil.localPosition = Vector3.Lerp(abajo, posInicial, t);
//            yield return null;
//        }

//        parteMovil.localPosition = posInicial;
//        animando = false;
//    }
//}