import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import CalculatorTransferFeeForm from '@/components/dashboard/calculator-transfer-fee-form/CalculatorTransferFeeForm';
import ImportTransferFeesModal from '@/components/dashboard/calculator-transfer-fees/ImportTransferFeesModal';
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/calculator-transfer-fees')({
  component: DashboardCalculatorTransferFees,
  staticData: {
    title: 'Calculator Transfer Fees',
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
  { 
    accessorKey: 'reference_size', 
    header: 'Ref Size',
    cell: ({ row }) => `${Number(row.original.reference_size).toLocaleString()} ${row.original.reference_unit === 'sqft' ? 'Sq.Ft.' : 'Marla'}`,
  },
  { 
    accessorKey: 'reference_amount', 
    header: 'Ref Fee (Rs.)',
    cell: ({ row }) => Number(row.original.reference_amount).toLocaleString(),
  },
  { 
    accessorKey: 'base_transfer_fee', 
    header: 'Base Fee (Rs.)',
    cell: ({ row }) => Number(row.original.base_transfer_fee).toLocaleString(),
  },
  { 
    accessorKey: 'per_marla_rate', 
    header: 'Per Marla (Rs.)',
    cell: ({ row }) => Number(row.original.per_marla_rate).toLocaleString(),
  },
  { 
    accessorKey: 'per_sqft_rate', 
    header: 'Per Sq.Ft. (Rs.)',
    cell: ({ row }) => Number(row.original.per_sqft_rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }),
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

function DashboardCalculatorTransferFees() {
  const [fees, setFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchFees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/calculator-transfer-fees");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFees(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load calculator transfer fees: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handleAddFee = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('calculator_phase_id', newItem.calculator_phase_id);
      if (newItem.calculator_block_id) {
        formData.append('calculator_block_id', newItem.calculator_block_id);
      }
      formData.append('category', newItem.category);
      formData.append('reference_size', newItem.reference_size);
      formData.append('reference_unit', newItem.reference_unit);
      formData.append('reference_amount', newItem.reference_amount);
      formData.append('is_active', newItem.is_active ? 1 : 0);

      const response = await apiFetch("/calculator-transfer-fees", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator transfer fee added successfully!");
      fetchFees();
      return true;
    } catch (e) {
      toast.error("Failed to add calculator transfer fee: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFee = async (editedItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('calculator_phase_id', editedItem.calculator_phase_id);
      if (editedItem.calculator_block_id) {
        formData.append('calculator_block_id', editedItem.calculator_block_id);
      } else {
        formData.append('calculator_block_id', '');
      }
      formData.append('category', editedItem.category);
      formData.append('reference_size', editedItem.reference_size);
      formData.append('reference_unit', editedItem.reference_unit);
      formData.append('reference_amount', editedItem.reference_amount);
      formData.append('is_active', editedItem.is_active ? 1 : 0);
      formData.append('_method', 'PATCH');

      const response = await apiFetch(`/calculator-transfer-fees/${editedItem.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator transfer fee updated successfully!");
      fetchFees();
      return true;
    } catch (e) {
      toast.error("Failed to update calculator transfer fee: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFee = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/calculator-transfer-fees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator transfer fee deleted successfully!");
      fetchFees();
    } catch (e) {
      toast.error("Failed to delete calculator transfer fee: " + e.message);
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
        apiFetch(`/calculator-transfer-fees/${row.original.id}`, {
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
        toast.success("Selected calculator transfer fees deleted successfully!");
        setSelectedRows([]);
        fetchFees();
      } else {
        toast.error("Some calculator transfer fees failed to delete.");
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
      link.setAttribute("download", "calculator-transfer-fees.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Calculator transfer fees exported as CSV.");
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
        <Button onClick={fetchFees}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      <div className="absolute top-8 right-6 z-10">
        <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="h-8 gap-2">
          <Upload className="w-4 h-4" /> Import Transfer Fees
        </Button>
      </div>

      <CrudDataTable
        title="Calculator Transfer Fees"
        description="Manage reference transfer fees, sports fund accounting, and derived per-marla / per-sq.ft. transfer fee rates."
        searchPlaceholder="Filter calculator transfer fees..."
        data={fees}
        columns={columns}
        entityName="Calculator Transfer Fee"
        FormComp={CalculatorTransferFeeForm}
        onAddItem={handleAddFee}
        onEditItem={handleEditFee}
        handleDeleteItem={handleDeleteFee}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/calculator-transfer-fees"
        onSelectionChange={(rows, table) => {
          setSelectedRows(rows);
          setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
      />

      <ImportTransferFeesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchFees}
      />
    </div>
  );
}
