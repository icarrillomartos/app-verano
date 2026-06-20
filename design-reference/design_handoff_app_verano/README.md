# Handoff: App Verano — tablón de planes para una cuadrilla

## Overview
App móvil para que un grupo grande de amigos (12 personas, "La cuadrilla", Madrid) organice planes de ocio sin perderse en WhatsApp. Es un **tablón de planes vivo**: un agente automático rastrea cada domingo el ocio de Madrid y las escapadas baratas y crea tarjetas; un administrador las aprueba; el resto las ve en su Home y se apunta o no de un solo toque. La conversación fina sigue en WhatsApp.

Principio rector: **todo se entiende de un vistazo**. La foto manda, el resto es mínimo y visual (iconos, no texto). Apuntarse es un único gesto.

## About the Design Files
Los archivos de este bundle son **referencias de diseño hechas en HTML** (Design Components que se renderizan en el navegador) — prototipos que muestran el aspecto y comportamiento deseados, **no código de producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno del codebase destino** (React Native, Expo, Flutter, SwiftUI, etc.) usando sus patrones y librerías. Si todavía no existe codebase, elige el framework más apropiado para una app móvil (recomendación: **React Native + Expo**, dado que el prototipo es web/React-like y mobile-first) e impleméntalo allí.

El prototipo está construido como dos componentes:
- `PlanApp.dc.html` — la app completa (toda la lógica y las 3 pantallas + modales). Es el archivo a portar.
- `App Verano.dc.html` — solo una galería de presentación que monta `PlanApp` 8 veces dentro de marcos de teléfono (claro/oscuro). **No hay que portar la galería**, solo sirve para ver todas las pantallas a la vez.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado e interacciones son finales. Recrear la UI pixel-perfect con las librerías del codebase. Modo claro y oscuro completos.

## Screens / Views

### 1. Home — el tablón de planes (`screen: 'home'`)
- **Purpose**: ver todos los planes y apuntarse de un toque.
- **Layout** (columna, altura completa del teléfono 380×800):
  1. Status bar (12px 24px 4px) — hora `9:41` + iconos señal/wifi/batería.
  2. Header (padding `8px 20px 14px`): título `La cuadrilla` (Figtree 800, 23px, letter-spacing −0.02em) + subtítulo `12 personas · 10 planes vivos` (600, 12.5px, color muted). A la derecha, botón de filtro 40×40, radio 14px, borde `--line`, con icono de "sliders".
  3. Feed scrolleable (`flex:1; overflow-y:auto; padding:2px 16px 20px`), columna con `gap:16px`. Cada hijo lleva `flex:none` (clave: sin esto los cards se comprimen en vez de hacer scroll).
  4. Bottom nav fija (ver Interactions).
- **Filter/sort menu** (al pulsar el botón de filtro): popover absoluto bajo el header, 218px ancho, `--surface`, borde `--line`, radio 16px, sombra `0 12px 32px rgba(20,14,10,0.16)`. Tres opciones con check de `--accent` en la activa: **Más próximos** (default), **Precio**, **Solo donde estoy yo**.

#### Anatomía de la tarjeta compacta (el corazón del producto)
Contenedor: `--surface`, radio 24px, `overflow:hidden`, borde (ver estados), `flex:none`. Todo el card es clicable → abre el detalle.
- **Foto** (`position:relative; width:100%; height:184px`): fondo placeholder con rayas diagonales (`repeating-linear-gradient(135deg, A 0 16px, B 16px 32px)`) — sustituir por foto real (`object-fit:cover`).
  - Etiqueta de categoría arriba-izq: pill `rgba(20,14,10,0.5)` + `backdrop-filter:blur(6px)`, texto blanco 700/11px, letter-spacing 0.03em. En la tarjeta flash, un rayo `#FFD24A` antes del texto.
  - (Solo flash) pill de cuenta atrás arriba-der: fondo `--amber`, texto `--amber-ink`, icono reloj + "Caduca en 2 días" (800/11px).
  - Pie con explainer monospace (`Space Mono`, 9.5px, blanco 92%) sobre `linear-gradient(transparent, rgba(20,14,10,0.34))` — quitar al poner foto real.
- **Body** (`padding:14px 15px 13px`):
  - Título: Figtree 700, 18px, line-height 1.24, `text-wrap:pretty`, margin-bottom 11px.
  - Fila de chips (`flex; flex-wrap; gap:6px; margin-bottom:14px`). Cada chip: `padding:6px 10px; border-radius:999px; font:600 12px`, icono 13px + texto.
    - Fecha: fondo `--chip`, color `--muted`, icono calendario.
    - Precio: si **gratis** → fondo `--pos-soft`, color `--pos`, icono check, texto "Gratis" (700). Si no → fondo `--chip`, color `--muted`, icono moneda, texto `38€`.
    - Ubicación: fondo `--chip`, color `--muted`, icono pin.
  - Fila caras + acción (`flex; align-items:center; justify-content:space-between; gap:10px`):
    - **Caras**: avatares circulares 30px solapados (`margin-left:-8px`, contenedor con `padding-left:8px`), iniciales blancas 800/9.5px sobre color del usuario, `box-shadow:0 0 0 2px var(--surface)` (anillo). Se muestran 4 máx.; si hay más, chip de overflow `+N` (altura 30px, fondo `--chip`, color `--muted`). Tocar la fila abre la hoja de apuntados.
    - **Botón primario** (`flex:none; padding:10px 15px; border-radius:999px; font:700 13px`): sin apuntar → fondo `--accent`, texto `--accent-ink`, icono `+`, label "Me apunto". Apuntado → fondo `--accent-soft`, texto `--accent`, borde `--accent-border`, icono check, label "Apuntado".

#### Estados especiales de tarjeta
- **Apuntado**: borde del card `1.5px solid var(--accent)`; tu cara (`TÚ`, fondo `--accent`, doble anillo `0 0 0 2px var(--surface), 0 0 0 3.6px var(--accent)`) entra la primera en la fila; botón en estado activo. (Ejemplo poblado: "Acampada en Pinares de Lozoya".)
- **Flash / oportunidad**: borde `1.5px solid var(--amber)`, rayo en la categoría, pill de cuenta atrás. (Ejemplo: "Vuelo a Mallorca, 39€".)
- **Vacío (0 apuntados)**: en lugar de la fila de caras, un avatar con borde discontinuo `--accent-border` + icono `+`, y texto "Recién publicado / **Sé el primero en apuntarte**" (la segunda línea en `--accent` 700). No debe parecer muerto. (Ejemplo: "Concierto al aire libre en el Retiro".)

### 2. Detalle del plan (modal, `openId` ≠ null)
Bottom-sheet sobre la pantalla: overlay `--scrim` con `justify-content:flex-end`; panel `--surface`, radio `30px 30px 0 0`, `max-height:93%`, columna.
- **Foto** 224px con botón cerrar (círculo 36px, `rgba(20,14,10,0.45)`+blur, X blanca) arriba-der y categoría arriba-izq.
- **Cuerpo scrolleable** (`padding:18px 20px 4px`): título (800/23px); chips fecha (larga) / precio "X€ / persona" / ubicación / duración; descripción (500/14.5px, `--muted`, line-height 1.55); "Apuntados · N" con resumen de nombres a la derecha; fila de avatares 34px (hasta 7 + overflow); botones secundarios **Más info** (icono link externo) y **Comentar** (icono burbuja → WhatsApp), ambos outline 50/50.
- **Footer fijo** (`border-top: --line`): botón primario a ancho completo (radio 16px, 800/16px). Sin apuntar "Me apunto" (fondo `--accent`); apuntado "Apuntado · Quitarme" (fondo `--accent-soft`, texto `--accent`, borde `--accent-border`).
- Plan desarrollado a fondo: **Acampada en Pinares de Lozoya** — desc: "Zona de acampada libre junto al río. Llevamos tiendas, hornillo y nos bañamos. Plan redondo de finde sin gastar un duro." Duración: 1 noche. Apuntados: Tú, Marta, Jon +5 (8).

### 3. Hoja de apuntados (bottom-sheet, `attendeesId` ≠ null)
Se abre al tocar la fila de caras. Panel `--surface`, radio `28px 28px 0 0`, `max-height:80%`. Cabecera "Quién se apunta / N personas" + cerrar. Lista vertical: avatar 40px + nombre completo (700/15px). El usuario actual lleva un pill "Estás dentro" (`--accent-soft`/`--accent`) a la derecha.

### 4. Bandeja del administrador (`screen: 'admin'`, solo admin)
- **Header**: título "Propuestas de esta semana" (800/21px) + sub "El agente rastreó Madrid · domingo 6 jul"; a la derecha pill `--amber-soft` con punto `--amber` y "N pendientes".
- **Feed** de tarjetas borrador (foto 130px, `flex:none`):
  - Badge de estado sobre la foto: **Pendiente** (`--amber`/`--amber-ink`), **Publicado** (`--pos`/blanco + check) o **Descartado** (`rgba(20,14,10,0.55)`/blanco).
  - Body: título (700/16.5px), chips (fecha/precio/ubicación), y **fila de fuente** visible (`--surface2`, borde `--line`, radio 12px, icono link + "Fuente: …" + "Verificar" en `--accent`) para poder comprobar el origen.
  - **Tres acciones** (pendiente): Descartar (botón cuadrado 42px, X), Editar (outline, icono lápiz), Aprobar (fondo `--accent`, texto `--accent-ink`, check). Aprobar → pasa a la Home del grupo.
  - **Editar inline**: el body se sustituye por inputs de título, fecha y precio (`--surface2`, borde `--line`, radio 11px) + botones Cancelar / Guardar (Guardar fondo `--text`, texto `--bg`).
  - **Resuelto** (aprobado/descartado): card con `opacity:0.62`, etiqueta de estado + botón "Deshacer".
- Propuestas de ejemplo: Festival de food trucks en Matadero (Urbano · Gratis · Sáb 26 jul · fuente web del evento); Kayak en El Atazar (Aventura · 30€ · Dom 27 jul · fuente empresa de actividades); Vuelo a Oporto 45€ (Oportunidad · finde a confirmar · fuente buscador de vuelos).

### 5. Onboarding (`screen: 'onboarding'`)
Centrada: "Te han invitado a" (uppercase, muted) → clúster de avatares solapados (46px) → "La cuadrilla" (900/32px) → "12 personas · Madrid" → divisor → tarjeta "Entrarás como / Tú" con tu avatar → botón grande "Entrar al grupo" (ancho completo, `--accent`, radio 18px, 800/16px) → nota "Sin formularios. La conversación fina sigue en WhatsApp." Sin nav inferior.

## Interactions & Behavior
- **Apuntarse** (toggle): en card, detalle y modal. Cambia el estado del botón, mete/saca tu cara y aplica/quita el acento del card. Un solo toque. `toggle(planId)`.
- **Abrir detalle**: tocar cualquier parte del card → `open(planId)`. El botón "Me apunto" y la fila de caras hacen `stopPropagation` para no abrir el detalle.
- **Fila de caras** → `openAtt(planId)` (hoja de apuntados).
- **Filtro/orden**: `setSort('date'|'price'|'mine')`. 'mine' filtra a los planes donde estás apuntado.
- **Admin**: `approve`, `discard`, `undo`, `edit`/`save`/`cancel`, edición de campos `title`/`date`/`price`.
- **Nav inferior**: Planes ↔ Revisar; "Revisar" muestra badge con nº de pendientes en `--accent`.
- **Onboarding**: "Entrar al grupo" → Home.
- **Más info** → enlace externo a la fuente/venta de entradas. **Comentar** → hilo del grupo en WhatsApp. (En el prototipo son no-ops; conectar a URLs reales.)
- Animaciones sugeridas: sheets entran desde abajo (~250ms ease-out); toggle de apuntarse con micro-transición de color/escala. Áreas táctiles ≥ 44px.

### Lo que NO debe incluir (restricciones del producto)
- Sin negociación de fechas, votaciones de calendario ni pantallas de consenso. Las caras apuntadas son toda la disponibilidad necesaria.
- Sin pedir marcar fechas plan por plan. Apuntarse = un toque.
- Sin reservas ni pagos en la app (los enlaces externos lo cubren).
- Sin chat propio: el botón "Comentar" (a WhatsApp) basta.

## State Management
Estado de la app (en `PlanApp`):
- `screen`: `'home' | 'admin' | 'onboarding'`.
- `joined`: `{ [planId]: boolean }` (inicial `{ acampada: true }`).
- `openId`: id del plan en detalle, o `null`.
- `attendeesId`: id del plan en la hoja de apuntados, o `null`.
- `sort`: `'date' | 'price' | 'mine'`; `sortOpen`: boolean.
- `proposals`: array admin con `{ id, title, category, price, date, location, source, photo, status: 'pending'|'approved'|'discarded', editing }`.

Datos: lista de `plans` y mapa de `people`. Apuntados por plan = `others` (ids) con `you` añadido al principio si `joined[plan.id]`. El contador y el resumen de nombres se derivan de ahí. Fetching real: feed de planes aprobados, y cola de propuestas del agente para el admin.

## Design Tokens

### Colores — modo claro
```
--bg:#F7F2EC  --surface:#FFFFFF  --surface2:#FBF6F0
--text:#211A16  --muted:#8C8077  --faint:#B6ABA0  --line:#EDE4DA
--accent:#E0455E  --accent-ink:#FFFFFF  --accent-soft:#FBE3E7  --accent-border:#F2B4BF
--pos:#1E9E6A  --pos-soft:#E5F3EC
--amber:#E0871E  --amber-ink:#241803  --amber-ink2:#7A4A0E  --amber-soft:#FBEBD3
--chip:#F4EEE7  --scrim:rgba(20,14,10,0.42)
```
### Colores — modo oscuro
```
--bg:#141110  --surface:#211B18  --surface2:#1A1513
--text:#F4EEE8  --muted:#A89C92  --faint:#6E645C  --line:#2D2723
--accent:#FF5E78  --accent-ink:#2A0E14  --accent-soft:#3A2026  --accent-border:#5E2F38
--pos:#39C98C  --pos-soft:#16352A
--amber:#F2B24C  --amber-ink:#241803  --amber-ink2:#F2B24C  --amber-soft:#3A2E18
--chip:#2A2420  --scrim:rgba(0,0,0,0.62)
```
### Colores de avatar (fijos por persona, texto blanco)
Tú=`--accent`, MR=`#DE7C5A`, JL=`#4FA3A8`, AS=`#E2A33C`, DG=`#7E8CCF`, LM=`#D98AA6`, IB=`#5F9E6A`, NP=`#C8703E`, CV=`#6FA0D6`, SD=`#D2675E`, UA=`#84A65A`, MZ=`#B07CC9`.

### Tipografía
- Familia UI: **Figtree** (400/500/600/700/800/900). Pesos clave: títulos 800–900, botones 700–800, cuerpo 500–600.
- Monospace (solo explainers de placeholder de foto): **Space Mono** 400.
- Escala usada: 9.5–11px (chips/labels mono), 12–13px (chips/botones), 14.5–18px (cuerpo/títulos card), 21–23px (cabeceras), 32px (onboarding). Letter-spacing negativo (−0.01/−0.02em) en títulos grandes; `text-wrap:pretty` en títulos/descripciones.

### Radios / espaciado / sombras
- Radios: cards 24px, propuestas admin 22px, sheets 28–30px (top), chips/avatares 999px (full), botones 14–18px, inputs 11–13px.
- Gaps de lista: 16px. Paddings de card: 14px 15px. Áreas táctiles ≥ 44px.
- Sombras planas/sutiles: cards sin sombra dramática; popover `0 12px 32px rgba(20,14,10,0.16)`. Marco de teléfono (solo galería) `0 24px 60px -28px rgba(20,14,10,0.55)`.

## Iconografía
Set simple de iconos line (stroke `currentColor`, width ~2, linecap/linejoin round, 12–18px): calendario, moneda (€), pin, reloj, `+`, check, X, link externo, burbuja (WhatsApp/Comentar), sliders (filtro), rayo (flash, relleno `#FFD24A`), home, bandeja (admin), lápiz (editar), deshacer. Usar el set de iconos del codebase (p. ej. Lucide / SF Symbols) manteniendo el estilo line consistente.

## Assets
- **Fotos de planes**: actualmente placeholders rayados con etiqueta monospace (`FOTO — …`). Sustituir por fotos reales por plan (`object-fit:cover`, mismo radio/recorte). La foto es el elemento dominante de cada tarjeta.
- **Avatares**: por ahora iniciales sobre color sólido (ver tabla). Soportar foto de perfil real cuando exista, manteniendo el círculo y el anillo del usuario actual.
- No hay logos ni assets de marca de terceros.

## Files
- `PlanApp.dc.html` — app completa (lógica + plantilla de las 3 pantallas y modales). **Archivo a portar.**
- `App Verano.dc.html` — galería de presentación claro/oscuro (solo referencia, no portar).
Ambos son Design Components: abren directamente en el navegador para inspeccionar look, copys exactos, estados e interacciones.
