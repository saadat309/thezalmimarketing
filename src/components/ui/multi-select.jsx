import * as React from "react"
import { Check, ChevronsUpDown, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

const MultiSelect = React.forwardRef(
  ({ options, value, onChange, placeholder, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (currentValue) => {
      const isSelected = value.includes(currentValue);
      if (isSelected) {
        onChange(value.filter((item) => item !== currentValue));
      } else {
        onChange([...value, currentValue]);
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange([]);
    };

    const selectedOptions = options.filter(option => value.includes(option.value));

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between flex-wrap h-auto min-h-10", className)}
            {...props}
            ref={ref}
          >
            <div className="flex flex-wrap items-center gap-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent popover from closing
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                    <XCircle className="h-3 w-3 cursor-pointer" />
                  </Badge>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              {value.length > 0 && (
                <XCircle
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100 cursor-pointer"
                  onClick={handleClear}
                />
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Use label for command search
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

export { MultiSelect }