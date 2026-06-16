using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using System.Collections;

public class MenuDetectorIntrusos : MonoBehaviour
{
    [Header("Muñeco")]
    public Image characterImage;
    public Sprite[] idleLeftSprites;   // 2 sprites mirando izquierda
    public Sprite[] idleRightSprites;  // 2 sprites mirando derecha
    public float animacionVelocidad = 0.15f;

    [Header("Botones")]
    public Button botonEmpezar;
    public Button botonAjustes;

    [Header("Escala Hover")]
    public float escalaHover = 1.05f;
    public float duracionAnimacion = 0.1f;

    private Coroutine animacionCoroutine;
    private int frameActual = 0;
    private bool mirandoDerecha = false;
    private Button botonActualHover = null;
    private Vector3 escalaOriginalBotonEmpezar;
    private Vector3 escalaOriginalBotonAjustes;

    // Guardar la última dirección activa
    private bool ultimaDireccionDerecha = false;

    private void Start()
    {
        // Guardar escalas originales
        if (botonEmpezar != null)
            escalaOriginalBotonEmpezar = botonEmpezar.transform.localScale;
        if (botonAjustes != null)
            escalaOriginalBotonAjustes = botonAjustes.transform.localScale;

        // Iniciar animación idle con la última dirección guardada
        CambiarDireccion(ultimaDireccionDerecha);

        // Configurar detección de hover en los botones
        ConfigurarHoverBoton(botonEmpezar, false);
        ConfigurarHoverBoton(botonAjustes, true);
    }

    private void ConfigurarHoverBoton(Button boton, bool mirarDerechaAlHover)
    {
        if (boton == null) return;

        // Añadir EventTrigger si no existe
        EventTrigger trigger = boton.gameObject.GetComponent<EventTrigger>();
        if (trigger == null)
            trigger = boton.gameObject.AddComponent<EventTrigger>();

        // Limpiar triggers existentes
        trigger.triggers.Clear();

        // Evento: mouse entra
        var pointerEnter = new EventTrigger.Entry();
        pointerEnter.eventID = EventTriggerType.PointerEnter;
        pointerEnter.callback.AddListener((data) => { OnBotonHover(boton, mirarDerechaAlHover); });
        trigger.triggers.Add(pointerEnter);

        // Evento: mouse sale
        var pointerExit = new EventTrigger.Entry();
        pointerExit.eventID = EventTriggerType.PointerExit;
        pointerExit.callback.AddListener((data) => { OnBotonExit(boton); });
        trigger.triggers.Add(pointerExit);
    }

    private void OnBotonHover(Button boton, bool mirarDerecha)
    {
        // Si ya está hover en otro botón, restaurarlo
        if (botonActualHover != null && botonActualHover != boton)
            RestaurarEscalaBoton(botonActualHover);

        botonActualHover = boton;

        // Cambiar dirección del muñeco (temporal durante hover)
        CambiarDireccion(mirarDerecha);

        // Animar escala del botón
        StartCoroutine(AnimarEscalaBoton(boton, escalaHover));
    }

    private void OnBotonExit(Button boton)
    {
        if (botonActualHover == boton)
        {
            botonActualHover = null;

            // RESTAURAR LA ÚLTIMA DIRECCIÓN GUARDADA, no volver siempre a izquierda
            CambiarDireccion(ultimaDireccionDerecha);

            // Restaurar escala
            RestaurarEscalaBoton(boton);
        }
    }

    private void RestaurarEscalaBoton(Button boton)
    {
        Vector3 escalaOriginal = (boton == botonEmpezar) ? escalaOriginalBotonEmpezar : escalaOriginalBotonAjustes;
        StartCoroutine(AnimarEscalaBoton(boton, escalaOriginal));
    }

    private IEnumerator AnimarEscalaBoton(Button boton, Vector3 escalaObjetivo)
    {
        if (boton == null) yield break;

        Vector3 escalaInicial = boton.transform.localScale;
        float tiempo = 0;

        while (tiempo < duracionAnimacion)
        {
            tiempo += Time.deltaTime;
            float t = tiempo / duracionAnimacion;
            boton.transform.localScale = Vector3.Lerp(escalaInicial, escalaObjetivo, t);
            yield return null;
        }

        boton.transform.localScale = escalaObjetivo;
    }

    private IEnumerator AnimarEscalaBoton(Button boton, float escalaMultiplicador)
    {
        Vector3 escalaObjetivo = (boton == botonEmpezar) ?
            escalaOriginalBotonEmpezar * escalaMultiplicador :
            escalaOriginalBotonAjustes * escalaMultiplicador;

        yield return AnimarEscalaBoton(boton, escalaObjetivo);
    }

    private void CambiarDireccion(bool derecha)
    {
        if (mirandoDerecha == derecha) return;

        mirandoDerecha = derecha;

        // GUARDAR la última dirección activa (incluso durante hover)
        ultimaDireccionDerecha = derecha;

        if (animacionCoroutine != null)
            StopCoroutine(animacionCoroutine);

        animacionCoroutine = StartCoroutine(AnimacionIdle());
    }

    private IEnumerator AnimacionIdle()
    {
        Sprite[] spritesActuales = mirandoDerecha ? idleRightSprites : idleLeftSprites;

        if (spritesActuales == null || spritesActuales.Length == 0)
            yield break;

        frameActual = 0;

        while (true)
        {
            characterImage.sprite = spritesActuales[frameActual % spritesActuales.Length];
            frameActual++;
            yield return new WaitForSeconds(animacionVelocidad);
        }
    }

    // Método público por si necesitas resetear la dirección manualmente
    public void ResetearDireccion(bool izquierda = true)
    {
        ultimaDireccionDerecha = !izquierda;
        if (botonActualHover == null)
            CambiarDireccion(ultimaDireccionDerecha);
    }
}