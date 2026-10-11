// Builds the site for the live domain and packages it for the person hosting it.
// Output: release/live2dance-waali-diwali-site.zip containing site/ and HOW-TO-UPLOAD.txt.
import { execSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const SITE_URL = process.env.SITE_URL ?? 'https://diwali.live2danceseattle.com'
const ZIP = 'live2dance-waali-diwali-site.zip'

execSync('npm run build', { stdio: 'inherit', env: { ...process.env, SITE_URL } })

const config = JSON.parse(await readFile('dist/site-config.json', 'utf8'))
if (!config.contentApiUrl) console.warn('\n⚠ site-config.json has no contentApiUrl: the admin will only offer preview mode.\n')

await rm('release', { recursive: true, force: true })
await mkdir('release/package', { recursive: true })
await cp('dist', 'release/package/site', { recursive: true })
await writeFile(
  'release/package/HOW-TO-UPLOAD.txt',
  [
    'Live2Dance Waali Diwali website',
    '',
    `1. Upload EVERYTHING inside the "site" folder to the web root for ${SITE_URL.replace(/^https?:\/\//, '')}`,
    '   so that index.html sits at the top level (e.g. public_html/index.html).',
    '2. Turn on HTTPS for the domain.',
    '',
    'These are plain static files: no server code, database or redirect rules are needed.',
    'Content is edited from the admin page (admin.html) and goes live immediately;',
    'you only need to re-upload if we send you a new version of this zip.',
    '',
  ].join('\r\n'),
)
// bsdtar ships with Windows 10+ and macOS and writes zip files with -a.
execSync(`tar -a -c -f ../${ZIP} *`, { cwd: 'release/package', stdio: 'inherit', shell: true })
await rm('release/package', { recursive: true, force: true })
console.log(`\nCreated release/${ZIP} for ${SITE_URL}`)
