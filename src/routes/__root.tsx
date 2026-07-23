import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthMenu } from "@/components/auth-menu";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { CurrentUserProvider } from "@/hooks/use-current-user";
import { DealsProvider } from "@/hooks/use-deals";
import { ContactsProvider } from "@/hooks/use-contacts";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "Lovable" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Five Minute Forecast" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "google-site-verification", content: "vSmw7uZlWZ--_MwzJNIx-LXfjT0U4cSrb56vh_8z9oU" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicChromeless = pathname.startsWith("/auth");

  return (
    <QueryClientProvider client={queryClient}>
      <CurrentUserProvider>
        <ContactsProvider>
        <DealsProvider>
        {isPublicChromeless ? (
          <Outlet />
        ) : (
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <Separator orientation="vertical" className="h-6" />
                <div className="hidden sm:block">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    5Min Forecast
                  </p>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Sales workspace
                  </p>
                </div>
                <div className="flex-1" />
                <AuthMenu />
              </header>
              <Outlet />
            </SidebarInset>
          </SidebarProvider>
        )}
        </DealsProvider>
        </ContactsProvider>
        <Toaster />
      </CurrentUserProvider>
    </QueryClientProvider>
  );
}
