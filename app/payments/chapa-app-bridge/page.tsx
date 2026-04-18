'use client';

/**
 * Mobile Chapa flow only: Chapa return_url points here (https). This page immediately
 * redirects to the native app scheme so WebBrowser.openAuthSessionAsync can close and
 * return control to JS — the full Next.js /payments/success page must not be the Chapa return_url for the app.
 *
 * Must match Expo `Linking.createURL('…/chapa-return')`: `zcar:/path` (one slash after the colon),
 * not `zcar://path` — the latter parses `path` as host and breaks Android auth-session prefix matching.
 */
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function buildAppDeepLink(scheme: string, pathNoLeadingSlash: string, query: string) {
  const p = pathNoLeadingSlash.replace(/^\//, '');
  return `${scheme}:/${p}${query ? `?${query}` : ''}`;
}

function BridgeRedirect() {
  const searchParams = useSearchParams();
  const [showManual, setShowManual] = useState(false);

  const target = useMemo(() => {
    const scheme = process.env.NEXT_PUBLIC_EXPO_APP_SCHEME || 'zcar';
    const path = (
      process.env.NEXT_PUBLIC_EXPO_CHAPA_RETURN_PATH || 'dashboard/payments/chapa-return'
    ).replace(/^\//, '');
    return buildAppDeepLink(scheme, path, searchParams.toString());
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
