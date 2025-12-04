import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, FilePenIcon, TrashIcon, MoreVerticalIcon, ColumnsIcon, ArrowUpDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon } from "lucide-react";

export function CrudDataTable({
  title,
  data,
  setData,
  columns,
  formFields,
  entityName,
  disableAdd = false,
  handleDeleteItem,
  onRowClick,
  renderCustomActions,
  onDuplicateItem,
  routePath, // Add routePath prop
  onSelectionChange,
  onAddItem,
  onEditItem,
  customFormContent,
  onEditingItemChange, // Add onEditingItemChange prop
  getRowClassName, // New prop
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(false); // New state variable

  const handleAddEditItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let newItem = {};
    formFields.forEach(field => {
        newItem[field.name] = formData.get(field.name);
    });
    newItem.changed_at = new Date().toLocaleString(); // Update changed_at on add/edit

    if (isDuplicating) {
      if (onDuplicateItem) {
        onDuplicateItem({ ...newItem, id: uuidv4() });
      } else {
        setData([...data, { ...newItem, id: uuidv4() }]);
      }
    } else if (editingItem) { // It's an edit of an existing item
      if (onEditItem) {
        onEditItem({ ...newItem, id: editingItem.id });
      } else {
        setData(data.map((item) => (item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item)));
      }
    } else { // Truly new item (editingItem is null)
      if (onAddItem) {
        onAddItem({ ...newItem, id: uuidv4() });
      } else {
        setData([...data, { ...newItem, id: uuidv4() }]);
      }
    }
    setIsSheetOpen(false);
    setEditingItem(null);
    setIsDuplicating(false);
    onEditingItemChange?.(null); // Notify parent that editing is complete/reset
  };

  const actualHandleDeleteItem = handleDeleteItem || ((id) => {
    setData(data.filter((item) => item.id !== id));
  });

  const openEditSheet = (item) => {
    setEditingItem(item);
    setIsDuplicating(false);
    setIsSheetOpen(true);
    onEditingItemChange?.(item); // Notify parent when editing starts
  };

  const openAddSheet = () => {
    setEditingItem(null);
    setIsDuplicating(false);
    setIsSheetOpen(true);
    onEditingItemChange?.(null); // Notify parent when adding a new item
  };

  const internalOnRowClick = (item) => {
    onRowClick?.(item); // Execute the passed onRowClick prop first
    openEditSheet(item); // Then open the edit sheet
  };

  const defaultOnDuplicateItem = (item) => {
    const duplicatedItem = { ...item, id: uuidv4(), changed_at: new Date().toLocaleString() };
    setEditingItem(duplicatedItem); // Pre-fill form with duplicated data
    setIsDuplicating(true); // Indicate duplicating mode
    setIsSheetOpen(true);
  };

  const actualOnDuplicateItem = onDuplicateItem || defaultOnDuplicateItem; // Use internal or passed onDuplicateItem

  const actionColumn = {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-8 h-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <MoreVerticalIcon className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!disableAdd && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditSheet(item); }}>
                  <FilePenIcon className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {!disableAdd && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); actualOnDuplicateItem(item); }}>
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {renderCustomActions && renderCustomActions(item, openEditSheet, actualHandleDeleteItem)}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onClick={(e) => e.stopPropagation()} onSelect={(e) => e.preventDefault()}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this {entityName}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); actualHandleDeleteItem(item.id); }}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  };

  const allColumns = [...columns, actionColumn];

  return (
    <div className="container px-4 py-8 mx-auto lg:px-6">
      {!disableAdd && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent onPointerDownOutside={(event) => event.preventDefault()}>
            <SheetHeader>
              <SheetTitle>{editingItem && !isDuplicating ? `Edit ${entityName}` : `Add New ${entityName}`}</SheetTitle>
              <SheetDescription>
                {editingItem && !isDuplicating ? `Make changes to your ${entityName.toLowerCase()} here.` : `Add a new ${entityName.toLowerCase()} to your list.`}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAddEditItem} className="grid grid-cols-1 gap-4 py-4">
              {formFields.map((field) => (
                <div key={field.name} className="grid grid-cols-1 gap-4">
                  <Label htmlFor={field.name} className="text-left">{field.label}</Label>
                  {field.type === 'textarea' ? (
                      <Textarea
                          id={field.name}
                          name={field.name}
                          defaultValue={editingItem?.[field.name] || ''}
                          className="col-span-full"
                          required={field.required}
                      />
                  ) : (
                      <Input
                          id={field.name}
                          name={field.name}
                          type={field.type || 'text'}
                          defaultValue={editingItem?.[field.name] || ''}
                          className="col-span-full"
                          required={field.required}
                      />
                  )}
                </div>
              ))}
              {customFormContent && (
                <div className="col-span-full">
                  {customFormContent(editingItem)}
                </div>
              )}
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">{editingItem ? 'Save changes' : `Add ${entityName}`}</Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      )}
      <DataTable
        columns={allColumns}
        data={data}
        setData={setData}
        onRowClick={internalOnRowClick}
        onSelectionChange={(rows, table) => onSelectionChange?.(rows, table)}
        preferenceKey={`${routePath}-table-prefs`} // Pass unique key for preferences
        getRowClassName={getRowClassName} // Pass the new prop here
      >
        {(table, { resetPreferences }) => (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0 sm:w-auto sm:px-3 sm:py-2">
                    <ColumnsIcon className="w-4 h-4" />
                    <span className="hidden ml-2 sm:inline">Customize Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== 'undefined' &&
                        column.getCanHide()
                    )
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={table.getState().columnVisibility[column.id] ?? column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              {!disableAdd && (
                <Button onClick={openAddSheet} size="sm" className="w-8 h-8 p-0 sm:w-auto sm:px-3 sm:py-2">
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden ml-2 sm:inline">Add New {entityName}</span>
                </Button>
              )}
              {resetPreferences && (
                <Button onClick={resetPreferences} variant="outline" size="sm" className="w-8 h-8 p-0 sm:w-auto sm:px-3 sm:py-2">
                  <ArrowUpDown className="w-4 h-4" /> {/* Using ArrowUpDown for reset icon, can be changed */}
                  <span className="hidden ml-2 sm:inline">Reset View</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </DataTable>
    </div>
  );
}
