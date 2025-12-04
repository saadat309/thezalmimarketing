import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


import { useTablePreferencesStore, initialPreferenceState } from '@/store/tablePreferencesStore';

export function DataTable({
  data: initialData,
  columns,
  setData,
  children,
  onRowClick,
  preferenceKey, // Add preferenceKey prop
  onSelectionChange,
  getRowClassName, // New prop
}) {
  const data = initialData;

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);

  // Zustand store integration for table preferences
  const { preferences, setPreference, getAllPreferences, initializePreferences, resetPreferences: storeResetPreferences, _hasHydrated } = useTablePreferencesStore();


  // If preferenceKey is not provided or store has not hydrated, render a loading state.
  // This prevents useReactTable from initializing with undefined persisted state.
  if (!preferenceKey || !_hasHydrated) {
      return (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
              Loading table preferences...
          </div>
      );
  }

  // Get initial preferences to ensure valid defaults, especially during Zustand hydration
  const initialPrefsFromStore = getAllPreferences(preferenceKey);

  // Initialize useReactTable states with local useState, setting initial values from store defaults
  const [columnVisibilityState, setColumnVisibilityState] = React.useState(initialPrefsFromStore.columnVisibility);
  const [sortingState, setSortingState] = React.useState(initialPrefsFromStore.sorting);
  const [paginationState, setPaginationState] = React.useState(initialPrefsFromStore.pagination);

  // Effects to update local states when store preferences change (e.g., after initial hydration or a reset)
  React.useEffect(() => {
    if (preferenceKey) {
        initializePreferences(preferenceKey); // Ensure key is in store's preferences map
        // After hydration, preferences might update. We need to react to that.
        const currentTablePrefs = {
            ...initialPreferenceState,
            ...(preferences[preferenceKey] || {}),
        };
        setColumnVisibilityState(currentTablePrefs.columnVisibility);
        setSortingState(currentTablePrefs.sorting);
        setPaginationState(currentTablePrefs.pagination);
    }
  }, [preferenceKey, preferences, initializePreferences, getAllPreferences, setColumnVisibilityState, setSortingState, setPaginationState]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortingState,
      columnVisibility: columnVisibilityState,
      rowSelection,
      columnFilters,
      pagination: paginationState,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newState = typeof updater === 'function'
        ? updater(table.getState().sorting)
        : updater;
      setSortingState(newState);
      setPreference(preferenceKey, 'sorting', newState);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: (updater) => {
      // TanStack Table's updater can be a function or a value.
      // We need the resolved value to save to preferences.
      const newState = typeof updater === 'function'
        ? updater(table.getState().columnVisibility) // Resolve function updater
        : updater;
      setColumnVisibilityState(newState);
      setPreference(preferenceKey, 'columnVisibility', newState);
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function'
        ? updater(table.getState().pagination)
        : updater;
      setPaginationState(newState);
      setPreference(preferenceKey, 'pagination', newState);
    },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
});

  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(table.getFilteredSelectedRowModel().rows, table);
    }
  }, [rowSelection, onSelectionChange, table]);

  const resetPreferences = React.useCallback(() => {
    if (!preferenceKey) return;
    storeResetPreferences(preferenceKey);
    // useReactTable does not have a direct reset method for all states
    // Force a re-render of the table if necessary, though Zustand's state changes
    // should propagate and update the table via the `state` prop of useReactTable
  }, [preferenceKey, storeResetPreferences]);

return (
    <div className="flex flex-col justify-start w-full gap-4">
      {children && children(table, { resetPreferences })}
      <div className="overflow-hidden border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={`${row.id}-${row.original.isRead}`} // Modify key to include isRead status
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={getRowClassName ? getRowClassName(row) : ''} // Apply class name here
                  >
                    {row.getVisibleCells().map((cell) => {
                      const cellContext = cell.getContext();
                      if (cell.column.id === 'select') {
                        cellContext.isChecked = row.getIsSelected();
                      }
                      return (
                        <TableCell key={`${cell.id}-${columnVisibilityState[cell.column.id] ? 'visible' : 'hidden'}`}>
                          {flexRender(cell.column.columnDef.cell, cellContext)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="flex-1 hidden text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center w-full gap-8 lg:w-fit">
          <div className="items-center hidden gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center text-sm font-medium w-fit">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <Button
              variant="outline"
              className="hidden w-8 h-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}