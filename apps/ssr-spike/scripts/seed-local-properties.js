import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { syntheticFiles } from '../src/lib/directory-fixtures.js'
import { propertySeedSql } from '../src/lib/property-repository.js'

const appDirectory = fileURLToPath(new URL('../', import.meta.url))
const wranglerCli = fileURLToPath(import.meta.resolve('wrangler'))
const localDirectory = new URL('../.wrangler/', import.meta.url)
const localConfigDirectory = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))
const seedFile = new URL('../.wrangler/generated-property-seed.sql', import.meta.url)

await mkdir(localDirectory, { recursive: true })
const fileProperties = syntheticFiles.map((file, index) => ({
  id: 10000 + index,
  slug: file.slug,
  title: file.title,
  propertyType: 'Residential',
  purchaseType: 'sale',
  fileOnly: true,
  public: file.public,
  shortDescription: file.shortDescription || '',
  location: {
    address: file.address || '',
    city: file.city ? { slug: file.city, name: file.cityName } : null,
    society: file.society ? { slug: file.society, name: file.societyName } : null,
    phase: file.phase ? { slug: file.phase, name: file.phaseName } : null,
  },
  area: file.area,
  price: file.price?.amount || '0',
  labels: [],
  adminForm: { file_type: file.fileType, purchase_type: 'sale', is_furnished: true, labels: [] },
  createdAt: `${file.updatedAt}T00:00:00.000Z`,
}))
const fixtures = [...syntheticProperties, ...fileProperties]
await writeFile(seedFile, propertySeedSql(fixtures), { encoding: 'utf8' })
try {
  execFileSync(process.execPath, [
    wranglerCli,
    'd1', 'execute', 'zalmi-staging-local', '--local', '--file', fileURLToPath(seedFile),
  ], {
    cwd: appDirectory,
    env: { ...process.env, XDG_CONFIG_HOME: localConfigDirectory },
    stdio: ['ignore', 'ignore', 'inherit'],
  })
} finally {
  await rm(seedFile, { force: true })
}

console.log(`Seeded ${syntheticProperties.length} synthetic Property and ${fileProperties.length} synthetic File fixtures into local D1 (existing rows were left unchanged).`)
