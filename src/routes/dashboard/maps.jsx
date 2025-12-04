import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { TableActions } from '@/components/dashboard/TableActions';
import { toast } from "sonner";
import { MediaUpload } from '@/components/dashboard/MediaUpload'; // Import MediaUpload

export const Route = createFileRoute('/dashboard/maps')({
  component: DashboardMaps,
  staticData: {
    title: 'Maps',
  },
});

const formFields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
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
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'status', header: 'Status' },
        {
          accessorKey: 'changed_at', 
          header: ({ column }) => {
            const sorted = column.getIsSorted();
            return (
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting()} // Corrected to simple toggle
              >
                Changed
                {sorted === "asc" && <ArrowUp className="w-4 h-4 ml-2" />}
                {sorted === "desc" && <ArrowDown className="w-4 h-4 ml-2" />}
                {!sorted && <ArrowUpDown className="w-4 h-4 ml-2" />}
              </Button>
            )
          },
          enableSorting: true,
          enableHiding: true,
        },];

function DashboardMaps() {
  const [maps, setMaps] = useState([
    {
      id: uuidv4(),
      title: 'DHA Phase 8',
      description: 'Master plan of DHA Phase 8, Lahore',
      status: 'Active',
      changed_at: '2024-12-01 09:45',
      mapImage: [], // Initialize with empty array
      mapPdf: [],    // Initialize with empty array
    },
    {
      id: uuidv4(),
      title: 'Bahria Town Karachi',
      description: 'Residential plots in Bahria Town Karachi',
      status: 'Active',
      changed_at: '2024-12-01 14:15',
      mapImage: [],
      mapPdf: [],
    },
  ]);
  const [mapImage, setMapImage] = useState([]); // State for map image
  const [mapPdf, setMapPdf] = useState([]);     // State for map PDF
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleAddMap = (newItem) => {
    setMaps((current) => [...current, { ...newItem, id: uuidv4(), changed_at: new Date().toLocaleString(), mapImage, mapPdf }]);
    toast.success("Map added successfully!");
  };

  const handleEditMap = (editedItem) => {
    setMaps((current) =>
      current.map((map) =>
        map.id === editedItem.id ? { ...editedItem, changed_at: new Date().toLocaleString(), mapImage, mapPdf } : map
      )
    );
    toast.success("Map updated successfully!");
  };

  const handleDeleteMap = (id) => {
    setMaps(maps.filter((m) => m.id !== id));
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    setMaps(maps.filter((m) => !selectedIds.has(m.id)));
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
    link.setAttribute("download", "maps.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Maps exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  return (
    <div>
      <CrudDataTable
        title="Manage Maps"
        data={maps}
        onAddItem={handleAddMap}
        onEditItem={handleEditMap}
        columns={columns}
        formFields={formFields}
        entityName="Map"
        handleDeleteItem={handleDeleteMap}
        routePath="/dashboard/maps"
        customFormContent={(currentItem) => (
          <div className="grid gap-4 py-4">
            <h4 className="text-sm font-medium leading-none">Map Image (Max 1)</h4>
            <MediaUpload
              initialMedia={currentItem?.mapImage || []}
              onMediaChange={setMapImage}
              maxFiles={1}
              allowedTypes={['image/*']}
              allowMultiple={false}
              showPrimaryOption={false}
            />
            <h4 className="text-sm font-medium leading-none">Map PDF (Max 1)</h4>
            <MediaUpload
              initialMedia={currentItem?.mapPdf || []}
              onMediaChange={setMapPdf}
              maxFiles={1}
              allowedTypes={['application/pdf']}
              allowMultiple={false}
              showPrimaryOption={false}
            />
          </div>
        )}
        onEditingItemChange={(item) => {
          // When editing item changes, update local media states
          setMapImage(item?.mapImage || []);
          setMapPdf(item?.mapPdf || []);
        }}
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