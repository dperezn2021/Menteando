using UnityEngine;
using System.Collections.Generic;

public class StarfieldEffect : MonoBehaviour
{
    [Header("Configuración")]
    public int cantidadEstrellas = 300;
    public float rangoX = 25f;
    public float rangoY = 15f;
    public float distanciaCerca = -8f;   // Justo delante de la cámara (cámara en -10)
    public float distanciaLejos = 30f;    // Lejos
    public float velocidadBase = 15f;
    public float variacionVelocidad = 8f;
    public float tamanioMin = 0.03f;
    public float tamanioMax = 0.12f;

    private List<GameObject> estrellas = new List<GameObject>();
    private List<float> velocidades = new List<float>();
    private Material estrellaMaterial;

    void Start()
    {
        CrearMaterial();
        CrearEstrellas();
    }

    void CrearMaterial()
    {
        estrellaMaterial = new Material(Shader.Find("Unlit/Color"));
        if (estrellaMaterial == null)
            estrellaMaterial = new Material(Shader.Find("Standard"));
        estrellaMaterial.color = new Color(0.7f, 0.8f, 1f);
    }

    void CrearEstrellas()
    {
        for (int i = 0; i < cantidadEstrellas; i++)
        {
            // Crear esfera SIN usar CreatePrimitive (que añade collider automáticamente)
            GameObject estrella = new GameObject("Estrella");
            estrella.transform.SetParent(transform);

            // Añadir un MeshFilter con una esfera
            MeshFilter meshFilter = estrella.AddComponent<MeshFilter>();
            meshFilter.mesh = Resources.GetBuiltinResource<Mesh>("Sphere.fbx");

            // Añadir MeshRenderer
            MeshRenderer renderer = estrella.AddComponent<MeshRenderer>();
            renderer.material = estrellaMaterial;

            // Tamaño
            float tamanio = Random.Range(tamanioMin, tamanioMax);
            estrella.transform.localScale = Vector3.one * tamanio;

            // Posición
            Vector3 pos = new Vector3(
                Random.Range(-rangoX, rangoX),
                Random.Range(-rangoY, rangoY),
                Random.Range(distanciaCerca, distanciaLejos)
            );
            estrella.transform.localPosition = pos;

            // Velocidad
            float velocidad = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);
            velocidades.Add(velocidad);

            // Brillo
            float brillo = Random.Range(0.7f, 1f);
            renderer.material.color = new Color(0.7f * brillo, 0.8f * brillo, 1f * brillo);

            estrellas.Add(estrella);
        }
    }

    void Update()
    {
        MoverEstrellas();
    }

    void MoverEstrellas()
    {
        for (int i = 0; i < estrellas.Count; i++)
        {
            Vector3 pos = estrellas[i].transform.localPosition;

            // Las estrellas se ACERCAN a la cámara (disminuyen Z)
            // Como la cámara está en -10, al disminuir Z se acercan
            pos.z -= velocidades[i] * Time.deltaTime;

            // Si pasan la cámara (z < -10) o llegan muy cerca, reciclar
            if (pos.z < -10f)  // Pasaron la cámara
            {
                pos.z = distanciaLejos;  // Reaparecen lejos
                pos.x = Random.Range(-rangoX, rangoX);
                pos.y = Random.Range(-rangoY, rangoY);

                // Nueva velocidad aleatoria
                velocidades[i] = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);

                // Nuevo brillo aleatorio
                float brillo = Random.Range(0.7f, 1f);
                estrellas[i].GetComponent<Renderer>().material.color =
                    new Color(0.7f * brillo, 0.8f * brillo, 1f * brillo);
            }

            estrellas[i].transform.localPosition = pos;
        }
    }
}