import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MediaUpload } from "../MediaUpload";
import { mapFormSchema } from "./validation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { SearchableSelect } from "../SearchableSelect";
import { apiFetch } from "@/lib/apiClient";

export default function MapForm({
  initialData,
  onSuccess,
  onCancel,
  isDuplicating,
  isSubmitting,
}) {
  const [mapImage, setMapImage] = useState([]);
  const [mapPdf, setMapPdf] = useState([]);
  const [cities, setCities] = useState([]); // State for cities
  const [societies, setSocieties] = useState([]); // State for societies
  const [phases, setPhases] = useState([]); // State for phases

  const cityOptions = useMemo(() => cities.map(c => ({ value: c.id.toString(), label: c.name })), [cities]);
  const societyOptions = useMemo(() => societies.map(s => ({ value: s.id.toString(), label: s.name })), [societies]);
  const phaseOptions = useMemo(() => phases.map(p => ({ value: p.id.toString(), label: p.name })), [phases]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues, // Re-add getValues
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      title: "",
      description: "",
      hide: false,
      mapImage: [],
      mapPdf: [],
      city_id: null,
      society_id: null,
      phase_id: null,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citiesResponse, societiesResponse, phasesResponse] =
          await Promise.all([
            apiFetch("/cities"),
            apiFetch("/societies"),
            apiFetch("/phases"),
          ]);

        if (!citiesResponse.ok) throw new Error("Failed to fetch cities.");
        if (!societiesResponse.ok)
          throw new Error("Failed to fetch societies.");
        if (!phasesResponse.ok) throw new Error("Failed to fetch phases.");

        const citiesData = await citiesResponse.json();
        const societiesData = await societiesResponse.json();
        const phasesData = await phasesResponse.json();

        setCities(citiesData);
        setSocieties(societiesData);
        setPhases(phasesData);

        // Move reset(formDataToSet) here to ensure options are loaded first
        if (initialData) {
          const baseData = { ...initialData };

          const formDataToSet = {
            ...baseData,
            city_id: baseData.city_id ? baseData.city_id.toString() : null,
            society_id: baseData.society_id ? baseData.society_id.toString() : null,
            phase_id: baseData.phase_id ? baseData.phase_id.toString() : null,
            hide: baseData.hide === 1 || baseData.hide === true, // Convert to strict boolean
          };

          // Null safety for string fields to prevent Zod "expected string, received null" errors
          if (formDataToSet.description === null) formDataToSet.description = "";
          if (formDataToSet.map_pic === null) formDataToSet.map_pic = "";
          if (formDataToSet.map_thumb === null) formDataToSet.map_thumb = "";
          if (formDataToSet.pdf === null) formDataToSet.pdf = "";

          if (isDuplicating) {
            formDataToSet.id = undefined; // Ensure ID is removed for duplication
          }
          reset(formDataToSet);
          // Format existing map_pic for MediaUpload
          if (initialData.map_pic) {
            setMapImage([
              {
                url: initialData.map_pic,
                thumb_path: initialData.map_thumb,
                type: "image",
              },
            ]);
          } else {
            setMapImage([]);
          }
          // Format existing pdf for MediaUpload
          if (initialData.pdf) {
            setMapPdf([{ url: initialData.pdf, type: "pdf" }]);
          } else {
            setMapPdf([]);
          }
        } else {
          reset({
            title: "",
            description: "",
            hide: false,
            mapImage: [],
            mapPdf: [],
            city_id: null,
            society_id: null,
            phase_id: null,
          });
          setMapImage([]);
          setMapPdf([]);
        }
      } catch (error) {
        console.error("Failed to fetch relations data:", error);
        toast.error("Failed to load related data: " + error.message);
      }
    };

    fetchData();
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const finalData = {
      ...data, 
      mapImage,
      mapPdf,
      // Add explicit removal flags if arrays are empty and initial data had them
      mapImage_removed: mapImage.length === 0 && !!initialData?.map_pic,
      mapPdf_removed: mapPdf.length === 0 && !!initialData?.pdf,
      id: isDuplicating || !initialData ? undefined : initialData.id,
    };
    onSuccess(finalData);
  };

  return (
    <div className="max-w-3xl p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Map Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter map title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief overview of the map"
                className="min-h-[100px]"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Relations Card */}
        <Card>
          <CardHeader>
            <CardTitle>Relations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="city_id">City</Label>
              <Controller
                name="city_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={cityOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a city"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="society_id">Society</Label>
              <Controller
                name="society_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={societyOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a society"
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phase_id">Phase</Label>
              <Controller
                name="phase_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    options={phaseOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a phase"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map Media</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <h4 className="text-sm font-medium leading-none">
              Map Image (Max 1)
            </h4>
            <MediaUpload
              initialMedia={mapImage}
              onMediaChange={setMapImage}
              maxFiles={1}
              allowedTypes={["image/*"]}
              allowMultiple={false}
              showPrimaryOption={false}
            />
            <h4 className="text-sm font-medium leading-none">
              Map PDF (Max 1)
            </h4>
            <MediaUpload
              initialMedia={mapPdf}
              onMediaChange={setMapPdf}
              maxFiles={1}
              maxFileSizeMb={100}
              allowedTypes={["application/pdf"]}
              allowMultiple={false}
              showPrimaryOption={false}
            />
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
            {initialData ? "Save Map" : "Add Map"}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
