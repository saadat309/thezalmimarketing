import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect, useCallback } from 'react';
import { LandingPageSectionConfigurator } from '@/components/dashboard/landing-page-section-configurator';
import { Button } from '@/components/ui/button'; // Assuming Button is used for Save/Reset
import { toast } from "sonner"; // For notifications
import { ItemSelector } from "@/components/dashboard/item-selector";
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/spinner';
import { Loader2 } from 'lucide-react';

import { LandingPageVideoSectionConfigurator } from '@/components/dashboard/LandingPageVideoSectionConfigurator';

export const Route = createFileRoute('/dashboard/landing-page')({
  component: DashboardLandingPage,
  staticData: {
    title: 'Landing Page',
  },
});

const DEFAULT_SECTIONS_CONFIG = {
  videoSection: {
    isVisible: true,
    heading: 'Featured Video',
    subheading: 'Watch our latest property showcase.',
    videoInputMethod: 'upload', // 'upload' or 'embed'
    videoMedia: [], // for uploaded video
    videoEmbedLink: '', // for embed link
  },
  featuredProperties: {
    isVisible: true,
    heading: 'Featured Properties',
    subheading: 'Discover our hand-picked selection of properties.',
    selectedItems: [],
    availableItems: [],
  },
  categories: {
    isVisible: true,
    heading: 'Property Categories',
    subheading: 'Explore properties by type.',
    selectedItems: [],
    availableItems: [],
  },
  maps: {
    isVisible: true,
    heading: 'Location Maps',
    subheading: 'Find properties in prime locations.',
    selectedItems: [],
    availableItems: [],
  },
  files: {
    isVisible: false,
    heading: 'Available Files',
    subheading: 'Explore available property files.',
    selectedItems: [],
    availableItems: [],
  },
};

function DashboardLandingPage() {
  const { token } = useAuthStore();
  const [sectionsConfig, setSectionsConfig] = useState(DEFAULT_SECTIONS_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableItems, setAvailableItems] = useState({
    properties: [],
    categories: [],
    maps: [],
    files: []
  });

  // Fetch landing sections configuration and available items
  useEffect(() => {
    const fetchLandingPageData = async () => {
      try {
        setIsLoading(true);

        // Fetch available items for all sections
        const availableItemsResponse = await fetch(
          "/api/landing-available-items?all=1",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Auth-Token": token
            },
          }
        );
        if (!availableItemsResponse.ok) {
          throw new Error(`Failed to fetch available items: ${availableItemsResponse.status}`);
        }
        const availableItemsData = await availableItemsResponse.json();
        setAvailableItems(availableItemsData);

        // Fetch existing landing sections configuration
        const sectionsResponse = await fetch("/api/landing-sections", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Auth-Token": token
          },
        });
        if (!sectionsResponse.ok) {
          throw new Error(`Failed to fetch landing sections: ${sectionsResponse.status}`);
        }
        const sectionsData = await sectionsResponse.json();

        // Transform sections data to match our expected format
        // Start from a fresh default config
        const updatedConfig = JSON.parse(JSON.stringify(DEFAULT_SECTIONS_CONFIG));

        sectionsData.forEach(section => {
          // Convert visibility to boolean (0/1 -> false/true)
          const isVisible = Boolean(Number(section.visibility));
          
          switch(section.collection_type) {
            case 'properties':
              if (section.slug === 'featured-properties') {
                updatedConfig.featuredProperties = {
                  ...updatedConfig.featuredProperties,
                  isVisible: isVisible,
                  heading: section.title || 'Featured Properties',
                  subheading: section.subtitle || 'Discover our hand-picked selection of properties.',
                  selectedItems: section.selected_items.map(id =>
                    availableItemsData.properties.find(item => String(item.id) === String(id))
                  ).filter(Boolean),
                };
              } else if (section.slug === 'files') {
                updatedConfig.files = {
                  ...updatedConfig.files,
                  isVisible: isVisible,
                  heading: section.title || 'Available Files',
                  subheading: section.subtitle || 'Explore available property files.',
                  selectedItems: section.selected_items.map(id =>
                    availableItemsData.files.find(item => String(item.id) === String(id))
                  ).filter(Boolean),
                };
              }
              break;
            case 'categories':
              updatedConfig.categories = {
                ...updatedConfig.categories,
                isVisible: isVisible,
                heading: section.title || 'Property Categories',
                subheading: section.subtitle || 'Explore properties by type.',
                selectedItems: section.selected_items.map(id =>
                  availableItemsData.categories.find(item => String(item.id) === String(id))
                ).filter(Boolean),
              };
              break;
            case 'maps':
              updatedConfig.maps = {
                ...updatedConfig.maps,
                isVisible: isVisible,
                heading: section.title || 'Location Maps',
                subheading: section.subtitle || 'Find properties in prime locations.',
                selectedItems: section.selected_items.map(id =>
                  availableItemsData.maps.find(item => String(item.id) === String(id))
                ).filter(Boolean),
              };
              break;
            case 'video':
              updatedConfig.videoSection = {
                ...updatedConfig.videoSection,
                isVisible: isVisible,
                heading: section.title || 'Featured Video',
                subheading: section.subtitle || 'Watch our latest property showcase.',
                videoInputMethod: section.video_input_method || 'upload',
                videoEmbedLink: section.video_embed_link || '',
                // Update videoMedia array for MediaUpload component
                videoMedia: section.video_path ? [{ url: section.video_path, type: 'video' }] : []
              };
              break;
          }
        });

        // Update available items in each section
        updatedConfig.featuredProperties.availableItems = availableItemsData.properties;
        updatedConfig.categories.availableItems = availableItemsData.categories;
        updatedConfig.maps.availableItems = availableItemsData.maps;
        updatedConfig.files.availableItems = availableItemsData.files;

        setSectionsConfig(updatedConfig);
      } catch (error) {
        console.error('Error fetching landing page data:', error);
        toast.error(`Failed to load landing page data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchLandingPageData();
    }
  }, [token]);

  const handleSectionConfigChange = useCallback((sectionName, newConfig) => {
    setSectionsConfig((prev) => ({
      ...prev,
      [sectionName]: newConfig,
    }));
  }, []);

  const handleVideoSectionChange = useCallback((newConfig) => {
    handleSectionConfigChange('videoSection', newConfig);
  }, [handleSectionConfigChange]);

  const handleFeaturedPropertiesChange = useCallback((newConfig) => {
    handleSectionConfigChange('featuredProperties', newConfig);
  }, [handleSectionConfigChange]);

  const handleCategoriesChange = useCallback((newConfig) => {
    handleSectionConfigChange('categories', newConfig);
  }, [handleSectionConfigChange]);

  const handleMapsChange = useCallback((newConfig) => {
    handleSectionConfigChange('maps', newConfig);
  }, [handleSectionConfigChange]);

  const handleFilesChange = useCallback((newConfig) => {
    handleSectionConfigChange('files', newConfig);
  }, [handleSectionConfigChange]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Prepare section data for API
      const sectionsToSave = [];

      // Video section logic
      const videoSectionData = {
        slug: 'video-section',
        title: sectionsConfig.videoSection.heading,
        subtitle: sectionsConfig.videoSection.subheading,
        collection_type: 'video',
        visibility: sectionsConfig.videoSection.isVisible ? 1 : 0,
        video_input_method: sectionsConfig.videoSection.videoInputMethod,
        video_embed_link: sectionsConfig.videoSection.videoEmbedLink,
        // If uploading, video_path is irrelevant here (backend handles file), otherwise use existing URL
        video_path: sectionsConfig.videoSection.videoMedia && sectionsConfig.videoSection.videoMedia.length > 0 && !sectionsConfig.videoSection.videoMedia[0].file
          ? sectionsConfig.videoSection.videoMedia[0].url
          : null
      };

      // Check for file to upload
      if (sectionsConfig.videoSection.videoMedia && sectionsConfig.videoSection.videoMedia.length > 0 && sectionsConfig.videoSection.videoMedia[0].file) {
          videoSectionData._videoFile = sectionsConfig.videoSection.videoMedia[0].file;
      }
      // Check for removal (if upload method selected but no media)
      if (sectionsConfig.videoSection.videoInputMethod === 'upload' && (!sectionsConfig.videoSection.videoMedia || sectionsConfig.videoSection.videoMedia.length === 0)) {
          videoSectionData._videoRemoved = true;
      }

      sectionsToSave.push(videoSectionData);

      // Featured properties section
      sectionsToSave.push({
        slug: 'featured-properties',
        title: sectionsConfig.featuredProperties.heading,
        subtitle: sectionsConfig.featuredProperties.subheading,
        collection_type: 'properties',
        visibility: sectionsConfig.featuredProperties.isVisible ? 1 : 0,
        selected_items: sectionsConfig.featuredProperties.selectedItems.map(item => item.id)
      });

      // Categories section
      sectionsToSave.push({
        slug: 'categories',
        title: sectionsConfig.categories.heading,
        subtitle: sectionsConfig.categories.subheading,
        collection_type: 'categories',
        visibility: sectionsConfig.categories.isVisible ? 1 : 0,
        selected_items: sectionsConfig.categories.selectedItems.map(item => item.id)
      });

      // Maps section
      sectionsToSave.push({
        slug: 'maps',
        title: sectionsConfig.maps.heading,
        subtitle: sectionsConfig.maps.subheading,
        collection_type: 'maps',
        visibility: sectionsConfig.maps.isVisible ? 1 : 0,
        selected_items: sectionsConfig.maps.selectedItems.map(item => item.id)
      });

      // Files section
      sectionsToSave.push({
        slug: 'files',
        title: sectionsConfig.files.heading,
        subtitle: sectionsConfig.files.subheading,
        collection_type: 'properties', // Files are really properties with is_file = 1
        visibility: sectionsConfig.files.isVisible ? 1 : 0,
        selected_items: sectionsConfig.files.selectedItems.map(item => item.id)
      });

      // Check if sections already exist, otherwise create them
      const sectionsResponse = await fetch('/api/landing-sections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          "X-Auth-Token": token, 
          'Content-Type': 'application/json'
        }
      });

      if (!sectionsResponse.ok) {
        throw new Error(`Failed to fetch existing sections: ${sectionsResponse.status}`);
      }

      const existingSections = await sectionsResponse.json();
      const existingSectionMap = {};
      existingSections.forEach(section => {
        existingSectionMap[section.slug] = section;
      });

      // Process each section
      for (const section of sectionsToSave) {
        const existing = existingSectionMap[section.slug];
        
        let body;
        let headers = {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token
        };
        let method;

        if (section.slug === 'video-section' && (section._videoFile || section._videoRemoved)) {
             // Use FormData for video section if file involved
             const formData = new FormData();
             for (const key in section) {
                 if (key.startsWith('_')) continue;
                 if (section[key] !== null && section[key] !== undefined) {
                    formData.append(key, section[key]);
                 }
             }
             
             if (section._videoFile) {
                 formData.append('video', section._videoFile);
             }
             if (section._videoRemoved) {
                 formData.append('video_removed', 'true');
             }

             if (existing) {
                 formData.append('_method', 'PATCH');
                 method = 'POST'; // POST with override
             } else {
                 method = 'POST';
             }
             body = formData;
             // Do NOT set Content-Type for FormData
        } else {
            // Use JSON for others
             headers['Content-Type'] = 'application/json';
             const { _videoFile, _videoRemoved, ...jsonSection } = section;
             body = JSON.stringify(jsonSection);
             method = existing ? 'PATCH' : 'POST';
        }

        const url = existing ? `/api/landing-sections/${existing.id}` : '/api/landing-sections';

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to save section ${section.slug}: ${errorData.detail || response.status}`);
        }
      }

      toast.success("Landing Page configuration saved successfully!");
    } catch (error) {
      console.error('Error saving landing page configuration:', error);
      toast.error(`Failed to save landing page configuration: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleReset = () => {
    // Reset to initial default configuration
    setSectionsConfig(DEFAULT_SECTIONS_CONFIG);
    toast.info("Landing Page configuration reset to defaults.");
  };

  const handleOrderChange = (sectionName, newOrderedItems) => {
    setSectionsConfig((prev) => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], selectedItems: newOrderedItems },
    }));
  };

  const handleSelectionChange = (sectionName, newSelectedItems) => {
    setSectionsConfig((prev) => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], selectedItems: newSelectedItems },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
        <p className="ml-2">Loading landing page configuration...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Configure Landing Page Listings</h1>

      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>Reset to Defaults</Button>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Configuration
        </Button>
      </div>
      <div className="grid gap-8">
        <LandingPageVideoSectionConfigurator
          initialConfig={sectionsConfig.videoSection}
          onConfigChange={handleVideoSectionChange}
        />
        <LandingPageSectionConfigurator
          sectionTitle="Properties"
          initialConfig={sectionsConfig.featuredProperties}
          onConfigChange={handleFeaturedPropertiesChange}
        >
          <ItemSelector
            availableItems={sectionsConfig.featuredProperties.availableItems}
            selectedItems={sectionsConfig.featuredProperties.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('featuredProperties', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('featuredProperties', newOrderedItems)}
            itemKey="id"
            itemLabel="title"
          />
        </LandingPageSectionConfigurator>

        <LandingPageSectionConfigurator
          sectionTitle="Categories"
          initialConfig={sectionsConfig.categories}
          onConfigChange={handleCategoriesChange}
        >
          <ItemSelector
            availableItems={sectionsConfig.categories.availableItems}
            selectedItems={sectionsConfig.categories.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('categories', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('categories', newOrderedItems)}
            itemKey="id"
            itemLabel="name"
          />
        </LandingPageSectionConfigurator>

        <LandingPageSectionConfigurator
          sectionTitle="Maps"
          initialConfig={sectionsConfig.maps}
          onConfigChange={handleMapsChange}
        >
          <ItemSelector
            availableItems={sectionsConfig.maps.availableItems}
            selectedItems={sectionsConfig.maps.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('maps', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('maps', newOrderedItems)}
            itemKey="id"
            itemLabel="title"
          />
        </LandingPageSectionConfigurator>

        <LandingPageSectionConfigurator
          sectionTitle="Files"
          initialConfig={sectionsConfig.files}
          onConfigChange={handleFilesChange}
        >
          <ItemSelector
            availableItems={sectionsConfig.files.availableItems}
            selectedItems={sectionsConfig.files.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('files', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('files', newOrderedItems)}
            itemKey="id"
            itemLabel="title"
          />
        </LandingPageSectionConfigurator>

      </div>
    </div>
  );
}
