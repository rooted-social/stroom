declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

type GaEventParams = Record<string, string | number | boolean | undefined>;

export function getGaMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

export function isGaEnabled() {
  return getGaMeasurementId().length > 0;
}

function sendGtagCommand(...args: unknown[]) {
  if (!isGaEnabled()) {
    return;
  }

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag(...args);
}

export function setGaUserId(userId: string | null) {
  const measurementId = getGaMeasurementId();
  if (!measurementId) {
    return;
  }

  // user_id는 내부 식별자만 사용하고, 로그아웃 시 null로 초기화한다.
  sendGtagCommand("config", measurementId, {
    user_id: userId ?? undefined,
  });
}

export function trackPageView(url: string) {
  sendGtagCommand("event", "page_view", {
    page_location: url,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function trackEvent(name: "sign_up" | "login" | "view_dashboard", params?: GaEventParams) {
  sendGtagCommand("event", name, params ?? {});
}
