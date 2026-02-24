using System.Collections.Generic;
using TMPro;
using UnityEngine;
using static UnityEngine.Rendering.VolumeComponent;


public class ControladorCambioReglas : MonoBehaviour
{

    public TextMeshProUGUI textoRegla;
    public TextMeshProUGUI textoTemporizador;
    public float duracionPartida = 180f;

    private float tiempoRestante;
    private float tiempoDesdeInicio;
    private List<Intento> listaIntentos = new List<Intento>();

    private bool partidaActiva = true;

    public List<Regla> reglas = new List<Regla>();
    private int indiceReglaActual = 0;
    private float tiempoReglaActual = 0f;


    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        tiempoRestante = duracionPartida;
        tiempoDesdeInicio = 0f;
        reglas.Add(new Regla("Pulsa el botón si el fondo es azul", true, 5f));
        reglas.Add(new Regla("No pulses si el fondo es rojo", false, 5f));

        textoRegla.text = reglas[indiceReglaActual].descripcion;
    }

    // Update is called once per frame
    void Update()
    {
        if (!partidaActiva) return;

        float delta = Time.deltaTime;
        tiempoRestante -= delta;
        tiempoDesdeInicio += delta;
        // Temporizador global
        textoTemporizador.text = Mathf.Ceil(tiempoRestante).ToString();

        // Temporizador de regla
        tiempoReglaActual += delta;
        if (tiempoReglaActual >= reglas[indiceReglaActual].duracion)
        {
            CambiarRegla();
        }

        if (tiempoRestante <= 0)
        {
            partidaActiva = false;
            textoRegla.text = "Fin de la partida";
            ExportarDatos();
        }
    }

    void CambiarRegla()
    {
        indiceReglaActual++;
        if (indiceReglaActual >= reglas.Count)
        {
            indiceReglaActual = 0; // volver al inicio o podrías generar reglas nuevas dinámicamente
        }

        tiempoReglaActual = 0f;
        textoRegla.text = reglas[indiceReglaActual].descripcion;
    }


    // Nuevo método llamado por el botón
    public void RegistrarPulsacion()
    {
        if (!partidaActiva) return;

        Regla reglaActual = reglas[indiceReglaActual];

        Intento intento = new Intento();
        intento.indiceRegla = indiceReglaActual;
        intento.descripcionRegla = reglaActual.descripcion;
        intento.debeResponder = reglaActual.requierePulsar;
        intento.respondio = true;
        intento.tiempoReaccion = tiempoDesdeInicio;
        intento.correcto = (reglaActual.requierePulsar == true); // pulsó y debía pulsar → correcto
        intento.tiempoDesdeInicio = tiempoDesdeInicio;
        intento.trasCambioDeRegla = false;

        listaIntentos.Add(intento);

        tiempoDesdeInicio = 0f;
    }


    void ExportarDatos()
    {
        Sesion sesion = new Sesion();
        sesion.idSesion = System.Guid.NewGuid().ToString();
        sesion.duracionTotal = duracionPartida;
        sesion.intentos = listaIntentos;

        string json = JsonUtility.ToJson(sesion);
        Debug.Log(json);

        // Aquí luego mandarías a la web con Application.ExternalCall
    }
}
