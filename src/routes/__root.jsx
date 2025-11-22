import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'


export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
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
