import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { SectionCards } from '@/components/dashboard/section-cards';
import { usePropertiesStore } from '@/store/propertiesStore';
import { useFilesStore } from '@/store/filesStore';
import { useQueriesStore } from '@/store/queriesStore';
import { useMapsStore } from '@/store/mapsStore';

export const Route = createFileRoute('/dashboard/')({
    component: DashboardIndex,
    staticData: {
      title: 'Dashboard',
    },
});

function DashboardIndex() {
    const propertiesCount = usePropertiesStore((state) => state.getPropertiesCount());
    const filesCount = useFilesStore((state) => state.getFilesCount());
    const queries = useQueriesStore((state) => state.queries);
    const queriesCount = queries.length;
    const mapsCount = useMapsStore((state) => state.getMapsCount()); // Get mapsCount

    const queryChartConfig = {
        totalQueries: {
          label: "Total Queries",
          theme: {
            light: "oklch(0.398 0.07 227.392)",
            dark: "oklch(0.488 0.243 264.376)",
          },
        },
      };

    const queryChartData = React.useMemo(() => {
      const dailyCounts = queries.reduce((acc, query) => {
        const date = query.changed_at.split(' ')[0]; // Extract date part (YYYY-MM-DD)
        if (!acc[date]) {
          acc[date] = { date, totalQueries: 0, unreadQueries: 0 };
        }
        acc[date].totalQueries++;
        if (!query.isRead) {
          acc[date].unreadQueries++;
        }
        return acc;
      }, {});

      const sortedData = Object.values(dailyCounts).sort((a, b) => new Date(a.date) - new Date(b.date));

      return sortedData;
    }, [queries]);

    return (
        <div className="flex flex-col flex-1 gap-8 py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Welcome to your Dashboard!</h1>
            <SectionCards
                propertiesCount={propertiesCount}
                filesCount={filesCount}
                queriesCount={queriesCount}
                mapsCount={mapsCount} // Pass mapsCount
            />
            <ChartAreaInteractive
                data={queryChartData}
                chartConfig={queryChartConfig}
                title="Total Queries"
                description="Total queries for the last 3 months"
                referenceDate={new Date()}
            />
        </div>
    );
}