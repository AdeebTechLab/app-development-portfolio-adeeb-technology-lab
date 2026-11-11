# Adeeb Technology Lab — App Development Portfolio

A responsive portfolio website for Adeeb Technology Lab's mobile app work, built with React, TypeScript, Vite and Tailwind CSS. It is the sister site of the web development portfolio and works the same way, including the admin panel.

## Features

- App development services, technology stack and process
- App portfolio with app icons, phone-framed screenshots and Google Play / App Store buttons
- Filter apps by category and platform (Android, iOS, Web, Windows, Chrome extension), plus search
- Animated hero that "codes" a phone app
- Dark and light themes, responsive on phones, tablets and desktops
- Contact form that opens WhatsApp or email with the message ready
- Clients, CEO profile and FAQ sections
- Admin panel for apps, services, clients, technologies and site content

## Admin panel

Open `/admin` (or click the © sign in the footer). See [docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md).

Initial login:

- **Email:** `info@adeebtechlab.com`
- **Password:** `tech123`

After signing in, open **Admin credentials** to set a new email and password (at least 8 characters).

**Security note:** this is a frontend-only project. The admin login is a convenience gate, not secure production authentication, and the initial login is visible in the public code. Change it after your first sign-in and do not store confidential information in the admin panel.

The app portfolio keeps its admin data and login separate from the web development portfolio, so both can run on the same domain without overwriting each other.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```bash
npm run build          # production build in dist/
npm run build:preview  # one self-contained HTML file in dist-preview/, handy for quick previews
```

## Deploy on Vercel

1. Push the project to a new GitHub repository.
2. Import the repository into Vercel (framework: Vite; the settings in `vercel.json` are picked up automatically).
3. In Vercel › Settings › Environment Variables, set `VITE_SITE_URL` to the live address of this portfolio (for example `https://apps.adeebtechlab.com`). It is used for share links and the sitemap.
4. Deploy, then add your custom domain if needed.

## Updating content

All published content lives in `src/data/site-data.json`. Edit it in the admin panel, download the publish file, replace `src/data/site-data.json` with it and push. Vercel rebuilds automatically.

## Before publishing

- Check each app's description, features and technologies against its Google Play listing.
- Add app screenshots in the admin panel (Apps › Edit › Screenshots).
- Review the services and technology stack so they match what the team offers.
- Use secure server-backed authentication if the admin panel will ever manage private data.
