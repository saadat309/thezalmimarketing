const MAX_BYTES = {
  image: 10 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  pdf: 100 * 1024 * 1024,
}

const TYPES = {
  image: new Set(['image/jpeg', 'image/png', 'image/webp']),
  video: new Set(['video/mp4', 'video/webm']),
  pdf: new Set(['application/pdf']),
}

const mediaRecords = new Map()
const mediaBytes = new Map()

export function createLocalMediaStorage() {
  return {
    list(ownerType, ownerId) {
      return [...mediaRecords.values()]
        .filter((item) => item.ownerType === ownerType && item.ownerId === String(ownerId))
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        .map(publicMedia)
    },

    async put({ ownerType, ownerId, kind, file }) {
      const validation = validateMedia({ ownerType, ownerId, kind, file })
      if (validation.error) return { error: validation.error }
      const id = crypto.randomUUID()
      const record = {
        id, ownerType, ownerId: String(ownerId), kind,
        filename: safeFilename(file.name), contentType: file.type,
        size: file.size, createdAt: new Date().toISOString(),
      }
      mediaRecords.set(id, record)
      mediaBytes.set(id, new Uint8Array(await file.arrayBuffer()))
      return { item: publicMedia(record) }
    },

    remove(id) {
      const existed = mediaRecords.delete(String(id))
      mediaBytes.delete(String(id))
      return existed
    },

    hasBytes(id) {
      return mediaBytes.has(String(id))
    },

    clear() {
      mediaRecords.clear()
      mediaBytes.clear()
    },
  }
}

export function validateMedia({ ownerType, ownerId, kind, file }) {
  if (!['property', 'file', 'map', 'category'].includes(ownerType) || !String(ownerId || '').trim()) return { error: 'A valid local media owner is required.' }
  if (!Object.hasOwn(MAX_BYTES, kind) || !TYPES[kind].has(file?.type)) return { error: `Unsupported ${kind} media type.` }
  if (!file?.name || file.size <= 0) return { error: 'The selected media file is empty.' }
  if (file.size > MAX_BYTES[kind]) return { error: `The selected ${kind} exceeds the local staging size limit.` }
  return { ok: true }
}

function safeFilename(name) {
  return String(name || 'upload').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'upload'
}

function publicMedia(item) {
  return { ...item }
}

export const localMediaLimits = Object.freeze({ ...MAX_BYTES })
