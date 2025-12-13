import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "../MediaUpload";
import { propertyFormSchema } from "./validation";
import { PlusIcon, XIcon, GripVertical } from "lucide-react";

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



// Child component for sortable labels
function SortableLabelItem({ id, name, badge_variant, is_badge, onRemove, onToggleIsBadge }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
    >
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 cursor-grab"
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Badge
          variant={badge_variant || "secondary"}
          className="flex-shrink-0"
        >
          {name}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Show as badge</Label>
          <Switch
            checked={is_badge !== false}
            onCheckedChange={onToggleIsBadge}
          />
        </div>
        <button
          type="button"
          className="text-red-600 hover:text-red-800"
          onClick={() => onRemove(id)}
          title="Remove label"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Child component for sortable features
function SortableFeatureItem({ id, value, onRemove, onUpdateValue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="flex-shrink-0 cursor-grab"
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </Button>
      <Input
        placeholder="Feature value/name"
        value={value}
        onChange={(e) => onUpdateValue(e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onRemove}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

const labelVariants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "sale",
  "rent",
  "featured",
  "new",
  "hot",
  "discounted",
];

export default function PropertyFileForm({ initialData, onSuccess, onCancel, isDuplicating }) {
  // State for dropdowns
  const [cities, setCities] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [phases, setPhases] = useState([]);
  const [labels, setLabels] = useState([]);
  const [thumbnailMedia, setThumbnailMedia] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      short_desc: "",
      address: "",
      property_type: "Residential",
      is_file: true,
      file_type: "Affidavit",
      purchase_type: "sale",
      beds: 0,
      baths: 0,
      area: 0,
      unit: "sqft",
      price_amount: "",
      is_discounted: false,
      price_original_amount: "",
      price_period_unit: "month",
      price_period_value: 1,
      discount_type: "percentage",
      discount_value: "",
      installment_advance_amount: "",
      installment_total_period_text: "",
      installment_amount: "",
      installment_display_mode: "installment",
      category_id: "",
      city_id: "",
      society_id: "",
      phase_id: "",
      labels: [],
      embed_link: "",
      hide: false,
      _new_label_variant: "secondary", // Initialize new label variant
      ...(initialData || {}),
      is_file: initialData?.is_file ?? true,
    },
  });

  // Watch form fields for conditional rendering
  const is_discounted = watch("is_discounted");
  const purchase_type = watch("purchase_type");
  const selectedLabelIds = watch("labels") || [];
  const selectedLabelValue = watch("_selected_label");
  const newLabelNameValue = watch("_new_label_name");

  // Fetch data on mount and initialize form with initialData
  useEffect(() => {
    // Mock data (replace with API calls)
    setCities([
      { id: 1, name: "Lahore" },
      { id: 2, name: "Islamabad" },
      { id: 3, name: "Karachi" },
    ]);
    setSocieties([
      { id: 1, name: "Gulberg" },
      { id: 2, name: "Bahria Town" },
      { id: 3, name: "DHA" },
    ]);
    setPhases([
      { id: 1, name: "Phase 1" },
      { id: 2, name: "Phase 2" },
      { id: 3, name: "Phase 3" },
    ]);
    setLabels([
      { id: "l1", name: "New", badge_variant: "destructive", is_badge: true },
      {
        id: "l2",
        name: "Featured",
        badge_variant: "secondary",
        is_badge: true,
      },
      { id: "l3", name: "Hot", badge_variant: "warning", is_badge: false },
    ]);

    if (initialData) {
      const formDataToSet = isDuplicating ? { ...initialData, id: undefined } : initialData;
      reset(formDataToSet);

      if (initialData.media) {
        setThumbnailMedia(initialData.media.filter(item => item.type === 'image' && item.isPrimary));
      } else {
        setThumbnailMedia([]);
      }
    } else {
      reset({
        title: "",
        short_desc: "",
        address: "",
        property_type: "Residential",
        is_file: true,
        file_type: "Affidavit",
        purchase_type: "sale",
        beds: 0,
        baths: 0,
        area: 0,
        unit: "sqft",
        price_amount: "",
        is_discounted: false,
        price_original_amount: "",
        price_period_unit: "month",
        price_period_value: 1,
        discount_type: "percentage",
        discount_value: "",
        installment_advance_amount: "",
        installment_total_period_text: "",
        installment_amount: "",
        installment_display_mode: "installment",
        category_id: "",
        city_id: "",
        society_id: "",
        phase_id: "",
        labels: [],
        embed_link: "",
        hide: false,
        _new_label_variant: "secondary",
      });
      setThumbnailMedia([]);
    }
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const combinedMedia = [...thumbnailMedia];
    const finalData = {
      ...data,
      media: combinedMedia,
      id: (isDuplicating || !initialData) ? undefined : initialData.id,
    };
    onSuccess(finalData);
  };


  // DnD sensors for Labels
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndLabels = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const currentSelectedLabelIds = selectedLabelIds;
      const oldIndex = currentSelectedLabelIds.findIndex(
        (id) => id === active.id
      );
      const newIndex = currentSelectedLabelIds.findIndex(
        (id) => id === over.id
      );
      const updated = arrayMove(currentSelectedLabelIds, oldIndex, newIndex);
      setValue("labels", updated);
    }
  };

  return (
    <div className="max-w-3xl p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>File Property Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Property Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter property title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_desc">Short Description</Label>
              <Textarea
                id="short_desc"
                placeholder="Brief overview of the property"
                className="min-h-[100px]"
                {...register("short_desc")}
              />
              {errors.short_desc && (
                <p className="text-sm text-red-500">
                  {errors.short_desc.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address of the property"
                className="min-h-[80px]"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Property Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="property_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.property_type && (
                <p className="text-sm text-red-500">
                  {errors.property_type.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_type">
                File Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="file_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Allocation">Allocation</SelectItem>
                      <SelectItem value="Affidavit">Affidavit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.file_type && (
                <p className="text-sm text-red-500">
                  {errors.file_type.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Purchase Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="purchase_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="installment">Installment</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.purchase_type && (
                <p className="text-sm text-red-500">
                  {errors.purchase_type.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("area")}
                />
                {errors.area && (
                  <p className="text-sm text-red-500">{errors.area.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqft">Square Feet</SelectItem>
                        <SelectItem value="marla">Marla</SelectItem>
                        <SelectItem value="kanal">Kanal</SelectItem>
                        <SelectItem value="hectare">Hectare</SelectItem>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="yard">Yard</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_amount">
                Price Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price_amount"
                type="number"
                min="0"
                placeholder="0"
                {...register("price_amount")}
              />
              {errors.price_amount && (
                <p className="text-sm text-red-500">
                  {errors.price_amount.message}
                </p>
              )}
            </div>
            {purchase_type === "installment" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_period_unit">Price Period Unit</Label>
                  <Controller
                    name="price_period_unit"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.price_period_unit && (
                    <p className="text-sm text-red-500">
                      {errors.price_period_unit.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_period_value">Price Period Value</Label>
                  <Input
                    id="price_period_value"
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register("price_period_value")}
                  />
                  {errors.price_period_value && (
                    <p className="text-sm text-red-500">
                      {errors.price_period_value.message}
                    </p>
                  )}
                </div>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="is_discounted">Apply Discount?</Label>
              <Controller
                name="is_discounted"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="is_discounted"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            {is_discounted && (
              <div className="pl-4 space-y-4 border-l-2 border-purple-300">
                <div className="space-y-2">
                  <Label htmlFor="price_original_amount">
                    Original Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price_original_amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("price_original_amount")}
                  />
                  {errors.price_original_amount && (
                    <p className="text-sm text-red-500">
                      {errors.price_original_amount.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Discount Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="discount_type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.discount_type && (
                    <p className="text-sm text-red-500">
                      {errors.discount_type.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...register("discount_value")}
                  />
                  {errors.discount_value && (
                    <p className="text-sm text-red-500">
                      {errors.discount_value.message}
                    </p>
                  )}
                </div>
              </div>
            )}
            {purchase_type === "installment" && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-green-700">
                    Installment Details
                  </CardTitle>
                  <CardDescription>
                    Configure installment payment terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="installment_amount">
                      Installment Amount <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="installment_amount"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("installment_amount")}
                    />
                    {errors.installment_amount && (
                      <p className="text-sm text-red-500">
                        {errors.installment_amount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installment_total_period_text">
                      Total Period <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="installment_total_period_text"
                      placeholder="e.g., 3 years, 36 months"
                      {...register("installment_total_period_text")}
                    />
                    {errors.installment_total_period_text && (
                      <p className="text-sm text-red-500">
                        {errors.installment_total_period_text.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installment_advance_amount">
                      Advance Amount
                    </Label>
                    <Input
                      id="installment_advance_amount"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("installment_advance_amount")}
                    />
                    {errors.installment_advance_amount && (
                      <p className="text-sm text-red-500">
                        {errors.installment_advance_amount.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Display Mode</Label>
                    <Controller
                      name="installment_display_mode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="advance">
                              Show Advance Amount
                            </SelectItem>
                            <SelectItem value="installment">
                              Show Installment Amount
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.installment_display_mode && (
                      <p className="text-sm text-red-500">
                        {errors.installment_display_mode.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city_id">City</Label>
                <Controller
                  name="city_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="society_id">Society</Label>
                <Controller
                  name="society_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a society" />
                      </SelectTrigger>
                      <SelectContent>
                        {societies.map((soc) => (
                          <SelectItem key={soc.id} value={soc.id.toString()}>
                            {soc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phase_id">Phase</Label>
                <Controller
                  name="phase_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((phase) => (
                          <SelectItem
                            key={phase.id}
                            value={phase.id.toString()}
                          >
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <MediaUpload
                initialMedia={thumbnailMedia}
                onMediaChange={setThumbnailMedia}
                maxFiles={1}
                maxFileSizeMb={5}
                allowMultiple={false}
                allowedTypes={["image/*"]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed_link">Embed Link</Label>
              <Textarea
                id="embed_link"
                placeholder="https://..."
                {...register("embed_link")}
                className="min-h-[80px]"
              />
              {errors.embed_link && (
                <p className="text-sm text-red-500">
                  {errors.embed_link.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Paste a YouTube, Google Maps, or other embed URL
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <Label>Labels/Tags</Label>

              {/* Applied labels with badge toggle */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEndLabels}
              >
                <SortableContext
                  items={Array.isArray(selectedLabelIds) ? selectedLabelIds : []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="mt-2 space-y-2">
                    {(Array.isArray(selectedLabelIds)
                      ? selectedLabelIds
                      : []
                    )
                      .map((id) => labels.find((l) => l.id === id))
                      .filter(Boolean)
                      .map((lab) => (
                        <SortableLabelItem
                          key={lab.id}
                          id={lab.id}
                          name={lab.name}
                          badge_variant={lab.badge_variant}
                          is_badge={lab.is_badge}
                          onRemove={() => {
                            const updated = selectedLabelIds.filter(
                              (v) => v !== lab.id
                            );
                            setValue("labels", updated);
                          }}
                          onToggleIsBadge={(checked) => {
                            const updatedLabels = labels.map((l) =>
                              l.id === lab.id
                                ? { ...l, is_badge: checked }
                                : l
                            );
                            setLabels(updatedLabels);
                          }}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex flex-col gap-2 mt-3 sm:flex-row">
                <Select
                  onValueChange={(value) =>
                    setValue("_selected_label", value)
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select an existing label" />
                  </SelectTrigger>
                  <SelectContent>
                    {labels.map((label) => (
                      <SelectItem
                        key={label.id}
                        value={label.id.toString()}
                      >
                        {label.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const sel = control._formValues?._selected_label;
                    if (!sel) return;
                    if (!selectedLabelIds.includes(sel)) {
                      const updated = [...selectedLabelIds, sel];
                      setValue("labels", updated);
                    }
                  }}
                >
                  Add Label
                </Button>
              </div>

              <div className="flex flex-col gap-2 mt-2 sm:flex-row">
                <Input
                  placeholder="New label name"
                  onChange={(e) =>
                    setValue("_new_label_name", e.target.value)
                  }
                  className="flex-1"
                />
                <Select
                  onValueChange={(value) =>
                    setValue("_new_label_variant", value)
                  }
                  defaultValue={control._formValues?._new_label_variant || "secondary"}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {labelVariants.map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    const name = control._formValues?._new_label_name?.trim();
                    const variant = control._formValues?._new_label_variant;
                    if (!name) return;
                    // create a new label with badge enabled by default
                    const newLabel = {
                      id: Date.now().toString(), // Use string ID
                      name,
                      badge_variant: variant || "secondary",
                      is_badge: true,
                    };
                    setLabels((s) => [...s, newLabel]);
                    setValue("labels", [...selectedLabelIds, newLabel.id]);
                    // clear input
                    setValue("_new_label_name", "");
                  }}
                >
                  Create & Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="hide">Hide from public</Label>
              <Controller
                name="hide"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="hide"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t">
          <Button type="submit" size="lg">
            Save Property File
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
