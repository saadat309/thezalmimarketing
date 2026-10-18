import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { syntheticFiles } from '../src/lib/directory-fixtures.js'
import { directorySeedSql } from '../src/lib/directory-repository.js'
import { syntheticTaxonomy } from '../src/lib/taxonomy-fixtures.js'
import { taxonomySeedSql } from '../src/lib/taxonomy-repository.js'

const appDirectory = fileURLToPath(new URL('../', import.meta.url))
const wranglerCli = fileURLToPath(import.meta.resolve('wrangler'))
const localDirectory = new URL('../.wrangler/', import.meta.url)
const localConfigDirectory = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))
const seedFile = new URL('../.wrangler/generated-directory-seed.sql', import.meta.url)
const fixtures = [
  ...syntheticFiles.map((record) => ({ kind: 'files', record })),
]

await mkdir(localDirectory, { recursive: true })
await writeFile(seedFile, `${taxonomySeedSql(syntheticTaxonomy)}\n${directorySeedSql(fixtures)}`, { encoding: 'utf8' })
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

console.log(`Seeded ${syntheticTaxonomy.maps.length} synthetic schema-aligned maps and ${fixtures.length} synthetic file fixtures into local D1 (existing rows were left unchanged).`)
