import { createFileRoute } from '@tanstack/react-router';                                                                               
import React, { useState, useEffect } from 'react';                                                                                                 
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';                                                                   
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; 
import { toast } from "sonner";
import PropertyForm from '@/components/dashboard/property-form/property-form'; // Import PropertyForm
import { Spinner } from '@/components/ui/spinner'; // Import Spinner
import { getYoutubeEmbedUrl } from "@/lib/utils";
import { useAuthStore } from '@/store/authStore';
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/properties')({
  component: DashboardProperties,
  staticData: {
    title: 'Properties',
  },
});

const columns = [
    {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ cell }) => (
          <Checkbox
            key={`checkbox-${cell.id}-${cell.getContext().isChecked}`}
            checked={cell.getContext().isChecked}
            onCheckedChange={(value) => cell.row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
    {
      id: "count",
      header: "ID",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'title', header: 'Title' },
    { 
      accessorKey: 'thumbnail_url', // Display thumbnail image if available
      header: 'Image',
      cell: ({ row }) => row.original.thumbnail_url ? (
        <img src={row.original.thumbnail_url} alt={row.original.title} className="object-cover w-10 h-10 rounded-md" />
      ) : (
        <span className="text-muted-foreground">No Image</span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    { accessorKey: 'property_type', header: 'Type' },
    { accessorKey: 'price_amount', header: 'Price' },
    { 
      accessorKey: 'category_name', 
      header: 'Category',
      cell: ({ row }) => row.original.category_name || 'N/A',
      enableSorting: true,
      enableHiding: true,
    },
    { 
      accessorKey: 'city_name', 
      header: 'City',
      cell: ({ row }) => row.original.city_name || 'N/A',
      enableSorting: true,
      enableHiding: true,
    },
    { 
      accessorKey: 'society_name', 
      header: 'Society',
      cell: ({ row }) => row.original.society_name || 'N/A',
      enableSorting: true,
      enableHiding: true,
    },
    { 
      accessorKey: 'phase_name', 
      header: 'Phase',
      cell: ({ row }) => row.original.phase_name || 'N/A',
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: 'hide', // This matches the 'hide' column in the API response which indicates status
      header: 'Status',
      cell: ({ row }) => {
        const isHidden = row.original.hide;
        return (
          <Badge variant={isHidden ? 'destructive' : 'secondary'}>
            {isHidden ? 'Hidden' : 'Public'}
          </Badge>
        );
      },
    },
    { 
      accessorKey: 'updated_at', 
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Last Updated
            {sorted === "asc" && <ArrowUp className="w-4 h-4 ml-2" />}
            {sorted === "desc" && <ArrowDown className="w-4 h-4 ml-2" />}
            {!sorted && <ArrowUpDown className="w-4 h-4 ml-2" />}
          </Button>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
];

function DashboardProperties() {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/properties?is_file=0&all=1"); // Explicitly fetch properties where is_file is false
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProperties(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load properties: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const prepareFormData = (data) => {
    const formData = new FormData();

    // Append basic form data
    for (const key in data) {
      if (['thumbnailMedia', 'galleryMedia', 'videoMedia', 'videoInputMethod', 'videoEmbedLinkForMedia', 'removedGalleryImageIds', 'id', 'related_products', 'related_properties', 'labels', 'existing_labels'].includes(key)) continue; // Skip handled separately or internal

      if (key.startsWith('_')) continue; // Skip internal form state variables

      // Convert boolean to '0' or '1' as PHP expects
      if (typeof data[key] === 'boolean') {
        formData.append(key, data[key] ? '1' : '0');
      }
      // Handle empty string for relationship IDs
      else if (['category_id', 'city_id', 'society_id', 'phase_id'].includes(key) && data[key] === "") {
        formData.append(key, '0'); // Send '0' or null for backend to handle SET NULL
      }
      // Handle arrays for features (comma-separated string)
      else if (key === 'features') {
        formData.append(key, String(data[key]));
      }
      else if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }

    // Explicitly ensure is_file is false for this form
    formData.set('is_file', '0');

    // Handle thumbnail media
    const { thumbnailMedia } = data;
    if (thumbnailMedia && thumbnailMedia.length > 0 && thumbnailMedia[0].file) {
      formData.append('thumbnail_image', thumbnailMedia[0].file);
    } else if (thumbnailMedia && thumbnailMedia.length > 0 && thumbnailMedia[0].url) {
       // Check if it's a new URL selection (duplication or picked from gallery in a future feature)
       // We pass it as thumbnail_image_url if it is intended to be duplicated/used
       formData.append('thumbnail_image_url', thumbnailMedia[0].url);
    } else if (thumbnailMedia && thumbnailMedia.length === 0) {
      // Logic for removal if needed, though usually handled by replacement or explicit flag if we tracked "was there an image before"
      formData.append('thumbnail_image_removed', 'true');
    }

    // Handle gallery media
    const { galleryMedia, removedGalleryImageIds } = data;
    if (removedGalleryImageIds && removedGalleryImageIds.length > 0) {
        formData.append('removed_gallery_image_ids', JSON.stringify(removedGalleryImageIds));
    }
    
    if (galleryMedia) {
        galleryMedia.forEach((item, index) => {
        if (item.file) { // Case 1: NEWLY UPLOADED FILE
            formData.append(`gallery_images[${index}]`, item.file);
            formData.append(`gallery_images_data[${index}][is_new]`, 'true'); 
        } else if (item.id) { // Case 2: EXISTING DATABASE IMAGE (for EDIT mode)
            // Send the actual DB ID, URL, and position. Backend uses ID to match and update position.
            formData.append(`gallery_images_data[${index}][id]`, item.id);
            formData.append(`gallery_images_data[${index}][url]`, item.url); // Include URL, it's useful
            formData.append(`gallery_images_data[${index}][position]`, index);
        } else if (item.url) { // Case 3: DUPLICATED IMAGE (for CREATE mode after duplication, item.id is undefined/UUID, url is present)
            // This is for create_property duplicating a URL.
            // No item.id here, just the URL to duplicate.
            formData.append(`gallery_images_data[${index}][url]`, item.url);
            formData.append(`gallery_images_data[${index}][position]`, index);
        }
        });
    }

    // Handle video media
    const { videoMedia, videoInputMethod, videoEmbedLinkForMedia } = data;
    let hasVideo = false;

    if (videoInputMethod === 'upload') {
        if (videoMedia && videoMedia.length > 0) {
            if (videoMedia[0].file) {
                formData.append('video', videoMedia[0].file);
                hasVideo = true;
            } else if (videoMedia[0].url) {
                // Existing video, keep it (send URL for duplication if needed)
                formData.append('video_url', videoMedia[0].url);
                hasVideo = true;
            }
        }
    } else if (videoInputMethod === 'embed') {
        if (videoEmbedLinkForMedia) {
            formData.append('video_embed_link', getYoutubeEmbedUrl(videoEmbedLinkForMedia));
            hasVideo = true;
        }
    }

    if (!hasVideo) {
        formData.append('video_removed', 'true');
    }

    // Handle related products
    const relatedProps = data.related_properties || data.related_products || [];
    relatedProps.forEach((id, index) => {
      formData.append(`related_properties[${index}]`, id);
    });

    // Handle labels
    const existingLabels = data.existing_labels || data.labels || [];
    existingLabels.forEach((id, index) => {
      formData.append(`existing_labels[${index}]`, id);
    });

    return formData;
  };

  const handleAddProperty = async (data) => {
    setIsSubmitting(true);
    try {
        const formData = prepareFormData(data);
        const response = await apiFetch("/properties", {
          method: "POST",
          body: formData,
          headers: {} // apiFetch merges headers, passing empty to avoid default JSON content-type if needed but actually apiFetch handles it
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        toast.success("Property added successfully!");
        fetchProperties();
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to add property: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditProperty = async (data) => {
    setIsSubmitting(true);
    try {
        const formData = prepareFormData(data);
        formData.append('_method', 'PATCH');

        const response = await apiFetch(`/properties/${data.id}`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        toast.success("Property updated successfully!");
        fetchProperties();
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to update property: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/properties/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      toast.success("Property deleted successfully!");
      fetchProperties();
    } catch (e) {
      toast.error("Failed to delete property: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      toast.warning("No rows selected for deletion.");
      return;
    }
    setIsSubmitting(true);
    try {
            const deletePromises = selectedRows.map((row) =>
              apiFetch(`/properties/${row.original.id}`, {
                method: "DELETE",
              })
            );
      const results = await Promise.allSettled(deletePromises);
      
      const failedDeletes = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedDeletes.push(`ID ${selectedRows[index].original.id}: Network or server error`);
        } else if (!result.value.ok) {
          const errorPromise = result.value.json().then(err => `ID ${selectedRows[index].original.id}: ${err.detail || result.value.statusText}`).catch(() => `ID ${selectedRows[index].original.id}: ${result.value.statusText}`);
          failedDeletes.push(errorPromise);
        }
      });

      const finalFailedMessages = await Promise.all(failedDeletes);

      if (finalFailedMessages.length === 0) {
        toast.success("Selected properties deleted successfully!");
      } else {
        toast.error(`Failed to delete ${finalFailedMessages.length} property(s): ${finalFailedMessages.join(', ')}`);
      }
      
      setSelectedRows([]);
      fetchProperties();

    } catch (e) {
      toast.error("Error during batch deletion: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = async () => {
    const selectedData = selectedRows.map(row => row.original);
    if (selectedData.length === 0) {
        toast.warning("No rows selected for export.");
        return;
    }
    if (!tableInstance) {
        toast.error("Table instance not available for export.");
        return;
    }

    setIsSubmitting(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const visibleColumns = tableInstance.getAllColumns().filter(
            column => column.getIsVisible() && column.columnDef.accessorKey
        );
        
        // Create header row
        const headers = visibleColumns.map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

        // Create data rows
        selectedData.forEach(item => {
            const row = visibleColumns.map(col => {
                let value = item[col.columnDef.accessorKey];
                value = value === null || value === undefined ? "" : String(value);
                if (/[",\n]/.test(value)) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "properties.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Properties exported as CSV.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsSubmitting(true);
    toast.info("Exporting as PDF...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <CrudDataTable
        title="Manage Properties"
        description="Manage all the properties in the system."
        searchPlaceholder="Filter properties..."
        data={properties}
        onAddItem={handleAddProperty}
        onEditItem={handleEditProperty}
        columns={columns}
        FormComp={PropertyForm} // Pass the custom form component
        entityName="Property"
        handleDeleteItem={handleDeleteProperty}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/properties"
        sheetClassName="sm:max-w-full"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting} // Pass submitting state to disable form actions
      />
    </div>
  );
}