// Tipos y helpers de presentación. Los datos reales vienen de Supabase (lib/queries.ts).

export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
  photo_url?: string | null;
  is_admin?: boolean;
};

export type DBPlan = {
  id: string;
  title: string;
  category: string;
  stream: string | null;
  is_atemporal: boolean;
  date_text: string | null;
  date_long: string | null;
  date_start: string | null;
  date_end: string | null;
  price: number;
  price_note: string | null;
  location: string | null;
  duration: string | null;
  description: string | null;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  is_flash: boolean;
  expires_at: string | null;
  status: string;
};

// Fondo placeholder a rayas por categoría (mientras no haya foto real).
const st = (a: string, b: string) =>
  `repeating-linear-gradient(135deg, ${a} 0 16px, ${b} 16px 32px)`;

const CATEGORY_BG: Record<string, [string, string]> = {
  Naturaleza: ["#8FB98C", "#9CC199"],
  Aventura: ["#7FB6AE", "#8DBEB7"],
  Cultura: ["#C98FA8", "#D29BB2"],
  Ocio: ["#D7A47E", "#DDAE8B"],
  Urbano: ["#9D93CE", "#A89FD4"],
  Viaje: ["#8FB7D6", "#9DC0DB"],
  Oportunidad: ["#E0A96D", "#E6B782"],
};

export function photoBgFor(category: string): string {
  const c = CATEGORY_BG[category] ?? ["#B3A79B", "#BCB1A7"];
  return st(c[0], c[1]);
}

export function photoLabelFor(p: { location: string | null; title: string }): string {
  return "FOTO — " + (p.location ?? p.title).toUpperCase();
}

// Texto de cuenta atrás de los planes flash, relativo a hoy.
export function expiresText(expires_at: string | null): string {
  if (!expires_at) return "";
  const days = Math.ceil(
    (new Date(expires_at + "T00:00:00").getTime() - Date.now()) / 86400000
  );
  if (days <= 0) return "Caduca hoy";
  if (days === 1) return "Caduca mañana";
  return `Caduca en ${days} días`;
}

export function priceLabel(price: number): string {
  return price === 0 ? "Gratis" : `${price}€`;
}
