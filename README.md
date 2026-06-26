# SOMos los que veranean ☀️

Una **PWA** (web instalable como app) para que una cuadrilla de amigos organice sus
**planes de verano** sin perderse en el chat: un tablón de planes con foto donde te
**apuntas de un toque**, propones planes nuevos y un admin los revisa.

🔗 **Demo en vivo:** https://app-verano.vercel.app

> Hecho con Next.js + Supabase + Vercel. **100% gratis de mantener** (sin envío de emails, sin servicios de pago).

---

## ✨ Qué hace

- 📋 **Tablón de planes** con foto, fecha, precio y ubicación; ordenable por fecha / precio / "solo donde estoy yo".
- ✅ **Apuntarse de un toque** — ves quién va con sus avatares.
- ➕ **Proponer planes** que el **admin** aprueba o descarta antes de publicarlos.
- 👤 **Login simple** (email + contraseña, sin emails de confirmación) y avatar de color con iniciales.
- 🌗 **Modo claro/oscuro** y **PWA instalable** (icono propio + pantalla completa + offline básico).

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (App Router) + React, PWA |
| Backend / BD / Auth / Storage | Supabase (Postgres + RLS) |
| Hosting | Vercel (deploy automático desde GitHub) |

---

## 🚀 Despliega el tuyo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/icarrillomartos/app-verano&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

1. **Haz fork** de este repo (o usa el botón de arriba).
2. **Crea un proyecto en [Supabase](https://supabase.com)** (gratis).
3. En Supabase → **SQL Editor**, pega y ejecuta [`supabase/setup.sql`](supabase/setup.sql)
   (crea tablas, seguridad RLS, buckets de fotos y tu grupo).
4. En Supabase → **Authentication → Providers → Email**: activa el registro y
   **desactiva "Confirm email"** (así no se envían correos → gratis).
5. **Variables de entorno** (cópialas de Supabase → Project Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-publishable-key
   ```
   Ponlas en `.env.local` (local) y en Vercel → Project → Settings → Environment Variables.
6. **Despliega en Vercel** importando tu fork.
7. **Crea tu admin** (el único que aprueba propuestas):
   ```bash
   SUPA_PAT=<tu-token-supabase> ADMIN_EMAIL=tu@email.com ADMIN_PW=tu-contraseña \
     node scripts/admin-util.mjs create-admin
   ```
   *(El `SUPA_PAT` es un Personal Access Token de Supabase → Account → Access Tokens. Bórralo al terminar.)*
8. **Llena el tablón de planes** (opcional): edita [`data/planes-verano-2026.json`](data/planes-verano-2026.json)
   con tus planes y ejecuta:
   ```bash
   node scripts/refresh-photos.mjs        # busca y sube fotos a Supabase Storage
   SUPA_PAT=<tu-token> node scripts/apply-plans.mjs   # publica los planes
   ```

## 🛠️ Desarrollo local

```bash
npm install
npm run dev   # http://localhost:3000 (accesible también desde el móvil por la IP de tu red)
```

## 📁 Estructura

```
app/            layout, página, manifest PWA, iconos y estilos (tokens de color)
components/     PlanApp.tsx (la app) · Auth.tsx (login/registro) · AppRoot.tsx · icons.tsx
lib/            supabase.ts (cliente) · queries.ts (consultas) · auth.ts (perfil) · data.ts (tipos/helpers)
supabase/       setup.sql (esquema + RLS + buckets)
scripts/        utilidades: admin-util, refresh-photos, apply-plans, gen-icons
agent/          prompt-busqueda-planes.md (el "agente" que cura los planes)
data/           planes en JSON
design-reference/  prototipo y handoff de diseño originales
```

## 🤖 El "agente del domingo"

Los planes se curan con búsqueda web (ver [`agent/prompt-busqueda-planes.md`](agent/prompt-busqueda-planes.md)):
busca ocio en Madrid + escapadas baratas, verifica en la fuente, criba y devuelve ~25 planes
en JSON que `apply-plans.mjs` publica en el tablón.

## 📄 Licencia

MIT — úsalo, modifícalo y compártelo libremente.
