'use client';

import { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  History,
  Loader2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
import { cn } from '@/lib/utils';
import { useWallet, useWalletTransactions, useTopUpWallet } from '@/hooks/use-dashboard';
import { format } from 'date-fns';

const quickAmounts = [500, 1000, 2000, 5000, 10000];

export default function WalletPage() {
  const [topUpAmount, setTopUpAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  const { data: wallet, isLoading: isLoadingWallet } = useWallet();
  const { data: transactions, isLoading: isLoadingTransactions } = useWalletTransactions();
  const topUpMutation = useTopUpWallet();

  const isLoading = isLoadingWallet || isLoadingTransactions;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleTopUp = async () => {
    if (topUpAmount <= 0) return;

    topUpMutation.mutate(
      { amount: topUpAmount, paymentMethod },
      {
        onSuccess: (data) => {
          if (data?.paymentUrl) {
            window.location.href = data.paymentUrl;
          }
          setIsTopUpDialogOpen(false);
        },
      }
    );
  };

  // Calculate stats
  const totalCredits = (transactions || [])
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = (transactions || [])
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Wallet
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your wallet balance and transactions
          </p>
        </div>
        <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
              <Plus className="h-4 w-4" />
              Top Up
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Top Up Wallet</DialogTitle>
              <DialogDescription>
                Add funds to your wallet for quick payments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount (ETB)</Label>
                <Input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  min={100}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setTopUpAmount(amount)}
                      className={cn(topUpAmount === amount && 'border-amber-500 bg-amber-50')}
                    >
                      {formatPrice(amount)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telebirr">Telebirr</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTopUpDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleTopUp}
                disabled={topUpMutation.isPending || topUpAmount <= 0}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {topUpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatPrice(topUpAmount)}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-white/90">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatPrice(wallet?.balance || 0)}
            </div>
            {wallet?.pendingBalance && wallet.pendingBalance > 0 && (
              <p className="text-sm text-white/70 mt-2">
                +{formatPrice(wallet.pendingBalance)} pending
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total Added
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatPrice(totalCredits)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              All time top-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatPrice(totalDebits)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Boosts & subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your recent wallet transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(transactions || []).length > 0 ? (
            <div className="divide-y">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 py-4"
                >
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      transaction.type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.createdAt
                        ? format(new Date(transaction.createdAt), 'MMM d, yyyy • h:mm a')
                        : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold',
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatPrice(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatPrice(transaction.balance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Top up your wallet to start making quick payments for boosts and subscriptions.
              </p>
              <Button
                className="mt-4"
                onClick={() => setIsTopUpDialogOpen(true)}
              >
                Top Up Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

