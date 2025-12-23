import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuillRichText from "../QuillRichText";
import { MediaUpload } from "../MediaUpload";
import { LabelSelector } from "../LabelSelector";
import { propertyFormSchema } from "./validation";
import { PlusIcon, XIcon, TrashIcon, GripVertical, Loader2 } from "lucide-react";
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
import { getYoutubeEmbedUrl } from "@/lib/utils";
import { toast } from "sonner"; // Import toast for notifications
import { useAuthStore } from "@/store/authStore";
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

export default function PropertyForm({ initialData, onSuccess, onCancel, isDuplicating, isSubmitting }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [cities, setCities] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [phases, setPhases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);
  const [propertiesOptions, setPropertiesOptions] = useState([]);

  const [galleryMedia, setGalleryMedia] = useState([]);
  const [thumbnailMedia, setThumbnailMedia] = useState([]);
  const [videoMedia, setVideoMedia] = useState([]);
  const [videoEmbedLinkForMedia, setVideoEmbedLinkForMedia] = useState('');
  const [videoInputMethod, setVideoInputMethod] = useState('upload');

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
      is_file: false,
      file_type: "Affidavit",
      purchase_type: "sale",
      is_furnished: true,
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
      vat_amount: "0",
      category_id: "",
      city_id: "",
      society_id: "",
      phase_id: "",
      related_products: [],
      labels: [],
      embed_link: "",
      hide: false,
      template: "default",
      _new_label_variant: "secondary",
      _selected_property: "",
      _selected_label: "",
      _new_label_name: "",
      features: "",
      detailed_description_content: "",
      ...(initialData || {}),
      is_file: initialData?.is_file ?? false,
      is_furnished: initialData?.is_furnished ?? true,
      template: initialData?.template ?? 'default',
      vat_amount: initialData?.vat_amount ?? '0',
      purchase_type: initialData?.purchase_type ?? 'sale',
      property_type: initialData?.property_type ?? 'Residential',
    },
  });

  // Watch form fields for conditional rendering
  const is_file = watch("is_file");
  const is_discounted = watch("is_discounted");
  const purchase_type = watch("purchase_type");

  // Fetch data on mount and initialize form with initialData
  useEffect(() => {
    console.error("PropertyForm initialData.id:", initialData?.id); // Debugging line
    const fetchData = async () => {
      try {
        const promises = [
          fetch('/api/categories'),
          fetch('/api/cities'),
          fetch('/api/societies'),
          fetch('/api/phases'),
          fetch('/api/labels'),
          fetch('/api/properties')
        ];

        // If editing or duplicating, fetch full property details to get media and other deep data not present in list view
        if (initialData?.id) {
            promises.push(fetch(`/api/properties/${initialData.id}`));
        }

        const responses = await Promise.all(promises);

        const categoriesData = responses[0].ok ? await responses[0].json() : [];
        const citiesData = responses[1].ok ? await responses[1].json() : [];
        const societiesData = responses[2].ok ? await responses[2].json() : [];
        const phasesData = responses[3].ok ? await responses[3].json() : [];
        const labelsData = responses[4].ok ? await responses[4].json() : [];
        const propertiesData = responses[5].ok ? await responses[5].json() : [];
        
        let fullPropertyData = null;
        if (initialData?.id && responses[6] && responses[6].ok) {
            fullPropertyData = await responses[6].json();
        }

        setCategories(categoriesData.map(d => ({ ...d, id: String(d.id) })));
        setCities(citiesData.map(d => ({ ...d, id: String(d.id) })));
        setSocieties(societiesData.map(d => ({ ...d, id: String(d.id) })));
        setPhases(phasesData.map(d => ({ ...d, id: String(d.id) })));
        setLabels(labelsData.map(d => ({
          ...d,
          id: String(d.id),
          is_badge: !!d.is_badge // Convert 0/1 to boolean
        })));
        setPropertiesOptions(propertiesData.map(p => ({ id: String(p.id), name: p.title })));

        // Initialize form after data is loaded
        if (initialData) {
          // Use full property data if available (for editing), otherwise use initialData (for duplicating or if fetch failed)
          const sourceData = fullPropertyData || initialData;
          
          

          // Use reset to populate form, and handle ID for duplication
          const formDataToSet = isDuplicating ? { ...sourceData, id: undefined } : { ...sourceData };

          // Explicitly convert boolean-like fields from numbers (0 or 1) to actual booleans (true or false)
          formDataToSet.is_file = !!formDataToSet.is_file;
          formDataToSet.is_furnished = !!formDataToSet.is_furnished;
          formDataToSet.is_discounted = !!formDataToSet.is_discounted;
          formDataToSet.hide = !!formDataToSet.hide;

          // Null safety for string fields to prevent Zod "expected string, received null" errors
          if (formDataToSet.short_desc === null) formDataToSet.short_desc = "";
          if (formDataToSet.address === null) formDataToSet.address = "";
          if (formDataToSet.embed_link === null) formDataToSet.embed_link = "";
          if (formDataToSet.features === null) formDataToSet.features = "";
          if (formDataToSet.detailed_description_content === null) formDataToSet.detailed_description_content = "";
          if (formDataToSet.installment_total_period_text === null) formDataToSet.installment_total_period_text = "";

          // Ensure IDs for related fields are strings
          if (formDataToSet.category_id) formDataToSet.category_id = String(formDataToSet.category_id);
          if (formDataToSet.city_id) formDataToSet.city_id = String(formDataToSet.city_id);
          if (formDataToSet.society_id) formDataToSet.society_id = String(formDataToSet.society_id);
          if (formDataToSet.phase_id) formDataToSet.phase_id = String(formDataToSet.phase_id);

          // Handle features: convert array of objects to comma-separated string
          if (formDataToSet.features && Array.isArray(formDataToSet.features)) {
            formDataToSet.features = formDataToSet.features.map(f => f.value).join(', ');
          }

          // Handle related_products: map to an array of just IDs
          if (formDataToSet.related_properties && Array.isArray(formDataToSet.related_properties)) {
            formDataToSet.related_products = formDataToSet.related_properties.map(p => p.related_property_id.toString());
          } else {
            formDataToSet.related_products = [];
          }

          // Handle labels: map to an array of just IDs
          if (formDataToSet.labels && Array.isArray(formDataToSet.labels)) {
             // Ensure we have all labels in our state, even if they are new/custom
             const incomingLabels = formDataToSet.labels.map(l => ({
              id: l.label_id.toString(),
              name: l.name,
              badge_variant: l.badge_variant,
              is_badge: l.is_badge,
            }));
            setLabels(currentLabels => {
              const newLabels = incomingLabels.filter(
                il => !currentLabels.some(cl => String(cl.id) === il.id)
              );
              return [...currentLabels, ...newLabels];
            });
            formDataToSet.labels = formDataToSet.labels.map(l => l.label_id.toString());
          } else {
            formDataToSet.labels = [];
          }

          reset(formDataToSet);

          // Initialize media states from sourceData (which should have media object now)
          if (sourceData.media) {
            setGalleryMedia(sourceData.media.gallery_images ? sourceData.media.gallery_images.map(img => ({
              id: isDuplicating ? undefined : img.id,
              url: img.path,
              thumb_path: img.thumb_path,
              type: 'image', // Explicitly set type
              file: null, 
            })) : []);
            
            setThumbnailMedia(sourceData.media.thumbnail_image ? [{
              id: isDuplicating ? undefined : sourceData.media.thumbnail_image.id,
              url: sourceData.media.thumbnail_image.path,
              thumb_path: sourceData.media.thumbnail_image.thumb_path,
              type: 'image', // Explicitly set type
              file: null,
            }] : []);

            if (sourceData.media.video) {
                if (sourceData.media.video.type === 'upload') {
                    setVideoInputMethod('upload');
                    setVideoMedia([{ url: sourceData.media.video.path, type: 'video', file: null }]); // Change type from 'upload' to 'video'
                    setVideoEmbedLinkForMedia('');
                } else if (sourceData.media.video.type === 'embed') {
                    setVideoInputMethod('embed');
                    setVideoMedia([]);
                    setVideoEmbedLinkForMedia(sourceData.media.video.video_embed_link);
                }
            } else {
                setVideoMedia([]);
                setVideoEmbedLinkForMedia('');
            }
          } else {
            setGalleryMedia([]);
            setThumbnailMedia([]);
            setVideoMedia([]);
            setVideoEmbedLinkForMedia('');
          }


        } else {
          // Reset form to default empty values when adding new item
          reset({
            title: "",
            short_desc: "",
            address: "",
            property_type: "Residential",
            is_file: false,
            file_type: "Affidavit",
            purchase_type: "sale",
            is_furnished: true,
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
            vat_amount: "0",
            category_id: "",
            city_id: "",
            society_id: "",
            phase_id: "",
            related_products: [],
            labels: [],
            embed_link: "",
            hide: false,
            template: "default",
            _new_label_variant: "secondary",
            features: "",
            detailed_description_content: "",
          });
          setGalleryMedia([]);
          setThumbnailMedia([]);
          setVideoMedia([]);
          setVideoEmbedLinkForMedia('');
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Failed to load form dependencies.");
      }
    };

    fetchData();
  }, [initialData, reset, isDuplicating]);

  // Reactive watches for related properties, selected property, and labels
  const related = watch("related_products");
  const selectedProperty = watch("_selected_property");
  const selectedLabelIds = watch("labels") || [];
  const { token } = useAuthStore();
  // Helpers for related properties selection + drag/reorder
  const getRelated = () => getValues("related_products") || [];

  const addRelatedProperty = (id) => {
    const sel = id || getValues("_selected_property");
    if (!sel) return;
    const cur = getRelated();
    if (!cur.includes(sel)) {
      const updated = [...cur, sel];
      setValue("related_products", updated);
    }
  };

  const removeRelatedProperty = (id) => {
    const cur = getRelated();
    const updated = cur.filter((v) => v !== id);
    setValue("related_products", updated);
  };



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



  const onSubmit = (data) => {
    // Determine removed gallery images
    const initialGalleryImageIds = initialData?.media?.gallery_images?.map(img => img.id) || [];
    const currentGalleryImageIds = galleryMedia.filter(item => item.id).map(item => item.id);
    const removedGalleryImageIds = initialGalleryImageIds.filter(id => !currentGalleryImageIds.includes(id));

    // Map form fields to API expected fields
    // The API expects 'related_properties' and 'existing_labels' arrays
    const related_properties = data.related_products;
    const existing_labels = data.labels;

    const finalData = {
        ...data,
        related_properties, 
        existing_labels,
        thumbnailMedia,
        galleryMedia,
        videoMedia,
        videoInputMethod,
        videoEmbedLinkForMedia,
        removedGalleryImageIds,
        id: isDuplicating || !initialData ? undefined : initialData.id,
    };

    onSuccess(finalData);
  };





  const onError = (errors) => {
    console.error("Form errors:", errors);
    toast.error("Form validation failed. Please check the fields.");
  };

  return (
    <div className="p-6 mx-auto space-y-8 max-w-7xl">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        {/* Responsive grid layout replacing Tabs */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ===== SECTION: GENERAL INFORMATION ===== */}
          <section className="space-y-6 lg:col-span-7">
            {/* General Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
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
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
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
                    <p className="text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
          {/* Thumbnail upload  */}
          <section className="space-y-6 lg:col-span-5">
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
                <CardDescription>
                  Main image for property listing
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
          </section>

          {/* ===== SECTION: PROPERTY CLASSIFICATION ===== */}
          <section className="space-y-6 lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle>Property Classification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>
                    Property Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="property_type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Residential" id="residential" />
                          <Label htmlFor="residential">Residential</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Commercial" id="commercial" />
                          <Label htmlFor="commercial">Commercial</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.property_type && (
                    <p className="text-sm text-red-500">
                      {errors.property_type.message}
                    </p>
                  )}
                </div>

                <Separator />
                <div className="space-y-2">
                  <Label>
                    Purchase Type <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="purchase_type"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sale" id="sale" />
                          <Label htmlFor="sale">Sale</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="installment"
                            id="installment"
                          />
                          <Label htmlFor="installment">Installment</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rent" id="rent" />
                          <Label htmlFor="rent">Rent</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.purchase_type && (
                    <p className="text-sm text-red-500">
                      {errors.purchase_type.message}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_furnished">Is Furnished</Label>
                  <Controller
                    name="is_furnished"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="is_furnished"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ===== SECTION: PRICING ===== */}
          <section className="space-y-6 lg:col-span-5">
            {/* Base Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle>Base Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {(purchase_type === "installment" ||
                  purchase_type === "rent") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_period_unit">
                        Price Period Unit
                      </Label>
                      <Controller
                        name="price_period_unit"
                        control={control}
                        render={({ field }) => (
                          <Select
                            key={field.value} // Added key prop
                            onValueChange={field.onChange} // No null conversion needed here as these are fixed values
                            value={field.value}
                          >
                            <SelectTrigger id="price_period_unit">
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
                      <Label htmlFor="price_period_value">
                        Price Period Value
                      </Label>
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

                {/* Conditional: Show discount fields only if is_discounted is true */}
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
              </CardContent>
            </Card>

            {/* Installment Pricing Card - Conditional */}
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
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="advance" id="advance" />
                            <Label htmlFor="advance">Show Advance Amount</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="installment"
                              id="installment_mode"
                            />
                            <Label htmlFor="installment_mode">
                              Show Installment Amount
                            </Label>
                          </div>
                        </RadioGroup>
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
          </section>

          {/* ===== SECTION: RELATION & CATEGORIES ===== */}
          <section className="space-y-6 lg:col-span-7">
            {/* Relation Card */}
            <Card>
              <CardHeader>
                <CardTitle>Relations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Relations & Categories grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Controller
                      name="category_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={field.value + '-' + (categories.length > 0)} // Added key prop
                          onValueChange={(value) => {
                            field.onChange(value === "" ? null : value); // Convert empty string to null
                          }}
                          value={field.value || ""}
                        >
                          <SelectTrigger id="category_id">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City</Label>
                    <Controller
                      name="city_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={field.value + '-' + (cities.length > 0)} // Added key prop
                          onValueChange={(value) => {
                            field.onChange(value === "0" ? null : value);
                          }}
                          value={field.value ? String(field.value) : "0"}
                        >
                          <SelectTrigger id="city_id">
                            <SelectValue placeholder="Select a city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={String(city.id)}>
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
                          key={field.value + '-' + (societies.length > 0)} // Added key prop
                          onValueChange={(value) => {
                            field.onChange(value === "0" ? null : value); 
                          }}
                          value={field.value ? String(field.value) : "0"}
                        >
                          <SelectTrigger id="society_id">
                            <SelectValue placeholder="Select a society" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {societies.map((soc) => (
                              <SelectItem key={soc.id} value={String(soc.id)}>
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
                          key={field.value + '-' + (phases.length > 0)} // Added key prop
                          onValueChange={(value) => {
                            field.onChange(value === "0" ? null : value);
                          }}
                          value={field.value ? String(field.value) : "0"}
                        >
                          <SelectTrigger id="phase_id">
                            <SelectValue placeholder="Select a phase" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">None</SelectItem>
                            {phases.map((phase) => (
                              <SelectItem key={phase.id} value={String(phase.id)}>
                                {phase.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Related Properties field with @dnd-kit drag-and-drop */}
                <div className="mt-6 space-y-3">
                  <Label>Related Properties</Label>
                  <div className="flex gap-2">
                    <Controller
                      name="_selected_property"
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={propertiesOptions.length} // Changed key to avoid remount on value change
                          onValueChange={(value) => {
                            field.onChange(value === "" ? null : value); // Convert empty string to null
                          }}
                          value={field.value || ""}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a property to relate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Select a property</SelectItem>
                            {propertiesOptions.map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        addRelatedProperty();
                        setValue("_selected_property", ""); // Clear selection after adding
                      }}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" /> Add Related
                    </Button>
                  </div>
                  {/* Drag-and-drop list using @dnd-kit */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={({ active, over }) => {
                      if (active && over && active.id !== over.id) {
                        const cur = getRelated();
                        const oldIndex = cur.findIndex(
                          (id) => id === active.id
                        );
                        const newIndex = cur.findIndex((id) => id === over.id);
                        const updated = [...cur];
                        const [moved] = updated.splice(oldIndex, 1);
                        updated.splice(newIndex, 0, moved);
                        setValue("related_products", updated);
                      }
                    }}
                  >
                    <SortableContext
                      items={Array.isArray(related) ? related : []}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {(Array.isArray(related) ? related : []).map((id) => {
                          const p = propertiesOptions.find(
                            (pp) => pp.id === id
                          );
                          if (!p) return null;
                          return (
                            <RelatedPropertyItem
                              key={p.id}
                              id={p.id}
                              name={p.name}
                              onRemove={removeRelatedProperty}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
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
                      items={
                        Array.isArray(selectedLabelIds) ? selectedLabelIds : []
                      }
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
                              onToggleIsBadge={async (checked) => {
                                try {
                                  const response = await fetch(`/api/labels/${lab.id}`, {
                                    method: 'PATCH',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ is_badge: checked }),
                                  });

                                  if (!response.ok) {
                                    const errorData = await response.json();
                                    throw new Error(errorData.detail || `Failed to update label: ${response.statusText}`);
                                  }

                                  // Update local state only on successful API call
                                  setLabels((currentLabels) =>
                                    currentLabels.map((l) =>
                                      l.id === lab.id ? { ...l, is_badge: checked } : l
                                    )
                                  );
                                  toast.success(`Label "${lab.name}" updated successfully.`);
                                } catch (error) {
                                  console.error("Error updating label is_badge status:", error);
                                  toast.error(error.message || "Failed to update label status.");
                                }
                              }}
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
                        if (!selectedLabelIds.includes(String(id))) {
                          setValue("labels", [...selectedLabelIds, String(id)]);
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
                    <Controller
                      name="_new_label_variant"
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={field.value} // Added key prop
                          onValueChange={field.onChange}
                          value={field.value}
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
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={async () => {
                        const name = getValues("_new_label_name")?.trim();
                        const variant = getValues("_new_label_variant");
                        if (!name) return;

                        try {
                            const response = await fetch("/api/labels", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                name: name,
                                is_badge: true, // Default to true as per frontend logic
                                is_filter: true, // Default to true as per schema
                                badge_variant: variant || "secondary",
                              }),
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.detail || `Failed to create label: ${response.statusText}`);
                            }

                            const newCreatedLabel = await response.json();
                            toast.success(`Label "${newCreatedLabel.name}" created successfully!`);

                            // Update local labels state with the newly created label from DB
                            setLabels((s) => [...s, {
                                id: String(newCreatedLabel.id), // Ensure ID is string for consistency
                                name: newCreatedLabel.name,
                                badge_variant: newCreatedLabel.badge_variant,
                                is_badge: !!newCreatedLabel.is_badge,
                                is_filter: !!newCreatedLabel.is_filter,
                            }]);

                            // Add the real database ID to the selected labels for the form
                            setValue("labels", [...selectedLabelIds, String(newCreatedLabel.id)]);
                            
                            // Clear input
                            setValue("_new_label_name", "");
                            setValue("_new_label_variant", "secondary"); // Reset variant to default

                        } catch (error) {
                            console.error("Error creating new label:", error);
                            toast.error(error.message || "Failed to create new label.");
                        }
                      }}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" /> Create & Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ===== SECTION: SPECIFICATIONS ===== */}
          <section className="space-y-6 lg:col-span-5">
            {/* Physical Specifications Card */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds">Bedrooms</Label>
                    <Input
                      id="beds"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("beds")}
                    />
                    {errors.beds && (
                      <p className="text-sm text-red-500">
                        {errors.beds.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baths">Bathrooms</Label>
                    <Input
                      id="baths"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("baths")}
                    />
                    {errors.baths && (
                      <p className="text-sm text-red-500">
                        {errors.baths.message}
                      </p>
                    )}
                  </div>
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
                      <p className="text-sm text-red-500">
                        {errors.area.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Controller
                      name="unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          key={field.value} // Added key prop
                          onValueChange={field.onChange} // No null conversion needed here as these are fixed values
                          value={field.value}
                        >
                          <SelectTrigger id="unit">
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
                      <p className="text-sm text-red-500">
                        {errors.unit.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>Property Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    placeholder="e.g., Garden, Swimming Pool, Gym"
                    className="min-h-[100px]"
                    {...register("features")}
                  />
                  {errors.features && (
                    <p className="text-sm text-red-500">
                      {errors.features.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ===== SECTION: MEDIA & DETAILS ===== */}
          <section className="space-y-6 lg:col-span-12">
            {/* Media Upload Card */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Media Gallery</CardTitle>
                  <CardDescription>
                    Upload and arrange property images with drag & drop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaUpload
                    initialMedia={galleryMedia}
                    onMediaChange={setGalleryMedia}
                    maxFiles={10}
                    maxFileSizeMb={10}
                    allowMultiple={true}
                    allowedTypes={["image/*"]}
                  />
                </CardContent>
              </Card>

              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Video</CardTitle>
                  <CardDescription>
                    Upload a video or provide an embed link.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={videoInputMethod} onValueChange={(value) => {
                      setVideoInputMethod(value);
                      if (value === 'upload') {
                          setVideoEmbedLinkForMedia('');
                      } else {
                          setVideoMedia([]);
                      }
                  }}>
                    <TabsList>
                      <TabsTrigger value="upload">Upload</TabsTrigger>
                      <TabsTrigger value="embed">Embed Link</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                      <MediaUpload
                        initialMedia={videoMedia}
                        onMediaChange={setVideoMedia}
                        maxFiles={1}
                        maxFileSizeMb={500}
                        allowMultiple={false}
                        allowedTypes={["video/*"]}
                      />
                    </TabsContent>
                    <TabsContent value="embed">
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="video_embed_link_for_media">Video Embed URL</Label>
                        <Textarea
                          id="video_embed_link_for_media"
                          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          value={videoEmbedLinkForMedia}
                          onChange={(e) => setVideoEmbedLinkForMedia(e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Embed Link Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Embed Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="embed_link">General Embed URL</Label>
                    <Textarea
                      id="embed_link"
                      placeholder="https://..."
                      {...register("embed_link")}
                      className="min-h-[120px]"
                    />
                    {errors.embed_link && (
                      <p className="text-sm text-red-500">
                        {errors.embed_link.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Paste a YouTube, Google Maps, or other embed URL not tied to an uploaded video asset.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Detailed Descriptions</CardTitle>
                  <CardDescription>
                    Add rich text descriptions with headings and formatted
                    content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="detailed_description_content">Detailed Description Content</Label>
                  <Controller
                    name="detailed_description_content"
                    control={control}
                    render={({ field }) => (
                      <QuillRichText
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter detailed property description..."
                      />
                    )}
                  />
                  {errors.detailed_description_content && (
                    <p className="text-sm text-red-500">
                      {errors.detailed_description_content.message}
                    </p>
                  )}
                </div>
              </CardContent>
              </Card>

              {/* Publishing Settings Card (span both columns) */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Publishing Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

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
            </div>
          </section>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-background">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData ? "Save Property" : "Add Property"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}



// Child component for sortable related property item
function RelatedPropertyItem({ id, name, onRemove }) {
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
      <span className="flex-1 text-sm">{name}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => onRemove(id)}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
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