import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider
import './index.css'
import { routeTree } from './routeTree.gen';

// Create a client
const queryClient = new QueryClient(); // Create QueryClient instance

const router = createRouter({
  routeTree,
  context: {
    queryClient, // Pass queryClient to the router context
  },
  defaultPreload: 'intent',
});



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}> {/* Wrap with QueryClientProvider */}
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
)
