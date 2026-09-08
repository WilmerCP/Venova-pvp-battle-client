// Usage: node list-backgrounds.js path/to/backgrounds
const fs = require('fs')
const path = require('path')

const dir = process.argv[2] || './public/backgrounds'
const exts = /\.(png|jpe?g|webp|gif|avif)$/i

const files = fs.readdirSync(dir).filter(f => exts.test(f))

if (files.length === 0) {
  console.error(`No image files found in ${dir}`)
  process.exit(1)
}

const arrayLiteral = `const BACKGROUNDS = [\n${files.map(f => `  '${f}'`).join(',\n')}\n]`

console.log(arrayLiteral)
console.log(`\n// ${files.length} files found`)