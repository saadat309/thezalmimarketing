import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider
import './index.css'
import { routeTree } from './routeTree.gen';

// Pre-load logic or other sync initialization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Help with intermittent load failures
      staleTime: 5 * 60 * 1000,
    },
  },
});

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
});

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Ensure the styles are applied before React even mounts
document.body.style.backgroundColor = '#0A0F1D';
if (rootElement) {
  rootElement.style.backgroundColor = '#0A0F1D';
  rootElement.style.minHeight = '100vh';
}

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
);

