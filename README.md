# La cuadrilla — App Verano

Tablón de planes de ocio para una cuadrilla de amigos (Madrid). PWA web instalable (no nativa):
un agente propone planes cada domingo, un **admin** los aprueba y el resto se **apunta de un toque**.
La conversación fina sigue en WhatsApp; las reservas, en enlaces externos.

> Diseño de origen (hifi, claro/oscuro) en [`design-reference/`](design-reference/). El archivo
> portado es `PlanApp.dc.html`.

## Stack

- **Next.js (App Router)** como PWA — `components/PlanApp.tsx`, móvil-first, tokens claro/oscuro.
- **Supabase** (Postgres + Auth + Storage) — datos, login y fotos *(a partir de la Fase 2)*.
- **Vercel** — hosting gratis con deploy automático desde GitHub + Cron del domingo.

## Desarrollo local

```bash
npm install
npm run dev          # arranca en http://localhost:3000 (bind 0.0.0.0)
```

### Probar desde el móvil (misma WiFi)

Abre en el teléfono: **http://192.168.0.28:3000** *(la IP del Mac; cámbiala si tu red es otra:
`ipconfig getifaddr en0`)*.

Apoyos de testing (Fase 1):
- `?screen=home` · `?screen=admin` · `?screen=onboarding` — previsualizar cada pantalla.
- Tocar la hora **9:41** alterna claro/oscuro (por defecto sigue la preferencia del sistema).

## Plan por fases

- [x] **Fase 1 — UI pixel-perfect** (mock data, claro/oscuro). ← *estás aquí*
- [ ] **Fase 2 — Datos en Supabase**: esquema + apuntarse/quitarse persiste de verdad.
- [ ] **Fase 3 — Identidad**: login email + alta (nombre + foto de cara obligatoria) + rol admin.
- [ ] **Fase 4 — Agente del domingo**: búsqueda desde Claude Code → propuestas al repo → deploy.
- [ ] **Fase 5 — Pulido**: PWA instalable, push semanal, auto-archivado de planes vencidos, fotos.
- [ ] **Fase 6 — Test + deploy**: prueba en móvil y enlace final para la cuadrilla.

## Modelo de datos (previsto, Fase 2)

`groups` · `users(name, initials, color, photo_url, is_admin)` ·
`plans(title, category, price, date, location, …, status: pending|published|discarded|archived)` ·
`attendance(plan_id, user_id)`. Home = `published`; bandeja admin = `pending`; aprobar = `pending → published`.

## Estructura

```
app/            layout, página y estilos globales (tokens de color)
components/      PlanApp.tsx (la app) · icons.tsx
lib/            data.ts (mock: 12 personas, 10 planes, 3 propuestas)
design-reference/  prototipo y handoff originales (no se compila)
```
