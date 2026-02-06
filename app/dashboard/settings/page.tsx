'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Save,
  Loader2,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { setUser } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Notification settings
  type NotificationCategory = {
    newMessage: boolean;
    listingApproved: boolean;
    newFavorite?: boolean;
    priceChange?: boolean;
    newsletter?: boolean;
    appointments?: boolean;
  };

  const [notifications, setNotifications] = useState<{
    email: NotificationCategory;
    push: NotificationCategory;
  }>({
    email: {
      newMessage: true,
      listingApproved: true,
      newFavorite: true,
      priceChange: false,
      newsletter: true,
    },
    push: {
      newMessage: true,
      listingApproved: true,
      appointments: true,
    },
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        metadata: { bio: profile.bio },
      });
      if (response?.data) {
        // Update auth store user
        setUser(response.data);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update profile';
      toast.error('Error', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.updateMySettings(payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Notification settings updated');
    },
    onError: () => {
      toast.error('Failed to update notification settings');
    },
  });

  const handleToggle = (category: 'email' | 'push', key: string, value: boolean) => {
    const next = {
      ...notifications,
      [category]: {
        ...notifications[category],
        [key]: value,
      },
    };
    setNotifications(next);
    // Map keys to API expected shape
    const payload = {
      email: {
        new_message: next.email.newMessage,
        listing_approved: next.email.listingApproved,
        new_favorite: next.email.newFavorite,
        newsletter: next.email.newsletter,
        price_change: next.email.priceChange,
      },
      push: {
        new_message: next.push.newMessage,
        listing_approved: next.push.listingApproved,
        new_favorite: next.push.newFavorite,
        newsletter: next.push.newsletter,
        appointment: next.push.appointments,
      },
    };
    updateSettingsMutation.mutate(payload);
  };

  // Change password via API
  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await api.changePassword(passwords.current, passwords.new);
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to change password';
      toast.error('Error', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Load current profile from API (use /me)
  const { data: meData, isLoading: isLoadingMe } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.getMe();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (meData) {
      setProfile({
        name: meData.name || '',
        email: meData.email || '',
        phone: meData.phone || '',
        bio: meData.metadata?.bio || '',
      });

      // If backend provides notification preferences in metadata, hydrate them
      if (meData.metadata?.notifications) {
        setNotifications((prev) => ({
          ...prev,
          ...(meData.metadata?.notifications as any),
        }));
      }
    }
  }, [meData]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="parameters" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Parameters
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and how others see you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell others a bit about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              <Button
                onClick={handleProfileSave}
                disabled={isLoading}
                className="gap-2 bg-amber-500 hover:bg-amber-600"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* <Card className="mt-6">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code when signing in
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card> */}

          <Card className="mt-6 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const ok = confirm('Are you sure you want to delete your account? This action cannot be undone.');
                    if (!ok) return;
                    try {
                      await api.deleteMe();
                      toast.success('Account deactivated');
                      // logout and redirect
                      logout();
                    } catch (err: any) {
                      const message = err?.response?.data?.message || 'Failed to delete account';
                      toast.error('Error', { description: message });
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when you get a new message
                  </p>
                </div>
                <Switch
                  checked={notifications.email.newMessage}
                  onCheckedChange={(checked) => handleToggle('email', 'newMessage', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Listing Approved</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your listing is approved
                  </p>
                </div>
                <Switch
                  checked={notifications.email.listingApproved}
                  onCheckedChange={(checked) => handleToggle('email', 'listingApproved', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Favorites</p>
                  <p className="text-sm text-muted-foreground">
                    Someone saved your listing to favorites
                  </p>
                </div>
                <Switch
                  checked={notifications.email.newFavorite}
                  onCheckedChange={(checked) => handleToggle('email', 'newFavorite', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drop Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when saved listings drop in price
                  </p>
                </div>
                <Switch
                  checked={notifications.email.priceChange}
                  onCheckedChange={(checked) => handleToggle('email', 'priceChange', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-muted-foreground">
                    Receive our weekly newsletter with tips and updates
                  </p>
                </div>
                <Switch
                  checked={notifications.email.newsletter}
                  onCheckedChange={(checked) => handleToggle('email', 'newsletter', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Control notifications on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Messages</p>
                  <p className="text-sm text-muted-foreground">
                    Push notification for new messages
                  </p>
                </div>
                <Switch
                  checked={notifications.push.newMessage}
                  onCheckedChange={(checked) => handleToggle('push', 'newMessage', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Listing Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Status changes for your listings
                  </p>
                </div>
                <Switch
                  checked={notifications.push.listingApproved}
                  onCheckedChange={(checked) => handleToggle('push', 'listingApproved', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={notifications.push.appointments}
                  onCheckedChange={(checked) => handleToggle('push', 'appointments', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters Tab (Admin Only) */}
        {isAdmin && (
          <TabsContent value="parameters">
            <Card>
              <CardHeader>
                <CardTitle>Combo Field Management</CardTitle>
                <CardDescription>
                  Manage all reference data tables (vehicle makes, models, property types, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Click the button below to open the Parameters management interface
                  </p>
                  <Link href="/dashboard/settings/parameters">
                    <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
                      <Settings2 className="h-4 w-4" />
                      Open Parameters Manager
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

