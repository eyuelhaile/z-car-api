'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminReports, useResolveAdminReport } from '@/hooks/use-admin';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  dismissed: 'bg-gray-100 text-gray-700',
};

const reasonColors: Record<string, string> = {
  spam: 'bg-red-100 text-red-700',
  misleading: 'bg-orange-100 text-orange-700',
  inappropriate: 'bg-purple-100 text-purple-700',
  fraud: 'bg-red-100 text-red-700',
  duplicate: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [appliedStatus, setAppliedStatus] = useState<string>('all');
  const [appliedEntityType, setAppliedEntityType] = useState<string>('all');
  const [page, setPage] = useState(1);
  
  const { data: reportsData, isLoading, refetch } = useAdminReports({
    status: appliedStatus !== 'all' ? appliedStatus as any : undefined,
    entityType: appliedEntityType !== 'all' ? appliedEntityType as any : undefined,
    page,
    limit: 20,
  });
  const resolveMutation = useResolveAdminReport();

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolveAction, setResolveAction] = useState('no_action');
  const [resolveNotes, setResolveNotes] = useState('');

  // API returns: { data: Report[], pagination: {...}, summary: {...} }
  const reports = reportsData?.data || [];
  const pagination = reportsData?.pagination;
  const summary = reportsData?.summary;

  const handleResolveClick = (report: any) => {
    setSelectedReport(report);
    setResolveDialogOpen(true);
  };

  const handleResolveConfirm = () => {
    if (selectedReport && resolveAction) {
      resolveMutation.mutate({
        id: selectedReport.id,
        data: {
          action: resolveAction,
          notes: resolveNotes || undefined,
        },
      });
      setResolveDialogOpen(false);
      setSelectedReport(null);
      setResolveAction('no_action');
      setResolveNotes('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Reports Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and resolve user-submitted reports
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const shouldRefetch =
                    statusFilter === appliedStatus &&
                    entityTypeFilter === appliedEntityType;
                  setAppliedStatus(statusFilter);
                  setAppliedEntityType(entityTypeFilter);
                  setPage(1);
                  if (shouldRefetch) {
                    refetch();
                  }
                }}
              >
                Apply Filters
              </Button>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityTypeFilter} onValueChange={(value) => {
                setEntityTypeFilter(value);
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="listing">Listing</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report: any) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {report.entityType === 'listing' ? (
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Badge variant="outline" className="capitalize">
                            {report.entityType}
                          </Badge>
                          <Badge className={statusColors[report.status] || statusColors.pending}>
                            {report.status}
                          </Badge>
                          <Badge className={reasonColors[report.reason] || reasonColors.other}>
                            {report.reason}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">
                          {report.target || report.entityId}
                        </h3>
                        {report.description && (
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid sm:grid-cols-2 gap-4 text-sm border-t pt-4">
                      <div>
                        <span className="text-muted-foreground">Reporter: </span>
                        <span className="font-medium">{report.reporter?.name || 'Anonymous'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported: </span>
                        <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                      </div>
                      {report.notes && (
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground">Admin Notes: </span>
                          <span>{report.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {report.status !== 'resolved' && report.status !== 'dismissed' && (
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveClick(report)}
                          disabled={resolveMutation.isPending}
                        >
                          {resolveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resolve Dialog */}
      <AlertDialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Report</AlertDialogTitle>
            <AlertDialogDescription>
              Choose an action to resolve this report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action">Action *</Label>
              <Select value={resolveAction} onValueChange={setResolveAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_action">No Action Required</SelectItem>
                  <SelectItem value="remove_listing">Remove Listing</SelectItem>
                  <SelectItem value="warn_user">Warn User</SelectItem>
                  <SelectItem value="suspend_user">Suspend User</SelectItem>
                  <SelectItem value="ban_user">Ban User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setResolveDialogOpen(false);
              setResolveAction('no_action');
              setResolveNotes('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResolveConfirm}
              disabled={!resolveAction}
            >
              Resolve Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

