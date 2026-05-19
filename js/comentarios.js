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

    container.innerHTML = '';

    if (!comentarios || comentarios.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center py-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700';
        empty.textContent = 'No hay comentarios. ¡Sé el primero!';
        container.appendChild(empty);
        return;
    }

    comentarios.forEach(com => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all';
        card.id = `comentario-${com.id}`;

        const row = document.createElement('div');
        row.className = 'flex items-start gap-3';

        const avatar = document.createElement('img');
        avatar.src = com.avatar || '/assets/icon/usuario.webp';
        avatar.alt = 'Avatar';
        avatar.className = 'w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600';

        const body = document.createElement('div');
        body.className = 'flex-1';

        const header = document.createElement('div');
        header.className = 'flex flex-wrap items-center justify-between gap-2 mb-1';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-2 flex-wrap';

        const name = document.createElement('span');
        name.className = `font-bold ${com.usuario === 'admin' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`;
        name.textContent = com.usuario + (com.usuario === 'admin' ? ' 👑' : '');

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-xs text-slate-500';
        dateSpan.textContent = formatearFecha(com.fecha);

        const categoriaInfo = CATEGORIAS[com.categoria] || CATEGORIAS.general;
        const catBadge = document.createElement('span');
        catBadge.className = `px-2 py-0.5 rounded-full text-xs ${categoriaInfo.color}`;
        catBadge.textContent = categoriaInfo.nombre;

        left.appendChild(name);
        left.appendChild(dateSpan);
        left.appendChild(catBadge);
        if (com.editado) {
            const editLabel = document.createElement('span');
            editLabel.className = 'text-xs text-slate-400';
            editLabel.textContent = '(editado)';
            left.appendChild(editLabel);
        }
        if (com.reportes > 0 && admin) {
            const rep = document.createElement('span');
            rep.className = 'text-xs text-red-500';
            rep.textContent = `⚠️ ${com.reportes} reportes`;
            left.appendChild(rep);
        }

        const right = document.createElement('div');
        right.className = 'flex gap-2 comentario-controls';

        const esAutor = com.usuario === usuarioActual;

        if (esAutor) {
            const editBtn = document.createElement('button');
            editBtn.className = 'text-xs text-blue-500 hover:text-blue-700 transition';
            editBtn.title = 'Editar';
            editBtn.textContent = '✏️';
            editBtn.addEventListener('click', () => editarComentario(com.id));
            right.appendChild(editBtn);
        }

        if (!esAutor) {
            const reportBtn = document.createElement('button');
            reportBtn.className = 'text-xs text-yellow-500 hover:text-yellow-700 transition';
            reportBtn.title = 'Reportar';
            reportBtn.textContent = '🚩';
            reportBtn.addEventListener('click', () => reportarComentario(com.id));
            right.appendChild(reportBtn);
        }

        if (admin) {
            const delBtn = document.createElement('button');
            delBtn.className = 'text-xs text-red-500 hover:text-red-700 transition';
            delBtn.title = 'Eliminar';
            delBtn.textContent = '🗑️';
            delBtn.addEventListener('click', () => borrarComentarioPrompt(com.id));
            right.appendChild(delBtn);
        }

        header.appendChild(left);
        header.appendChild(right);

        const textoDiv = document.createElement('div');
        textoDiv.id = `texto-${com.id}`;

    const textoP = document.createElement('p');
    textoP.className = 'comentario-texto text-slate-700 dark:text-slate-300 text-sm leading-relaxed';
    // Use escaped HTML and convert newlines to <br> so line breaks are visible
    textoP.innerHTML = escapeHtml(com.texto || '').replace(/\r?\n/g, '<br>');
    textoDiv.appendChild(textoP);

    // Store raw text on the card so edit/cancel can access original newlines
    card.dataset.raw = com.texto || '';

        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-4 mt-3';

        const likeBtn = document.createElement('button');
        likeBtn.className = 'flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition';
        likeBtn.addEventListener('click', () => darLike(com.id));
        const likeIcon = document.createElement('span');
        likeIcon.id = `like-icon-${com.id}`;
        likeIcon.textContent = (com.usuariosLikes?.includes(usuarioActual)) ? '❤️' : '🤍';
        const likeCount = document.createElement('span');
        likeCount.id = `likes-${com.id}`;
        likeCount.textContent = com.likes || 0;
        likeBtn.appendChild(likeIcon);
        likeBtn.appendChild(likeCount);
        actions.appendChild(likeBtn);

        body.appendChild(header);
        body.appendChild(textoDiv);
        body.appendChild(actions);

        row.appendChild(avatar);
        row.appendChild(body);
        card.appendChild(row);
        container.appendChild(card);
    });
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
    // Read raw text stored on the card (preserves newlines)
    const card = document.getElementById(`comentario-${id}`);
    const textoActual = (card && card.dataset.raw) ? card.dataset.raw : (divTexto.innerText || '');
    
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
    
    // Build edit UI with DOM to avoid string interpolation issues
    divTexto.innerHTML = '';
    const textarea = document.createElement('textarea');
    textarea.id = `edit-texto-${id}`;
    textarea.className = 'w-full p-2 rounded-lg border text-sm dark:bg-slate-700 dark:border-slate-600';
    textarea.rows = 3;
    textarea.value = textoActual;

    const wrapper = document.createElement('div');
    wrapper.appendChild(textarea);

    // insert categoria select
    const tempSelect = document.createElement('div');
    tempSelect.innerHTML = categoriaSelect.outerHTML;
    const selectEl = tempSelect.querySelector('select');
    selectEl.id = `edit-categoria-${id}`;
    selectEl.className = 'mt-2 px-3 py-1 rounded-lg border text-sm w-full dark:bg-slate-700';
    wrapper.appendChild(selectEl);

    const btnRow = document.createElement('div');
    btnRow.className = 'flex gap-2 mt-2';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition';
    saveBtn.textContent = 'Guardar';
    saveBtn.addEventListener('click', () => guardarEdicion(id));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600 transition';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => cancelarEdicion(id, textoActual));

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);

    // Delete button for author/admin
    const usuarioActual = getUsuarioActual();
    const admin = esAdmin();
    // We allow the delete button if the current user is admin or author (handled earlier by edit button call)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'ml-auto px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition';
    deleteBtn.textContent = 'Borrar';
    deleteBtn.addEventListener('click', () => {
        if (confirm('¿Eliminar este comentario?')) {
            borrarComentario(id);
        }
    });

    btnRow.appendChild(deleteBtn);
    wrapper.appendChild(btnRow);

    divTexto.appendChild(wrapper);
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
    // Restore original raw text (preserves newlines)
    const card = document.getElementById(`comentario-${id}`);
    const raw = (card && card.dataset.raw) ? card.dataset.raw : textoOriginal;
    divTexto.innerHTML = `<p class="comentario-texto text-slate-700 dark:text-slate-300 text-sm leading-relaxed">${escapeHtml(raw).replace(/\r?\n/g, '<br>')}</p>`;
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
    // Allow deletion if admin or the original author
    // To check author ownership we will attempt deletion and rely on the server-side author check.
    // If your Worker enforces authorization, it should validate that the requesting user can delete.
    
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