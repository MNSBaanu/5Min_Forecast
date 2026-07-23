import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "sales_rep" | "sales_manager";

type CurrentUser = {
  userId: string | null;
  email: string | null;
  name: string;
  role: Role | null;
  loading: boolean;
  isManager: boolean;
  isAuthenticated: boolean;
};

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function roleLabel(role: Role | null | undefined) {
  return role === "sales_manager" ? "Sales Manager" : "Sales Rep";
}

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (uid: string | null, mail: string | null) => {
    setUserId(uid);
    setEmail(mail);
    if (!uid) {
      setName("");
      setRole(null);
      setLoading(false);
      return;
    }
    const [{ data: profile }, { data: roleRows }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setName(profile?.full_name || profile?.email || mail || "Team member");
    const roles = (roleRows ?? []).map((r) => r.role as Role);
    setRole(roles.includes("sales_manager") ? "sales_manager" : "sales_rep");
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      void hydrate(data.user?.id ?? null, data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      void hydrate(session?.user?.id ?? null, session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const value = useMemo<CurrentUser>(
    () => ({
      userId,
      email,
      name,
      role,
      loading,
      isManager: role === "sales_manager",
      isAuthenticated: !!userId,
    }),
    [userId, email, name, role, loading],
  );

  return (
    <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside CurrentUserProvider");
  return ctx;
}