import {
  siAngular, siBlogger, siBootstrap, siCloudflare, siCloudinary, siCpanel, siCss, siDjango, siDocker, siElementor, siExpress,
  siFigma, siFirebase, siFramer, siGit, siGithub, siGoogleanalytics, siGooglesearchconsole, siGraphql, siGreensock, siHostinger,
  siHtml5, siJavascript, siJquery, siLaravel, siMongodb, siMui, siMysql, siNetlify, siNextdotjs, siNodedotjs, siNpm, siPhp,
  siPostgresql, siPostman, siPrisma, siPython, siReact, siRedux, siSass, siShopify, siStripe, siSupabase, siSvelte,
  siTailwindcss, siThreedotjs, siTypescript, siVercel, siVite, siVuedotjs, siWebflow, siWix, siWoocommerce, siWordpress,
  siAndroid, siAndroidstudio, siApple, siAppstore, siAppwrite, siCapacitor, siChromewebstore, siCocoapods, siCodemagic, siDart,
  siElectron, siExpo, siFastlane, siFlutter, siGithubactions, siGoogleadmob, siGooglecloud, siGooglemaps, siGooglepay,
  siGoogleplay, siGradle, siIonic, siJetpackcompose, siKodular, siKotlin, siKtor, siOpenjdk, siPaypal, siPwa, siSentry,
  siSpringboot, siSqlite, siSwift, siUnity, siXcode,
} from 'simple-icons'
import { cn } from '../lib/utils'

type SI = { path: string; hex: string; title: string }

/** Technology logos an admin can choose. Add more from the simple-icons package if needed. */
export const TECH_ICONS: Record<string, SI> = {
  // Mobile
  android: siAndroid, androidstudio: siAndroidstudio, flutter: siFlutter, dart: siDart, kotlin: siKotlin, java: siOpenjdk,
  swift: siSwift, xcode: siXcode, apple: siApple, jetpackcompose: siJetpackcompose, reactnative: siReact, expo: siExpo,
  ionic: siIonic, capacitor: siCapacitor, kodular: siKodular, unity: siUnity, pwa: siPwa, electron: siElectron,
  gradle: siGradle, cocoapods: siCocoapods, sqlite: siSqlite, appwrite: siAppwrite, googlecloud: siGooglecloud,
  googlemaps: siGooglemaps, googlepay: siGooglepay, paypal: siPaypal, ktor: siKtor, springboot: siSpringboot,
  googleplay: siGoogleplay, appstore: siAppstore, chromewebstore: siChromewebstore, googleadmob: siGoogleadmob,
  fastlane: siFastlane, codemagic: siCodemagic, githubactions: siGithubactions, sentry: siSentry,
  // Web and general
  html5: siHtml5, css: siCss, javascript: siJavascript, typescript: siTypescript, react: siReact, nextjs: siNextdotjs,
  vuejs: siVuedotjs, angular: siAngular, svelte: siSvelte, tailwindcss: siTailwindcss, bootstrap: siBootstrap, sass: siSass,
  mui: siMui, jquery: siJquery, redux: siRedux, threejs: siThreedotjs, greensock: siGreensock, framer: siFramer, vite: siVite,
  nodejs: siNodedotjs, express: siExpress, php: siPhp, laravel: siLaravel, python: siPython, django: siDjango,
  firebase: siFirebase, supabase: siSupabase, mongodb: siMongodb, mysql: siMysql, postgresql: siPostgresql, prisma: siPrisma,
  graphql: siGraphql, wordpress: siWordpress, woocommerce: siWoocommerce, shopify: siShopify, elementor: siElementor,
  webflow: siWebflow, wix: siWix, blogger: siBlogger, stripe: siStripe, figma: siFigma, git: siGit, github: siGithub,
  postman: siPostman, npm: siNpm, docker: siDocker, vercel: siVercel, netlify: siNetlify, cloudinary: siCloudinary,
  cloudflare: siCloudflare, hostinger: siHostinger, cpanel: siCpanel, googleanalytics: siGoogleanalytics,
  googlesearchconsole: siGooglesearchconsole,
}

/** Very dark brand colours (Next.js, Express…) would disappear on the dark theme, so those use the text colour. */
function readable(hex: string) {
  const n = parseInt(hex, 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const lum = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
  return lum > 0.1 ? `#${hex}` : 'currentColor'
}

export function TechIcon({ icon, name, className = 'size-6', color = false }: { icon: string; name: string; className?: string; color?: boolean }) {
  const si = TECH_ICONS[icon]
  if (!si) {
    const initials = name
      .replace(/[^A-Za-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
    return (
      <span className={cn('grid place-items-center rounded-md border border-current text-[0.6rem] font-extrabold', className)} aria-hidden="true">
        {initials || '?'}
      </span>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color ? readable(si.hex) : 'currentColor'} aria-hidden="true">
      <path d={si.path} />
    </svg>
  )
}
