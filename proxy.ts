import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/trades/:path*",
    "/reviews/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/api/reviews/daily",
    "/api/trades/images/:path*",
  ],
};
