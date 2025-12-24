import React, { useState, useEffect, useCallback } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { Spinner } from '@/components/ui/spinner';
import QueryForm from '@/components/dashboard/query-form/query-form';
import { useQueriesStore } from '@/store/queriesStore'; // Import useQueriesStore
import {
  useAuthStore
} from '@/store/authStore';
import { apiFetch } from '@/lib/apiClient';
 
export const Route = createFileRoute('/dashboard/queries')({
  component: DashboardQueries,
  staticData: {
    title: 'Queries',
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
    { 
        accessorKey: 'property_title', 
        header: 'Property',
        cell: ({ row }) => row.original.property_title || <span className="text-muted-foreground">N/A</span> 
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
    { 
        accessorKey: 'message', 
        header: 'Message', 
        cell: ({ row }) => <div className='max-w-[200px] truncate' title={row.original.message}>{row.original.message}</div> 
    },
    { 
      accessorKey: 'created_at', 
      header: ({ column }) => {
        const sorted = column.getIsSorted();
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting()}>
            Date
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

function DashboardQueries() {
  const [queries, setQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setUnreadCount, incrementUnreadCount, decrementUnreadCount } = useQueriesStore();

  const fetchQueries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queriesResponse = await apiFetch('/queries');
      if (!queriesResponse.ok) {
        throw new Error(`HTTP error! status: ${queriesResponse.status}`);
      }
      const data = await queriesResponse.json();
      setQueries(data); // Update local state

      const unreadCountResponse = await apiFetch('/queries/unread-count');
      if (!unreadCountResponse.ok) {
        throw new Error(`HTTP error! status: ${unreadCountResponse.status}`);
      }
      const { count } = await unreadCountResponse.json();
      setUnreadCount(count);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load queries: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleAddQuery = async (data) => {
    setIsSubmitting(true);
    try {
        const response = await apiFetch('/queries', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const newQuery = await response.json(); // Assuming API returns the created query
        if (!newQuery.is_read) {
          incrementUnreadCount();
        }

        toast.success("Query added successfully!");
        fetchQueries();
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to add query: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditQuery = async (data) => {
    setIsSubmitting(true);
    try {
        const response = await apiFetch(`/queries/${data.id}`, {
            method: 'PUT', // or PATCH
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        toast.success("Query updated successfully!");
        fetchQueries();
        return true;
    } catch (e) {
        console.error("Submission error:", e);
        toast.error("Failed to update query: " + e.message);
        return false;
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteQuery = async (id) => {
    setIsSubmitting(true);
    try {
      // Find the query locally to check its read status before deleting
      const queryToDelete = queries.find(q => q.id === id);

      const response = await apiFetch(`/api/queries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (queryToDelete && !queryToDelete.is_read) {
        decrementUnreadCount();
      }

      toast.success("Query deleted successfully!");
      fetchQueries(); // Refetch to ensure UI consistency
    } catch (e) {
      toast.error("Failed to delete query: " + e.message);
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
      const deletePromises = selectedRows.map(row => 
        apiFetch(`/queries/${row.original.id}`, { 
          method: 'DELETE',
        })
      );

      const results = await Promise.allSettled(deletePromises);
      
      const failedDeletes = [];
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedDeletes.push(`ID ${selectedRows[index].original.id}`);
        } else if (!result.value.ok) {
          failedDeletes.push(`ID ${selectedRows[index].original.id}`);
        }
      });

      if (failedDeletes.length === 0) {
        toast.success("Selected queries deleted successfully!");
      } else {
        toast.error(`Failed to delete ${failedDeletes.length} query(s).`);
      }
      
      setSelectedRows([]);
      fetchQueries();

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
        link.setAttribute("download", "queries.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Queries exported as CSV.");
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

  const handleRowClick = useCallback(async (query) => {
    // The query object is now directly passed as 'query'
    if (!query.is_read) {
      try {
        const response = await apiFetch(`/queries/${query.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_read: true }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Update local state
        setQueries(prevQueries =>
          prevQueries.map(q =>
            q.id === query.id ? { ...q, is_read: true } : q
          )
        );
        // Decrement global unread count
        decrementUnreadCount();
        toast.success("Query marked as read.");
        return false; // Prevent CrudDataTable from opening the edit sheet
      } catch (e) {
        console.error("Failed to mark query as read:", e);
        toast.error("Failed to mark query as read: " + e.message);
        return true; // Allow CrudDataTable to open the edit sheet on error
      }
    }
    return true; // Allow CrudDataTable to open the edit sheet if already read
  }, [decrementUnreadCount]);

  const getRowClassName = React.useCallback((row) => {
    return row.original.is_read ? '' : 'bg-blue-50/50 hover:bg-blue-50';
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading queries...</p>
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
        title="Property Queries"
        description="Manage user inquiries from your website."
        searchPlaceholder="Filter queries..."
        data={queries}
        onAddItem={handleAddQuery}
        onEditItem={handleEditQuery}
        columns={columns}
        FormComp={QueryForm}
        entityName="Query"
        handleDeleteItem={handleDeleteQuery}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/queries"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        getRowClassName={getRowClassName}
        onRowClick={handleRowClick}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}