import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { writeSitemap } from './scripts/sitemap'

/** Writes sitemap.xml and robots.txt at the start of every production build. */
function sitemap(mode: string): Plugin {
  return {
    name: 'atl-sitemap',
    apply: 'build',
    buildStart() {
      const env = loadEnv(mode, process.cwd(), 'VITE_')
      writeSitemap(env.VITE_SITE_URL || 'https://www.adeebtechlab.com')
    },
  }
}

// `npm run build` → normal production build for hosting (Vercel, Netlify, Firebase Hosting).
// `npm run build:preview` → one self-contained HTML file with hash links, handy for quick previews.
export default defineConfig(({ mode }) => {
  const isPreview = mode === 'preview'
  return {
    plugins: [react(), tailwindcss(), ...(isPreview ? [viteSingleFile()] : [sitemap(mode)])],
    define: {
      __HASH_ROUTER__: JSON.stringify(isPreview),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      outDir: isPreview ? 'dist-preview' : 'dist',
      chunkSizeWarningLimit: 900,
    },
  }
})
