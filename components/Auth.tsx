"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMemberByAuthId, createMember } from "@/lib/auth";
import type { Member } from "@/lib/data";

type Cluster = { initials: string; color: string }[];

export default function Auth({ onAuthed }: { onAuthed: (m: Member) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cluster, setCluster] = useState<Cluster>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("members")
      .select("initials,color")
      .limit(7)
      .then(({ data }) => setCluster((data as Cluster) ?? []));
  }, []);

  async function submit() {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return setError("Escribe un email válido.");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (mode === "signup" && !name.trim()) return setError("Pon tu nombre.");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase!.auth.signUp({ email: e, password });
        if (error) throw error;
        const userId = data.user?.id;
        if (!userId) throw new Error("No se pudo crear la cuenta.");
        const member = await createMember({ userId, name: name.trim() });
        onAuthed(member);
      } else {
        const { data, error } = await supabase!.auth.signInWithPassword({ email: e, password });
        if (error) throw error;
        const member = await getMemberByAuthId(data.user.id);
        if (!member) throw new Error("Tu cuenta no tiene perfil. Regístrate de nuevo o avisa al admin.");
        onAuthed(member);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal";
      if (/already registered|already been registered/i.test(msg))
        setError("Ese email ya está registrado. Inicia sesión.");
      else if (/invalid login credentials/i.test(msg))
        setError("Email o contraseña incorrectos.");
      else setError(msg);
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 28px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            font: "700 12px/1 Figtree",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 20,
          }}
        >
          {isSignup ? "Únete a" : "Bienvenido a"}
        </div>

        {cluster.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 14, marginBottom: 22 }}>
            {cluster.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  marginLeft: -14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "800 12px/1 Figtree",
                  color: "#fff",
                  background: c.color,
                  boxShadow: "0 0 0 3px var(--bg)",
                }}
              >
                {c.initials}
              </div>
            ))}
          </div>
        )}

        <div style={{ font: "900 28px/1.1 Figtree", letterSpacing: "-0.02em", color: "var(--text)", textWrap: "balance" }}>
          SOMos los que veranean
        </div>
        <div style={{ marginTop: 9, font: "600 13.5px/1.4 Figtree", color: "var(--muted)", maxWidth: 280 }}>
          El tablón de planes del grupo.
        </div>

        <div style={{ width: "100%", marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          {isSignup && (
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            inputMode="email"
            autoCapitalize="off"
            autoCorrect="off"
            placeholder="tu@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && submit()}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ marginTop: 12, font: "600 12.5px/1.4 Figtree", color: "var(--accent)" }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 16,
            borderRadius: 18,
            border: "none",
            background: "var(--accent)",
            color: "var(--accent-ink)",
            font: "800 16px/1 Figtree",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Un momento…" : isSignup ? "Crear cuenta" : "Entrar"}
        </button>

        <button
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setError(null);
          }}
          style={{
            marginTop: 16,
            padding: 8,
            border: "none",
            background: "none",
            color: "var(--muted)",
            font: "600 13px/1.4 Figtree",
            cursor: "pointer",
          }}
        >
          {isSignup ? (
            <>¿Ya tienes cuenta? <b style={{ color: "var(--accent)" }}>Inicia sesión</b></>
          ) : (
            <>¿Nuevo en el grupo? <b style={{ color: "var(--accent)" }}>Crea tu cuenta</b></>
          )}
        </button>

        <div style={{ marginTop: 14, font: "500 11px/1.5 Figtree", color: "var(--faint)", maxWidth: 280 }}>
          {isSignup
            ? "Solo nombre, email y contraseña. Tu avatar será un círculo con tus iniciales."
            : "¿Olvidaste la contraseña? Avisa al admin del grupo."}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: 16,
  border: "1px solid var(--line)",
  background: "var(--surface)",
  color: "var(--text)",
  font: "600 15px/1 Figtree",
  outline: "none",
  textAlign: "center" as const,
};
