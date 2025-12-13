import * as React from 'react'
import { useEffect } from 'react'
import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from '@/store/authStore'

export const Route = createRootRoute({
  component: RootComponent,
  staticData: {
    auth: null,
  },
  context: ({ auth }) => ({ auth }),
})

function RootComponent() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');
  const auth = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <React.Fragment>
      <div className="flex flex-col justify-between min-h-screen bg-background text-foreground">
      {!isAuthRoute && <Navbar/>}
      <Outlet context={{ auth }} />
      {!isAuthRoute && <Footer/>}
      <Toaster />
    </div>
      
    </React.Fragment>
  )
}
