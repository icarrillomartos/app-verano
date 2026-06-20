-- =====================================================================
--  La cuadrilla — setup completo de la base de datos (Fase 2)
--  Pega TODO este archivo en Supabase → SQL Editor → Run.
--  Crea las tablas, la seguridad (RLS), los 12 miembros, los 24 planes
--  y algo de gente apuntada de ejemplo. Es idempotente: se puede re-ejecutar.
--  (No necesita la contraseña de la BD; el editor SQL ya corre como admin.)
-- =====================================================================

create extension if not exists pgcrypto;

-- Reinicio limpio (Fase 2; en producción real no se haría tan alegremente)
drop table if exists attendance cascade;
drop table if exists plans cascade;
drop table if exists members cascade;
drop table if exists groups cascade;

-- ---- Tablas ----
create table groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  created_at  timestamptz not null default now()
);

create table members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid references groups(id) on delete cascade,
  name        text not null,
  initials    text not null,
  color       text not null,            -- hex; al usuario actual la app le pone el acento
  photo_url   text,                     -- foto de cara (Fase 3)
  is_admin    boolean not null default false,
  auth_id     uuid,                     -- enlazará con auth.users (Fase 3)
  created_at  timestamptz not null default now()
);

create table plans (
  id            uuid primary key default gen_random_uuid(),
  group_id      uuid references groups(id) on delete cascade,
  title         text not null,
  category      text not null,
  stream        text,                   -- madrid_leisure | travel_deal
  is_atemporal  boolean not null default false,
  date_text     text,
  date_long     text,
  date_start    date,
  date_end      date,
  price         numeric not null default 0,
  price_note    text,
  location      text,
  duration      text,
  description   text,
  source_name   text,
  source_url    text,
  image_url     text,
  is_flash      boolean not null default false,
  expires_at    date,
  status        text not null default 'pending',  -- pending|published|discarded|archived
  created_at    timestamptz not null default now()
);

create table attendance (
  plan_id     uuid references plans(id) on delete cascade,
  member_id   uuid references members(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (plan_id, member_id)
);

create index plans_group_status_idx on plans (group_id, status);
create index attendance_plan_idx on attendance (plan_id);

-- ---- Seguridad (RLS) ----
-- Fase 2: políticas permisivas para funcionar con la anon key sin login.
-- En la Fase 3 (auth) se endurecen: escribir asistencia solo el propio usuario,
-- y aprobar/descartar solo el admin.
alter table groups     enable row level security;
alter table members    enable row level security;
alter table plans      enable row level security;
alter table attendance enable row level security;

create policy "read groups"          on groups     for select using (true);
create policy "read members"         on members    for select using (true);
create policy "read published plans" on plans      for select using (status = 'published');
create policy "read attendance"      on attendance for select using (true);
create policy "join plans"           on attendance for insert with check (true);
create policy "leave plans"          on attendance for delete using (true);

-- ---- Seed: grupo ----
insert into groups (id, name, city)
values ('00000000-0000-0000-0000-0000000000aa', 'La cuadrilla', 'Madrid');

-- ---- Seed: 12 miembros (ids fijos para poder referenciarlos) ----
insert into members (id, group_id, name, initials, color, is_admin) values
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-0000000000aa','Tú',       'TÚ','#E0455E', true),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-0000000000aa','Marta R.', 'MR','#DE7C5A', false),
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-0000000000aa','Jon L.',   'JL','#4FA3A8', false),
  ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-0000000000aa','Ana S.',   'AS','#E2A33C', false),
  ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-0000000000aa','David G.', 'DG','#7E8CCF', false),
  ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-0000000000aa','Laura M.', 'LM','#D98AA6', false),
  ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-0000000000aa','Iker B.',  'IB','#5F9E6A', false),
  ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-0000000000aa','Nerea P.', 'NP','#C8703E', false),
  ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-0000000000aa','Carlos V.','CV','#6FA0D6', false),
  ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-0000000000aa','Sara D.',  'SD','#D2675E', false),
  ('00000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-0000000000aa','Unai A.',  'UA','#84A65A', false),
  ('00000000-0000-0000-0000-00000000000c','00000000-0000-0000-0000-0000000000aa','Maite Z.', 'MZ','#B07CC9', false);

-- ---- Seed: 24 planes (publicados) desde el JSON del agente ----
insert into plans (group_id, status, title, category, stream, is_atemporal, date_text, date_long,
                   date_start, date_end, price, price_note, location, duration, description,
                   source_name, source_url, image_url, is_flash, expires_at)
select '00000000-0000-0000-0000-0000000000aa', 'published',
       p.title, p.category, p.stream, p.is_atemporal, p.date_text, p.date_long,
       p.date_start, p.date_end, p.price, p.price_note, p.location, p.duration, p.description,
       p.source_name, p.source_url, p.image_url, p.is_flash, p.expires_at
from jsonb_to_recordset($json$
[
  {"title":"Baño en el Pantano de San Juan","category":"Naturaleza","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":0,"price_note":"entrada gratis al pantano","location":"San Martín de Valdeiglesias","duration":"Día completo","description":"La playa de Madrid de verdad: el único embalse donde el baño está autorizado. Playa Virgen de la Nueva con bandera azul, zonas verdes y aparcamiento. Perfecto para llenar el coche y pasar el día con la cuadrilla.","source_name":"Time Out Madrid","source_url":"https://www.timeout.es/madrid/es/viaje/embalse-de-san-juan","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Paddle surf y kayak en San Juan","category":"Aventura","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":14,"price_note":"desde, por persona/hora","location":"Pantano de San Juan","duration":"2 h","description":"Hay un Big SUP gigante para hasta 10 personas, ideal para el grupo: carreras, tirar al colega al agua y risas aseguradas. Alquiler de tablas y kayaks desde 14€/hora. Plan activo para refrescarse haciendo el cabra.","source_name":"Yumping","source_url":"https://www.yumping.com/ofertas/paddle-surf/madrid/paddle-surf-en-san-martin-de-valdeiglesias--o42993","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Las Presillas de Rascafría","category":"Naturaleza","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":20,"price_note":"parking por coche","location":"Rascafría","duration":"Día completo","description":"Tres piscinas naturales en el río Lozoya rodeadas de pinos y césped para tumbarse al sol. Agua fresquísima de sierra en pleno valle de El Paular. El parking cuesta 20€ por coche en verano, así que repartid entre todos.","source_name":"Madrid Happy People","source_url":"https://www.madridhappypeople.com/ocio-madrid/las-presillas-de-rascafria/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Ruta a la Charca Verde en La Pedriza","category":"Aventura","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":0,"price_note":"reserva de acceso recomendada","location":"Manzanares el Real","duration":"Medio día","description":"Unos 9 km entre cascadas y saltos del río Manzanares hasta una charca de color verde esmeralda. Id pronto por la mañana: la barrera cierra al llenarse el cupo de coches y conviene reservar. Senderismo bonito y asequible para el grupo.","source_name":"Mi Alma Viajera","source_url":"https://mialmaviajera.es/ruta-charca-verde/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Camino Schmid en Cercedilla","category":"Aventura","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":0,"price_note":"se llega en Cercanías","location":"Cercedilla","duration":"Medio día","description":"Clásico de la Sierra de Guadarrama: 7 km entre pinos del puerto de Navacerrada hacia Cercedilla, con vistas a Siete Picos. Se llega en Cercanías y el tren de la sierra, sin necesidad de coche. Plan de montaña fresquito para escapar del calor.","source_name":"Federación Madrileña de Montañismo","source_url":"https://fmm.es/rutas/ruta-senderismo-camino-schmid/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Playa urbana de Madrid Río","category":"Ocio","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":0,"price_note":"gratis","location":"Madrid Río","duration":"Lo que queráis","description":"Tres láminas de agua con chorros donde está permitido remojarse gratis en pleno centro, de 11:00 a 21:00. La única fuente urbana de Madrid con baño permitido. Perfecto para refrescarse sin salir de la ciudad.","source_name":"Madrid 24 horas","source_url":"https://www.madrid24horas.com/articulo/que-hacer/playa-madrid-rio-abierta-conoce-horarios-actividades-como-disfrutarla/20250612105024096024.html","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Atardecer en el Templo de Debod","category":"Urbano","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":0,"price_note":"gratis","location":"Parque del Oeste","duration":"2 h","description":"El mejor atardecer de Madrid, gratis. A partir de las 20:30 el cielo se tiñe de naranja tras el templo egipcio, con la sierra de fondo. Caña, mantita y a ver caer el sol con la cuadrilla.","source_name":"Mirador Madrid","source_url":"https://www.miradormadrid.com/atardecer-en-madrid-mejores-lugares/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"El Rastro de Madrid","category":"Ocio","stream":"madrid_leisure","is_atemporal":true,"date_text":"Domingos por la mañana","date_long":"Domingos y festivos de 9:00 a 15:00","date_start":null,"date_end":null,"price":0,"price_note":"gratis","location":"La Latina","duration":"Mañana","description":"El mercadillo más castizo de Madrid, de Cascorro por Ribera de Curtidores. Vintage, segunda mano, discos y cañas en La Latina al terminar. Id pronto, entre 9 y 11, para pasear sin agobios.","source_name":"Madrid Happy People","source_url":"https://www.madridhappypeople.com/ocio-madrid/el-rastro-de-madrid/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Azotea del Círculo de Bellas Artes","category":"Urbano","stream":"madrid_leisure","is_atemporal":true,"date_text":"Todo el verano","date_long":"Disponible todo el verano 2026","date_start":null,"date_end":null,"price":5,"price_note":"5,5€ entrada (4€ con Carné Joven)","location":"Calle Alcalá","duration":"2 h","description":"Vistas de 360º del centro de Madrid a 56 metros sobre Alcalá. Por 5,5€ (4€ con Carné Joven) subís y os tomáis algo con todo Madrid a vuestros pies. Atardecer urbano de los buenos.","source_name":"esMadrid","source_url":"https://www.esmadrid.com/en/nightlife/azotea-del-circulo","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Piscina del Lago de Casa de Campo","category":"Ocio","stream":"madrid_leisure","is_atemporal":true,"date_text":"Hasta 6 sep","date_long":"Temporada hasta el 6 de septiembre","date_start":null,"date_end":null,"price":4,"price_note":"4,5€ adultos jornada completa","location":"Casa de Campo","duration":"Día completo","description":"Las piscinas municipales más codiciadas del verano, baratísimas: 4,5€ la jornada completa para adultos (3,6€ de 15 a 26 años). Césped, sol y chapuzón sin salir de la ciudad. Plan de grupo redondo cuando aprieta el calor.","source_name":"Ayuntamiento de Madrid","source_url":"https://diario.madrid.es/blog/2026/05/21/todas-piscinas-municipales-verano-madrid-precios-horarios-ubicaciones-novedades/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Mercado de Motores","category":"Ocio","stream":"madrid_leisure","is_atemporal":false,"date_text":"12–13 jul","date_long":"Sábado 12 y domingo 13 de julio","date_start":"2026-07-12","date_end":"2026-07-13","price":0,"price_note":"entrada gratis","location":"Museo del Ferrocarril","duration":"Medio día","description":"Más de 100 expositores de diseño, vintage y artesanía entre trenes antiguos, con conciertos, DJs, food trucks y muy buen rollo. Entrada gratis en la antigua estación de Delicias. Plan de domingo perfecto para la cuadrilla.","source_name":"Madrid Happy People","source_url":"https://www.madridhappypeople.com/ocio-madrid/mercado-de-motores-madrid/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Cine de verano gratis en Las Vistillas","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"Hasta 26 jul","date_long":"Sábados hasta el 26 de julio","date_start":"2026-07-05","date_end":"2026-07-26","price":0,"price_note":"gratis","location":"Las Vistillas","duration":"2 h","description":"Cine al aire libre y gratis en las plazas del centro a las 21:00. En Las Vistillas pasan F1, Gladiator II o Jurassic World con la sierra de fondo. Llevad mantita y picoteo: noche de peli en grupo sin gastar un euro.","source_name":"Ayuntamiento de Madrid","source_url":"https://diario.madrid.es/blog/notas-de-prensa/el-distrito-de-centro-inaugura-su-cine-de-verano-con-proyecciones-gratuitas-en-las-plazas-de-barcelo-la-corrala-y-las-vistillas/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Veranos de la Villa: concierto inaugural","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"Mar 7 jul","date_long":"Martes 7 de julio","date_start":"2026-07-07","date_end":"2026-07-07","price":0,"price_note":"entrada libre hasta completar aforo","location":"Conde Duque","duration":"2 h","description":"Arranca el festival del verano de Madrid con LOS40 y la cancion del verano, una fiesta musical con Fernandisco repasando los hits desde 1985. Entrada libre hasta llenar aforo. Pistoletazo de salida perfecto para el grupo.","source_name":"Veranos de la Villa","source_url":"https://www.veranosdelavilla.com/es/programa","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Veranos de la Villa: cultura al aire libre","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"7 jul–29 ago","date_long":"Del 7 de julio al 29 de agosto","date_start":"2026-07-07","date_end":"2026-08-29","price":0,"price_note":"más de 100 actividades gratis","location":"14 distritos de Madrid","duration":"Todo el verano","description":"72 propuestas y 193 citas de música, danza, circo, teatro y cine repartidas por 14 distritos, más de un centenar gratuitas. Conde Duque y el claustro del San Isidro como sedes. Hay plan cultural casi cada noche del verano.","source_name":"Ayuntamiento de Madrid","source_url":"https://diario.madrid.es/blog/2026/06/02/programacion-veranos-de-la-villa-2026/","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Noches del Botánico","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"Hasta 31 jul","date_long":"Del 3 de junio al 31 de julio","date_start":"2026-06-20","date_end":"2026-07-31","price":40,"price_note":"desde ~35€ por concierto","location":"Real Jardín Botánico","duration":"Noche","description":"Conciertos al aire libre en el Jardín Botánico en su 10º aniversario, con Van Morrison, Jean-Michel Jarre, John Legend o Rigoberta Bandini. Entradas desde unos 35€. Plan de noche de verano con buena música bajo los árboles.","source_name":"Somos Madrid (eldiario.es)","source_url":"https://www.eldiario.es/madrid/somos/agenda/noches-botanico-2026-madrid-fechas-cartel-completo-actuaciones-horarios-precio-entradas_1_12985459.html","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Mad Cool Festival 2026","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"8–11 jul","date_long":"Del 8 al 11 de julio","date_start":"2026-07-08","date_end":"2026-07-11","price":110,"price_note":"abono desde ~110€ (consultar web)","location":"Iberdrola Music, Villaverde","duration":"4 días","description":"El gran festival de Madrid en su 10º aniversario: Foo Fighters (única fecha en España), Nick Cave, Florence + The Machine, Lorde, Pulp y Pixies. Entradas y abonos en su tramo final. Si vais en grupo, es EL planazo del verano.","source_name":"Ticketmaster","source_url":"https://blog.ticketmaster.es/post/el-cartel-de-mad-cool-festival-2026-ya-esta-aqui-38479/","image_url":null,"is_flash":true,"expires_at":"2026-07-08"},
  {"title":"Festival Tomavistas","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"22–24 jun","date_long":"Del 22 al 24 de junio","date_start":"2026-06-22","date_end":"2026-06-24","price":0,"price_note":"entradas en Tomaticket","location":"Parque Tierno Galván","duration":"3 días","description":"Festival sostenible y family friendly en el Tierno Galván con Metronomy, Ladytron, The Vaccines, La Casa Azul o La La Love You. Indie y pop para bailar en grupo a un paso del centro (metro Legazpi o Méndez Álvaro).","source_name":"Dod Magazine","source_url":"https://www.dodmagazine.es/festivales/tomavistas/","image_url":null,"is_flash":true,"expires_at":"2026-06-22"},
  {"title":"Cine de verano en Matadero","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"2–26 jul","date_long":"Del 2 al 26 de julio","date_start":"2026-07-02","date_end":"2026-07-26","price":0,"price_note":"gratis","location":"Matadero Madrid","duration":"2 h","description":"La plaza de Matadero se convierte en cine de verano con Superestrellas 3: musicales queer, sesiones comentadas e incluso cine-conciertos en directo. Plan cultural y gratis junto al río. Original y para todos los gustos.","source_name":"esMadrid","source_url":"https://www.esmadrid.com/cines-verano-madrid","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Fiestas de La Paloma en La Latina","category":"Cultura","stream":"madrid_leisure","is_atemporal":false,"date_text":"14–17 ago","date_long":"Del 14 al 17 de agosto","date_start":"2026-08-14","date_end":"2026-08-17","price":0,"price_note":"acceso libre","location":"La Latina","duration":"Tarde-noche","description":"El Madrid más castizo: chotis, organillos, verbena y conciertos gratis por las calles de La Latina, con el 15 de agosto como día grande. Plan de grupo con mucho ambiente, gastronomía y baile hasta tarde.","source_name":"esMadrid","source_url":"https://www.esmadrid.com/en/whats-on/august-fiestas-madrid","image_url":null,"is_flash":false,"expires_at":null},
  {"title":"Escapada a Oporto en avión","category":"Viaje","stream":"travel_deal","is_atemporal":false,"date_text":"Julio","date_long":"Fin de semana de julio","date_start":"2026-07-23","date_end":"2026-07-27","price":46,"price_note":"vuelo i/v desde, por persona","location":"Oporto","duration":"Finde · 3-4 días","description":"Vuelo ida y vuelta a Oporto desde 46€ con Ryanair en fechas de julio. Vinos, francesinhas y la Ribeira para la cuadrilla a precio de risa. Reservad pronto que vuela. Precios fluctúan: confirmad en la web.","source_name":"KAYAK","source_url":"https://www.kayak.es/vuelos/Ryanair-Madrid-Barajas-MAD/Francisco-Sa-Carneiro-de-Oporto-OPO.b.FR.ksp","image_url":null,"is_flash":true,"expires_at":"2026-07-15"},
  {"title":"Escapada a Lisboa low cost","category":"Viaje","stream":"travel_deal","is_atemporal":false,"date_text":"Julio","date_long":"Fin de semana de julio","date_start":"2026-07-23","date_end":"2026-07-27","price":49,"price_note":"vuelo i/v desde, por persona","location":"Lisboa","duration":"Finde · 3-4 días","description":"Vuelo i/v a Lisboa desde 49€ con Ryanair, más barato en julio que en agosto. Miradores, bacalhau, fado y noche en el Barrio Alto para el grupo. Alta frecuencia de vuelos, así que hay margen para cuadrar fechas.","source_name":"Google Vuelos","source_url":"https://www.google.com/travel/flights/flights-from-madrid-to-lisbon.html?gl=ES&hl=es","image_url":null,"is_flash":true,"expires_at":"2026-07-15"},
  {"title":"Chollo de vuelo a Marrakech","category":"Oportunidad","stream":"travel_deal","is_atemporal":false,"date_text":"Julio","date_long":"Fin de semana de julio","date_start":"2026-07-13","date_end":"2026-07-16","price":75,"price_note":"vuelo i/v desde, por persona","location":"Marrakech","duration":"Finde · 3-4 días","description":"Vuelo ida y vuelta a Marrakech desde unos 75€ con Ryanair (julio más barato que agosto). Zocos, riads, té y aventura para el grupo a precio mínimo. Lunes es el día más barato para volar. Confirmad tarifa al reservar.","source_name":"Momondo","source_url":"https://www.momondo.com/flights/madrid/marrakesh","image_url":null,"is_flash":true,"expires_at":"2026-07-13"},
  {"title":"Finde de playa en Mallorca","category":"Viaje","stream":"travel_deal","is_atemporal":false,"date_text":"Agosto","date_long":"Fin de semana de agosto","date_start":"2026-08-07","date_end":"2026-08-10","price":66,"price_note":"vuelo i/v desde, por persona","location":"Palma de Mallorca","duration":"Finde · 3-4 días","description":"Vuelo i/v a Palma desde unos 66€ con Ryanair: calas, fiesta y playa para la cuadrilla. Reservad con antelación porque agosto sube rápido. Comparad fechas para pillar el mejor precio.","source_name":"KAYAK","source_url":"https://www.kayak.es/vuelos/Ryanair-Madrid-Barajas-MAD/Palma-de-Mallorca-PMI.b.FR.ksp","image_url":null,"is_flash":true,"expires_at":"2026-07-31"},
  {"title":"Escapada en tren a Segovia","category":"Viaje","stream":"travel_deal","is_atemporal":false,"date_text":"Cualquier finde","date_long":"Cualquier fin de semana del verano","date_start":"2026-07-04","date_end":"2026-07-05","price":9,"price_note":"tren i/v desde 9€ con Ouigo","location":"Segovia","duration":"Día completo","description":"Segovia a 25 minutos en tren desde 9€ con Ouigo. Acueducto, Alcázar, cochinillo y un baño en La Granja si apetece. Escapada baratísima de día para el grupo sin madrugar mucho. Descuento del 8% para grupos de 10+.","source_name":"Ouigo","source_url":"https://www.ouigo.com/es/tren-madrid-segovia","image_url":null,"is_flash":false,"expires_at":null}
]
$json$::jsonb) as p(
  title text, category text, stream text, is_atemporal boolean, date_text text, date_long text,
  date_start date, date_end date, price numeric, price_note text, location text, duration text,
  description text, source_name text, source_url text, image_url text, is_flash boolean, expires_at date
);

-- ---- Seed: gente apuntada de ejemplo (para que el tablón se vea vivo) ----
-- "Tú" (TÚ) se deja fuera a propósito para que puedas apuntarte tú mismo.
insert into attendance (plan_id, member_id)
select pl.id, m.id
from (values
  ('Baño en el Pantano de San Juan','MR'),('Baño en el Pantano de San Juan','JL'),('Baño en el Pantano de San Juan','AS'),('Baño en el Pantano de San Juan','DG'),('Baño en el Pantano de San Juan','LM'),
  ('Las Presillas de Rascafría','JL'),('Las Presillas de Rascafría','NP'),('Las Presillas de Rascafría','CV'),
  ('Ruta a la Charca Verde en La Pedriza','MR'),('Ruta a la Charca Verde en La Pedriza','DG'),('Ruta a la Charca Verde en La Pedriza','UA'),
  ('Playa urbana de Madrid Río','AS'),('Playa urbana de Madrid Río','NP'),('Playa urbana de Madrid Río','CV'),('Playa urbana de Madrid Río','SD'),('Playa urbana de Madrid Río','MZ'),('Playa urbana de Madrid Río','IB'),
  ('Atardecer en el Templo de Debod','LM'),('Atardecer en el Templo de Debod','MZ'),
  ('Mercado de Motores','MR'),('Mercado de Motores','AS'),('Mercado de Motores','DG'),('Mercado de Motores','NP'),('Mercado de Motores','CV'),('Mercado de Motores','SD'),('Mercado de Motores','IB'),
  ('Cine de verano gratis en Las Vistillas','JL'),('Cine de verano gratis en Las Vistillas','LM'),
  ('Veranos de la Villa: concierto inaugural','MR'),('Veranos de la Villa: concierto inaugural','UA'),('Veranos de la Villa: concierto inaugural','MZ'),
  ('Mad Cool Festival 2026','AS'),('Mad Cool Festival 2026','DG'),('Mad Cool Festival 2026','IB'),('Mad Cool Festival 2026','CV'),('Mad Cool Festival 2026','SD'),
  ('Escapada a Oporto en avión','MR'),('Escapada a Oporto en avión','JL'),('Escapada a Oporto en avión','AS')
) as seed(title, ini)
join plans pl on pl.title = seed.title
join members m on m.initials = seed.ini;
