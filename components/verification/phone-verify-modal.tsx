'use client';

import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Phone, Loader2, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/error-utils';

const OTP_LENGTH = 5;

// Phone validation regex: must start with 9 or 7, then 8 more digits
const phoneRegex = /^[97]\d{8}$/;

interface PhoneVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'phone' | 'otp';

export function PhoneVerifyModal({ open, onOpenChange }: PhoneVerifyModalProps) {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [fullPhone, setFullPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setStep('phone');
      setPhone('');
      setFullPhone('');
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(0);
      setPhoneError('');
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '').slice(0, 9);
    setPhone(digits);
    setPhoneError('');
  };

  const handleSendOtp = async () => {
    // Validate phone
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone must start with 9 or 7 and be 9 digits');
      return;
    }
    
    const formattedPhone = `+251${phone}`;
    setFullPhone(formattedPhone);
    setIsSending(true);
    
    try {
      const response = await api.sendPhoneOtp(formattedPhone);
      
      if (response.success) {
        setStep('otp');
        setCountdown(response.data.expiresIn);
        toast.success('OTP sent!', {
          description: 'Check your phone for the verification code.',
        });
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP', {
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < OTP_LENGTH; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      const lastIndex = Math.min(pastedData.length, OTP_LENGTH) - 1;
      inputRefs.current[lastIndex]?.focus();
      
      if (pastedData.length === OTP_LENGTH) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== OTP_LENGTH) {
      toast.error('Invalid OTP', {
        description: `Please enter all ${OTP_LENGTH} digits.`,
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const response = await api.verifyPhone(fullPhone, code);
      
      if (response.success) {
        // Update user in store
        if (user) {
          setUser({ ...user, ...response.data, phoneVerified: true, verified: true });
        }
        
        // Invalidate user query
        queryClient.invalidateQueries({ queryKey: ['user'] });
        
        toast.success('Phone verified!', {
          description: 'Your account is now verified.',
        });
        
        onOpenChange(false);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Invalid verification code. Please try again.');
      toast.error('Verification failed', {
        description: message,
      });
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsSending(true);
    
    try {
      const response = await api.sendPhoneOtp(fullPhone);
      
      if (response.success) {
        setCountdown(response.data.expiresIn);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        
        toast.success('OTP sent!', {
          description: 'A new verification code has been sent.',
        });
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to resend OTP.');
      toast.error('Failed to resend', {
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center">
            {step === 'phone' ? 'Verify your phone' : 'Enter verification code'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {step === 'phone' 
              ? 'Add your phone number to verify your account and build trust with other users.'
              : `We sent a ${OTP_LENGTH}-digit code to ${fullPhone.slice(0, 7)}****${fullPhone.slice(-2)}`
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                  <span className="text-sm font-medium">+251</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9XXXXXXXX"
                  className="pl-16 h-12"
                  maxLength={9}
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  disabled={isSending}
                />
              </div>
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
            </div>

            <Button
              onClick={handleSendOtp}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={isSending || phone.length !== 9}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-11 h-12 text-center text-xl font-bold border-2 focus:border-blue-500"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {/* Timer */}
            {countdown > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Code expires in <span className="font-semibold text-blue-600">{formatTime(countdown)}</span>
              </p>
            )}

            <Button
              onClick={() => handleVerify()}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={isVerifying || otp.join('').length !== OTP_LENGTH}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>

            {/* Resend & Back */}
            <div className="flex items-center justify-between text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('phone')}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Change number
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={isSending || countdown > 0}
                className="text-blue-600"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : countdown > 0 ? (
                  `Resend in ${formatTime(countdown)}`
                ) : (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4" />
                    Resend
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

