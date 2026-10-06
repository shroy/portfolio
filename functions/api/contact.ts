// POST /api/contact, a Cloudflare Pages Function: the contact form's endpoint. It checks the
// fields, drops honeypot hits, and emails Josh through Resend, so no address is in any page.
// The page's script (Accept: application/json) gets a status alone; a plain form post (no
// JavaScript) gets /contact back with its Sent or Couldn't-send state rendered in.

type Env = {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  ASSETS: { fetch: (url: URL) => Promise<Response> };
};

// The Workers runtime's streaming HTML rewriter: only what's used here.
type Rewriter = {
  on: (selector: string, handlers: { element: (element: RewrittenElement) => void }) => Rewriter;
  transform: (response: Response) => Response;
};
type RewrittenElement = { setAttribute: (name: string, value: string) => void; setInnerContent: (content: string) => void };
declare const HTMLRewriter: new () => Rewriter;

const read = (form: FormData) => {
  const text = (key: string) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  return { name: text("name"), email: text("email"), message: text("message"), company: text("company") };
};

type Fields = ReturnType<typeof read>;

// The same constraints as the form's markup.
const valid = ({ name, email, message }: Fields) =>
  name.length > 0 &&
  name.length <= 100 &&
  email.length <= 254 &&
  /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
  message.length > 0 &&
  message.length <= 5000;

const send = (env: Env, { name, email, message }: Fields) =>
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      reply_to: email,
      subject: `Portfolio: ${name}`,
      text: `${message}\n\n${name} <${email}>`,
    }),
  }).then(
    (response) => response.ok,
    () => false,
  );

const statuses = { sent: 204, invalid: 400, failed: 502 } as const;

// /contact with the outcome rendered in: the thanks by first name, or the fields as typed.
const render = async (request: Request, env: Env, state: "sent" | "failed", fields: Fields) =>
  new HTMLRewriter()
    .on(".Contact", { element: (element) => element.setAttribute("data-state", state) })
    .on("[contact-name]", { element: (element) => element.setInnerContent(fields.name.split(/\s+/)[0] ?? "") })
    .on("#contact-name", { element: (element) => element.setAttribute("value", fields.name) })
    .on("#contact-email", { element: (element) => element.setAttribute("value", fields.email) })
    .on("#contact-message", { element: (element) => element.setInnerContent(fields.message) })
    .transform(await env.ASSETS.fetch(new URL("/contact/", request.url)));

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const fields = read(await request.formData().catch(() => new FormData()));
  const outcome = fields.company ? "sent" : !valid(fields) ? "invalid" : (await send(env, fields)) ? "sent" : "failed";
  return request.headers.get("Accept") === "application/json"
    ? new Response(null, { status: statuses[outcome] })
    : render(request, env, outcome === "sent" ? "sent" : "failed", fields);
};
