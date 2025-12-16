import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select"; // Import MultiSelect

// Define Zod schema for phase form validation
const phaseFormSchema = z.object({
  name: z.string().min(1, "Phase name is required"),
  map_ids: z.array(z.string()).optional(), // Add map_ids to schema, expecting array of strings
});

export default function PhaseForm({ initialData, onSuccess, onCancel, isDuplicating }) {
  const [allMaps, setAllMaps] = useState([]); // State to store all available maps

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      map_ids: initialData?.map_ids?.map(String) || [], // Ensure map_ids are strings
      ...(initialData || {}),
    },
  });

  const selectedMapIds = watch('map_ids'); // Watch selected map IDs from the form

  // Fetch all maps on component mount and handle initialData
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const availableMapsResponse = await fetch('/api/maps?available_for=phase');
        if (!availableMapsResponse.ok) {
          throw new Error('Failed to fetch available maps.');
        }
        const availableMapsData = await availableMapsResponse.json();

        let currentPhaseMapsData = [];
        if (initialData && initialData.map_ids && initialData.map_ids.length > 0) {
          // Fetch details for maps currently associated with this phase
          const currentPhaseMapPromises = initialData.map_ids.map(mapId =>
            fetch(`/api/maps/${mapId}`).then(res => {
              if (!res) return null; // Handle null response if map doesn't exist
              if (!res.ok) throw new Error(`Failed to fetch map ${mapId}`);
              return res.json();
            }).catch(e => {
                console.error(`Error fetching map ${mapId}:`, e);
                return null; // Return null for failed fetches
            })
          );
          currentPhaseMapsData = (await Promise.all(currentPhaseMapPromises)).filter(Boolean); // Filter out nulls
        }

        // Combine and deduplicate all maps for the MultiSelect options
        const combinedMaps = [...availableMapsData, ...currentPhaseMapsData];
        const uniqueMaps = Array.from(new Map(combinedMaps.map(map => [map.id, map])).values());

        setAllMaps(uniqueMaps.map(map => ({ value: String(map.id), label: map.title })));
      } catch (error) {
        console.error("Failed to load maps for multi-select:", error);
        toast.error("Failed to load maps: " + error.message);
      }
    };
    fetchMaps();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      const formDataToSet = isDuplicating
        ? { ...initialData, id: undefined, map_ids: initialData.map_ids?.map(String) || [] } // Ensure map_ids are strings for duplication
        : { ...initialData, map_ids: initialData.map_ids?.map(String) || [] }; // Ensure map_ids are strings

      reset(formDataToSet);
    } else {
      reset({
        name: "",
        map_ids: [],
      });
    }
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      // map_ids from react-hook-form should already be an array of strings
      map_ids: data.map_ids || [], 
      id: (isDuplicating || !initialData) ? undefined : initialData.id,
    };
    onSuccess(finalData);
  };

  return (
    <div className="p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Phase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Phase Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    placeholder="Enter phase name"
                    {...field}
                  />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="map_ids">Associated Maps</Label>
              <Controller
                name="map_ids"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    options={allMaps}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select maps for this phase"
                  />
                )}
              />
              {errors.map_ids && (
                <p className="text-sm text-red-500">{errors.map_ids.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t">
          <Button type="submit" size="lg">
            {initialData ? 'Save Changes' : `Add Phase`}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}