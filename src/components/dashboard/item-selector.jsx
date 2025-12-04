import React, { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { GripVertical, X as XIcon, Check as CheckIcon, ChevronsUpDown } from 'lucide-react';

function SortableBadge({ id, label, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="inline-flex items-center">
      <Badge variant="secondary" className="py-1 pl-2 pr-1 text-sm">
        <span {...listeners} className="pr-2 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </span>
        {label}
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 ml-1"
          onClick={() => onRemove(id)}
        >
          <XIcon className="w-3 h-3" />
        </Button>
      </Badge>
    </div>
  );
}

export function ItemSelector({ availableItems, selectedItems, onSelectionChange, onOrderChange, itemKey = 'id', itemLabel = 'title' }) {
  const [open, setOpen] = useState(false);
  const selectedIds = useMemo(() => new Set(selectedItems.map(item => item[itemKey])), [selectedItems, itemKey]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleToggle = (item) => {
    let newSelectedItems;
    if (selectedIds.has(item[itemKey])) {
      newSelectedItems = selectedItems.filter(selected => selected[itemKey] !== item[itemKey]);
    } else {
      newSelectedItems = [...selectedItems, item];
    }
    onSelectionChange(newSelectedItems);
  };

  const handleRemove = (idToRemove) => {
    const newSelectedItems = selectedItems.filter(item => item[itemKey] !== idToRemove);
    onSelectionChange(newSelectedItems);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = selectedItems.findIndex(item => item[itemKey] === active.id);
      const newIndex = selectedItems.findIndex(item => item[itemKey] === over.id);
      const newOrder = arrayMove(selectedItems, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  };

  return (
    <div className="w-full">
      <h3 className="mb-2 text-base font-semibold">Available Items</h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full active:scale-none">
            {selectedItems.length > 0 ? `${selectedItems.length} item(s) selected` : "Select items..."}
            <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search items..." />
            <CommandList>
              <CommandEmpty className="py-2 text-sm text-center">No items found.</CommandEmpty>
              <CommandGroup>
                {availableItems.map((item) => (
                  <CommandItem
                    key={item[itemKey]}
                    value={item[itemLabel] || item.name}
                    onSelect={() => {
                      handleToggle(item);
                      setOpen(false);
                    }}
                    className="text-sm"
                  >
                    <CheckIcon
                      className={`mr-2 h-4 w-4 ${selectedIds.has(item[itemKey]) ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {item[itemLabel] || item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="mt-4">
        <h3 className="mb-2 text-base font-semibold">Selected Items</h3>
        <Card>
          <CardContent className="p-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={selectedItems.map(i => i[itemKey])} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <SortableBadge
                      key={item[itemKey]}
                      id={item[itemKey]}
                      label={item[itemLabel] || item.name}
                      onRemove={() => handleRemove(item[itemKey])}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            {selectedItems.length === 0 && (
              <div className="text-sm text-center text-gray-500">
                Select items from the dropdown to add them here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
