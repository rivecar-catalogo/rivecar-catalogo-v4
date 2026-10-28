"use client";
import posthog from "posthog-js";

let ready = false;

export function initAnalytics() {
  if (ready || typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "localStorage",
  });
  ready = true;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!ready) return;
  posthog.capture(event, props);
}
