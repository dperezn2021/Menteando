using UnityEngine;
using System.Collections.Generic;

public class StarfieldEffect : MonoBehaviour
{
    [Header("Configuración")]
    public int cantidadEstrellas = 300;
    public float rangoX = 25f;
    public float rangoY = 15f;
    public float distanciaCerca = -8f;
    public float distanciaLejos = 30f;

    public float velocidadBase = 15f;
    public float variacionVelocidad = 8f;

    public float tamanioMin = 0.03f;
    public float tamanioMax = 0.12f;

    private struct Star
    {
        public Transform t;
        public float speed;
        public Material mat;
    }

    private List<Star> estrellas = new List<Star>();
    private Material baseMaterial;

    void Start()
    {
        CrearMaterialBase();
        CrearEstrellas();
    }

    void CrearMaterialBase()
    {
        Shader shader =
            Shader.Find("Universal Render Pipeline/Unlit") ??
            Shader.Find("Unlit/Texture") ??
            Shader.Find("Sprites/Default");

        baseMaterial = new Material(shader);
        baseMaterial.color = new Color(0.7f, 0.8f, 1f);
    }

    void CrearEstrellas()
    {
        Mesh sphereMesh = Resources.GetBuiltinResource<Mesh>("Sphere.fbx");

        for (int i = 0; i < cantidadEstrellas; i++)
        {
            GameObject star = new GameObject("Star");
            star.transform.SetParent(transform);

            var mf = star.AddComponent<MeshFilter>();
            var mr = star.AddComponent<MeshRenderer>();

            mf.mesh = sphereMesh;
            mr.material = new Material(baseMaterial);

            float size = Random.Range(tamanioMin, tamanioMax);
            star.transform.localScale = Vector3.one * size;

            star.transform.localPosition = new Vector3(
                Random.Range(-rangoX, rangoX),
                Random.Range(-rangoY, rangoY),
                Random.Range(distanciaCerca, distanciaLejos)
            );

            float speed = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);

            Color c = baseMaterial.color * Random.Range(0.7f, 1f);
            mr.material.color = c;

            estrellas.Add(new Star
            {
                t = star.transform,
                speed = speed,
                mat = mr.material
            });
        }
    }

    void Update()
    {
        float dt = Time.deltaTime;

        for (int i = 0; i < estrellas.Count; i++)
        {
            var s = estrellas[i];
            Vector3 pos = s.t.localPosition;

            pos.z -= s.speed * dt;

            if (pos.z < -10f)
            {
                pos.z = distanciaLejos;
                pos.x = Random.Range(-rangoX, rangoX);
                pos.y = Random.Range(-rangoY, rangoY);

                s.speed = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);

                Color c = baseMaterial.color * Random.Range(0.7f, 1f);
                s.mat.color = c;
            }

            s.t.localPosition = pos;
            estrellas[i] = s;
        }
    }
}