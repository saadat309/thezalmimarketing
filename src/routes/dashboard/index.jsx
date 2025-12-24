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
import { apiFetch } from '@/lib/apiClient';

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
                  apiFetch("/landing-available-items"),
                  apiFetch("/queries"),
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
        if (!query.created_at) return acc;
        
        // MySQL format: YYYY-MM-DD HH:MM:SS
        // Replace space with T to make it a valid ISO-like string for constructor
        const dateObj = new Date(query.created_at.replace(' ', 'T'));
        
        if (isNaN(dateObj.getTime())) return acc;

        // Group by Pakistani Date (YYYY-MM-DD)
        const pkDate = dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); 

        if (!acc[pkDate]) {
          acc[pkDate] = { date: pkDate, totalQueries: 0, unreadQueries: 0 };
        }
        acc[pkDate].totalQueries++;
        if (!query.is_read) {
          acc[pkDate].unreadQueries++;
        }
        return acc;
      }, {});

      return Object.values(dailyCounts)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        <div className="flex flex-col flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
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