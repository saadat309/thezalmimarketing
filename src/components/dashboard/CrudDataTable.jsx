import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
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
import { PlusCircle, FilePenIcon, TrashIcon, MoreVerticalIcon, ColumnsIcon, ArrowUpDown, PlusIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon } from "lucide-react";
import QuillRichText from './QuillRichText'; // Import the new rich text editor

export function CrudDataTable({
  title,
  description,
  searchPlaceholder,
  data,
  setData,
  columns,
  formFields, // Retain for backward compatibility
  FormComp,   // New prop for custom form component
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
  sheetClassName,
  handleDeleteSelected,
  handleExportCsv,
  handleExportPdf,
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [formData, setFormData] = useState({}); // Retain for default form behavior

  // Effect for initializing formData when using the default form
  useEffect(() => {
    if (isSheetOpen && !FormComp) { // Only run if sheet is open AND no custom form is provided
      const initialData = formFields.reduce((acc, field) => {
        acc[field.name] = editingItem?.[field.name] || '';
        return acc;
      }, {});
      setFormData(initialData);
    } else if (!FormComp) {
      setFormData({});
    }
  }, [isSheetOpen, editingItem, formFields, FormComp]);

  const resetSheetState = useCallback(() => {
    setIsSheetOpen(false);
    setEditingItem(null);
    setIsDuplicating(false);
    onEditingItemChange?.(null);
    setFormData({}); // Reset formData as well
  }, [onEditingItemChange]);

  const onFormSubmit = useCallback(async (submittedData) => {
    const itemToProcess = { ...submittedData, changed_at: new Date().toLocaleString() };
    let success = false;

    // A duplicate operation is just an "add" operation with pre-filled data.
    // We prioritize onAddItem for duplication.
    if (isDuplicating) {
      console.log("CrudDataTable - onFormSubmit: In duplicating mode.");
      console.log("CrudDataTable - onFormSubmit: itemToProcess (before id/uuidv4 check):", itemToProcess);
      if (onAddItem) {
        const newItemWithId = { ...itemToProcess, id: uuidv4() };
        console.log("CrudDataTable - onFormSubmit: Calling onAddItem with:", newItemWithId);
        success = await onAddItem(newItemWithId);
      } else if (onDuplicateItem) { // Fallback for components that might provide onDuplicateItem
        success = await onDuplicateItem({ ...itemToProcess, id: uuidv4() });
      } else {
        setData((current) => [...current, { ...itemToProcess, id: uuidv4() }]);
        success = true; // Assume success if setData is used directly
      }
    } else if (editingItem) {
      if (onEditItem) {
        success = await onEditItem({ ...editingItem, ...itemToProcess });
      } else {
        setData((current) =>
          current.map((item) => (item.id === editingItem.id ? { ...editingItem, ...itemToProcess } : item))
        );
        success = true;
      }
    } else {
      if (onAddItem) {
        success = await onAddItem({ ...itemToProcess, id: uuidv4() });
      } else {
        setData((current) => [...current, { ...itemToProcess, id: uuidv4() }]);
        success = true;
      }
    }
    
    if (success) {
      resetSheetState();
    }
  }, [isDuplicating, onDuplicateItem, setData, editingItem, onEditItem, onAddItem, resetSheetState]);


  const onFormCancel = useCallback(() => {
    resetSheetState();
  }, [resetSheetState]);

  // Handle form change for default form
  const handleFormChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleDefaultFormSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData);
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
          <SheetContent className={cn("sm:max-w-[600px]", sheetClassName)} onPointerDownOutside={(event) => event.preventDefault()}>
            <SheetHeader>
              <SheetTitle>{editingItem && !isDuplicating ? `Edit ${entityName}` : `Add New ${entityName}`}</SheetTitle>
              <SheetDescription>
                {editingItem && !isDuplicating ? `Make changes to your ${entityName.toLowerCase()} here.` : `Add a new ${entityName.toLowerCase()} to your list.`}
              </SheetDescription>
            </SheetHeader>

            {FormComp ? (
              <FormComp
                initialData={editingItem}
                onSuccess={onFormSubmit}
                onCancel={onFormCancel}
                isDuplicating={isDuplicating}
              />
            ) : (
              <form onSubmit={handleDefaultFormSubmit} className="grid grid-cols-1 gap-4 py-4">
                {formFields.map((field) => (
                  <div key={field.name} className="grid grid-cols-1 gap-4">
                    <Label htmlFor={field.name} className="text-left">{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
                        className="col-span-full"
                        required={field.required}
                      />
                    ) : field.type === 'richtext' ? (
                      <QuillRichText
                        value={formData[field.name] || ''}
                        onChange={(value) => handleFormChange(field.name, value)}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleFormChange(field.name, e.target.value)}
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
            )}
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
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {table.getFilteredSelectedRowModel().rows.length >= 2 ? (
                  <>
                    <Button variant="destructive" size="sm" className="h-8" onClick={handleDeleteSelected}>
                      Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">Export Selected</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleExportCsv}>As CSV</DropdownMenuItem>
                        <DropdownMenuItem onSelect={handleExportPdf}>As PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Input
                      placeholder={searchPlaceholder || `Filter ${entityName.toLowerCase()}s...`}
                      value={(table.getState().globalFilter) || ''}
                      onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                      }
                      className="h-8 w-[150px] lg:w-[250px]"
                    />
                    <Button variant="outline" size="sm" className="h-8">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Status
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Priority
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <ColumnsIcon className="w-4 h-4 mr-2" />
                    View
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
                    <DropdownMenuSeparator />
                    {resetPreferences && (
                        <DropdownMenuItem onClick={resetPreferences}>
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            Reset View
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
              </DropdownMenu>
              {!disableAdd && (
                  <Button onClick={openAddSheet} size="sm" className="h-8">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DataTable>
    </div>
  );
}
