import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Zalmi Marketing — SSR Spike' },
      {
        name: 'description',
        content: 'Synthetic public content for validating server rendering.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <section>
      <h1>Page not found</h1>
      <p>This route is intentionally missing from the synthetic SSR spike.</p>
    </section>
  )
}
