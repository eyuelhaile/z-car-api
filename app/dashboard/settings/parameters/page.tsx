'use client';

import { useState, useEffect } from 'react';
import {
  Settings2,
  Plus,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  ChevronLeft,
  Loader2,
  X,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

const TABLE_TYPES = [
  { value: 'vehicle_makes', label: 'Vehicle Makes' },
  { value: 'vehicle_models', label: 'Vehicle Models' },
  { value: 'vehicle_body_types', label: 'Vehicle Body Types' },
  { value: 'vehicle_fuel_types', label: 'Vehicle Fuel Types' },
  { value: 'vehicle_transmissions', label: 'Vehicle Transmissions' },
  { value: 'vehicle_colors', label: 'Vehicle Colors' },
  { value: 'property_types', label: 'Property Types' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'features', label: 'Features' },
  { value: 'regions', label: 'Regions' },
  { value: 'cities', label: 'Cities' },
];

export default function ParametersPage() {
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Redirect if not admin
  useEffect(() => {
    if (!isLoadingAuth && !isAdmin) {
      router.replace('/dashboard/settings');
    }
  }, [isLoadingAuth, isAdmin, router]);

  // Show loading or nothing while checking auth
  if (isLoadingAuth) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  // Get table info
  const { data: tableInfo } = useQuery({
    queryKey: ['combo-field-table-info', selectedTable],
    queryFn: () => api.getComboFieldTableInfo(selectedTable),
    enabled: !!selectedTable,
  });

  // Get combo fields
  const { data: fieldsData, isLoading } = useQuery({
    queryKey: ['combo-fields', selectedTable, page, searchQuery, isActiveFilter],
    queryFn: () =>
      api.getComboFields(selectedTable, {
        page,
        limit: 20,
        search: searchQuery || undefined,
        isActive: isActiveFilter,
        lang: 'en',
      }),
    enabled: !!selectedTable,
  });

  const fields = Array.isArray(fieldsData?.data) ? fieldsData.data : [];
  const pagination = (fieldsData as any)?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: fields.length,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createComboField(selectedTable, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combo-fields', selectedTable] });
      toast.success('Item created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create item');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.updateComboField(selectedTable, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combo-fields', selectedTable] });
      toast.success('Item updated successfully');
      setIsEditDialogOpen(false);
      setEditingItem(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update item');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteComboField(selectedTable, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combo-fields', selectedTable] });
      toast.success('Item deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete item');
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.restoreComboField(selectedTable, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combo-fields', selectedTable] });
      toast.success('Item restored successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to restore item');
    },
  });

  const resetForm = () => {
    setFormData({
      name: { en: '', am: '', om: '' },
      slug: '',
      isActive: true,
      isPopular: false,
      sortOrder: 0,
    });
  };

  const handleCreate = () => {
    if (!formData.name?.en) {
      toast.error('English name is required');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || { en: '', am: '', om: '' },
      slug: item.slug || '',
      isActive: item.isActive !== false,
      isPopular: item.isPopular || false,
      sortOrder: item.sortOrder || 0,
      ...(item.logo && { logo: item.logo }),
      ...(item.country && { country: item.country }),
      ...(item.hexCode && { hexCode: item.hexCode }),
      ...(item.icon && { icon: item.icon }),
      ...(item.description && { description: item.description }),
      ...(item.category && { category: item.category }),
      ...(item.subcategory && { subcategory: item.subcategory }),
      ...(item.makeId && { makeId: item.makeId }),
      ...(item.regionId && { regionId: item.regionId }),
      ...(item.listingTypes && { listingTypes: item.listingTypes }),
      ...(item.isResidential !== undefined && { isResidential: item.isResidential }),
      ...(item.isCommercial !== undefined && { isCommercial: item.isCommercial }),
      ...(item.latitude !== undefined && { latitude: item.latitude }),
      ...(item.longitude !== undefined && { longitude: item.longitude }),
      ...(item.code && { code: item.code }),
      ...(item.yearStart !== undefined && { yearStart: item.yearStart }),
      ...(item.yearEnd !== undefined && { yearEnd: item.yearEnd }),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.name?.en) {
      toast.error('English name is required');
      return;
    }
    if (!editingItem) return;
    updateMutation.mutate({ id: editingItem.id, data: formData });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold">Parameters Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all combo field tables and reference data
          </p>
        </div>
      </div>

      {/* Table Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Table Type</CardTitle>
          <CardDescription>Choose which reference data table to manage</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTable} onValueChange={(value) => {
            setSelectedTable(value);
            setPage(1);
            setSearchQuery('');
            setIsActiveFilter(undefined);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a table type" />
            </SelectTrigger>
            <SelectContent>
              {TABLE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedTable && (
        <>
          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex-1 flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
                    onValueChange={(value) => {
                      setIsActiveFilter(
                        value === 'all' ? undefined : value === 'active'
                      );
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsCreateDialogOpen(true);
                      }}
                      className="gap-2 bg-amber-500 hover:bg-amber-600"
                    >
                      <Plus className="h-4 w-4" />
                      Create New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Item</DialogTitle>
                      <DialogDescription>
                        Add a new item to {TABLE_TYPES.find((t) => t.value === selectedTable)?.label}
                      </DialogDescription>
                    </DialogHeader>
                    <ComboFieldForm
                      formData={formData}
                      setFormData={setFormData}
                      tableType={selectedTable}
                      tableInfo={tableInfo?.data}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreate}
                        disabled={createMutation.isPending}
                        className="gap-2 bg-amber-500 hover:bg-amber-600"
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : fields.length === 0 ? (
                <div className="text-center py-12">
                  <Settings2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items found</p>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Popular</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {typeof item.name === 'string'
                                ? item.name
                                : item.name?.en || item.localizedName || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {item.slug}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={item.isActive ? 'default' : 'secondary'}
                                className={item.isActive ? 'bg-green-500' : ''}
                              >
                                {item.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {item.isPopular && (
                                <Badge variant="outline" className="bg-amber-50">
                                  Popular
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {item.isActive ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRestore(item.id)}
                                  >
                                    <RotateCcw className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages} (
                        {pagination.totalItems} total)
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
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
                <DialogDescription>
                  Update item in {TABLE_TYPES.find((t) => t.value === selectedTable)?.label}
                </DialogDescription>
              </DialogHeader>
              <ComboFieldForm
                formData={formData}
                setFormData={setFormData}
                tableType={selectedTable}
                tableInfo={tableInfo?.data}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="gap-2 bg-amber-500 hover:bg-amber-600"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// Combo Field Form Component
function ComboFieldForm({
  formData,
  setFormData,
  tableType,
  tableInfo,
}: {
  formData: any;
  setFormData: (data: any) => void;
  tableType: string;
  tableInfo?: any;
}) {
  // Fetch related data for dropdowns
  const { data: vehicleMakes } = useQuery({
    queryKey: ['combo-fields', 'vehicle_makes'],
    queryFn: () => api.getComboFields('vehicle_makes', { limit: 1000, isActive: true }),
    enabled: tableType === 'vehicle_models',
  });

  const { data: regions } = useQuery({
    queryKey: ['combo-fields', 'regions'],
    queryFn: () => api.getComboFields('regions', { limit: 1000, isActive: true }),
    enabled: tableType === 'cities',
  });

  const makes = Array.isArray((vehicleMakes as any)?.data) ? (vehicleMakes as any).data : [];
  const regionsList = Array.isArray((regions as any)?.data) ? (regions as any).data : [];

  return (
    <div className="space-y-4">
      {/* Multilingual Name */}
      <div className="space-y-2">
        <Label>Name (English) *</Label>
        <Input
          value={formData.name?.en || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: { ...formData.name, en: e.target.value },
            })
          }
          placeholder="English name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name (Amharic)</Label>
          <Input
            value={formData.name?.am || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: { ...formData.name, am: e.target.value },
              })
            }
            placeholder="አማርኛ"
          />
        </div>
        <div className="space-y-2">
          <Label>Name (Oromiffa)</Label>
          <Input
            value={formData.name?.om || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: { ...formData.name, om: e.target.value },
              })
            }
            placeholder="Oromiffa"
          />
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input
          value={formData.slug || ''}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="Auto-generated if empty"
        />
        <p className="text-xs text-muted-foreground">
          URL-friendly identifier (auto-generated from English name if not provided)
        </p>
      </div>

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isActive !== false}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
          <Label>Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.isPopular || false}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isPopular: checked })
            }
          />
          <Label>Popular</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Sort Order</Label>
        <Input
          type="number"
          value={formData.sortOrder || 0}
          onChange={(e) =>
            setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
          }
        />
      </div>

      {/* Table-specific fields */}
      {tableType === 'vehicle_makes' && (
        <>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input
              value={formData.logo || ''}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.country || ''}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Japan, USA, etc."
            />
          </div>
        </>
      )}

      {tableType === 'vehicle_colors' && (
        <div className="space-y-2">
          <Label>Hex Color Code</Label>
          <Input
            value={formData.hexCode || ''}
            onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
            placeholder="#000000"
          />
        </div>
      )}

      {(tableType === 'vehicle_body_types' ||
        tableType === 'vehicle_fuel_types' ||
        tableType === 'vehicle_transmissions' ||
        tableType === 'property_types' ||
        tableType === 'amenities' ||
        tableType === 'features') && (
        <div className="space-y-2">
          <Label>Icon</Label>
          <Input
            value={formData.icon || ''}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="Icon identifier or URL"
          />
        </div>
      )}

      {(tableType === 'vehicle_body_types' || tableType === 'property_types') && (
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={
              typeof formData.description === 'string'
                ? formData.description
                : formData.description?.en || ''
            }
            onChange={(e) =>
              setFormData({
                ...formData,
                description: { en: e.target.value },
              })
            }
            placeholder="Description"
            rows={3}
          />
        </div>
      )}

      {tableType === 'features' && (
        <>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category || ''}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle">Vehicle</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Input
              value={formData.subcategory || ''}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              placeholder="comfort, safety, etc."
            />
          </div>
        </>
      )}

      {tableType === 'amenities' && (
        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="outdoor, indoor, etc."
          />
        </div>
      )}

      {tableType === 'property_types' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isResidential || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isResidential: checked })
                }
              />
              <Label>Residential</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isCommercial || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCommercial: checked })
                }
              />
              <Label>Commercial</Label>
            </div>
          </div>
        </>
      )}

      {tableType === 'regions' && (
        <>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="AA, OR, etc."
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={formData.country || ''}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Ethiopia"
            />
          </div>
        </>
      )}

      {tableType === 'cities' && (
        <>
          <div className="space-y-2">
            <Label>Region *</Label>
            <Select
              value={formData.regionId || ''}
              onValueChange={(value) => setFormData({ ...formData, regionId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regionsList.map((region: any) => (
                  <SelectItem key={region.id} value={region.id}>
                    {typeof region.name === 'string' ? region.name : region.name?.en || region.localizedName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                }
                placeholder="9.1450"
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                }
                placeholder="38.7617"
              />
            </div>
          </div>
        </>
      )}

      {tableType === 'vehicle_models' && (
        <>
          <div className="space-y-2">
            <Label>Vehicle Make *</Label>
            <Select
              value={formData.makeId || ''}
              onValueChange={(value) => setFormData({ ...formData, makeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle make" />
              </SelectTrigger>
              <SelectContent>
                {makes.map((make: any) => (
                  <SelectItem key={make.id} value={make.id}>
                    {typeof make.name === 'string' ? make.name : make.name?.en || make.localizedName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year Start</Label>
              <Input
                type="number"
                value={formData.yearStart || ''}
                onChange={(e) =>
                  setFormData({ ...formData, yearStart: parseInt(e.target.value) || undefined })
                }
                placeholder="1982"
              />
            </div>
            <div className="space-y-2">
              <Label>Year End</Label>
              <Input
                type="number"
                value={formData.yearEnd || ''}
                onChange={(e) =>
                  setFormData({ ...formData, yearEnd: parseInt(e.target.value) || undefined })
                }
                placeholder="Leave empty for current"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

