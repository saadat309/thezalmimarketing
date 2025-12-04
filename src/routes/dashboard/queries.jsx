import React, { useState } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableActions } from '@/components/dashboard/TableActions';
import { toast } from "sonner";
import { useQueriesStore } from '@/store/queriesStore'; // Import the store

export const Route = createFileRoute('/dashboard/queries')({
  component: DashboardQueries,
  staticData: {
    title: 'Queries',
  },
});

function DashboardQueries() {
  const queries = useQueriesStore((state) => state.queries);
  const addQuery = useQueriesStore((state) => state.addQuery);
  const editQuery = useQueriesStore((state) => state.editQuery);
  const deleteQuery = useQueriesStore((state) => state.deleteQuery);
  const deleteSelectedQueries = useQueriesStore((state) => state.deleteSelectedQueries);
  const markAsRead = useQueriesStore((state) => state.markAsRead);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleMarkAsRead = (queryId) => {
    markAsRead(queryId);
  };

  const getRowClassName = React.useCallback((row) => {
    const currentQuery = queries.find(q => q.id === row.original.id);
    return currentQuery?.isRead === false ? 'bg-green-100 hover:bg-green-200' : '';
  }, [queries]);

  const handleAddQuery = (newItem) => {
    addQuery(newItem);
    toast.success("Query added successfully!");
  };

  const handleEditQuery = (editedItem) => {
    editQuery(editedItem);
    toast.success("Query updated successfully!");
  };

  const handleDeleteQuery = (id) => {
    deleteQuery(id);
  };

  const handleDeleteSelected = () => {
    console.log("handleDeleteSelected called");
    console.log("Selected Rows:", selectedRows);
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    console.log("Selected IDs:", selectedIds);
    deleteSelectedQueries(selectedIds);
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
    link.setAttribute("download", "queries.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Queries exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  const formFields = [
    { name: 'propertyTitle', label: 'Property Title', required: true },
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ];

  const queryColumns = [
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
    { accessorKey: 'propertyTitle', header: 'Property Title' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'message', header: 'Message', cell: ({ row }) => <div className='max-w-[200px] truncate'>{row.original.message}</div> },
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
  return (
    <div>
      <CrudDataTable
        title="Property Queries"
        data={queries}
        onAddItem={handleAddQuery}
        onEditItem={handleEditQuery}
        columns={queryColumns}
        formFields={formFields}
        entityName="Query"
        handleDeleteItem={handleDeleteQuery}
        routePath="/dashboard/queries"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        onRowClick={(row) => useQueriesStore.getState().markAsRead(row.id)} // Use markAsRead from store
        getRowClassName={getRowClassName}
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