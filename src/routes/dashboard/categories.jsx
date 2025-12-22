import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react'; // Import useEffect
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react"; // Import ArrowUpDown
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner'; // Assuming a spinner component for loading
import CategoryForm from '@/components/dashboard/category-form/CategoryForm'; // Import the new CategoryForm
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/dashboard/categories')({
  component: DashboardCategories,
  staticData: {
    title: 'Categories',
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
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'name', header: 'Name' },
    { 
      accessorKey: 'pic', // Display image if available
      header: 'Image',
      cell: ({ row }) => row.original.pic ? (
        <img src={row.original.pic} alt={row.original.name} className="object-cover w-10 h-10 rounded-md" />
      ) : (
        <span className="text-muted-foreground">No Image</span>
      ),
      enableSorting: false,
      enableHiding: true,
    },
    { 
      accessorKey: 'updated_at', // Use updated_at from backend
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

function DashboardCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading
  const { token } = useAuthStore();

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/categories?all=1", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load categories: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (newItem) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      if (newItem.file) {
        formData.append('image', newItem.file);
      } else if (newItem.image_url) {
        formData.append('image_url', newItem.image_url);
      }

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Category added successfully!");
      fetchCategories(); // Re-fetch categories to update the table
      return true; // Indicate success
    } catch (e) {
      toast.error("Failed to add category: " + e.message);
      return false; // Indicate failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (editedItem) => {
    setIsSubmitting(true);
    try {
      let response;

      // Check if an image is being uploaded or removed
      const hasFileOperation = editedItem.file || editedItem.pic_removed;

      if (hasFileOperation) {
        // Use FormData if there's an image operation
        const formData = new FormData();
        formData.append('name', editedItem.name);

        if (editedItem.file) {
          formData.append('image', editedItem.file);
        } else if (editedItem.pic_removed) {
          formData.append('pic_removed', 'true');
        }

        // Add method override for multipart/form-data PATCH
        formData.append('_method', 'PATCH');

        response = await fetch(`/api/categories/${editedItem.id}`, {
          method: "POST", // Use POST for multipart forms
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
          body: formData,
        });
      } else {
        // No file operation, send as JSON
        const jsonData = {
          name: editedItem.name,
        };

        response = await fetch(`/api/categories/${editedItem.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
          body: JSON.stringify(jsonData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Category updated successfully!");
      fetchCategories(); // Re-fetch categories to update the table
      return true; // Indicate success
    } catch (e) {
      console.error("Full error object when updating category:", e);
      toast.error("Failed to update category: " + e.message);
      return false; // Indicate failure
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      toast.success("Category deleted successfully!");
      fetchCategories(); // Re-fetch categories to update the table
    } catch (e) {
      toast.error("Failed to delete category: " + e.message);
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
      // Create an array of promises for all delete operations
            const deletePromises = selectedRows.map((row) =>
              fetch(`/api/categories/${row.original.id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "X-Auth-Token": token
                },
              })
            );
      const results = await Promise.allSettled(deletePromises);
      let allSucceeded = true;
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          allSucceeded = false;
          console.error(`Failed to delete category ${selectedRows[index].original.id}:`, result.reason);
        } else if (!result.value.ok) {
          allSucceeded = false;
          result.value.json().then(errorData => {
            console.error(`Failed to delete category ${selectedRows[index].original.id}:`, errorData.detail || result.value.statusText);
          });
        }
      });

      if (allSucceeded) {
        toast.success("Selected categories deleted successfully!");
        setSelectedRows([]); // Clear selection
        fetchCategories(); // Re-fetch all categories
      } else {
        toast.error("Some categories failed to delete. Please check console for details.");
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
        link.setAttribute("download", "categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Categories exported as CSV.");
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
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <CrudDataTable
        title="Manage Categories"
        description="Here you can manage your property categories."
        searchPlaceholder="Filter categories..."
        data={categories}
        onAddItem={handleAddCategory}
        onEditItem={handleEditCategory}
        columns={columns}
        FormComp={CategoryForm} // Use the custom form component
        entityName="Category"
        handleDeleteItem={handleDeleteCategory}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/categories"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting} // Pass submitting state to disable form actions
      />
    </div>
  );
}