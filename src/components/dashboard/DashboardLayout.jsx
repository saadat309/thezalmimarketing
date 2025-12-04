import { Outlet, useMatches } from '@tanstack/react-router';
import { AppSidebar } from './app-sidebar';
import { SiteHeader } from './site-header';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

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
