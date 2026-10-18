import { execFileSync } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { syntheticQuerySeedSql } from '../src/lib/query-repository.js'

const appDirectory = fileURLToPath(new URL('../', import.meta.url))
const wranglerCli = fileURLToPath(import.meta.resolve('wrangler'))
const localConfigDirectory = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))
const seedFile = new URL('../.wrangler/generated-query-seed.sql', import.meta.url)
await mkdir(new URL('../.wrangler/', import.meta.url), { recursive: true })
await writeFile(seedFile, syntheticQuerySeedSql, { encoding: 'utf8' })
try {
  execFileSync(process.execPath, [wranglerCli, 'd1', 'execute', 'zalmi-staging-local', '--local', '--file', fileURLToPath(seedFile)], {
    cwd: appDirectory,
    env: { ...process.env, XDG_CONFIG_HOME: localConfigDirectory },
    stdio: ['ignore', 'ignore', 'inherit'],
  })
} finally {
  await rm(seedFile, { force: true })
}
console.log('Seeded fictional Query examples into local D1; no contact submissions were imported.')
