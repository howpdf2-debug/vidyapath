import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgPath = join(publicDir, 'icon.svg')

const svg = readFileSync(svgPath)

const targets = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
]

console.log('🎨 Generating icons...\n')

for (const { size, name } of targets) {
  const outPath = join(publicDir, name)
  await sharp(svg).resize(size, size).png().toFile(outPath)
  console.log(`✅ ${name} (${size}×${size})`)
}

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="240" font-family="system-ui,sans-serif" font-size="120" font-weight="900" text-anchor="middle" fill="white">VidyaPath</text>
  <text x="600" y="340" font-family="system-ui,sans-serif" font-size="42" text-anchor="middle" fill="#e0e7ff">Free Study Portal for Indian Students</text>
  <text x="600" y="430" font-family="system-ui,sans-serif" font-size="32" text-anchor="middle" fill="#c7d2fe">NCERT • State Boards • Sarkari Naukri • Exams</text>
</svg>`

await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile(join(publicDir, 'og-image.png'))
console.log(`✅ og-image.png (1200×630)`)

console.log('\n🎉 All icons generated!')