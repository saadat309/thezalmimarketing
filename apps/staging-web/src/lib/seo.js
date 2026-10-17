const stagingOrigin = (import.meta.env.VITE_CANONICAL_ORIGIN || 'http://localhost:4174').replace(/\/$/, '');

export function setPageMetadata({ title, description, canonicalPath, robots = 'index, follow' }) {
  document.title = title;
  updateMeta('description', description);
  updateMeta('robots', robots);
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = `${stagingOrigin}${canonicalPath}`;
}

function updateMeta(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.append(element);
  }
  element.content = content;
}
