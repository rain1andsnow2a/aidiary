import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(here, '../../frontend')

const result = spawnSync('npm', ['run', 'build'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://yingjiapp.com',
  },
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
