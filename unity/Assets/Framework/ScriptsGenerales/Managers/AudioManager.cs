using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [Header("Fuentes de Audio")]
    public AudioSource musicaSource;
    public AudioSource sfxSource;

    [Header("Clips Globales")]
    public AudioClip clickUI;
    public AudioClip disparo;
    public AudioClip acierto;
    public AudioClip error;
    public AudioClip nivelUp;
    public AudioClip musicaMenu;
    public AudioClip musicaJuego;
    public AudioClip musicaVictoria;

    [Header("Volumen")]
    [Range(0f, 1f)] public float musicaVolumen = 0.5f;
    [Range(0f, 1f)] public float sfxVolumen = 0.5f;

    [Header("Fallback procedural")]
    public bool generarClipsFallback = true;
    public bool reemplazarMusicasDuplicadasConFallback = true;
    [Range(0.05f, 1f)] public float volumenMusicaFallback = 0.28f;

    private const int FrecuenciaMuestreo = 22050;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);

            // Siempre empezar en 0.5
            musicaVolumen = 0.5f;
            sfxVolumen = 0.5f;

            PlayerPrefs.SetFloat("MusicVolume", musicaVolumen);
            PlayerPrefs.SetFloat("SFXVolume", sfxVolumen);

            PrepararClipsFallback();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void Start()
    {
        AplicarVolumenes();
    }

    private void AplicarVolumenes()
    {
        if (musicaSource != null)
            musicaSource.volume = musicaVolumen;

        if (sfxSource != null)
            sfxSource.volume = sfxVolumen;
    }

    public void SetMusicaVolumen(float vol)
    {
        musicaVolumen = vol;

        if (musicaSource != null)
            musicaSource.volume = vol;

        PlayerPrefs.SetFloat("MusicVolume", vol);
    }

    public void SetSFXVolumen(float vol)
    {
        sfxVolumen = vol;

        if (sfxSource != null)
            sfxSource.volume = vol;

        PlayerPrefs.SetFloat("SFXVolume", vol);
    }

    public void ReproducirMusica(AudioClip musica, bool loop = true)
    {
        if (musicaSource == null || musica == null)
            return;

        if (musicaSource.clip == musica && musicaSource.isPlaying)
            return;

        musicaSource.Stop();
        musicaSource.clip = musica;
        musicaSource.loop = loop;
        musicaSource.Play();
    }

    public void ReproducirSFX(AudioClip clip)
    {
        if (sfxSource == null || clip == null)
            return;

        sfxSource.PlayOneShot(clip, sfxVolumen);
    }

    public void Click() => ReproducirSFX(clickUI);
    public void Disparo() => ReproducirSFX(disparo);
    public void Acierto() => ReproducirSFX(acierto);
    public void Error() => ReproducirSFX(error);
    public void NivelUp() => ReproducirSFX(nivelUp);
    public void MusicaMenu() => ReproducirMusica(musicaMenu);
    public void MusicaJuego() => ReproducirMusica(musicaJuego);
    public void MusicaVictoria() => ReproducirMusica(musicaVictoria, false);

    private void PrepararClipsFallback()
    {
        if (!generarClipsFallback) return;

        if (clickUI == null)
            clickUI = CrearSFXClick();

        if (acierto == null)
            acierto = CrearSFXAcierto();

        if (error == null)
            error = CrearSFXError();

        if (nivelUp == null)
            nivelUp = CrearSFXNivelUp();

        if (musicaMenu == null)
            musicaMenu = CrearMusicaProcedural("Musica_Menu_Fallback", false);

        if (musicaJuego == null || (reemplazarMusicasDuplicadasConFallback && musicaJuego == musicaMenu))
            musicaJuego = CrearMusicaProcedural("Musica_Partida_Fallback", true);

        if (musicaVictoria == null || (reemplazarMusicasDuplicadasConFallback && (musicaVictoria == musicaMenu || musicaVictoria == musicaJuego)))
            musicaVictoria = CrearSFXVictoriaLarga();
    }

    private AudioClip CrearSFXClick()
    {
        return CrearClipProcedural("SFX_Click_Fallback", 0.07f, (t, d) =>
        {
            float frecuencia = Mathf.Lerp(1050f, 640f, t / d);
            return Mathf.Sin(2f * Mathf.PI * frecuencia * t) * Envolvente(t, d, 0.004f, 0.045f) * 0.35f;
        });
    }

    private AudioClip CrearSFXAcierto()
    {
        return CrearClipProcedural("SFX_Acierto_Fallback", 0.24f, (t, d) =>
        {
            float frecuencia = t < 0.11f ? 660f : 880f;
            float armonico = Mathf.Sin(2f * Mathf.PI * frecuencia * 1.5f * t) * 0.35f;
            return (Mathf.Sin(2f * Mathf.PI * frecuencia * t) + armonico) * Envolvente(t, d, 0.01f, 0.08f) * 0.34f;
        });
    }

    private AudioClip CrearSFXError()
    {
        return CrearClipProcedural("SFX_Error_Fallback", 0.28f, (t, d) =>
        {
            float frecuencia = Mathf.Lerp(250f, 130f, t / d);
            return Mathf.Sin(2f * Mathf.PI * frecuencia * t) * Envolvente(t, d, 0.008f, 0.12f) * 0.38f;
        });
    }

    private AudioClip CrearSFXNivelUp()
    {
        float[] notas = { 523.25f, 659.25f, 783.99f, 1046.5f };
        return CrearClipProcedural("SFX_NivelUp_Fallback", 0.46f, (t, d) =>
        {
            int indice = Mathf.Clamp(Mathf.FloorToInt(t / 0.11f), 0, notas.Length - 1);
            float frecuencia = notas[indice];
            return Mathf.Sin(2f * Mathf.PI * frecuencia * t) * Envolvente(t, d, 0.008f, 0.14f) * 0.32f;
        });
    }

    private AudioClip CrearSFXVictoriaLarga()
    {
        float[] notas = { 523.25f, 659.25f, 783.99f, 1046.5f, 1318.5f };
        return CrearClipProcedural("SFX_Victoria_Fallback", 1.1f, (t, d) =>
        {
            int indice = Mathf.Clamp(Mathf.FloorToInt(t / 0.18f), 0, notas.Length - 1);
            float frecuencia = notas[indice];
            float pad = Mathf.Sin(2f * Mathf.PI * 261.63f * t) * 0.18f;
            return (Mathf.Sin(2f * Mathf.PI * frecuencia * t) + pad) * Envolvente(t, d, 0.02f, 0.24f) * 0.30f;
        });
    }

    private AudioClip CrearMusicaProcedural(string nombre, bool partida)
    {
        float duracion = 8f;
        float[] raices = partida
            ? new[] { 220f, 246.94f, 196f, 293.66f }
            : new[] { 196f, 220f, 261.63f, 220f };

        return CrearClipProcedural(nombre, duracion, (t, d) =>
        {
            float progreso = Mathf.Repeat(t / d, 1f);
            int indice = Mathf.Clamp(Mathf.FloorToInt(progreso * raices.Length), 0, raices.Length - 1);
            float raiz = raices[indice];
            float pulso = partida ? Mathf.Lerp(0.72f, 1f, Mathf.PingPong(t * 2f, 1f)) : Mathf.Lerp(0.86f, 1f, Mathf.PingPong(t * 0.75f, 1f));
            float bajo = Mathf.Sin(2f * Mathf.PI * raiz * 0.5f * t) * 0.35f;
            float cuerpo = Mathf.Sin(2f * Mathf.PI * raiz * t) * 0.23f;
            float brillo = Mathf.Sin(2f * Mathf.PI * raiz * (partida ? 2f : 1.5f) * t) * (partida ? 0.14f : 0.09f);
            return (bajo + cuerpo + brillo) * pulso * volumenMusicaFallback * Envolvente(t, d, 0.08f, 0.12f);
        });
    }

    private AudioClip CrearClipProcedural(string nombre, float duracion, System.Func<float, float, float> generador)
    {
        int muestras = Mathf.CeilToInt(duracion * FrecuenciaMuestreo);
        float[] datos = new float[muestras];

        for (int i = 0; i < muestras; i++)
        {
            float t = (float)i / FrecuenciaMuestreo;
            datos[i] = Mathf.Clamp(generador(t, duracion), -1f, 1f);
        }

        AudioClip clip = AudioClip.Create(nombre, muestras, 1, FrecuenciaMuestreo, false);
        clip.SetData(datos, 0);
        return clip;
    }

    private float Envolvente(float t, float duracion, float ataque, float salida)
    {
        float entrada = ataque > 0f ? Mathf.Clamp01(t / ataque) : 1f;
        float cierre = salida > 0f ? Mathf.Clamp01((duracion - t) / salida) : 1f;
        return entrada * cierre;
    }
}
