import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ location }) => {
    const auth = useAuthStore.getState();
    
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: DashboardLayout,
});
