import Link from "next/link";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import Image from "next/image";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      <div className="blue-spotlight-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(58,123,191,0.14),transparent_52%)]" />
      <div className="relative z-10 liquid-glass w-full max-w-md rounded-3xl border border-white/10 bg-background/55 p-8 shadow-[0_18px_70px_-40px_rgba(110,169,221,0.55)]">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/images/logo_black.png"
            alt="Stroom 로고"
            width={220}
            height={64}
            className="h-10 w-auto dark:hidden sm:h-11"
            priority
          />
          <Image
            src="/images/logo.png"
            alt="Stroom 로고"
            width={220}
            height={64}
            className="hidden h-10 w-auto dark:block sm:h-11"
            priority
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
