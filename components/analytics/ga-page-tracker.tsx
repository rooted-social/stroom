"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isGaEnabled, setGaUserId, trackPageView } from "@/lib/analytics/gtag";

export function GaPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEnabled = isGaEnabled();
  const trackedUrlRef = useRef<string>("");

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const query = searchParams.toString();
    const pathWithQuery = query ? `${pathname}?${query}` : pathname;
    return `${window.location.origin}${pathWithQuery}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isEnabled || !currentUrl || trackedUrlRef.current === currentUrl) {
      return;
    }

    trackedUrlRef.current = currentUrl;
    trackPageView(currentUrl);
  }, [currentUrl, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const supabase = createSupabaseBrowserClient();

    let isUnmounted = false;
    const syncUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (isUnmounted) {
        return;
      }
      setGaUserId(data.user?.id ?? null);
    };

    void syncUserId();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setGaUserId(session?.user?.id ?? null);
    });

    return () => {
      isUnmounted = true;
      authListener.subscription.unsubscribe();
    };
  }, [isEnabled]);

  return null;
}
