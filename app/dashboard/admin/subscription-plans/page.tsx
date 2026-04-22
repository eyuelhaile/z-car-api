'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminSubscriptionPlans,
  useUpdateAdminSubscriptionPlan,
} from '@/hooks/use-admin';
import type {
  AdminSubscriptionPlanSetting,
  AdminSubscriptionPlanUpdatePayload,
  SubscriptionPlan,
} from '@/types';

function pickPayload(p: AdminSubscriptionPlanSetting): AdminSubscriptionPlanUpdatePayload {
  return {
    displayName: p.displayName,
    monthlyPrice: p.monthlyPrice,
    yearlyPrice: p.yearlyPrice,
    yearlyDiscount: p.yearlyDiscount,
    maxListings: p.maxListings,
    featuredListings: p.featuredListings,
    photoLimit: p.photoLimit,
    videoLimit: p.videoLimit,
    analyticsAccess: p.analyticsAccess,
    premiumSupport: p.premiumSupport,
    listingOveragePrice: p.listingOveragePrice,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
  };
}

function PlanEditor({
  plan,
  onSave,
  isSaving,
}: {
  plan: AdminSubscriptionPlanSetting;
  onSave: (planName: SubscriptionPlan, data: AdminSubscriptionPlanUpdatePayload) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<AdminSubscriptionPlanUpdatePayload>(() => pickPayload(plan));

  useEffect(() => {
    setForm(pickPayload(plan));
  }, [plan]);

  const set =
    <K extends keyof AdminSubscriptionPlanUpdatePayload>(key: K) =>
    (value: AdminSubscriptionPlanUpdatePayload[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {plan.planName}
        </CardTitle>
        <CardDescription>
          UUID <code className="text-xs">{plan.id}</code> — used as Chapa / payment plan id
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`${plan.planName}-display`}>Display name</Label>
          <Input
            id={`${plan.planName}-display`}
            value={form.displayName}
            onChange={(e) => set('displayName')(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-monthly`}>Monthly price (ETB)</Label>
          <Input
            id={`${plan.planName}-monthly`}
            type="number"
            min={0}
            step={1}
            value={form.monthlyPrice}
            onChange={(e) => set('monthlyPrice')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-yearly`}>Yearly price (ETB)</Label>
          <Input
            id={`${plan.planName}-yearly`}
            type="number"
            min={0}
            step={1}
            value={form.yearlyPrice}
            onChange={(e) => set('yearlyPrice')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-discount`}>Yearly discount (%)</Label>
          <Input
            id={`${plan.planName}-discount`}
            type="number"
            min={0}
            max={100}
            step={1}
            value={form.yearlyDiscount}
            onChange={(e) => set('yearlyDiscount')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-overage`}>Pay-as-you-go / extra listing (ETB)</Label>
          <Input
            id={`${plan.planName}-overage`}
            type="number"
            min={0}
            step={1}
            value={form.listingOveragePrice}
            onChange={(e) => set('listingOveragePrice')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-max`}>Max listings (-1 = unlimited)</Label>
          <Input
            id={`${plan.planName}-max`}
            type="number"
            step={1}
            value={form.maxListings}
            onChange={(e) => set('maxListings')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-feat`}>Featured listings cap</Label>
          <Input
            id={`${plan.planName}-feat`}
            type="number"
            min={0}
            step={1}
            value={form.featuredListings}
            onChange={(e) => set('featuredListings')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-photos`}>Photos per listing</Label>
          <Input
            id={`${plan.planName}-photos`}
            type="number"
            min={1}
            step={1}
            value={form.photoLimit}
            onChange={(e) => set('photoLimit')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-videos`}>Videos per listing</Label>
          <Input
            id={`${plan.planName}-videos`}
            type="number"
            min={0}
            step={1}
            value={form.videoLimit}
            onChange={(e) => set('videoLimit')(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${plan.planName}-sort`}>Sort order</Label>
          <Input
            id={`${plan.planName}-sort`}
            type="number"
            step={1}
            value={form.sortOrder}
            onChange={(e) => set('sortOrder')(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
          <div>
            <Label htmlFor={`${plan.planName}-active`}>Active (visible on public plans API)</Label>
            <p className="text-xs text-muted-foreground">Inactive plans stay in DB but are hidden from sellers.</p>
          </div>
          <Switch
            id={`${plan.planName}-active`}
            checked={form.isActive}
            onCheckedChange={(v) => set('isActive')(v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor={`${plan.planName}-analytics`}>Analytics access</Label>
          <Switch
            id={`${plan.planName}-analytics`}
            checked={form.analyticsAccess}
            onCheckedChange={(v) => set('analyticsAccess')(v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor={`${plan.planName}-premium`}>Premium support</Label>
          <Switch
            id={`${plan.planName}-premium`}
            checked={form.premiumSupport}
            onCheckedChange={(v) => set('premiumSupport')(v)}
          />
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(plan.planName, form)}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save plan'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSubscriptionPlansPage() {
  const { data: plans, isLoading } = useAdminSubscriptionPlans();
  const updateMutation = useUpdateAdminSubscriptionPlan();

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription plans</h1>
        <p className="text-muted-foreground mt-1">
          Configure plan names, pricing, listing quotas, media limits, and pay-as-you-go listing fees. Changes apply
          immediately to new checkouts and listing creation.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && (!plans || plans.length === 0) && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No plan settings found. Run database migrations on the API so <code>subscription_plan_settings</code> is
            created and seeded.
          </CardContent>
        </Card>
      )}

      {!isLoading &&
        plans?.map((plan) => (
          <PlanEditor
            key={plan.id}
            plan={plan}
            isSaving={updateMutation.isPending}
            onSave={(planName, data) => updateMutation.mutate({ planName, data })}
          />
        ))}
    </div>
  );
}
