import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { TableActions } from '@/components/dashboard/TableActions';
import { toast } from "sonner";

export const Route = createFileRoute('/dashboard/phases')({
  component: DashboardPhases,
  staticData: {
    title: 'Phases',
  },
});

const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'status', label: 'Status' },
];

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
    { accessorKey: 'status', header: 'Status' },
    { 
      accessorKey: 'changed_at', 
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

function DashboardPhases() {
  const [phases, setPhases] = useState([
    { id: uuidv4(), name: 'Phase 8', status: 'Active', changed_at: '2024-11-30 10:00' },
    { id: uuidv4(), name: 'Phase 9', status: 'Upcoming', changed_at: '2024-11-30 15:00' },
  ]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleAddPhase = (newItem) => {
    setPhases((current) => [...current, { ...newItem, id: uuidv4(), changed_at: new Date().toLocaleString() }]);
    toast.success("Phase added successfully!");
  };

  const handleEditPhase = (editedItem) => {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === editedItem.id ? { ...editedItem, changed_at: new Date().toLocaleString() } : phase
      )
    );
    toast.success("Phase updated successfully!");
  };

  const handleDeletePhase = (id) => {
    setPhases(phases.filter((p) => p.id !== id));
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    setPhases(phases.filter((p) => !selectedIds.has(p.id)));
    setSelectedRows([]);
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
    link.setAttribute("download", "phases.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Phases exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  return (
    <div>
      <CrudDataTable
        title="Manage Phases"
        data={phases}
        onAddItem={handleAddPhase}
        onEditItem={handleEditPhase}
        columns={columns}
        formFields={formFields}
        entityName="Phase"
        handleDeleteItem={handleDeletePhase}
        routePath="/dashboard/phases"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
      />
      <TableActions
        selectedRows={selectedRows}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
      />
    </div>
  );
}