import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from '@/components/dashboard/MediaUpload';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getYoutubeEmbedUrl } from '@/lib/utils';

const popupSchema = z.object({
  isVisible: z.boolean().default(false),
  delayMs: z.coerce.number().min(0).default(5000),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  mediaType: z.enum(['image', 'upload', 'embed']).default('image'),
  mediaEmbedLink: z.string().url().or(z.literal('')).optional(),
});

export function LandingPagePopupConfigurator({ initialConfig, onConfigChange }) {
  const { register, handleSubmit, control, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    resolver: zodResolver(popupSchema),
    defaultValues: {
      isVisible: initialConfig?.isVisible ?? false,
      delayMs: initialConfig?.delayMs ?? 5000,
      heading: initialConfig?.heading ?? '',
      subheading: initialConfig?.subheading ?? '',
      mediaType: initialConfig?.mediaType ?? 'image',
      mediaEmbedLink: initialConfig?.mediaEmbedLink ?? '',
    },
  });

  const [mediaItems, setMediaItems] = useState(initialConfig?.mediaItems || []);

  const mediaType = watch('mediaType');
  
  useEffect(() => {
    reset({
      isVisible: initialConfig?.isVisible ?? false,
      delayMs: initialConfig?.delayMs ?? 5000,
      heading: initialConfig?.heading ?? '',
      subheading: initialConfig?.subheading ?? '',
      mediaType: initialConfig?.mediaType ?? 'image',
      mediaEmbedLink: initialConfig?.mediaEmbedLink ?? '',
    });
    setMediaItems(initialConfig?.mediaItems || []);
  }, [initialConfig, reset]);

  const triggerConfigChange = () => {
    const values = getValues();
    const newConfig = { ...values, mediaItems };
    if (newConfig.mediaType === 'embed' && newConfig.mediaEmbedLink) {
      newConfig.mediaEmbedLink = getYoutubeEmbedUrl(newConfig.mediaEmbedLink);
    }
    onConfigChange(newConfig);
  };

  const handleMediaChange = (media) => {
    setMediaItems(media);
    const values = getValues();
    const newConfig = { ...values, mediaItems: media };
    onConfigChange(newConfig);
  }

  const handleTabsValueChange = (value) => {
    setValue('mediaType', value);
    // Clear other media values when switching types to avoid confusion
    if (value === 'embed') {
      setMediaItems([]);
    } else if (value === 'image' || value === 'upload') {
      // If we are switching between image and upload, or from embed to either, 
      // we clear the items to ensure the tabs don't "share" the same state
      setMediaItems([]);
      setValue('mediaEmbedLink', '');
    }
    triggerConfigChange();
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="bg-accent/5">
        <div className="flex items-center justify-between">
          <CardTitle>Landing Page Popup</CardTitle>
          <Controller
            name="isVisible"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Label htmlFor="popup-visibility" className="cursor-pointer">Enable Popup</Label>
                <Switch
                  id="popup-visibility"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    triggerConfigChange();
                  }}
                />
              </div>
            )}
          />
        </div>
        <CardDescription>Configure an attention-grabbing popup for your visitors.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="popup-heading">Heading (Optional)</Label>
            <Input
              id="popup-heading"
              placeholder="e.g., Special Offer!"
              {...register('heading')}
              onBlur={triggerConfigChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="popup-delay">Display Delay (ms)</Label>
            <Input
              id="popup-delay"
              type="number"
              placeholder="5000"
              {...register('delayMs')}
              onBlur={triggerConfigChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="popup-subheading">Subheading (Optional)</Label>
          <Textarea
            id="popup-subheading"
            placeholder="e.g., Don't miss our latest property listings in Lahore."
            {...register('subheading')}
            onBlur={triggerConfigChange}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-4">
          <Label>Popup Media</Label>
          <Tabs value={mediaType} onValueChange={handleTabsValueChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="upload">Video Upload</TabsTrigger>
              <TabsTrigger value="embed">Video Link</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="mt-4">
              <MediaUpload
                initialMedia={mediaType === 'image' ? mediaItems : []}
                onMediaChange={handleMediaChange}
                maxFiles={1}
                allowMultiple={false}
                allowedTypes={["image/*"]}
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-4">
              <MediaUpload
                initialMedia={mediaType === 'upload' ? mediaItems : []}
                onMediaChange={handleMediaChange}
                maxFiles={1}
                maxFileSizeMb={100}
                allowMultiple={false}
                allowedTypes={["video/*"]}
              />
            </TabsContent>
            <TabsContent value="embed" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="media-embed-link">YouTube/Vimeo URL</Label>
                <Input
                  id="media-embed-link"
                  placeholder="e.g., https://www.youtube.com/watch?v=..."
                  {...register('mediaEmbedLink')}
                  onBlur={triggerConfigChange}
                />
                {errors.mediaEmbedLink && <p className="text-sm text-red-500">{errors.mediaEmbedLink.message}</p>}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
