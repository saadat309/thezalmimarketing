import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react'; // Import useEffect
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner'; // Import Spinner
import MapForm from '@/components/dashboard/map-form/MapForm';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/dashboard/maps')({
  component: DashboardMaps,
  staticData: {
    title: 'Maps',
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
    { accessorKey: 'description', header: 'Description' },
    { 
      accessorKey: 'map_pic', // Display map image if available
      header: 'Image',
      cell: ({ row }) => row.original.map_pic ? (
        <img src={row.original.map_pic} alt={row.original.title} className="object-cover w-10 h-10 rounded-md" />
      ) : (
        <span className="text-muted-foreground">No Image</span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    { 
      accessorKey: 'pdf', // Display PDF link if available
      header: 'PDF',
      cell: ({ row }) => row.original.pdf ? (
        <a href={row.original.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View PDF</a>
      ) : (
        <span className="text-muted-foreground">No PDF</span>
      ),
      enableSorting: false,
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting()} 
          >
            Last Updated
            {sorted === "asc" && <ArrowUp className="w-4 h-4 ml-2" />}
            {sorted === "desc" && <ArrowDown className="w-4 h-4 ml-2" />}
            {!sorted && <ArrowUpDown className="w-4 h-4 ml-2" />}
          </Button>
        )
      },
      enableSorting: true,
      enableHiding: true,
    },
];

function DashboardMaps() {
  const [maps, setMaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  const fetchMaps = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/maps?all=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          "X-Auth-Token": token 
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMaps(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load maps: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const handleAddMap = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newItem.title);
      formData.append('description', newItem.description || '');
      formData.append('hide', newItem.hide ? '1' : '0');
      // Pass single IDs directly
      if (newItem.city_id) formData.append('city_id', newItem.city_id);
      if (newItem.society_id) formData.append('society_id', newItem.society_id);
      if (newItem.phase_id) formData.append('phase_id', newItem.phase_id);

      if (newItem.mapImage && newItem.mapImage.length > 0) {
        if (newItem.mapImage[0].file) {
          formData.append('mapImage', newItem.mapImage[0].file);
        } else if (newItem.mapImage[0].url) {
          // If no new file is uploaded but there's an existing URL, send it for duplication
          formData.append('map_pic_url', newItem.mapImage[0].url);
        }
      }
      if (newItem.mapPdf && newItem.mapPdf.length > 0) {
        if (newItem.mapPdf[0].file) {
          formData.append('mapPdf', newItem.mapPdf[0].file);
        } else if (newItem.mapPdf[0].url) {
          // If no new file is uploaded but there's an existing URL, send it for duplication
          formData.append('pdf_url', newItem.mapPdf[0].url);
        }
      }

      const response = await fetch("/api/maps", {
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

      toast.success("Map added successfully!");
      fetchMaps();
      return true; // Explicitly return true for success
    } catch (e) {
      toast.error("Failed to add map: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMap = async (editedItem) => {
  
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', editedItem.title);
      formData.append('description', editedItem.description || '');
      formData.append('hide', editedItem.hide ? '1' : '0');
      // Pass single IDs directly. If falsy, send '0' to clear.
      if (editedItem.city_id) {
        formData.append('city_id', editedItem.city_id);
      } else {
        formData.append('city_id', '0');
      }
      if (editedItem.society_id) {
        formData.append('society_id', editedItem.society_id);
      } else {
        formData.append('society_id', '0');
      }
      if (editedItem.phase_id) {
        formData.append('phase_id', editedItem.phase_id);
      } else {
        formData.append('phase_id', '0');
      }
      
      formData.append('_method', 'PATCH'); // Method override

      // Handle mapImage
      if (editedItem.mapImage && editedItem.mapImage.length > 0 && editedItem.mapImage[0].file) {
        formData.append('mapImage', editedItem.mapImage[0].file);
      } else if (editedItem.mapImage_removed === true) { // Check for explicit removal
        formData.append('mapImage_removed', 'true');
      }

      // Handle mapPdf
      if (editedItem.mapPdf && editedItem.mapPdf.length > 0 && editedItem.mapPdf[0].file) {
        formData.append('mapPdf', editedItem.mapPdf[0].file);
      } else if (editedItem.mapPdf_removed === true) { // Check for explicit removal
        formData.append('mapPdf_removed', 'true');
      }

      const response = await fetch(`/api/maps/${editedItem.id}`, {
        method: "POST", // Use POST for FormData with method override
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

      const data = await response.json();
      toast.success("Map updated successfully!");
      fetchMaps();
      return data; 
    } catch (e) {
      toast.error("Failed to update map: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMap = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/maps/${id}`, {
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
      toast.success("Map deleted successfully!");
      fetchMaps();
    } catch (e) {
      toast.error("Failed to delete map: " + e.message);
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
              fetch(`/api/maps/${row.original.id}`, {
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
        toast.success("Selected maps deleted successfully!");
      } else {
        toast.error(`Failed to delete ${finalFailedMessages.length} map(s): ${finalFailedMessages.join(', ')}`);
      }
      
      setSelectedRows([]);
      fetchMaps();

    } catch (e) {
      toast.error("Error during batch deletion: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const selectedData = selectedRows.map(row => row.original);
    if (selectedData.length === 0) {
        toast.warning("No rows selected for export.");
        return;
    }
    if (!tableInstance) {
        toast.error("Table instance not available for export.");
        return;
    }

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
    link.setAttribute("download", "maps.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Maps exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading maps...</p>
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
        title="Manage Maps"
        description="Here you can manage your society maps."
        searchPlaceholder="Filter maps..."
        data={maps}
        onAddItem={handleAddMap}
        onEditItem={handleEditMap}
        columns={columns}
        FormComp={MapForm}
        entityName="Map"
        handleDeleteItem={handleDeleteMap}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/maps"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting} // Pass submitting state to disable form actions
      />
    </div>
  );
}