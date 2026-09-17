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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { toast } from "sonner";

const calculatorFeeRuleFormSchema = z.object({
  fee_id: z.coerce.number().min(1, "Fee is required"),
  property_type: z.enum(["Residential", "Commercial"], { message: "Property type must be Residential or Commercial" }),
  unit: z.enum(["marla", "kanal"], { message: "Unit must be marla or kanal" }),
  min_area: z.coerce.number().min(0, "Minimum area cannot be negative"),
  max_area: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().min(0, "Maximum area cannot be negative").nullable()
  ),
  fee_amount: z.coerce.number().min(0, "Fee amount cannot be negative"),
  is_active: z.boolean().default(true),
}).refine((data) => {
  if (data.max_area !== null && data.max_area <= data.min_area) {
    return false;
  }
  return true;
}, {
  message: "Maximum area must be greater than minimum area",
  path: ["max_area"],
});

export default function CalculatorFeeRuleForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const isEditing = !!initialData && !isDuplicating;
  const [fees, setFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(true);

  useEffect(() => {
    async function fetchFees() {
      try {
        const res = await apiFetch("/calculator-fees");
        if (res.ok) {
          const data = await res.json();
          setFees(data);
        }
      } catch {
        toast.error("Failed to load calculator fees");
      } finally {
        setLoadingFees(false);
      }
    }
    fetchFees();
  }, []);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorFeeRuleFormSchema),
    defaultValues: {
      fee_id: "",
      property_type: "Residential",
      unit: "marla",
      min_area: 0,
      max_area: "",
      fee_amount: 0,
      is_active: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fee_id: initialData.fee_id || "",
        property_type: initialData.property_type || "Residential",
        unit: initialData.unit || "marla",
        min_area: initialData.min_area !== undefined ? Number(initialData.min_area) : 0,
        max_area: initialData.max_area !== undefined && initialData.max_area !== null ? Number(initialData.max_area) : "",
        fee_amount: initialData.fee_amount !== undefined ? Number(initialData.fee_amount) : 0,
        is_active: initialData.is_active === 1 || initialData.is_active === true,
      });
    } else {
      reset({
        fee_id: "",
        property_type: "Residential",
        unit: "marla",
        min_area: 0,
        max_area: "",
        fee_amount: 0,
        is_active: true,
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      fee_id: Number(data.fee_id),
      min_area: Number(data.min_area),
      max_area: data.max_area !== "" && data.max_area !== null && data.max_area !== undefined ? Number(data.max_area) : null,
      fee_amount: Number(data.fee_amount),
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
            <CardTitle>{isEditing ? "Edit Calculator Fee Rule" : "Add Calculator Fee Rule"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fee_id">
                  Fee <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fee_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger id="fee_id">
                        <SelectValue placeholder={loadingFees ? "Loading fees..." : "Select fee"} />
                      </SelectTrigger>
                      <SelectContent>
                        {fees.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>
                            {f.fee_name} ({f.fee_key})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fee_id && (
                  <p className="text-sm text-red-500">{errors.fee_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="property_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="property_type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.property_type && (
                  <p className="text-sm text-red-500">{errors.property_type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Unit <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marla">Marla</SelectItem>
                        <SelectItem value="kanal">Kanal</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_area">
                  Minimum Area <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="min_area"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="min_area"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      {...field}
                    />
                  )}
                />
                {errors.min_area && (
                  <p className="text-sm text-red-500">{errors.min_area.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_area">Maximum Area (Optional / Unlimited if empty)</Label>
                <Controller
                  name="max_area"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="max_area"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 10 or leave empty"
                      value={field.value !== null && field.value !== undefined ? field.value : ""}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.max_area && (
                  <p className="text-sm text-red-500">{errors.max_area.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fee_amount">
                  Fee Amount (PKR / Rs.) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fee_amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fee_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  )}
                />
                {errors.fee_amount && (
                  <p className="text-sm text-red-500">{errors.fee_amount.message}</p>
                )}
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
            {isEditing ? "Save Changes" : "Add Fee Rule"}
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
