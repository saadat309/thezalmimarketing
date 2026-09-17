import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import CalculatorFeeRuleForm from '@/components/dashboard/calculator-fee-rule-form/CalculatorFeeRuleForm';
import { apiFetch } from '@/lib/apiClient';

export const Route = createFileRoute('/dashboard/calculator-fee-rules')({
  component: DashboardCalculatorFeeRules,
  staticData: {
    title: 'Calculator Fee Rules',
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
    accessorKey: 'fee_name', 
    header: 'Fee',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.fee_name}</div>
        <div className="font-mono text-xs text-muted-foreground">{row.original.fee_key}</div>
      </div>
    ),
  },
  { accessorKey: 'property_type', header: 'Property Type' },
  { 
    accessorKey: 'unit', 
    header: 'Unit',
    cell: ({ row }) => <span className="capitalize">{row.original.unit}</span>,
  },
  { 
    accessorKey: 'min_area', 
    header: 'Min Area',
    cell: ({ row }) => `${Number(row.original.min_area).toLocaleString()} ${row.original.unit}`,
  },
  { 
    accessorKey: 'max_area', 
    header: 'Max Area',
    cell: ({ row }) => row.original.max_area !== null && row.original.max_area !== undefined ? `${Number(row.original.max_area).toLocaleString()} ${row.original.unit}` : <span className="text-muted-foreground italic">No Max (Unlimited)</span>,
  },
  { 
    accessorKey: 'fee_amount', 
    header: 'Fee Amount (Rs.)',
    cell: ({ row }) => row.original.fee_amount !== null && row.original.fee_amount !== undefined ? `Rs. ${Number(row.original.fee_amount).toLocaleString()}` : '-',
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

function DashboardCalculatorFeeRules() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/calculator-fee-rules");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRules(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load calculator fee rules: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRule = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fee_id', newItem.fee_id);
      formData.append('property_type', newItem.property_type);
      formData.append('unit', newItem.unit);
      formData.append('min_area', newItem.min_area);
      if (newItem.max_area !== null && newItem.max_area !== undefined) {
        formData.append('max_area', newItem.max_area);
      }
      formData.append('fee_amount', newItem.fee_amount);
      formData.append('is_active', newItem.is_active ? 1 : 0);

      const response = await apiFetch("/calculator-fee-rules", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator fee rule added successfully!");
      fetchRules();
      return true;
    } catch (e) {
      toast.error("Failed to add calculator fee rule: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRule = async (editedItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fee_id', editedItem.fee_id);
      formData.append('property_type', editedItem.property_type);
      formData.append('unit', editedItem.unit);
      formData.append('min_area', editedItem.min_area);
      if (editedItem.max_area !== null && editedItem.max_area !== undefined && editedItem.max_area !== '') {
        formData.append('max_area', editedItem.max_area);
      } else {
        formData.append('max_area', '');
      }
      formData.append('fee_amount', editedItem.fee_amount);
      formData.append('is_active', editedItem.is_active ? 1 : 0);
      formData.append('_method', 'PATCH');

      const response = await apiFetch(`/calculator-fee-rules/${editedItem.id}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator fee rule updated successfully!");
      fetchRules();
      return true;
    } catch (e) {
      toast.error("Failed to update calculator fee rule: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/calculator-fee-rules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Calculator fee rule deleted successfully!");
      fetchRules();
    } catch (e) {
      toast.error("Failed to delete calculator fee rule: " + e.message);
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
        apiFetch(`/calculator-fee-rules/${row.original.id}`, {
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
        toast.success("Selected calculator fee rules deleted successfully!");
        setSelectedRows([]);
        fetchRules();
      } else {
        toast.error("Some calculator fee rules failed to delete.");
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
      link.setAttribute("download", "calculator-fee-rules.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Calculator fee rules exported as CSV.");
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
        <Button onClick={fetchRules}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <CrudDataTable
        title="Manage Calculator Fee Rules"
        description="View, add, edit, and delete conditional fee rules (e.g. tiered membership fees based on property type, unit, min and max area)."
        searchPlaceholder="Filter calculator fee rules..."
        data={rules}
        columns={columns}
        entityName="Calculator Fee Rule"
        FormComp={CalculatorFeeRuleForm}
        onAddItem={handleAddRule}
        onEditItem={handleEditRule}
        handleDeleteItem={handleDeleteRule}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/calculator-fee-rules"
        onSelectionChange={(rows, table) => {
          setSelectedRows(rows);
          setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
