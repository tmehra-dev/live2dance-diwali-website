# Live2Dance Waali Diwali · website

The one-page site for **Live2Dance Waali Diwali**, Seattle's biggest Diwali Mela (Sat, Oct 24, 2026 · 12–6 PM · 415 Westlake), presented by Live2Serve Foundation, at **https://diwali.live2danceseattle.com**. Tickets are sold on [TicketLeap](https://events.ticketleap.com/tickets/live2serve/l2dwalidiwali).

- **Public site** (`index.html`): hero with countdown, tickets and arrival slots, Watch (performances), Indulge (food), Shop (vendors), Do, Team Sathe, Give, Visit and FAQ, About. It switches to "The Mela is on now!" during the event and a thank-you after.
- **Admin** (`admin.html`, or tap the diya in the footer five times): password login. Edit any text, links, partner content, section order, vendors, performances (with logo/photo uploads), activities and FAQs; import vendors or performances from a CSV or Google Sheet; publish; roll back.
- **Content** lives in a private Google Sheet, served by a small Google Apps Script (`apps-script/`). Uploaded images are stored on the `media-uploads` branch of this repo and served from the jsDelivr CDN. The built site is plain static files, so it runs on any host.

## For the person hosting the domain

1. Unzip the release and upload **everything inside it** to the web root for `diwali.live2danceseattle.com` (so `index.html` is at the top level). It is plain HTML/CSS/JS/images: no server, database or PHP needed, and no redirect rules.
2. Turn on HTTPS.

That's it. Content changes made in the admin appear on the live site immediately, with **no re-upload**. You only need to upload again if the site's code or design changes.

## How it's wired

| Piece | Where |
| --- | --- |
| Content Sheet | Google Sheet "Waali Diwali Website Content" (owner: tmehrasec@gmail.com). Tabs: Settings, Sections, Vendors, Performances, Activities, FAQ, hidden `_History`. |
| Backend | Apps Script bound to that Sheet, deployed as a web app. Its `/exec` URL is in `public/site-config.json`. |
| Admin password | Set from the Sheet: **Website admin → Set admin password** (or change it in the admin panel). Stored as a salted hash in the script's properties. |
| Image uploads | Committed by the script to the `media-uploads` branch using a fine-grained GitHub token (Contents: read & write on this repo only), saved via **Website admin → Set image upload token**. Links are pinned to the commit on jsDelivr. |

Sessions last 6 hours. After 8 wrong passwords, logins pause for 15 minutes.

### Setting it up from scratch (if the Sheet is ever recreated)

1. Enable the Apps Script API at <https://script.google.com/home/usersettings>.
2. `npx @google/clasp login`, then `npx @google/clasp create-script --type sheets --title "Waali Diwali Website Content" --rootDir apps-script` (restore `apps-script/appsscript.json` from git afterwards: clasp overwrites it).
3. `npx @google/clasp push --force` and `npx @google/clasp create-deployment`. Put `https://script.google.com/macros/s/<deployment id>/exec` in `public/site-config.json`.
4. In the Apps Script editor, run `checkImageUploads` once to grant permissions. In the Sheet, use **Website admin → Set admin password** and **Set image upload token**.
5. Open `/admin.html`, sign in, and press **Fill the Sheet** to copy the built-in content into it.

To ship backend changes later without changing the URL: `npx @google/clasp push --force` then `npx @google/clasp update-deployment <deployment id>`.

## Using the admin

- **Live controls** (Dashboard): announcement bar, ticket sales open, sold out, event-day mode, "on stage now" override.
- **Vendors / Performances**: add, edit, hide or delete entries; **Upload image** sets a vendor logo or performer photo. **Import CSV / Sheet** reads the registration sheet (CSV upload or link). Phone numbers, emails, permits and other private answers are dropped before anything is saved, and the "Paid" column decides who is shown. *Merge* keeps edits you've made to names, descriptions and logos.
- **Publish** saves your changes; the live site shows them immediately (open pages refresh within a minute, or when the tab is reopened). Every publish backs up the tab first; **History** restores an earlier version.
- If `site-config.json` has no backend URL, the admin offers **preview mode**, which saves only in your own browser.

## Developing

Requires Node 22.18+ (the `check` and `seed` scripts run TypeScript directly).

```bash
npm install
npm run dev        # http://localhost:5173 (admin at /admin.html)
npm run check      # importer + schedule logic checks
npm run release    # production build for diwali.live2danceseattle.com → release/live2dance-waali-diwali-site.zip
```

| Script | What it does |
| --- | --- |
| `npm run build` | Builds `dist/`, prerendering the page with the built-in content. Set `SITE_URL` for canonical and social-preview URLs. |
| `npm run assets` | Rebuilds `public/media/` from `assets-src/` (poster logo cut-out, vendor logo tiles, Team Sathe images, social preview). |
| `npm run seed -- <registrations.csv>` | Regenerates the vendor list baked into the build (`src/content/vendors.seed.json`) from the registration sheet, using the same importer as the admin. |

Built-in defaults (used if the Sheet is ever empty or unreachable) live in `src/content/defaults.ts`.
