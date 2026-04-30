// ======================================================
// COMENTARIOS GLOBALES - Menteando (VERSIÓN ESTABLE)
// ======================================================

const API_URL = "https://menteando-comentarios.d-perezn-2021.workers.dev/";

// Categorías disponibles
const CATEGORIAS = {
    general: { nombre: "💬 General", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    sugerencia: { nombre: "💡 Sugerencia", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
    error: { nombre: "🐛 Error", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
    pregunta: { nombre: "❓ Pregunta", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
    test: { nombre: "📝 Test", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
    juego: { nombre: "🎮 Juego", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" }
};

let filtroActual = "todos";

// ========== FUNCIONES DE USUARIO ==========

function getUsuarioActual() {
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        return perfil?.nombre || null;
    }
    return null;
}

function esAdmin() {
    const usuario = getUsuarioActual();
    return usuario === "admin";
}

// ========== CRUD COMENTARIOS ==========

async function cargarComentarios() {
    try {
        const response = await fetch(API_URL);
        let comentarios = await response.json();
        
        if (filtroActual !== "todos") {
            comentarios = comentarios.filter(c => c.categoria === filtroActual);
        }
        
        mostrarComentarios(comentarios);
    } catch (error) {
        console.error("Error al cargar comentarios:", error);
        const container = document.getElementById("comentarios-container");
        if (container) {
            container.innerHTML = `<div class="text-center py-8 text-red-500">Error al cargar comentarios.</div>`;
        }
    }
}

function mostrarComentarios(comentarios) {
    const container = document.getElementById("comentarios-container");
    if (!container) return;
    
    const usuarioActual = getUsuarioActual();
    const admin = esAdmin();
    
    if (!comentarios || comentarios.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <p class="text-slate-500">No hay comentarios. ¡Sé el primero!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comentarios.map(com => {
        const usuarioDioLike = com.usuariosLikes?.includes(usuarioActual);
        const likeIcon = usuarioDioLike ? '❤️' : '🤍';
        const esAutor = com.usuario === usuarioActual;
        const categoriaInfo = CATEGORIAS[com.categoria] || CATEGORIAS.general;
        
        return `
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all" id="comentario-${com.id}">
                <div class="flex items-start gap-3">
                    <img src="${com.avatar || '/assets/icon/usuario.webp'}" alt="Avatar" class="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600">
                    <div class="flex-1">
                        <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold ${com.usuario === 'admin' ? 'text-red-500' : 'text-slate-900 dark:text-white'}">
                                    ${escapeHtml(com.usuario)} ${com.usuario === 'admin' ? '👑' : ''}
                                </span>
                                <span class="text-xs text-slate-500">${formatearFecha(com.fecha)}</span>
                                <span class="px-2 py-0.5 rounded-full text-xs ${categoriaInfo.color}">${categoriaInfo.nombre}</span>
                                ${com.editado ? '<span class="text-xs text-slate-400">(editado)</span>' : ''}
                                ${com.reportes > 0 && admin ? '<span class="text-xs text-red-500">⚠️ ' + com.reportes + ' reportes</span>' : ''}
                            </div>
                            <div class="flex gap-2">
                                ${esAutor ? `
                                    <button onclick="editarComentario(${com.id})" class="text-xs text-blue-500 hover:text-blue-700 transition" title="Editar">
                                        ✏️
                                    </button>
                                ` : ''}
                                ${!esAutor ? `
                                    <button onclick="reportarComentario(${com.id})" class="text-xs text-yellow-500 hover:text-yellow-700 transition" title="Reportar">
                                        🚩
                                    </button>
                                ` : ''}
                                ${admin ? `
                                    <button onclick="borrarComentarioPrompt(${com.id})" class="text-xs text-red-500 hover:text-red-700 transition" title="Eliminar">
                                        🗑️
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <div id="texto-${com.id}">
                            <p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">${escapeHtml(com.texto)}</p>
                        </div>
                        <div class="flex items-center gap-4 mt-3">
                            <button onclick="darLike(${com.id})" class="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition">
                                <span id="like-icon-${com.id}">${likeIcon}</span>
                                <span id="likes-${com.id}">${com.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== PUBLICAR COMENTARIO ==========

async function publicarComentario() {
    const usuario = getUsuarioActual();
    const texto = document.getElementById("comentario-texto")?.value.trim();
    const categoria = document.getElementById("comentario-categoria")?.value || "general";
    
    if (!usuario) {
        mostrarMensajeTemporal("❌ Debes tener un nombre de perfil para comentar", "error");
        return;
    }
    if (!texto) {
        mostrarMensajeTemporal("❌ Escribe un comentario", "error");
        return;
    }

    let avatar = "/assets/icon/usuario.webp";
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        if (perfil?.avatar) avatar = perfil.avatar;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario, texto, avatar, categoria })
        });

        if (response.ok) {
            document.getElementById("comentario-texto").value = "";
            cargarComentarios();
            mostrarMensajeTemporal("✅ Comentario publicado", "success");
        } else {
            mostrarMensajeTemporal("❌ Error al publicar", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeTemporal("❌ Error de conexión", "error");
    }
}

// ========== LIKES ==========

async function darLike(id) {
    const usuario = getUsuarioActual();
    if (!usuario) {
        mostrarMensajeTemporal("❌ Inicia sesión para dar like", "error");
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, usuario })
        });
        
        if (response.ok) {
            cargarComentarios();
        }
    } catch (error) {
        console.error("Error al dar like:", error);
    }
}

// ========== EDITAR COMENTARIO ==========

function editarComentario(id) {
    const divTexto = document.getElementById(`texto-${id}`);
    const textoActual = divTexto.innerText;
    
    const categoriaSelect = document.createElement('select');
    categoriaSelect.id = `edit-categoria-${id}`;
    categoriaSelect.className = "mt-2 px-3 py-1 rounded-lg border text-sm w-full dark:bg-slate-700";
    categoriaSelect.innerHTML = `
        <option value="general">💬 General</option>
        <option value="sugerencia">💡 Sugerencia</option>
        <option value="error">🐛 Error</option>
        <option value="pregunta">❓ Pregunta</option>
        <option value="test">📝 Test</option>
        <option value="juego">🎮 Juego</option>
    `;
    
    divTexto.innerHTML = `
        <textarea id="edit-texto-${id}" class="w-full p-2 rounded-lg border text-sm dark:bg-slate-700 dark:border-slate-600" rows="3">${escapeHtml(textoActual)}</textarea>
        ${categoriaSelect.outerHTML}
        <div class="flex gap-2 mt-2">
            <button onclick="guardarEdicion(${id})" class="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition">Guardar</button>
            <button onclick="cancelarEdicion(${id}, '${escapeHtml(textoActual)}')" class="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600 transition">Cancelar</button>
        </div>
    `;
}

async function guardarEdicion(id) {
    const nuevoTexto = document.getElementById(`edit-texto-${id}`).value;
    const nuevaCategoria = document.getElementById(`edit-categoria-${id}`).value;
    const usuario = getUsuarioActual();
    
    if (!usuario) {
        mostrarMensajeTemporal("❌ No se pudo identificar al usuario", "error");
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                id, 
                usuario, 
                texto: nuevoTexto, 
                categoria: nuevaCategoria 
            })
        });
        
        if (response.ok) {
            cargarComentarios();
            mostrarMensajeTemporal("✅ Comentario editado", "success");
        } else {
            const error = await response.json();
            mostrarMensajeTemporal(error.error || "❌ Error al editar", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeTemporal("❌ Error de conexión", "error");
    }
}

function cancelarEdicion(id, textoOriginal) {
    const divTexto = document.getElementById(`texto-${id}`);
    divTexto.innerHTML = `<p class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">${textoOriginal}</p>`;
}

// ========== REPORTAR COMENTARIO ==========

async function reportarComentario(id) {
    const motivo = prompt("¿Por qué reportas este comentario? (Opcional)");
    const usuario = getUsuarioActual();
    
    if (!usuario) {
        mostrarMensajeTemporal("❌ Inicia sesión para reportar", "error");
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reportar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, motivo: motivo || "Sin motivo", usuario })
        });
        
        if (response.ok) {
            mostrarMensajeTemporal("✅ Reportado. Gracias por ayudar.", "success");
        } else {
            mostrarMensajeTemporal("❌ Error al reportar", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeTemporal("❌ Error de conexión", "error");
    }
}

// ========== ELIMINAR COMENTARIO ==========

async function borrarComentario(id) {
    const usuario = getUsuarioActual();
    if (usuario !== "admin") {
        mostrarMensajeTemporal("❌ Solo administradores pueden eliminar", "error");
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        
        if (response.ok) {
            cargarComentarios();
            mostrarMensajeTemporal("✅ Comentario eliminado", "success");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeTemporal("❌ Error al eliminar", "error");
    }
}

function borrarComentarioPrompt(id) {
    if (confirm("¿Eliminar este comentario?")) {
        borrarComentario(id);
    }
}

// ========== FILTROS ==========

function filtrarComentarios(categoria) {
    filtroActual = categoria;
    
    document.querySelectorAll(".filtro-btn").forEach(btn => {
        if (btn.dataset.categoria === categoria) {
            btn.classList.add("bg-blue-500", "text-white");
            btn.classList.remove("bg-slate-200", "dark:bg-slate-700");
        } else {
            btn.classList.remove("bg-blue-500", "text-white");
            btn.classList.add("bg-slate-200", "dark:bg-slate-700");
        }
    });
    
    cargarComentarios();
}

// ========== UTILIDADES ==========

function mostrarMensajeTemporal(mensaje, tipo) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white text-sm z-50 ${tipo === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-fade-in`;
    msgDiv.textContent = mensaje;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 3000);
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMins = Math.floor((ahora - fecha) / 60000);
    if (diffMins < 1) return "ahora";
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffMins < 1440) return `hace ${Math.floor(diffMins / 60)} h`;
    return fecha.toLocaleDateString("es-ES");
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

function actualizarAvatar() {
    const avatarImg = document.getElementById("comentario-avatar");
    const nombreInput = document.getElementById("comentario-usuario");
    
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        if (perfil?.avatar && avatarImg) {
            avatarImg.src = perfil.avatar;
        }
        if (perfil?.nombre && nombreInput) {
            nombreInput.value = perfil.nombre;
            nombreInput.readOnly = true;
            nombreInput.disabled = true;
            nombreInput.classList.add("cursor-not-allowed", "bg-slate-100", "dark:bg-slate-700");
        }
    }
}

// ========== INICIALIZACIÓN ==========

document.addEventListener("DOMContentLoaded", () => {
    cargarComentarios();
    actualizarAvatar();
    
    const btnPublicar = document.getElementById("btn-publicar");
    if (btnPublicar) {
        btnPublicar.addEventListener("click", publicarComentario);
    }
    
    const textoArea = document.getElementById("comentario-texto");
    if (textoArea) {
        textoArea.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "Enter") {
                publicarComentario();
            }
        });
    }
});

// ========== EXPORTAR FUNCIONES GLOBALES ==========

window.cargarComentarios = cargarComentarios;
window.publicarComentario = publicarComentario;
window.darLike = darLike;
window.editarComentario = editarComentario;
window.reportarComentario = reportarComentario;
window.borrarComentarioPrompt = borrarComentarioPrompt;
window.filtrarComentarios = filtrarComentarios;
window.guardarEdicion = guardarEdicion;
window.cancelarEdicion = cancelarEdicion;