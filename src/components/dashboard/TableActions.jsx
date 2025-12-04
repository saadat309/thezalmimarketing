import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function TableActions({
  selectedRows,
  handleDeleteSelected,
  handleExportCsv,
  handleExportPdf,
}) {
  if (selectedRows.length < 2) {
    return null;
  }

  return (
    <div className="flex items-center justify-start gap-2 mt-4">
      <Button variant="destructive" onClick={handleDeleteSelected}>
        Delete Selected ({selectedRows.length})
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Export Selected</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleExportCsv}>As CSV</DropdownMenuItem>
          <DropdownMenuItem onSelect={handleExportPdf}>As PDF</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
