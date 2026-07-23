import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Kanban, Settings, Upload, Users } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import logoAsset from "@/assets/logo.png.asset.json";


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Pipeline", url: "/", icon: Kanban },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "CSV Import", url: "/import", icon: Upload },
  { title: "Manager Settings", url: "/settings", icon: Settings, managerOnly: true },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { isManager } = useCurrentUser();
  const visible = items.filter((i) => !("managerOnly" in i && i.managerOnly) || isManager);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <div className="flex items-center gap-3 px-2 py-3">
          <img
            src={logoAsset.url}
            alt="5Min Forecast"
            className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-glow"
          />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight text-sidebar-foreground">
                5Min Forecast
              </span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/60">
                CRM
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => {
                const active =
                  item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="group/nav h-10 rounded-lg font-medium data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:shadow-sm"
                    >
                      <Link to={item.url} className="relative flex items-center gap-3">
                        {active && (
                          <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-sidebar-primary" />
                        )}
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}