import { useEffect, useState, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SearchableSelect } from "../SearchableSelect";
import { apiFetch } from "@/lib/apiClient";

const calculatorPhaseFormSchema = z.object({
  city_id: z.string().min(1, "City is required"),
  society_id: z.string().min(1, "Society is required"),
  name: z.string().min(1, "Phase name is required"),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export default function CalculatorPhaseForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const [cities, setCities] = useState([]);
  const [societies, setSocieties] = useState([]);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: String(c.id), label: c.name })),
    [cities]
  );
  
  const societyOptions = useMemo(
    () => societies.map((s) => ({ value: String(s.id), label: s.name })),
    [societies]
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorPhaseFormSchema),
    defaultValues: {
      city_id: "",
      society_id: "",
      name: "",
      sort_order: 0,
      is_active: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesRes, societiesRes] = await Promise.all([
          apiFetch("/cities"),
          apiFetch("/societies"),
        ]);

        if (!citiesRes.ok) throw new Error("Failed to fetch cities");
        if (!societiesRes.ok) throw new Error("Failed to fetch societies");

        const citiesData = await citiesRes.json();
        const societiesData = await societiesRes.json();

        setCities(citiesData);
        setSocieties(societiesData);

        if (initialData) {
          reset({
            city_id: initialData.city_id ? String(initialData.city_id) : "",
            society_id: initialData.society_id ? String(initialData.society_id) : "",
            name: initialData.name || "",
            sort_order: initialData.sort_order ?? 0,
            is_active: initialData.is_active === 1 || initialData.is_active === true,
            ...(isDuplicating ? { id: undefined } : {}),
          });
        } else {
          reset({
            city_id: "",
            society_id: "",
            name: "",
            sort_order: 0,
            is_active: true,
          });
        }
      } catch (error) {
        console.error("Failed to load form dependencies:", error);
        toast.error("Failed to load cities/societies: " + error.message);
      }
    };

    fetchData();
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      city_id: Number(data.city_id),
      society_id: Number(data.society_id),
      sort_order: Number(data.sort_order ?? 0),
      is_active: data.is_active ? 1 : 0,
      id: isDuplicating || !initialData ? undefined : initialData.id,
    };
    onSuccess(finalData);
  };

  return (
    <div className="p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Calculator Phase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city_id">
                  City <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={cityOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select city"
                    />
                  )}
                />
                {errors.city_id && (
                  <p className="text-sm text-red-500">{errors.city_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="society_id">
                  Society <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="society_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      options={societyOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select society"
                    />
                  )}
                />
                {errors.society_id && (
                  <p className="text-sm text-red-500">
                    {errors.society_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Phase Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input id="name" placeholder="Enter phase name" {...field} />
                )}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Controller
                  name="sort_order"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="sort_order"
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  )}
                />
                {errors.sort_order && (
                  <p className="text-sm text-red-500">
                    {errors.sort_order.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col justify-center space-y-2">
                <div className="flex items-center space-x-3 pt-6">
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active Status
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex gap-3 p-6 bg-background border-t">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Save Changes" : "Add Calculator Phase"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
