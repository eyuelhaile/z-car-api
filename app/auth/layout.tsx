import Link from 'next/link';
import { Car } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative hero-gradient">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <Car className="h-8 w-8 text-amber-400" />
            </div>
            <span className="font-bold text-4xl">
              <span className="text-amber-400">Z</span>CAR
            </span>
          </Link>

          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-6">
              Ethiopia&apos;s Premier Marketplace
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Join thousands of buyers and sellers on the most trusted platform for vehicles and properties in Ethiopia.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold text-amber-400">15K+</p>
                <p className="text-white/70 text-sm mt-1">Active Listings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <p className="text-3xl font-bold text-amber-400">50K+</p>
                <p className="text-white/70 text-sm mt-1">Happy Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Car className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl">
                <span className="text-amber-600">Z</span>CAR
              </span>
            </Link>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}

