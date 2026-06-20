"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getMemberByAuthId } from "@/lib/auth";
import type { Member } from "@/lib/data";
import Login from "@/components/Login";
import Register from "@/components/Register";
import PlanApp from "@/components/PlanApp";

type Phase = "loading" | "login" | "register" | "app";

function Splash() {
  return (
    <div className="app-shell">
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: "900 26px/1 Figtree",
          letterSpacing: "-0.02em",
          color: "var(--text)",
        }}
      >
        La cuadrilla
      </div>
    </div>
  );
}

export default function AppRoot() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    if (!supabase) {
      setPhase("login");
      return;
    }
    let alive = true;

    async function resolve(session: Session | null) {
      if (!session?.user) {
        if (!alive) return;
        setUserId(null);
        setMember(null);
        setPhase("login");
        return;
      }
      setUserId(session.user.id);
      try {
        const m = await getMemberByAuthId(session.user.id);
        if (!alive) return;
        if (m) {
          setMember(m);
          setPhase("app");
        } else {
          setPhase("register");
        }
      } catch {
        if (alive) setPhase("register");
      }
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => resolve(session));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (phase === "loading") return <Splash />;
  if (phase === "login") return <Login />;
  if (phase === "register" && userId)
    return (
      <Register
        userId={userId}
        onDone={(m) => {
          setMember(m);
          setPhase("app");
        }}
      />
    );
  if (phase === "app" && member)
    return (
      <PlanApp
        currentMember={member}
        onLogout={async () => {
          await supabase?.auth.signOut();
          setMember(null);
          setPhase("login");
        }}
      />
    );
  return <Splash />;
}
