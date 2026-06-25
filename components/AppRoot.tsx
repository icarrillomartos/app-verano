"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMemberByAuthId } from "@/lib/auth";
import type { Member } from "@/lib/data";
import Auth from "@/components/Auth";
import PlanApp from "@/components/PlanApp";

type Phase = "loading" | "auth" | "app";

function Splash() {
  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: "900 24px/1.1 Figtree",
          letterSpacing: "-0.02em",
          color: "var(--text)",
          textAlign: "center",
          padding: "0 30px",
        }}
      >
        SOMos los que veranean
      </div>
    </div>
  );
}

export default function AppRoot() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!supabase) {
      setPhase("auth");
      return;
    }
    let alive = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      if (!user) {
        setPhase("auth");
        return;
      }
      try {
        const m = await getMemberByAuthId(user.id);
        if (!alive) return;
        if (m) {
          setMember(m);
          setPhase("app");
        } else {
          // sesión sin perfil: cerrar y volver al acceso
          await supabase!.auth.signOut();
          setPhase("auth");
        }
      } catch {
        if (alive) setPhase("auth");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setMember(null);
        setPhase("auth");
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (phase === "loading") return <Splash />;
  if (phase === "auth")
    return (
      <Auth
        onAuthed={(m) => {
          setMember(m);
          setPhase("app");
        }}
      />
    );
  if (phase === "app" && member)
    return <PlanApp currentMember={member} onLogout={() => supabase?.auth.signOut()} />;
  return <Splash />;
}
