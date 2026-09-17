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

const calculatorTaxRateFormSchema = z.object({
  rate_key: z.string().min(1, "Tax key is required"),
  rate_name: z.string().min(1, "Tax name is required"),
  rate: z.coerce.number().min(0, "Rate must be non-negative"),
  rate_unit: z.string().default("percent"),
  is_active: z.boolean().default(true),
});

export default function CalculatorTaxRateForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const isEditing = !!initialData && !isDuplicating;

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorTaxRateFormSchema),
    defaultValues: {
      rate_key: "",
      rate_name: "",
      rate: 0,
      rate_unit: "percent",
      is_active: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        rate_key: initialData.rate_key || "",
        rate_name: initialData.rate_name || "",
        rate: initialData.rate !== undefined ? Number(initialData.rate) : 0,
        rate_unit: initialData.rate_unit || "percent",
        is_active: initialData.is_active === 1 || initialData.is_active === true,
      });
    } else {
      reset({
        rate_key: "",
        rate_name: "",
        rate: 0,
        rate_unit: "percent",
        is_active: true,
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      rate: Number(data.rate),
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
            <CardTitle>{isEditing ? "Edit Calculator Tax Rate Configuration" : "Add Calculator Tax Rate"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rate_key">
                  Tax Key <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="rate_key"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rate_key"
                      placeholder="e.g. custom_tax_rate"
                      disabled={isEditing}
                      className={isEditing ? "bg-muted text-muted-foreground cursor-not-allowed font-mono text-xs" : "font-mono text-xs"}
                      {...field}
                    />
                  )}
                />
                {errors.rate_key && (
                  <p className="text-sm text-red-500">{errors.rate_key.message}</p>
                )}
                {isEditing && <p className="text-xs text-muted-foreground">Tax key cannot be changed after creation.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_unit">Rate Unit</Label>
                <Controller
                  name="rate_unit"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rate_unit"
                      disabled
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                      {...field}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">Expressed as a percentage (%) (e.g. 1.25 = 1.25%).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="rate_name">
                  Tax Rate Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="rate_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rate_name"
                      placeholder="e.g. Purchaser 236K - Filer"
                      {...field}
                    />
                  )}
                />
                {errors.rate_name && (
                  <p className="text-sm text-red-500">{errors.rate_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">
                  Rate Percentage (%) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="rate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      placeholder="1.25"
                      {...field}
                    />
                  )}
                />
                {errors.rate && (
                  <p className="text-sm text-red-500">{errors.rate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">Enter e.g. 1.25 for 1.25% (do not store 125).</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4">
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
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex gap-3 p-6 bg-background border-t">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Add Calculator Tax Rate"}
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
