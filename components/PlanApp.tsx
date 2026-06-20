"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  type Member,
  type DBPlan,
  photoBgFor,
  photoLabelFor,
  expiresText,
} from "@/lib/data";
import { loadAppData, joinPlan, leavePlan } from "@/lib/queries";
import { CURRENT_MEMBER_ID } from "@/lib/supabase";
import {
  Sliders,
  Check,
  CheckGratis,
  Bolt,
  Clock,
  Calendar,
  Coin,
  Pin,
  Plus,
  X,
  ExternalLink,
  Chat,
  Home,
  Tray,
  ThemeToggle,
} from "@/components/icons";

type Screen = "home" | "admin" | "onboarding";
type Sort = "date" | "price" | "mine";
type FaceVM = { id: string; initials: string; bg: string; ring: string };

const PHOTO_OVERLAY = "linear-gradient(transparent,rgba(20,14,10,0.34))";

function ringFor(id: string) {
  return id === CURRENT_MEMBER_ID
    ? "0 0 0 2px var(--surface), 0 0 0 3.6px var(--accent)"
    : "0 0 0 2px var(--surface)";
}

export default function PlanApp() {
  // --- UI state ---
  const [screen, setScreen] = useState<Screen>("home");
  const [openId, setOpenId] = useState<string | null>(null);
  const [attendeesId, setAttendeesId] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<Sort>("date");
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // --- Data state ---
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<DBPlan[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await loadAppData();
        if (!alive) return;
        if (data) {
          setMembers(data.members);
          setPlans(data.plans);
          setAttendance(data.attendance);
        }
      } catch (e) {
        if (alive) setLoadError(e instanceof Error ? e.message : "Error cargando datos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Apoyo de testing: ?screen=home|admin|onboarding
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("screen");
    if (s === "home" || s === "admin" || s === "onboarding") setScreen(s as Screen);
  }, []);

  // Tema (tocar la hora "9:41"); por defecto sigue al sistema
  useEffect(() => {
    const el = document.documentElement;
    if (theme) el.setAttribute("data-theme", theme);
    else el.removeAttribute("data-theme");
  }, [theme]);
  const toggleTheme = () =>
    setTheme((prev) => {
      const cur =
        prev ??
        (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      return cur === "dark" ? "light" : "dark";
    });

  // --- Derivados ---
  const byId: Record<string, Member> = {};
  for (const m of members) byId[m.id] = m;

  const isJoined = (planId: string) =>
    (attendance[planId] ?? []).includes(CURRENT_MEMBER_ID);

  const attIds = (planId: string) => {
    const ids = attendance[planId] ?? [];
    if (ids.includes(CURRENT_MEMBER_ID))
      return [CURRENT_MEMBER_ID, ...ids.filter((i) => i !== CURRENT_MEMBER_ID)];
    return ids;
  };

  const faceColor = (id: string) =>
    id === CURRENT_MEMBER_ID ? "var(--accent)" : byId[id]?.color ?? "#999";

  const faces = (ids: string[], max: number) => ({
    shown: ids.slice(0, max).map<FaceVM>((id) => ({
      id,
      initials: byId[id]?.initials ?? "?",
      bg: faceColor(id),
      ring: ringFor(id),
    })),
    overflow: Math.max(0, ids.length - max),
  });

  const namesLine = (ids: string[]) => {
    if (!ids.length) return "Nadie todavía";
    const names = ids.map((id) => (byId[id]?.name ?? "?").split(" ")[0]);
    if (ids.length <= 3) return names.join(", ");
    return names.slice(0, 2).join(", ") + " +" + (ids.length - 2);
  };

  const toggle = useCallback(
    (planId: string) => {
      const joined = (attendance[planId] ?? []).includes(CURRENT_MEMBER_ID);
      setAttendance((prev) => {
        const cur = prev[planId] ?? [];
        const next = joined
          ? cur.filter((i) => i !== CURRENT_MEMBER_ID)
          : [...cur, CURRENT_MEMBER_ID];
        return { ...prev, [planId]: next };
      });
      (joined ? leavePlan(planId) : joinPlan(planId)).catch(() => {
        // revertir si falla
        setAttendance((prev) => {
          const cur = prev[planId] ?? [];
          const next = joined
            ? [...cur, CURRENT_MEMBER_ID]
            : cur.filter((i) => i !== CURRENT_MEMBER_ID);
          return { ...prev, [planId]: next };
        });
      });
    },
    [attendance]
  );

  const open = (id: string) => {
    setOpenId(id);
    setSortOpen(false);
  };
  const goScreen = (s: Screen) => {
    setScreen(s);
    setOpenId(null);
    setAttendeesId(null);
    setSortOpen(false);
  };
  const chooseSort = (v: Sort) => {
    setSort(v);
    setSortOpen(false);
  };

  // Orden del feed
  const dateKey = (p: DBPlan) => {
    if (p.is_flash) return "0-" + (p.expires_at ?? p.date_start ?? "9999");
    if (p.date_start) return "1-" + p.date_start;
    return "2-zzz";
  };
  let list = [...plans];
  if (sort === "price") list.sort((a, b) => a.price - b.price);
  else list.sort((a, b) => dateKey(a).localeCompare(dateKey(b)));
  if (sort === "mine") list = list.filter((p) => isJoined(p.id));

  const cluster = members
    .filter((m) => m.id !== CURRENT_MEMBER_ID)
    .slice(0, 7)
    .map((m) => ({ initials: m.initials, bg: m.color }));

  const detailPlan = openId ? plans.find((p) => p.id === openId) ?? null : null;
  const attPlan = attendeesId ? plans.find((p) => p.id === attendeesId) ?? null : null;
  const showNav = screen === "home" || screen === "admin";

  const chip: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 10px",
    borderRadius: 999,
    background: "var(--chip)",
    color: "var(--muted)",
    font: "600 12px/1 Figtree",
  };

  const iconBtn: CSSProperties = {
    flex: "none",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    cursor: "pointer",
  };

  return (
    <div className="app-shell">
      {/* ============ HOME ============ */}
      {screen === "home" && (
        <>
          <div
            style={{
              flex: "none",
              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "8px 20px 14px",
              zIndex: 5,
            }}
          >
            <div>
              <div style={{ font: "800 23px/1 Figtree", letterSpacing: "-0.02em", color: "var(--text)" }}>
                La cuadrilla
              </div>
              <div style={{ marginTop: 5, font: "600 12.5px/1 Figtree", color: "var(--muted)" }}>
                {members.length} personas · {plans.length} planes vivos
              </div>
            </div>
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggleTheme} aria-label="Cambiar tema claro/oscuro" style={iconBtn}>
                <ThemeToggle size={19} />
              </button>
              <button onClick={() => setSortOpen((v) => !v)} aria-label="Filtrar y ordenar" style={iconBtn}>
                <Sliders size={19} />
              </button>
            </div>

            {sortOpen && (
              <div
                style={{
                  position: "absolute",
                  top: 52,
                  right: 20,
                  width: 218,
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  boxShadow: "0 12px 32px rgba(20,14,10,0.16)",
                  padding: 6,
                  zIndex: 30,
                }}
              >
                {(
                  [
                    ["date", "Más próximos"],
                    ["price", "Precio"],
                    ["mine", "Solo donde estoy yo"],
                  ] as [Sort, string][]
                ).map(([key, label]) => (
                  <div
                    key={key}
                    onClick={() => chooseSort(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 12px",
                      borderRadius: 11,
                      cursor: "pointer",
                      font: "600 13.5px/1 Figtree",
                      color: "var(--text)",
                    }}
                  >
                    {label}
                    {sort === key && <Check size={16} sw={2.4} color="var(--accent)" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="scrolly"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "2px 16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {loading && (
              <div style={{ padding: "60px 0", textAlign: "center", font: "600 13px/1.5 Figtree", color: "var(--muted)" }}>
                Cargando planes…
              </div>
            )}
            {loadError && (
              <div style={{ padding: "40px 0", textAlign: "center", font: "600 13px/1.5 Figtree", color: "var(--accent)" }}>
                No se pudieron cargar los planes.<br />
                <span style={{ color: "var(--muted)", fontWeight: 500 }}>{loadError}</span>
              </div>
            )}

            {!loading &&
              list.map((p) => {
                const j = isJoined(p.id);
                const ids = attIds(p.id);
                const f = faces(ids, 4);
                const free = p.price === 0;
                const empty = ids.length === 0;
                const border = j
                  ? "1.5px solid var(--accent)"
                  : p.is_flash
                  ? "1.5px solid var(--amber)"
                  : "1px solid var(--line)";
                const expText = p.is_flash ? expiresText(p.expires_at) : "";
                const photoStyle: CSSProperties = p.image_url
                  ? {
                      backgroundColor: "#ddd",
                      backgroundImage: `url(${p.image_url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : { background: photoBgFor(p.category) };
                return (
                  <div
                    key={p.id}
                    onClick={() => open(p.id)}
                    style={{
                      cursor: "pointer",
                      flex: "none",
                      background: "var(--surface)",
                      borderRadius: 24,
                      overflow: "hidden",
                      border,
                    }}
                  >
                    {/* Foto */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: 184,
                        ...photoStyle,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 11px",
                          borderRadius: 999,
                          background: "rgba(20,14,10,0.5)",
                          backdropFilter: "blur(6px)",
                          WebkitBackdropFilter: "blur(6px)",
                        }}
                      >
                        {p.is_flash && <Bolt size={12} />}
                        <span style={{ font: "700 11px/1 Figtree", color: "#fff", letterSpacing: "0.03em" }}>
                          {p.category}
                        </span>
                      </div>
                      {p.is_flash && expText && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 11px",
                            borderRadius: 999,
                            background: "var(--amber)",
                            color: "var(--amber-ink)",
                          }}
                        >
                          <Clock size={12} />
                          <span style={{ font: "800 11px/1 Figtree" }}>{expText}</span>
                        </div>
                      )}
                      {!p.image_url && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: 10,
                            font: "400 9.5px/1 'Space Mono',monospace",
                            letterSpacing: "0.04em",
                            color: "rgba(255,255,255,0.92)",
                            background: PHOTO_OVERLAY,
                          }}
                        >
                          {photoLabelFor(p)}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: "14px 15px 13px" }}>
                      <div
                        style={{
                          font: "700 18px/1.24 Figtree",
                          color: "var(--text)",
                          marginBottom: 11,
                          textWrap: "pretty",
                        }}
                      >
                        {p.title}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        <div style={chip}>
                          <Calendar size={13} />
                          {p.date_text ?? p.date_long ?? ""}
                        </div>
                        {free ? (
                          <div style={{ ...chip, background: "var(--pos-soft)", color: "var(--pos)", font: "700 12px/1 Figtree" }}>
                            <CheckGratis size={13} />
                            Gratis
                          </div>
                        ) : (
                          <div style={chip}>
                            <Coin size={13} />
                            {p.price}€
                          </div>
                        )}
                        {p.location && (
                          <div style={chip}>
                            <Pin size={13} />
                            {p.location}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        {empty ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                border: "1.6px dashed var(--accent-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--accent)",
                              }}
                            >
                              <Plus size={15} />
                            </div>
                            <span style={{ font: "600 12.5px/1.3 Figtree", color: "var(--muted)" }}>
                              Recién publicado
                              <br />
                              <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                                Sé el primero en apuntarte
                              </span>
                            </span>
                          </div>
                        ) : (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttendeesId(p.id);
                            }}
                            style={{ display: "flex", alignItems: "center", paddingLeft: 8, cursor: "pointer" }}
                          >
                            {f.shown.map((face) => (
                              <div
                                key={face.id}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  marginLeft: -8,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  font: "800 9.5px/1 Figtree",
                                  color: "#fff",
                                  background: face.bg,
                                  boxShadow: face.ring,
                                }}
                              >
                                {face.initials}
                              </div>
                            ))}
                            {f.overflow > 0 && (
                              <div
                                style={{
                                  height: 30,
                                  padding: "0 9px 0 11px",
                                  marginLeft: -8,
                                  borderRadius: 999,
                                  display: "flex",
                                  alignItems: "center",
                                  font: "700 11px/1 Figtree",
                                  color: "var(--muted)",
                                  background: "var(--chip)",
                                  boxShadow: "0 0 0 2px var(--surface)",
                                }}
                              >
                                +{f.overflow}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(p.id);
                          }}
                          style={{
                            flex: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 15px",
                            borderRadius: 999,
                            border: j ? "1px solid var(--accent-border)" : "1px solid transparent",
                            background: j ? "var(--accent-soft)" : "var(--accent)",
                            color: j ? "var(--accent)" : "var(--accent-ink)",
                            font: "700 13px/1 Figtree",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {j ? <Check size={15} sw={2.4} /> : <Plus size={15} sw={2.4} />}
                          {j ? "Apuntado" : "Me apunto"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {!loading && !loadError && (
              <div
                style={{
                  flex: "none",
                  textAlign: "center",
                  padding: "8px 0 4px",
                  font: "500 11.5px/1.5 Figtree",
                  color: "var(--faint)",
                }}
              >
                El agente busca planes nuevos cada domingo
              </div>
            )}
          </div>
        </>
      )}

      {/* ============ ADMIN (vacío en Fase 2) ============ */}
      {screen === "admin" && (
        <>
          <div
            style={{
              flex: "none",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "8px 20px 14px",
            }}
          >
            <div style={{ paddingRight: 12 }}>
              <div style={{ font: "800 21px/1.15 Figtree", letterSpacing: "-0.01em", color: "var(--text)" }}>
                Propuestas de esta semana
              </div>
              <div style={{ marginTop: 5, font: "600 12px/1.3 Figtree", color: "var(--muted)" }}>
                El agente aún no ha propuesto planes nuevos
              </div>
            </div>
            <button onClick={toggleTheme} aria-label="Cambiar tema claro/oscuro" style={iconBtn}>
              <ThemeToggle size={19} />
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 36px 60px", textAlign: "center" }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--faint)",
                marginBottom: 16,
              }}
            >
              <Tray size={26} />
            </div>
            <div style={{ font: "800 16px/1.3 Figtree", color: "var(--text)", marginBottom: 7 }}>
              Todo revisado
            </div>
            <div style={{ font: "500 13px/1.5 Figtree", color: "var(--muted)" }}>
              Cuando el agente rastree Madrid y proponga planes nuevos, aparecerán aquí para que los apruebes.
            </div>
          </div>
        </>
      )}

      {/* ============ ONBOARDING ============ */}
      {screen === "onboarding" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 30px 38px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              font: "700 12px/1 Figtree",
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 22,
            }}
          >
            Te han invitado a
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, marginBottom: 24 }}>
            {cluster.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  marginLeft: -14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "800 13px/1 Figtree",
                  color: "#fff",
                  background: c.bg,
                  boxShadow: "0 0 0 3px var(--bg)",
                }}
              >
                {c.initials}
              </div>
            ))}
          </div>
          <div style={{ font: "900 32px/1 Figtree", letterSpacing: "-0.02em", color: "var(--text)" }}>
            La cuadrilla
          </div>
          <div style={{ marginTop: 9, font: "600 14px/1 Figtree", color: "var(--muted)" }}>
            {members.length || 12} personas · Madrid
          </div>
          <div style={{ width: 54, height: 1, background: "var(--line)", margin: "26px 0" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "11px 16px",
              borderRadius: 16,
              background: "var(--surface)",
              border: "1px solid var(--line)",
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                font: "800 14px/1 Figtree",
                color: "#fff",
                background: "var(--accent)",
                boxShadow: "0 0 0 2px var(--surface),0 0 0 4px var(--accent)",
              }}
            >
              TÚ
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ font: "600 11.5px/1 Figtree", color: "var(--muted)", marginBottom: 4 }}>
                Entrarás como
              </div>
              <div style={{ font: "800 15px/1 Figtree", color: "var(--text)" }}>Tú</div>
            </div>
          </div>
          <button
            onClick={() => goScreen("home")}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 18,
              border: "none",
              background: "var(--accent)",
              color: "var(--accent-ink)",
              font: "800 16px/1 Figtree",
              cursor: "pointer",
            }}
          >
            Entrar al grupo
          </button>
          <div style={{ marginTop: 16, font: "500 11.5px/1.5 Figtree", color: "var(--faint)" }}>
            Sin formularios. La conversación fina sigue en WhatsApp.
          </div>
        </div>
      )}

      {/* ============ BOTTOM NAV ============ */}
      {showNav && (
        <div
          style={{
            flex: "none",
            display: "flex",
            alignItems: "stretch",
            padding: "8px 28px calc(8px + env(safe-area-inset-bottom))",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <button onClick={() => goScreen("home")} style={navBtn(screen === "home")}>
            <Home size={22} />
            <span style={{ font: "700 10.5px/1 Figtree" }}>Planes</span>
          </button>
          <button onClick={() => goScreen("admin")} style={navBtn(screen === "admin")}>
            <Tray size={22} />
            <span style={{ font: "700 10.5px/1 Figtree" }}>Revisar</span>
          </button>
        </div>
      )}

      {/* ============ DETALLE ============ */}
      {detailPlan && (
        <DetailSheet
          plan={detailPlan}
          joined={isJoined(detailPlan.id)}
          faces={faces(attIds(detailPlan.id), 7)}
          count={attIds(detailPlan.id).length}
          namesLine={namesLine(attIds(detailPlan.id))}
          onClose={() => setOpenId(null)}
          onToggle={() => toggle(detailPlan.id)}
        />
      )}

      {/* ============ HOJA DE APUNTADOS ============ */}
      {attPlan && (
        <div
          onClick={() => setAttendeesId(null)}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "var(--scrim)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              borderRadius: "28px 28px 0 0",
              maxHeight: "80%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px 12px",
              }}
            >
              <div>
                <div style={{ font: "800 18px/1 Figtree", color: "var(--text)" }}>Quién se apunta</div>
                <div style={{ marginTop: 5, font: "600 12px/1 Figtree", color: "var(--muted)" }}>
                  {attIds(attPlan.id).length} personas
                </div>
              </div>
              <button
                onClick={() => setAttendeesId(null)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  background: "var(--chip)",
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={17} />
              </button>
            </div>
            <div
              className="scrolly"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0 20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {attIds(attPlan.id).map((id) => {
                const person = byId[id];
                if (!person) return null;
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        font: "800 13px/1 Figtree",
                        color: "#fff",
                        background: faceColor(id),
                        boxShadow: ringFor(id),
                      }}
                    >
                      {person.initials}
                    </div>
                    <span style={{ font: "700 15px/1 Figtree", color: "var(--text)" }}>{person.name}</span>
                    {id === CURRENT_MEMBER_ID && (
                      <span
                        style={{
                          marginLeft: "auto",
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                          font: "800 11px/1 Figtree",
                        }}
                      >
                        Estás dentro
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Detalle (bottom-sheet) ----
function DetailSheet({
  plan,
  joined,
  faces,
  count,
  namesLine,
  onClose,
  onToggle,
}: {
  plan: DBPlan;
  joined: boolean;
  faces: { shown: FaceVM[]; overflow: number };
  count: number;
  namesLine: string;
  onClose: () => void;
  onToggle: () => void;
}) {
  const free = plan.price === 0;
  const detailChip: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 11px",
    borderRadius: 999,
    background: "var(--chip)",
    color: "var(--text)",
    font: "600 12.5px/1 Figtree",
  };
  const secondaryBtn: CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 13,
    borderRadius: 14,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    font: "700 13.5px/1 Figtree",
    cursor: "pointer",
  };
  const priceChipText = free ? "Gratis" : `${plan.price}€${plan.price_note ? " · " + plan.price_note : " / persona"}`;
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "var(--scrim)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "30px 30px 0 0",
          maxHeight: "93%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 224,
            flex: "none",
            ...(plan.image_url
              ? {
                  backgroundColor: "#ddd",
                  backgroundImage: `url(${plan.image_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : { background: photoBgFor(plan.category) }),
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(20,14,10,0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(20,14,10,0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {plan.is_flash && <Bolt size={12} />}
            <span style={{ font: "700 11.5px/1 Figtree", color: "#fff", letterSpacing: "0.03em" }}>
              {plan.category}
            </span>
          </div>
          {!plan.image_url && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: 10,
                textAlign: "center",
                font: "400 9.5px/1 'Space Mono',monospace",
                color: "rgba(255,255,255,0.9)",
                background: PHOTO_OVERLAY,
              }}
            >
              {photoLabelFor(plan)}
            </div>
          )}
        </div>

        <div className="scrolly" style={{ flex: 1, overflowY: "auto", padding: "18px 20px 4px" }}>
          <div
            style={{
              font: "800 23px/1.18 Figtree",
              letterSpacing: "-0.01em",
              color: "var(--text)",
              marginBottom: 13,
              textWrap: "pretty",
            }}
          >
            {plan.title}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 17 }}>
            <div style={detailChip}>
              <Calendar size={14} color="var(--muted)" />
              {plan.date_long ?? plan.date_text ?? ""}
            </div>
            {free ? (
              <div style={{ ...detailChip, background: "var(--pos-soft)", color: "var(--pos)", font: "700 12.5px/1 Figtree" }}>
                Gratis
              </div>
            ) : (
              <div style={detailChip}>{priceChipText}</div>
            )}
            {plan.location && (
              <div style={detailChip}>
                <Pin size={14} color="var(--muted)" />
                {plan.location}
              </div>
            )}
            {plan.duration && (
              <div style={detailChip}>
                <Clock size={14} color="var(--muted)" />
                {plan.duration}
              </div>
            )}
          </div>
          {plan.description && (
            <div
              style={{
                font: "500 14.5px/1.55 Figtree",
                color: "var(--muted)",
                marginBottom: 20,
                textWrap: "pretty",
              }}
            >
              {plan.description}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
            <span style={{ font: "700 13px/1 Figtree", color: "var(--text)" }}>Apuntados · {count}</span>
            <span style={{ font: "600 12px/1 Figtree", color: "var(--muted)" }}>{namesLine}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 9, marginBottom: 20 }}>
            {faces.shown.map((face) => (
              <div
                key={face.id}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  marginLeft: -9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "800 10.5px/1 Figtree",
                  color: "#fff",
                  background: face.bg,
                  boxShadow: face.ring,
                }}
              >
                {face.initials}
              </div>
            ))}
            {faces.overflow > 0 && (
              <div
                style={{
                  height: 34,
                  padding: "0 11px",
                  marginLeft: -9,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  font: "700 12px/1 Figtree",
                  color: "var(--muted)",
                  background: "var(--chip)",
                  boxShadow: "0 0 0 2px var(--surface)",
                }}
              >
                +{faces.overflow}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
            <button
              style={secondaryBtn}
              onClick={() => plan.source_url && window.open(plan.source_url, "_blank", "noopener")}
            >
              <ExternalLink size={16} />
              Más info
            </button>
            <button style={secondaryBtn}>
              <Chat size={16} />
              Comentar
            </button>
          </div>
        </div>

        <div
          style={{
            flex: "none",
            padding: "13px 20px calc(15px + env(safe-area-inset-bottom))",
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            onClick={onToggle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 16,
              borderRadius: 16,
              border: joined ? "1px solid var(--accent-border)" : "1px solid transparent",
              background: joined ? "var(--accent-soft)" : "var(--accent)",
              color: joined ? "var(--accent)" : "var(--accent-ink)",
              font: "800 16px/1 Figtree",
              cursor: "pointer",
            }}
          >
            {joined ? <Check size={18} sw={2.4} /> : <Plus size={18} sw={2.4} />}
            {joined ? "Apuntado · Quitarme" : "Me apunto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function navBtn(active: boolean): CSSProperties {
  return {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "7px 0",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: active ? "var(--accent)" : "var(--faint)",
  };
}
