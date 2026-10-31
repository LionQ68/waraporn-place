import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null);
      return undefined;
    }

    let cancelled = false;
    supabase
      .from("profiles")
      .select("user_id, full_name, role, is_active")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data || null);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    loading,
    configured: isSupabaseConfigured,
    async signIn(email, password) {
      if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signUp(email, password, fullName) {
      if (!supabase) throw new Error("ยังไม่ได้ตั้งค่า Supabase");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      return data;
    },
    async signOut() {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [session, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth ต้องใช้งานภายใน AuthProvider");
  return context;
}
