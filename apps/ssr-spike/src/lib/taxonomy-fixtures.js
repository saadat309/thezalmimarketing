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

export const syntheticTaxonomy = Object.freeze({
  categories: [{ id: 1, slug: 'homes', name: 'Homes' }],
  cities: recordsFor('cities', groups.get('cities')),
  societies: recordsFor('societies', groups.get('societies')),
  phases: recordsFor('phases', groups.get('phases')),
  maps: syntheticMaps.map((map, index) => ({ ...map, id: index + 1 })),
})
