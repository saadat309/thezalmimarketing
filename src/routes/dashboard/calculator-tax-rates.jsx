import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import CalculatorTaxRateForm from '@/components/dashboard/calculator-tax-rate-form/CalculatorTaxRateForm';
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/calculator-tax-rates')({
  component: DashboardCalculatorTaxRates,
  staticData: {
    title: 'Calculator Tax Rates',
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
  { 
    accessorKey: 'rate_key', 
    header: 'Tax Key',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.rate_key}</span>,
  },
  { accessorKey: 'rate_name', header: 'Tax Rate Name' },
  { 
    accessorKey: 'rate', 
    header: 'Rate (%)',
    cell: ({ row }) => row.original.rate !== null && row.original.rate !== undefined ? `${Number(row.original.rate).toFixed(4)}%` : '-',
  },
  { 
    accessorKey: 'rate_unit', 
    header: 'Unit',
    cell: ({ row }) => <span className="capitalize">{row.original.rate_unit || 'percent'}</span>,
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

function DashboardCalculatorTaxRates() {
  const [taxRates, setTaxRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTaxRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/calculator-tax-rates");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTaxRates(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load calculator tax rates: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const handleAddTaxRate = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rate_key', newItem.rate_key);
      formData.append('rate_name', newItem.rate_name);
      formData.append('rate', newItem.rate);
      formData.append('rate_unit', newItem.rate_unit);
      formData.append('is_active', newItem.is_active ? 1 : 0);

      const response = await apiFetch("/calculator-tax-rates", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator tax rate added successfully!");
      fetchTaxRates();
      return true;
    } catch (e) {
      toast.error("Failed to add calculator tax rate: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTaxRate = async (editedItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rate_name', editedItem.rate_name);
      formData.append('rate', editedItem.rate);
      formData.append('is_active', editedItem.is_active ? 1 : 0);
      formData.append('_method', 'PATCH');

      const response = await apiFetch(`/calculator-tax-rates/${editedItem.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator tax rate updated successfully!");
      fetchTaxRates();
      return true;
    } catch (e) {
      toast.error("Failed to update calculator tax rate: " + e.message);
      return false;
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
      link.setAttribute("download", "calculator-tax-rates.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Calculator tax rates exported as CSV.");
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
        <Button onClick={fetchTaxRates}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CrudDataTable
        title="Manage Calculator Tax Rates"
        description="View, add, and update calculator tax percentages (e.g. 236K purchaser tax, 236C seller tax)."
        searchPlaceholder="Filter calculator tax rates..."
        data={taxRates}
        columns={columns}
        entityName="Calculator Tax Rate"
        FormComp={CalculatorTaxRateForm}
        onAddItem={handleAddTaxRate}
        canDeleteItem={() => false}
        onEditItem={handleEditTaxRate}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/calculator-tax-rates"
        onSelectionChange={(rows, table) => {
          setSelectedRows(rows);
          setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
