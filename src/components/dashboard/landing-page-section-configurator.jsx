import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function LandingPageSectionConfigurator({
  sectionTitle,
  initialConfig,
  onConfigChange,
  children, // This will be for the item selection/sorting UI
}) {
  const [config, setConfig] = React.useState(initialConfig);

  React.useEffect(() => {
    onConfigChange(config);
  }, [config, onConfigChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (checked) => {
    setConfig((prev) => ({ ...prev, isVisible: checked }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{sectionTitle} Section</CardTitle>
        <CardDescription>Configure the display settings for the {sectionTitle.toLowerCase()} section on the landing page.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-2 mb-4">
          <Label htmlFor={`visibility-${sectionTitle.replace(/\s/g, '-')}`} className="flex-1 text-base">
            Enable {sectionTitle} Section
          </Label>
          <Switch
            id={`visibility-${sectionTitle.replace(/\s/g, '-')}`}
            checked={config.isVisible}
            onCheckedChange={handleVisibilityChange}
          />
        </div>
        <Separator className="my-4" />
        {config.isVisible && (
          <>
            <div className="grid gap-4 mb-4">
              <div className="grid gap-2">
                <Label htmlFor={`heading-${sectionTitle.replace(/\s/g, '-')}`}>Heading</Label>
                <Input
                  id={`heading-${sectionTitle.replace(/\s/g, '-')}`}
                  name="heading"
                  value={config.heading}
                  onChange={handleInputChange}
                  placeholder={`Enter heading for ${sectionTitle} section`}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`subheading-${sectionTitle.replace(/\s/g, '-')}`}>Subheading</Label>
                <Textarea
                  id={`subheading-${sectionTitle.replace(/\s/g, '-')}`}
                  name="subheading"
                  value={config.subheading}
                  onChange={handleInputChange}
                  placeholder={`Enter subheading for ${sectionTitle} section`}
                  rows={2}
                />
              </div>
            </div>
            <Separator className="my-4" />
            {children} {/* This is where item selection and sorting UI will be rendered */}
          </>
        )}
      </CardContent>
    </Card>
  );
}
