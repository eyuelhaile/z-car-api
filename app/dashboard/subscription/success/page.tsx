'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import api from '@/lib/api';
import { dashboardKeys } from '@/hooks/use-dashboard';

function SubscriptionPaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyNote, setVerifyNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const txFromUrl = searchParams?.get('tx_ref') || searchParams?.get('trx_ref');
      const txFromStorage =
        typeof window !== 'undefined' ? sessionStorage.getItem('chapa_sub_tx_ref') : null;
      const txRef = txFromUrl || txFromStorage;

      if (txRef) {
        try {
          await api.verifyChapaPayment(txRef);
        } catch {
          setVerifyNote(
            'If your plan does not update in a moment, open Subscription again — payment may already be processing.'
          );
        }
      }

      await queryClient.invalidateQueries({ queryKey: dashboardKeys.mySubscription() });
      await queryClient.invalidateQueries({ queryKey: dashboardKeys.analytics() });

      if (!cancelled) {
        setIsVerifying(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [queryClient, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isVerifying ? (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Confirming subscription…</CardTitle>
              <CardDescription>Syncing your plan with your account</CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Payment successful
              </CardTitle>
              <CardDescription className="text-base">
                Thank you! Your subscription payment was received. Your new plan limits should apply
                shortly.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerifying && verifyNote && (
            <p className="text-sm text-muted-foreground text-center">{verifyNote}</p>
          )}
          {!isVerifying && (
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard/subscription">
                  Back to subscription
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
                Go to dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SubscriptionPaymentSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Confirming subscription…</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function SubscriptionPaymentSuccessPage() {
  return (
    <Suspense fallback={<SubscriptionPaymentSuccessFallback />}>
      <SubscriptionPaymentSuccessContent />
    </Suspense>
  );
}
