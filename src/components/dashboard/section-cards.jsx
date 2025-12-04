import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards({ propertiesCount = 0, filesCount = 0, queriesCount = 0, mapsCount = 0 }) {
  return (
    <div
      className="*:data-[slot=card]:shadow-xs grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:grid-cols-2 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col">
            <CardDescription>Total Properties</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {propertiesCount}
            </CardTitle>
          </div>
          <img src="/properties.svg" alt="Properties Icon" className="h-20 w-20 text-muted-foreground" />
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col">
            <CardDescription>Total Files</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {filesCount}
            </CardTitle>
          </div>
          <img src="/files.svg" alt="Files Icon" className="h-20 w-20 text-muted-foreground" />
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col">
            <CardDescription>Total Queries</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {queriesCount}
            </CardTitle>
          </div>
          <img src="/queries.svg" alt="Queries Icon" className="h-20 w-20 text-muted-foreground" />
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col">
            <CardDescription>Total Maps</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {mapsCount}
            </CardTitle>
          </div>
          <img src="/maps.svg" alt="Maps Icon" className="h-20 w-20 text-muted-foreground" />
        </CardHeader>
      </Card>
    </div>
  );
}
