'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Phone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getApiErrorMessage } from '@/lib/error-utils';

const OTP_LENGTH = 5;

export default function VerifyOtpPage() {
  const router = useRouter();
  const { login: setAuth } = useAuthStore();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load phone from sessionStorage on mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('otp_phone');
    const storedExpiry = sessionStorage.getItem('otp_expires');
    
    if (!storedPhone) {
      toast.error('Session expired', {
        description: 'Please register again.',
      });
      router.push('/auth/register');
      return;
    }
    
    setPhone(storedPhone);
    
    if (storedExpiry) {
      const expiry = parseInt(storedExpiry);
      setExpiresAt(expiry);
      
      // Calculate remaining time
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setCountdown(remaining);
    }
    
    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [router]);

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

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when all digits entered
    if (digit && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
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
      
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length, OTP_LENGTH) - 1;
      inputRefs.current[lastIndex]?.focus();
      
      // Auto-submit if complete
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
      const response = await api.verifyOtp(phone, code);
      
      if (response.success) {
        // Clear session storage
        sessionStorage.removeItem('otp_phone');
        sessionStorage.removeItem('otp_expires');
        
        // Set auth token and user
        api.setToken(response.data.token);
        setAuth(response.data.user, response.data.token);
        
        toast.success('Phone verified!', {
          description: 'Welcome to ZCAR Marketplace.',
        });
        
        // Redirect based on role
        const role = response.data.user.role;
        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'private' || role === 'broker' || role === 'dealership') {
          router.push('/dashboard/seller');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Invalid verification code. Please try again.');
      toast.error('Verification failed', {
        description: message,
      });
      // Clear OTP inputs on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    
    try {
      const response = await api.resendOtp(phone);
      
      if (response.success) {
        // Update expiry
        const newExpiry = Date.now() + (response.data.expiresIn * 1000);
        setExpiresAt(newExpiry);
        setCountdown(response.data.expiresIn);
        sessionStorage.setItem('otp_expires', String(newExpiry));
        
        toast.success('OTP sent!', {
          description: 'A new verification code has been sent to your phone.',
        });
        
        // Clear and refocus
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to resend OTP. Please try again.');
      toast.error('Failed to resend', {
        description: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedPhone = phone ? `${phone.slice(0, 7)}****${phone.slice(-2)}` : '';

  return (
    <div>
      <Link href="/auth/register">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to registration
        </Button>
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
          <Phone className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Verify your phone</h1>
        <p className="text-muted-foreground mt-2">
          We sent a {OTP_LENGTH}-digit code to
        </p>
        <p className="font-semibold text-lg mt-1">{maskedPhone}</p>
      </div>

      <div className="space-y-6">
        {/* OTP Input */}
        <div className="flex justify-center gap-3">
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
              className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-amber-500 focus:ring-amber-500"
              disabled={isVerifying}
            />
          ))}
        </div>

        {/* Timer */}
        {countdown > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Code expires in <span className="font-semibold text-amber-600">{formatTime(countdown)}</span>
          </p>
        )}
        
        {countdown === 0 && (
          <p className="text-center text-sm text-red-500">
            Code expired. Please request a new one.
          </p>
        )}

        {/* Verify Button */}
        <Button
          onClick={() => handleVerify()}
          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          disabled={isVerifying || otp.join('').length !== OTP_LENGTH}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Verify Phone
            </>
          )}
        </Button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn&apos;t receive the code?
          </p>
          <Button
            variant="ghost"
            onClick={handleResend}
            disabled={isResending || countdown > 0}
            className="text-amber-600 hover:text-amber-700"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${formatTime(countdown)}`
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Code
              </>
            )}
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground">
          Make sure you entered the correct phone number. The code may take a few moments to arrive.
        </p>
      </div>
    </div>
  );
}

