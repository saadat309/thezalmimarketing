import React, { useState, useMemo } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check as CheckIcon, 
  ChevronsUpDown, 
  Trash2 as TrashIcon,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export function LabelSelector({ 
  availableLabels, 
  selectedLabelIds, 
  onSelect, 
  onLabelDeleted 
}) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [labelToDelete, setLabelToDelete] = useState(null);
  const { token } = useAuthStore();

  const selectedIdsSet = useMemo(() => new Set(selectedLabelIds), [selectedLabelIds]);

  const confirmDeleteLabel = async () => {
    if (!labelToDelete) return;
    const label = labelToDelete;
    setLabelToDelete(null);
    
    setIsDeleting(label.id);
    try {
      const response = await fetch(`/api/labels/${label.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete label');
      }

      toast.success(`Label "${label.name}" deleted from database.`);
      if (onLabelDeleted) onLabelDeleted(label.id);
    } catch (error) {
      console.error('Delete label error:', error);
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="w-full space-y-2">
      <AlertDialog open={!!labelToDelete} onOpenChange={(open) => !open && setLabelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will PERMANENTLY delete the label "{labelToDelete?.name}" from the database.
              This action cannot be undone and will remove it from ALL properties.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLabel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Label
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background"
          >
            <div className="flex gap-1 truncate">
              {selectedLabelIds.length > 0 ? (
                <span className="text-foreground">
                  {selectedLabelIds.length} label(s) selected
                </span>
              ) : (
                <span className="text-muted-foreground">Select labels...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command className="max-h-[300px]">
            <CommandInput placeholder="Search labels..." />
            <CommandList>
              <CommandEmpty>No label found.</CommandEmpty>
              <CommandGroup>
                {availableLabels.map((label) => (
                  <CommandItem
                    key={label.id}
                    value={label.name}
                    onSelect={() => {
                      onSelect(label.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center flex-1">
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIdsSet.has(String(label.id)) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <Badge variant={label.badge_variant || "secondary"} className="mr-2">
                        {label.name}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLabelToDelete(label);
                      }}
                      disabled={isDeleting === label.id}
                    >
                      {isDeleting === label.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <TrashIcon className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
