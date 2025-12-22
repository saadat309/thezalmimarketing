import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect, useCallback } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner'; // Import Spinner

import PropertyFileForm from '@/components/dashboard/property-form/property-file-form'; // Import PropertyFileForm
import { getYoutubeEmbedUrl } from "@/lib/utils";
import { useAuthStore } from '@/store/authStore';


export const Route = createFileRoute('/dashboard/files')({
  component: DashboardFiles,
  staticData: {
    title: 'Files',
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
    { accessorKey: 'file_type', header: 'File Type' },
    { accessorKey: 'price_amount', header: 'Price' },
    {
        accessorKey: 'hide',
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
            Changed
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

function DashboardFiles() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crudTableEditingItem, setCrudTableEditingItem] = useState(null);
  const [editingFileFullData, setEditingFileFullData] = useState(null);
  const [isTablePreferencesLoading, setIsTablePreferencesLoading] = useState(true); // New state for table preferences loading
  const { token } = useAuthStore();

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/files?is_file=1&all=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); // Fetch files with is_file=1
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFiles(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load files: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFileFullDetails = async (id) => {
    // We don't set global isLoading to true here to avoid showing a full page spinner
    // while only fetching details for the form.
    setError(null);
    try {
      const response = await fetch(`/api/files/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure that `data` is a single object, not an array.
      // If the API returns an array for a single ID lookup, take the first element.
      setEditingFileFullData(Array.isArray(data) ? data[0] : data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load file details: " + e.message);
      setEditingFileFullData(null); // Clear data if fetch fails
    }
  };

  useEffect(() => {
    fetchFiles(); // Fetch the list of files on component mount
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {

    if (crudTableEditingItem && crudTableEditingItem.id) {
      // Fetch full details when an item is selected for editing
      fetchFileFullDetails(crudTableEditingItem.id);
    } else {
      setEditingFileFullData(null); // Clear full data when not editing
    }
  }, [crudTableEditingItem]); // Depend on crudTableEditingItem changes

  const prepareFormData = (data) => {
    const formData = new FormData();

    // Append basic form data
    for (const key in data) {
      if (['thumbnailMedia', 'id', 'related_products', 'related_properties', 'labels', 'existing_labels'].includes(key)) continue; // Skip handled separately or internal

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

    // Explicitly ensure is_file is true for this form
    formData.set('is_file', '1');

    // Handle labels
    const existingLabels = data.existing_labels || data.labels || [];
    existingLabels.forEach((id, index) => {
      formData.append(`existing_labels[${index}]`, id);
    });

    // Handle new labels to create
    if (data.new_labels_to_create && data.new_labels_to_create.length > 0) {
        formData.append('new_labels_to_create', JSON.stringify(data.new_labels_to_create));
    }

    return formData;
  };

  const handleAddFile = async (data) => {
    setIsSubmitting(true);
    try {
        const formData = prepareFormData(data);
        const response = await fetch("/api/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
          body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        toast.success("File added successfully!");
        fetchFiles(); // Refresh the list
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to add file: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditFile = async (data) => {
    setIsSubmitting(true);
    try {
        const formData = prepareFormData(data);
        formData.append('_method', 'PATCH');

        const response = await fetch(`/api/files/${data.id}`, {
          method: "POST", // Use POST for PATCH simulation with FormData
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
          body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        toast.success("File updated successfully!");
        fetchFiles(); // Refresh the list
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to update file: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteFile = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      toast.success("File deleted successfully!");
      fetchFiles(); // Refresh the list
    } catch (e) {
      toast.error("Failed to delete file: " + e.message);
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
        fetch(`/api/files/${row.original.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
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
        toast.success("Selected files deleted successfully!");
      } else {
        toast.error(`Failed to delete ${finalFailedMessages.length} file(s): ${finalFailedMessages.join(', ')}`);
      }

      setSelectedRows([]);
      fetchFiles(); // Refresh the list

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
        link.setAttribute("download", "files.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Files exported as CSV.");
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
        <p className="ml-2">Loading files...</p>
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
        title="Manage Files"
        description="Here you can manage your property files."
        searchPlaceholder="Filter files..."
        data={files}
        onAddItem={handleAddFile}
        onEditItem={handleEditFile}
        columns={columns}
        FormComp={PropertyFileForm} // Pass the custom form component
        formProps={{ editingItemFullDetails: editingFileFullData }} // Pass full details as a prop to the form
        entityName="File"
        handleDeleteItem={handleDeleteFile}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/files"
        sheetClassName="sm:max-w-3xl"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting} // Pass submitting state to disable form actions
        onEditingItemChange={setCrudTableEditingItem} // Pass the setter to CrudDataTable
        initialData={crudTableEditingItem} // Pass crudTableEditingItem directly to open form instantly
        isDuplicating={crudTableEditingItem?.isDuplicating || false} // Pass duplication status
      />
    </div>
  );
}