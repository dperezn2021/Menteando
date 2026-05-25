/*
Cloudflare Worker for Menteando comments
 - Uses a KV namespace bound as COMENTARIOS_KV
 - Accepts an admin secret in the environment for admin-only actions (Bearer)
   The Worker will look for either `ADMIN_PASSWORD` or `ADMIN_TOKEN` for compatibility.
 - Supports GET (with categoria, page, limit, all=true), POST (create), PUT (edit/like/reply/report), DELETE (delete by id)
 - Automatically removes comments with report count >= AUTO_DELETE_THRESHOLD (default 5)
 - Sanitizes inputs to avoid empty comments on report actions

To deploy:
 - Create a Worker and bind a KV namespace named COMENTARIOS_KV
 - Add a Worker secret named `ADMIN_PASSWORD` (preferred) or `ADMIN_TOKEN` containing a strong secret
 - Deploy this script
*/

const AUTO_DELETE_THRESHOLD = 5;
const MAX_STORE = 500; // keep last N comments in KV

function sanitizeText(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]*>?/gm, '').trim();
}

function uuid() {
  // simple id
  return Date.now().toString(36) + Math.random().toString(36).slice(2,9);
}

async function readAll(kv) {
  const raw = await kv.get('comentarios');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch(e) { return []; }
}

async function writeAll(kv, arr) {
  // trim store
  if (arr.length > MAX_STORE) arr = arr.slice(-MAX_STORE);
  await kv.put('comentarios', JSON.stringify(arr));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const kv = env.COMENTARIOS_KV;
    const pathname = url.pathname;

    // Determine admin secret (support both ADMIN_PASSWORD and ADMIN_TOKEN)
    // If stored as JSON {"contrasena":"..."}, extract the value
    let adminSecret = env.ADMIN_PASSWORD || env.ADMIN_TOKEN || '';
    try {
      const parsed = JSON.parse(adminSecret);
      if (parsed && parsed.contrasena) adminSecret = String(parsed.contrasena);
    } catch (_) {}

    // CORS preflight — must be first so /verify and other routes don't block it
    if (request.method === 'OPTIONS') {
      return new Response('', { status: 204, headers: corsHeaders() });
    }

    // Lightweight verify endpoint for admin password validation
    // POST /verify { password: '...' } -> 200 OK if matches adminSecret, 401 otherwise
    // Accepts variants like /verify, /verify/, /comments/verify, /comments/verify/
    // Also supports GET /verify?password=... for quick browser testing (less secure)
    if (/(?:^|\/)verify(?:\/|$)/i.test(pathname)) {
      if (request.method !== 'POST' && request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders() });
      }
      try {
        // First try password from URL query param (helps CLI/browser tests)
        let password = url.searchParams.get('password') || '';

        // If it's a GET request and we already have password from query, skip body read.
        if (!password && request.method === 'POST') {
          // If not provided via query, read the body once as text and interpret it
          const txt = await request.text().catch(() => '');
          if (!txt) {
            return new Response(JSON.stringify({ error: 'Invalid JSON or empty body' }), { status: 400, headers: jsonHeaders() });
          }

          // Try JSON first
          try {
            const parsed = JSON.parse(txt);
            password = String(parsed?.password || '');
          } catch (_) {
            // Try urlencoded 'password=...'
            const m = txt.match(/(?:^|\?)password=([^&\n\r]+)/i);
            if (m) {
              password = decodeURIComponent(m[1]);
            } else {
              // Otherwise treat whole body as the password
              password = txt.trim();
            }
          }
        }

        const pass = String(password || '');
        const isAdmin = adminSecret && pass === adminSecret;
        if (isAdmin) {
          return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders() });
        }
        return new Response(JSON.stringify({ ok: false }), { status: 401, headers: jsonHeaders() });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Verify failure', details: String(e) }), { status: 400, headers: jsonHeaders() });
      }
    }

    // Quick health endpoints
    if (/(?:^|\/)ping(?:\/|$)/i.test(pathname) && request.method === 'GET') {
      return new Response(JSON.stringify({ ok: true, fecha: new Date().toISOString() }), { status: 200, headers: jsonHeaders() });
    }

    if (/(?:^|\/)status(?:\/|$)/i.test(pathname) && request.method === 'GET') {
      return new Response(JSON.stringify({ hasAdminSecret: !!adminSecret }), { status: 200, headers: jsonHeaders() });
    }

    if (request.method === 'GET') {
      const q = url.searchParams;
      const categoria = q.get('categoria');
      const all = q.get('all') === 'true';
      const page = parseInt(q.get('page') || '1', 10);
      const limit = parseInt(q.get('limit') || (all ? '100' : '10'), 10);

      let comentarios = await readAll(kv);
      if (categoria) comentarios = comentarios.filter(c => c.categoria === categoria);

      // default: return last "limit" comments
      comentarios = comentarios.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      if (!all) {
        comentarios = comentarios.slice(-limit);
      } else {
        // pagination when all=true
        const start = (page - 1) * limit;
        comentarios = comentarios.slice(start, start + limit);
      }

      return new Response(JSON.stringify(comentarios), { status: 200, headers: jsonHeaders() });
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        const usuario = sanitizeText(body.usuario) || 'anonimo';
        const texto = sanitizeText(body.texto || '');
        const avatar = sanitizeText(body.avatar || '/assets/icon/usuario.webp');
        const categoria = sanitizeText(body.categoria || 'general');

        if (!texto) return new Response(JSON.stringify({ error: 'Texto vacío' }), { status: 400, headers: jsonHeaders() });

        const comentarios = await readAll(kv);
        const nuevo = {
          id: uuid(),
          usuario,
          texto,
          avatar,
          categoria,
          fecha: new Date().toISOString(),
          likes: 0,
          usuariosLikes: [],
          reportes: 0,
          replies: [],
          editado: false
        };
        comentarios.push(nuevo);
        await writeAll(kv, comentarios);
        return new Response(JSON.stringify(nuevo), { status: 201, headers: jsonHeaders() });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: jsonHeaders() });
      }
    }

    if (request.method === 'PUT') {
      try {
        const body = await request.json();
        const comentarios = await readAll(kv);
        const idx = comentarios.findIndex(c => c.id === body.id);
        if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: jsonHeaders() });

        const target = comentarios[idx];

        // LIKE toggling: payload { id, usuario }
        if (body.usuario && !body.reply && !body.texto && !body.categoria) {
          const u = sanitizeText(body.usuario);
          if (!u) return new Response(JSON.stringify({ error: 'Invalid usuario' }), { status: 400, headers: jsonHeaders() });
          const present = target.usuariosLikes || [];
          if (present.includes(u)) {
            target.usuariosLikes = present.filter(x => x !== u);
          } else {
            target.usuariosLikes = present.concat([u]);
          }
          target.likes = (target.usuariosLikes || []).length;
          comentarios[idx] = target;
          await writeAll(kv, comentarios);
          return new Response(JSON.stringify(target), { status: 200, headers: jsonHeaders() });
        }

        // EDIT: payload { id, usuario, texto, categoria }
        if (body.texto || body.categoria) {
          const usr = sanitizeText(body.usuario || '');
          // allow edit if same user or admin token provided
          const auth = getBearer(request);
          const isAdmin = auth && adminSecret && auth === adminSecret;
          if (usr && usr !== target.usuario && !isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized edit' }), { status: 403, headers: jsonHeaders() });

          if (body.texto) target.texto = sanitizeText(body.texto);
          if (body.categoria) target.categoria = sanitizeText(body.categoria);
          target.editado = true;
          comentarios[idx] = target;
          await writeAll(kv, comentarios);
          return new Response(JSON.stringify(target), { status: 200, headers: jsonHeaders() });
        }

        // REPLY: payload { id, reply: { usuario, texto, fecha } }
        if (body.reply) {
          const reply = body.reply;
          const replyUser = sanitizeText(reply.usuario || '');
          const replyText = sanitizeText(reply.texto || '');
          if (!replyUser || !replyText) return new Response(JSON.stringify({ error: 'Invalid reply' }), { status: 400, headers: jsonHeaders() });

          // Only allow admin replies: require Bearer token matching ADMIN_TOKEN OR reply.usuario === 'admin' and token matches
          const auth = getBearer(request);
          const isAdmin = auth && adminSecret && auth === adminSecret;
          if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized reply' }), { status: 403, headers: jsonHeaders() });

          target.replies = target.replies || [];
          target.replies.push({ usuario: replyUser, texto: replyText, fecha: reply.fecha || new Date().toISOString() });
          comentarios[idx] = target;
          await writeAll(kv, comentarios);
          return new Response(JSON.stringify(target), { status: 200, headers: jsonHeaders() });
        }

        // REPORT: payload { id, motivo, usuario }
        if (body.motivo || body.usuario) {
          const rUser = sanitizeText(body.usuario || '');
          // motivo optional but shouldn't create an empty comment
          const motivo = sanitizeText(body.motivo || 'Reporte');
          if (!rUser) return new Response(JSON.stringify({ error: 'Invalid usuario' }), { status: 400, headers: jsonHeaders() });

          target.reportes = (target.reportes || 0) + 1;
          // store last report reason (optional)
          target.lastReport = motivo;
          comentarios[idx] = target;

          // Auto-delete if reached threshold
          if (target.reportes >= AUTO_DELETE_THRESHOLD) {
            const filtered = comentarios.filter(c => c.id !== target.id);
            await writeAll(kv, filtered);
            return new Response(JSON.stringify({ deleted: true }), { status: 200, headers: jsonHeaders() });
          }

          await writeAll(kv, comentarios);
          return new Response(JSON.stringify(target), { status: 200, headers: jsonHeaders() });
        }

        return new Response(JSON.stringify({ error: 'Unknown PUT payload' }), { status: 400, headers: jsonHeaders() });

      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: jsonHeaders() });
      }
    }

    if (request.method === 'DELETE') {
      try {
        const body = await request.json();
        const comentarios = await readAll(kv);
        const idx = comentarios.findIndex(c => c.id === body.id);
        if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: jsonHeaders() });

        // Only admin or original user can delete: check Bearer token for admin, else rely on request.usuario equality
  const auth = getBearer(request);
  const isAdmin = auth && adminSecret && auth === adminSecret;
        if (!isAdmin && body.usuario && body.usuario !== comentarios[idx].usuario) {
          return new Response(JSON.stringify({ error: 'Unauthorized delete' }), { status: 403, headers: jsonHeaders() });
        }

        const filtered = comentarios.filter(c => c.id !== body.id);
        await writeAll(kv, filtered);
        return new Response(JSON.stringify({ deleted: true }), { status: 200, headers: jsonHeaders() });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: jsonHeaders() });
      }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function jsonHeaders() {
  return Object.assign({ 'Content-Type': 'application/json' }, corsHeaders());
}

function getBearer(request) {
  const h = request.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}
