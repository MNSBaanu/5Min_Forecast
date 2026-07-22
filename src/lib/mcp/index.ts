import { auth, defineMcp } from "@lovable.dev/mcp-js";

import echoTool from "./tools/echo";
import whoamiTool from "./tools/whoami";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud proxy.
// VITE_SUPABASE_PROJECT_ID is inlined at build time; the fallback keeps the
// issuer well-formed during the manifest-extract eval before the literal is set.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "5min-forecast-mcp",
  title: "5Min Forecast",
  version: "0.1.0",
  instructions:
    "Tools for 5Min Forecast, a lightweight sales CRM. Use `whoami` to confirm the signed-in user, and `echo` to verify connectivity.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [echoTool, whoamiTool],
});