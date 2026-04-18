'use client';

/**
 * Mobile Chapa flow only: Chapa return_url points here (https). This page immediately
 * redirects to the native app scheme so WebBrowser.openAuthSessionAsync can close and
 * return control to JS — the full Next.js /payments/success page must not be the Chapa return_url for the app.
 */
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function BridgeRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const scheme = process.env.NEXT_PUBLIC_EXPO_APP_SCHEME || 'zcar';
    const path = (
      process.env.NEXT_PUBLIC_EXPO_CHAPA_RETURN_PATH || 'dashboard/payments/chapa-return'
    ).replace(/^\//, '');
    const q = searchParams.toString();
    const target = `${scheme}://${path}${q ? `?${q}` : ''}`;
    window.location.replace(target);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <p className="text-gray-600 text-center text-base">Opening the app…</p>
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
