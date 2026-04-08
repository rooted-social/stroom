import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnvOrNull } from "@/lib/env";

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => name.includes("-auth-token"));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const env = getSupabaseEnvOrNull();
  if (!env) {
    return response;
  }
  const { url, anonKey } = env;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  if (!hasSupabaseAuthCookie(request)) {
    return response;
  }

  await supabase.auth.getUser();

  return response;
}
