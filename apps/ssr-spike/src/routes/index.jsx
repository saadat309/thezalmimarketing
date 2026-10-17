import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Staging SSR Home | Zalmi Marketing' },
      {
        name: 'description',
        content: 'A synthetic homepage used to test Workers SSR output.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <article>
      <p>Local runtime feasibility spike</p>
      <h1>Property marketing, rendered on the server</h1>
      <p>
        This visible content and route-specific metadata should be present in
        the first HTML response, before client JavaScript runs.
      </p>
      <a href="/properties/sample-residence/">Open synthetic property</a>
    </article>
  )
}
