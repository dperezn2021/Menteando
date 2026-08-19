# 🔍 AUDITORÍA TÉCNICA MENTEANDO - MVP FREEMIUM

**Objetivo:** Identificar qué DEBE cambiar, qué DEBERÍA cambiar y qué PUEDE ESPERAR para lanzar pagos reales.

**Contexto:** Developer único, part-time, presupuesto 100-200€, validar willingness to pay en 50-100 usuarios reales.

---

## RESUMEN EJECUTIVO

| Clasificación | Cantidad | Impacto | Acción |
|---|---|---|---|
| **P0 (Bloquea lanzamiento)** | 6 problemas | Crítico | Resolver ANTES de cobrar |
| **P1 (Importante, pero espera)** | 8 problemas | Alto | Resolver DESPUÉS de validar WTP |
| **P2 (Tech debt)** | 12 problemas | Medio/Bajo | Resolver cuando hay tracción |

---

---

# PROBLEMAS P0: BLOQUEAN LANZAMIENTO DE PAGOS

## P0.1: SIN AUTENTICACIÓN - USUARIO NO ESTÁ IDENTIFICADO

**Qué encontré:**
- No hay login/registro
- No hay sesión de usuario
- Perfil se crea automáticamente en localStorage sin email verificado
- Email es opcional (campo puede estar vacío)
- No hay forma de saber quién es el usuario

**Por qué es problema:**
- **No puedes cobrar a alguien que no está identificado**
- No sabes si es la misma persona en distintos navegadores
- No puedes sincronizar datos entre dispositivos (web, móvil, otra PC)
- No puedes enviar email de confirmación de pago
- No puedes recuperar contraseña o cuenta
- Para Stripe necesitas email + user ID único

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Sin identificación = sin pagos
- Usuario prueba free → se quiere suscribir → no hay forma de crear cuenta/pagar
- Alguien roba tu cuenta (simplemente borra localStorage en otro navegador y crea una nueva)

**Solución mínima viable:**
```
1. Registro anónimo→ email (no requiere contraseña)
   - Modal al entrar: "Email (para tu cuenta y recibos)"
   - Validación básica: es_email(input)
   - Envío: enlace de verificación con token (Firebase Auth)
   
2. Sin contraseña = login por email mágico
   - Usuario: "Log in" → introduce email
   - Recibe link en correo → hace click → entra
   - Token expira en 15 min
   
3. localStorage + backend en sync
   - Si token válido → localStorage tiene user_id + email
   - Backend sincroniza automáticamente
```

**Estimación de esfuerzo:** 8-12 horas
- Firebase Auth setup + email magic link: 3-4h
- Modal de onboarding: 2-3h
- Sincronización localStorage ↔ Firebase: 2-3h
- Testing: 1-2h

**Implementación:** OBLIGATORIO ANTES de ir a producción

---

## P0.2: SIN BASE DE DATOS - DATOS LOCALES SOLO

**Qué encontré:**
- TODO almacenado en localStorage (máx ~5-10MB por navegador)
- Sin sincronización a servidor
- Sin backup automático
- Usuario pierde todo si limpia cache o cambia navegador

**Por qué es problema:**
- **No puedes escalar con usuarios reales**
- localStorage tiene límites (5-10MB, varía por navegador)
- Usuario con 50 sesiones × 10 juegos = ~200KB, pero con 200 sesiones × 100 usuarios = crash
- No tienes datos para analytics/business intelligence
- No puedes implementar pagos sin datos persistentes en servidor
- Si servidor de pagos llama a tu API para validar suscripción, ¿dónde buscas?

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Usuario paga → datos se pierden (navega desde otro navegador) → duda

**Solución mínima viable:**
```
Crear "realtime sync" simple:
1. User autenticado con email
2. Cada cambio en localStorage:
   - Envía cambio a Firebase Realtime Database (JSON)
   - Guarda timestamp de sync
   
3. Fallback:
   - Sin internet → sigue funcionando con localStorage
   - Cuando vuelve conexión → sincroniza cambios pendientes
   
4. Estructura en Firebase:
   /users/{userId}/
     ├─ profile/
     │  ├─ nombre, email, edad, avatar, puntos, nivel...
     │  └─ lastSync: timestamp
     ├─ sessions/
     │  ├─ {sessionId}/ { gameId, puntos, metricas, timestamp }
     │  └─ {sessionId}/ ...
     └─ settings/
        ├─ suscripcion / { plan, paidUntil, status }
        └─ tema, coach_disabled, ...
```

**Estimación de esfuerzo:** 12-16 horas
- Firebase Realtime DB setup: 1-2h
- Migrar estructura localStorage → Firebase JSON: 2-3h
- Sync mechanism (push + pull): 4-5h
- Conflict resolution (si cambios offline): 2-3h
- Testing sincronización: 2-3h

**Implementación:** OBLIGATORIO ANTES de ir a producción (va junto con P0.1)

---

## P0.3: SIN INTEGRACIÓN DE PAGOS

**Qué encontré:**
- No hay Stripe/PayPal integrado
- No hay endpoint para cobrar
- No hay checkout flow
- No hay gestión de suscripciones
- No hay webhooks para validar pagos

**Por qué es problema:**
- **Obviamente: no puedes cobrar sin esto**
- Necesitas servidor backend para procesar pagos (no puedes hacerlo desde frontend)
- Stripe + el usuario pueden ser victimas de fraud/chargebacks
- No hay forma de revocar acceso si pago falla

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Sin Stripe = sin ingresos

**Solución mínima viable:**
```
Opción 1: Stripe + Cloudflare Workers (minimal)
1. Frontend: botón "Upgrade to Premium"
   - Abre modal con precio (€9.99/mes)
   - Stripe Checkout redirige a Stripe hosted page
   
2. Backend mínimo: Cloudflare Worker
   - POST /create-checkout-session
     → Recibe userId + plan
     → Stripe.checkout.sessions.create()
     → Retorna redirect URL
   
   - POST /webhook (Stripe eventos)
     → customer.subscription.created
     → customer.subscription.deleted
     → invoice.payment_succeeded / _failed
     → Actualiza Firebase: user.subscription.status
   
3. Frontend valida:
   - ¿localStorage.subscription.status === "active"?
   - ¿localStorage.subscription.paidUntil > now?
   → Mostrar/ocultar contenido premium

Opción 2: Lemon Squeezy (más simple pero comisiones)
- Hosted checkout (no necesitas backend)
- Comisiones más altas (8-10% vs 2.9% Stripe)
- Mejor para MVP initial

RECOMENDACIÓN PARA TI: Opción 1 (Stripe)
- Comisiones bajas (2.9% + 0.30€)
- Cloudflare Workers es gratis
- Puedes crecer sin límite
```

**Estimación de esfuerzo:** 10-14 horas
- Stripe account setup: 0.5h
- Cloudflare Worker para checkout: 3-4h
- Webhook listener: 2-3h
- Frontend checkout button/modal: 2-3h
- Validación de suscripción en app: 1-2h
- Testing (sandbox Stripe): 2h

**Implementación:** OBLIGATORIO ANTES de ir a producción

---

## P0.4: SIN GESTIÓN DE SUSCRIPCIÓN / ESTADOS DE USUARIO

**Qué encontré:**
- No hay concepto de "free" vs "premium"
- Todos tienen acceso a todo (incluso tests "premium" que no existen todavía)
- No hay fecha de expiración de suscripción
- No hay forma de verificar si usuario puede acceder a contenido

**Por qué es problema:**
- **No puedes saber cuándo revocar acceso a premium**
- Usuario paga 1 mes → no renueva → sigue viendo premium
- No hay forma de hacer A/B testing ("muestra esto a free, esto a premium")
- No hay forma de ofrecer diferentes precios a diferentes usuarios

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Usuario premium se cancela pero sigue usando la app como premium

**Solución mínima viable:**
```
1. Estructura en Firebase:
   /users/{userId}/subscription/
     ├─ status: "free" | "premium" | "trial"
     ├─ plan: "monthly" | "annual" (null si free)
     ├─ paidUntil: 1724005200000 (timestamp)
     ├─ createdAt: 1723918800000
     ├─ cancelledAt: null (si no está cancelado)
     └─ stripeCustomerId: "cus_..."

2. Helper function en frontend:
   function isPremium() {
     const sub = localStorage.getItem("subscription");
     if (!sub) return false;
     if (sub.status !== "premium") return false;
     if (sub.paidUntil < now()) return false; // expirado
     return true;
   }

3. Al cargar la app:
   - Verifica suscripción en Firebase
   - Actualiza localStorage.subscription
   - Renderiza/oculta features según isPremium()

4. Flujo:
   - Free user intenta acceder a feature premium
   - if (!isPremium()) → Modal "Upgrade to Premium"
     → Botón "Subscribe" → Stripe Checkout
```

**Estimación de esfuerzo:** 4-6 horas
- Data model en Firebase: 1h
- Helper functions (isPremium, etc): 1-2h
- UI gating de features: 1-2h
- Testing: 1h

**Implementación:** OBLIGATORIO (pero depende de P0.1 + P0.2 + P0.3)

---

## P0.5: SIN SEPARACIÓN FREE vs PREMIUM - QUÉ OFRECER

**Qué encontré:**
- 10 juegos, 13 tests → todos accesibles sin restricción
- No está definido qué va en free vs premium
- No hay paywall / restricción de acceso

**Por qué es problema:**
- **No puedes validar si la gente pagaría por premium**
- Si das acceso a TODO gratis, nadie pagará
- Necesitas una propuesta de valor clara para premium

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Sin propuesta de valor = 0% conversión free→premium

**Solución mínima viable:**
```
FREEMIUM SPLIT (recomendado):

FREE:
├─ 3 juegos (3 de 10)
│  └─ detector-intrusos, eco-visual, color-match
├─ 2 tests (2 de 13)
│  └─ mec, digit-span
├─ Coach básico (mensajes estándar)
├─ Perfil (pero stats limitadas)
└─ 7 medallas de las 9

PREMIUM:
├─ Todos los 10 juegos
├─ Todos los 13 tests
├─ Coach avanzado (mensajes personalizados por performance)
├─ Reportes exportables (PDF/email)
├─ Stats detalladas por habilidad
├─ Gráficos de progreso
├─ Recomendaciones de tests basado en debilidades
├─ Sincronización multi-device garantizada
└─ Todas las 9 medallas
```

**Lógica de implementación:**
```javascript
// En catalogoJuegos.js:
CATALOGO_JUEGOS.forEach(juego => {
  juego.requiereFreemium = ["detector-intrusos", "eco-visual", "color-match"].includes(juego.id);
});

// En gameDetailPage.js:
if (juego.requiereFreemium && !isPremium()) {
  mostrarPaywall("Este juego es solo para premium");
}
```

**Estimación de esfuerzo:** 6-8 horas
- Definir qué juegos/tests para free: 0.5h
- Agregar flags "requiereFreemium" a catalogs: 1h
- Crear checks en gameDetailPage/testDetailPage: 2-3h
- Diseñar paywalls (modals): 1-2h
- Testing: 1h

**Implementación:** OBLIGATORIO (pero puede hacerse en paralelo)

---

## P0.6: SIN PÁGINA DE PAGO / CHECKOUT FLOW

**Qué encontré:**
- No existe página de checkout o "upgrade to premium"
- No hay modal de precios
- No hay funnel de conversión

**Por qué es problema:**
- Usuario quiere pagar pero no sabe cómo
- Necesitas UI clara: precio, what you get, CTA "subscribe"

**Riesgo real para MVP:**
- 🔴 CRÍTICO: Aunque Stripe funcione, usuario no sabe dónde hacer click

**Solución mínima viable:**
```
Crear página: /premium.html

Contenido:
┌─────────────────────────────────────┐
│  🎯 UPGRADE A PREMIUM               │
├─────────────────────────────────────┤
│                                     │
│  Desbloquea el 100% del potencial  │
│  cognitivo                          │
│                                     │
│  Incluye:                           │
│  ✅ 10 juegos (vs 3 en free)       │
│  ✅ 13 tests (vs 2 en free)        │
│  ✅ Reportes PDF personalizados    │
│  ✅ Sincronización multi-device    │
│  ✅ Coach avanzado                 │
│  ✅ 7 días gratis, sin tarjeta     │
│                                     │
│  💶 €9.99/mes o €99/año            │
│                                     │
│  [EMPEZAR PRUEBA GRATIS] (rojo)    │
│  [TENGO UNA CUENTA]                │
│                                     │
└─────────────────────────────────────┘

Al hacer click en CTA:
1. Si no está logueado:
   - Pide email (modal)
   - Valida email
   - Entra en suscripción

2. Si está logueado:
   - Redirige a Stripe Checkout directamente
```

**Estimación de esfuerzo:** 4-5 horas
- Diseño HTML/Tailwind: 2-3h
- Lógica de botón (login → Stripe): 1-2h
- Testing: 0.5h

**Implementación:** RECOMENDADO ANTES de lanzar (pero puedes hacerlo sin página si tienes paywall en cada feature)

---

---

# PROBLEMAS P1: IMPORTANTE, PERO PUEDE ESPERAR

## P1.1: SIN GDPR/PRIVACIDAD - POSIBLE MULTA

**Qué encontré:**
- No hay política de privacidad en el sitio
- No hay consentimiento de cookies
- No hay derecho de exportación de datos
- No hay derecho al olvido (delete account)
- Sin clausula de procesamiento de datos

**Por qué es problema (P1, no P0):**
- GDPR multa por falta de política, pero no es inmediato
- Multas: 10-20M€ por violación grave (pero aplica después de denuncia + investigación)
- CON pocos usuarios (<1000), riesgo bajo temporalmente
- PERO: crece linealmente con usuarios

**Riesgo real para MVP:**
- 🟠 MEDIO: Con <100 usuarios, reguladores no van a buscarte
- PERO: Usuario pode denunciar → investigación → multa retroactiva

**Solución mínima viable:**
```
1. Crear /privacy.html
   - Explicar qué datos recopilas
   - Explicar cómo se usan
   - Explicar tiempo de retención
   - Explicar derechos del usuario
   - Link a tu email para derechos GDPR

2. Agregar banner de cookies en index.html
   - "Usamos cookies para..."
   - Botón "Aceptar" 
   - (Aquí puedes usar localStorage para tracking)

3. Agregar en perfil.html: Opción "Descargar mis datos"
   - Genera JSON con perfil completo
   - Usuario descarga en navegador
   
4. Agregar: Opción "Eliminar mi cuenta"
   - Modal de confirmación
   - Borra cuenta + datos en Firebase
   - (Puedes guardar anónimizado para analytics)
```

**Estimación de esfuerzo:** 3-4 horas
- Redactar privacy policy (copiar de plantilla): 1h
- Agregar banner HTML: 0.5h
- Botón "Descargar datos": 1h
- Botón "Eliminar cuenta": 1-1.5h

**Implementación:** Hacer ANTES de 100 usuarios, OK para MVP inicial

---

## P1.2: SIN VALIDACIÓN DE TESTS - PUEDEN NO SER CIENTÍFICAMENTE VÁLIDOS

**Qué encontré:**
- Tests inspiraos en pruebas reales (MEC, TAVEC, Stroop, etc)
- PERO: Implementación en JavaScript, no en software validado
- Sin psicómetro profesional revisando algoritmos
- Sin puntos de corte/normas validadas
- Podrías dar diagnósticos incorrectos

**Por qué es problema (P1, no P0):**
- Responsabilidad legal: si dices "tienes Alzheimer" basado en tests no validados
- Profesionales de salud no recomendarían la app
- Risk: Usuario se fía del resultado, no busca médico real, se hace daño

**Riesgo real para MVP:**
- 🟠 MEDIO: Si eres honesto ("herramienta educativa, no diagnóstica") = OK
- 🔴 ALTO: Si posicionas como "diagnóstico médico"

**Solución mínima viable:**
```
1. Disclaimer claro en cada test:
   "⚠️ Esta es una herramienta educativa.
    NO reemplaza una evaluación profesional.
    Si tienes preocupaciones, consulta a un profesional de salud."

2. En perfil / resultados:
   "Estos números son referencias. Consult a un neuropsicólogo
    para una evaluación formal."

3. Opción: Descargo de responsabilidad en términos de servicio
   "Menteando no diagnóstica ni trata condiciones médicas."

4. Futuro (Premium): Ofrecer "Reporte para llevar a psicólogo"
   - PDF con resultados + gráficos
   - Psicólogo puede usarlo como referencia

RECOMENDACIÓN: Empieza con disclaimers fuertes.
Si crece mucho, contacta a psicólogos para validación formal.
```

**Estimación de esfuerzo:** 2-3 horas
- Agregar disclaimer en cada test: 0.5h
- Redactar términos de servicio: 1h
- Agregar en perfil: 0.5-1h

**Implementación:** IMPORTANTE ANTES de lanzar (evita problemas legales)

---

## P1.3: SIN EMAIL VERIFICADO - EMAILS INVÁLIDOS O SPAM

**Qué encontré:**
- Email se captura en registro pero no se verifica
- Usuario puede poner cualquier email (spam, incorrecto)
- No tienes forma de saber si es válido

**Por qué es problema (P1):**
- Usuario paga, pero email es incorrecto → recibo no llega
- EmailJS envía a emails no válidos = bounce rate alto
- No puedes contactar si hay problema con pago
- Spam bots llenan tu DB con emails falsos

**Riesgo real para MVP:**
- 🟠 MEDIO: Afecta al 5-10% de usuarios

**Solución mínima viable:**
```
1. Validación básica en frontend:
   - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
   
2. Al guardar en Firebase:
   - Verificación de email con link
   - Email no confirmado → user.emailVerified = false
   
3. Si intenta pagar sin email verificado:
   - Modal: "Verifica tu email para continuar"
   - Reenvía link de verificación
   
4. EmailJS solo funciona si emailVerified = true
```

**Estimación de esfuerzo:** 2-3 horas
- Firebase email verification setup: 1h
- Modal + lógica: 1-2h

**Implementación:** Hacer en paralelo con P0.1

---

## P1.4: METRICS NO NORMALIZADAS - COMPARAR PUNTUACIONES ES DIFÍCIL

**Qué encontré:**
- Cada juego/test da puntos de forma diferente
- detector-intrusos: 0-5000 puntos
- color-match: 0-1000 puntos
- Tests: scales de 0-100, 0-30, etc
- No hay norma de población (percentiles)

**Por qué es problema (P1):**
- Usuario no entiende: "¿2500 puntos en detector-intrusos es bueno o malo?"
- Sin población de referencia, es imposible comparar
- Premium users esperarían "compararse con otros" (futura feature)

**Riesgo real para MVP:**
- 🟠 BAJO INICIAL: No afecta MVP
- 🟡 IMPORTANTE A LARGO PLAZO: Si crece, necesitarás normas

**Solución mínima viable:**
```
Para MVP: 
- NO añadas percentiles todavía
- Simplemente muestra: "Mejoraste 10% vs hace 7 días"
- Comparación temporal, no poblacional

Futuro (P1 → P2):
- Recopilar resultados de 1000+ usuarios
- Calcular percentiles: "Mejor que 75% de usuarios"
```

**Estimación de esfuerzo:** 0 horas para MVP

---

## P1.5: SIN RATE LIMITING / ANTI-ABUSE

**Qué encontré:**
- Sin protección contra:
  - Usuarios creando cuentas múltiples
  - Mismo usuario farmando puntos (resetear localStorage, jugar N veces)
  - Attacks de comentarios/spam
  
**Por qué es problema (P1):**
- Datos fraudulentos = métricas basura
- Spam en comentarios
- Alguien podría fake leaderboards (cuando existan)

**Riesgo real para MVP:**
- 🟠 MEDIO: Con 50-100 usuarios, riesgo bajo
- 🔴 ALTO: Con 1000+ usuarios, riesgo crece

**Solución mínima viable:**
```
Para MVP: rate limiting simple
1. IP-based (Cloudflare Workers):
   - Max 10 juegos/hour por IP
   - Max 5 tests/hour por IP
   - Si pasa → error "Espera un poco"

2. User-based (Firebase):
   - Check: ¿mismo user acaba de completar juego hace <5 min?
   - Si → rechaza (error "Completa otro antes")
   
3. Comentarios (ya está en API):
   - Validar apodo no duplicado
   - Max 5 comentarios/hour por IP
```

**Estimación de esfuerzo:** 3-4 horas
- Rate limiting en Cloudflare: 1-2h
- Validación en Firebase: 1-2h

**Implementación:** OK para MVP si tienes pocas users

---

## P1.6: SIN ANALYTICS / BUSINESS INTELLIGENCE

**Qué encontré:**
- Sin Google Analytics
- Sin eventos personalizados
- Sin funnel tracking
- Sin cohort analysis
- No sabes cuántos usuarios, dónde salen, conversion rate, etc

**Por qué es problema (P1):**
- No puedes medir: ¿1 de 100 usuarios es premium o 50 de 100?
- No puedes optimizar sin datos
- No sabes si paywall es el problema o algo antes

**Riesgo real para MVP:**
- 🟡 IMPORTANTE: Sin datos = decisiones a ciegas

**Solución mínima viable:**
```
Opción 1: Google Analytics 4 (gratis)
- Setup: 15 min
- Track eventos:
  - page_view (automático)
  - user_signup
  - free_trial_started
  - subscription_created
  - subscription_cancelled
  - game_started / game_completed
  - test_started / test_completed

Opción 2: Plausible (simple, privacidad)
- Setup: 15 min
- Comisión: €9/mes (opcional)
- Simpler, GDPR-friendly
- PERO: Menos eventos

RECOMENDACIÓN: GA4 por ahora (gratis)
```

**Estimación de esfuerzo:** 3-4 horas
- GA4 setup: 0.5h
- Eventos en código: 2-3h
- Testing: 0.5h

**Implementación:** ANTES de lanzar (necesitas datos para validar)

---

## P1.7: SIN SOPORTE A USUARIOS - NO HAY FORMA DE CONTACTAR

**Qué encontré:**
- Formulario de contacto existe (about.html) pero va a menteando.info@gmail.com
- Sin ticket system
- Sin FAQ
- Sin chat
- Sin esperanza para usuario frustrado

**Por qué es problema (P1):**
- Usuario paga pero tiene problema
- Correo al buzón → tarda 24h en responder
- Usuario se frustra → chargeback (reclama a Stripe)

**Riesgo real para MVP:**
- 🟡 IMPORTANTE: Con dinero involucrado, necesitas responder rápido

**Solución mínima viable:**
```
1. Crear /faq.html
   - "¿Qué pruebas puedo hacer en free?"
   - "¿Cómo cambio mi email?"
   - "¿Cómo cancelo mi suscripción?"
   - etc

2. Email + Stripe Dashboard
   - Responde emails manualmente (es rápido)
   - Stripe te notifica de chargebacks
   
3. Crear email de soporte: support@menteando.com
   - Redirige a tu correo personal por ahora
   
4. Agregar chat simple (futuro)
   - Opcional: Crisp.chat (gratis, después €25/mes)
```

**Estimación de esfuerzo:** 2-3 horas
- Redactar FAQ: 1-2h
- Configurar email: 0.5h

**Implementación:** OK para MVP

---

## P1.8: SIN TESTS A/B - NO SABES SI PRICING/DISEÑO ES ÓPTIMO

**Qué encontré:**
- Un solo diseño de paywall
- Un solo precio (propuesto: €9.99)
- Sin variación de propuestas de valor

**Por qué es problema (P1):**
- Podrías estar dejando dinero en la mesa
- "€5.99/mes" podría dar 2x conversión pero 0.5x revenue
- "€19.99/mes" podría dar 0.5x conversión pero 2x revenue

**Riesgo real para MVP:**
- 🟡 IMPORTANTE: Precio subóptimo = menos ingresos
- PERO: Requiere mucho traffic para ser significativo

**Solución mínima viable:**
```
Para MVP: No hagas A/B testing formal
Simplemente:
1. Lanza con un precio (€9.99)
2. Mide conversion rate después de 100 users
3. Si <3%: prueba bajar a €4.99
4. Si >5%: prueba subir a €14.99
5. Itera basado en datos reales

Futuro: Si crece, haz A/B testing con Google Optimize
```

**Estimación de esfuerzo:** 0 horas para MVP

---

---

# PROBLEMAS P2: TECH DEBT (PUEDE ESPERAR)

## P2.1: CÓDIGO SIN MODULARIZAR / SPAGHETTI CODE

**Qué encontré:**
- 19 archivos JS pero sin estructura clara
- gamdeDetailPage.js (38KB) hace muchas cosas
- testDetailPage.js (180KB) incluye TODA la lógica de tests
- Acoplamiento entre perfil.js, storage.js, renderización

**Por qué es problema (P2):**
- Difícil de mantener
- Bug en un archivo afecta múltiples features
- Difícil agregar nuevas features
- PERO: Funciona actualmente, no bloquea MVP

**Riesgo real para MVP:**
- 🟢 BAJO: Con 50-100 usuarios, si funciona, no lo toques

**Solución mínima viable:**
```
NO HAGAS nada para MVP.

Futuro (cuando crezcas):
- Refactor a módulos ES6
- Considera framework: Svelte, React lite (Preact)
- Separar: logica de datos, renderización, UI
```

**Estimación de esfuerzo:** 20-30 horas (para después)

---

## P2.2: SIN TESTS AUTOMATIZADOS

**Qué encontré:**
- Cero tests unitarios
- Cero tests de integración
- Sin CI/CD

**Por qué es problema (P2):**
- Cambios rompen cosas sin darte cuenta
- PERO: Actualmente no hay cambios frecuentes

**Riesgo real para MVP:**
- 🟢 BAJO: MVP puedes hacerlo sin tests

**Solución mínima viable:**
```
Cuando tengas 10+ cambios/semana:
1. Setup Jest (testing framework)
2. Tests para funciones críticas:
   - isPremium()
   - saveperfil() / getperfil()
   - calculateHabilidades()
3. CI: GitHub Actions automático
```

**Estimación de esfuerzo:** 10-15 horas (para después)

---

## P2.3: SIN OPTIMIZACIÓN DE PERFORMANCE

**Qué encontró:**
- 10 juegos × 17-40MB cada uno = lento para usuarios con conexión mala
- localStorage.getItem() se llama múltiples veces
- Sin compresión de assets
- Sin lazy loading de juegos

**Por qué es problema (P2):**
- Página tarda en cargar
- PERO: Funciona, y en MVP validar que la gente pague es prioridad #1

**Riesgo real para MVP:**
- 🟡 MEDIO TEMPORAL: Algunos usuarios con conexión mala se irán
- PERO: Cloudflare CDN ayuda mucho

**Solución mínima viable:**
```
Para MVP:
- No optimices todavía
- Confía en Cloudflare CDN

Futuro (cuando tengas traction):
- Compresión Brotli (Cloudflare Pages automático)
- Lazy loading de juegos (cargar solo al hacer click)
- IndexedDB en lugar de localStorage si datos crecen
- Web Workers para cálculos pesados
```

**Estimación de esfuerzo:** 0 horas para MVP

---

## P2.4: SIN VERSIONADO / BACKWARD COMPATIBILITY

**Qué encontré:**
- Si cambias estructura localStorage, datos viejos se pierden
- Sin migrations

**Por qué es problema (P2):**
- MVP tendrá pocos datos, no es crítico aún
- Pero es buena práctica

**Riesgo real para MVP:**
- 🟢 BAJO: Usuarios nuevos no les afecta

**Solución mínima viable:**
```
Para MVP:
- Si necesitas cambiar estructura localStorage:
  - Simplemente borra y comienza de cero
  - Avisa a usuarios: "Datos resetados por actualización"

Futuro (escala):
- Implementar migrations (schema versioning)
```

**Estimación de esfuerzo:** 0 horas para MVP

---

## P2.5: SIN DOCUMENTACIÓN

**Qué encontré:**
- README.md es bueno
- PERO: No hay documentación de API interna
- No hay comentarios en código
- Si otro dev entra, está perdido

**Por qué es problema (P2):**
- No bloqueaa funcionalidad
- PERO: Dificulta colaboración futura

**Riesgo real para MVP:**
- 🟢 BAJO: Eres el único dev

**Solución mínima viable:**
```
Para MVP: Completa README con:
- "Estructura de localStorage"
- "Cómo agregar un nuevo juego"
- "Cómo agregar un nuevo test"

Futuro: Cuando colabores, crea wiki
```

**Estimación de esfuerzo:** 2-3 horas

---

## P2.6: UNITY BUILDS GRANDES

**Qué encontró:**
- Cada juego: 17-40MB (WASM + data)
- 10 juegos = 200-400MB
- Lento para usuarios con conexión limitada

**Por qué es problema (P2):**
- PERO: Cloudflare CDN cached, solo baja una vez
- Usuarios mobiles (3G) pueden tardar 1-2 min en primer juego

**Riesgo real para MVP:**
- 🟡 BAJO-MEDIO: 1-2 min es aceptable, pero no ideal

**Solución mínima viable:**
```
Para MVP: No hagas nada

Futuro (escala):
- Optimización Unity:
  - Asset stripping
  - Compression
  - Progressive download
  
- Upgrade a WebGPU (en lugar de WebGL)
```

**Estimación de esfuerzo:** 0 horas para MVP (después: 10-15h por juego)

---

## P2.7-12: OTROS TECH DEBT MINOR

- P2.7: Sin dark mode toggle (existe pero no persistente)
- P2.8: CSS no está comprimido/minificado
- P2.9: Assets no están optimizadas (imágenes grandes)
- P2.10: Sin SEO optimizado (meta tags faltantes)
- P2.11: Sin service worker / offline mode
- P2.12: Sin monitoring de errores (Sentry, etc)

**Estimación individual:** 1-3 horas cada una (hacer cuando tengas traction)

---

---

# ANÁLISIS DEL FLUJO DE PAGOS: QUÉ ARQUITECTURA NECESITAS

## Flujo Ideal para MVP Freemium

```
VISITANTE (no registrado)
         │
         ▼
    [Página Principal]
         │
         ├─ "Probar Gratis" (free users)
         │   ├─ Modal: "Introduce tu email"
         │   ├─ Valida: es_email(input)
         │   └─ Firebase Auth: envía email mágico
         │
         └─ "Ya tengo cuenta" (returning users)
             └─ Introduce email → Firebase Auth link
                    │
                    ▼
            [Usuario logueado]
                    │
            ┌───────┴────────┐
            │                │
         [FREE]            [PREMIUM]
            │                │
    ├─ 3 juegos       ├─ 10 juegos
    ├─ 2 tests        ├─ 13 tests
    ├─ Stats básicas  ├─ Reportes PDF
    └─ Coach standard └─ Coach avanzado
            │                │
         [Usa app]     [Usa app]
            │                │
      Intenta acceder    [Acceso OK]
      a feature premium        │
            │                  ▼
            ▼            [Paga + sigue]
       [PAYWALL MODAL]
            │
      "Upgrade a Premium"
      €9.99/mes o €99/año
      "7 días gratis"
            │
         [Clic]
            │
            ▼
    [Stripe Checkout]
            │
    ┌──────┴──────┐
    │             │
  [Pago OK]    [Pago falla]
    │             │
    ▼             ▼
[Success]    [Error modal]
Set:         "Intenta otra
user.sub     tarjeta o
scription    banco"
.status =
"premium"
.paidUntil
= fecha
    │
    ▼
[Premium features activo]
```

---

## Data Flow para Soportar Esto

```
CUANDO USUARIO ABRE LA APP:

1. Check localStorage.user
   ├─ ¿Existe? → Skip 2-4
   └─ ¿No existe? → Mostrar modal email

2. Modal de email
   └─ Input email → Firebase Auth.signInWithEmailLink()

3. Firebase Auth
   ├─ Si email nuevo → crea user
   ├─ Si email existe → login
   └─ Retorna: user.uid (ID único)

4. Sincronizar:
   ├─ Leer: localStorage.subscription
   ├─ Si no existe → GET /api/user/{uid}/subscription (Firebase)
   ├─ Guardar resultado en localStorage
   └─ user.subscription = { status, paidUntil, plan, ... }

5. App inicializa
   ├─ Renderiza UI según isPremium()
   └─ Configura paywalls

6. Cuando usuario juega:
   ├─ SaveGameData() → almacena en localStorage
   ├─ POST /sync → Firebase sincroniza
   └─ Cada 60s → sync automático de cambios


CUANDO USUARIO INTENTA PAGAR:

7. Clic en "Upgrade to Premium"
   ├─ POST /create-checkout-session
   │  ├─ Body: { userId, planId }
   │  └─ Response: { checkoutUrl }
   └─ Redirige a Stripe Checkout

8. Stripe Checkout
   ├─ Usuario introduce tarjeta
   ├─ Stripe procesa
   └─ Redirige a /success o /cancel

9. Webhook: Stripe → Cloudflare Worker
   ├─ Event: "customer.subscription.created"
   ├─ UPDATE: Firebase { user.subscription.status = "premium", .paidUntil = timestamp }
   └─ Email (opcional): "¡Gracias por suscribirte!"

10. Cada mes: Stripe renueva automáticamente
    ├─ Si renovación OK → webhook actualiza Firebase
    └─ Si falla → usuario recibe email de Stripe para actualizar tarjeta


CANCELACIÓN:

11. Usuario cancela desde portal Stripe o tu app
    ├─ Stripe event: "customer.subscription.deleted"
    └─ Webhook → Firebase: { status = "free", paidUntil = null }
```

---

## Requisitos de Seguridad para Pagos

```
✅ OBLIGATORIO:
1. HTTPS en toda la app (Cloudflare automático)
2. No almacenar números de tarjeta (Stripe PCI compliant)
3. No validar desde frontend (siempre del backend)
4. Webhooks firmados (Stripe envía X-Stripe-Signature)
5. Rate limiting en endpoints de pago (evitar abuse)
6. Logging de intentos de fraude
7. Validación de email antes de cobrar
8. GDPR: privacidad de datos

❌ NUNCA:
- Almacenar números de tarjeta (Stripe maneja esto)
- Enviar datos de tarjeta por localStorage
- Confiar en cliente para validar suscripción (siempre checkear servidor)
```

---

---

# MATRIZ DE DATOS: LOCALHOST vs BACKEND vs SINCRONIZACIÓN

| Dato | Dónde | Lógica |
|------|-------|--------|
| **Email** | Firebase Auth | ID único + contacto |
| **Nombre/Edad/Avatar** | Firebase (user profile) + localStorage | Cambios lentos, sincronizar en login |
| **Puntos/Nivel/Racha** | Firebase + localStorage | Cambia frecuente, syncronizar cada 60s |
| **Juegos (historial)** | Firebase (Realtime DB) + localStorage | Grandes volúmenes, sincronizar en background |
| **Tests (historial)** | Firebase (Realtime DB) + localStorage | Grandes volúmenes, sincronizar en background |
| **Habilidades detalladas** | Firebase (calculated) + localStorage | Derivado de sesiones, recalcular en servidor |
| **Medallas desbloqueadas** | Firebase + localStorage | Cambios esporádicos, sincronizar en login |
| **Suscripción (status/plan/fecha)** | Firebase SOLO | Crítico, nunca confiar client-side |
| **Tema/preferences** | localStorage SOLO | No sincronizan (personal del navegador) |
| **Comentarios** | Cloudflare Workers | Público, no personal |

---

---

# PLAN TÉCNICO: ORDEN DE IMPLEMENTACIÓN

## FASE 0: VALIDACIÓN PREVIA (Antes de código)
**Duración:** 2-3 días
**Entrada:** Este documento
**Salida:** Aprobación de arquitectura + specs detalladas

```
□ Revisas este documento
□ Discutimos cambios/aclaraciones
□ Fijamos detalles de:
  - Qué juegos en free vs premium
  - Precio exacto (€9.99 o ?)
  - Trial period (7 días, 14 días, ninguno?)
  - Email (obligatorio para pagar?)
  - Stripe vs Lemon Squeezy
□ Procedo con especificaciones técnicas detalladas
```

---

## FASE 1: AUTENTICACIÓN + BASE DE DATOS (BLOQUEADOR CRÍTICO)
**Duración estimada:** 20-28 horas
**Dependencias:** Fase 0 aprobada
**Salida:** App funciona con login + datos en Firebase

### 1.1: Firebase Setup (3-4 horas)
```
□ Crear proyecto Firebase
□ Habilitar: Authentication (email link) + Realtime Database
□ Setup reglas de seguridad (solo user ve sus datos)
□ Crear índices para queries
□ Setup backups automáticos
□ Stripe integration (opcional: Stripe extension)
```

**Específicamente:**
- Firebase Console → New Project
- Authentication → Email/Password (desabilitar)
- Authentication → Email Link (habilitar)
- Realtime Database → Crear (test mode primero)
- Security Rules:
  ```
  {
    "rules": {
      "users": {
        "$uid": {
          ".read": "auth.uid == $uid",
          ".write": "auth.uid == $uid"
        }
      }
    }
  }
  ```

### 1.2: Implementar Login Modal (4-5 horas)
```
□ Crear modal HTML
□ Validar email (básico + regex)
□ Firebase Auth.sendSignInLinkToEmail()
□ Verificar enlace en login
□ Almacenar user.uid en localStorage
□ Mostrar "Validando..." mientras se procesa
□ Error handling (email no válido, ya existe, etc)
```

**Ubicación:** Modal nuevo en index.html
**Componentes:** 
- Modal HTML (HTML)
- Validación + Firebase (auth.js nuevo)
- Integración con header.js

### 1.3: Migrar Estructura a Firebase (6-8 horas)
```
□ Crear schema en Firebase:
  /users/{uid}/
    ├─ profile/ { nombre, email, edad, avatar, ... }
    ├─ stats/ { puntos, nivel, racha, ... }
    ├─ sessions/ { {sessionId}/ { juego, puntos, timestamp, metricas } }
    ├─ subscriptions/ { status, plan, paidUntil, stripeId }
    └─ settings/ { tema, coach_disabled, ... }

□ Escribir functions para:
  - getProfile(uid) → fetch Firebase
  - updateProfile(uid, data) → write Firebase
  - addSession(uid, gameId, data) → append session
  - syncFromFirebase() → pull to localStorage
  - syncToFirebase() → push pending changes
  
□ Crear conflicted resolution (si cambios offline)
□ Testing: cambios offline → vuelve conexión → sincroniza
```

### 1.4: Reemplazar localStorage en App (5-6 horas)
```
□ perfil.js: cambiar getperfil() para Firebase
□ storage.js: hacer sync en SaveGameData()
□ datosPerfil.js: leer de localStorage (cacheado)
□ header.js: mostrar usuario actual
□ Logout: limpiar localStorage + Firebase session
□ Testing: crear cuenta → jugar → refrescar → datos persisten
```

---

## FASE 2: MODELO DE SUSCRIPCIÓN (BLOQUEADOR CRÍTICO)
**Duración estimada:** 14-18 horas
**Dependencias:** Fase 1 completada
**Salida:** Paywall funcional, Stripe test payments funcionan

### 2.1: Crear Estructura de Suscripción (3-4 horas)
```
□ Firebase schema:
  /users/{uid}/subscription/
    ├─ status: "free" | "premium" | "trial"
    ├─ plan: "monthly" | "annual" | null
    ├─ paidUntil: timestamp (null si free)
    ├─ createdAt: timestamp
    ├─ cancelledAt: timestamp (null si activo)
    ├─ stripeCustomerId: "cus_..."
    ├─ stripeSubscriptionId: "sub_..."
    └─ trialStartedAt: timestamp (si está en trial)

□ Helper functions:
  - isPremium(uid) → boolean (check Firebase)
  - getSubscriptionStatus(uid) → { status, daysLeft, renewalDate, ... }
  - isTrialActive(uid) → boolean
  - canAccessFeature(uid, featureId) → boolean
```

### 2.2: Stripe Setup (2-3 horas)
```
□ Crear cuenta Stripe (https://stripe.com)
□ Crear Products en Stripe Dashboard:
  - "Premium Monthly" → €9.99/mes
  - "Premium Annual" → €99/año
□ Obtener API keys (test + prod)
□ Setup webhook URL en Stripe:
  https://menteando-pagos.d-perezn-2021.workers.dev/webhook
```

### 2.3: Cloudflare Worker para Pagos (5-6 horas)
```
□ Crear nuevo Worker: "menteando-pagos"
  
□ Endpoints:
  POST /create-checkout-session
    ├─ Input: { userId, planId }
    ├─ Validar: token Firebase + isPremium() = false
    ├─ Stripe.checkout.sessions.create({
    │    success_url: menteando.com/premium/success,
    │    cancel_url: menteando.com/premium,
    │    customer_email: user.email,
    │    line_items: [{ price: stripePriceId, quantity: 1 }]
    │  })
    └─ Response: { url: checkoutUrl }
  
  POST /webhook
    ├─ Verificar firma: Stripe.webhooks.constructEvent()
    ├─ Switch event.type:
    │  - "customer.subscription.created" → UPDATE Firebase
    │  - "customer.subscription.updated" → UPDATE Firebase
    │  - "customer.subscription.deleted" → UPDATE Firebase
    │  - "invoice.payment_failed" → log + email user
    └─ Response: 200 OK
  
  POST /customer-portal
    ├─ Input: { userId }
    ├─ Stripe.billingPortal.sessions.create()
    └─ Redirige a portal de Stripe (user puede cambiar tarjeta, cancelar, etc)

□ Dependencias: 
  - stripe npm package
  - Firebase Admin SDK
```

### 2.4: Frontend Checkout Flow (3-4 horas)
```
□ Crear página /premium.html
  ├─ Propuesta de valor
  ├─ Pricing cards (monthly/annual)
  ├─ Botones "Empezar prueba gratis" / "Suscribirse"
  └─ FAQ

□ Logic:
  - Click "Empezar prueba gratis":
    ├─ Si no logueado → login modal
    └─ Si logueado → POST /create-checkout-session (plan = trial)
  
  - Click "Suscribirse":
    ├─ Si no logueado → login modal
    └─ Si logueado → POST /create-checkout-session (plan = monthly/annual)
  
  - Success:
    ├─ Redirección automática de Stripe
    ├─ Update localStorage.subscription
    └─ Modal: "¡Bienvenido a Premium!"
  
  - Cancel:
    ├─ User vuelve a /premium
    └─ Opción: "Reintentar pago"

□ Paywalls en features:
  - En gameDetailPage.js: si no isPremium() → mostrar modal
  - En testDetailPage.js: si no isPremium() → mostrar modal
  - Mensaje: "Este contenido es para Premium. Prueba 7 días gratis."
```

### 2.5: Testing Stripe (Sandbox) (2-3 horas)
```
□ Usar tarjeta de test: 4242 4242 4242 4242
□ Crear subscription → verificar Firebase actualiza
□ Cancelar subscription → verificar Firebase actualiza
□ Fallo de pago → verificar email error
□ Portal de Stripe → cambiar tarjeta, cancelar, reactivar
□ Webhook testing: Stripe CLI local
```

---

## FASE 3: SEPARACIÓN FREE vs PREMIUM (PROPUESTA DE VALOR)
**Duración estimada:** 6-8 horas
**Dependencias:** Fase 2 completada
**Salida:** Juegos/tests divididos en free/premium correctamente

### 3.1: Definir Contenido (1 hora)
```
Decisión de negocio (tú + GPT):

FREE:
├─ Juegos: detector-intrusos, eco-visual, color-match (3)
├─ Tests: mec, digit-span (2)
├─ Medallas: 5/9
├─ Coach: estándar
└─ No: reportes, exportar

PREMIUM:
├─ Juegos: todos 10
├─ Tests: todos 13
├─ Medallas: todas 9
├─ Coach: avanzado (recomendaciones personalizadas)
├─ Reportes: PDF exportable
├─ Sincronización: garantizada
└─ No: cosas que no venden
```

### 3.2: Flag Games y Tests (2-3 horas)
```
□ catalogoJuegos.js: agregar a cada juego
  {
    id: "detector-intrusos",
    ...existing fields...,
    premium: false  // free
  }
  {
    id: "doble-canal",
    ...existing fields...,
    premium: true   // solo premium
  }

□ catalogoTests.js: agregar a cada test
  {
    id: "mec",
    ...existing fields...,
    premium: false
  }
  {
    id: "tavec",
    ...existing fields...,
    premium: true
  }
```

### 3.3: Paywalls (2-3 horas)
```
□ gameDetailPage.js:
  if (juego.premium && !isPremium()) {
    mostrarPaywall("Este juego es solo para Premium");
    return; // bloquea acceso
  }

□ testDetailPage.js:
  if (test.premium && !isPremium()) {
    mostrarPaywall("Este test es solo para Premium");
    return;
  }

□ Función mostrarPaywall():
  - Modal rojo "Contenido Premium"
  - Mensaje: "Este contendio es para usuarios Premium.
     Prueba 7 días gratis sin tarjeta."
  - Botones: "Empezar prueba" / "Ya tengo Premium" / "Seguir con free"
  - Si click "Empezar prueba" → /premium.html
```

### 3.4: UI Indicadores (1-2 horas)
```
□ En catálogo de juegos:
  - Badge "Premium" en esquina si premium && !user.isPremium
  - Overlay gris si premium && !user.isPremium
  
□ En catálogo de tests:
  - Badge "Premium" en esquina
  
□ En header:
  - Mostrar: "Free" o "Premium" del usuario actual
  - Link al portal Stripe si Premium (para cambiar/cancelar)
```

---

## FASE 4: EMAIL VERIFICACIÓN + GDPR (COMPLIANCE)
**Duración estimada:** 4-5 horas
**Dependencias:** Fase 1 completada
**Salida:** Email verificado, privacy policy, delete account

### 4.1: Email Verification (2-3 horas)
```
□ En modal de login:
  - Después de enviar magic link:
    "Hemos enviado un correo a tu email.
     Haz click en el enlace en 15 minutos."
  
□ En Firebase:
  - user.emailVerified = true (después de click)
  - Si intenta pagar sin email verificado:
    - Modal: "Por favor verifica tu email"
    - Botón: "Reenviar email"
```

### 4.2: Privacy Policy (1 hora)
```
□ Crear /privacy.html
□ Explicar:
  - Qué datos recopilamos (nombre, email, edad, resultados)
  - Cómo los usamos (guardar progreso, enviar emails, analytics)
  - Tiempo de retención (mientras exista cuenta)
  - Derechos: exportar datos, eliminar cuenta
  - Contacto: privacy@menteando.com
  - Cookies: localStorage, Stripe cookies
```

### 4.3: Delete Account + Export Data (1-2 horas)
```
□ En perfil.html: agregar opciones
  - "Descargar mis datos"
    └─ Genera JSON con todo el perfil
    └─ Abre descarga en navegador
  
  - "Eliminar mi cuenta"
    └─ Modal de confirmación (roja)
    └─ "Esta acción es irreversible"
    └─ Borra:
      - Usuario de Firebase Auth
      - Datos de Realtime DB
      - Stripe customer (opcional: conservar para billing)
    └─ Redirige a index.html con mensaje "Cuenta eliminada"
```

---

## FASE 5: ANALYTICS (BUSINESS INTELLIGENCE)
**Duración estimada:** 3-4 horas
**Dependencias:** Fase 1 completada
**Salida:** GA4 tracking eventos clave, dashboard de métricas

### 5.1: Google Analytics 4 Setup (0.5 horas)
```
□ Crear propiedad GA4 en Google Analytics
□ Obtener Measurement ID: G-XXXXXX
□ Agregar a HTML <head>:
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXX');
  </script>
```

### 5.2: Events a Trackear (2 horas)
```
□ En perfil.js (login):
  gtag('event', 'login', { method: 'email' });

□ En auth.js (sign up):
  gtag('event', 'sign_up', { method: 'email' });

□ En storage.js (game completed):
  gtag('event', 'game_completed', { 
    game_id: gameId,
    points: puntos,
    level: user.nivel
  });

□ En testDetailPage.js (test completed):
  gtag('event', 'test_completed', {
    test_id: testId,
    score: score
  });

□ En Stripe webhook (subscription created):
  gtag('event', 'purchase', {
    currency: 'EUR',
    value: 9.99,
    items: [{ item_name: 'Premium Monthly' }]
  });

□ En Stripe webhook (subscription cancelled):
  gtag('event', 'refund', {
    currency: 'EUR',
    value: 9.99
  });

□ En gameDetailPage.js (paywall shown):
  gtag('event', 'view_item', {
    items: [{ item_name: gameName, item_id: gameId }]
  });

□ En paywall modal (click "subscribe"):
  gtag('event', 'add_to_cart', {
    items: [{ item_name: 'Premium' }]
  });
```

### 5.3: Dashboard en GA4 (0.5 horas)
```
□ Crear dashboard con métricas clave:
  - Daily Active Users (DAU)
  - New users
  - Login funnel (visits → login → play game)
  - Conversion funnel (play game → try premium → purchase)
  - Retention (day 1, 7, 30)
  - Most played games
  - Subscription revenue
```

---

## FASE 6: SOPORTE Y FAQ (NICE TO HAVE)
**Duración estimada:** 2-3 horas
**Dependencias:** Fase 2 completada
**Salida:** FAQ página, email de soporte, documentación

### 6.1: FAQ Page (1.5 horas)
```
□ Crear /faq.html
□ Preguntas:
  - ¿Qué puedo hacer en free?
  - ¿Cómo cambio mi email?
  - ¿Cómo cancelo mi suscripción?
  - ¿Dónde veo mi historial?
  - ¿Puedo exportar mis datos?
  - ¿Es segura mi información?
  - Etc.
```

### 6.2: Email de Soporte (1 hora)
```
□ Crear support@menteando.com
□ Setup forwarding a tu email personal
□ Agregar link en header: "Soporte"
  └─ Abre modal con formulario
  └─ Envía email a support@menteando.com
□ Commitment: responder en 24h
```

---

## CRONOGRAMA TOTAL

| Fase | Horas | Semanas | Dependencias |
|------|-------|---------|--------------|
| **0. Validación** | 8h | 0.2 | Ninguna |
| **1. Auth + DB** | 24h | 1 | Fase 0 |
| **2. Suscripción** | 16h | 1 | Fase 1 |
| **3. Free/Premium** | 8h | 0.5 | Fase 2 |
| **4. GDPR/Privacy** | 5h | 0.3 | Fase 1 |
| **5. Analytics** | 4h | 0.2 | Fase 1 |
| **6. FAQ/Support** | 3h | 0.2 | Fase 2 |
| **Testing + polish** | 10h | 0.5 | Todas |
| | | | |
| **TOTAL** | **78 horas** | **4 semanas** | - |

**Distribución realista (part-time):**
```
Si tienes 15 horas/semana disponibles:
- Semana 1-2: Fase 0 + Fase 1 (Autenticación)
- Semana 3-4: Fase 2 (Pagos)
- Semana 5: Fase 3-5 (Free/Premium + Analytics)
- Semana 6: Testing + polish

LANZAMIENTO POSIBLE: 6 semanas desde ahora
```

---

## CHECKLIST ANTES DE LANZAR A PRODUCCIÓN

- [ ] Fase 0 aprobada
- [ ] Fase 1 testeada (login, datos sincronizan)
- [ ] Fase 2 testeada (pagos en sandbox)
- [ ] Fase 3 testeada (paywalls funcionan)
- [ ] Fase 4: privacy policy + delete account
- [ ] Fase 5: analytics trackea eventos
- [ ] HTTPS activo (Cloudflare)
- [ ] Rate limiting en endpoints
- [ ] Webhooks Stripe en producción
- [ ] Email de bienvenida funciona
- [ ] 5 amigos prueban: free → premium → cancelar
- [ ] FAQ rellenada
- [ ] Documentación interna (readme dev)
- [ ] Git commits limpios
- [ ] Domain DNS apuntando a prod (no pages.dev)

---

## NOTAS FINALES

**Estos problemas bloqueadores (P0) OBLIGATORIAMENTE requieren:**
1. Autenticación real (Firebase Auth)
2. Backend/BD (Firebase Realtime DB)
3. Integración Stripe
4. Gestión de suscripciones
5. Separación Free/Premium
6. Paywalls

**Estos problemas (P1) son RECOMENDADOS antes de 100 usuarios:**
- GDPR/Privacy
- Analytics
- Disclaimers en tests
- Email verification
- Rate limiting básico

**Estos problemas (P2) pueden esperar hasta tener traction:**
- Refactor/modularización
- Tests automatizados
- Optimización performance
- Documentación completa

**Tu ventaja:** Base funcional sólida, datos validados, usuario real. Solo necesitas agregar la "monetización" alrededor del producto existente.

---

¿Te funciona este plan? ¿Quieres que profundice en alguna fase específica o cambies el ordenamiento?
