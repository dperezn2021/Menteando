(function () {
    const scriptPromises = {};

    function loadScriptOnce(src) {
        if (window.CoachController && src.includes("controladorCoach")) {
            return Promise.resolve();
        }

        if (scriptPromises[src]) return scriptPromises[src];

        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            scriptPromises[src] = Promise.resolve();
            return scriptPromises[src];
        }

        scriptPromises[src] = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return scriptPromises[src];
    }

    function ensureCoachStyles() {
        if (document.querySelector('link[href="/coach/animacionesCoach.css"]')) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/coach/animacionesCoach.css";
        document.head.appendChild(link);
    }

    function ensureCoachElement() {
        if (document.getElementById("coach")) return;

        const coach = document.createElement("div");
        coach.id = "coach";
        coach.className = "coach";
        coach.innerHTML = '<div id="coach-bubble" class="coach-bubble"></div>';
        document.body.appendChild(coach);
    }

    async function initDetalleCoach(contexto, datos = {}) {
        if (typeof window.isCoachDisabled === "function" && window.isCoachDisabled()) return null;

        ensureCoachStyles();
        ensureCoachElement();

        await loadScriptOnce("/coach/mensajesCoach.js");
        await loadScriptOnce("/coach/cerebroCoach.js");
        await loadScriptOnce("/coach/entidadCoach.js");
        await loadScriptOnce("/js/controladorCoach.js");

        if (typeof window.CoachController !== "function" || typeof window.getperfil !== "function") {
            return null;
        }

        const perfil = window.getperfil();

        if (window.coachController && typeof window.coachController.setContextoFijo === "function") {
            window.coachController.setContextoFijo(contexto, datos);
            return window.coachController;
        }

        window.coachController = new window.CoachController(perfil, { contexto, datos });
        return window.coachController;
    }

    window.initDetalleCoach = initDetalleCoach;
})();
