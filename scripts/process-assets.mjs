// Turns the raw files in assets-src/ into web-ready images in public/media/.
// Run with: npm run assets
import sharp from 'sharp'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'assets-src'
const OUT = 'public/media'
await mkdir(`${OUT}/vendors`, { recursive: true })

// --- Poster logo: crop the marquee + arched wordmark and key out the purple sky ---
async function keyedPosterLogo() {
  const crop = { left: 215, top: 430, width: 870, height: 580 }
  const { data, info } = await sharp(`${SRC}/poster.jpg`)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const fade = 0.08
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4
      const r = data[i], g = data[i + 1], b = data[i + 2]
      const purpleness = Math.min(b - r, b - g)
      let a = Math.max(0, Math.min(1, 1 - (purpleness - 12) / 28))
      // Feather the borders so stray poster stars don't end in a hard edge.
      const ex = Math.min(x, info.width - 1 - x) / (info.width * fade)
      const ey = Math.min(y, info.height - 1 - y) / (info.height * fade)
      a *= Math.min(1, ex, ey)
      data[i + 3] = Math.round(a * 255)
    }
  }
  const png = await sharp(data, { raw: info }).png().toBuffer()
  await sharp(png).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/logo-diwali.webp`)
  await sharp(png).resize({ width: 480 }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-diwali-480.png`)
  return png
}

// --- Vendor logos: square tiles, padded on the logo's own background colour ---
const circleCrops = {
  'kathmandu-momocha': { left: 198, top: 172, size: 812 },
  'bhojwani-foods': { left: 203, top: 300, size: 800 },
}

async function cornerColour(file) {
  const { data } = await sharp(file).extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true })
  return { r: data[0], g: data[1], b: data[2], alpha: 1 }
}

async function vendorLogos() {
  const files = (await readdir(`${SRC}/vendors`)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  for (const file of files) {
    const slug = path.parse(file).name
    const src = `${SRC}/vendors/${file}`
    let img
    let background
    const circle = circleCrops[slug]
    if (circle) {
      const mask = Buffer.from(
        `<svg width="${circle.size}" height="${circle.size}"><circle cx="${circle.size / 2}" cy="${circle.size / 2}" r="${circle.size / 2 - 4}" fill="#fff"/></svg>`,
      )
      img = await sharp(src)
        .extract({ left: circle.left, top: circle.top, width: circle.size, height: circle.size })
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer()
      background = { r: 255, g: 255, b: 255, alpha: 1 }
    } else {
      background = await cornerColour(src)
      img = await sharp(src).trim({ threshold: 18 }).toBuffer()
    }
    await sharp(img)
      .resize(400, 400, { fit: 'contain', background })
      .extend({ top: 56, bottom: 56, left: 56, right: 56, background })
      .flatten({ background })
      .webp({ quality: 86 })
      .toFile(`${OUT}/vendors/${slug}.webp`)
    console.log('vendor logo', slug)
  }
}

// --- Team Sathe ---
// Un-premultiplies against white so the black-and-red logo sits on any light background.
async function whiteToAlpha(input) {
  const { data, info } = await sharp(input).flatten({ background: '#ffffff' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    const a = 255 - Math.min(data[i], data[i + 1], data[i + 2])
    if (a === 0) {
      data[i + 3] = 0
      continue
    }
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(Math.max(0, Math.min(255, ((data[i + c] - (255 - a)) / a) * 255)))
    data[i + 3] = a
  }
  return sharp(data, { raw: info }).png().toBuffer()
}

async function teamSathe() {
  const trimmed = await sharp(`${SRC}/team-sathe-logo.png`).flatten({ background: '#ffffff' }).trim({ threshold: 10 }).toBuffer()
  await sharp(await whiteToAlpha(trimmed)).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}/team-sathe-logo.webp`)
  await sharp(`${SRC}/team-sathe-photo.jpg`).resize({ height: 1000 }).webp({ quality: 82 }).toFile(`${OUT}/team-sathe-photo.webp`)
}

// --- Poster + social share image ---
async function posterAndOg(logoPng) {
  await sharp(`${SRC}/poster.jpg`).resize({ width: 1000 }).webp({ quality: 82 }).toFile(`${OUT}/poster.webp`)
  await sharp(`${SRC}/poster.jpg`).resize({ width: 1000 }).jpeg({ quality: 85, mozjpeg: true }).toFile(`${OUT}/poster.jpg`)

  const W = 1200, H = 630
  const bg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="38%" r="75%">
          <stop offset="0" stop-color="#5a2a9c"/>
          <stop offset="0.6" stop-color="#2f1663"/>
          <stop offset="1" stop-color="#170a35"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="0" y="${H - 96}" width="${W}" height="96" fill="#e0237a"/>
      <text x="${W / 2}" y="${H - 38}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="34" fill="#fff6d8">SAT, OCT 24 · 12–6 PM · 415 WESTLAKE, SEATTLE</text>
    </svg>`)
  const logo = await sharp(logoPng).resize({ height: 500 }).toBuffer()
  const meta = await sharp(logo).metadata()
  await sharp(bg)
    .composite([{ input: logo, top: 14, left: Math.round((W - meta.width) / 2) }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(`${OUT}/og-image.jpg`)
}

const logoPng = await keyedPosterLogo()
await vendorLogos()
await teamSathe()
await posterAndOg(logoPng)
console.log('done')
