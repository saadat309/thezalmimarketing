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

const videoSectionSchema = z.object({
  isVisible: z.boolean().default(true),
  heading: z.string().min(1, 'Heading is required'),
  subheading: z.string().optional(),
  videoInputMethod: z.enum(['upload', 'embed']).default('upload'),
  // videoMedia is handled separately, as MediaUpload works with file objects/paths
  videoEmbedLink: z.string().url().or(z.literal('')).optional(),
});

export function LandingPageVideoSectionConfigurator({ initialConfig, onConfigChange }) {
  const { register, handleSubmit, control, watch, setValue, getValues, reset, formState: { errors } } = useForm({
    resolver: zodResolver(videoSectionSchema),
    defaultValues: {
      isVisible: initialConfig?.isVisible ?? true,
      heading: initialConfig?.heading ?? 'Featured Video',
      subheading: initialConfig?.subheading ?? 'Watch our latest property showcase.',
      videoInputMethod: initialConfig?.videoInputMethod ?? 'upload',
      videoEmbedLink: initialConfig?.videoEmbedLink ?? '',
    },
  });

  const [videoMedia, setVideoMedia] = useState(initialConfig?.videoMedia || []);

  const videoInputMethod = watch('videoInputMethod');
  
  useEffect(() => {
    reset({
      isVisible: initialConfig?.isVisible ?? true,
      heading: initialConfig?.heading ?? 'Featured Video',
      subheading: initialConfig?.subheading ?? 'Watch our latest property showcase.',
      videoInputMethod: initialConfig?.videoInputMethod ?? 'upload',
      videoEmbedLink: initialConfig?.videoEmbedLink ?? '',
    });
    setVideoMedia(initialConfig?.videoMedia || []);
  }, [initialConfig, reset]);

  const triggerConfigChange = () => {
    const values = getValues();
    const newConfig = { ...values, videoMedia };
    if (newConfig.videoInputMethod === 'embed' && newConfig.videoEmbedLink) {
      newConfig.videoEmbedLink = getYoutubeEmbedUrl(newConfig.videoEmbedLink);
    }
    onConfigChange(newConfig);
  };

  const handleMediaChange = (media) => {
    setVideoMedia(media);
    const values = getValues();
    const newConfig = { ...values, videoMedia: media };
    onConfigChange(newConfig);
  }

  const handleTabsValueChange = (value) => {
    setValue('videoInputMethod', value);
    if (value === 'upload') {
      setValue('videoEmbedLink', '');
    } else {
      setVideoMedia([]);
    }
    triggerConfigChange();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Video Section</CardTitle>
          <Controller
            name="isVisible"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Label htmlFor="video-section-visibility">Visible</Label>
                <Switch
                  id="video-section-visibility"
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
        <CardDescription>Configure the main video for your landing page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="video-heading">Heading</Label>
          <Input
            id="video-heading"
            placeholder="e.g., Discover Our Story"
            {...register('heading')}
            onBlur={triggerConfigChange}
          />
          {errors.heading && <p className="text-sm text-red-500">{errors.heading.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="video-subheading">Subheading</Label>
          <Textarea
            id="video-subheading"
            placeholder="e.g., Get to know more about Zalmi Marketing"
            {...register('subheading')}
            onBlur={triggerConfigChange}
          />
        </div>

        <Tabs value={videoInputMethod} onValueChange={handleTabsValueChange}>
          <TabsList>
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="embed">Video Embed Link</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <MediaUpload
              initialMedia={videoMedia}
              onMediaChange={handleMediaChange}
              maxFiles={1}
              maxFileSizeMb={500}
              allowMultiple={false}
              allowedTypes={["video/*"]}
            />
          </TabsContent>
          <TabsContent value="embed">
            <div className="space-y-2 mt-4">
              <Label htmlFor="video-embed-link">Embed URL</Label>
              <Textarea
                id="video-embed-link"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                {...register('videoEmbedLink')}
                onBlur={triggerConfigChange}
                className="min-h-[80px]"
              />
              {errors.videoEmbedLink && <p className="text-sm text-red-500">{errors.videoEmbedLink.message}</p>}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
