'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Eye, EyeOff, Mail, Lock, User, Phone, Loader2, 
  Car, Home, Building2, UserCircle, Briefcase, Percent,
  ArrowLeft, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/error-utils';

// Phone validation: must be 9 digits starting with 9 or 7
const phoneRegex = /^[97]\d{8}$/;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .min(9, 'Phone number must be 9 digits')
    .max(9, 'Phone number must be 9 digits')
    .regex(phoneRegex, 'Phone must start with 9 or 7 and be 9 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'private', 'broker', 'dealership']),
  commissionVehicle: z.number().min(0).max(100).optional(),
  commissionProperty: z.number().min(0).max(100).optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

type AccountType = 'buyer' | 'seller' | null;
type SellerType = 'private' | 'broker' | 'dealership' | null;

const sellerTypeOptions = [
  {
    value: 'private' as const,
    icon: UserCircle,
    title: 'Private Seller',
    description: 'Sell as an individual without commission',
    benefits: ['No commission fees', 'Simple listing process', 'Direct buyer contact'],
  },
  {
    value: 'broker' as const,
    icon: Briefcase,
    title: 'Broker / Agent',
    description: 'Work as an agent and earn commission',
    benefits: ['Set your commission rates', 'Professional profile', 'Verified badge'],
  },
  {
    value: 'dealership' as const,
    icon: Building2,
    title: 'Dealership / Agency',
    description: 'Register your business',
    benefits: ['Business profile', 'Multiple listings', 'Premium features'],
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Multi-step state
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [sellerType, setSellerType] = useState<SellerType>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'buyer',
      commissionVehicle: 2.5,
      commissionProperty: 3.0,
      terms: false,
    },
  });

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    if (type === 'buyer') {
      form.setValue('role', 'buyer');
      setStep(3); // Skip seller type selection
    } else {
      setStep(2);
    }
  };

  const handleSellerTypeSelect = (type: SellerType) => {
    setSellerType(type);
    if (type) {
      form.setValue('role', type);
      setStep(3);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    
    try {
      // Format phone with country code
      const fullPhone = `+251${data.phone}`;
      
      const payload: {
        name: string;
        email: string;
        phone: string;
        password: string;
        role: 'buyer' | 'private' | 'broker' | 'dealership';
        commissionVehicle?: number;
        commissionProperty?: number;
      } = {
        name: data.name,
        email: data.email,
        phone: fullPhone,
        password: data.password,
        role: data.role,
      };

      // Add commission fields only for brokers
      if (data.role === 'broker') {
        payload.commissionVehicle = data.commissionVehicle;
        payload.commissionProperty = data.commissionProperty;
      }

      const response = await api.register(payload);
      
      if (response.success) {
        toast.success('OTP Sent!', {
          description: response.message || 'Please check your phone for the verification code.',
        });
        
        // Store phone and expiry in sessionStorage for OTP page
        sessionStorage.setItem('otp_phone', fullPhone);
        sessionStorage.setItem('otp_expires', String(Date.now() + (response.data.expiresIn * 1000)));
        
        // Navigate to OTP verification page
        router.push('/auth/verify-otp');
      }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Registration failed. Please try again.');
      toast.error('Registration failed', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const goBack = () => {
    if (step === 3 && accountType === 'seller') {
      setStep(2);
    } else {
      setStep(1);
      setAccountType(null);
      setSellerType(null);
    }
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8 gap-2">
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={cn(
              'h-2 rounded-full transition-all',
              s === step ? 'w-8 bg-amber-500' : 'w-2',
              s < step ? 'bg-amber-500' : 'bg-muted',
              (accountType === 'buyer' && s === 2) && 'hidden'
            )} 
          />
        ))}
      </div>

      {step > 1 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 -ml-2"
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}

      {/* Step 1: Account Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-2">
              What would you like to do on ZCAR?
            </p>
          </div>

          <div className="grid gap-4">
            <button
              type="button"
              onClick={() => handleAccountTypeSelect('buyer')}
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all hover:border-amber-300',
                accountType === 'buyer' ? 'border-amber-500 bg-amber-50' : 'border-border'
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <Car className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I want to Buy</h3>
                <p className="text-sm text-muted-foreground">Browse and purchase vehicles or properties</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => handleAccountTypeSelect('seller')}
              className={cn(
                'flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all hover:border-amber-300',
                accountType === 'seller' ? 'border-amber-500 bg-amber-50' : 'border-border'
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <Home className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">I want to Sell</h3>
                <p className="text-sm text-muted-foreground">List your vehicles or properties for sale</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="relative my-8">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-12" 
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={socialLoading !== null}
            >
              {socialLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
              disabled={socialLoading !== null}
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
            Already have an account?{' '}
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Seller Type */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">How will you sell?</h1>
            <p className="text-muted-foreground mt-2">
              Choose the account type that fits your needs
            </p>
          </div>

          <div className="grid gap-4">
            {sellerTypeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSellerTypeSelect(option.value)}
                  className={cn(
                    'p-5 rounded-xl border-2 text-left transition-all hover:border-amber-300',
                    sellerType === option.value ? 'border-amber-500 bg-amber-50' : 'border-border'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-white',
                      option.value === 'private' && 'bg-gradient-to-br from-emerald-500 to-emerald-600',
                      option.value === 'broker' && 'bg-gradient-to-br from-purple-500 to-purple-600',
                      option.value === 'dealership' && 'bg-gradient-to-br from-amber-500 to-orange-600',
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {option.benefits.map((benefit, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Registration Form */}
      {step === 3 && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Complete your profile</h1>
            <p className="text-muted-foreground mt-2">
              {accountType === 'buyer' ? 'Create your buyer account' : 
               sellerType === 'private' ? 'Create your private seller account' :
               sellerType === 'broker' ? 'Create your broker account' :
               'Create your dealership account'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {sellerType === 'dealership' ? 'Business Name' : 'Full Name'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {sellerType === 'dealership' ? (
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        ) : (
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        )}
                        <Input
                          placeholder={sellerType === 'dealership' ? 'ABC Motors' : 'John Doe'}
                          className="pl-10 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10 h-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                            // Only allow digits
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

              {/* Commission fields for brokers */}
              {sellerType === 'broker' && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-4">
                  <div className="flex items-center gap-2 text-purple-700 font-medium">
                    <Percent className="h-5 w-5" />
                    Commission Rates
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="commissionVehicle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vehicle Commission (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="2.5"
                              className="h-12"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="commissionProperty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Commission (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="3.0"
                              className="h-12"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-xs text-purple-600">
                    Commission rates will be visible to potential clients
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 h-12"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-amber-600 hover:text-amber-700 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
