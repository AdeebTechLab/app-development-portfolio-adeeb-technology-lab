# Admin guide

## Open the admin panel

Click the **©** sign at the bottom of any page, or go to `yourwebsite.com/admin`.

On the first login, use:

- **Email:** `info@adeebtechlab.com`
- **Password:** `tech123`

After signing in, open **Admin credentials** and choose a new email and password (at least 8 characters). The new login is kept in the current browser; clearing the site's browser storage restores the initial login. The public site contains the initial login code, so this browser-side gate is not suitable for protecting confidential data.

This admin panel is separate from the web development portfolio's admin panel: changing the login or content here does not affect the other site.

Changes save automatically **in the browser you're using**. Visitors see them only after you publish (see the last section).

## Add an app

1. **Apps › Add app.**
2. Fill in the required fields: **App name**, **Page link** (filled in from the name), **Short summary**, **Main category** and **Platforms** (Android, iOS, Web, Windows, Chrome extension).
3. Add the **app icon** (square, at least 512 × 512) and **screenshots** (portrait phone screenshots, for example 1080 × 2340). Screenshots are shown in phone frames, and visitors can open them full size.
4. Optionally add a **cover banner**: a wide promo image like a Play Store feature graphic (1024 × 500). Without one, the app card shows your first screenshots in phone frames, or the app icon if there are no screenshots.
5. Add the **Google Play** and **App Store** links. They appear as store buttons on the app page. Use **Website or web version** for a web link, and **Other links** for things like an APK download, Microsoft Store or a Chrome extension.
6. Add the story: description, the challenge, what you built, key features (one per line) and technologies (press Enter after each).
7. Select **Publish**, or **Save draft** to finish later. **Save and preview** opens the page as visitors will see it.

Tips:
- Take screenshots on a real phone or emulator, and avoid personal data in them.
- Technologies that match your technology stack show their logo.
- **Featured** apps appear first and on the homepage.

## Manage apps

On **Apps** you can:
- switch **Published / Draft**
- mark as **featured** (star)
- filter the list by category
- **copy the link** to send to a client
- **preview**, **duplicate**, **edit** or **delete**
- change the order with the small arrows (clear filters first)

## Services and app categories

**Services** lists the app development services shown in the Services section. Add, edit, reorder or delete services there. App categories (for example Education apps, Media apps, Sticker apps) are separate: create one from **Add category** in the app editor. Categories group and filter apps on the Apps page.

## Clients

**Clients** holds the organisations you've built apps for. Add a logo, website and industry, and choose whether to show them on the site. You can link a client to an app in the app editor.

Only add a testimonial if the client actually said it and agreed to show it.

## Technology stack

**Technology stack** controls the "Technologies we use" section, grouped into Mobile frameworks, Languages, Backend & Cloud, Design & Tools, and Publishing & Growth. Add a technology, choose its group and logo, reorder it, or hide it.

## Site content

**Site content** edits the company name and tagline, the hero heading, typing words and introduction, the WhatsApp number and default message, email, hours and offices, the CEO section, the process steps and the social links (including your Google Play developer page). Select **Save changes** at the bottom.

## Publish your changes

1. **Publish & backup › Download publish file.** You get `site-data.json`.
2. In the project folder, replace `src/data/site-data.json` with that file.
3. Redeploy the website. On Vercel, push to GitHub and it rebuilds automatically.

After that, every visitor sees your changes.

## Backups and other computers

- **Download backup** saves everything, including drafts. Do it before big changes.
- **Import from a file** loads a backup or a publish file from this app portfolio into the browser, for example to continue editing on another computer. Files from the web development portfolio can't be imported here.
- **Discard changes** returns this browser to the published version.

## Images and storage

Uploaded images are resized and saved in the browser, which holds about 5 MB. Screenshots add up quickly, so for apps with many screenshots use **Or paste an image link** with Cloudinary links, or put the files in the project's `public/images/` folder and link them as `/images/file-name.png`. The storage bar on the dashboard shows how much is used.
