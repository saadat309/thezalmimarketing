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
import { LabelSelector } from "../LabelSelector";
import { propertyFormSchema } from "./validation";
import { PlusIcon, XIcon, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { useAuthStore } from "@/store/authStore";


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
            checked={!!is_badge}
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

export default function PropertyFileForm({ initialData, onSuccess, onCancel, isDuplicating, editingItemFullDetails, isSubmitting }) {
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
      is_file: true, // Always true for this form
    },
  });

  // Watch form fields for conditional rendering
  const is_discounted = watch("is_discounted");
  const purchase_type = watch("purchase_type");
  const selectedLabelIds = watch("labels") || [];
  const selectedLabelValue = watch("_selected_label");
  const newLabelNameValue = watch("name"); // Should be _new_label_name, will fix later
  const {token} = useAuthStore();
  // Effect to load dropdown data (runs once on mount)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [citiesRes, societiesRes, phasesRes, labelsRes] = await Promise.all([
          fetch('/api/cities'),
          fetch('/api/societies'),
          fetch('/api/phases'),
          fetch('/api/labels'),
        ]);

        const [citiesData, societiesData, phasesData, labelsData] = await Promise.all([
          citiesRes.json(),
          societiesRes.json(),
          phasesRes.json(),
          labelsRes.json(),
        ]);

        setCities(citiesData.map(d => ({ ...d, id: String(d.id) })));
        setSocieties(societiesData.map(d => ({ ...d, id: String(d.id) })));
        setPhases(phasesData.map(d => ({ ...d, id: String(d.id) })));
        setLabels(labelsData.map(d => ({
          ...d,
          id: String(d.id),
          is_badge: !!d.is_badge // Convert 0/1 to boolean
        })));
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("Failed to load form dependencies."); // Display toast notification
      }
    };
    fetchDropdownData();
  }, []); 

  // Effect to populate form when initialData or editingItemFullDetails changes
  useEffect(() => {


    // Prioritize editingItemFullDetails if available, otherwise use initialData
    // If we're duplicating, always use initialData/editingItemFullDetails but clear the ID
    const dataToPopulate = editingItemFullDetails || initialData;

    if (dataToPopulate) {
      const sourceData = isDuplicating ? { ...dataToPopulate, id: undefined } : { ...dataToPopulate };
      


      // Explicitly convert boolean-like fields from numbers (0 or 1) to actual booleans (true or false)
      sourceData.is_file = true; // Always true for files form
      sourceData.is_furnished = !!sourceData.is_furnished;
      sourceData.is_discounted = !!sourceData.is_discounted;
      sourceData.hide = !!sourceData.hide;

      // Null safety for select fields
      if (!sourceData.discount_type) sourceData.discount_type = 'percentage';
      if (!sourceData.installment_display_mode) sourceData.installment_display_mode = 'installment';
      
      // Null safety for string fields to prevent Zod "expected string, received null" errors
      if (sourceData.short_desc === null) sourceData.short_desc = "";
      if (sourceData.address === null) sourceData.address = "";
      if (sourceData.embed_link === null) sourceData.embed_link = "";
      // features and detailed_description_content might not be in file form but good to safe guard
      if (sourceData.features === null) sourceData.features = ""; 
      if (sourceData.detailed_description_content === null) sourceData.detailed_description_content = "";

      // Ensure IDs for related fields are strings
      if (sourceData.category_id) sourceData.category_id = String(sourceData.category_id);
      if (sourceData.city_id) sourceData.city_id = String(sourceData.city_id);
      if (sourceData.society_id) sourceData.society_id = String(sourceData.society_id);
      if (sourceData.phase_id) sourceData.phase_id = String(sourceData.phase_id);

      // Handle labels: map to an array of just IDs
      if (sourceData.labels && Array.isArray(sourceData.labels)) {
        const incomingLabels = sourceData.labels.map(l => ({
          id: l.label_id.toString(),
          name: l.name,
          badge_variant: l.badge_variant,
          is_badge: !!l.is_badge,
        }));
        setLabels(currentLabels => {
          const newLabels = incomingLabels.filter(
            il => !currentLabels.some(cl => String(cl.id) === il.id)
          );
          return [...currentLabels, ...newLabels];
        });
        sourceData.labels = sourceData.labels.map(l => l.label_id.toString());
      } else {
        sourceData.labels = [];
      }

      // Initialize thumbnail media state
      if (sourceData.media) {
        setThumbnailMedia(sourceData.media.thumbnail_image ? [{
          id: isDuplicating ? undefined : sourceData.media.thumbnail_image.id,
          url: sourceData.media.thumbnail_image.path,
          thumb_path: sourceData.media.thumbnail_image.thumb_path,
          type: 'image',
          file: null,
        }] : []);
      } else {
        setThumbnailMedia([]);
      }


      reset(sourceData); // Reset form with the processed sourceData

    } else {
      // Reset to default for new forms (or when no initialData/editingItemFullDetails)
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
        is_furnished: false,
      });
      setThumbnailMedia([]);
    }
  }, [initialData, editingItemFullDetails, isDuplicating, reset, setLabels]);

  // Handler for toggling is_badge for an existing label
  const handleToggleIsBadge = useCallback(async (labelId, checked) => {
    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_badge: checked ? 1 : 0 }), // PHP expects 0/1
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error! status: ${response.status}`);
      }

      // Update local state only on successful API call
      setLabels((currentLabels) =>
        currentLabels.map((l) =>
          String(l.id) === String(labelId) ? { ...l, is_badge: checked } : l
        )
      );
      toast.success("Label badge status updated!");

    } catch (error) {
      console.error("Failed to update label badge status:", error);
      toast.error("Failed to update label badge status: " + error.message);
    }
  }, [token]);

  const currentSelectedLabels = useMemo(() => {
    return selectedLabelIds
      .map((id) => labels.find((l) => String(l.id) === String(id)))
      .filter(Boolean);
  }, [selectedLabelIds, labels]);

  const onSubmit = (data) => {
    // No gallery or video media to track for removal for files form
    
    // The API expects 'existing_labels' arrays
    const existing_labels = data.labels;

    // Filter out internal form state variables that start with '_'
    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (!key.startsWith('_')) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    const finalData = {
      ...filteredData,
      existing_labels,
      thumbnailMedia,
      // No galleryMedia, videoMedia, videoInputMethod, videoEmbedLinkForMedia, removedGalleryImageIds for files form
      id: isDuplicating || !initialData ? undefined : initialData.id,
    };
    onSuccess(finalData);
  };

  const onError = (errors) => {
    console.error("Form errors:", errors);
    toast.error("Form validation failed. Please check the fields.");
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
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Thumbnail</CardTitle>
            <CardDescription>
              Main image for the property file card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUpload
              initialMedia={thumbnailMedia}
              onMediaChange={setThumbnailMedia}
              maxFiles={1}
              maxFileSizeMb={5}
              allowMultiple={false}
              allowedTypes={["image/*"]}
            />
          </CardContent>
        </Card>
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
                Price Amount
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
                      Installment Amount
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
                      Total Period
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
                    <Select
                      key={field.value + '-' + (cities.length > 0)}
                      value={field.value ? String(field.value) : "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "0" ? null : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
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
                    <Select
                      key={field.value + '-' + (societies.length > 0)}
                      value={field.value ? String(field.value) : "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "0" ? null : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a society" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
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
                    <Select
                      key={field.value + '-' + (phases.length > 0)}
                      value={field.value ? String(field.value) : "0"}
                      onValueChange={(value) => {
                        field.onChange(value === "0" ? null : value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
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
                    {currentSelectedLabels
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
                          onToggleIsBadge={(checked) => handleToggleIsBadge(lab.id, checked)} // Use the new handler
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="flex flex-col gap-2 mt-3">
                <LabelSelector
                  availableLabels={labels}
                  selectedLabelIds={selectedLabelIds}
                  onSelect={(id) => {
                    const stringId = String(id);
                    if (!selectedLabelIds.includes(stringId)) {
                      setValue("labels", [...selectedLabelIds, stringId]);
                    }
                  }}
                  onLabelDeleted={(id) => {
                    const stringId = String(id);
                    setLabels(prev => prev.filter(l => String(l.id) !== stringId));
                    setValue("labels", selectedLabelIds.filter(lid => lid !== stringId));
                  }}
                />
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
                  defaultValue={getValues("_new_label_variant") || "secondary"}
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
                  onClick={async () => { // Made async to handle API call
                    const name = getValues("_new_label_name")?.trim();
                    const variant = getValues("_new_label_variant");
                    if (!name) return;

                    try {
                        const response = await fetch("/api/labels", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: name,
                            is_badge: true, // New labels are badges by default
                            is_filter: true, // New labels are filters by default
                            badge_variant: variant || "secondary",
                          }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.detail || `API error! status: ${response.status}`);
                        }

                        const newLabelFromApi = await response.json();
                        
                        // Format the new label consistently (string ID, boolean flags)
                        const formattedLabel = {
                          ...newLabelFromApi,
                          id: String(newLabelFromApi.id),
                          is_badge: !!newLabelFromApi.is_badge,
                          is_filter: !!newLabelFromApi.is_filter,
                        };

                        // Add the newly created label to the local state
                        setLabels((s) => [...s, formattedLabel]);
                        
                        // Add the new label's actual ID to the form's selected labels
                        const updatedSelectedLabels = [...selectedLabelIds, formattedLabel.id];
                        setValue("labels", updatedSelectedLabels);
                        
                        // Clear the input field for new label name
                        setValue("_new_label_name", "");
                        toast.success("New label created and added!");

                    } catch (error) {
                        console.error("Failed to create new label:", error);
                        toast.error("Failed to create new label: " + error.message);
                    }
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
        <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-background">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Save Property File" : "Add Property File"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
