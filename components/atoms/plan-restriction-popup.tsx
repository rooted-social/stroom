"use client";

import { useEffect, useRef } from "react";

type PlanRestrictionPopupProps = {
  message: string | null;
};

export function PlanRestrictionPopup({ message }: PlanRestrictionPopupProps) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (!message || shownRef.current) {
      return;
    }

    shownRef.current = true;
    window.alert(message);

    const url = new URL(window.location.href);
    if (!url.searchParams.has("error")) {
      return;
    }

    url.searchParams.delete("error");
    const nextPath = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextPath);
  }, [message]);

  return null;
}
