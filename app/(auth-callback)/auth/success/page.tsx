'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your login...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const isNewUser = searchParams.get('isNewUser') === 'true';
        const error = searchParams.get('error');

        console.log('OAuth callback - token received:', !!token);
        console.log('OAuth callback - refreshToken received:', !!refreshToken);
        console.log('OAuth callback - isNewUser:', isNewUser);

        // Handle error from OAuth provider
        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(decodeURIComponent(error) || 'Authentication failed. Please try again.');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Validate tokens
        if (!token) {
          console.error('No token received');
          setStatus('error');
          setMessage('No authentication token received. Please try again.');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
          return;
        }

        // Set the token in API client and localStorage
        api.setToken(token);
        console.log('Token set in API client');

        // Store refresh token if provided
        if (refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('zcar_refresh_token', refreshToken);
        }

        // Fetch user profile with the new token
        console.log('Fetching user profile...');
        const userResponse = await api.getMe();
        console.log('User response:', userResponse);

        if (userResponse.success && userResponse.data) {
          const user = userResponse.data;
          
          // Update auth store
          setAuth(user, token);
          console.log('Auth store updated with user:', user.email);
          
          setStatus('success');
          
          if (isNewUser) {
            setMessage('Account created successfully! Welcome to ZCAR Marketplace.');
            toast.success('Welcome to ZCAR!', {
              description: 'Your account has been created successfully.',
            });
          } else {
            setMessage(`Welcome back, ${user.name}!`);
            toast.success('Welcome back!', {
              description: `Logged in as ${user.name}`,
            });
          }

          // Redirect based on user role
          setTimeout(() => {
            const role = user.role;
            if (role === 'admin') {
              router.replace('/dashboard/admin');
            } else if (role === 'private' || role === 'broker' || role === 'dealership') {
              router.replace('/dashboard/seller');
            } else {
              router.replace('/dashboard');
            }
          }, 1500);
        } else {
          console.error('Invalid user response:', userResponse);
          throw new Error('Failed to fetch user profile');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage('Something went wrong during authentication. Please try again.');
        api.clearToken();
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
          {/* Logo */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-2xl font-bold mb-4">
              Z
            </div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              ZCAR Marketplace
            </h1>
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <h2 className={`text-lg font-medium mb-2 ${
            status === 'success' 
              ? 'text-green-700 dark:text-green-400' 
              : status === 'error' 
                ? 'text-red-700 dark:text-red-400' 
                : 'text-neutral-700 dark:text-neutral-300'
          }`}>
            {status === 'loading' && 'Authenticating'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-neutral-600 dark:text-neutral-400">
            {message}
          </p>

          {/* Loading dots animation */}
          {status === 'loading' && (
            <div className="mt-4 flex justify-center space-x-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Redirect notice */}
          {(status === 'success' || status === 'error') && (
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
              {status === 'success' 
                ? 'Redirecting to your dashboard...' 
                : 'Redirecting to login page...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  );
}

