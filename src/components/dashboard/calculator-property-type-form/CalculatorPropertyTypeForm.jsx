import { useEffect } from "react";
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
import { Loader2 } from "lucide-react";

const calculatorPropertyTypeFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  property_type: z.string().min(1, "Property type is required"),
  label: z.string().min(1, "Label is required"),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export default function CalculatorPropertyTypeForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorPropertyTypeFormSchema),
    defaultValues: {
      category: "",
      property_type: "",
      label: "",
      sort_order: 0,
      is_active: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category || "",
        property_type: initialData.property_type || "",
        label: initialData.label || "",
        sort_order: initialData.sort_order ?? 0,
        is_active: initialData.is_active === 1 || initialData.is_active === true,
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      sort_order: Number(data.sort_order ?? 0),
      is_active: data.is_active ? 1 : 0,
      id: initialData?.id,
    };
    onSuccess(finalData);
  };

  return (
    <div className="p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Calculator Property Type (Fixed Record)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Fixed)</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="category"
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                      {...field}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">Category cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type (Fixed)</Label>
                <Controller
                  name="property_type"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="property_type"
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                      {...field}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">Property type name cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">
                  Label <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="label"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="label"
                      placeholder="e.g. Plot"
                      {...field}
                    />
                  )}
                />
                {errors.label && (
                  <p className="text-sm text-red-500">{errors.label.message}</p>
                )}
              </div>
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
            Save Changes
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
