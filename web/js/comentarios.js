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
// Toggle to fetch all comments from the Worker (server-side) instead of the default limited set
let mostrarTodos = false;
// Sort order: true = newest first (desc), false = oldest first (asc)
let sortDesc = true;
// Cache of last loaded comments — used for duplicate-name validation before publishing
let comentariosCacheados = [];

// ========== PROPIEDAD DE COMENTARIOS (localStorage) ==========
// Los IDs de los comentarios publicados desde este navegador se guardan aquí.
// Los botones de editar/borrar se muestran solo para estos IDs, no por nombre,
// para evitar que alguien edite comentarios ajenos cambiándose el apodo.

const OWNED_IDS_KEY = 'menteando_owned_ids';

function getOwnedIds() {
    try { return new Set(JSON.parse(localStorage.getItem(OWNED_IDS_KEY) || '[]')); }
    catch { return new Set(); }
}

function claimCommentId(id) {
    const set = getOwnedIds();
    set.add(String(id));
    localStorage.setItem(OWNED_IDS_KEY, JSON.stringify([...set]));
}

// IDs alfanuméricos (formato nuevo, ej: 'mpwrvot6lo24uqj'): requieren localStorage.
// IDs numéricos (formato antiguo, timestamps): fallback por nombre para migración.
function isMyComment(com) {
    const id = String(com.id);
    if (/[a-z]/i.test(id)) return getOwnedIds().has(id);
    return com.usuario === getUsuarioActual();
}

// ========== FUNCIONES DE USUARIO ==========

function getUsuarioActual() {
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        return perfil?.apodo || perfil?.nombre || null;
    }
    return null;
}

// Admin replies: send PUT with reply payload { id, reply: { usuario, texto, fecha } }
async function responderComentario(id) {
    const usuario = getUsuarioActual();
    if (!usuario) {
        mostrarModal('No autorizado', 'error');
        return;
    }
    const ta = document.getElementById(`reply-text-${id}`);
    if (!ta) return;
    const texto = ta.value.trim();
    if (!texto) {
        mostrarModal('Escribe una respuesta', 'info');
        return;
    }

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (window.ADMIN_BEARER) headers['Authorization'] = `Bearer ${window.ADMIN_BEARER}`;
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ id, reply: { usuario, texto, fecha: new Date().toISOString() } })
        });
        if (response.ok) {
            ta.value = '';
            cargarComentarios();
            mostrarModal('Respuesta publicada', 'success');
        } else {
            mostrarModal('Error al publicar respuesta', 'error');
        }
    } catch (e) {
        console.error(e);
        mostrarModal('Error de conexión', 'error');
    }
}

// MODIFICADO: Ahora valida activamente si el admin introdujo su contraseña
function esAdmin() {
    const usuario = getUsuarioActual();
    const tieneToken = !!window.ADMIN_BEARER;
    
    // Si el usuario se llama admin pero no se ha autenticado todavía
    if (usuario === "admin" && !tieneToken) {
        // Ejecutamos la autenticación de forma asíncrona sin bloquear el renderizado
        verificarContrasenaAdmin();
    }
    
    return usuario === "admin" && tieneToken;
}

// NUEVA FUNCIÓN: Maneja el login contra el endpoint /verify de tu Worker
async function verificarContrasenaAdmin() {
    // Evitar bucles si ya se está pidiendo la contraseña
    if (window.VERIFICANDO_ADMIN) return;
    window.VERIFICANDO_ADMIN = true;

    // Usamos el inputModal que ya tienes programado en tus utilidades
    const password = await inputModal('Introduce la contraseña de administrador para activar los privilegios:', 'Contraseña');
    
    if (!password) {
        window.VERIFICANDO_ADMIN = false;
        return;
    }

    try {
        // Hacemos la petición al endpoint /verify del Worker
        const response = await fetch(`${API_URL}verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            // Guardamos la clave en la variable global que tus funciones fetch (DELETE, PUT) ya leen
            window.ADMIN_BEARER = password;
            mostrarModal('Autenticación de administrador correcta 👑', 'success');
            cargarComentarios(); // Recargamos para que aparezcan los botones de borrar (🗑️)
        } else {
            mostrarModal('Contraseña de administrador incorrecta', 'error');
        }
    } catch (e) {
        console.error("Error al verificar admin:", e);
        mostrarModal('Error de conexión con el servicio de verificación', 'error');
    } finally {
        window.VERIFICANDO_ADMIN = false;
    }
}

// ========== CRUD COMENTARIOS ==========

async function cargarComentarios() {
    try {
        // Build query params: category and optionally all=true to request full list from Worker
        const params = [];
        if (filtroActual && filtroActual !== 'todos') params.push(`categoria=${encodeURIComponent(filtroActual)}`);
        if (mostrarTodos) params.push('all=true');
        const url = API_URL + (params.length ? `?${params.join('&')}` : '');

        const response = await fetch(url);
        let comentarios = await response.json();

        // Fallback: if server doesn't support category filtering, apply client-side filter
        if (filtroActual !== "todos") {
            comentarios = comentarios.filter(c => c.categoria === filtroActual);
        }

        // Apply client-side sorting: by fecha
        comentarios = (comentarios || []).slice();
        comentarios.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        if (sortDesc) comentarios.reverse();

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
    comentariosCacheados = comentarios || [];
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
        
        // --- LOGICA DE REPORTES (3 O MÁS REPORTES) ---
        const totalReportes = com.reportes || 0;
        const esComentarioReportado = totalReportes >= 3;

        // Estilos base o estilos rojos si está reportado
        if (esComentarioReportado) {
            card.className = 'bg-red-50/90 dark:bg-red-950/20 rounded-2xl shadow-sm p-5 border border-red-400 dark:border-red-900/60 hover:shadow-md transition-all';
        } else {
            card.className = 'bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all';
        }
        
        card.id = `comentario-${com.id}`;

        const row = document.createElement('div');
        row.className = 'flex items-start gap-3';

        const avatar = document.createElement('img');
        avatar.src = normalizeAvatarPath(com.avatar);
        avatar.alt = 'Avatar';
        avatar.className = 'w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600';

        const body = document.createElement('div');
        body.className = 'flex-1';

        const header = document.createElement('div');
        header.className = 'flex flex-wrap items-center justify-between gap-2 mb-1';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-2 flex-wrap';

        const name = document.createElement('span');
        name.className = `font-bold ${com.usuario === 'admin' ? 'text-blue-600 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`;
        name.textContent = com.usuario + (com.usuario === 'admin' ? ' 👑' : '');

        const esComentarioAdmin = com.usuario === 'admin';
        if (esComentarioAdmin) {
            card.className = 'bg-blue-50/90 dark:bg-blue-950/20 rounded-2xl shadow-sm p-5 border border-blue-400 dark:border-blue-900/60 hover:shadow-md transition-all';
            avatar.src = normalizeAvatarPath('/assets/img/logo_4.png');
            avatar.className = 'w-10 h-10 rounded-full object-cover';

        }   

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-xs text-slate-500';
        dateSpan.textContent = formatearFecha(com.fecha);

        const categoriaInfo = CATEGORIAS[com.categoria] || CATEGORIAS.general;
        const catBadge = document.createElement('span');
        catBadge.className = `px-2 py-0.5 rounded-full text-xs ${categoriaInfo.color}`;
        catBadge.textContent = com.subtipo ? `${categoriaInfo.nombre}: ${com.subtipo}` : categoriaInfo.nombre;
        

        left.appendChild(name);
        left.appendChild(dateSpan);
        left.appendChild(catBadge);
       
        

        if (com.editado) {
            const editLabel = document.createElement('span');
            editLabel.className = 'text-xs text-slate-400';
            editLabel.textContent = '(editado)';
            left.appendChild(editLabel);
        }

        // Si está reportado, añadimos la etiqueta de alerta visible para todos (o con el contador si es admin)
        if (esComentarioReportado) {
            const rep = document.createElement('span');
            rep.className = 'text-xs font-semibold text-red-600 dark:text-red-400';
            rep.textContent = admin ? `⚠️ ${totalReportes} reportes` : '⚠️ Comentario Reportado';
            left.appendChild(rep);
        } else if (totalReportes > 0 && admin) {
            // Si tiene menos de 3 reportes, solo el admin ve el aviso normal sin rojo
            const rep = document.createElement('span');
            rep.className = 'text-xs text-amber-500';
            rep.textContent = `⚠️ ${totalReportes} reportes`;
            left.appendChild(rep);
        }

        const right = document.createElement('div');
        right.className = 'flex gap-2 comentario-controls';

        // esAutor (localStorage): controla editar/borrar
        // esMiNombre (apodo): controla la 🚩 (no reportas los tuyos aunque hayas cambiado de nombre)
        const esAutor = isMyComment(com);
        const esMiNombre = usuarioActual && com.usuario === usuarioActual;

        if (esAutor || admin) {
            const editBtn = document.createElement('button');
            editBtn.className = 'text-xs text-blue-500 hover:text-blue-700 transition';
            editBtn.title = 'Editar';
            editBtn.textContent = '✏️';
            editBtn.addEventListener('click', () => editarComentario(com.id));
            right.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'text-xs text-red-400 hover:text-red-600 transition';
            delBtn.title = 'Eliminar';
            delBtn.textContent = '🗑️';
            delBtn.addEventListener('click', () => borrarComentarioPrompt(com.id));
            right.appendChild(delBtn);
        }

        if (!esMiNombre && !admin) {
            const reportBtn = document.createElement('button');
            reportBtn.className = 'text-xs text-yellow-500 hover:text-yellow-700 transition';
            reportBtn.title = 'Reportar';
            reportBtn.textContent = '🚩';
            reportBtn.addEventListener('click', () => reportarComentario(com.id));
            right.appendChild(reportBtn);
        }

        header.appendChild(left);
        header.appendChild(right);

        const textoDiv = document.createElement('div');
        textoDiv.id = `texto-${com.id}`;

        const textoP = document.createElement('p');
        
        // Renderizado del texto según si está reportado y el rol del usuario
        if (esComentarioReportado) {
            textoP.className = 'comentario-texto text-red-600 dark:text-red-400 text-sm font-medium leading-relaxed';
            if (!admin) {
                textoP.textContent = 'Comentario Reportado';
            } else {
                // El admin ve el texto real pero coloreado en rojo
                textoP.innerHTML = escapeHtml(com.texto || '').replace(/\r?\n/g, '<br>');
            }
        } else {
            textoP.className = 'comentario-texto text-slate-700 dark:text-slate-300 text-sm leading-relaxed';
            textoP.innerHTML = escapeHtml(com.texto || '').replace(/\r?\n/g, '<br>');
        }
        textoDiv.appendChild(textoP);

        // Guardamos el texto original y metadatos de la card
        card.dataset.raw = com.texto || '';
        card.dataset.categoria = com.categoria || 'general';
        card.dataset.subtipo = com.subtipo || '';

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

        // Respuestas
        const repliesContainer = document.createElement('div');
        repliesContainer.className = 'mt-3';
        
        if (Array.isArray(com.replies) && com.replies.length) {
            const list = document.createElement('div');
            list.className = 'pl-12 space-y-3';
            com.replies.forEach(r => {
                // Ocultar respuestas a usuarios normales si el comentario principal está reportado
                if (esComentarioReportado && !admin) return;

                const rc = document.createElement('div');
                rc.className = 'rounded-lg p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700';
                const who = document.createElement('div');
                who.className = `text-xs mb-1 ${r.usuario === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500'}`;
                who.textContent = `${r.usuario === 'admin' ? 'admin 👑' : r.usuario} · ${formatearFecha(r.fecha)}`;
                const rtext = document.createElement('div');
                rtext.className = `comentario-texto text-sm ${r.usuario === 'admin' ? 'text-blue-600' : 'text-slate-700'} dark:${r.usuario === 'admin' ? 'text-blue-400' : 'text-slate-300'}`;
                rtext.innerHTML = escapeHtml(r.texto || '').replace(/\r?\n/g, '<br>');
                rc.appendChild(who);
                rc.appendChild(rtext);
                list.appendChild(rc);
            });
            repliesContainer.appendChild(list);
        }

        // Caja de respuesta para el administrador
        if (esAdmin()) {
            const replyBox = document.createElement('div');
            replyBox.className = 'mt-2 pl-12';
            const ta = document.createElement('textarea');
            ta.id = `reply-text-${com.id}`;
            ta.rows = 2;
            ta.className = 'w-full p-2 rounded-lg border text-sm dark:bg-slate-700 dark:border-slate-600';
            ta.placeholder = 'Responder públicamente...';
            const replyBtn = document.createElement('button');
            replyBtn.className = 'mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition';
            replyBtn.textContent = 'Responder';
            replyBtn.addEventListener('click', () => responderComentario(com.id));
            replyBox.appendChild(ta);
            replyBox.appendChild(replyBtn);
            repliesContainer.appendChild(replyBox);
        }

        body.appendChild(repliesContainer);

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
    const categoria = document.getElementById("comentario-categoria")?.value;
    const subtipo = document.getElementById("comentario-subtipo")?.value || "";

    if (!usuario) {
        mostrarModal("Debes configurar un apodo en tu perfil para comentar", "info");
        return;
    }
    if (!categoria) {
        mostrarModal("Debes seleccionar una categoría antes de publicar", "info");
        return;
    }
    if ((categoria === "test" || categoria === "juego") && !subtipo) {
        mostrarModal(`Debes seleccionar ${categoria === "test" ? "el test" : "el juego"} al que se refiere tu comentario`, "info");
        return;
    }
    if (!texto) {
        mostrarModal("Escribe un comentario", "info");
        return;
    }

    let avatar = "/assets/icon/usuario.webp";
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        if (perfil?.avatar) avatar = perfil.avatar;
    }

    // Check for name conflict: if another user already claimed this apodo with a different avatar
    const primeraOcurrencia = comentariosCacheados.find(c => c.usuario === usuario);
    if (primeraOcurrencia && normalizeAvatarPath(primeraOcurrencia.avatar) !== normalizeAvatarPath(avatar) && !esAdmin) {
        mostrarModal("Ya existe otro usuario con ese apodo. Cámbialo en tu perfil antes de comentar.", "error");
        return;
    }

    try {
        const body = { usuario, texto, avatar, categoria };
        if (subtipo) body.subtipo = subtipo;
        console.log('[publicarComentario] enviando:', body);
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json().catch(() => ({}));
            console.log('[publicarComentario] respuesta:', data);
            if (data?.id) claimCommentId(data.id);
            document.getElementById("comentario-texto").value = "";
            cargarComentarios();
            mostrarModal("Comentario publicado", "success");
        } else {
            mostrarModal("Error al publicar", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("Error de conexión", "error");
    }
}

// ========== LIKES ==========

async function darLike(id) {
    const usuario = getUsuarioActual();
    if (!usuario) {
        mostrarModal("Inicia sesión para dar like", "info");
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
    const card = document.getElementById(`comentario-${id}`);
    const textoActual = (card && card.dataset.raw) ? card.dataset.raw : (divTexto.innerText || '');
    const categoriaActual = card?.dataset.categoria || 'general';
    const subtipoActual = card?.dataset.subtipo || '';

    divTexto.innerHTML = '';
    const wrapper = document.createElement('div');

    // Textarea
    const textarea = document.createElement('textarea');
    textarea.id = `edit-texto-${id}`;
    textarea.className = 'w-full p-2 rounded-lg border text-sm dark:bg-slate-700 dark:border-slate-600';
    textarea.rows = 3;
    textarea.value = textoActual;
    wrapper.appendChild(textarea);

    // Selector de categoría
    const selectEl = document.createElement('select');
    selectEl.id = `edit-categoria-${id}`;
    selectEl.className = 'mt-2 px-3 py-1 rounded-lg border text-sm w-full dark:bg-slate-700';
    [['general','💬 General'],['sugerencia','💡 Sugerencia'],['error','🐛 Error'],
     ['pregunta','❓ Pregunta'],['test','📝 Test'],['juego','🎮 Juego']].forEach(([val, txt]) => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = txt;
        selectEl.appendChild(opt);
    });
    selectEl.value = categoriaActual;
    wrapper.appendChild(selectEl);

    // Selector de subtipo (test / juego)
    const subWrapper = document.createElement('div');
    subWrapper.className = 'mt-2 hidden';
    const subSelect = document.createElement('select');
    subSelect.id = `edit-subtipo-${id}`;
    subSelect.className = 'w-full px-3 py-1 rounded-lg border text-sm dark:bg-slate-700';
    subWrapper.appendChild(subSelect);
    wrapper.appendChild(subWrapper);

    // Si la categoría actual ya es test/juego, mostrar el selector pre-poblado
    if (categoriaActual === 'test' || categoriaActual === 'juego') {
        poblarSelectSubtipo(subSelect, subWrapper, categoriaActual, subtipoActual);
    }

    // Al cambiar categoría, mostrar/ocultar subtipo
    selectEl.addEventListener('change', () => {
        const cat = selectEl.value;
        if (cat === 'test' || cat === 'juego') {
            poblarSelectSubtipo(subSelect, subWrapper, cat, '');
        } else {
            subWrapper.classList.add('hidden');
        }
    });

    // Fila de botones
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
    wrapper.appendChild(btnRow);
    divTexto.appendChild(wrapper);
}

async function guardarEdicion(id) {
    const nuevoTexto = document.getElementById(`edit-texto-${id}`).value;
    const nuevaCategoria = document.getElementById(`edit-categoria-${id}`).value;
    const nuevoSubtipo = document.getElementById(`edit-subtipo-${id}`)?.value || '';
    const usuario = getUsuarioActual();

    if (!usuario) {
        mostrarModal("No se pudo identificar al usuario", "error");
        return;
    }
    if ((nuevaCategoria === 'test' || nuevaCategoria === 'juego') && !nuevoSubtipo) {
        mostrarModal(`Debes seleccionar ${nuevaCategoria === 'test' ? 'el test' : 'el juego'} al que se refiere el comentario`, 'info');
        return;
    }

    const payload = { id, usuario, texto: nuevoTexto, categoria: nuevaCategoria, subtipo: nuevoSubtipo };
    console.log('[guardarEdicion] enviando:', payload);
    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => null);
        console.log('[guardarEdicion] respuesta:', response.status, data);

        if (response.ok) {
            cargarComentarios();
            mostrarModal("Comentario editado", "success");
        } else {
            mostrarModal(data?.error || "Error al editar", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("Error de conexión", "error");
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
    const usuario = getUsuarioActual();
    if (!usuario) {
        mostrarModal('Debes iniciar sesión para reportar.', 'info');
        return;
    }

    const motivo = await inputModal('Opcional: añade un motivo para el reporte', 'Descripción (opcional)');
    if (motivo === null) return; // cancel

    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, motivo: motivo || "Sin motivo", usuario })
        });

        const data = await response.json().catch(() => null);
        console.log('[reporte]', response.status, data);
        if (!response.ok) {
            const err = data?.error || 'Error al reportar';
            mostrarModal(err, 'error');
            return;
        }

        if (data && data.deleted) {
            mostrarModal('Comentario eliminado por alcanzar el límite de reportes.', 'info');
        } else if (data && typeof data.reportes !== 'undefined') {
            mostrarModal(`Comentario reportado (reportes: ${data.reportes})`, 'success');
        } else {
            mostrarModal('Reportado. Gracias por ayudar.', 'success');
        }
        cargarComentarios();
    } catch (error) {
        console.error("Error:", error);
        mostrarModal('Error de conexión', 'error');
    }
}

// ========== ELIMINAR COMENTARIO ==========

async function borrarComentario(id) {
    const usuario = getUsuarioActual();
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (window.ADMIN_BEARER) headers['Authorization'] = `Bearer ${window.ADMIN_BEARER}`;
        const response = await fetch(API_URL, {
            method: "DELETE",
            headers,
            body: JSON.stringify({ id, usuario })
        });
        
        if (response.ok) {
            cargarComentarios();
            mostrarModal("Comentario eliminado", "success");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarModal("Error al eliminar", "error");
    }
}

function borrarComentarioPrompt(id) {
    confirmModal('¿Eliminar este comentario?', 'Eliminar').then(ok => { if (ok) borrarComentario(id); });
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

// Modal confirm that returns a Promise<boolean>
function confirmModal(mensaje, title = '') {
    return new Promise((resolve) => {
        const modalExistente = document.getElementById("menteando-modal");
        if (modalExistente) modalExistente.remove();
        const modal = document.createElement("div");
        modal.id = "menteando-modal";
        modal.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:10000;`;
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; max-width:420px; width:90%; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
                <div style="padding:18px 20px; border-bottom:1px solid #eee;">
                    <h3 style="margin:0; font-size:16px; color:#0f172a">${title || 'Confirmar'}</h3>
                </div>
                <div style="padding:18px 20px;">
                    <p style="margin:0 0 12px; color:#334155;">${mensaje}</p>
                    <div style="display:flex; gap:8px; justify-content:flex-end;">
                        <button id="modal-cancel-btn" style="background:#e5e7eb;border:none;padding:8px 12px;border-radius:8px;">Cancelar</button>
                        <button id="modal-ok-btn" style="background:#3b82f6;color:#fff;border:none;padding:8px 12px;border-radius:8px;">Aceptar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) { modal.remove(); resolve(false); } };
        document.getElementById('modal-cancel-btn').onclick = () => { modal.remove(); resolve(false); };
        document.getElementById('modal-ok-btn').onclick = () => { modal.remove(); resolve(true); };
    });
}

// Modal input that returns a Promise<string|null>
function inputModal(mensaje, placeholder = '') {
    return new Promise((resolve) => {
        const modalExistente = document.getElementById("menteando-modal");
        if (modalExistente) modalExistente.remove();
        const modal = document.createElement("div");
        modal.id = "menteando-modal";
        modal.style.cssText = `position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:10000;`;
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; max-width:520px; width:92%; box-shadow: 0 10px 30px rgba(0,0,0,0.12);">
                <div style="padding:18px 20px; border-bottom:1px solid #eee;">
                    <h3 style="margin:0; font-size:16px; color:#0f172a">¿Por qué reportas?</h3>
                </div>
                <div style="padding:18px 20px;">
                    <p style="margin:0 0 8px; color:#334155;">${mensaje}</p>
                    <textarea id="modal-input" placeholder="${placeholder}" style="width:100%; min-height:80px; padding:8px; border-radius:8px; border:1px solid #e5e7eb; resize:vertical;"></textarea>
                    <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
                        <button id="modal-cancel-btn" style="background:#e5e7eb;border:none;padding:8px 12px;border-radius:8px;">Cancelar</button>
                        <button id="modal-ok-btn" style="background:#3b82f6;color:#fff;border:none;padding:8px 12px;border-radius:8px;">Enviar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => { if (e.target === modal) { modal.remove(); resolve(null); } };
        document.getElementById('modal-cancel-btn').onclick = () => { modal.remove(); resolve(null); };
        document.getElementById('modal-ok-btn').onclick = () => { const v = document.getElementById('modal-input').value.trim(); modal.remove(); resolve(v); };
        // focus
        setTimeout(() => document.getElementById('modal-input').focus(), 50);
    });
}

// Normalize avatar path: return absolute path or full URL; fall back to default
function normalizeAvatarPath(path) {
    const fallback = '/assets/icon/usuario.webp';
    if (!path) return fallback;
    path = String(path).trim();
    if (!path) return fallback;
    if (/^https?:\/\//i.test(path)) return path; // full URL
    if (path.startsWith('/')) return path; // already absolute
    // Attempt to find assets/ in path and produce /assets/... otherwise fallback
    const m = path.match(/(assets[\\/].*)$/i);
    if (m && m[1]) return '/' + m[1].replace(/\\/g, '/');
    // If path contains 'img' or 'icon', try to append to /assets
    if (/icon|img|avatar/i.test(path)) {
        const cleaned = path.replace(/^[\.\/]+/, '');
        return '/' + cleaned.replace(/\\/g, '/');
    }
    return fallback;
}

function actualizarAvatar() {
    const avatarImg = document.getElementById("comentario-avatar");
    const nombreInput = document.getElementById("comentario-usuario");
    
    if (typeof getperfil === 'function') {
        const perfil = getperfil();
        if (perfil?.avatar && avatarImg) {
            avatarImg.src = normalizeAvatarPath(perfil.avatar);
        }
        const apodo = perfil?.apodo || perfil?.nombre;
        if (apodo && nombreInput) {
            nombreInput.value = apodo;
            nombreInput.readOnly = true;
            nombreInput.disabled = true;
            nombreInput.classList.add("cursor-not-allowed", "bg-slate-100", "dark:bg-slate-700");
        }
    }
}

// ========== SELECTOR DE SUBTIPO (test / juego) ==========

// Devuelve array de nombres legibles para test o juego, usando catálogos o fallback
function getOpcionesSubtipo(categoria) {
    const fallbackJuegos = [
        "Detector de Intrusos", "Doble Canal", "Silencio Mental", "Operaciones Encadenadas",
        "Eco Visual", "Color Match", "Cambio de Reglas", "Trayectorias Mentales",
        "Misión Orbital", "Reflejos Cruzados"
    ];
    const fallbackTests = [
        "Mini-Examen Cognoscitivo (MEC)", "TAVEC", "Test d2 de Atención",
        "Continuous Performance Test (CPT)", "Corsi Block-Tapping Test (CBT)",
        "Tower of London", "Wisconsin Card Sorting Test (WCST)", "Stroop Test",
        "Digit Span", "Trail Making Test A/B", "Symbol Search", "N-Back", "Go/No-Go Test"
    ];
    if (categoria === 'juego') {
        const lista = typeof window.getCatalogoJuegos === 'function' ? window.getCatalogoJuegos() : [];
        return lista.length ? lista.map(j => j.nombre) : fallbackJuegos;
    }
    if (categoria === 'test') {
        const lista = window.CATALOGO_TESTS || [];
        return lista.length ? lista.map(t => t.nombre) : fallbackTests;
    }
    return [];
}

// Puebla un <select> con las opciones de subtipo para la categoría dada
function poblarSelectSubtipo(selectEl, wrapperEl, categoria, valorActual) {
    const opciones = getOpcionesSubtipo(categoria);
    if (!opciones.length) { wrapperEl.classList.add('hidden'); return; }
    const label = categoria === 'test' ? 'el test' : 'el juego';
    selectEl.innerHTML = `<option value="">Selecciona ${label}</option>`;
    opciones.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        if (nombre === valorActual) opt.selected = true;
        selectEl.appendChild(opt);
    });
    wrapperEl.classList.remove('hidden');
}

function initSubtipoSelector() {
    const catSelect = document.getElementById("comentario-categoria");
    const wrapper = document.getElementById("comentario-subtipo-wrapper");
    const subSelect = document.getElementById("comentario-subtipo");
    if (!catSelect || !wrapper || !subSelect) return;

    catSelect.addEventListener('change', () => {
        const val = catSelect.value;
        let tipo = '';
        if (val === 'juego'){
            tipo = 'juego';
            poblarSelectSubtipo(subSelect, wrapper, tipo, '');
        }else if (val === 'test') {
            tipo = 'test';
            poblarSelectSubtipo(subSelect, wrapper, tipo, '');
        } else {
            wrapper.classList.add('hidden');
            subSelect.innerHTML = `<option value="">Selecciona el ${tipo}</option>`;
        }
    });
}

// ========== INICIALIZACIÓN ==========

document.addEventListener("DOMContentLoaded", () => {
    cargarComentarios();
    actualizarAvatar();
    initSubtipoSelector();
    
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

    // Insert 'Mostrar todos los comentarios' toggle button above the comments container
    const comentariosContainer = document.getElementById('comentarios-container');
    if (comentariosContainer) {
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center justify-end mb-3 gap-2';
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-mostrar-todos';
        toggleBtn.className = 'px-3 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700';
        toggleBtn.textContent = 'Mostrar todos los comentarios';
        toggleBtn.addEventListener('click', () => {
            mostrarTodos = !mostrarTodos;
            toggleBtn.textContent = mostrarTodos ? 'Mostrar solo recientes' : 'Mostrar todos los comentarios';
            cargarComentarios();
        });
        const sortBtn = document.createElement('button');
        sortBtn.id = 'toggle-sort-order';
        sortBtn.className = 'px-3 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700';
        sortBtn.textContent = sortDesc ? 'Orden: recientes' : 'Orden: antiguos';
        sortBtn.addEventListener('click', () => {
            sortDesc = !sortDesc;
            sortBtn.textContent = sortDesc ? 'Orden: recientes' : 'Orden: antiguos';
            cargarComentarios();
        });
        wrapper.appendChild(toggleBtn);
        wrapper.appendChild(sortBtn);
        comentariosContainer.parentNode.insertBefore(wrapper, comentariosContainer);
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