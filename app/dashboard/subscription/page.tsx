'use client';

import { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Star,
  Crown,
  Loader2,
  Calendar,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  useSubscriptionPlans,
  useMySubscription,
  useSubscribe,
  useSoretiPaymentServices,
  useInitializeChapaSubscriptionPayment,
  createSoretiOrder,
} from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const planIcons: Record<string, React.ReactNode> = {
  basic: <Zap className="h-6 w-6" />,
  standard: <Star className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
};

const planColors: Record<string, string> = {
  basic: 'from-gray-500 to-gray-600',
  standard: 'from-blue-500 to-blue-600',
  premium: 'from-amber-500 to-orange-600',
};

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  // Holds selected external payment service ID from Soreti
  const [paymentMethod, setPaymentMethod] = useState('');
  /** Primary: Chapa (same as listing payment). Secondary: Telebirr / Soreti. */
  const [paymentChannel, setPaymentChannel] = useState<'chapa' | 'telebirr'>('chapa');
  const [otherPaymentOpen, setOtherPaymentOpen] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: plans, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: subscription, isLoading: isLoadingSub } = useMySubscription();
  const subscribeMutation = useSubscribe();
  const chapaSubscriptionMutation = useInitializeChapaSubscriptionPayment();
  const { data: paymentServices, isLoading: isLoadingPaymentServices } = useSoretiPaymentServices();
  const { user } = useAuth();

  const isLoading = isLoadingPlans || isLoadingSub;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    const plan = (plans || []).find((p: any) => p.plan === selectedPlan);
    if (!plan) return;

    const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;

    // Free plans go through the existing subscribe API without external payment
    if (price <= 0) {
      subscribeMutation.mutate(
        {
          planName: selectedPlan,
          billingPeriod,
          paymentMethod: 'free',
          autoRenew,
        },
        {
          onSuccess: () => {
            setIsUpgradeDialogOpen(false);
          },
        }
      );
      return;
    }

    if (!user?.id) {
      toast.error('Please sign in to subscribe');
      return;
    }

    // Primary: Chapa (creates Transaction on server, same flow as listing over-quota)
    if (paymentChannel === 'chapa') {
      if (!user.email) {
        toast.error('Your account needs an email address to pay with Chapa.');
        return;
      }
      setIsProcessingPayment(true);
      try {
        const returnUrl = `${window.location.origin}/dashboard/subscription/success`;
        const result = await chapaSubscriptionMutation.mutateAsync({
          planId: plan.id,
          billingCycle: billingPeriod,
          amount: price,
          returnUrl,
        });
        if (result?.tx_ref && typeof window !== 'undefined') {
          sessionStorage.setItem('chapa_sub_tx_ref', result.tx_ref);
        }
        if (result?.checkout_url) {
          window.location.href = result.checkout_url;
        } else {
          setIsProcessingPayment(false);
          toast.error('No checkout URL returned. Please try again.');
        }
      } catch {
        setIsProcessingPayment(false);
      }
      return;
    }

    // Other option: Telebirr / Soreti (existing Cheche flow — unchanged)
    if (!user.phone) {
      toast.error('Add a phone number to your profile to use Telebirr / mobile money.');
      return;
    }

    if (!paymentMethod) {
      toast.error('Select a payment option under “Other payment options”.');
      return;
    }

    const rawPhone = user.phone || '';
    const phoneNumber = rawPhone.startsWith('+') ? rawPhone.slice(1) : rawPhone;

    setIsProcessingPayment(true);
    try {
      const url = await createSoretiOrder({
        title: `Subscription - ${plan.plan} (${billingPeriod})`,
        amount: price,
        userId: user.id,
        phoneNumber,
        paymentServiceId: paymentMethod,
        transactionId: plan.id,
      });

      if (url) {
        window.location.href = url;
      } else {
        setIsProcessingPayment(false);
      }
    } catch {
      setIsProcessingPayment(false);
    }
  };

  const daysUntilExpiry = subscription?.currentPeriodEnd
    ? differenceInDays(new Date(subscription.currentPeriodEnd), new Date())
    : 0;

  // Some API responses use `planName` or may temporarily return undefined `plan`
  const subscriptionPlanKey =
    (subscription?.plan as any) ||
    (subscription as any)?.planName ||
    'basic';

  const subscriptionPlanLabel =
    typeof subscriptionPlanKey === 'string'
      ? `${subscriptionPlanKey.charAt(0).toUpperCase()}${subscriptionPlanKey.slice(1)}`
      : 'Subscription';

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {planIcons[subscriptionPlanKey] || <Zap className="h-5 w-5" />}
                  {subscriptionPlanLabel} Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription
                </CardDescription>
              </div>
              <Badge
                className={cn(
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                )}
              >
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage */}
            {subscription.usage && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Listings Used</span>
                    <span className="text-sm text-muted-foreground">
                      {subscription.usage.listingsUsed} / {subscription.usage.listingsLimit === -1 ? '∞' : subscription.usage.listingsLimit}
                    </span>
                  </div>
                  <Progress
                    value={
                      subscription.usage.listingsLimit === -1
                        ? 0
                        : (subscription.usage.listingsUsed / subscription.usage.listingsLimit) * 100
                    }
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Featured Listings</span>
                    <span className="text-sm text-muted-foreground">
                      {subscription.usage.featuredUsed} / {subscription.usage.featuredLimit}
                    </span>
                  </div>
                  <Progress
                    value={(subscription.usage.featuredUsed / subscription.usage.featuredLimit) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            )}

            {/* Billing Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {subscription.currentPeriodEnd
                    ? `Renews ${format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}`
                    : 'No renewal date'}
                </span>
              </div>
              {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                </Badge>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  id="auto-renew"
                  checked={subscription.autoRenew}
                  disabled
                />
                <Label htmlFor="auto-renew" className="text-sm">
                  Auto-renew
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {subscription ? 'Upgrade Your Plan' : 'Choose a Plan'}
        </h2>
        
        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('monthly')}
            className={billingPeriod === 'monthly' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Monthly
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
            onClick={() => setBillingPeriod('yearly')}
            className={billingPeriod === 'yearly' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Yearly
            {billingPeriod === 'yearly' && plans && plans.length > 0 && plans[0]?.yearlyDiscount > 0 && (
              <Badge className="ml-2 bg-green-500">Save {plans[0].yearlyDiscount}%</Badge>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(plans || []).map((plan: any) => {
            const isCurrentPlan = subscription?.plan === plan.plan;
            const isPopular = plan.plan === 'standard';
            const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const displayName =
              plan.displayName ||
              plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1);
            const limits = plan.limits || {};
            const overage =
              typeof plan.listingOveragePrice === 'number' ? plan.listingOveragePrice : 0;

            // Convert limits to features list
            const features = [
              `${limits.maxListings === -1 ? 'Unlimited' : limits.maxListings} listings`,
              `${limits.featuredListings} featured listing${limits.featuredListings !== 1 ? 's' : ''}`,
              `${limits.photoLimit} photos per listing`,
              limits.videoLimit > 0 && `${limits.videoLimit} video${limits.videoLimit !== 1 ? 's' : ''} per listing`,
              limits.analyticsAccess && 'Analytics access',
              limits.premiumSupport && 'Premium support',
              overage > 0 &&
                limits.maxListings !== -1 &&
                `Pay as you go: ${formatPrice(overage)} per extra listing`,
            ].filter(Boolean);

            return (
              <Card
                key={plan.plan}
                className={cn(
                  'relative overflow-hidden transition-all',
                  isPopular && 'border-amber-500 shadow-lg',
                  selectedPlan === plan.plan && 'ring-2 ring-amber-500'
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br mb-4',
                      planColors[plan.plan] || 'from-gray-500 to-gray-600'
                    )}
                  >
                    {planIcons[plan.plan] || <Zap className="h-6 w-6" />}
                  </div>
                  <CardTitle>{displayName}</CardTitle>
                  <CardDescription>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-foreground">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      )}
                    </div>
                    {billingPeriod === 'yearly' && plan.yearlyDiscount > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(plan.monthlyPrice * 12)}
                        </span>
                        <span className="text-xs text-green-600 ml-2">
                          Save {plan.yearlyDiscount}%
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Dialog
                      open={isUpgradeDialogOpen && selectedPlan === plan.plan}
                      onOpenChange={(open) => {
                        setIsUpgradeDialogOpen(open);
                        if (!open) {
                          setPaymentChannel('chapa');
                          setPaymentMethod('');
                          setOtherPaymentOpen(false);
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className={cn(
                            'w-full',
                            isPopular
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : ''
                          )}
                          onClick={() => {
                            setSelectedPlan(plan.plan);
                            setPaymentChannel('chapa');
                          }}
                        >
                          {subscription?.plan === 'basic' && plan.plan !== 'basic'
                            ? 'Upgrade'
                            : price === 0
                            ? 'Get Started'
                            : 'Subscribe'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Subscribe to {displayName}
                          </DialogTitle>
                          <DialogDescription>
                            {price === 0
                              ? 'Start with our free plan'
                              : `You will be charged ${formatPrice(price)} ${billingPeriod === 'monthly' ? 'monthly' : 'yearly'}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {price > 0 && (
                            <>
                              <RadioGroup
                                value={paymentChannel}
                                onValueChange={(v) => {
                                  const next = v as 'chapa' | 'telebirr';
                                  setPaymentChannel(next);
                                  if (next === 'telebirr') {
                                    setOtherPaymentOpen(true);
                                  }
                                }}
                                className="space-y-3"
                              >
                                <div
                                  className={cn(
                                    'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                                    paymentChannel === 'chapa'
                                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20'
                                      : 'border-border'
                                  )}
                                  onClick={() => setPaymentChannel('chapa')}
                                >
                                  <RadioGroupItem value="chapa" id={`chapa-${plan.plan}`} className="mt-1" />
                                  <div className="flex-1">
                                    <Label htmlFor={`chapa-${plan.plan}`} className="cursor-pointer font-semibold">
                                      Pay with Chapa
                                    </Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Recommended — secure checkout (cards &amp; mobile wallets). Same flow as listing
                                      payments.
                                    </p>
                                  </div>
                                </div>

                                <Collapsible open={otherPaymentOpen} onOpenChange={setOtherPaymentOpen}>
                                  <CollapsibleTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="w-full justify-between px-0 text-muted-foreground hover:text-foreground"
                                    >
                                      <span>Other payment options</span>
                                      <ChevronDown
                                        className={cn(
                                          'h-4 w-4 shrink-0 transition-transform',
                                          otherPaymentOpen && 'rotate-180'
                                        )}
                                      />
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="space-y-3 pt-2">
                                    <div
                                      className={cn(
                                        'flex items-start gap-3 rounded-lg border p-4 cursor-pointer',
                                        paymentChannel === 'telebirr'
                                          ? 'border-muted-foreground/40 bg-muted/30'
                                          : 'border-border'
                                      )}
                                      onClick={() => {
                                        setPaymentChannel('telebirr');
                                        setOtherPaymentOpen(true);
                                      }}
                                    >
                                      <RadioGroupItem value="telebirr" id={`telebirr-${plan.plan}`} className="mt-1" />
                                      <div className="flex-1 space-y-2">
                                        <Label htmlFor={`telebirr-${plan.plan}`} className="cursor-pointer font-medium">
                                          Telebirr / mobile money (Soreti)
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                          Pay through your existing Telebirr / Cheche mobile flow (unchanged).
                                        </p>
                                        {paymentChannel === 'telebirr' && (
                                          <div className="space-y-2 pt-2">
                                            <Label className="text-xs uppercase text-muted-foreground">
                                              Service
                                            </Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                              <SelectTrigger>
                                                <SelectValue
                                                  placeholder={
                                                    isLoadingPaymentServices ? 'Loading...' : 'Select payment method'
                                                  }
                                                />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {(paymentServices || []).map((service) => (
                                                  <SelectItem key={service.id} value={service.id}>
                                                    {service.name || service.vendor_type || 'Payment Option'}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </RadioGroup>

                              <div className="flex items-center justify-between">
                                <Label htmlFor="auto-renew-dialog">Auto-renew subscription</Label>
                                <Switch
                                  id="auto-renew-dialog"
                                  checked={autoRenew}
                                  onCheckedChange={setAutoRenew}
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubscribe}
                            disabled={
                              subscribeMutation.isPending ||
                              isProcessingPayment ||
                              chapaSubscriptionMutation.isPending ||
                              (price > 0 &&
                                paymentChannel === 'telebirr' &&
                                (!paymentMethod || isLoadingPaymentServices)) ||
                              (price > 0 && paymentChannel === 'chapa' && !user?.email)
                            }
                            className="bg-amber-500 hover:bg-amber-600"
                          >
                            {subscribeMutation.isPending ||
                            isProcessingPayment ||
                            chapaSubscriptionMutation.isPending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : price === 0 ? (
                              'Activate'
                            ) : paymentChannel === 'chapa' ? (
                              'Pay with Chapa'
                            ) : (
                              'Pay & Subscribe'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ or Help */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Can I change my plan later?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What happens when my subscription expires?</h4>
            <p className="text-sm text-muted-foreground">
              Your account will be downgraded to the Basic plan. Your listings will remain but some features will be limited.
            </p>
          </div>
          <div>
            <h4 className="font-medium">How do I cancel my subscription?</h4>
            <p className="text-sm text-muted-foreground">
              You can cancel auto-renewal from this page. Your subscription will remain active until the end of the billing period.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

