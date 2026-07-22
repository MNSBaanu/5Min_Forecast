import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "rep" | "manager";

type CurrentUser = {
  name: string;
  role: Role;
  setRole: (role: Role) => void;
};

const CurrentUserContext = createContext<CurrentUser | null>(null);

const STORAGE_KEY = "fmf.role";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("rep");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "rep" || stored === "manager") setRoleState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setRole = (next: Role) => {
    setRoleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  return (
    <CurrentUserContext.Provider value={{ name: "Alex Morgan", role, setRole }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used inside CurrentUserProvider");
  return ctx;
}

export function roleLabel(role: Role) {
  return role === "manager" ? "Sales Manager" : "Sales Rep";
}