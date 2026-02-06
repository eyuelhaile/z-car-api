'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import { LoginCredentials, SocialLoginProvider } from '@/types';
import { getApiErrorMessage } from '@/lib/error-utils';

// Helper function to determine redirect path based on role
function getRedirectPath(role: string): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'private':
    case 'broker':
    case 'dealership':
      return '/dashboard/seller';
    default:
      return '/dashboard';
  }
}

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login: setAuth, logout: clearAuth, setUser } = useAuthStore();

  // Email/Password Login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => api.login(credentials),
    onSuccess: (response) => {
      if (response.success) {
        api.setToken(response.data.token);
        setAuth(response.data.user, response.data.token);
        toast.success('Welcome back!', {
          description: `Logged in as ${response.data.user.name}`,
        });
        
        // Redirect based on role
        const redirectPath = getRedirectPath(response.data.user.role);
        router.push(redirectPath);
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Invalid email or password');
      toast.error('Login failed', {
        description: message,
      });
    },
  });

  // Send OTP for Login
  const sendLoginOtpMutation = useMutation({
    mutationFn: (phone: string) => api.sendLoginOtp(phone),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('OTP Sent!', {
          description: 'Please check your phone for the verification code.',
        });
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Failed to send OTP. Please check your phone number.');
      toast.error('Failed to send OTP', {
        description: message,
      });
    },
  });

  // Verify OTP for Login
  const verifyLoginOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => api.verifyLoginOtp(phone, otp),
    onSuccess: (response) => {
      if (response.success) {
        api.setToken(response.data.token);
        setAuth(response.data.user, response.data.token);
        toast.success('Welcome back!', {
          description: `Logged in as ${response.data.user.name}`,
        });
        
        // Redirect based on role
        const redirectPath = getRedirectPath(response.data.user.role);
        router.push(redirectPath);
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Invalid or expired OTP. Please try again.');
      toast.error('Login failed', {
        description: message,
      });
    },
  });

  // Send phone OTP for already-authenticated users (verify phone)
  const sendPhoneOtpMutation = useMutation({
    mutationFn: (phone: string) => api.sendPhoneOtp(phone),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('OTP sent to your phone', {
          description: 'Please check your phone for the verification code.',
        });
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Failed to send OTP. Please check your phone number.');
      toast.error('Failed to send OTP', {
        description: message,
      });
    },
  });

  // Verify phone OTP for authenticated user
  const verifyPhoneOtpMutation = useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) => api.verifyPhone(phone, otp),
    onSuccess: (response) => {
      if (response.success) {
        // update user in store
        setUser(response.data);
        toast.success('Phone verified', {
          description: 'Your phone number has been verified.',
        });
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Invalid or expired OTP. Please try again.');
      toast.error('Verification failed', {
        description: message,
      });
    },
  });

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      clearAuth();
      api.clearToken();
      router.push('/');
      toast.success('Logged out successfully');
    }
  };

  // Social Login with Token (for mobile apps or direct SDK integration)
  const socialLoginWithTokenMutation = useMutation({
    mutationFn: ({
      provider,
      idToken,
      accessToken,
    }: {
      provider: SocialLoginProvider;
      idToken?: string;
      accessToken?: string;
    }) => api.socialLoginWithToken(provider, idToken, accessToken),
    onSuccess: (response) => {
      if (response.success) {
        api.setToken(response.data.token);
        setAuth(response.data.user, response.data.token);
        
        if (response.data.isNewUser) {
          toast.success('Welcome to ZCAR!', {
            description: 'Your account has been created successfully.',
          });
        } else {
          toast.success('Welcome back!', {
            description: `Logged in as ${response.data.user.name}`,
          });
        }
        
        // Redirect based on role
        const redirectPath = getRedirectPath(response.data.user.role);
        router.push(redirectPath);
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, 'Social login failed. Please try again.');
      toast.error('Social login failed', {
        description: message,
      });
    },
  });

  // Redirect-based social login (for web)
  const startSocialLogin = (provider: SocialLoginProvider, state?: string) => {
    // Store state in sessionStorage for CSRF verification
    if (state && typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state);
    }
    const authUrl = api.getSocialLoginUrl(provider, state);
    window.location.href = authUrl;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    // Email/Password login
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    // OTP login
    sendLoginOtp: sendLoginOtpMutation.mutate,
    verifyLoginOtp: verifyLoginOtpMutation.mutate,
    isSendingOtp: sendLoginOtpMutation.isPending,
    isVerifyingOtp: verifyLoginOtpMutation.isPending,
    // Logout
    logout,
    // Social login methods
    startSocialLogin,
    socialLoginWithToken: socialLoginWithTokenMutation.mutate,
    isSocialLoggingIn: socialLoginWithTokenMutation.isPending,
  };
}
