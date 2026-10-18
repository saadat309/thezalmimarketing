import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { syntheticProperties } from '../src/lib/property-fixtures.js'
import { propertySeedSql } from '../src/lib/property-repository.js'

const appDirectory = fileURLToPath(new URL('../', import.meta.url))
const wranglerCli = fileURLToPath(import.meta.resolve('wrangler'))
const localDirectory = new URL('../.wrangler/', import.meta.url)
const localConfigDirectory = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))
const seedFile = new URL('../.wrangler/generated-property-seed.sql', import.meta.url)

await mkdir(localDirectory, { recursive: true })
await writeFile(seedFile, propertySeedSql(syntheticProperties), { encoding: 'utf8' })
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

console.log(`Seeded ${syntheticProperties.length} synthetic property fixtures into local D1 (existing rows were left unchanged).`)
