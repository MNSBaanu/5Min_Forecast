import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { roleLabel, useCurrentUser } from "@/hooks/use-current-user";

export function AuthMenu() {
  const { isAuthenticated, loading, name, email, role } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  const initials = (name || email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{roleLabel(role)}</span>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex">
            {role === "sales_manager" ? "Manager" : "Rep"}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{name}</span>
          {email && <span className="text-xs font-normal text-muted-foreground">{email}</span>}
          <span className="text-xs font-normal text-muted-foreground">{roleLabel(role)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}