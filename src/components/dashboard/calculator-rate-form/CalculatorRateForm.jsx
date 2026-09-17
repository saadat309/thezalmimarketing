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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SearchableSelect } from "../SearchableSelect";
import { apiFetch } from "@/lib/apiClient";

const calculatorRateFormSchema = z.object({
  calculator_phase_id: z.string().min(1, "Calculator phase is required"),
  calculator_block_id: z.string().optional(),
  calculator_property_type_id: z.string().min(1, "Property type is required"),
  unit: z.string().min(1, "Unit is required"),
  dc_rate: z.coerce.number().min(0, "DC rate must be valid number"),
  fbr_rate: z.coerce.number().min(0, "FBR rate must be valid number"),
  is_active: z.boolean().default(true),
});

export default function CalculatorRateForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const [calculatorPhases, setCalculatorPhases] = useState([]);
  const [calculatorBlocks, setCalculatorBlocks] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);

  const calculatorPhaseOptions = useMemo(
    () =>
      calculatorPhases.map((cp) => ({
        value: String(cp.id),
        label: `${cp.city_name} > ${cp.society_name} > ${cp.name}`,
      })),
    [calculatorPhases]
  );

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(calculatorRateFormSchema),
    defaultValues: {
      calculator_phase_id: "",
      calculator_block_id: "",
      calculator_property_type_id: "",
      unit: "marla",
      dc_rate: "",
      fbr_rate: "",
      is_active: true,
      ...(initialData || {}),
    },
  });

  const selectedPhaseId = watch("calculator_phase_id");

  const filteredBlockOptions = useMemo(() => {
    if (!selectedPhaseId) return [];
    return calculatorBlocks
      .filter((cb) => String(cb.calculator_phase_id) === String(selectedPhaseId))
      .map((cb) => ({
        value: String(cb.id),
        label: cb.name,
      }));
  }, [calculatorBlocks, selectedPhaseId]);

  const propertyTypeOptions = useMemo(
    () =>
      propertyTypes.map((pt) => ({
        value: String(pt.id),
        label: `${pt.category} - ${pt.label || pt.property_type}`,
      })),
    [propertyTypes]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phasesRes, blocksRes, propTypesRes] = await Promise.all([
          apiFetch("/calculator-phases"),
          apiFetch("/calculator-blocks"),
          apiFetch("/calculator-property-types"),
        ]);

        if (!phasesRes.ok) throw new Error("Failed to fetch calculator phases");
        if (!blocksRes.ok) throw new Error("Failed to fetch calculator blocks");
        if (!propTypesRes.ok) throw new Error("Failed to fetch calculator property types");

        const phasesData = await phasesRes.json();
        const blocksData = await blocksRes.json();
        const propTypesData = await propTypesRes.json();

        setCalculatorPhases(phasesData);
        setCalculatorBlocks(blocksData);
        setPropertyTypes(propTypesData);

        if (initialData) {
          reset({
            calculator_phase_id: initialData.calculator_phase_id ? String(initialData.calculator_phase_id) : "",
            calculator_block_id: initialData.calculator_block_id ? String(initialData.calculator_block_id) : "",
            calculator_property_type_id: initialData.calculator_property_type_id ? String(initialData.calculator_property_type_id) : "",
            unit: initialData.unit || "marla",
            dc_rate: initialData.dc_rate ?? "",
            fbr_rate: initialData.fbr_rate ?? "",
            is_active: initialData.is_active === 1 || initialData.is_active === true,
            ...(isDuplicating ? { id: undefined } : {}),
          });
        } else {
          reset({
            calculator_phase_id: "",
            calculator_block_id: "",
            calculator_property_type_id: "",
            unit: "marla",
            dc_rate: "",
            fbr_rate: "",
            is_active: true,
          });
        }
      } catch (error) {
        console.error("Failed to load rate form dependencies:", error);
        toast.error("Failed to load form data: " + error.message);
      }
    };

    fetchData();
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      calculator_phase_id: Number(data.calculator_phase_id),
      calculator_block_id: data.calculator_block_id ? Number(data.calculator_block_id) : null,
      calculator_property_type_id: Number(data.calculator_property_type_id),
      dc_rate: Number(data.dc_rate),
      fbr_rate: Number(data.fbr_rate),
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
            <CardTitle>Calculator Rate Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="calculator_phase_id">
                Calculator Phase <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="calculator_phase_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={calculatorPhaseOptions}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("calculator_block_id", "");
                    }}
                    placeholder="Select calculator phase (City > Society > Phase)"
                  />
                )}
              />
              {errors.calculator_phase_id && (
                <p className="text-sm text-red-500">
                  {errors.calculator_phase_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculator_block_id">
                Calculator Block (Optional - leave empty for phase-level rate)
              </Label>
              <Controller
                name="calculator_block_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={filteredBlockOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={selectedPhaseId ? "Select block (optional)" : "Select phase first"}
                  />
                )}
              />
              {errors.calculator_block_id && (
                <p className="text-sm text-red-500">
                  {errors.calculator_block_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calculator_property_type_id">
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="calculator_property_type_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={propertyTypeOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select property type"
                  />
                )}
              />
              {errors.calculator_property_type_id && (
                <p className="text-sm text-red-500">
                  {errors.calculator_property_type_id.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Rate Unit <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marla">Per Marla</SelectItem>
                        <SelectItem value="sqft">Per Sq. Ft.</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dc_rate">
                  DC Rate (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="dc_rate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="dc_rate"
                      type="number"
                      step="any"
                      placeholder="e.g. 500000"
                      {...field}
                    />
                  )}
                />
                {errors.dc_rate && (
                  <p className="text-sm text-red-500">{errors.dc_rate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fbr_rate">
                  FBR Rate (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="fbr_rate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="fbr_rate"
                      type="number"
                      step="any"
                      placeholder="e.g. 450000"
                      {...field}
                    />
                  )}
                />
                {errors.fbr_rate && (
                  <p className="text-sm text-red-500">{errors.fbr_rate.message}</p>
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
            {initialData ? "Save Changes" : "Add Calculator Rate"}
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
