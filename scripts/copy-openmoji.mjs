// Copie uniquement les SVG OpenMoji référencés par src/words.js
// vers public/openmoji/<hex>.svg, pour garder le bundle léger.
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'openmoji-svg-color')
const dst = path.join(root, 'public', 'openmoji')

const { WORDS } = await import(url.pathToFileURL(path.join(root, 'src', 'words.js')).href)

fs.mkdirSync(dst, { recursive: true })

let ok = 0
const missing = []
for (const w of WORDS) {
  const from = path.join(src, `${w.hex}.svg`)
  const to = path.join(dst, `${w.hex}.svg`)
  if (!fs.existsSync(from)) {
    missing.push(`${w.id} (${w.hex})`)
    continue
  }
  fs.copyFileSync(from, to)
  ok++
}

console.log(`Copied: ${ok}/${WORDS.length}`)
if (missing.length) {
  console.log('Missing:')
  for (const m of missing) console.log('  -', m)
  process.exit(1)
}
