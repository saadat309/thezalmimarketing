import { createFileRoute, notFound } from '@tanstack/react-router'

const sampleProperty = {
  slug: 'sample-residence',
  title: 'Sample Residence',
  location: 'Synthetic District',
  price: 'PKR 12,500,000',
}

export const Route = createFileRoute('/properties/$slug')({
  loader: ({ params }) => {
    if (params.slug !== sampleProperty.slug) throw notFound()
    return sampleProperty
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData.title} | Zalmi Marketing` },
      {
        name: 'description',
        content: `${loaderData.title} in ${loaderData.location}. Synthetic staging data.`,
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [
      {
        rel: 'canonical',
        href: `https://migration.local.invalid/properties/${loaderData.slug}/`,
      },
    ],
  }),
  component: PropertyPage,
})

function PropertyPage() {
  const property = Route.useLoaderData()

  return (
    <article>
      <p>Property detail · synthetic fixture</p>
      <h1>{property.title}</h1>
      <p>Location: {property.location}</p>
      <p>Sample price: {property.price}</p>
    </article>
  )
}
