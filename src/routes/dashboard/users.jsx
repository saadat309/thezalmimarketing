import React, { useState, useEffect } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpDown, CopyIcon, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"; 
import UserForm from '@/components/dashboard/user-form/user-form';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from "@/store/authStore"; // Import useAuthStore

export const Route = createFileRoute('/dashboard/users')({
  component: DashboardUsers,
  staticData: {
    title: 'Users',
  },
});

function DashboardUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user: currentUser } = useAuthStore(); // Get current user

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          "X-Auth-Token": useAuthStore.getState().token, // Send token
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
      toast.error("Failed to load users: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          "X-Auth-Token": useAuthStore.getState().token,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newUser = await response.json(); 
      toast.success("User added successfully!");
      if (newUser.invite_token) {
        toast.info(`Invite link generated for ${newUser.email}. Token: ${newUser.invite_token}`, {
            duration: 10000,
            action: {
                label: 'Copy Link',
                onClick: () => handleCopyInviteLink(newUser.email, newUser.invite_token),
            },
        });
      }
      fetchUsers(); 
      return true;
    } catch (e) {
      console.error("Submission error:", e);
      toast.error("Failed to add user: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
          "X-Auth-Token": useAuthStore.getState().token,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      toast.success("User updated successfully!");
      fetchUsers(); 
      return true;
    } catch (e) {
      console.error("Submission error:", e);
      toast.error("Failed to update user: " + e.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
          'X-Auth-Token': useAuthStore.getState().token
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      toast.success("User deleted successfully!");
      fetchUsers(); 
    } catch (e) {
      toast.error("Failed to delete user: " + e.message);
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
        fetch(`/api/users/${row.original.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
            "X-Auth-Token": useAuthStore.getState().token,
          },
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
        toast.success("Selected users deleted successfully!");
      } else {
        toast.error(`Failed to delete ${failedDeletes.length} user(s).`);
      }

      setSelectedRows([]);
      fetchUsers(); 
    } catch (e) {
      toast.error("Error during batch deletion: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAndCopyInviteLink = async (userEmail, userId) => {
    setIsSubmitting(true);
    try {
      toast.info(`Generating new invite link for ${userEmail}...`);
      const response = await fetch(
        `/api/users/${userId}/generate-invite-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${useAuthStore.getState().token}`,
            "X-Auth-Token": token
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newInviteToken = data.invite_token;

      if (newInviteToken) {
        handleCopyInviteLink(userEmail, newInviteToken);
        toast.success("New invite link generated and copied!");
      } else {
        throw new Error("Failed to retrieve new invite token from server.");
      }
    } catch (e) {
      console.error("Failed to generate and copy invite link:", e);
      toast.error("Failed to generate invite link: " + e.message);
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
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX feedback

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
        link.setAttribute("download", "users.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Users exported as CSV.");
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

  const handleCopyInviteLink = (userEmail, inviteToken) => {
    const inviteLink = `${window.location.origin}/accept-invite?email=${encodeURIComponent(userEmail)}&token=${inviteToken}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(`Invite link copied for ${userEmail}`);
  };

  const renderUserCustomActions = (rowUser, openEditSheet, actualHandleDeleteItem, isSubmitting) => {
    return (
        <>
        {rowUser.status === 'inActive' && ( 
            <DropdownMenuItem 
                disabled={isSubmitting}
                onClick={(e) => { e.stopPropagation(); handleGenerateAndCopyInviteLink(rowUser.email, rowUser.id); }}
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                Generate & Copy Invite Link
            </DropdownMenuItem>
        )}
        </>
    );
  };

  // RBAC Logic
  const canEditItem = (item) => {
      if (!currentUser) return false;
      const myRole = currentUser.role_name?.toLowerCase();
      const targetRole = item.role_name?.toLowerCase();

      if (myRole === 'ceo') return true;
      if (myRole === 'admin') {
          return targetRole !== 'ceo';
      }
      return false;
  };

  const canDeleteItem = (item) => {
      if (!currentUser) return false;
      if (currentUser.id === item.id) return false; // Cannot delete self

      const myRole = currentUser.role_name?.toLowerCase();
      const targetRole = item.role_name?.toLowerCase();

      if (myRole === 'ceo') return true;
      if (myRole === 'admin') {
          return targetRole !== 'ceo';
      }
      return false;
  }

  const userColumns = [
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
    { accessorKey: 'name', header: 'Full Name' }, 
    { accessorKey: 'role_name', header: 'Role' }, 
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status' },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading users...</p>
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
        title="Manage Users"
        description="Here you can manage all system users."
        searchPlaceholder="Filter users..."
        data={users}
        columns={userColumns}
        FormComp={UserForm} 
        formProps={{ /* currentUser is accessed directly in UserForm */ }} // Pass currentUser to form
        entityName="User"
        handleDeleteItem={handleDeleteUser}
        onAddItem={handleAddUser}
        onEditItem={handleEditUser}
        renderCustomActions={renderUserCustomActions}
        handleDeleteSelected={handleDeleteSelected}
        handleExportCsv={handleExportCsv}
        handleExportPdf={handleExportPdf}
        routePath="/dashboard/users"
        onSelectionChange={(rows, table) => {
            setSelectedRows(rows);
            setTableInstance(table);
        }}
        isSubmitting={isSubmitting}
        canEditItem={canEditItem} // Pass RBAC
        canDeleteItem={canDeleteItem} // Pass RBAC
      />
    </div>
  );
}