using UnityEngine;
using System.Collections.Generic;

public class StarfieldEffect : MonoBehaviour
{
    [Header("Configuración")]
    public int cantidadEstrellas = 300;
    public float rangoX = 25f;
    public float rangoY = 15f;
    public float profundidadInicial = -5f;
    public float profundidadMax = 30f;
    public float velocidadBase = 15f;
    public float variacionVelocidad = 8f;
    public float tamanioMin = 0.03f;
    public float tamanioMax = 0.12f;

    [Header("Efectos visuales")]
    public bool usarParpadeo = true;
    public float brilloMin = 0.4f;
    public float brilloMax = 1f;

    private struct Star
    {
        public Transform t;
        public float speed;
        public Material mat;
        public float baseBrightness;
        public float parpadeoSpeed;
    }

    private List<Star> estrellas = new List<Star>();
    private Material baseMaterial;
    private Transform camaraTransform;
    private float profundidadLimiteReinicio;

    void Start()
    {
        CrearMaterialBase();

        // Detectar la cámara principal
        if (Camera.main != null)
            camaraTransform = Camera.main.transform;

        profundidadLimiteReinicio = profundidadInicial - 10f;

        CrearEstrellas();
    }

    void CrearMaterialBase()
    {
        Shader shader = Shader.Find("Universal Render Pipeline/Unlit") ??
                        Shader.Find("Unlit/Texture") ??
                        Shader.Find("Sprites/Default");

        if (shader == null)
        {
            Debug.LogError("No se encontró ningún shader válido para las estrellas");
            return;
        }

        baseMaterial = new Material(shader);
        baseMaterial.color = Color.white;
    }

    void CrearEstrellas()
    {
        Mesh sphereMesh = Resources.GetBuiltinResource<Mesh>("Sphere.fbx");
        if (sphereMesh == null)
        {
            sphereMesh = GameObject.CreatePrimitive(PrimitiveType.Sphere).GetComponent<MeshFilter>().mesh;
            DestroyImmediate(sphereMesh);
        }

        for (int i = 0; i < cantidadEstrellas; i++)
        {
            GameObject star = new GameObject($"Star_{i}");
            star.transform.SetParent(transform);

            var mf = star.AddComponent<MeshFilter>();
            var mr = star.AddComponent<MeshRenderer>();

            mf.mesh = sphereMesh;
            mr.material = new Material(baseMaterial);

            float size = Random.Range(tamanioMin, tamanioMax);
            star.transform.localScale = Vector3.one * size;

            // Posición inicial aleatoria en todo el rango
            star.transform.localPosition = new Vector3(
                Random.Range(-rangoX, rangoX),
                Random.Range(-rangoY, rangoY),
                Random.Range(profundidadInicial, profundidadMax)
            );

            float speed = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);
            speed = Mathf.Max(5f, speed); // Velocidad mínima para evitar estrellas quietas

            float brightness = Random.Range(brilloMin, brilloMax);
            Color starColor = new Color(0.7f * brightness, 0.8f * brightness, 1f * brightness);
            mr.material.color = starColor;

            estrellas.Add(new Star
            {
                t = star.transform,
                speed = speed,
                mat = mr.material,
                baseBrightness = brightness,
                parpadeoSpeed = Random.Range(0.5f, 2f)
            });
        }
    }

    void Update()
    {
        float dt = Time.deltaTime;
        if (dt <= 0) return;

        for (int i = 0; i < estrellas.Count; i++)
        {
            var s = estrellas[i];
            if (s.t == null || s.mat == null) continue;

            Vector3 pos = s.t.localPosition;

            // 🔥 Mover hacia la cámara (en lugar de hacia atrás)
            pos.z -= s.speed * dt;

            // 🔥 CRUCIAL: Reposicionar cuando pasan la cámara
            if (pos.z < profundidadLimiteReinicio)
            {
                // Reposicionar al frente
                pos.z = profundidadMax;
                pos.x = Random.Range(-rangoX, rangoX);
                pos.y = Random.Range(-rangoY, rangoY);

                // Reiniciar velocidad con variación
                s.speed = velocidadBase + Random.Range(-variacionVelocidad, variacionVelocidad);
                s.speed = Mathf.Max(5f, s.speed);

                // 🔥 Actualizar brillo al reaparecer (más vivas)
                float brightness = Random.Range(brilloMin, brilloMax);
                s.baseBrightness = brightness;

                if (usarParpadeo)
                {
                    Color c = new Color(0.7f * brightness, 0.8f * brightness, 1f * brightness);
                    s.mat.color = c;
                }
            }

            // 🔥 Efecto de parpadeo (opcional)
            if (usarParpadeo)
            {
                float parpadeo = 0.7f + Mathf.Sin(Time.time * s.parpadeoSpeed + i) * 0.3f;
                float brilloActual = s.baseBrightness * parpadeo;
                Color c = new Color(0.7f * brilloActual, 0.8f * brilloActual, 1f * brilloActual);
                s.mat.color = c;
            }

            // 🔥 Cambiar tamaño según distancia (perspectiva)
            float tDist = Mathf.InverseLerp(profundidadLimiteReinicio, profundidadMax, pos.z);
            float scale = Mathf.Lerp(tamanioMin, tamanioMax, tDist);
            s.t.localScale = Vector3.one * scale;

            s.t.localPosition = pos;
            estrellas[i] = s;
        }
    }

    // 🔥 Método para reposicionar una estrella manualmente (útil si la cámara se teletransporta)
    public void ReposicionarEstrellas()
    {
        foreach (var s in estrellas)
        {
            if (s.t == null) continue;

            Vector3 pos = s.t.localPosition;
            pos.z = Random.Range(profundidadInicial, profundidadMax);
            pos.x = Random.Range(-rangoX, rangoX);
            pos.y = Random.Range(-rangoY, rangoY);
            s.t.localPosition = pos;
        }
    }

    void OnDestroy()
    {
        foreach (var s in estrellas)
        {
            if (s.mat != null)
                Destroy(s.mat);
            if (s.t != null && s.t.gameObject != null)
                Destroy(s.t.gameObject);
        }
        estrellas.Clear();

        if (baseMaterial != null)
            Destroy(baseMaterial);
    }
}