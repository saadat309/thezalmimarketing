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
      <GlobalHero image="/images/architecture-5999913_1280.jpg" overlay height="60vh">
        <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white break-all sm:text-5xl lg:text-6xl">
          All Maps
        </h1>
      </GlobalHero>
      <div className="container py-8 mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {maps.map(
          (
            item // Use fetched maps
          ) => (
            <MapCard key={item.id} {...item} /> // Use item.id for key
          )
        )}
        </div>
      </div>  
    </div>
  );
}
