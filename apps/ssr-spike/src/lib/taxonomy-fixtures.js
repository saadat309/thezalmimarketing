import { syntheticMaps } from './directory-fixtures.js'

const groups = new Map([
  ['cities', ['city', 'cityName']],
  ['societies', ['society', 'societyName']],
  ['phases', ['phase', 'phaseName']],
])

function recordsFor(domain, [slugKey, nameKey]) {
  const entries = new Map()
  for (const map of syntheticMaps) {
    if (!entries.has(map[slugKey])) entries.set(map[slugKey], map[nameKey])
  }
  return [...entries].map(([slug, name], index) => ({ id: index + 1, slug, name }))
}

const cities = recordsFor('cities', groups.get('cities'))
const societies = recordsFor('societies', groups.get('societies'))
const phases = recordsFor('phases', groups.get('phases'))
if (!cities.some((item) => item.slug === 'sample-city')) cities.push({ id: cities.length + 1, slug: 'sample-city', name: 'Sample City' })
if (!societies.some((item) => item.slug === 'sample-society')) societies.push({ id: societies.length + 1, slug: 'sample-society', name: 'Sample Society' })
if (!phases.some((item) => item.slug === 'phase-one')) phases.push({ id: phases.length + 1, slug: 'phase-one', name: 'Phase One' })

export const syntheticTaxonomy = Object.freeze({
  categories: [{ id: 1, slug: 'homes', name: 'Homes' }, { id: 2, slug: 'houses', name: 'Houses' }],
  cities,
  societies,
  phases,
  maps: syntheticMaps.map((map, index) => ({ ...map, id: index + 1 })),
})
