import * as React from 'react'
import { useEffect } from 'react'
import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'


export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <React.Fragment>
      <div className="flex flex-col justify-between min-h-screen bg-background text-foreground">
      <Navbar/>
      <Outlet />
      <Footer/>
    </div>
      
    </React.Fragment>
  )
}
