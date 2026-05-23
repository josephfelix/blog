import { readdirSync, statSync, mkdirSync, copyFileSync } from 'fs'
import { join, relative, extname, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const contentDir = join(__dirname, '../src/content')
const destDir = join(__dirname, '../public/_content')

const SKIP_EXTENSIONS = new Set(['.md', '.mdx', '.ts', '.js', '.json'])

function copyAssets(dir) {
  for (const entry of readdirSync(dir)) {
    const src = join(dir, entry)
    if (statSync(src).isDirectory()) {
      copyAssets(src)
      continue
    }
    if (SKIP_EXTENSIONS.has(extname(entry).toLowerCase())) continue

    const rel = relative(contentDir, src)
    const dest = join(destDir, rel)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
    console.log(`copied: ${rel}`)
  }
}

copyAssets(contentDir)
