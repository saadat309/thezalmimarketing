import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import PhaseForm from '@/components/dashboard/phase-form/PhaseForm'; // Import the new PhaseForm
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/dashboard/phases')({
  component: DashboardPhases,
  staticData: {
    title: 'Phases',
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

function DashboardPhases() {
  const [phases, setPhases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  const fetchPhases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/phases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPhases(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load phases: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhases();
  }, []);

  const handleAddPhase = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      if (newItem.map_ids && newItem.map_ids.length > 0) {
        newItem.map_ids.forEach(mapId => {
          formData.append('map_ids[]', mapId);
        });
      }

      const response = await fetch('/api/phases', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      toast.success("Phase added successfully!");
      fetchPhases();
      return true;
    } catch (e) {
      toast.error("Failed to add phase: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPhase = async (editedItem) => {
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

      const response = await fetch(`/api/phases/${editedItem.id}`, {
        method: 'POST', // Use POST for FormData with method override
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      toast.success("Phase updated successfully!");
      fetchPhases();
      return true;
    } catch (e) {
      toast.error("Failed to update phase: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhase = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/phases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      toast.success("Phase deleted successfully!");
      fetchPhases();
    } catch (e) {
      toast.error("Failed to delete phase: " + e.message);
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
            const deletePromises = selectedRows.map(row =>
              fetch(`/api/phases/${row.original.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
              })
            );
      const results = await Promise.allSettled(deletePromises);
      
      const failedDeletes = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedDeletes.push(`ID ${selectedRows[index].original.id}: Network or server error`);
        } else if (!result.value.ok) {
          // Try to get error detail from response body
          const
           errorPromise = result.value.json().then(err => `ID ${selectedRows[index].original.id}: ${err.detail || result.value.statusText}`).catch(() => `ID ${selectedRows[index].original.id}: ${result.value.statusText}`);
          failedDeletes.push(errorPromise);
        }
      });

      const finalFailedMessages = await Promise.all(failedDeletes);

      if (finalFailedMessages.length === 0) {
        toast.success("Selected phases deleted successfully!");
      } else {
        toast.error(`Failed to delete ${finalFailedMessages.length} phase(s): ${finalFailedMessages.join(', ')}`);
      }
      
      setSelectedRows([]);
      fetchPhases();

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
    
    const headers = visibleColumns.map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

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
    link.setAttribute("download", "phases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Phases exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading phases...</p>
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
        title="Manage Phases"
        description="Here you can manage the development phases."
        searchPlaceholder="Filter phases..."
        data={phases}
        onAddItem={handleAddPhase}
        onEditItem={handleEditPhase}
        columns={columns}
        FormComp={PhaseForm}
        entityName="Phase"
        handleDeleteItem={handleDeletePhase}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/phases"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}