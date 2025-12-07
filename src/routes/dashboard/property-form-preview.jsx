import { createFileRoute } from "@tanstack/react-router";
import PropertyForm from "@/components/dashboard/property-form/property-form";

export const Route = createFileRoute("/dashboard/property-form-preview")({
  component: PropertyFormPreview,
  staticData: {
    title: "Property Form Preview",
  },
});

function PropertyFormPreview() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyForm />
    </div>
  );
}
