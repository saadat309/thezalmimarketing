import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react'; // Import useEffect
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner'; // Assuming a spinner component for loading
import CityForm from '@/components/dashboard/city-form/CityForm'; // Import the new CityForm

export const Route = createFileRoute('/dashboard/cities')({
  component: DashboardCities,
  staticData: {
    title: 'Cities',
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
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'map_ids',
      header: 'Associated Maps',
      cell: ({ row }) => {
        const mapIds = row.original.map_ids;
        return mapIds && mapIds.length > 0 ? `${mapIds.length} Maps` : 'None';
      },
      enableSorting: false,
      enableHiding: true,
    },
    { 
      accessorKey: 'updated_at', // Use updated_at from backend
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

function DashboardCities() {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading

  const fetchCities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCities(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load cities: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddCity = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      if (newItem.map_ids && newItem.map_ids.length > 0) {
        newItem.map_ids.forEach(mapId => {
          formData.append('map_ids[]', mapId);
        });
      }

      const response = await fetch('/api/cities', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("City added successfully!");
      fetchCities(); // Re-fetch cities to update the table
      return true; // Indicate success
    } catch (e) {
      toast.error("Failed to add city: " + e.message);
      return false; // Indicate failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCity = async (editedItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', editedItem.name);
      // Always send map_ids, even if empty, to ensure unlinking works
      if (editedItem.map_ids && editedItem.map_ids.length > 0) {
        editedItem.map_ids.forEach(mapId => {
          formData.append('map_ids[]', mapId);
        });
      } else {
        // Explicitly send an empty array if no maps are selected to ensure unlinking
        formData.append('map_ids[]', ''); 
      }
      formData.append('_method', 'PATCH'); // Method override

      const response = await fetch(`/api/cities/${editedItem.id}`, {
        method: 'POST', // Use POST for FormData with method override
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("City updated successfully!");
      fetchCities(); // Re-fetch cities to update the table
      return true; // Indicate success
    } catch (e) {
      toast.error("Failed to update city: " + e.message);
      return false; // Indicate failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCity = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("City deleted successfully!");
      fetchCities(); // Re-fetch cities to update the table
    } catch (e) {
      toast.error("Failed to delete city: " + e.message);
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
      // Create an array of promises for all delete operations
      const deletePromises = selectedRows.map(row => 
        fetch(`/api/cities/${row.original.id}`, { method: 'DELETE' })
      );

      const results = await Promise.allSettled(deletePromises);
      let allSucceeded = true;
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          allSucceeded = false;
          console.error(`Failed to delete city ${selectedRows[index].original.id}:`, result.reason);
        } else if (!result.value.ok) {
          allSucceeded = false;
          result.value.json().then(errorData => {
            console.error(`Failed to delete city ${selectedRows[index].original.id}:`, errorData.detail || result.value.statusText);
          });
        }
      });

      if (allSucceeded) {
        toast.success("Selected cities deleted successfully!");
        setSelectedRows([]); // Clear selection
        fetchCities(); // Re-fetch all cities
      } else {
        toast.error("Some cities failed to delete. Please check console for details.");
      }

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
    link.setAttribute("download", "cities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Cities exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading cities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <CrudDataTable
        title="Manage Cities"
        description="Here you can manage the available cities."
        searchPlaceholder="Filter cities..."
        data={cities}
        onAddItem={handleAddCity}
        onEditItem={handleEditCity}
        columns={columns}
        FormComp={CityForm} // Use the custom form component
        entityName="City"
        handleDeleteItem={handleDeleteCity}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/cities"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting} // Pass submitting state to disable form actions
      />
    </div>
  );
}