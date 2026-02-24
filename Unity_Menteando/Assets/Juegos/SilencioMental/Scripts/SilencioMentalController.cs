using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;
using TMPro;

public class SilencioMentalController : MonoBehaviour
{
    [Header("UI")]
    public Button button;
    public Image buttonImage;
    public TextMeshProUGUI timer;

    [Header("Game Settings")]
    public float maxSessionTime = 60f;
    public float trialInterval = 2f;

    private float tiempoRestante;

    private bool isGoTrial;
    private bool gameActive = true;

    private float stimulusStartTime;
    private float sessionStartTime;
    private float trialTimer;

    private int totalTrials;
    private int correctResponses;
    private int commissionErrors;
    private int omissionErrors;

    private List<float> reactionTimes = new List<float>();

    void Start()
    {
        timer.text = Mathf.Ceil(maxSessionTime).ToString();
        tiempoRestante = maxSessionTime;
        sessionStartTime = Time.time;
        NextTrial();
    }

    void Update()
    {
        if (!gameActive) return;

        tiempoRestante -= Time.deltaTime;
        timer.text = Mathf.Ceil(tiempoRestante).ToString();


        // Control duración total
        if (Time.time - sessionStartTime >= maxSessionTime)
        {
            EndGame();
            return;
        }

        // Control cambio de trial
        trialTimer += Time.deltaTime;
        if (trialTimer >= trialInterval)
        {
            EvaluateOmission();
            NextTrial();
        }
    }

    void NextTrial()
    {
        trialTimer = 0f;
        totalTrials++;

        isGoTrial = Random.value > 0.3f; // 70% GO
        stimulusStartTime = Time.time;

        buttonImage.color = isGoTrial ? Color.green : Color.red;
    }

    public void OnButtonPressed()
    {
        if (!gameActive) return;

        if (isGoTrial)
        {
            float reaction = Time.time - stimulusStartTime;
            reactionTimes.Add(reaction);
            correctResponses++;
        }
        else
        {
            commissionErrors++;
        }

        NextTrial();
    }

    void EvaluateOmission()
    {
        if (isGoTrial)
        {
            omissionErrors++;
        }
    }

    void EndGame()
    {
        gameActive = false;

        SesionJuego session = new SesionJuego();
        session.playerId = "Player_001";
        session.game = "go_no_go_button";
        session.sessionDuration = maxSessionTime;

        Metricas m = new Metricas();
        m.totalTrials = totalTrials;
        m.correctResponses = correctResponses;
        m.commissionErrors = commissionErrors;
        m.omissionErrors = omissionErrors;
        m.avgReactionTime = CalculateAverageRT();

        session.metrics = m;

        string json = JsonUtility.ToJson(session);

        Debug.Log("SESSION DATA: " + json);

        Application.ExternalCall("SaveGameData", json);

        button.interactable = false;
    }

    float CalculateAverageRT()
    {
        if (reactionTimes.Count == 0) return 0f;

        float total = 0f;
        foreach (float rt in reactionTimes)
            total += rt;

        return total / reactionTimes.Count;
    }
}
