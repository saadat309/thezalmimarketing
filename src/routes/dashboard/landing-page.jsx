import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { LandingPageSectionConfigurator } from '@/components/dashboard/landing-page-section-configurator';
import { Button } from '@/components/ui/button'; // Assuming Button is used for Save/Reset
import { toast } from "sonner"; // For notifications
import { ItemSelector } from "@/components/dashboard/item-selector";

export const Route = createFileRoute('/dashboard/landing-page')({
  component: DashboardLandingPage,
  staticData: {
    title: 'Landing Page',
  },
});

function DashboardLandingPage() {
  const [sectionsConfig, setSectionsConfig] = useState({
    featuredProperties: {
      isVisible: true,
      heading: 'Featured Properties',
      subheading: 'Discover our hand-picked selection of properties.',
      selectedItems: [
        { id: 'prop1', title: 'Luxury Villa' },
        { id: 'prop2', title: 'Downtown Office Space' },
      ],
      availableItems: [
        { id: 'prop1', title: 'Luxury Villa' },
        { id: 'prop2', title: 'Downtown Office Space' },
        { id: 'prop3', title: 'Beachfront Apartment' },
        { id: 'prop4', title: 'Suburban Family Home' },
      ],
    },
    categories: {
      isVisible: true,
      heading: 'Property Categories',
      subheading: 'Explore properties by type.',
      selectedItems: [
        { id: 'cat1', name: 'Residential' },
        { id: 'cat2', name: 'Commercial' },
      ],
      availableItems: [
        { id: 'cat1', name: 'Residential' },
        { id: 'cat2', name: 'Commercial' },
        { id: 'cat3', name: 'Industrial' },
        { id: 'cat4', name: 'Land' },
      ],
    },
    maps: {
      isVisible: true,
      heading: 'Location Maps',
      subheading: 'Find properties in prime locations.',
      selectedItems: [{ id: 'map1', title: 'DHA Phase 8' }],
      availableItems: [
        { id: 'map1', title: 'DHA Phase 8' },
        { id: 'map2', title: 'Bahria Town Karachi' },
      ],
    },
    files: {
      isVisible: false,
      heading: 'Available Files',
      subheading: 'Explore available property files.',
      selectedItems: [],
      availableItems: [
        { id: 'file1', title: 'DHA Phase 8 - 5 Marla Residential File' },
        { id: 'file2', title: 'Bahria Town Karachi - 125 Sq. Yd. Commercial File' },
      ],
    },
    phases: {
      isVisible: true,
      heading: 'Development Phases',
      subheading: 'Discover properties in various development phases.',
      selectedItems: [{ id: 'phase1', name: 'Phase 8' }],
      availableItems: [
        { id: 'phase1', name: 'Phase 8' },
        { id: 'phase2', name: 'Phase 9' },
      ],
    },
    societies: {
      isVisible: true,
      heading: 'Housing Societies',
      subheading: 'Browse properties within top housing societies.',
      selectedItems: [
        { id: 'soc1', name: 'DHA' },
        { id: 'soc2', name: 'Bahria Town' },
      ],
      availableItems: [
        { id: 'soc1', name: 'DHA' },
        { id: 'soc2', name: 'Bahria Town' },
        { id: 'soc3', name: 'Lake City' },
      ],
    },
  });

  const handleSectionConfigChange = (sectionName, newConfig) => {
    setSectionsConfig((prev) => ({
      ...prev,
      [sectionName]: newConfig,
    }));
  };

  const handleSave = () => {
    // In a real application, you would send this 'sectionsConfig' to your backend
    console.log('Saving Landing Page Configuration:', sectionsConfig);
    toast.success("Landing Page configuration saved!");
    // For now, we'll just log to console and show a toast.
  };

  const handleReset = () => {
    // Reset to initial default configuration
    setSectionsConfig({
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
      phases: {
        isVisible: true,
        heading: 'Development Phases',
        subheading: 'Discover properties in various development phases.',
        selectedItems: [],
        availableItems: [],
      },
      societies: {
        isVisible: true,
        heading: 'Housing Societies',
        subheading: 'Browse properties within top housing societies.',
        selectedItems: [],
        availableItems: [],
      },
    });
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

  return (
    <div className="container px-4 py-8 mx-auto lg:px-6">
      <h1 className="mb-6 text-3xl font-bold">Configure Landing Page Listings</h1>

      <div className="flex justify-end gap-2 mb-6">
        <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
        <Button onClick={handleSave}>Save Configuration</Button>
      </div>
      <div className="grid gap-8">
        <LandingPageSectionConfigurator
          sectionTitle="Properties"
          initialConfig={sectionsConfig.featuredProperties}
          onConfigChange={(newConfig) => handleSectionConfigChange('featuredProperties', newConfig)}
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
          onConfigChange={(newConfig) => handleSectionConfigChange('categories', newConfig)}
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
          onConfigChange={(newConfig) => handleSectionConfigChange('maps', newConfig)}
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
          onConfigChange={(newConfig) => handleSectionConfigChange('files', newConfig)}
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

        <LandingPageSectionConfigurator
          sectionTitle="Phases"
          initialConfig={sectionsConfig.phases}
          onConfigChange={(newConfig) => handleSectionConfigChange('phases', newConfig)}
        >
          <ItemSelector
            availableItems={sectionsConfig.phases.availableItems}
            selectedItems={sectionsConfig.phases.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('phases', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('phases', newOrderedItems)}
            itemKey="id"
            itemLabel="name"
          />
        </LandingPageSectionConfigurator>

        <LandingPageSectionConfigurator
          sectionTitle="Societies"
          initialConfig={sectionsConfig.societies}
          onConfigChange={(newConfig) => handleSectionConfigChange('societies', newConfig)}
        >
          <ItemSelector
            availableItems={sectionsConfig.societies.availableItems}
            selectedItems={sectionsConfig.societies.selectedItems}
            onSelectionChange={(newSelectedItems) => handleSelectionChange('societies', newSelectedItems)}
            onOrderChange={(newOrderedItems) => handleOrderChange('societies', newOrderedItems)}
            itemKey="id"
            itemLabel="name"
          />
        </LandingPageSectionConfigurator>
      </div>
    </div>
  );
}
