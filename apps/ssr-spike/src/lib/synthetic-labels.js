import { syntheticFiles } from './directory-fixtures.js'
import { syntheticProperties } from './property-fixtures.js'

export const syntheticLabels = [
  { slug: 'featured', name: 'Featured', is_badge: true, is_filter: true },
  { slug: 'new-listing', name: 'New Listing', is_badge: true, is_filter: true },
  { slug: 'hot-deal', name: 'Hot Deal', is_badge: true, is_filter: true },
]

export function publicLabels(labels = []) {
  return labels.map((assignment) => {
    const label = syntheticLabels.find((candidate) => candidate.slug === assignment.slug)
    return label ? { slug: label.slug, name: label.name, isBadge: label.is_badge } : null
  }).filter(Boolean)
}

export function createSyntheticLabel(name) {
  const base = name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'label'
  let slug = base
  let suffix = 2
  while (syntheticLabels.some((label) => label.slug === slug)) slug = `${base}-${suffix++}`
  const label = { slug, name, is_badge: true, is_filter: true }
  syntheticLabels.push(label)
  return label
}

export function removeSyntheticLabel(slug) {
  const index = syntheticLabels.findIndex((label) => label.slug === slug)
  if (index < 0) return false
  syntheticLabels.splice(index, 1)
  for (const property of syntheticProperties) property.labels = (property.labels || []).filter((label) => label.slug !== slug)
  for (const file of syntheticFiles) {
    if (file.adminForm) file.adminForm.labels = (file.adminForm.labels || []).filter((labelSlug) => labelSlug !== slug)
  }
  return true
}

export function updateSyntheticLabel(slug, fields) {
  const label = syntheticLabels.find((candidate) => candidate.slug === slug)
  if (!label) return null
  Object.assign(label, fields)
  return label
}
