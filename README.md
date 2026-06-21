# M K Gallery — Website

Heritage soft furnishings, luxury curtains and fine hotel linens — Chickpet, Bengaluru. Established 1981.

A fully responsive (desktop + mobile) static website. No build step required — it's plain HTML, CSS and JavaScript.

## Project structure

```
mk-gallery-website/
├── index.html          # The full page markup
├── css/
│   └── styles.css      # All styling (responsive: desktop, tablet, mobile)
├── js/
│   └── main.js         # Interactions: curtain intro, 3D hero, modals, estimate calculator
├── images/             # Logo, product photos, hotel partner logos
├── package.json
└── README.md
```

External libraries (Google Fonts, Font Awesome, three.js) load from CDN, so an internet
connection is needed the first time the page loads.

## Run it locally

Any static server works. The simplest:

```bash
cd mk-gallery-website
npx serve .
```

Then open the URL it prints (e.g. http://localhost:3000). You can also just double-click
`index.html`, though a local server is recommended so all assets resolve correctly.

## Working links / interactions

- **WhatsApp** — floating button, header "Enquire Now", "Instant Chat", and the estimate/
  consultation flows all open `wa.me/917030063006` with a pre-filled message.
- **Instagram** — floating button links to `instagram.com/mkgallery_trends`.
- **Google Maps** — the map card links to the Chickpet studio location.
- **Phone** (`tel:`) and **Email** (`mailto:`) links in the header, contact section and footer.
- **Collection / nav** — smooth-scroll anchors to each section.

> Update the phone number, Instagram handle, email and address by editing `index.html`
> (search for `917030063006`, `mkgallery_trends`, `info@mkgallery.in`).

---

## Publish to GitHub + GitHub Pages

1. Go to **https://github.com** and sign in.
2. Click **New repository** (the **+** menu, top-right → *New repository*).
3. **Name it** — e.g. `mk-gallery-website`. Leave it **Public**. Click **Create repository**.
4. Upload the files. Easiest way in the browser:
   - On the new repo page click **uploading an existing file**.
   - Drag the **contents** of this `mk-gallery-website` folder (the `index.html`, `css`,
     `js`, `images` folder, `package.json`, `README.md`) into the page.
   - Click **Commit changes**.

   *(Or with git on your computer:)*
   ```bash
   cd mk-gallery-website
   git init
   git add .
   git commit -m "M K Gallery website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mk-gallery-website.git
   git push -u origin main
   ```
5. **Turn on GitHub Pages:** in the repo go to **Settings → Pages**. Under *Build and
   deployment → Source* choose **Deploy from a branch**, set branch to **main** and folder
   to **/ (root)**, then **Save**.
6. Wait ~1 minute. Your live site appears at:
   **`https://<your-username>.github.io/mk-gallery-website/`**

That URL is shareable and shows the exact same responsive interface on desktop and mobile.

### Optional: custom domain
In **Settings → Pages → Custom domain**, enter your domain (e.g. `mkgallery.in`) and add the
DNS records GitHub shows you with your domain registrar.
