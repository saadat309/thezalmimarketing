import React, { useState } from 'react';
import { CrudDataTable } from '@/components/dashboard/CrudDataTable';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from "@/components/ui/checkbox";
import { createFileRoute } from '@tanstack/react-router';
import { ArrowUpDown, CopyIcon, ArrowDown, ArrowUp } from 'lucide-react';
import { TableActions } from '@/components/dashboard/TableActions';
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
  } from '@/components/ui/dropdown-menu';

import { Button } from '@/components/ui/button';
import { toast } from "sonner"; // For showing toast notifications

export const Route = createFileRoute('/dashboard/users')({
  component: DashboardUsers,
  staticData: {
    title: 'Users',
  },
});

function DashboardUsers() {
  const [users, setUsers] = useState([
    {
      id: uuidv4(),
      fullName: 'John Doe',
      role: 'Admin',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      status: 'Active',
      changed_at: '2024-12-01 10:00',
    },
    {
      id: uuidv4(),
      fullName: 'Jane Smith',
      role: 'CEO',
      email: 'jane.smith@example.com',
      phone: '098-765-4321',
      status: 'Unconfirmed',
      changed_at: '2024-12-01 11:30',
    },
    {
        id: uuidv4(),
        fullName: 'Peter Jones',
        role: 'Admin',
        email: 'peter.jones@example.com',
        phone: '555-123-4567',
        status: 'Blocked',
        changed_at: '2024-12-01 12:00',
      },
  ]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableInstance, setTableInstance] = useState(null);

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleDeleteSelected = () => {
    const selectedIds = new Set(selectedRows.map((row) => row.original.id));
    setUsers(users.filter((user) => !selectedIds.has(user.id)));
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
            // Handle cases where value might be null/undefined or needs escaping
            value = value === null || value === undefined ? "" : String(value);
            // Escape commas and quotes
            if (/[",\n]/.test(value)) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += row.join(",") + "\n";
    });

    // Create a link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users exported as CSV.");
  };

  const handleExportPdf = () => {
    // Placeholder for PDF export logic
    toast.info("Exporting as PDF...");
  };

  const handleCopyInviteLink = (userEmail) => {
    const inviteLink = `https://your-app.com/invite?email=${encodeURIComponent(userEmail)}&token=mocktoken`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(`Invite link copied for ${userEmail}`);
  };

  const handleAddUser = (newItem) => {
    setUsers((current) => [...current, { ...newItem, id: uuidv4(), status: 'Unconfirmed', changed_at: new Date().toLocaleString() }]);
    toast.success("User added successfully!");
  };

  const handleEditUser = (editedItem) => {
    setUsers((current) =>
      current.map((user) =>
        user.id === editedItem.id ? { ...editedItem, changed_at: new Date().toLocaleString() } : user
      )
    );
    toast.success("User updated successfully!");
  };

  const renderUserCustomActions = (user, openEditSheet, actualHandleDeleteItem) => {
    return (
        <>
        {user.status === 'Unconfirmed' && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyInviteLink(user.email); }}>
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy Invite Link
            </DropdownMenuItem>
        )}
        </>
    );
  };

  const formFields = [
    { name: 'fullName', label: 'Full Name', required: true },
    { name: 'role', label: 'Role', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'status', label: 'Status' }, // For editing existing users
  ];

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
    { accessorKey: 'fullName', header: 'Full Name' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone', header: 'Phone' },
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

  return (
    <div>
      <CrudDataTable
        title="Manage Users"
        data={users}
        setData={setUsers}
        columns={userColumns}
        formFields={formFields}
        entityName="User"
        handleDeleteItem={handleDeleteUser}
        onAddItem={handleAddUser}
        onEditItem={handleEditUser}
        renderCustomActions={renderUserCustomActions}
        routePath="/dashboard/users"
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