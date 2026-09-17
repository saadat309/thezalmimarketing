import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import CalculatorRateForm from '@/components/dashboard/calculator-rate-form/CalculatorRateForm';
import ImportRatesModal from '@/components/dashboard/calculator-rates/ImportRatesModal';
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/calculator-rates')({
  component: DashboardCalculatorRates,
  staticData: {
    title: 'Calculator Rates',
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
    cell: ({ row }) => row.original.id,
    enableSorting: false,
    enableHiding: false,
  },
  { accessorKey: 'city_name', header: 'City' },
  { accessorKey: 'society_name', header: 'Society' },
  { accessorKey: 'calculator_phase_name', header: 'Phase' },
  { 
    accessorKey: 'calculator_block_name', 
    header: 'Block',
    cell: ({ row }) => row.original.calculator_block_name || <span className="text-muted-foreground italic">Phase-level</span>,
  },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'property_type_label', header: 'Property Type' },
  { 
    accessorKey: 'unit_label', 
    header: 'Unit',
    cell: ({ row }) => row.original.unit_label || (row.original.unit === 'sqft' ? 'Per Sq. Ft.' : 'Per Marla'),
  },
  { 
    accessorKey: 'dc_rate', 
    header: 'DC Rate (Rs.)',
    cell: ({ row }) => row.original.dc_rate !== null && row.original.dc_rate !== undefined ? Number(row.original.dc_rate).toLocaleString() : '-',
  },
  { 
    accessorKey: 'fbr_rate', 
    header: 'FBR Rate (Rs.)',
    cell: ({ row }) => row.original.fbr_rate !== null && row.original.fbr_rate !== undefined ? Number(row.original.fbr_rate).toLocaleString() : '-',
  },
  { 
    accessorKey: 'is_active', 
    header: 'Status',
    cell: ({ row }) => {
      const active = row.original.is_active === 1 || row.original.is_active === true;
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
          {active ? 'Active' : 'Inactive'}
        </span>
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

function DashboardCalculatorRates() {
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/calculator-rates");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRates(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load calculator rates: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleAddRate = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('calculator_phase_id', newItem.calculator_phase_id);
      if (newItem.calculator_block_id) {
        formData.append('calculator_block_id', newItem.calculator_block_id);
      }
      formData.append('calculator_property_type_id', newItem.calculator_property_type_id);
      formData.append('unit', newItem.unit);
      formData.append('dc_rate', newItem.dc_rate);
      formData.append('fbr_rate', newItem.fbr_rate);
      formData.append('is_active', newItem.is_active ? 1 : 0);

      const response = await apiFetch("/calculator-rates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator rate added successfully!");
      fetchRates();
      return true;
    } catch (e) {
      toast.error("Failed to add calculator rate: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRate = async (editedItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('calculator_phase_id', editedItem.calculator_phase_id);
      if (editedItem.calculator_block_id) {
        formData.append('calculator_block_id', editedItem.calculator_block_id);
      } else {
        formData.append('calculator_block_id', '');
      }
      formData.append('calculator_property_type_id', editedItem.calculator_property_type_id);
      formData.append('unit', editedItem.unit);
      formData.append('dc_rate', editedItem.dc_rate);
      formData.append('fbr_rate', editedItem.fbr_rate);
      formData.append('is_active', editedItem.is_active ? 1 : 0);
      formData.append('_method', 'PATCH');

      const response = await apiFetch(`/calculator-rates/${editedItem.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator rate updated successfully!");
      fetchRates();
      return true;
    } catch (e) {
      toast.error("Failed to update calculator rate: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRate = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/calculator-rates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator rate deleted successfully!");
      fetchRates();
    } catch (e) {
      toast.error("Failed to delete calculator rate: " + e.message);
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
        apiFetch(`/calculator-rates/${row.original.id}`, {
          method: "DELETE",
        })
      );
      const results = await Promise.allSettled(deletePromises);
      let allSucceeded = true;
      results.forEach((result) => {
        if (result.status === 'rejected') {
          allSucceeded = false;
        } else if (!result.value.ok && result.value.status !== 204) {
          allSucceeded = false;
        }
      });

      if (allSucceeded) {
        toast.success("Selected calculator rates deleted successfully!");
        setSelectedRows([]);
        fetchRates();
      } else {
        toast.error("Some calculator rates failed to delete.");
      }
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
      link.setAttribute("download", "calculator-rates.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Calculator rates exported as CSV.");
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
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={fetchRates}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="absolute top-8 right-6 z-10">
        <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="h-8 gap-2">
          <Upload className="w-4 h-4" /> Import Rates
        </Button>
      </div>

      <CrudDataTable
        title="Manage Calculator Rates"
        description="Manage DC and FBR valuation rates used by the property transfer calculator."
        searchPlaceholder="Filter calculator rates..."
        data={rates}
        columns={columns}
        entityName="Calculator Rate"
        FormComp={CalculatorRateForm}
        onAddItem={handleAddRate}
        onEditItem={handleEditRate}
        handleDeleteItem={handleDeleteRate}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/calculator-rates"
        onSelectionChange={(rows, table) => {
          setSelectedRows(rows);
          setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
      />

      <ImportRatesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchRates}
      />
    </div>
  );
}
