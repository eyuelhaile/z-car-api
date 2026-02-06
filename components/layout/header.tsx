'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Car,
  Home,
  Search,
  Heart,
  Bell,
  MessageSquare,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Plus,
  ChevronDown,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useBadgeCountsStore, useAuthStore } from '@/lib/store';
import { useComparisonCart } from '@/hooks/use-dashboard';
import { cn } from '@/lib/utils';
import { PhoneVerifyModal } from '@/components/verification/phone-verify-modal';

const navigation = [
  { name: 'Vehicles', href: '/vehicles', icon: Car },
  { name: 'Properties', href: '/properties', icon: Home },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { counts } = useBadgeCountsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // Get comparison cart counts
  const { data: vehicleCart } = useComparisonCart('vehicle', isAuthenticated);
  const { data: propertyCart } = useComparisonCart('property', isAuthenticated);
  const compareCount = (vehicleCart?.listingIds?.length || 0) + (propertyCart?.listingIds?.length || 0);
  
  // Check if user needs verification
  const needsVerification = isAuthenticated && user && !user.verified && !user.phoneVerified;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/dashboard/admin';
      case 'private':
      case 'broker':
      case 'dealership':
        return '/dashboard/seller';
      default:
        return '/dashboard';
    }
  };

  return (
    <>
      {/* Verification Banner */}
      {needsVerification && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4">
          <div className="container flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Join us in building a safer community.</span>{' '}
                <span className="hidden sm:inline">Get verified to boost your credibility and assist us in creating trust amongst our users!</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              onClick={() => setShowVerifyModal(true)}
            >
              Verify Now
            </Button>
          </div>
        </div>
      )}
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="hidden font-bold text-xl tracking-tight sm:inline-block">
            <span className="text-amber-600">Z</span>CAR
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'gap-2',
                    isActive && 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          {isAuthenticated && !isLoading ? (
            <>
              <Link href="/dashboard/favorites">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Heart className="h-5 w-5" />
                  {counts.favorites > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-pink-500">
                      {counts.favorites > 99 ? '99+' : counts.favorites}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/compare?type=vehicle">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Scale className="h-5 w-5" />
                  {compareCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-blue-500">
                      {compareCount > 99 ? '99+' : compareCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <MessageSquare className="h-5 w-5" />
                  {counts.messages > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500">
                      {counts.messages > 99 ? '99+' : counts.messages}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="icon" className="text-muted-foreground relative">
                  <Bell className="h-5 w-5" />
                  {counts.notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500">
                      {counts.notifications > 99 ? '99+' : counts.notifications}
                    </Badge>
                  )}
                </Button>
              </Link>

              {(user?.role === 'private' || user?.role === 'broker' || user?.role === 'dealership') && (
                <Link href="/dashboard/listings/create">
                  <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                    <Plus className="h-4 w-4" />
                    Post Ad
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-amber-500/20">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-amber-100 text-amber-700">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive && 'bg-amber-50 text-amber-700'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
                <Link href="/search" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Search className="h-5 w-5" />
                    Search
                  </Button>
                </Link>
              </nav>

              <div className="border-t pt-4">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/favorites" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Heart className="h-5 w-5" />
                        Favorites
                        {counts.favorites > 0 && (
                          <Badge className="ml-auto bg-pink-500">{counts.favorites > 99 ? '99+' : counts.favorites}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/compare?type=vehicle" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Scale className="h-5 w-5" />
                        Compare
                        {compareCount > 0 && (
                          <Badge className="ml-auto bg-blue-500">{compareCount > 99 ? '99+' : compareCount}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/dashboard/messages" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <MessageSquare className="h-5 w-5" />
                        Messages
                        {counts.messages > 0 && (
                          <Badge className="ml-auto bg-amber-500">{counts.messages > 99 ? '99+' : counts.messages}</Badge>
                        )}
                      </Button>
                    </Link>
                    <Link href="/dashboard/notifications" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <Bell className="h-5 w-5" />
                        Notifications
                        {counts.notifications > 0 && (
                          <Badge className="ml-auto bg-red-500">{counts.notifications > 99 ? '99+' : counts.notifications}</Badge>
                        )}
                      </Button>
                    </Link>
                    {(user.role === 'private' || user.role === 'broker' || user.role === 'dealership') && (
                      <Link href="/listings/create" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full gap-3 mt-2 bg-gradient-to-r from-amber-500 to-orange-600">
                          <Plus className="h-5 w-5" />
                          Post New Ad
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-600 mt-2"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    
    {/* Phone Verification Modal */}
    <PhoneVerifyModal open={showVerifyModal} onOpenChange={setShowVerifyModal} />
    </>
  );
}

