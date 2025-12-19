import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { queryFormSchema } from "./validation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function QueryForm({ initialData, onSuccess, onCancel, isSubmitting }) {
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(queryFormSchema),
    defaultValues: {
      property_id: "",
      name: "",
      email: "",
      phone: "",
      message: "",
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error("Error loading properties:", error);
        toast.error("Failed to load properties for selection");
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        property_id: initialData.property_id ? String(initialData.property_id) : "",
      };
      reset(formattedData);
    } else {
        reset({
            property_id: "",
            name: "",
            email: "",
            phone: "",
            message: "",
        });
    }
  }, [initialData, reset]);

  const onSubmit = (data) => {
    const formattedData = {
        ...data,
        property_id: data.property_id === "0" || data.property_id === "" ? null : data.property_id,
    };
    onSuccess(formattedData);
  };

  const onError = (errors) => {
    console.error("Form errors:", errors);
    toast.error("Form validation failed.");
  };

  return (
    <div className="max-w-2xl p-6 mx-auto space-y-8">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Query Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="property_id">Related Property</Label>
              <Controller
                name="property_id"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ? String(field.value) : "0"}
                    disabled={isLoadingProperties}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingProperties ? "Loading..." : "Select a property (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      {properties.map((prop) => (
                        <SelectItem key={prop.id} value={String(prop.id)}>
                          {prop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input id="name" placeholder="Name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="Phone" {...register("phone")} />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
              <Textarea id="message" placeholder="Message content" className="min-h-[100px]" {...register("message")} />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex gap-3 p-6 bg-background border-t">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Query
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
