import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query'; // Import queryOptions
import { fetchMaps } from "@/lib/api"; // Import fetchMaps from your API
import { GlobalHero } from "@/components/global/GlobalHero";
import MapCard from "@/components/global/MapCard";


// Define query options for maps data
const mapsQueryOptions = () =>
  queryOptions({
    queryKey: ['maps'],
    queryFn: () => fetchMaps(),
  });

export const Route = createFileRoute("/maps/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(mapsQueryOptions()), // Use queryClient to fetch data
  component: RouteComponent,
});

function RouteComponent() {
  const maps = Route.useLoaderData(); // Get data from loader

  return (
    <div>
      <GlobalHero
        image="/images/architecture-5999913_1280.jpg"
        overlay
      >
        <h1 className="px-4 py-4 mx-auto text-4xl text-center text-white">
          All Maps
        </h1>
      </GlobalHero>
      <div className="flex flex-row flex-wrap justify-center gap-4 px-6 py-4">
        {maps.map((item) => ( // Use fetched maps
          <MapCard key={item.id} {...item} /> // Use item.id for key
        ))}
      </div>
    </div>
  );
}
