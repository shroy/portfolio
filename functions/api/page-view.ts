// POST /api/page-view records a tagged page or contact-dialog view without visitor identifiers.
import { isAttribution } from "../../src/attribution";

type Env = {
  PORTFOLIO_DB: {
    prepare: (query: string) => { bind: (...values: string[]) => { run: () => Promise<unknown> } };
  };
};

const paths = new Set([
  "/", "/resume/", "/wistia/", "/unmute/", "/kickfirst/", "/provide/",
  "/roleprint/", "/agentic-engineering/", "/story/", "/contact/",
]);
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (request.headers.get("Origin") !== new URL(request.url).origin ||
      request.headers.get("Content-Type") !== "application/json") return new Response(null, { status: 400 });

  const text = await request.text();
  if (text.length > 1024) return new Response(null, { status: 400 });
  const body: unknown = (() => {
    try { return JSON.parse(text || "null"); }
    catch { return null; }
  })();
  if (!isAttribution(body) || !("path" in body) || typeof body.path !== "string" || !paths.has(body.path)) {
    return new Response(null, { status: 400 });
  }

  await env.PORTFOLIO_DB.prepare("INSERT INTO portfolio_views (company, role, path) VALUES (?, ?, ?)")
    .bind(body.company, body.role, body.path).run();
  return new Response(null, { status: 204 });
};
