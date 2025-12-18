import * as React from 'react'
import { useEffect } from 'react'
import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from '@/store/authStore'
import NotFound from '@/components/global/NotFound'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
  staticData: {
    auth: null,
  },
  context: ({ auth }) => ({ auth }),
})

function RootComponent() {
  const location = useLocation();
  const shouldHideNavbarAndFooter =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/accept-invite") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/accept-invite") ||
    location.pathname.startsWith("/forgot-password")
    ;
  const auth = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <React.Fragment>
      <div className="flex flex-col justify-between min-h-screen bg-background text-foreground">
      {!shouldHideNavbarAndFooter && <Navbar/>}
      <Outlet context={{ auth }} />
      {!shouldHideNavbarAndFooter && <Footer/>}
      <Toaster />
    </div>
      
    </React.Fragment>
  )
}
