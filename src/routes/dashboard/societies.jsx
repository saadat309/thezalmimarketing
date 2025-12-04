import { createFileRoute } from '@tanstack/react-router';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { TableActions } from '@/components/dashboard/TableActions';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { toast } from "sonner";

export const Route = createFileRoute('/dashboard/societies')({
  component: DashboardSocieties,
  staticData: {
    title: 'Societies',
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
        },];

function DashboardSocieties() {
  const [societies, setSocieties] = useState([
    { id: uuidv4(), name: 'DHA', status: 'Active', changed_at: '2024-12-01 11:00' },
    { id: uuidv4(), name: 'Bahria Town', status: 'Active', changed_at: '2024-12-01 15:30' },
  ]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleAddSociety = (newItem) => {
    setSocieties((current) => [...current, { ...newItem, id: uuidv4(), changed_at: new Date().toLocaleString() }]);
    toast.success("Society added successfully!");
  };

  const handleEditSociety = (editedItem) => {
    setSocieties((current) =>
      current.map((society) =>
        society.id === editedItem.id ? { ...editedItem, changed_at: new Date().toLocaleString() } : society
      )
    );
    toast.success("Society updated successfully!");
  };

  const handleDeleteSociety = (id) => {
    setSocieties(societies.filter((s) => s.id !== id));
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    setSocieties(societies.filter((s) => !selectedIds.has(s.id)));
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
    link.setAttribute("download", "societies.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Societies exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  return (
    <div>
      <CrudDataTable
        title="Manage Societies"
        data={societies}
        onAddItem={handleAddSociety}
        onEditItem={handleEditSociety}
        columns={columns}
        formFields={formFields}
        entityName="Society"
        handleDeleteItem={handleDeleteSociety}
        routePath="/dashboard/societies"
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