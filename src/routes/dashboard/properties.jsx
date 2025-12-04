import { createFileRoute } from '@tanstack/react-router';                                                                               
import React, { useState } from 'react';                                                                                                 
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';                                                                   
import { v4 as uuidv4 } from 'uuid';                                                                         
import { Checkbox } from "@/components/ui/checkbox";
import { TableActions } from '@/components/dashboard/TableActions';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; 
import { toast } from "sonner";
import { MediaUpload } from '@/components/dashboard/MediaUpload'; // Import MediaUpload
import { usePropertiesStore } from '@/store/propertiesStore'; // Import the store

export const Route = createFileRoute('/dashboard/properties')({
  component: DashboardProperties,
  staticData: {
    title: 'Properties',
  },
});

const formFields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'type', label: 'Type' },
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
    { accessorKey: 'type', header: 'Type' },
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

function DashboardProperties() {
  const properties = usePropertiesStore((state) => state.properties);
  const addProperty = usePropertiesStore((state) => state.addProperty);
  const editProperty = usePropertiesStore((state) => state.editProperty);
  const deleteProperty = usePropertiesStore((state) => state.deleteProperty);
  const deleteSelectedProperties = usePropertiesStore((state) => state.deleteSelectedProperties);
  
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  // Separate states for different media types
  const [propertyImages, setPropertyImages] = useState([]);
  const [propertyVideos, setPropertyVideos] = useState([]);
  const [propertyDocuments, setPropertyDocuments] = useState([]);
  const [crudTableEditingItem, setCrudTableEditingItem] = React.useState(null); // State to hold editingItem from CrudDataTable
  const handleAddProperty = (newItem) => {
    const combinedMedia = [...propertyImages, ...propertyVideos, ...propertyDocuments];
    addProperty({ ...newItem, media: combinedMedia });
    toast.success("Property added successfully!");
  };

  const handleEditProperty = (editedItem) => {
    const combinedMedia = [...propertyImages, ...propertyVideos, ...propertyDocuments];
    editProperty({ ...editedItem, media: combinedMedia });
    toast.success("Property updated successfully!");
  };

  // Effect to initialize separate media states when editingItem changes from CrudDataTable
  React.useEffect(() => {
    if (crudTableEditingItem?.media) {
      setPropertyImages(crudTableEditingItem.media.filter(item => item.type === 'image'));
      setPropertyVideos(crudTableEditingItem.media.filter(item => item.type === 'video'));
      setPropertyDocuments(crudTableEditingItem.media.filter(item => item.type === 'pdf' || item.type === 'file'));
    } else {
      setPropertyImages([]);
      setPropertyVideos([]);
      setPropertyDocuments([]);
    }
  }, [crudTableEditingItem]);

  const handleDeleteProperty = (id) => {
    deleteProperty(id);
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    deleteSelectedProperties(selectedIds);
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
    link.setAttribute("download", "properties.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Properties exported as CSV.");
  };

  const handleExportPdf = () => {
    toast.info("Exporting as PDF...");
  };

  return (
    <div>
      <CrudDataTable
        title="Manage Properties"
        data={properties}
        onAddItem={handleAddProperty}
        onEditItem={handleEditProperty}
        columns={columns}
        formFields={formFields}
        entityName="Property"
        handleDeleteItem={handleDeleteProperty}
        routePath="/dashboard/properties"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        onEditingItemChange={setCrudTableEditingItem} // Pass the setter to CrudDataTable
        customFormContent={(editingItem) => ( // editingItem is still passed to customFormContent, but useEffect now uses crudTableEditingItem
          <>
            <h4 className="mb-2 text-lg font-semibold col-span-full">Images</h4>
            <MediaUpload
                initialMedia={propertyImages}
                onMediaChange={setPropertyImages}
                allowedTypes={['image/*']}
                allowMultiple={true}
                showPrimaryOption={true}
            />
            <h4 className="mb-2 mt-4 text-lg font-semibold col-span-full">Video Tour</h4>
            <MediaUpload
                initialMedia={propertyVideos}
                onMediaChange={setPropertyVideos}
                allowedTypes={['video/*']}
                allowMultiple={false} // Only one video allowed
                maxFiles={1}
                showPrimaryOption={true}
            />
            <h4 className="mb-2 mt-4 text-lg font-semibold col-span-full">Documents (PDFs)</h4>
            <MediaUpload
                initialMedia={propertyDocuments}
                onMediaChange={setPropertyDocuments}
                allowedTypes={['application/pdf']}
                allowMultiple={true}
                showPrimaryOption={false} // No primary option for documents
            />
          </>
        )}
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