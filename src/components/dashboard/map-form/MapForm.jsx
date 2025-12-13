import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaUpload } from "../MediaUpload";
import { mapFormSchema } from "./validation";

export default function MapForm({ initialData, onSuccess, onCancel, isDuplicating }) {
  const [mapImage, setMapImage] = useState([]);
  const [mapPdf, setMapPdf] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mapFormSchema),
    defaultValues: {
      title: "",
      description: "",
      hide: false,
      mapImage: [],
      mapPdf: [],
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (initialData) {
      const formDataToSet = isDuplicating ? { ...initialData, id: undefined } : initialData;
      reset(formDataToSet);
      setMapImage(initialData.mapImage || []);
      setMapPdf(initialData.mapPdf || []);
    } else {
      reset({
        title: "",
        description: "",
        hide: false,
        mapImage: [],
        mapPdf: [],
      });
      setMapImage([]);
      setMapPdf([]);
    }
  }, [initialData, reset, isDuplicating]);

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      mapImage,
      mapPdf,
      id: (isDuplicating || !initialData) ? undefined : initialData.id,
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

        <Card>
          <CardHeader>
            <CardTitle>Map Media</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 py-4">
            <h4 className="text-sm font-medium leading-none">Map Image (Max 1)</h4>
            <MediaUpload
              initialMedia={mapImage}
              onMediaChange={setMapImage}
              maxFiles={1}
              allowedTypes={['image/*']}
              allowMultiple={false}
              showPrimaryOption={false}
            />
            <h4 className="text-sm font-medium leading-none">Map PDF (Max 1)</h4>
            <MediaUpload
              initialMedia={mapPdf}
              onMediaChange={setMapPdf}
              maxFiles={1}
              allowedTypes={['application/pdf']}
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

        <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t">
          <Button type="submit" size="lg">
            Save Map
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
