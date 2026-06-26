# Guion de fotos para el artículo

Lista de las **8 imágenes** que pide el artículo (`ARTICULO.md`), en orden de aparición.
Para cada una: qué muestra, cómo capturarla, cómo encuadrarla y su prioridad.

> ⚠️ **Lo primero de todo (sin esto, el artículo cojea):**
> El repositorio `github.com/icarrillomartos/app-verano` está **PRIVADO** ahora mismo.
> Para que la gente pueda “copiársela” —y para que la FOTO 7 tenga sentido— hay que
> hacerlo **público**: GitHub → repo → *Settings* → *General* → *Danger Zone* →
> *Change visibility* → *Public*. Revisa antes que no haya claves en el historial
> (las de Supabase del `.env.local` están bien porque la *anon key* es pública por
> diseño y está protegida por RLS; aun así, échale un ojo).

---

## Tabla resumen

| # | Sección del artículo | Qué muestra | Prioridad |
|---|----------------------|-------------|-----------|
| 1 | Apertura (“La cena”) | La cuadrilla / ambiente de grupo | Alta (gancho) |
| 2 | “Abrí una conversación” | El chat con el plan por fases | Media |
| 3 | Fase 1 (diseño) | El prototipo de Claude Design (claro/oscuro) | Alta |
| 4 | Fase 4 (agente) | Bandeja del admin / prompt del agente | Alta (el “wow”) |
| 5 | Fase 6 (probarla) | El Home real de la app | Alta (portada) |
| 6 | Fase 5 (PWA) | El móvil con la app instalada (icono sol) | Media |
| 7 | “Cópiatela” | La página del repo en GitHub | Alta (CTA) |
| 8 | “Cópiatela” | El panel de Vercel (deploy en verde) | Media |

**Si solo puedes hacer 3:** la 5 (Home real), la 3 (diseño) y la 7 (repo).
**La portada del post en LinkedIn** debería ser la 5 o la 3.

---

## FOTO 1 — La cena
- **Dónde va:** justo al empezar, bajo el título.
- **Qué muestra:** vosotros. El problema humano antes que el técnico.
- **Cómo:** una foto tuya real de una cena/quedada del grupo. Si no quieres exponer
  caras, vale un plano de la mesa (manos, cañas, brindis) o una foto de archivo de
  un grupo de amigos.
- **Encuadre:** horizontal (1200×800 aprox.) funciona bien como primera imagen.

## FOTO 2 — El plan por fases
- **Dónde va:** sección *“No abrí el editor. Abrí una conversación.”*
- **Qué muestra:** que primero fue pensar, no teclear.
- **Cómo (elige una):**
  1. Captura del chat de Claude Code titulado *“app design and deployment plan”*
     donde se ve el plan troceado en fases.
  2. Si no conservas el chat, captura la sección **“Plan por fases”** del `README.md`
     del repo (las casillas de Fase 1 → Fase 6).
- **Encuadre:** vertical u horizontal; que se lean las fases. Oculta datos sensibles.

## FOTO 3 — El prototipo de Claude Design
- **Dónde va:** Fase 1.
- **Qué muestra:** el diseño antes de ser app real, en claro y oscuro.
- **Cómo (elige una):**
  1. **Lo más fiel:** abre la galería del prototipo. En la carpeta del proyecto:
     `design-reference/App Verano.dc.html`. Sirve la carpeta y ábrela en el navegador
     (p. ej. `cd design-reference && python3 -m http.server 8899`, luego entra en
     `http://localhost:8899/App%20Verano.dc.html`). Verás las pantallas en marcos de
     móvil, claro y oscuro: captura esa parrilla.
  2. **Más fácil:** una captura del propio Claude Design / del chat donde diseñaste
     las pantallas.
- **Encuadre:** horizontal, mostrando 2–4 pantallas a la vez (Home claro + Home oscuro
  queda muy bien).

## FOTO 4 — La bandeja del administrador / el agente (el “wow”)
- **Dónde va:** Fase 4.
- **Qué muestra:** que la IA propone los planes y tú solo apruebas.
- **Cómo (elige una):**
  1. **Pantalla “Revisar”** de la app (entra como admin) con propuestas pendientes y
     su fila de *Fuente*. ⚠️ Para que haya propuestas que mostrar, primero ejecuta el
     “agente del domingo” y vuelca su resultado como `pending` (ver
     `agent/prompt-busqueda-planes.md` y `scripts/apply-plans.mjs`). Si ahora mismo no
     hay pendientes, usa la opción 2.
  2. Una captura del **prompt del agente** (`agent/prompt-busqueda-planes.md`): el ROL
     y la “regla fundamental” de no inventar nada y verificar en la fuente lucen mucho.
- **Encuadre:** vertical (pantalla de móvil) para la opción 1; recorte de texto para la 2.

## FOTO 5 — La app funcionando (PORTADA recomendada)
- **Dónde va:** Fase 6. Es la imagen más vendedora; úsala también como portada del post.
- **Qué muestra:** el tablón real con planes y fotos de verdad.
- **Cómo:** entra en `app-verano.vercel.app` desde el móvil (o el navegador en vista
  móvil), inicia sesión y captura el **Home** con varias tarjetas. Si puedes, otra del
  **detalle** de un plan (hoja inferior con descripción y “Me apunto”).
- ⚠️ **Para que salga “poblada”:** ahora mismo en la base de datos solo estás tú y no
  hay nadie apuntado, así que las tarjetas saldrán sin caras. Si quieres que se vean
  amigos apuntados, pide a 3–4 que entren y se apunten a un par de planes antes de la
  captura. Tarda cinco minutos y la diferencia es enorme.
- **Encuadre:** vertical (proporción de móvil ~9:19). Queda fino dentro de un *mockup*
  de teléfono (mockuphone.com, shots.so, etc.).

## FOTO 6 — La app instalada en el móvil
- **Dónde va:** Fase 5 (PWA).
- **Qué muestra:** que vive en el bolsillo, sin tiendas de apps.
- **Cómo:** instala la app (en el navegador del móvil, “Añadir a pantalla de inicio”) y
  haz una captura de la **pantalla de inicio** con el icono del sol entre tus otras apps.
  Alternativa: la pantalla de instalación (“¿Añadir a inicio?”).
- **Encuadre:** vertical, captura de pantalla del teléfono tal cual.

## FOTO 7 — El repositorio en GitHub (la llamada a la acción)
- **Dónde va:** sección *“Cópiatela para tu cuadrilla”*.
- **Qué muestra:** que el código está ahí, listo para llevárselo.
- **Cómo:** una vez hecho **público** (ver aviso de arriba), abre
  `github.com/icarrillomartos/app-verano` y captura la portada del repo: el árbol de
  carpetas (`app/`, `components/`, `lib/`, `supabase/`, `agent/`…) y el README con las
  fases. Añade una descripción corta al repo si está vacía.
- **Encuadre:** horizontal, navegador, que se lea el nombre del repo y la estructura.

## FOTO 8 — El despliegue en Vercel
- **Dónde va:** *“Cópiatela”*, tras la FOTO 7.
- **Qué muestra:** de la idea a internet con un clic.
- **Cómo:** entra en `vercel.com`, proyecto **app-verano**, y captura el panel con el
  último *deployment* en estado **Ready** (verde) y la URL de producción. La pestaña
  *Deployments* con la lista también vale.
- **Encuadre:** horizontal.

---

## Notas técnicas (para que queden bien en LinkedIn)

- **Tamaño de portada del artículo:** LinkedIn recorta a ~**1200×644 px** (1.91:1). Si
  usas una captura de móvil (vertical), móntala sobre un fondo de color de la app
  (`#F7F2EC` claro o `#141110` oscuro) para que no la recorte fea.
- **Consistencia:** elige **un solo modo** (claro u oscuro) para las capturas de app y
  manténlo en todas, salvo en la FOTO 3, donde mostrar los dos modos juntos es la gracia.
- **Mockups de móvil:** para las fotos 5 y 6, meter la captura en un marco de teléfono
  (shots.so, mockuphone.com, Figma) sube mucho el nivel percibido.
- **Limpieza:** quita de las capturas la barra de notificaciones del móvil con datos
  personales, números de teléfono o correos que no quieras publicar.
- **Colores de marca (por si quieres rótulos o fondos):** acento `#E0455E` (coral),
  fondo crema `#F7F2EC`, fondo oscuro `#141110`.

## Orden de imágenes dentro del post

1 (cena) → 2 (plan) → 3 (diseño) → 4 (agente) → 5 (app real) → 6 (instalada) →
7 (GitHub) → 8 (Vercel). Coincide con los marcadores `📸 FOTO n` de `ARTICULO.md`:
sustituye cada marcador por su imagen y borra la línea del marcador.
