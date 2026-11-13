// Usage: node process.cjs <source.png> <public dir>
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const [, , src, pub] = process.argv
const out = path.join(pub, 'images')
fs.mkdirSync(out, { recursive: true })

// Full photo, trimmed to a square (crop boxes are for IMG_20261114_035408.png, 1543x1672)
const portrait = { left: 215, top: 240, width: 1150, height: 1150 }
// Tight face crop for the chat avatar
const face = { left: 560, top: 485, width: 460, height: 460 }

const hex = (s) =>
  Buffer.from(`<svg width="${s}" height="${s}"><polygon points="${s / 2},0 ${s},${s / 4} ${s},${(3 * s) / 4} ${s / 2},${s} 0,${(3 * s) / 4} 0,${s / 4}" fill="#fff"/></svg>`)

;(async () => {
  for (const w of [800, 480]) {
    await sharp(src).extract(portrait).resize(w, w).webp({ quality: 82 }).toFile(path.join(out, `yash-portrait-${w}.webp`))
  }
  await sharp(src).extract(portrait).resize(800, 800).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(out, 'yash-portrait-800.jpg'))
  await sharp(src).extract(face).resize(160, 160).webp({ quality: 80 }).toFile(path.join(out, 'yash-avatar.webp'))

  // ── Open Graph image 1200×630 ──
  const P = 470
  const photoHex = await sharp(src)
    .extract(portrait).resize(P, P)
    .modulate({ saturation: 0.9 })
    .composite([{ input: hex(P), blend: 'dest-in' }])
    .png().toBuffer()

  const bg = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#00F0FF"/><stop offset=".55" stop-color="#8B5CF6"/><stop offset="1" stop-color="#FF2E97"/>
      </linearGradient>
      <radialGradient id="o1" cx=".82" cy=".45" r=".5"><stop offset="0" stop-color="#8B5CF6" stop-opacity=".55"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/></radialGradient>
      <radialGradient id="o2" cx=".05" cy=".95" r=".5"><stop offset="0" stop-color="#00F0FF" stop-opacity=".28"/><stop offset="1" stop-color="#00F0FF" stop-opacity="0"/></radialGradient>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#00F0FF" stroke-opacity=".07"/></pattern>
    </defs>
    <rect width="1200" height="630" fill="#05060A"/>
    <rect width="1200" height="630" fill="url(#grid)"/>
    <rect width="1200" height="630" fill="url(#o1)"/>
    <rect width="1200" height="630" fill="url(#o2)"/>
    <text x="72" y="190" font-family="Consolas, Courier New, monospace" font-size="24" fill="#00F0FF">&gt; whoami</text>
    <text x="72" y="285" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="82" fill="#E8F0FF">Yash Sharma</text>
    <rect x="72" y="312" width="220" height="6" rx="3" fill="url(#g)"/>
    <text x="72" y="380" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#B9C6DE">Backend &amp; AI Engineer</text>
    <text x="72" y="432" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#8A97B1">FastAPI · RAG · LangGraph · On-device AI</text>
    <text x="72" y="545" font-family="Consolas, Courier New, monospace" font-size="20" fill="#8A97B1">github.com/Yash-041</text>
  </svg>`)

  const ring = Buffer.from(`
  <svg width="${P + 40}" height="${P + 40}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00F0FF"/><stop offset=".5" stop-color="#8B5CF6"/><stop offset="1" stop-color="#FF2E97"/></linearGradient></defs>
    <polygon transform="translate(20 20)" points="${P / 2},0 ${P},${P / 4} ${P},${(3 * P) / 4} ${P / 2},${P} 0,${(3 * P) / 4} 0,${P / 4}" fill="none" stroke="url(#r)" stroke-width="4"/>
  </svg>`)

  const px = 1200 - P - 70
  const py = Math.round((630 - P) / 2)
  await sharp(bg)
    .composite([
      { input: photoHex, left: px, top: py },
      { input: ring, left: px - 20, top: py - 20 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, 'og-image.png'))

  for (const f of fs.readdirSync(out)) console.log('images/' + f, fs.statSync(path.join(out, f)).size)
  console.log('og-image.png', fs.statSync(path.join(pub, 'og-image.png')).size)
})().catch((e) => { console.error(e); process.exit(1) })
