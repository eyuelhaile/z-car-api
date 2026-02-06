'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  Home,
  X,
  Plus,
  Loader2,
  ImageIcon,
  Info,
  AlertCircle,
  Check,
  ChevronsUpDown,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCreateListing, useUpdateListing, useUploadImages, usePublishListing } from '@/hooks/use-listings';
import {
  useVehicleFormData,
  usePropertyFormData,
  useCities,
} from '@/hooks/use-reference-data';
import { FormSelectOption, CreateVehicleListingRequest, CreatePropertyListingRequest, Listing } from '@/types';
import { getFieldErrors } from '@/lib/error-utils';
import { getImageUrl } from '@/lib/utils';
import axios from 'axios';
import { useEffect } from 'react';

interface CreateListingPageProps {
  initialData?: Listing;
  listingId?: string;
}

export default function CreateListingPage({ initialData, listingId }: CreateListingPageProps = {}) {
  const router = useRouter();
  const isEditMode = !!initialData && !!listingId;
  
  // Set listing type from initial data or default to vehicle
  const [listingType, setListingType] = useState<'vehicle' | 'property'>(
    initialData?.type || 'vehicle'
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Track existing images (from API) that should be kept
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map(img => img.url || img.thumbnail).filter(Boolean);
    }
    return [];
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      const imageUrls = initialData.images.map(img => img.url || img.thumbnail).filter(Boolean);
      return imageUrls.map(url => getImageUrl(url));
    }
    return [];
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(() => {
    if (initialData) {
      const vehicleAttrs = initialData.vehicleAttributes || initialData.vehicleAttribute;
      const propertyAttrs = initialData.propertyAttributes || initialData.propertyAttribute;
      if (vehicleAttrs?.features) {
        return Array.isArray(vehicleAttrs.features) ? vehicleAttrs.features : [];
      }
      if (propertyAttrs?.features) {
        return Array.isArray(propertyAttrs.features) ? propertyAttrs.features : [];
      }
    }
    return [];
  });
  
  // Combobox open states
  const [makeOpen, setMakeOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [bodyTypeOpen, setBodyTypeOpen] = useState(false);
  const [fuelTypeOpen, setFuelTypeOpen] = useState(false);
  const [transmissionOpen, setTransmissionOpen] = useState(false);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [propertyConditionOpen, setPropertyConditionOpen] = useState(false);

  // Create/Update listing mutations
  const createListingMutation = useCreateListing();
  const updateListingMutation = useUpdateListing();
  const uploadImagesMutation = useUploadImages();
  const publishListingMutation = usePublishListing();
  
  // Track newly created listing ID for publish option
  const [newlyCreatedListingId, setNewlyCreatedListingId] = useState<string | null>(null);

  // Fetch form data from API
  const { data: vehicleFormData, isLoading: isLoadingVehicleForm } = useVehicleFormData();
  const { data: propertyFormData, isLoading: isLoadingPropertyForm } = usePropertyFormData();
  const { data: cities, isLoading: isLoadingCities } = useCities();

  // Helper function to initialize form data from initialData
  const getInitialFormData = () => {
    if (!initialData) {
      return {
        title: '',
        description: '',
        price: '',
        negotiable: true,
        city: '',
        address: '',
        contactPhone: '',
        make: '',
        year: '',
        bodyType: '',
        fuelType: '',
        transmission: '',
        mileage: '',
        condition: '',
        color: '',
        interiorColor: '',
        doors: '',
        seatCapacity: '',
        engineSize: '',
        engineCapacity: '',
        cylinders: '',
        horsepower: '',
        batteryCapacity: '',
        chargingTime: '',
        propertyType: '',
        listingPurpose: 'sale' as 'sale' | 'rent',
        bedrooms: '',
        bathrooms: '',
        area: '',
        floorNumber: '',
        yearBuilt: '',
        parkingSpaces: '',
        furnished: false,
        propertyCondition: '',
      };
    }

    const vehicleAttrs = initialData.vehicleAttributes || initialData.vehicleAttribute;
    const propertyAttrs = initialData.propertyAttributes || initialData.propertyAttribute;

    return {
      title: initialData.title || '',
      description: initialData.description || '',
      price: initialData.price?.toString() || '',
      negotiable: initialData.isNegotiable ?? true,
      city: initialData.city || '',
      address: initialData.location || '',
      contactPhone: initialData.user?.phone || '',
      // Vehicle fields
      make: vehicleAttrs?.makeSlug || vehicleAttrs?.make || '',
      year: vehicleAttrs?.year?.toString() || '',
      bodyType: vehicleAttrs?.bodyTypeSlug || vehicleAttrs?.bodyType || '',
      fuelType: vehicleAttrs?.fuelTypeSlug || vehicleAttrs?.fuelType || '',
      transmission: vehicleAttrs?.transmissionSlug || vehicleAttrs?.transmission || '',
      mileage: vehicleAttrs?.mileage?.toString() || '',
      condition: vehicleAttrs?.condition || '',
      color: vehicleAttrs?.color || '',
      interiorColor: vehicleAttrs?.interiorColor || '',
      doors: vehicleAttrs?.doors?.toString() || '',
      seatCapacity: (vehicleAttrs as any)?.seatCapacity?.toString() || '',
      engineSize: vehicleAttrs?.engineSize?.toString() || '',
      engineCapacity: (vehicleAttrs as any)?.engineCapacity?.toString() || '',
      cylinders: (vehicleAttrs as any)?.cylinders?.toString() || '',
      horsepower: (vehicleAttrs as any)?.horsepower?.toString() || '',
      batteryCapacity: (vehicleAttrs as any)?.batteryCapacity?.toString() || '',
      chargingTime: (vehicleAttrs as any)?.chargingTime?.toString() || '',
      // Property fields
      propertyType: propertyAttrs?.propertyType || '',
      listingPurpose: (propertyAttrs?.listingType as 'sale' | 'rent') || 'sale',
      bedrooms: propertyAttrs?.bedrooms?.toString() || '',
      bathrooms: propertyAttrs?.bathrooms?.toString() || '',
      area: propertyAttrs?.area?.toString() || '',
      floorNumber: propertyAttrs?.floorNumber?.toString() || '',
      yearBuilt: propertyAttrs?.yearBuilt?.toString() || '',
      parkingSpaces: propertyAttrs?.parkingSpaces?.toString() || '',
      furnished: propertyAttrs?.furnished ?? false,
      propertyCondition: propertyAttrs?.condition || '',
    };
  };

  // Form state - initialize with initialData if available
  const [formData, setFormData] = useState(getInitialFormData);

  // Selected amenities for property
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    if (initialData) {
      const propertyAttrs = initialData.propertyAttributes || initialData.propertyAttribute;
      if (propertyAttrs?.amenities) {
        return Array.isArray(propertyAttrs.amenities) ? propertyAttrs.amenities : [];
      }
    }
    return [];
  });
  
  // Field validation errors from API
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Update form when initialData changes (e.g., when data loads asynchronously)
  useEffect(() => {
    if (initialData) {
      const vehicleAttrs = initialData.vehicleAttributes || initialData.vehicleAttribute;
      const propertyAttrs = initialData.propertyAttributes || initialData.propertyAttribute;
      
      // Update form data if initialData changes
      setFormData((prev) => {
        // Only update if the data is actually different to avoid unnecessary re-renders
        const newData = {
          title: initialData.title || '',
          description: initialData.description || '',
          price: initialData.price?.toString() || '',
          negotiable: initialData.isNegotiable ?? true,
          city: initialData.city || '',
          address: initialData.location || '',
          contactPhone: initialData.user?.phone || '',
          make: vehicleAttrs?.makeSlug || vehicleAttrs?.make || '',
          year: vehicleAttrs?.year?.toString() || '',
          bodyType: vehicleAttrs?.bodyTypeSlug || vehicleAttrs?.bodyType || '',
          fuelType: vehicleAttrs?.fuelTypeSlug || vehicleAttrs?.fuelType || '',
          transmission: vehicleAttrs?.transmissionSlug || vehicleAttrs?.transmission || '',
          mileage: vehicleAttrs?.mileage?.toString() || '',
          condition: vehicleAttrs?.condition || '',
          color: vehicleAttrs?.color || '',
          interiorColor: vehicleAttrs?.interiorColor || '',
          doors: vehicleAttrs?.doors?.toString() || '',
          seatCapacity: (vehicleAttrs as any)?.seatCapacity?.toString() || '',
          engineSize: vehicleAttrs?.engineSize?.toString() || '',
          engineCapacity: (vehicleAttrs as any)?.engineCapacity?.toString() || '',
          cylinders: (vehicleAttrs as any)?.cylinders?.toString() || '',
          horsepower: (vehicleAttrs as any)?.horsepower?.toString() || '',
          batteryCapacity: (vehicleAttrs as any)?.batteryCapacity?.toString() || '',
          chargingTime: (vehicleAttrs as any)?.chargingTime?.toString() || '',
          propertyType: propertyAttrs?.propertyType || '',
          listingPurpose: (propertyAttrs?.listingType as 'sale' | 'rent') || 'sale',
          bedrooms: propertyAttrs?.bedrooms?.toString() || '',
          bathrooms: propertyAttrs?.bathrooms?.toString() || '',
          area: propertyAttrs?.area?.toString() || '',
          floorNumber: propertyAttrs?.floorNumber?.toString() || '',
          yearBuilt: propertyAttrs?.yearBuilt?.toString() || '',
          parkingSpaces: propertyAttrs?.parkingSpaces?.toString() || '',
          furnished: propertyAttrs?.furnished ?? false,
          propertyCondition: propertyAttrs?.condition || '',
        };
        
        // Check if data actually changed
        const hasChanged = Object.keys(newData).some(key => 
          prev[key as keyof typeof prev] !== newData[key as keyof typeof newData]
        );
        
        return hasChanged ? { ...prev, ...newData } : prev;
      });

      // Update features and amenities
      if (vehicleAttrs?.features) {
        const features = Array.isArray(vehicleAttrs.features) ? vehicleAttrs.features : [];
        setSelectedFeatures(prev => {
          const prevStr = prev.sort().join(',');
          const newStr = features.sort().join(',');
          return prevStr !== newStr ? features : prev;
        });
      }
      if (propertyAttrs?.amenities) {
        const amenities = Array.isArray(propertyAttrs.amenities) ? propertyAttrs.amenities : [];
        setSelectedAmenities(prev => {
          const prevStr = prev.sort().join(',');
          const newStr = amenities.sort().join(',');
          return prevStr !== newStr ? amenities : prev;
        });
      }
      if (propertyAttrs?.features) {
        const features = Array.isArray(propertyAttrs.features) ? propertyAttrs.features : [];
        setSelectedFeatures(prev => {
          const prevStr = prev.sort().join(',');
          const newStr = features.sort().join(',');
          return prevStr !== newStr ? features : prev;
        });
      }

      // Update existing images
      if (initialData.images && initialData.images.length > 0) {
        const imageUrls = initialData.images.map(img => img.url || img.thumbnail).filter(Boolean);
        const previewUrls = imageUrls.map(url => getImageUrl(url));
        setExistingImageUrls(prev => {
          const prevStr = prev.sort().join(',');
          const newStr = imageUrls.sort().join(',');
          return prevStr !== newStr ? imageUrls : prev;
        });
        setImagePreviews(prev => {
          const prevStr = prev.sort().join(',');
          const newStr = previewUrls.sort().join(',');
          return prevStr !== newStr ? previewUrls : prev;
        });
      }
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalImages = existingImageUrls.length + imageFiles.length + newFiles.length;
      
      if (totalImages > 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }

      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      setImageFiles([...imageFiles, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const isExistingImage = index < existingImageUrls.length;
    
    if (isExistingImage) {
      // Remove existing image - remove from both existingImageUrls and imagePreviews
      setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    } else {
      // Remove new image - need to adjust index for imageFiles array
      const newImageIndex = index - existingImageUrls.length;
      URL.revokeObjectURL(imagePreviews[index]);
      setImageFiles(imageFiles.filter((_, i) => i !== newImageIndex));
      setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    }
  };

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    const errors: Record<string, string> = {};
    
    // Validate common required fields
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.price?.trim() || isNaN(parseInt(formData.price)) || parseInt(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.city?.trim()) {
      errors.city = 'City is required';
    }
    
    // Validate images
    const hasImages = imageFiles.length > 0 || (isEditMode && existingImageUrls.length > 0);
    if (!hasImages) {
      errors.images = 'At least one image is required';
    }
    
    // Type-specific validation
    if (listingType === 'vehicle') {
      if (!formData.make?.trim()) {
        errors.make = 'Make is required';
      }
      if (!formData.year?.trim()) {
        errors.year = 'Year is required';
      }
      if (!formData.bodyType?.trim()) {
        errors.bodyType = 'Body type is required';
      }
      if (!formData.fuelType?.trim()) {
        errors.fuelType = 'Fuel type is required';
      }
      if (!formData.transmission?.trim()) {
        errors.transmission = 'Transmission is required';
      }
      // Condition is optional
    } else {
      if (!formData.propertyType?.trim()) {
        errors.propertyType = 'Property type is required';
      }
    }
    
    // If there are validation errors, set them and stop
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fill all required fields');
      return;
    }
    
    // Clear errors if validation passes
    setFieldErrors({});

    try {
      let listingData: CreateVehicleListingRequest | CreatePropertyListingRequest;

      if (listingType === 'vehicle') {

        const isElectric = formData.fuelType === 'electric';

        listingData = {
          type: 'vehicle',
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          currency: 'ETB',
          negotiable: formData.negotiable,
          city: formData.city,
          address: formData.address || undefined,
          contactPhone: formData.contactPhone || undefined,
          vehicleAttributes: {
            make: formData.make,
            year: parseInt(formData.year),
            bodyType: formData.bodyType,
            fuelType: formData.fuelType,
            transmission: formData.transmission,
            mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
            condition: formData.condition,
            color: formData.color || undefined,
            interiorColor: formData.interiorColor || undefined,
            seatCapacity: formData.seatCapacity ? parseInt(formData.seatCapacity) : undefined,
            engineCapacity: !isElectric && formData.engineCapacity ? parseInt(formData.engineCapacity) : undefined,
            cylinders: !isElectric && formData.cylinders ? parseInt(formData.cylinders) : undefined,
            horsepower: formData.horsepower ? parseInt(formData.horsepower) : undefined,
            batteryCapacity: isElectric && formData.batteryCapacity ? parseInt(formData.batteryCapacity) : undefined,
            chargingTime: isElectric && formData.chargingTime ? parseFloat(formData.chargingTime) : undefined,
            features: selectedFeatures,
          },
        };
      } else {
        listingData = {
          type: 'property',
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          currency: 'ETB',
          negotiable: formData.negotiable,
          city: formData.city,
          address: formData.address || undefined,
          contactPhone: formData.contactPhone || undefined,
          propertyAttributes: {
            propertyType: formData.propertyType,
            listingType: formData.listingPurpose,
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
            area: formData.area ? parseInt(formData.area) : undefined,
            floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : undefined,
            yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
            parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : undefined,
            furnished: formData.furnished,
            condition: formData.propertyCondition,
            amenities: selectedAmenities,
            features: selectedFeatures,
          },
        };
      }

      // Step 1: Upload new images FIRST (if any)
      let imageUrls: string[] = [];
      
      // Start with existing images that user kept (not removed)
      imageUrls = [...existingImageUrls];
      
      // Upload new images if any
      if (imageFiles.length > 0) {
        try {
          const uploadResult = await uploadImagesMutation.mutateAsync({
            files: imageFiles,
            folder: 'listings',
          });
          // Extract original URLs from upload response and add to existing images
          const newImageUrls = uploadResult.map((img) => img.original);
          imageUrls = [...imageUrls, ...newImageUrls];
        } catch (uploadError) {
          // Image upload failed - show error and stop
          if (axios.isAxiosError(uploadError)) {
            const uploadErrors = getFieldErrors(uploadError);
            if (uploadErrors.images) {
              setFieldErrors({ images: uploadErrors.images });
            }
            const errorMessage = uploadError.response?.data?.message || 'Failed to upload images. Please try again.';
            toast.error('Image upload failed', {
              description: errorMessage,
            });
          }
          return; // Stop here, don't create/update listing if images failed
        }
      }
      
      // Step 2: Create or Update listing with image URLs
      listingData.images = imageUrls;
      
      if (isEditMode && listingId) {
        // Update existing listing
        await updateListingMutation.mutateAsync({
          id: listingId,
          data: listingData as Partial<Listing>,
        });
        toast.success('Listing updated successfully!');
      } else {
        // Create new listing
        const result = await createListingMutation.mutateAsync(listingData);
        toast.success('Listing created successfully!', {
          description: 'Your listing is pending. Publish it to make it active.',
        });
        // Store the created listing ID to show publish option
        setNewlyCreatedListingId(result.id);
        // Don't redirect immediately - show publish option
      }
    } catch (error) {
      // Extract field-specific errors from listing creation
      if (axios.isAxiosError(error)) {
        const errors = getFieldErrors(error);
        if (Object.keys(errors).length > 0) {
          // Map nested field errors to form fields
          const mappedErrors: Record<string, string> = {};
          Object.entries(errors).forEach(([field, message]) => {
            // Handle nested fields like "vehicleAttributes.make" -> "make"
            if (field.includes('.')) {
              const parts = field.split('.');
              const lastPart = parts[parts.length - 1];
              // Map common nested fields
              if (parts[0] === 'vehicleAttributes' || parts[0] === 'propertyAttributes') {
                mappedErrors[lastPart] = message;
              } else {
                mappedErrors[field] = message;
              }
            } else {
              mappedErrors[field] = message;
            }
          });
          setFieldErrors(mappedErrors);
          // Show general error message
          const errorMessage = error.response?.data?.message || 'Validation failed. Please check the errors below.';
          toast.error('Validation failed', {
            description: errorMessage,
          });
        }
      }
      // Error also handled by mutation hooks for general errors
    }
  };

  const isLoading = createListingMutation.isPending || updateListingMutation.isPending || uploadImagesMutation.isPending;
  const isLoadingFormData = listingType === 'vehicle' ? isLoadingVehicleForm : isLoadingPropertyForm;

  const SelectLoading = () => (
    <Skeleton className="h-11 w-full" />
  );

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1989 + 1 }, (_, i) => currentYear + 1 - i);

  // Get selected option label
  const getOptionLabel = (options: FormSelectOption[] | undefined, value: string) => {
    return options?.find(o => o.value === value)?.label || '';
  };

  // Convert cities to options format
  const cityOptions: FormSelectOption[] = cities?.map(city => ({
    value: city.slug,
    label: city.name,
  })) || [];

  const isElectricVehicle = formData.fuelType === 'electric';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">{isEditMode ? 'Edit Listing' : 'Create New Listing'}</h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode ? 'Update the details below to modify your listing' : 'Fill in the details below to create your listing'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Listing Type Selection */}
          <Card>
            <CardHeader>
            <CardTitle>What are you selling?</CardTitle>
            <CardDescription>{isEditMode ? 'Listing type cannot be changed' : 'Select the type of listing you want to create'}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={listingType}
                onValueChange={(v) => {
                  if (!isEditMode) {
                    setListingType(v as 'vehicle' | 'property');
                    setSelectedFeatures([]);
                    setSelectedAmenities([]);
                  }
                }}
                className="grid grid-cols-2 gap-4"
                disabled={isEditMode}
              >
                <label
                  className={cn(
                    'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all',
                    listingType === 'vehicle'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border hover:border-amber-200',
                    isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  )}
                >
                  <RadioGroupItem value="vehicle" className="sr-only" disabled={isEditMode} />
                  <div className={cn(
                    'p-2 sm:p-3 rounded-full shrink-0',
                    listingType === 'vehicle' ? 'bg-amber-500 text-white' : 'bg-muted'
                  )}>
                    <Car className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">Vehicle</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Car, SUV, Truck, etc.</p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all',
                    listingType === 'property'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-border hover:border-amber-200',
                    isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  )}
                >
                  <RadioGroupItem value="property" className="sr-only" disabled={isEditMode} />
                  <div className={cn(
                    'p-2 sm:p-3 rounded-full shrink-0',
                    listingType === 'property' ? 'bg-amber-500 text-white' : 'bg-muted'
                  )}>
                    <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold">Property</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Apartment, House, Villa</p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Provide the main details of your listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={listingType === 'vehicle' ? 'e.g., 2020 Toyota Camry LE' : 'e.g., Modern 3 Bedroom Apartment in Bole'}
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    // Clear error when user types
                    if (fieldErrors.title) {
                      setFieldErrors({ ...fieldErrors, title: '' });
                    }
                  }}
                  className={cn("h-11", fieldErrors.title && "border-red-500")}
                  required
                />
                {fieldErrors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your listing in detail..."
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    // Clear error when user types
                    if (fieldErrors.description) {
                      setFieldErrors({ ...fieldErrors, description: '' });
                    }
                  }}
                  rows={4}
                  className={cn(fieldErrors.description && "border-red-500")}
                  required
                />
                {fieldErrors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ETB) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => {
                      setFormData({ ...formData, price: e.target.value });
                      // Clear error when user types
                      if (fieldErrors.price) {
                        setFieldErrors({ ...fieldErrors, price: '' });
                      }
                    }}
                    className={cn("h-11", fieldErrors.price && "border-red-500")}
                    required
                  />
                  {fieldErrors.price && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.price}
                    </p>
                  )}
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => setFormData({ ...formData, negotiable: !!checked })}
                    />
                    <span className="text-sm">Price is negotiable</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  {isLoadingCities ? (
                    <SelectLoading />
                  ) : (
                    <Popover open={cityOpen} onOpenChange={setCityOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityOpen}
                          className={cn(
                            "w-full h-11 justify-between font-normal",
                            fieldErrors.city && "border-red-500"
                          )}
                        >
                          {formData.city
                            ? cityOptions.find(c => c.value === formData.city)?.label
                            : "Select city..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search city..." />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup>
                              {cityOptions.map((city) => (
                                <CommandItem
                                  key={city.value}
                                  value={city.label}
                                  onSelect={() => {
                                    setFormData({ ...formData, city: city.value });
                                    setCityOpen(false);
                                    if (fieldErrors.city) {
                                      setFieldErrors({ ...fieldErrors, city: '' });
                                    }
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.city === city.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {city.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                          </PopoverContent>
                        </Popover>
                  )}
                  {fieldErrors.city && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.city}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address/Location</Label>
                  <Input
                    id="address"
                    placeholder="e.g., Bole, near Edna Mall"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="+251911234567"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Type-specific Details */}
          {listingType === 'vehicle' ? (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
                <CardDescription>Provide specific information about your vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoadingFormData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectLoading />
                      <SelectLoading />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectLoading />
                      <SelectLoading />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Make */}
                    <div className="space-y-2">
                      <Label>Make *</Label>
                      <Popover open={makeOpen} onOpenChange={setMakeOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={makeOpen}
                            className={cn(
                              "w-full h-11 justify-between font-normal",
                              fieldErrors.make && "border-red-500"
                            )}
                          >
                            {getOptionLabel(vehicleFormData?.makes, formData.make) || "Select make..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search make..." />
                            <CommandList>
                              <CommandEmpty>No make found.</CommandEmpty>
                              <CommandGroup>
                                {vehicleFormData?.makes.map((make) => (
                                  <CommandItem
                                    key={make.value}
                                    value={make.label}
                                    onSelect={() => {
                                      setFormData({ ...formData, make: make.value });
                                      setMakeOpen(false);
                                      if (fieldErrors.make) {
                                        setFieldErrors({ ...fieldErrors, make: '' });
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.make === make.value ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {make.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {fieldErrors.make && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {fieldErrors.make}
                        </p>
                      )}
                    </div>

                    {/* Year & Body Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year *</Label>
                        <Select
                          value={formData.year}
                          onValueChange={(v) => {
                            setFormData({ ...formData, year: v });
                            if (fieldErrors.year) {
                              setFieldErrors({ ...fieldErrors, year: '' });
                            }
                          }}
                        >
                          <SelectTrigger className={cn("h-11", fieldErrors.year && "border-red-500")}>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldErrors.year && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.year}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Body Type *</Label>
                        <Popover open={bodyTypeOpen} onOpenChange={setBodyTypeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-11 justify-between font-normal",
                                fieldErrors.bodyType && "border-red-500"
                              )}
                            >
                              {getOptionLabel(vehicleFormData?.bodyTypes, formData.bodyType) || "Select body type..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search body type..." />
                              <CommandList>
                                <CommandEmpty>No body type found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicleFormData?.bodyTypes.map((type) => (
                                    <CommandItem
                                      key={type.value}
                                      value={type.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, bodyType: type.value });
                                        setBodyTypeOpen(false);
                                        if (fieldErrors.bodyType) {
                                          setFieldErrors({ ...fieldErrors, bodyType: '' });
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.bodyType === type.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {type.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldErrors.bodyType && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.bodyType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fuel Type & Transmission */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fuel Type *</Label>
                        <Popover open={fuelTypeOpen} onOpenChange={setFuelTypeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-11 justify-between font-normal",
                                fieldErrors.fuelType && "border-red-500"
                              )}
                            >
                              {getOptionLabel(vehicleFormData?.fuelTypes, formData.fuelType) || "Select fuel type..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search fuel type..." />
                              <CommandList>
                                <CommandEmpty>No fuel type found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicleFormData?.fuelTypes.map((fuel) => (
                                    <CommandItem
                                      key={fuel.value}
                                      value={fuel.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, fuelType: fuel.value });
                                        setFuelTypeOpen(false);
                                        if (fieldErrors.fuelType) {
                                          setFieldErrors({ ...fieldErrors, fuelType: '' });
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.fuelType === fuel.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {fuel.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldErrors.fuelType && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.fuelType}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Transmission *</Label>
                        <Popover open={transmissionOpen} onOpenChange={setTransmissionOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-11 justify-between font-normal",
                                fieldErrors.transmission && "border-red-500"
                              )}
                            >
                              {getOptionLabel(vehicleFormData?.transmissions, formData.transmission) || "Select transmission..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search transmission..." />
                              <CommandList>
                                <CommandEmpty>No transmission found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicleFormData?.transmissions.map((trans) => (
                                    <CommandItem
                                      key={trans.value}
                                      value={trans.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, transmission: trans.value });
                                        setTransmissionOpen(false);
                                        if (fieldErrors.transmission) {
                                          setFieldErrors({ ...fieldErrors, transmission: '' });
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.transmission === trans.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {trans.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldErrors.transmission && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.transmission}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mileage & Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Mileage (km)</Label>
                        <Input
                          id="mileage"
                          type="number"
                          placeholder="e.g., 45000"
                          value={formData.mileage}
                          onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Popover open={conditionOpen} onOpenChange={setConditionOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-11 justify-between font-normal",
                                fieldErrors.condition && "border-red-500"
                              )}
                            >
                              {getOptionLabel(vehicleFormData?.conditions, formData.condition) || "Select condition..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search condition..." />
                              <CommandList>
                                <CommandEmpty>No condition found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicleFormData?.conditions.map((cond) => (
                                    <CommandItem
                                      key={cond.value}
                                      value={cond.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, condition: cond.value });
                                        setConditionOpen(false);
                                        if (fieldErrors.condition) {
                                          setFieldErrors({ ...fieldErrors, condition: '' });
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.condition === cond.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {cond.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldErrors.condition && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.condition}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Color & Interior Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Exterior Color</Label>
                        <Popover open={colorOpen} onOpenChange={setColorOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full h-11 justify-between font-normal"
                            >
                              {formData.color ? (
                                <span className="flex items-center gap-2">
                                  {vehicleFormData?.colors.find(c => c.value === formData.color)?.metadata?.hexCode && (
                                    <div
                                      className="w-4 h-4 rounded-full border"
                                      style={{ backgroundColor: vehicleFormData?.colors.find(c => c.value === formData.color)?.metadata?.hexCode as string }}
                                    />
                                  )}
                                  {getOptionLabel(vehicleFormData?.colors, formData.color)}
                                </span>
                              ) : (
                                "Select color..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search color..." />
                              <CommandList>
                                <CommandEmpty>No color found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicleFormData?.colors.map((color) => (
                                    <CommandItem
                                      key={color.value}
                                      value={color.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, color: color.value });
                                        setColorOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.color === color.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex items-center gap-2">
                                        {color.metadata?.hexCode && (
                                          <div
                                            className="w-4 h-4 rounded-full border"
                                            style={{ backgroundColor: color.metadata.hexCode as string }}
                                          />
                                        )}
                                        {color.label}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interiorColor">Interior Color</Label>
                        <Input
                          id="interiorColor"
                          placeholder="e.g., Black"
                          value={formData.interiorColor}
                          onChange={(e) => setFormData({ ...formData, interiorColor: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Seat Capacity & Number of Cylinders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seatCapacity">Seat Capacity</Label>
                        <Input
                          id="seatCapacity"
                          type="number"
                          placeholder="e.g., 5"
                          value={formData.seatCapacity}
                          onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      {!isElectricVehicle && (
                        <div className="space-y-2">
                          <Label htmlFor="cylinders">Number of Cylinders</Label>
                          <Input
                            id="cylinders"
                            type="number"
                            placeholder="e.g., 4, 6, 8"
                            value={formData.cylinders}
                            onChange={(e) => setFormData({ ...formData, cylinders: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      )}
                    </div>

                    {/* Engine Details (only for non-electric) */}
                    {!isElectricVehicle && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
                          <Input
                            id="engineCapacity"
                            type="number"
                            placeholder="e.g., 2494"
                            value={formData.engineCapacity}
                            onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="horsepower">Horsepower</Label>
                          <Input
                            id="horsepower"
                            type="number"
                            placeholder="e.g., 203"
                            value={formData.horsepower}
                            onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                    )}

                    {/* Electric Vehicle Details */}
                    {isElectricVehicle && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
                          <Input
                            id="batteryCapacity"
                            type="number"
                            placeholder="e.g., 60"
                            value={formData.batteryCapacity}
                            onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chargingTime">Charging Time (hours)</Label>
                          <Input
                            id="chargingTime"
                            type="number"
                            step="0.5"
                            placeholder="e.g., 8.5"
                            value={formData.chargingTime}
                            onChange={(e) => setFormData({ ...formData, chargingTime: e.target.value })}
                            className="h-11"
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label>Features</Label>
                      <div className="flex flex-wrap gap-2">
                        {vehicleFormData?.features?.map((feature) => (
                          <Badge
                            key={feature.value}
                            variant={selectedFeatures.includes(feature.value) ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer transition-colors px-3 py-1.5',
                              selectedFeatures.includes(feature.value) && 'bg-amber-500 hover:bg-amber-600'
                            )}
                            onClick={() => toggleFeature(feature.value)}
                          >
                            {feature.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Provide specific information about your property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {isLoadingFormData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectLoading />
                      <SelectLoading />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Property Type & Listing Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Property Type *</Label>
                        <Popover open={propertyTypeOpen} onOpenChange={setPropertyTypeOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-11 justify-between font-normal",
                                fieldErrors.propertyType && "border-red-500"
                              )}
                            >
                              {getOptionLabel(propertyFormData?.propertyTypes, formData.propertyType) || "Select property type..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search property type..." />
                              <CommandList>
                                <CommandEmpty>No property type found.</CommandEmpty>
                                <CommandGroup>
                                  {propertyFormData?.propertyTypes.map((type) => (
                                    <CommandItem
                                      key={type.value}
                                      value={type.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, propertyType: type.value });
                                        setPropertyTypeOpen(false);
                                        if (fieldErrors.propertyType) {
                                          setFieldErrors({ ...fieldErrors, propertyType: '' });
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.propertyType === type.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {type.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldErrors.propertyType && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors.propertyType}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Listing Type *</Label>
                        <Select
                          value={formData.listingPurpose}
                          onValueChange={(v) => setFormData({ ...formData, listingPurpose: v as 'sale' | 'rent' })}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          placeholder="e.g., 2"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Area & Floor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="area">Area (m²)</Label>
                        <Input
                          id="area"
                          type="number"
                          placeholder="e.g., 150"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floorNumber">Floor Number</Label>
                        <Input
                          id="floorNumber"
                          type="number"
                          placeholder="e.g., 5"
                          value={formData.floorNumber}
                          onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Year Built & Parking */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearBuilt">Year Built</Label>
                        <Input
                          id="yearBuilt"
                          type="number"
                          placeholder="e.g., 2022"
                          value={formData.yearBuilt}
                          onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parkingSpaces">Parking Spaces</Label>
                        <Input
                          id="parkingSpaces"
                          type="number"
                          placeholder="e.g., 1"
                          value={formData.parkingSpaces}
                          onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Condition & Furnished */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Popover open={propertyConditionOpen} onOpenChange={setPropertyConditionOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full h-11 justify-between font-normal"
                            >
                              {getOptionLabel(propertyFormData?.conditions, formData.propertyCondition) || "Select condition..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search condition..." />
                              <CommandList>
                                <CommandEmpty>No condition found.</CommandEmpty>
                                <CommandGroup>
                                  {propertyFormData?.conditions.map((cond) => (
                                    <CommandItem
                                      key={cond.value}
                                      value={cond.label}
                                      onSelect={() => {
                                        setFormData({ ...formData, propertyCondition: cond.value });
                                        setPropertyConditionOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          formData.propertyCondition === cond.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {cond.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            id="furnished"
                            checked={formData.furnished}
                            onCheckedChange={(checked) => setFormData({ ...formData, furnished: !!checked })}
                          />
                          <span className="text-sm">Property is furnished</span>
                        </label>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Amenities</Label>
                      <div className="flex flex-wrap gap-2">
                        {propertyFormData?.amenities?.map((amenity) => (
                          <Badge
                            key={amenity.value}
                            variant={selectedAmenities.includes(amenity.value) ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer transition-colors px-3 py-1.5',
                              selectedAmenities.includes(amenity.value) && 'bg-amber-500 hover:bg-amber-600'
                            )}
                            onClick={() => toggleAmenity(amenity.value)}
                          >
                            {amenity.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Features</Label>
                      <div className="flex flex-wrap gap-2">
                        {propertyFormData?.features?.map((feature) => (
                          <Badge
                            key={feature.value}
                            variant={selectedFeatures.includes(feature.value) ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer transition-colors px-3 py-1.5',
                              selectedFeatures.includes(feature.value) && 'bg-emerald-500 hover:bg-emerald-600'
                            )}
                            onClick={() => toggleFeature(feature.value)}
                          >
                            {feature.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Add up to 10 photos. The first photo will be used as the cover image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {imagePreviews.map((image, index) => {
                  const isExisting = index < existingImageUrls.length;
                  return (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                      <img src={image} alt={`${isExisting ? 'Existing' : 'New'} image ${index + 1}`} className="w-full h-full object-cover" />
                      {isExisting && (
                        <Badge className="absolute top-2 left-2 bg-blue-500/90 text-white text-xs">
                          Existing
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 bg-amber-500">Cover</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-opacity opacity-0 group-hover:opacity-100"
                        title={isExisting ? 'Remove existing image' : 'Remove new image'}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
                
                {(existingImageUrls.length + imageFiles.length) < 10 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-amber-500 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-amber-500">
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span className="text-xs text-center">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {((existingImageUrls.length + imageFiles.length) === 0 || fieldErrors.images) && (
                <div className={cn(
                  "flex items-center gap-2 mt-4 p-3 sm:p-4 rounded-lg border",
                  fieldErrors.images 
                    ? "bg-red-50 border-red-200" 
                    : "bg-amber-50 border-amber-200"
                )}>
                  <AlertCircle className={cn(
                    "h-5 w-5 shrink-0",
                    fieldErrors.images ? "text-red-600" : "text-amber-600"
                  )} />
                  <p className={cn(
                    "text-sm",
                    fieldErrors.images ? "text-red-800" : "text-amber-800"
                  )}>
                    {fieldErrors.images || 'At least one photo is required to create a listing.'}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 p-3 sm:p-4 rounded-lg bg-muted/50">
                <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Use high-quality photos taken in good lighting. Max 5MB per image.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 sm:gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadImagesMutation.isPending ? 'Uploading...' : (isEditMode ? 'Updating...' : 'Creating...')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isEditMode ? 'Update Listing' : 'Create Listing'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Publish Dialog - shown after creating a new listing */}
        <Dialog open={!!newlyCreatedListingId} onOpenChange={(open) => {
          if (!open) {
            setNewlyCreatedListingId(null);
            router.push('/dashboard/listings');
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Listing Created Successfully!</DialogTitle>
              <DialogDescription>
                Your listing has been created and is currently pending. Would you like to publish it now to make it active and visible to buyers?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNewlyCreatedListingId(null);
                  router.push('/dashboard/listings');
                }}
                disabled={publishListingMutation.isPending}
              >
                Publish Later
              </Button>
              <Button
                onClick={async () => {
                  if (newlyCreatedListingId) {
                    try {
                      await publishListingMutation.mutateAsync(newlyCreatedListingId);
                      setNewlyCreatedListingId(null);
                      router.push('/dashboard/listings');
                    } catch (error) {
                      // Error is handled by the mutation
                    }
                  }
                }}
                disabled={publishListingMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                {publishListingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Publish Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
