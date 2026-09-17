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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const calculatorFeeFormSchema = z.object({
  fee_key: z.string().min(1, "Fee key is required"),
  fee_name: z.string().min(1, "Fee name is required"),
  amount: z.coerce.number().min(0, "Amount must be non-negative"),
  charge_unit: z.string().min(1, "Charge unit is required"),
  is_active: z.boolean().default(true),
});

export default function CalculatorFeeForm({
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
    resolver: zodResolver(calculatorFeeFormSchema),
    defaultValues: {
      fee_key: "",
      fee_name: "",
      amount: 0,
      charge_unit: "transaction",
      is_active: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fee_key: initialData.fee_key || "",
        fee_name: initialData.fee_name || "",
        amount: initialData.amount !== undefined ? Number(initialData.amount) : 0,
        charge_unit: initialData.charge_unit || "transaction",
        is_active: initialData.is_active === 1 || initialData.is_active === true,
      });
    } else {
      reset({
        fee_key: "",
        fee_name: "",
        amount: 0,
        charge_unit: "transaction",
        is_active: true,
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      amount: Number(data.amount),
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
            <CardTitle>{isEditing ? "Edit Calculator Fee Configuration" : "Add Calculator Fee"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fee_key">
                  Fee Key <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fee_key"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fee_key"
                      placeholder="e.g. custom_fee"
                      disabled={isEditing}
                      className={isEditing ? "bg-muted text-muted-foreground cursor-not-allowed font-mono text-xs" : "font-mono text-xs"}
                      {...field}
                    />
                  )}
                />
                {errors.fee_key && (
                  <p className="text-sm text-red-500">{errors.fee_key.message}</p>
                )}
                {isEditing && <p className="text-xs text-muted-foreground">Fee key cannot be changed after creation.</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="charge_unit">
                  Charge Unit <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="charge_unit"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={isEditing}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="charge_unit" className={isEditing ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Select charge unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transaction">Transaction</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.charge_unit && (
                  <p className="text-sm text-red-500">{errors.charge_unit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fee_name">
                  Fee Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fee_name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fee_name"
                      placeholder="e.g. Biana"
                      {...field}
                    />
                  )}
                />
                {errors.fee_name && (
                  <p className="text-sm text-red-500">{errors.fee_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (PKR / Rs.) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  )}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
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
            {isEditing ? "Save Changes" : "Add Calculator Fee"}
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
