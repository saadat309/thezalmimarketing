import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, FilePenIcon, TrashIcon, MoreVerticalIcon, ColumnsIcon, ArrowUpDown, PlusIcon, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CopyIcon } from "lucide-react";
import QuillRichText from './QuillRichText'; // Import the new rich text editor
import { useTablePreferencesStore } from '@/store/tablePreferencesStore';

export function CrudDataTable({
  title,
  description,
  searchPlaceholder = "Filter...",
  data,
  columns,
  formFields, // Retain for backward compatibility
  FormComp,   // New prop for custom form component
  formProps = {}, // Extra props for the form to pass to FormComp
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
  onTablePreferencesLoadingChange, // New prop
  isSubmitting, // Pass submitting state to disable form actions
  canEditItem,   // Function (item) => boolean, optional
  canDeleteItem, // Function (item) => boolean, optional
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [formData, setFormData] = useState({}); // Retain for default form behavior

  const { _hasHydrated } = useTablePreferencesStore();

  useEffect(() => {
    onTablePreferencesLoadingChange?.(!_hasHydrated);
  }, [_hasHydrated, onTablePreferencesLoadingChange]);

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
      if (onAddItem) {
        success = await onAddItem(itemToProcess); // Let onAddItem handle the ID
      } else {
        // If no onAddItem, fall back to internal data management (not typical for custom forms)
        // For default form, assume new ID on add.
        // This case is primarily for cases where CrudDataTable is used without external handlers.
        success = true;
      }
    } else if (editingItem) {
      if (onEditItem) {
        success = await onEditItem({ ...editingItem, ...itemToProcess });
      } else {
        // Fallback for internal data management if no onEditItem
        success = true;
      }
    } else {
      if (onAddItem) {
        success = await onAddItem(itemToProcess); // Let onAddItem handle the ID
      } else {
        // Fallback for internal data management
        success = true;
      }
    }
    
    if (success) {
      resetSheetState();
    }
  }, [isDuplicating, editingItem, onEditItem, onAddItem, resetSheetState]);


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
    // This case should ideally be handled by the parent component via handleDeleteItem
    // If not provided, CrudDataTable doesn't know how to delete from external 'data' prop
    
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
    const shouldOpenEditSheet = onRowClick ? onRowClick(item) : true;
    if (shouldOpenEditSheet) {
      openEditSheet(item);
    }
  };

  const defaultOnDuplicateItem = (item) => {
    const duplicatedItem = { ...item, changed_at: new Date().toLocaleString(), id: undefined }; // Clear ID for duplication
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
              {(!disableAdd && (!canEditItem || canEditItem(item))) && (
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
              {renderCustomActions && renderCustomActions(item, openEditSheet, actualHandleDeleteItem, isSubmitting)}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {(!canDeleteItem || canDeleteItem(item)) && (
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()} onSelect={(e) => e.preventDefault()}>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
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
                    <AlertDialogAction onClick={(e) => { e.stopPropagation(); actualHandleDeleteItem(item.id); }} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
    <div className="container relative px-4 py-8 mx-auto lg:px-6">
      {isSubmitting && !isSheetOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 p-4 bg-white border rounded-lg shadow-lg">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Processing...</p>
            </div>
        </div>
      )}
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
                isSubmitting={isSubmitting}
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {editingItem && !isDuplicating ? 'Save changes' : `Add ${entityName}`}
                    </Button>
                </SheetFooter>
              </form>
            )}
          </SheetContent>
        </Sheet>
      )}
      <DataTable
        columns={allColumns}
        data={data}
        onRowClick={internalOnRowClick}
        onSelectionChange={(rows, table) => onSelectionChange?.(rows, table)}
        preferenceKey={`${routePath}-table-prefs`} // Pass unique key for preferences
        getRowClassName={getRowClassName} // Pass the new prop here
        _hasHydrated={_hasHydrated} // Pass _hasHydrated to DataTable
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
                    <Button variant="destructive" size="sm" className="h-8" onClick={handleDeleteSelected} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Export Selected
                        </Button>
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
                    {/* <Button variant="outline" size="sm" className="h-8">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Status
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Priority
                    </Button> */}
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
