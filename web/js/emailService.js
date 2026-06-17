// ======================================================
// EMAIL SERVICE - Unificado para Menteando
// ======================================================

// Configuración de EmailJS
const EMAILJS_CONFIG = {
    publicKey: "PWYiqQxVV1Cm3CPMf",
    serviceId: "service_o4rk2pw",
    templates: {
        metricas: "template_snxzm19",
        contacto: "template_c2fkn9c"
    }
};

function mostrarModal(mensaje, tipo) {
    // Eliminar modal existente si lo hay
    const modalExistente = document.getElementById("menteando-modal");
    if (modalExistente) modalExistente.remove();

    const modal = document.createElement("div");
    modal.id = "menteando-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    `;

    const colors = {
        success: { bg: "#dcfce7", border: "#22c55e", text: "#166534", icon: "✅" },
        error: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b", icon: "❌" },
        info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af", icon: "ℹ️" }
    };

    const color = colors[tipo] || colors.info;

    // Detectar si es el error de apodo duplicado
    const esErrorApodo = mensaje && mensaje.includes("Ese apodo ya está siendo utilizado por otro usuario");

    let buttonHTML = '';
    if (esErrorApodo) {
        buttonHTML = `
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="modal-close-btn" style="
                    background: #94a3b8;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                    transition: opacity 0.2s;
                " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                    Cerrar
                </button>
                <button id="modal-change-apodo-btn" style="
                    background: ${color.border};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    flex: 1;
                    transition: opacity 0.2s;
                " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                    ✏️ Cambiar apodo
                </button>
            </div>
        `;
    } else {
        buttonHTML = `
            <button id="modal-close-btn" style="
                background: ${color.border};
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
                margin-top: 20px;
                transition: opacity 0.2s;
            " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                Entendido
            </button>
        `;
    }

    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 400px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: fadeIn 0.2s ease-out;">
            <div style="background: ${color.bg}; padding: 20px; border-radius: 16px 16px 0 0; border-bottom: 2px solid ${color.border};">
                <div style="font-size: 48px; text-align: center;">${color.icon}</div>
                <h3 style="color: ${color.text}; text-align: center; margin: 10px 0 0; font-size: 18px; font-weight: bold;">
                    ${tipo === "success" ? "¡Éxito!" : tipo === "error" ? "Error" : "Información"}
                </h3>
            </div>
            <div style="padding: 24px;">
                <p style="color: #334155; text-align: center; margin: 0; font-size: 14px; line-height: 1.6;">
                    ${mensaje}
                </p>
                ${buttonHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animación fadeIn
    if (!document.getElementById("modal-fadein-style")) {
        const style = document.createElement('style');
        style.id = "modal-fadein-style";
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // Cerrar modal
    document.getElementById("modal-close-btn")?.addEventListener("click", function() {
        modal.remove();
    });

    // Botón "Cambiar apodo" → abre el modal de edición de perfil
    document.getElementById("modal-change-apodo-btn")?.addEventListener("click", function() {
        modal.remove(); // Cerrar el modal de error

        // Abrir el modal de edición de perfil
        abrirModalEdicion();
    });

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

// ============================================================
// FUNCIÓN PARA ABRIR EL MODAL DE EDICIÓN DE PERFIL
// ============================================================
function abrirModalEdicion() {
    const modalEditar = document.getElementById("modal-editar");
    if (!modalEditar) {
        console.warn("Modal de edición no encontrado");
        return;
    }

    const perfil = getperfil();

    const nameInput = document.getElementById("name");
    const nicknameInput = document.getElementById("nickname");
    const ageInput = document.getElementById("age");
    const emailInput = document.getElementById("email");

    if (nameInput) nameInput.value = perfil.nombre || "";
    if (nicknameInput) nicknameInput.value = perfil.apodo || "";
    if (ageInput) ageInput.value = perfil.edad || "";
    if (emailInput) emailInput.value = perfil.correo || "";

    modalEditar.style.display = "flex";
}

// Inicializar EmailJS
function initEmailJS() {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log("✅ EmailJS inicializado");
}

// ========== 1. ENVIAR MÉTRICAS DEL PERFIL ==========
function enviarMetricasPorCorreo(perfil) {


    if (!perfil.correo) {
        mostrarModal("No tienes un correo registrado. Edita tu perfil y añade un correo electrónico.", "info");
        return;
    }

    let avatarUrl = perfil.avatar || "/assets/icon/usuario.webp";
    avatarUrl = avatarUrl.replace(/^\.\.\//, "/").replace(/^\.\//, "/");
    const avatarCompleto = `https://menteando.pages.dev${avatarUrl}`;

    const data = {
        user_name: perfil.nombre,
        user_apodo: perfil.apodo,
        user_email: perfil.correo,
        user_avatar: avatarCompleto,
        user_edad: perfil.edad || "No especificada",
        seasons: perfil.sesiones,
        memoria: Math.round(perfil.memoria * 100),
        control: Math.round(perfil.control * 100),
        atencion: Math.round(perfil.atencion * 100),
        reflejos: Math.round(perfil.reflejos * 100),
        nivel: perfil.nivel,
        puntos: formatearPuntos(perfil.puntos),
        racha_actual: perfil.racha || 0,
        racha_maxima: perfil.rachaMaxima || 0,
        fecha_inicio: new Date(perfil.desde).toLocaleDateString("es-ES"),
        fecha_envio: new Date().toLocaleString("es-ES"),
        juego_favorito: perfil.juegoMasJugado || "Ninguno",
        total_sesiones: perfil.sesiones,
        detalle_atencion_sostenida: Math.ceil(perfil.detalle.atencionSostenida) || "N/A",
        detalle_atencion_selectiva: Math.ceil(perfil.detalle.atencionSelectiva) || "N/A",
        detalle_atencion_dividida: Math.ceil(perfil.detalle.atencionDividida) || "N/A",
        detalle_memoria_trabajo: Math.ceil(perfil.detalle.memoriaTrabajo) || "N/A",
        detalle_memoria_espacial: Math.ceil(perfil.detalle.memoriaEspacial) || "N/A",
        detalle_control_inhibitorio: Math.ceil(perfil.detalle.controlInhibitorio) || "N/A",
        detalle_flexibilidad_cognitiva: Math.ceil(perfil.detalle.flexibilidadCognitiva) || "N/A",
        detalle_planificacion: Math.ceil(perfil.detalle.planificacion) || "N/A",
        detalle_velocidad_cognitiva: Math.ceil(perfil.detalle.velocidadCognitiva) || "N/A",
        detalle_coordinacion_visomotora: Math.ceil(perfil.detalle.coordinacionVisomotora) || "N/A",
        name: perfil.nombre,
        email: "no-reply@menteando.com",
        time: new Date()
    };

    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.metricas, data)
        .then(() => {
            mostrarModal("📊 Tus métricas han sido enviadas correctamente.", "success");
            perfil.metricasEnviadas = true; // Marcar que se han enviado las métricas
            saveperfil(perfil); // Guardar el perfil actualizado
            location.reload(); // Recargar la página para actualizar el estado del botón

        })
        .catch(err => {
            console.error("❌ Error métricas:", err);
            mostrarModal("No se pudieron enviar las métricas. Inténtalo de nuevo más tarde.", "error");
        });



}

// ========== 2. ENVIAR FORMULARIO DE CONTACTO ==========
function enviarContacto(event) {
    event.preventDefault();

    const nombre = document.getElementById("contacto-nombre")?.value;
    const email = document.getElementById("contacto-email")?.value;
    const mensaje = document.getElementById("contacto-mensaje")?.value;

    if (!nombre || !email || !mensaje) {
        mostrarModal("Por favor, completa todos los campos del formulario.", "info");
        return;
    }

    const data = {
        from_name: nombre,
        from_email: email,
        message: mensaje,
        to_email: "menteando.info@gmail.com",
        time: new Date().toLocaleString("es-ES")
    };

    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.contacto, data)
        .then(() => {
            mostrarModal("✅ Mensaje enviado correctamente. Te responderemos pronto.", "success");
            document.getElementById("contacto-form").reset();
        })
        .catch(err => {
            console.error("❌ Error contacto:", err);
            mostrarModal("❌ No se pudo enviar el mensaje. Inténtalo de nuevo.", "error");
        });
}