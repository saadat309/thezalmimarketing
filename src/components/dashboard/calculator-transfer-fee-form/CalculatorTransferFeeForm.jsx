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

const SPORTS_FUND = 10500;
const SQFT_PER_MARLA = 225;

const calculatorTransferFeeFormSchema = z.object({
  calculator_phase_id: z.string().min(1, "Calculator phase is required"),
  calculator_block_id: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  reference_size: z.coerce.number().min(0.0001, "Reference size must be greater than 0"),
  reference_unit: z.string().min(1, "Reference unit is required"),
  reference_amount: z.coerce.number().gt(SPORTS_FUND, "Reference transfer fee must be greater than Rs. 10,500 (Sports Fund)"),
  is_active: z.boolean().default(true),
});

export default function CalculatorTransferFeeForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const [calculatorPhases, setCalculatorPhases] = useState([]);
  const [calculatorBlocks, setCalculatorBlocks] = useState([]);
  const [categories, setCategories] = useState(["Residential", "Commercial", "Sector Shop"]);

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
    resolver: zodResolver(calculatorTransferFeeFormSchema),
    defaultValues: {
      calculator_phase_id: "",
      calculator_block_id: "",
      category: "Residential",
      reference_size: 5,
      reference_unit: "marla",
      reference_amount: "",
      is_active: true,
      ...(initialData || {}),
    },
  });

  const selectedPhaseId = watch("calculator_phase_id");
  const watchedReferenceSize = watch("reference_size");
  const watchedReferenceUnit = watch("reference_unit");
  const watchedReferenceAmount = watch("reference_amount");

  const derivedValues = useMemo(() => {
    const refAmount = Number(watchedReferenceAmount) || 0;
    const refSize = Number(watchedReferenceSize) || 0;
    const unit = String(watchedReferenceUnit || "marla").toLowerCase();

    const baseFee = Math.max(0, refAmount - SPORTS_FUND);
    let refMarla = 0;
    let refSqft = 0;

    if (unit === "sqft") {
      refSqft = refSize;
      refMarla = refSize > 0 ? refSize / SQFT_PER_MARLA : 0;
    } else {
      refMarla = refSize;
      refSqft = refSize * SQFT_PER_MARLA;
    }

    const perMarlaRate = refMarla > 0 ? baseFee / refMarla : 0;
    const perSqftRate = refSqft > 0 ? baseFee / refSqft : 0;

    return {
      baseTransferFee: baseFee,
      referenceMarla: refMarla,
      referenceSqft: refSqft,
      perMarlaRate: perMarlaRate,
      perSqftRate: perSqftRate,
    };
  }, [watchedReferenceAmount, watchedReferenceSize, watchedReferenceUnit]);

  const filteredBlockOptions = useMemo(() => {
    if (!selectedPhaseId) return [];
    return calculatorBlocks
      .filter((cb) => String(cb.calculator_phase_id) === String(selectedPhaseId))
      .map((cb) => ({
        value: String(cb.id),
        label: cb.name,
      }));
  }, [calculatorBlocks, selectedPhaseId]);

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: cat, label: cat })),
    [categories]
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

        const uniqueCats = Array.from(new Set(propTypesData.map((pt) => pt.category).filter(Boolean)));
        if (uniqueCats.length > 0) {
          setCategories(uniqueCats);
        }

        if (initialData) {
          reset({
            calculator_phase_id: initialData.calculator_phase_id ? String(initialData.calculator_phase_id) : "",
            calculator_block_id: initialData.calculator_block_id ? String(initialData.calculator_block_id) : "",
            category: initialData.category || "Residential",
            reference_size: initialData.reference_size ?? 5,
            reference_unit: initialData.reference_unit || "marla",
            reference_amount: initialData.reference_amount ?? "",
            is_active: initialData.is_active === 1 || initialData.is_active === true,
            ...(isDuplicating ? { id: undefined } : {}),
          });
        } else {
          reset({
            calculator_phase_id: "",
            calculator_block_id: "",
            category: "Residential",
            reference_size: 5,
            reference_unit: "marla",
            reference_amount: "",
            is_active: true,
          });
        }
      } catch (error) {
        console.error("Failed to load transfer fee form dependencies:", error);
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
      reference_size: Number(data.reference_size),
      reference_amount: Number(data.reference_amount),
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
            <CardTitle>Calculator Transfer Fee Configuration</CardTitle>
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
                Calculator Block (Optional - leave empty for phase-level fee)
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
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={categoryOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select category"
                  />
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reference_size">
                  Reference Size <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="reference_size"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="reference_size"
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      {...field}
                    />
                  )}
                />
                {errors.reference_size && (
                  <p className="text-sm text-red-500">{errors.reference_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_unit">
                  Reference Unit <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="reference_unit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marla">Marla</SelectItem>
                        <SelectItem value="sqft">Sq. Ft.</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.reference_unit && (
                  <p className="text-sm text-red-500">{errors.reference_unit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_amount">
                  Reference Transfer Fee (Rs.) <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="reference_amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="reference_amount"
                      type="number"
                      step="any"
                      placeholder="e.g. 110500"
                      {...field}
                    />
                  )}
                />
                <p className="text-xs text-muted-foreground">Must be &gt; Rs. 10,500 (includes Rs. 10,500 Sports Fund)</p>
                {errors.reference_amount && (
                  <p className="text-sm text-red-500">{errors.reference_amount.message}</p>
                )}
              </div>
            </div>

            {/* Derived Calculations Live Preview */}
            <div className="p-4 bg-muted/40 rounded-lg border space-y-3">
              <h4 className="font-semibold text-sm text-foreground">Derived Calculation Preview (Sports Fund = Rs. 10,500)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Base Transfer Fee</span>
                  <span className="font-medium">Rs. {derivedValues.baseTransferFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Per Marla Rate</span>
                  <span className="font-medium">Rs. {derivedValues.perMarlaRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Marla</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Reference Sq.Ft.</span>
                  <span className="font-medium">{derivedValues.referenceSqft.toLocaleString()} Sq.Ft.</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Per Sq.Ft. Rate</span>
                  <span className="font-medium">Rs. {derivedValues.perSqftRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / Sq.Ft.</span>
                </div>
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
            {initialData ? "Save Changes" : "Add Calculator Transfer Fee"}
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
