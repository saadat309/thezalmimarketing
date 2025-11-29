import { createFileRoute } from "@tanstack/react-router";
import SmartImage from "@/components/global/SmartImage";
import { AlertTriangle } from "lucide-react";
import { GlobalHero } from "@/components/global/GlobalHero";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <GlobalHero
        image="/images/business-7111770_1280.jpg"
        overlay
      >
        <h1 className="px-4 py-4 mx-auto text-4xl text-center text-white">
          Know About Us
        </h1>
      </GlobalHero>

      <div className="grid grid-cols-1 gap-8 px-2 md:grid-cols-2 lg:grid-cols-3">
        {/* Original Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Original Responsive Image</h2>
          <SmartImage
            src="/panoramic-view-barcelona-multiple-building-s-roofs-view-from-parc-guell-spain.jpg"
            thumb="/lahore-city-pic.webp"
            alt="Panoramic view of Barcelona"
            ratio={16 / 9}
            loading="eager"
          />
          <p className="text-sm text-muted-foreground">
            This image maintains a 16:9 aspect ratio.
          </p>
        </div>

        {/* Example with Width and Height */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">With Width and Height</h2>
          <SmartImage
            src="/lahore-city-pic.webp"
            alt="Lahore City"
            width={1280}
            height={720}
            className="rounded-lg shadow-md"
          />
          <p className="text-sm text-muted-foreground">
            This image uses `width` and `height` props. The container still
            makes it responsive.
          </p>
        </div>

        {/* Default Error Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Default Error Fallback</h2>
          <SmartImage
            src="/this-image-does-not-exist.jpg"
            alt="A broken image"
            ratio={16 / 9}
            className="border border-dashed rounded-lg"
          />
          <p className="text-sm text-muted-foreground">
            Shows the default error message when the image fails to load.
          </p>
        </div>

        {/* Custom Error Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Custom Error Fallback</h2>
          <SmartImage
            src="/another-broken-image.png"
            alt="A broken image with custom fallback"
            ratio={16 / 9}
            className="border border-dashed rounded-lg"
            errorPlaceholder={
              <div className="flex flex-col items-center justify-center h-full text-destructive">
                <AlertTriangle className="w-10 h-10" />
                <p className="mt-2 text-sm font-semibold">
                  Oops! Image not found.
                </p>
              </div>
            }
          />
          <p className="text-sm text-muted-foreground">
            Shows a custom component when the image fails to load.
          </p>
        </div>

        {/* Square Image Example */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Square Image (1:1 Ratio)</h2>
          <SmartImage
            src="/lahore-city-pic.webp"
            thumb="/lahore-city-pic.webp"
            alt="A square image of Lahore"
            ratio={1 / 1}
            loading="lazy"
            className="rounded-full"
          />
          <p className="text-sm text-muted-foreground">
            An example with a 1:1 aspect ratio and lazy loading.
          </p>
        </div>
      </div>
    </div>
  );
}
