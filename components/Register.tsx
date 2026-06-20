"use client";

import { useRef, useState } from "react";
import { createMember } from "@/lib/auth";
import type { Member } from "@/lib/data";
import { Plus } from "@/components/icons";

export default function Register({
  userId,
  onDone,
}: {
  userId: string;
  onDone: (m: Member) => void;
}) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  async function submit() {
    if (!name.trim()) return setError("Pon tu nombre.");
    if (!file) return setError("Hazte (o sube) una foto de tu cara.");
    setLoading(true);
    setError(null);
    try {
      const m = await createMember({ userId, name: name.trim(), file });
      onDone(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el registro");
      setLoading(false);
    }
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
            marginBottom: 8,
          }}
        >
          Te unes a
        </div>
        <div style={{ font: "900 28px/1 Figtree", letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 30 }}>
          La cuadrilla
        </div>

        {/* Foto de cara */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={onPick}
          style={{ display: "none" }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: preview ? "none" : "2px dashed var(--accent-border)",
            background: preview ? "#ddd" : "var(--surface)",
            backgroundImage: preview ? `url(${preview})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: "var(--accent)",
            cursor: "pointer",
            boxShadow: preview ? "0 0 0 3px var(--accent)" : "none",
          }}
        >
          {!preview && (
            <>
              <Plus size={26} />
              <span style={{ font: "700 11.5px/1.2 Figtree", color: "var(--muted)", maxWidth: 90 }}>
                Foto de tu cara
              </span>
            </>
          )}
        </button>
        <div style={{ marginTop: 10, font: "500 11.5px/1.4 Figtree", color: "var(--faint)" }}>
          {preview ? "Toca para cambiarla" : "Cámara o galería · obligatoria"}
        </div>

        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            marginTop: 24,
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
          <div style={{ marginTop: 12, font: "600 12.5px/1.4 Figtree", color: "var(--accent)" }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 16,
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
          {loading ? "Entrando…" : "Entrar al grupo"}
        </button>
      </div>
    </div>
  );
}
