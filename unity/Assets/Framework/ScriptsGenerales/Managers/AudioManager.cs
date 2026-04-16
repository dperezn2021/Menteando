using UnityEngine;

public class AudioManager : MonoBehaviour
{
    public static AudioManager Instance;

    [Header("Fuentes de Audio")]
    public AudioSource musicaSource;
    public AudioSource sfxSource;

    [Header("Clips Globales")]
    public AudioClip clickUI;
    public AudioClip acierto;
    public AudioClip error;
    public AudioClip nivelUp;
    public AudioClip musicaMenu;
    public AudioClip musicaJuego;
    public AudioClip musicaVictoria;

    [Header("Volumen")]
    [Range(0f, 1f)] public float musicaVolumen = 0.5f;
    [Range(0f, 1f)] public float sfxVolumen = 0.5f;

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
    public void Acierto() => ReproducirSFX(acierto);
    public void Error() => ReproducirSFX(error);
    public void NivelUp() => ReproducirSFX(nivelUp);
    public void MusicaMenu() => ReproducirMusica(musicaMenu);
    public void MusicaJuego() => ReproducirMusica(musicaJuego);
    public void MusicaVictoria() => ReproducirMusica(musicaVictoria);
}
