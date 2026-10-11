# Live2Dance Waali Diwali · website

The one-page site for **Live2Dance Waali Diwali**, Seattle's biggest Diwali Mela (Sat, Oct 24, 2026 · 12–6 PM · 415 Westlake), presented by Live2Serve Foundation. Tickets are sold on [TicketLeap](https://events.ticketleap.com/tickets/live2serve/l2dwalidiwali).

- **Public site** (`index.html`): hero with countdown, tickets and arrival slots, Watch (performances), Indulge (food), Shop (vendors), Do, Team Sathe, Give, Visit and FAQ, About. It switches to "The Mela is on now!" during the event and a thank-you after.
- **Admin** (`admin.html`): opened by tapping the diya in the footer five times. Edit any text, links, partner content, section order, vendors, performances, activities and FAQs; import vendors or performances from a CSV or Google Sheet; publish; roll back.
- **Content** lives in a Google Sheet, served by a small Google Apps Script (`apps-script/`). The built site is plain static files, so it runs on any host.

## For the person hosting the domain

1. Upload the **contents** of the `dist/` folder to the web root (the folder that serves `https://your-domain/`). It is plain HTML/CSS/JS/images: no server, database or PHP needed, and no redirect rules.
2. Turn on HTTPS.
3. Point `www` at the bare domain (or the other way round).

That's it. Content changes made in the admin or the Sheet appear on the live site within about a minute, with **no re-upload**. You only need to upload again if the site's code or design changes.

## One-time setup: the content Sheet (about 15 minutes)

The site works without this (it uses the content built into it), but the admin needs it to save changes for everyone.

1. **Create the Sheet.** In Google Drive, create a spreadsheet named e.g. "Waali Diwali Website Content" (owned by the Live2Serve Google account).
2. **Add the script.** In the Sheet: *Extensions → Apps Script*. Replace `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs). In *Project Settings*, tick "Show appsscript.json" and replace it with [`apps-script/appsscript.json`](apps-script/appsscript.json).
3. **Create a Google sign-in client.** In [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials): *Create credentials → OAuth client ID → Web application*. Under *Authorised JavaScript origins* add `https://your-domain` (and `http://localhost:5173` for local testing). Copy the **Client ID**.
4. **Tell the script the client ID.** In Apps Script *Project Settings → Script properties*, add `GOOGLE_CLIENT_ID` = the client ID.
5. **Run setup.** In the editor choose `setup` and press *Run* (approve the permissions). This creates the tabs, an `Admins` tab with your email, and a Drive folder for uploaded images. Add other admins' Google emails to the `Admins` tab.
6. **Publish the script.** *Deploy → New deployment → Web app*, Execute as **Me**, Who has access **Anyone**. Copy the **Web app URL**.
7. **Connect the website.** Edit `site-config.json` (next to `index.html` on the host, or `public/site-config.json` before building):

   ```json
   { "contentApiUrl": "https://script.google.com/macros/s/…/exec", "googleClientId": "….apps.googleusercontent.com" }
   ```

8. Open `https://your-domain/admin.html`, sign in, and press **Fill the Sheet** to copy the current website content into the Sheet.

After step 8 you can also edit the Sheet tabs directly. The admin is just a friendlier way to do the same thing.

If you change `Code.gs` later, use *Deploy → Manage deployments → Edit → New version* so the URL stays the same.

## Using the admin

- **Get in:** tap the small diya at the bottom-right of the footer five times, or go to `/admin.html`.
- **Live controls** (Dashboard): announcement bar, ticket sales open, sold out, event-day mode, "on stage now" override.
- **Vendors → Import CSV / Sheet:** upload the registration sheet as CSV, or paste its Google Sheets link (only readable by your Apps Script, so the sheet stays private). Phone numbers, emails, permits, electricity needs and other private answers are dropped before anything is saved. The "Paid" column decides who is shown. *Merge* keeps edits you've made to names, descriptions and logos.
- **Performances → Import:** any CSV with columns like `title, performer, type, start, end, description`. Types such as "Bollywood dance", "vocals", "band", "stand-up comedy" are recognised; times like `1:30 PM` or `13:30` both work. Download a template from the import dialog.
- **Publish** saves your changes; the site updates within a minute. Every publish backs up the tab first; **History** restores any earlier version.
- **Preview mode** (before the Sheet is connected): changes save only in your browser, and the website in that same browser shows them. Handy for trying things out.

## Developing

Requires Node 22.18+ (the `check` and `seed` scripts run TypeScript directly).

```bash
npm install
npm run dev        # http://localhost:5173 (admin at /admin.html)
npm run check      # importer + schedule logic checks
SITE_URL=https://your-domain npm run build   # → dist/ (prerendered, ready to upload)
```

`SITE_URL` fills the canonical and social-preview URLs in `index.html`; set it once the domain is known.

| Script | What it does |
| --- | --- |
| `npm run assets` | Rebuilds `public/media/` from `assets-src/` (poster logo cut-out, vendor logo tiles, Team Sathe images, social preview). |
| `npm run seed -- <registrations.csv>` | Regenerates the vendor list baked into the build (`src/content/vendors.seed.json`) from the registration sheet, using the same importer as the admin. |

Built-in defaults (used when the Sheet is empty or unreachable) live in `src/content/defaults.ts`.
