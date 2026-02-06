'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Check,
  X,
  Loader2,
  Plus,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  useAppointments,
  useUpdateAppointmentStatus,
  useCancelAppointment,
} from '@/hooks/use-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Appointment } from '@/types';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();

  const { data: appointments, isLoading } = useAppointments();
  const updateStatusMutation = useUpdateAppointmentStatus();
  const cancelMutation = useCancelAppointment();

  const now = new Date();
  const today = startOfDay(now);

  const filteredAppointments = (appointments || []).filter((apt) => {
    const aptDate = new Date(apt.scheduledAt);
    switch (activeTab) {
      case 'upcoming':
        return isAfter(aptDate, now) && apt.status !== 'cancelled' && apt.status !== 'completed';
      case 'past':
        return isBefore(aptDate, now) || apt.status === 'completed';
      case 'cancelled':
        return apt.status === 'cancelled';
      default:
        return true;
    }
  });

  const handleConfirm = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'confirmed' });
  };

  const handleComplete = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'completed' });
  };

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-24 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your viewing appointments
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            Upcoming
            <Badge variant="secondary">
              {(appointments || []).filter(
                (apt) =>
                  isAfter(new Date(apt.scheduledAt), now) &&
                  apt.status !== 'cancelled' &&
                  apt.status !== 'completed'
              ).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const isSeller = user?.id === appointment.seller?.id;
                const otherParty = isSeller ? appointment.buyer : appointment.seller;
                const aptDate = new Date(appointment.scheduledAt);
                const isPast = isBefore(aptDate, now);

                return (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Listing Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted relative shrink-0">
                            {appointment.listing?.thumbnail ? (
                              <Image
                                src={appointment.listing.thumbnail}
                                alt={appointment.listing.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link
                                  href={`/listings/${appointment.listing?.id}`}
                                  className="font-semibold hover:text-amber-600 transition-colors line-clamp-1"
                                >
                                  {appointment.listing?.title}
                                </Link>
                                <p className="text-amber-600 font-medium">
                                  {appointment.listing?.price
                                    ? formatPrice(appointment.listing.price)
                                    : ''}
                                </p>
                              </div>
                              <Badge className={statusColors[appointment.status]}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Badge>
                            </div>

                            {/* Appointment Details */}
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(aptDate, 'EEEE, MMMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{format(aptDate, 'h:mm a')}</span>
                              </div>
                              {appointment.location && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{appointment.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Other Party Info */}
                        <div className="lg:w-64 shrink-0">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-2">
                              {isSeller ? 'Buyer' : 'Seller'}
                            </p>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherParty?.avatar} />
                                <AvatarFallback>
                                  {otherParty?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{otherParty?.name}</p>
                                {otherParty?.phone && (
                                  <a
                                    href={`tel:${otherParty.phone}`}
                                    className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {otherParty.phone}
                                  </a>
                                )}
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                                <strong>Notes:</strong> {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {appointment.status === 'pending' && !isPast && (
                          <div className="flex lg:flex-col gap-2 shrink-0">
                            {isSeller && (
                              <Button
                                onClick={() => handleConfirm(appointment.id)}
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 gap-2"
                              >
                                {updateStatusMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Confirm
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                  <X className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this appointment? The other party will be notified.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancel(appointment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Cancel Appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}

                        {appointment.status === 'confirmed' && !isPast && (
                          <div className="flex lg:flex-col gap-2 shrink-0">
                            {isSeller && (
                              <Button
                                onClick={() => handleComplete(appointment.id)}
                                disabled={updateStatusMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 gap-2"
                              >
                                {updateStatusMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Mark Complete
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                                  <X className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this confirmed appointment? The other party will be notified.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancel(appointment.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Cancel Appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No appointments</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming appointments."
                    : activeTab === 'past'
                    ? "You don't have any past appointments."
                    : "You don't have any cancelled appointments."}
                </p>
                <Link href="/vehicles">
                  <Button className="mt-4">Browse Listings</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

