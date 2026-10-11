// Renders the page with the baked-in content into dist/index.html so the site paints instantly
// and search engines see real content. The browser then hydrates and pulls live Sheet data.
import { readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const { render } = await import(pathToFileURL('dist-ssr/entry-server.js').href)
const file = 'dist/index.html'
const html = await readFile(file, 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('Placeholder <!--app-html--> not found in dist/index.html')
await writeFile(file, html.replace('<!--app-html-->', render()))
await rm('dist-ssr', { recursive: true, force: true })
console.log('Prerendered dist/index.html')
