import { Outlet, useMatches } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useQueriesStore } from '@/store/queriesStore';
import { useAuthStore } from '@/store/authStore';

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutContent />
    </SidebarProvider>
  );
}

function AppLayoutContent() {
  const { open, isMobile } = useSidebar();
  const matches = useMatches();
  const title = matches.at(-1)?.staticData?.title;
  const { token, login } = useAuthStore();
  const fetchUnreadCount = useQueriesStore(state => state.fetchUnreadCount);

  // Fetch current user profile to ensure state is fresh
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          login(token, data);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchProfile();
  }, [token, login]);

  // Initialize and Poll for Unread Queries (Real-time update)
  useEffect(() => {
    if (token) {
      // Initial fetch
      fetchUnreadCount(token);

      // Poll every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount(token);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  return (
    <>
      <AppSidebar />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-200 ease-linear",
          !isMobile && open ? "md:ml-(--sidebar-width)" : "md:ml-0"
        )}
      >
        <SiteHeader title={title} />
        <Separator className="shrink-0" />
        <main className="flex flex-col flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </>
  );
}
