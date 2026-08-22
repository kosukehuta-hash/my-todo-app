"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthForm } from "@/components/auth-form";
import { TodoApp } from "@/components/todo-app";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-10">
      {!ready ? (
        <p className="text-sm text-slate-500">読み込み中...</p>
      ) : session ? (
        <TodoApp user={session.user} />
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
