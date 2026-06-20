// Datos mock para la Fase 1 (UI). En fases posteriores esto vendrá de Supabase.

export type Person = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type Plan = {
  id: string;
  title: string;
  category: string;
  flash?: boolean;
  expires?: string;
  price: number;
  date: string;
  dateLong: string;
  location: string;
  duration: string;
  others: string[];
  photoBg: string;
  photoLabel: string;
  desc: string;
  source: string;
};

export type ProposalStatus = "pending" | "approved" | "discarded";

export type Proposal = {
  id: string;
  title: string;
  category: string;
  price: number;
  date: string;
  location: string;
  source: string;
  photoBg: string;
  photoLabel: string;
  status: ProposalStatus;
  editing: boolean;
};

// Fondo placeholder a rayas (se sustituirá por foto real con object-fit:cover).
const st = (a: string, b: string) =>
  `repeating-linear-gradient(135deg, ${a} 0 16px, ${b} 16px 32px)`;

// "Tú" usa var(--accent); el resto, color fijo por persona.
export const PEOPLE: Record<string, Person> = {
  you: { id: "you", name: "Tú", initials: "TÚ", color: "var(--accent)" },
  mr: { id: "mr", name: "Marta R.", initials: "MR", color: "#DE7C5A" },
  jl: { id: "jl", name: "Jon L.", initials: "JL", color: "#4FA3A8" },
  as: { id: "as", name: "Ana S.", initials: "AS", color: "#E2A33C" },
  dg: { id: "dg", name: "David G.", initials: "DG", color: "#7E8CCF" },
  lm: { id: "lm", name: "Laura M.", initials: "LM", color: "#D98AA6" },
  ib: { id: "ib", name: "Iker B.", initials: "IB", color: "#5F9E6A" },
  np: { id: "np", name: "Nerea P.", initials: "NP", color: "#C8703E" },
  cv: { id: "cv", name: "Carlos V.", initials: "CV", color: "#6FA0D6" },
  sd: { id: "sd", name: "Sara D.", initials: "SD", color: "#D2675E" },
  ua: { id: "ua", name: "Unai A.", initials: "UA", color: "#84A65A" },
  mz: { id: "mz", name: "Maite Z.", initials: "MZ", color: "#B07CC9" },
};

export const CLUSTER_IDS = ["mr", "jl", "as", "dg", "lm", "ib", "np"];

export const PLANS: Plan[] = [
  {
    id: "mallorca",
    title: "Vuelo a Mallorca, 39€ ida y vuelta",
    category: "Oportunidad",
    flash: true,
    expires: "Caduca en 2 días",
    price: 39,
    date: "Sale en 2 días",
    dateLong: "Sale en 2 días · caduca",
    location: "Vuelo",
    duration: "Finde",
    others: ["jl", "as", "dg"],
    photoBg: st("#8FB7D6", "#9DC0DB"),
    photoLabel: "FOTO — PLAYA DE MALLORCA",
    desc: "Chollazo de vuelos para escaparnos un finde a la isla. Precio ida y vuelta por persona; las plazas vuelan, hay que decidir ya o se acaba.",
    source: "Buscador de vuelos",
  },
  {
    id: "acampada",
    title: "Acampada en Pinares de Lozoya",
    category: "Naturaleza",
    price: 0,
    date: "Sáb 12 jul",
    dateLong: "Sábado 12 de julio",
    location: "Lozoya",
    duration: "1 noche",
    others: ["mr", "jl", "as", "dg", "lm", "ib", "np"],
    photoBg: st("#8FB98C", "#9CC199"),
    photoLabel: "FOTO — RÍO Y PINARES",
    desc: "Zona de acampada libre junto al río. Llevamos tiendas, hornillo y nos bañamos. Plan redondo de finde sin gastar un duro.",
    source: "Ayto. de Lozoya",
  },
  {
    id: "senderismo",
    title: "Ruta de senderismo por La Pedriza",
    category: "Aventura",
    price: 0,
    date: "Sáb 19 jul",
    dateLong: "Sábado 19 de julio",
    location: "Manzanares el Real",
    duration: "~5 h",
    others: ["mr", "dg", "lm", "ua"],
    photoBg: st("#7FB6AE", "#8DBEB7"),
    photoLabel: "FOTO — LA PEDRIZA",
    desc: "Ruta circular con vistas y poza para remojarse al final. Dificultad media, salimos temprano para evitar el calor.",
    source: "Comunidad de Madrid",
  },
  {
    id: "pantano",
    title: "Día de pantano en San Juan",
    category: "Naturaleza",
    price: 0,
    date: "Dom 20 jul",
    dateLong: "Domingo 20 de julio",
    location: "Embalse de San Juan",
    duration: "Día completo",
    others: ["jl", "as", "np", "cv", "sd"],
    photoBg: st("#86B69A", "#94BDA6"),
    photoLabel: "FOTO — EMBALSE DE SAN JUAN",
    desc: "Playa de interior, neveras, palas y baño. El clásico domingo de verano sin complicarse la vida.",
    source: "Embalse de San Juan",
  },
  {
    id: "teatro",
    title: "Teatro en los Veranos de la Villa",
    category: "Cultura",
    price: 14,
    date: "Jue 24 jul",
    dateLong: "Jueves 24 de julio",
    location: "Centro",
    duration: "1 h 40",
    others: ["lm", "mz"],
    photoBg: st("#C98FA8", "#D29BB2"),
    photoLabel: "FOTO — VERANOS DE LA VILLA",
    desc: "Obra al aire libre dentro del festival de verano. Entradas limitadas, mejor pillarlas pronto.",
    source: "Veranos de la Villa",
  },
  {
    id: "warner",
    title: "Parque Warner",
    category: "Ocio",
    price: 38,
    date: "Vie 25 jul",
    dateLong: "Viernes 25 de julio",
    location: "San Martín de la Vega",
    duration: "Día completo",
    others: ["mr", "jl", "dg", "np", "cv", "sd"],
    photoBg: st("#9D93CE", "#A89FD4"),
    photoLabel: "FOTO — PARQUE WARNER",
    desc: "Día de montañas rusas. Comprando entradas en grupo sale más barato; coche compartido desde Madrid.",
    source: "Parque Warner",
  },
  {
    id: "concierto",
    title: "Concierto al aire libre en el Retiro",
    category: "Cultura",
    price: 12,
    date: "Mié 30 jul",
    dateLong: "Miércoles 30 de julio",
    location: "El Retiro",
    duration: "2 h",
    others: [],
    photoBg: st("#D7A47E", "#DDAE8B"),
    photoLabel: "FOTO — CONCIERTO EN EL RETIRO",
    desc: "Concierto al atardecer en el parque. Recién publicado: aún no se ha apuntado nadie, ¿abres tú la lista?",
    source: "Veranos de la Villa",
  },
  {
    id: "escape",
    title: "Escape room + cena en Malasaña",
    category: "Urbano",
    price: 25,
    date: "Vie 1 ago",
    dateLong: "Viernes 1 de agosto",
    location: "Malasaña",
    duration: "3 h",
    others: ["as", "dg", "lm", "ib", "np", "cv", "sd"],
    photoBg: st("#B3A79B", "#BCB1A7"),
    photoLabel: "FOTO — ESCAPE ROOM",
    desc: "60 minutos para escapar y luego cena de picoteo por el barrio. Grupos de 6, hacemos dos salas en paralelo.",
    source: "Sala de escape",
  },
  {
    id: "tirolinas",
    title: "Tirolinas en Cercedilla",
    category: "Aventura",
    price: 22,
    date: "Sáb 2 ago",
    dateLong: "Sábado 2 de agosto",
    location: "Cercedilla",
    duration: "Media jornada",
    others: ["ib", "ua", "mz"],
    photoBg: st("#7FB6AE", "#8DBEB7"),
    photoLabel: "FOTO — TIROLINAS EN CERCEDILLA",
    desc: "Circuito de tirolinas y puentes entre árboles en plena sierra. Apto para todos, no hace falta experiencia.",
    source: "Parque de aventura",
  },
  {
    id: "surf",
    title: "Clase de surf en Cantabria",
    category: "Viaje",
    price: 65,
    date: "9–10 ago",
    dateLong: "Sábado 9 y domingo 10 de agosto",
    location: "Somo",
    duration: "Finde · 2 días",
    others: ["mr", "as", "sd", "ua"],
    photoBg: st("#8FB7D6", "#9DC0DB"),
    photoLabel: "FOTO — SURF EN SOMO",
    desc: "Escapada de finde a la playa de Somo: clase de surf el sábado y caña por la noche. Buscamos alojamiento compartido.",
    source: "Escuela de surf",
  },
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: "foodtrucks",
    title: "Festival de food trucks en Matadero",
    category: "Urbano",
    price: 0,
    date: "Sáb 26 jul",
    location: "Matadero",
    source: "Web del evento",
    photoBg: st("#B3A79B", "#BCB1A7"),
    photoLabel: "FOTO — FOOD TRUCKS EN MATADERO",
    status: "pending",
    editing: false,
  },
  {
    id: "kayak",
    title: "Kayak en el embalse de El Atazar",
    category: "Aventura",
    price: 30,
    date: "Dom 27 jul",
    location: "El Atazar",
    source: "Empresa de actividades",
    photoBg: st("#7FB6AE", "#8DBEB7"),
    photoLabel: "FOTO — KAYAK EN EL ATAZAR",
    status: "pending",
    editing: false,
  },
  {
    id: "oporto",
    title: "Vuelo a Oporto, 45€ ida y vuelta",
    category: "Oportunidad",
    price: 45,
    date: "Finde a confirmar",
    location: "Vuelo",
    source: "Buscador de vuelos",
    photoBg: st("#D7A47E", "#DDAE8B"),
    photoLabel: "FOTO — RIBEIRA DE OPORTO",
    status: "pending",
    editing: false,
  },
];
