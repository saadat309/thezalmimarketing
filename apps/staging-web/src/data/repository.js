import { categories, files, maps, properties } from './fixtures.js';

export function listProperties(category) {
  return category && categories.includes(category)
    ? properties.filter((property) => property.category === category)
    : properties;
}

export function findProperty(slug) {
  return properties.find((property) => property.slug === slug) ?? null;
}

export function listCategories() {
  return categories;
}

export function listMaps() {
  return maps;
}

export function listFiles() {
  return files;
}
