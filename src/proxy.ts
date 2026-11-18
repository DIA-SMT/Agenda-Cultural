import { NextResponse, type NextRequest } from "next/server";
import {
  createSessionToken,
  needsRenewal,
  readSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionSecret,
} from "@/lib/auth/token";

// Primera barrera del panel: sólo mira que la cookie esté bien firmada y no haya vencido, sin ir a la base.
// La segunda barrera (cuenta activa, rol, sesiones cortadas) está en requireStaff(), en cada página y acción.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const payload = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value, sessionSecret());

  if (!payload && pathname !== "/admin/login") {
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.search = "";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  // Renovación deslizante: conserva `auth`, así cortar las sesiones también corta las renovadas.
  if (payload && needsRenewal(payload)) {
    response.cookies.set(SESSION_COOKIE, createSessionToken(payload.sub, sessionSecret(), payload.auth), sessionCookieOptions());
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
