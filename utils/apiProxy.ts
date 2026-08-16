import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────
// Server-only backend target. Deliberately NOT prefixed with NEXT_PUBLIC_ —
// this must never ship to the client bundle; the browser only ever talks
// to our own /api/* and /sanctum/csrf-cookie routes now. Falls back to the
// old NEXT_PUBLIC_API_URL (minus its /api suffix) so this doesn't hard-fail
// in an environment where only the old var has been set yet.
const BACKEND_ROOT = (
  process.env.API_PROXY_TARGET ||
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "")
).replace(/\/$/, "");

// Headers that must NOT be blindly forwarded from the upstream response:
// - content-encoding/content-length/transfer-encoding: the fetch() call
//   below already transparently decompresses the body, so re-forwarding
//   the original compression headers would make the browser try to
//   decode an already-decoded body and corrupt it.
// - connection/keep-alive: hop-by-hop, meaningless (and sometimes
//   disallowed) to set on a fetch Response in the edge/node runtime.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

/**
 * Strips the Domain= attribute from a Set-Cookie string so the cookie
 * always ends up host-only against whatever domain this proxy is running
 * on (sproutapp-eta.vercel.app / a preview URL / custom domain), rather
 * than whatever SESSION_DOMAIN the Laravel backend happens to be
 * configured with. A Domain that doesn't match this app's own host would
 * cause the browser to silently reject the cookie.
 */
function toHostOnlyCookie(setCookieValue: string): string {
  return setCookieValue.replace(/;\s*domain=[^;]*/i, "");
}

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string
): Promise<NextResponse> {
  if (!BACKEND_ROOT) {
    return NextResponse.json(
      { message: "API proxy misconfigured: API_PROXY_TARGET is not set." },
      { status: 500 }
    );
  }

  const search = request.nextUrl.search; // includes leading "?" or ""
  const targetUrl = `${BACKEND_ROOT}${backendPath}${search}`;

  const forwardHeaders = new Headers();
  const passthroughRequestHeaders = [
    "content-type",
    "accept",
    "authorization",
    "x-xsrf-token",
    "x-csrf-token",
    "x-requested-with",
  ];
  for (const name of passthroughRequestHeaders) {
    const value = request.headers.get(name);
    if (value) forwardHeaders.set(name, value);
  }
  // Forward the browser's own cookies (auth_token, user_role, is_authed,
  // XSRF-TOKEN, laravel_session, etc.) on to the real backend — this is a
  // server-to-server call, so domain scoping doesn't restrict us here the
  // way it does in browser JS.
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) forwardHeaders.set("cookie", cookieHeader);

  const hasBody = !["GET", "HEAD"].includes(request.method);

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Upstream API request failed (network error or timeout)." },
      { status: 502 }
    );
  }

  const responseBody = await backendResponse.arrayBuffer();
  const response = new NextResponse(responseBody, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });

  backendResponse.headers.forEach((value, key) => {
    if (STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return; // handled separately below
    response.headers.set(key, value);
  });

  // Response.headers.get("set-cookie") collapses multiple cookies into one
  // comma-joined string in most fetch implementations, which is not
  // parseable back into individual cookies — getSetCookie() (Node 18.17+/
  // undici) is the only reliable way to get each Set-Cookie separately.
  const rawSetCookies =
    typeof backendResponse.headers.getSetCookie === "function"
      ? backendResponse.headers.getSetCookie()
      : [];

  for (const cookie of rawSetCookies) {
    response.headers.append("set-cookie", toHostOnlyCookie(cookie));
  }

  return response;
}