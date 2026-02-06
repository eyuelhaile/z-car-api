'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Loader2, Phone, ArrowLeft, RefreshCw, KeyRound, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';

// Phone validation: must be 9 digits starting with 9 or 7
const phoneRegex = /^[97]\d{8}$/;

// Phone + Password login schema
const phonePasswordLoginSchema = z.object({
  phone: z.string()
    .min(9, 'Phone number must be 9 digits')
    .max(9, 'Phone number must be 9 digits')
    .regex(phoneRegex, 'Phone must start with 9 or 7 and be 9 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean(),
});

// Phone for OTP schema
const phoneOtpSchema = z.object({
  phone: z.string()
    .min(9, 'Phone number must be 9 digits')
    .max(9, 'Phone number must be 9 digits')
    .regex(phoneRegex, 'Phone must start with 9 or 7 and be 9 digits'),
});

type PhonePasswordFormData = z.infer<typeof phonePasswordLoginSchema>;
type PhoneOtpFormData = z.infer<typeof phoneOtpSchema>;

const OTP_LENGTH = 5;

export default function LoginPage() {
  const { login, isLoggingIn, sendLoginOtp, verifyLoginOtp, isSendingOtp, isVerifyingOtp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // OTP state
  const [otpStep, setOtpStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Phone + Password form
  const phonePasswordForm = useForm<PhonePasswordFormData>({
    resolver: zodResolver(phonePasswordLoginSchema),
    defaultValues: {
      phone: '',
      password: '',
      remember: false,
    },
  });

  // Phone for OTP form
  const phoneOtpForm = useForm<PhoneOtpFormData>({
    resolver: zodResolver(phoneOtpSchema),
    defaultValues: {
      phone: '',
    },
  });

  // Countdown timer for OTP
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

  // Phone + Password login submit
  const onPhonePasswordSubmit = async (data: PhonePasswordFormData) => {
    // Format phone: API expects "0912345678" format
    const formattedPhone = `0${data.phone}`;
    try {
      // use loginAsync to await and catch errors locally
      await (login as any).loginAsync
        ? (login as any).loginAsync({ phone: formattedPhone, password: data.password })
        : (login as any)({ phone: formattedPhone, password: data.password });
    } catch (err) {
      // If error occurs it will be handled by useAuth onError, but ensure no page reload
      // No-op here
    }
  };

  // Phone OTP login - send OTP
  const onPhoneOtpSubmit = (data: PhoneOtpFormData) => {
    const fullPhone = `+251${data.phone}`;
    setPhoneNumber(fullPhone);
    sendLoginOtp(fullPhone, {
      onSuccess: () => {
        setOtpStep('otp');
        setCountdown(120); // 2 minutes
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      },
    });
  };

  const handleOtpChange = (index: number, value: string) => {
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
        handleOtpVerify(fullOtp);
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
        handleOtpVerify(pastedData);
      }
    }
  };

  const handleOtpVerify = (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_LENGTH) return;
    
    verifyLoginOtp({ phone: phoneNumber, otp: code });
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    
    sendLoginOtp(phoneNumber, {
      onSuccess: () => {
        setCountdown(120);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      },
    });
  };

  const handleBackToPhone = () => {
    setOtpStep('phone');
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    const state = Math.random().toString(36).substring(7);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state);
    }
    const authUrl = api.getSocialLoginUrl(provider, state);
    window.location.href = authUrl;
  };

  const maskedPhone = phoneNumber ? `${phoneNumber.slice(0, 7)}****${phoneNumber.slice(-2)}` : '';

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'password' | 'otp')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="otp" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            OTP
          </TabsTrigger>
        </TabsList>

        {/* Phone + Password Login */}
        <TabsContent value="password">
          <Form {...phonePasswordForm}>
            <form onSubmit={phonePasswordForm.handleSubmit(onPhonePasswordSubmit)} className="space-y-5">
              <FormField
                control={phonePasswordForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm font-medium">+251</span>
                        </div>
                        <Input
                          type="tel"
                          placeholder="9XXXXXXXX"
                          className="pl-[5.5rem] h-12"
                          maxLength={9}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={phonePasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={phonePasswordForm.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-base font-semibold"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Phone OTP Login */}
        <TabsContent value="otp">
          {otpStep === 'phone' ? (
            <Form {...phoneOtpForm}>
              <form onSubmit={phoneOtpForm.handleSubmit(onPhoneOtpSubmit)} className="space-y-5">
                <FormField
                  control={phoneOtpForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm font-medium">+251</span>
                          </div>
                          <Input
                            type="tel"
                            placeholder="9XXXXXXXX"
                            className="pl-[5.5rem] h-12"
                            maxLength={9}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-base font-semibold"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="-ml-2"
                onClick={handleBackToPhone}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Change number
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  We sent a {OTP_LENGTH}-digit code to
                </p>
                <p className="font-semibold">{maskedPhone}</p>
              </div>

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
                    disabled={isVerifyingOtp}
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
                onClick={() => handleOtpVerify()}
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                disabled={isVerifyingOtp || otp.join('').length !== OTP_LENGTH}
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign in'
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp || countdown > 0}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {isSendingOtp ? (
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
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="relative my-8">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
          or continue with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-12 relative" 
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={socialLoading !== null || isLoggingIn || isSendingOtp || isVerifyingOtp}
        >
          {socialLoading === 'google' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="h-12" 
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={socialLoading !== null || isLoggingIn || isSendingOtp || isVerifyingOtp}
        >
          {socialLoading === 'facebook' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </>
          )}
        </Button>
      </div>

      <p className="text-center mt-8 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="text-amber-600 hover:text-amber-700 font-semibold"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}

