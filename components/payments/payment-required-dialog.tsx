'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface PaymentRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  amount: number;
  onPay: () => void;
  onCancel?: () => void;
  isPaying?: boolean;
}

export function PaymentRequiredDialog({
  open,
  onOpenChange,
  listingId,
  amount,
  onPay,
  onCancel,
  isPaying = false,
}: PaymentRequiredDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <AlertDialogTitle>Listing Quota Exceeded</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="pt-4">
            <p className="text-base">
              You have reached your free listing limit. To create this listing, please pay{' '}
              <span className="font-semibold text-amber-600">{amount} ETB</span>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your listing has been saved as a draft. Complete the payment to proceed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPaying}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={onPay}
            disabled={isPaying}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {isPaying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Chapa...
              </>
            ) : (
              'Pay with Chapa'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
