# Estaba cenando con mis amigos y acabé montando una app (y no morir en el intento)

*Cómo convertí el eterno “¿hacemos algo este finde?” en una pequeña app para mi cuadrilla — sin escribir una sola línea de código — y cómo puedes copiártela para la tuya.*

---

> 📸 **FOTO 1 — La cena.** Foto real (o de archivo) de la cuadrilla cenando / de grupo. Es el gancho emocional de apertura. Si no quieres salir tú, vale una mesa de bar con muchas manos brindando. *(ver guion de fotos)*

Hace unas semanas, cenando con mis amigos, pasó lo de siempre.

Somos un grupo grande —doce— y, como todo grupo grande, somos incapaces de ponernos de acuerdo para hacer algo distinto. Alguien suelta el clásico “tenemos que hacer un plan”, los demás asentimos con la cabeza… y ahí muere. La conversación se va a un grupo de WhatsApp donde se acumulan ochenta mensajes, tres encuestas de fechas que nadie contesta y un “lo hablamos” que es, en realidad, la forma educada de no hacerlo nunca.

¿Te suena? A mí me sonaba demasiado.

Y por esos días los chicos de Anthropic acababan de estrenar **Claude Design**, su forma de diseñar interfaces conversando con la IA. Lo vi y se me encendió la bombilla: *¿por qué no diseño una pequeña app para que mi cuadrilla encuentre planes y se coordine de una vez?*

Lo siguiente que tienes que saber es que **yo no soy programador**. Soy ingeniero aeroespacial reconvertido en emprendedor, y mi relación con el código es, siendo generosos, lejana. Así que esto no va de un genio del desarrollo montando software. Va justo de lo contrario: de alguien que no sabe programar construyendo y publicando una app de verdad solo a base de hablar con una IA.

Te cuento cómo, porque la gracia es que tú puedas hacer lo mismo.

---

## No abrí el editor. Abrí una conversación.

Aquí está el cambio de mentalidad. En lugar de pelearme con un editor de código, abrí **Claude Code** y le expliqué qué quería: una app para que un grupo de amigos vea planes y se apunte de un toque. Y antes de escribir nada, hicimos juntos lo más importante de todo el proyecto: **un plan**.

Lo titulamos, sin mucha imaginación, *“app design and deployment plan”*: el plan de diseño y despliegue. Nada de ponerse a teclear como locos. Primero, pensar; trocear el problema en fases pequeñas y ordenadas, de manera que cada una se pudiera terminar, ver funcionando y, sobre todo, entender.

Porque al final esto va de volver a las bases: menos es más.

> 📸 **FOTO 2 — El plan por fases.** Captura del chat “app design and deployment plan” donde se ve el plan dividido en fases (o de la lista de fases del README). Es la prueba de que primero fue la conversación, no el código. *(ver guion de fotos)*

Así quedó el camino que recorrimos —y lo cuento como lo vivimos, con sus cicatrices incluidas—:

### Fase 1 — Primero el diseño, no el código

Lo primero no fue una base de datos ni un servidor. Fue **el aspecto**. Con Claude Design montamos un prototipo navegable, en modo claro y oscuro, hasta el último píxel: cómo se ve una tarjeta de plan, cómo entra tu cara cuando te apuntas, cómo se siente abrir el detalle.

Y, sobre todo, fijamos tres principios que no negociamos en todo el proyecto:

- **Todo se entiende de un vistazo.** La foto manda; el resto es mínimo.
- **Apuntarse es un único toque.** Sin formularios, sin rellenar nada.
- **Lo que la app NO hace** es tan importante como lo que hace: sin votaciones de fechas, sin encuestas, sin un chat propio que compita con WhatsApp. La conversación fina sigue donde siempre. Las caras de quien se apunta son toda la información que necesitas.

> 📸 **FOTO 3 — El prototipo de Claude Design.** Captura del diseño en claro y oscuro (la galería de pantallas del prototipo). Muestra el “antes”: el diseño antes de ser app real. *(ver guion de fotos)*

### Fase 2 — Que los datos sean de verdad

Un prototipo bonito es solo un dibujo. En la segunda fase conectamos **Supabase** (una base de datos en la nube, gratis) para que apuntarse persistiera de verdad: si yo me apunto a la acampada, tú lo ves. Dejó de ser una maqueta y empezó a ser una herramienta.

### Fase 3 — ¿Quién es quién?

Aquí llegó la primera cicatriz. Quería que cada uno entrara con su nombre y su cara, sin fricción. Probamos el típico “enlace mágico” por correo y… en el móvil no iba fino. Punto. Lo tiramos a la basura y volvimos a lo simple: email y contraseña. Una lección que ya conocía de emprender y que se repite siempre — lo elegante sobre el papel no siempre sobrevive al mundo real.

### Fase 4 — El agente del domingo (mi parte favorita)

Esta es la que hace que la gente abra los ojos. La app no espera a que alguien tenga la idea del plan: **un agente de IA rastrea Madrid cada semana y los propone él**.

Cada domingo, un agente con búsqueda web en vivo peina la ciudad —zonas de baño en pantanos, rutas de senderismo, conciertos gratis de los Veranos de la Villa, cine de verano, chollos de vuelo para una escapada— y devuelve veinte o veinticinco planes **reales y verificados en su fuente** (nada de inventarse precios ni fechas). Esos planes caen en una bandeja de propuestas, y yo, como administrador, los apruebo o los descarto de un toque. Lo aprobado aparece en el tablón de todos.

Dicho de otro modo: el grupo ya no tiene que pensar qué hacer. Solo tiene que elegir.

> 📸 **FOTO 4 — La bandeja del administrador / el agente.** Captura de la pantalla “Revisar” con las propuestas pendientes y su fuente, o un trozo del prompt del agente. Es el factor “wow” del artículo. *(ver guion de fotos)*

### Fase 5 — Que viva en el bolsillo

De nada sirve si hay que abrir el navegador cada vez. Así que la convertimos en una **PWA**: una app instalable en la pantalla de inicio del móvil, con su icono —un sol—, **sin pasar por ninguna tienda de aplicaciones**. Pulsas “añadir a inicio” y ya la tienes, como cualquier otra app.

### Fase 6 — Probarla con la cuadrilla

Y la última fase es la única que importaba de verdad: pasarles el enlace y ver sus caras.

> 📸 **FOTO 5 — La app funcionando.** Captura del Home real en el móvil, con planes y fotos de verdad (el tablón). Y, si quieres, una del detalle de un plan. *(ver guion de fotos)*

> 📸 **FOTO 6 — La app instalada.** Foto del móvil con el icono del sol en la pantalla de inicio (la PWA ya instalada). Demuestra que “vive en el bolsillo”. *(ver guion de fotos)*

---

## Lo que de verdad aprendí

Te lo cuento sin purpurina, como hago siempre: desde el que se ha manchado las botas, no desde el manual.

**No hace falta saber programar.** Y lo digo yo, que no sé. El cuello de botella de construir algo ya no es el código —de eso se encarga la IA—; es tener claro el problema y saber explicarlo. El mapa nunca es el territorio: por muy bonito que sea el plan, lo que manda es lo que pasa cuando lo pones en manos de gente real.

Quizás te suene esta frase de Eric Ries: *“si esperas a lanzar tu producto cuando lo ves perfecto, entonces ya vas tarde”*. Pues eso. No entré en parálisis por análisis. Lancé algo pequeño, feo en algún borde y funcionando, y lo fui puliendo con mis amigos usándolo. Hacer, no decir.

Y la app, al final, es lo de menos. Lo que importa es la excusa: volver a vernos.

---

## Cópiatela para tu cuadrilla

Esto no lo cuento para presumir, sino para que lo hagas tú. Por eso **el código está publicado**, gratis, para que te lo descargues y montes el tablón de tu propio grupo cambiándole cuatro nombres.

**Repositorio:** github.com/icarrillomartos/app-verano

El stack entero es gratuito: **Next.js** (la app), **Supabase** (los datos y el acceso) y **Vercel** (para publicarla en internet con un clic). En el README está el plan por fases, por si quieres recorrer el mismo camino.

> 📸 **FOTO 7 — El repositorio en GitHub.** Captura de la página del repo (público) con el README, la estructura de carpetas y las fases. Es la “llamada a la acción”: aquí está, llévatelo. *(ver guion de fotos)*

> 📸 **FOTO 8 — El despliegue en Vercel.** Captura del panel de Vercel con el deploy en verde / la URL en producción. Cierra el círculo: de la idea a internet. *(ver guion de fotos)*

Si te animas a montar la tuya —o si simplemente quieres que te cuente más— escríbeme por aquí, por LinkedIn, o por correo a icarrillomartos@gmail.com. Las cosas que te sirvan, quédatelas; las que no, a la basura.

Porque, ya lo dijimos en aquella cena: las cosas no se dicen, se hacen. Y al hacerlas, se dicen solas.

Nos vemos en el próximo plan.

— Iván
