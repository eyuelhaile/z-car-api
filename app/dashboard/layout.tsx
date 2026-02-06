'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Car,
  Home,
  Heart,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Calendar,
  Scale,
  Plus,
  BarChart3,
  CreditCard,
  Wallet,
  Rocket,
  Users,
  FileText,
  ShieldCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { useBadgeCountsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { PhoneVerifyModal } from '@/components/verification/phone-verify-modal';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
  children?: NavItem[];
}

// Seller roles: private, broker, dealership
const SELLER_ROLES = ['private', 'broker', 'dealership'];
const BUYER_ROLES = ['buyer'];
const ALL_USER_ROLES = [...BUYER_ROLES, ...SELLER_ROLES];

const navigation: NavItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ALL_USER_ROLES,
  },
  {
    name: 'My Listings',
    href: '/dashboard/listings',
    icon: Car,
    roles: SELLER_ROLES,
    children: [
      { name: 'All Listings', href: '/dashboard/listings', icon: FileText },
      { name: 'Create New', href: '/dashboard/listings/create', icon: Plus },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    name: 'Favorites',
    href: '/dashboard/favorites',
    icon: Heart,
    roles: BUYER_ROLES,
  },
  {
    name: 'Saved Searches',
    href: '/dashboard/saved-searches',
    icon: Search,
    roles: BUYER_ROLES,
  },
  {
    name: 'Comparisons',
    href: '/dashboard/comparisons',
    icon: Scale,
    roles: BUYER_ROLES,
  },
  {
    name: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    name: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    name: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
    roles: SELLER_ROLES,
  },
  {
    name: 'Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
    roles: SELLER_ROLES,
  },
  {
    name: 'Boosts',
    href: '/dashboard/boosts',
    icon: Rocket,
    roles: SELLER_ROLES,
  },
];

const adminNavigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/dashboard/admin/users',
    icon: Users,
  },
  {
    name: 'Listings',
    href: '/dashboard/admin/listings',
    icon: FileText,
  },
  {
    name: 'Reports',
    href: '/dashboard/admin/reports',
    icon: ShieldCheck,
  },
  {
    name: 'Agencies',
    href: '/dashboard/admin/agencies',
    icon: Building2,
  },
  {
    name: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: BarChart3,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { counts } = useBadgeCountsStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  
  // Check if user needs verification
  const needsVerification = user && !user.verified && !user.phoneVerified;

  // Map nav item names to badge counts
  const getBadgeCount = (name: string): number => {
    switch (name) {
      case 'Messages':
        return counts.messages;
      case 'Notifications':
        return counts.notifications;
      case 'Appointments':
        return counts.appointments;
      case 'Favorites':
        return counts.favorites;
      default:
        return 0;
    }
  };

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavigation : navigation;

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || 'buyer');
  });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">
            <span className="text-amber-600">Z</span>CAR
          </span>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {user?.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus.includes(item.name);

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.name}
                  open={isOpen}
                  onOpenChange={() => toggleMenu(item.name)}
                >
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-8 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isChildActive
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            const badgeCount = getBadgeCount(item.name);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {badgeCount > 0 && (
                  <Badge className={cn(
                    'hover:bg-opacity-80',
                    item.name === 'Notifications' && 'bg-red-500 hover:bg-red-600',
                    item.name === 'Messages' && 'bg-amber-500 hover:bg-amber-600',
                    item.name === 'Appointments' && 'bg-blue-500 hover:bg-blue-600',
                    item.name === 'Favorites' && 'bg-pink-500 hover:bg-pink-600'
                  )}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 border-t">
        <Link
          href="/dashboard/settings"
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-amber-100 text-amber-700'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          onClick={() => {
            logout();
            setIsMobileOpen(false);
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Link href="/dashboard/messages">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {counts.messages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500">
                    {counts.messages > 99 ? '99+' : counts.messages}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {counts.notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500">
                    {counts.notifications > 99 ? '99+' : counts.notifications}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Verification Banner */}
        {needsVerification && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <p className="text-sm">
                  <span className="font-medium">Get verified!</span>{' '}
                  <span className="hidden sm:inline">Boost your credibility and build trust with other users.</span>
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      
      {/* Phone Verification Modal */}
      <PhoneVerifyModal open={showVerifyModal} onOpenChange={setShowVerifyModal} />
    </div>
  );
}

