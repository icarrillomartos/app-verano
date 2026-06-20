"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cluster = { initials: string; color: string }[];

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
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

  async function send() {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setError("Escribe un email válido.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase!.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 30px 40px",
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
          {sent ? "Revisa tu correo" : "Bienvenido a"}
        </div>

        {!sent && cluster.length > 0 && (
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
                  background: c.color,
                  boxShadow: "0 0 0 3px var(--bg)",
                }}
              >
                {c.initials}
              </div>
            ))}
          </div>
        )}

        <div style={{ font: "900 32px/1 Figtree", letterSpacing: "-0.02em", color: "var(--text)" }}>
          La cuadrilla
        </div>
        <div style={{ marginTop: 9, font: "600 14px/1.4 Figtree", color: "var(--muted)", maxWidth: 280 }}>
          {sent
            ? "Te hemos enviado un enlace de acceso. Ábrelo en este móvil para entrar."
            : "El tablón de planes del grupo. Entra con tu email, sin contraseñas."}
        </div>

        {!sent ? (
          <>
            <input
              type="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              style={{
                width: "100%",
                marginTop: 28,
                padding: "15px 16px",
                borderRadius: 16,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--text)",
                font: "600 15px/1 Figtree",
                outline: "none",
                textAlign: "center",
              }}
            />
            {error && (
              <div style={{ marginTop: 10, font: "600 12.5px/1.4 Figtree", color: "var(--accent)" }}>{error}</div>
            )}
            <button
              onClick={send}
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
              {loading ? "Enviando…" : "Enviar enlace de acceso"}
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 26,
                padding: "14px 18px",
                borderRadius: 16,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                font: "700 14px/1 Figtree",
                color: "var(--text)",
              }}
            >
              {email}
            </div>
            <button
              onClick={() => {
                setSent(false);
                setError(null);
              }}
              style={{
                marginTop: 18,
                padding: "10px 14px",
                border: "none",
                background: "none",
                color: "var(--muted)",
                font: "700 13px/1 Figtree",
                cursor: "pointer",
              }}
            >
              Usar otro email
            </button>
          </>
        )}

        <div style={{ marginTop: 18, font: "500 11.5px/1.5 Figtree", color: "var(--faint)" }}>
          La conversación fina sigue en WhatsApp.
        </div>
      </div>
    </div>
  );
}
