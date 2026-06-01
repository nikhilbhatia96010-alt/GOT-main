const fs = require('node:fs')
const path = require('node:path')

const projectDir = path.resolve(__dirname, '..')
const rootDir = path.resolve(projectDir, '..')
const distDir = path.join(projectDir, 'dist')

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('dist/index.html not found. Run npm.cmd run build first.')
}

for (const name of ['assets', 'images', 'video', 'favicon.svg', 'icons.svg']) {
  const from = path.join(distDir, name)
  const to = path.join(rootDir, name)

  if (fs.existsSync(from)) {
    fs.rmSync(to, { recursive: true, force: true })
    fs.cpSync(from, to, { recursive: true, force: true })
  }
}

let html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
html = html.replace(
  /<script type="module" crossorigin src="([^"]+)"><\/script>/,
  '<script defer src="$1"></script>'
)
html = html.replace(/\s+crossorigin(?=[\s>])/g, '')

fs.writeFileSync(path.join(rootDir, 'index.html'), html)

console.log(`Published direct-open index to ${path.join(rootDir, 'index.html')}`)
