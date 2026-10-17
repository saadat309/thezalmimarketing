import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const localConfigHome = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url))
const child = spawn(process.execPath, [viteCli, ...process.argv.slice(2)], {
  env: { ...process.env, XDG_CONFIG_HOME: localConfigHome },
  stdio: 'inherit',
})

child.on('error', (error) => {
  console.error(`Could not start local Vite: ${error.message}`)
  process.exitCode = 1
})

child.on('exit', (code, signal) => {
  let cleanupFailed = false
  if (process.argv[2] === 'build') {
    for (const file of ['../dist/server/.dev.vars', '../dist/client/.dev.vars']) {
      try {
        rmSync(fileURLToPath(new URL(file, import.meta.url)))
        console.log('Removed local development secrets from build output.')
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('Could not remove a local secret file from build output.')
          cleanupFailed = true
        }
      }
    }
  }

  if (signal) {
    console.error(`Local Vite exited after signal ${signal}.`)
    process.exitCode = 1
    return
  }

  process.exitCode = cleanupFailed ? 1 : code ?? 1
})
