import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { TableActions } from '@/components/dashboard/TableActions';
import { toast } from "sonner";
import { useFilesStore } from '@/store/filesStore'; // Import the store

export const Route = createFileRoute('/dashboard/files')({
  component: DashboardFiles,
  staticData: {
    title: 'Files',
  },
});

const formFields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'type', label: 'File Type' },
    { name: 'price', label: 'Price' },
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
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'type', header: 'File Type' },
    { accessorKey: 'price', header: 'Price' },
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

function DashboardFiles() {
  const files = useFilesStore((state) => state.files);
  const addFile = useFilesStore((state) => state.addFile);
  const editFile = useFilesStore((state) => state.editFile);
  const deleteFile = useFilesStore((state) => state.deleteFile);
  const deleteSelectedFiles = useFilesStore((state) => state.deleteSelectedFiles);

  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleAddFile = (newItem) => {
    addFile({ ...newItem });
    toast.success("File added successfully!");
  };

  const handleEditFile = (editedItem) => {
    editFile({ ...editedItem });
    toast.success("File updated successfully!");
  };

  const handleDeleteFile = (id) => {
    deleteFile(id);
    toast.success("File deleted successfully!");
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    deleteSelectedFiles(selectedIds);
    setSelectedRows([]);
    toast.success("Selected files deleted successfully!");
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
            if (/[\",\n]/.test(value)) {
                value = `\"${value.replace(/\"/g, '\"\"')}\"`;
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
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  return (
    <div>
      <CrudDataTable
        title="Manage Files"
        data={files}
        onAddItem={handleAddFile}
        onEditItem={handleEditFile}
        columns={columns}
        formFields={formFields}
        entityName="File"
        handleDeleteItem={handleDeleteFile}
        routePath="/dashboard/files"
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