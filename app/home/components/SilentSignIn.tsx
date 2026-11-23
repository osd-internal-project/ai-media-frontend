"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";

const SSO_CHECKED_KEY = "aicave.ssoChecked";
const ROBOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

/**
 * Signs in a guest who already has an Aicave ID session from another AICave app.
 * Runs once per tab; Keycloak shows no page, and without a session the visitor
 * comes straight back to /home. Robots are never sent to Keycloak.
 */
export default function SilentSignIn() {
  useEffect(() => {
    if (navigator.webdriver || ROBOT.test(navigator.userAgent)) return;
    try {
      if (sessionStorage.getItem(SSO_CHECKED_KEY)) return;
    } catch (error) {
      // Without storage the check could not be remembered, so never start it.
      console.error("Silent sign-in skipped, storage unavailable:", error);
      return;
    }

    getSession()
      .then((session) => {
        if (session) return;
        sessionStorage.setItem(SSO_CHECKED_KEY, "1");
        window.location.replace("/login?silent=1&callbackUrl=/");
      })
      .catch((error) => console.error("Silent sign-in check failed:", error));
  }, []);

  return null;
}
