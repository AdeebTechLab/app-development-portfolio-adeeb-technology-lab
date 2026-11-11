// Fixed settings that are not edited from the admin panel.
// Company details (WhatsApp, email, offices, CEO, process...) are edited in Admin › Site content.

/** Your live website address, used for share links and the sitemap. Set VITE_SITE_URL in .env to change it. */
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://www.adeebtechlab.com'

export const LOGO_URL = 'https://res.cloudinary.com/adeeb-tech-lab/image/upload/v1757196590/Company%20Logo/512_exyyiy.png'

export const OG_IMAGE =
  'https://res.cloudinary.com/adeeb-tech-lab/image/upload/c_pad,b_rgb:222D38,w_1200,h_630/v1757196590/Company%20Logo/512_exyyiy.png'

export const DEFAULT_DESCRIPTION =
  'Adeeb Technology Lab designs, builds and publishes Android, iOS and cross-platform apps, with admin panels and store launch included. See our apps and message us on WhatsApp.'
