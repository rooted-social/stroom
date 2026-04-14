"use client";

import { useEffect, useRef } from "react";

import { trackEvent } from "@/lib/analytics/gtag";

type GaEventName = "sign_up" | "login" | "view_dashboard";

type GaEventOnMountProps = {
  eventName: GaEventName;
  enabled?: boolean;
  queryParamToRemove?: string;
};

export function GaEventOnMount({ eventName, enabled = true, queryParamToRemove }: GaEventOnMountProps) {
  const isTrackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || isTrackedRef.current) {
      return;
    }

    isTrackedRef.current = true;
    trackEvent(eventName);

    if (!queryParamToRemove) {
      return;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has(queryParamToRemove)) {
      return;
    }

    url.searchParams.delete(queryParamToRemove);
    const nextPath = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextPath);
  }, [enabled, eventName, queryParamToRemove]);

  return null;
}
