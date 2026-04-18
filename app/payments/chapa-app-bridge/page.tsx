'use client';

/**
 * Mobile Chapa flow only: Chapa return_url points here (https). This page immediately
 * redirects to the in-app session return URL so WebBrowser.openAuthSessionAsync closes.
 *
 * The app passes `app_session_return` on the bridge URL — the exact string from
 * `Linking.createURL('dashboard/payments/chapa-return')` (Expo Go: `exp://...`, dev client: `zcar:/...`).
 * Without it, we would guess the scheme from env and Expo Go users get an app chooser for `zcar:`.
 *
 * Fallback: `NEXT_PUBLIC_EXPO_APP_SCHEME` + path (production builds without the param).
 */
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function buildAppDeepLinkFallback(scheme: string, pathNoLeadingSlash: string, query: string) {
  const p = pathNoLeadingSlash.replace(/^\//, '');
  return `${scheme}:/${p}${query ? `?${query}` : ''}`;
}

/** Merge Chapa/query params onto the deep-link base from the app (must match openAuthSessionAsync). */
function buildRedirectTarget(
  searchParams: URLSearchParams,
  fallbackScheme: string,
  fallbackPath: string
): string {
  const appReturn = searchParams.get('app_session_return');
  const passthrough = new URLSearchParams(searchParams.toString());
  passthrough.delete('app_session_return');

  const tail = passthrough.toString();

  if (appReturn && appReturn.trim()) {
    const base = appReturn.trim();
    if (!tail) return base;
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}${tail}`;
  }

  return buildAppDeepLinkFallback(fallbackScheme, fallbackPath, tail);
}

function BridgeRedirect() {
  const searchParams = useSearchParams();
  const [showManual, setShowManual] = useState(false);

  const target = useMemo(() => {
    const scheme = process.env.NEXT_PUBLIC_EXPO_APP_SCHEME || 'zcar';
    const path = (
      process.env.NEXT_PUBLIC_EXPO_CHAPA_RETURN_PATH || 'dashboard/payments/chapa-return'
    ).replace(/^\//, '');
    return buildRedirectTarget(
      new URLSearchParams(searchParams.toString()),
      scheme,
      path
    );
  }, [searchParams]);

  useEffect(() => {
    window.location.replace(target);
    const t = window.setTimeout(() => setShowManual(true), 2500);
    return () => window.clearTimeout(t);
  }, [target]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 gap-4">
      <p className="text-gray-600 text-center text-base">Opening the app…</p>
      {showManual ? (
        <a
          href={target}
          className="text-blue-600 underline text-center text-base"
        >
          Tap here to open the app
        </a>
      ) : null}
    </div>
  );
}

export default function ChapaAppBridgePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <p className="text-gray-600">Loading…</p>
        </div>
      }
    >
      <BridgeRedirect />
    </Suspense>
  );
}
