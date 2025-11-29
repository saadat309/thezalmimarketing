import { createFileRoute } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
export const Route = createFileRoute("/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <GlobalHero
        image="/images/purchase-3113198_1280.jpg"
        overlay
      >
        <h1 className="px-4 py-4 mx-auto text-4xl text-center text-white">
          Contact Us
        </h1>
      </GlobalHero>
    </div>
  );
}
