import * as React from 'react'
import { useEffect } from 'react'
import { Outlet, createRootRoute, useLocation, HeadContent, Scripts } from '@tanstack/react-router'
import Navbar from '@/components/home/Navbar'
import Footer from '@/components/home/Footer'
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from '@/store/authStore'
import NotFound from '@/components/global/NotFound'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
  head: ({ location }) => {
    const canonicalUrl = `https://thezalmimarketing.com${location.pathname === '/' ? '' : location.pathname}`;
    return {
      meta: [
        {
          title: 'The Zalmi Marketing | Best Real Estate Agency in Lahore & DHA Pakistan',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content: "The Zalmi Marketing is Lahore's leading real estate agency specializing in DHA Lahore, DHA projects nationwide, residential plots, and commercial properties. Trusted real estate experts in Lahore since 2020.",
        },
        {
          name: 'keywords',
          content: 'Real Estate Lahore, DHA Lahore, Property in Lahore, DHA Islamabad, DHA Karachi, Buy Plot in Lahore, Zalmi Marketing Lahore, Real Estate Investment Pakistan',
        },
        {
          name: 'author',
          content: 'The Zalmi Marketing',
        },
        {
          name: 'robots',
          content: 'index, follow',
        },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://thezalmimarketing.com/' },
        { property: 'og:title', content: 'The Zalmi Marketing | Best Real Estate Agency in Lahore & DHA Pakistan' },
        { property: 'og:description', content: 'Looking for property in Lahore? The Zalmi Marketing specializes in DHA Lahore and premium real estate across Pakistan.' },
        { property: 'og:image', content: 'https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://thezalmimarketing.com/' },
        { name: 'twitter:title', content: 'The Zalmi Marketing | Best Real Estate Agency in Lahore & DHA Pakistan' },
        { name: 'twitter:description', content: 'Looking for property in Lahore? The Zalmi Marketing specializes in DHA Lahore and premium real estate across Pakistan.' },
        { name: 'twitter:image', content: 'https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp' },
      ],
      links: [
        { rel: 'canonical', href: canonicalUrl },
      ],
      
    }
  },
  staticData: {
    auth: null,
  },
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

  // Google Analytics Page View Tracking
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag("config", "G-NGRY91WE1N", {
        page_path: location.href,
      });
    }
  }, [location.href]);

  return (
    <React.Fragment>
      <HeadContent />
      <div className="flex flex-col justify-between min-h-screen bg-background text-foreground">
      {!shouldHideNavbarAndFooter && <Navbar/>}
      <Outlet context={{ auth }} />
      {!shouldHideNavbarAndFooter && <Footer/>}
      <Toaster />
    </div>
      <Scripts />
    </React.Fragment>
  )
}