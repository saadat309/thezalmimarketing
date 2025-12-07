import { createFileRoute } from "@tanstack/react-router";
import PropertyFileForm from "@/components/dashboard/property-form/property-file-form";

export const Route = createFileRoute("/dashboard/property-file-form")({
  component: PropertyFileFormPage,
  staticData: {
    title: "Create File Property",
  },
});

function PropertyFileFormPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create File Property</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the details below to create a new file property listing
        </p>
      </div>
      <PropertyFileForm />
    </div>
  );
}
