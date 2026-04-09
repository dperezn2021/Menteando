using UnityEngine;
using System.Collections.Generic;

public class StarfieldEffect : MonoBehaviour
{
    [Header("Configuración")]
    public int cantidadEstrellas = 300;
    public float rangoX = 25f;
    public float rangoY = 15f;
    public float distanciaMin = -10f;   // detrás
    public float distanciaMax = 80f;    // delante
    public float velocidadBase = 20f;
    public float variacionVelocidad = 10f;
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
        estrellaMaterial.color = new Color(0.7f, 0.8f, 1f); // blanco azulado
    }

    void CrearEstrellas()
    {
        for (int i = 0; i < cantidadEstrellas; i++)
        {
            GameObject estrella = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            estrella.transform.SetParent(transform);

            float tamanio = Random.Range(tamanioMin, tamanioMax);
            estrella.transform.localScale = Vector3.one * tamanio;

            Vector3 pos = new Vector3(
                Random.Range(-rangoX, rangoX),
                Random.Range(-rangoY, rangoY),
                Random.Range(distanciaMin, distanciaMax)
            );
            estrella.transform.localPosition = pos;

            float velocidad = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);
            velocidades.Add(velocidad);

            Renderer renderer = estrella.GetComponent<Renderer>();
            renderer.material = estrellaMaterial;

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

            // mover hacia atrás
            pos.z -= velocidades[i] * Time.deltaTime;

            // reciclar cuando pasan detrás
            if (pos.z < distanciaMin)
            {
                pos.z = distanciaMax;
                pos.x = Random.Range(-rangoX, rangoX);
                pos.y = Random.Range(-rangoY, rangoY);

                velocidades[i] = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);

                float brillo = Random.Range(0.7f, 1f);
                estrellas[i].GetComponent<Renderer>().material.color =
                    new Color(0.7f * brillo, 0.8f * brillo, 1f * brillo);
            }

            estrellas[i].transform.localPosition = pos;
        }
    }
}
