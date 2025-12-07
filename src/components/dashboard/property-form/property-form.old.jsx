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
import { propertyFormSchema } from "./validation";
import { PlusIcon, XIcon } from "lucide-react";

export default function PropertyForm() {
  const [categories, setCategories] = useState(["Residential"]);
  const [newCategory, setNewCategory] = useState("");
  const [labels, setLabels] = useState([
    "Discounted",
    "New Listing",
    "Featured",
  ]);
  const [newLabel, setNewLabel] = useState("");
  const [variations, setVariations] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "published",
      categories: ["Residential"],
      tags: [],
      variations: [],
      basePrice: "",
      discountType: "none",
      template: "default",
      taxClass: "standard",
      vatAmount: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setValue("categories", updatedCategories);
      setNewCategory("");
    }
  };

  const removeCategory = (category) => {
    const updatedCategories = categories.filter((c) => c !== category);
    setCategories(updatedCategories);
    setValue("categories", updatedCategories);
  };

  const addVariation = () => {
    const newVariation = { type: "Bedroom", value: "" };
    const updatedVariations = [...variations, newVariation];
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
  };

  const removeVariation = (index) => {
    const updatedVariations = variations.filter((_, i) => i !== index);
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
  };

  const updateVariation = (index, field, value) => {
    const updatedVariations = variations.map((variation, i) =>
      i === index ? { ...variation, [field]: value } : variation
    );
    setVariations(updatedVariations);
    setValue("variations", updatedVariations);
  };

  return (
    <div className="p-6 mx-auto space-y-8 max-w-7xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-4 lg:col-span-2">
            {/* General Section */}
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Property Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Property Name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    A property name is required and recommended to be unique.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Set a description to the property for better visibility."
                    className="min-h-[200px]"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Section */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-12 text-center border-2 border-purple-300 border-dashed rounded-lg bg-purple-50">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-2xl text-purple-400">
                    📁
                  </div>
                  <p className="text-purple-600">Drop files here to upload</p>
                </div>
              </CardContent>
            </Card>

            {/* Variation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Add Property Features</Label>
                  {variations.map((variation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={variation.type}
                        onValueChange={(value) =>
                          updateVariation(index, "type", value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bedroom">Bedroom</SelectItem>
                          <SelectItem value="Bathroom">Bathroom</SelectItem>
                          <SelectItem value="Amenity">Amenity</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Feature"
                        value={variation.value}
                        onChange={(e) =>
                          updateVariation(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeVariation(index)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addVariation}
                  >
                    <PlusIcon /> Add another feature
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">
                    Base Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="basePrice"
                    placeholder="Property Price"
                    {...register("basePrice")}
                  />
                  {errors.basePrice && (
                    <p className="text-sm text-red-500">
                      {errors.basePrice.message}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Set the property price.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <RadioGroup defaultValue="none" className="flex gap-8">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="none"
                        id="no-discount"
                        {...register("discountType")}
                      />
                      <Label htmlFor="no-discount">No Discount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="percentage"
                        id="percentage"
                        {...register("discountType")}
                      />
                      <Label htmlFor="percentage">Percentage %</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="fixed"
                        id="fixed-price"
                        {...register("discountType")}
                      />
                      <Label htmlFor="fixed-price">Fixed Price</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatAmount">
                      VAT Amount (%) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vatAmount"
                      placeholder="0"
                      {...register("vatAmount")}
                    />
                    {errors.vatAmount && (
                      <p className="text-sm text-red-500">
                        {errors.vatAmount.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Set the property VAT amount.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Thumbnail Section */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center border-2 border-purple-300 border-dashed rounded-lg bg-purple-50">
                  <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 text-xl text-purple-400">
                    🖼️
                  </div>
                  <p className="text-sm text-purple-600">
                    Drop Thumbnail here to upload
                  </p>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Set the property thumbnail image. Only *.png, *.jpg and *.jpeg
                  image files are accepted.
                </p>
              </CardContent>
            </Card>

            {/* Status Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Status
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </CardTitle>
                <CardDescription>Set the property status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Select defaultValue="published">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Property Details Section */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-purple-700 bg-purple-100"
                      >
                        <span
                          className="mr-1 cursor-pointer"
                          onClick={() => removeCategory(category)}
                        >
                          ×
                        </span>
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add property to a category.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Select onValueChange={(value) => setNewCategory(value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCategory}
                    >
                      <PlusIcon /> Create New Category
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Labels</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Labels will be rendered here as badges */}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add property labels.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Select
                      onValueChange={(value) => {
                        setNewLabel(value);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a label" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Add existing labels here */}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline">
                      <PlusIcon /> Add Label
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Template</CardTitle>
                <CardDescription>
                  Assign a template from your current theme to define how a
                  single property is displayed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Select defaultValue="default">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                      <SelectItem value="detailed">
                        Detailed Template
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="destructive">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
