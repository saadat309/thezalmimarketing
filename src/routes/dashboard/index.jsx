import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { SectionCards } from '@/components/dashboard/section-cards';
import { usePropertiesStore } from '@/store/propertiesStore';
import { useFilesStore } from '@/store/filesStore';
import { useMapsStore } from '@/store/mapsStore';
import { Spinner } from '@/components/ui/spinner'; // Assuming Spinner is available
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/dashboard/')({
    component: DashboardIndex,
    staticData: {
      title: 'Dashboard',
    },
});

function DashboardIndex() {
    const { token } = useAuthStore();

    const [counts, setCounts] = React.useState({
        properties: 0,
        files: 0,
        maps: 0,
        queries: 0
    });
    const [totalQueries, setTotalQueries] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Fetch dashboard data
    React.useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [availableItemsRes, queriesRes] = await Promise.all([
                    fetch('/api/landing-available-items', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('/api/queries', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!availableItemsRes.ok || !queriesRes.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const availableItems = await availableItemsRes.json();
                const queries = await queriesRes.json();

                setTotalQueries(queries);
                setCounts({
                    properties: availableItems.properties?.length || 0,
                    files: availableItems.files?.length || 0,
                    maps: availableItems.maps?.length || 0,
                    queries: queries.length
                });
            } catch (e) {
                setError(e.message);
                toast.error("Failed to load dashboard data: " + e.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

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
      const dailyCounts = totalQueries.reduce((acc, query) => {
        const date = query.created_at.split(' ')[0];
        if (!acc[date]) {
          acc[date] = { date, totalQueries: 0, unreadQueries: 0 };
        }
        acc[date].totalQueries++;
        if (!query.is_read) {
          acc[date].unreadQueries++;
        }
        return acc;
      }, {});

      return Object.values(dailyCounts).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [totalQueries]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
          <p className="ml-2">Loading dashboard data...</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="p-4 text-center text-red-500">
          Error loading dashboard: {error}
        </div>
      );
    }

    return (
        <div className="flex flex-col flex-1 gap-8 py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Welcome to your Dashboard!</h1>
            <SectionCards
                propertiesCount={counts.properties}
                filesCount={counts.files}
                queriesCount={counts.queries}
                mapsCount={counts.maps}
            />
            <ChartAreaInteractive
                data={queryChartData}
                chartConfig={queryChartConfig}
                title="Total Queries"
                description="Overview of customer queries over time"
                referenceDate={new Date()}
            />
        </div>
    );
}