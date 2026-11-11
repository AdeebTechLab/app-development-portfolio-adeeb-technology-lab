import {
  AppWindow, BellRing, Bot, Cloud, Code, CreditCard, Database, Gamepad2, Gauge, Globe, GraduationCap, Layers, LayoutDashboard,
  MapPin, Megaphone, MessageCircle, Monitor, Palette, PenTool, Plug, Puzzle, RefreshCw, Rocket, Search, Server, ShieldCheck,
  ShoppingCart, Smartphone, Sparkles, Sticker, Store, TabletSmartphone, Target, Tv, Wrench, type LucideIcon,
} from 'lucide-react'

/** Icons an admin can pick for a service or a project category. */
export const SERVICE_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  smartphone: { icon: Smartphone, label: 'Phone (Android / mobile apps)' },
  'tablet-smartphone': { icon: TabletSmartphone, label: 'Phone and tablet (iOS / cross-platform)' },
  layers: { icon: Layers, label: 'Layers (cross-platform)' },
  store: { icon: Store, label: 'Store (app store publishing)' },
  sticker: { icon: Sticker, label: 'Sticker (sticker apps)' },
  bell: { icon: BellRing, label: 'Bell (push notifications)' },
  monitor: { icon: Monitor, label: 'Monitor (desktop apps)' },
  puzzle: { icon: Puzzle, label: 'Puzzle (browser extensions)' },
  'credit-card': { icon: CreditCard, label: 'Card (payments)' },
  'map-pin': { icon: MapPin, label: 'Pin (maps & delivery)' },
  chat: { icon: MessageCircle, label: 'Chat (messaging)' },
  tv: { icon: Tv, label: 'TV (media & streaming)' },
  game: { icon: Gamepad2, label: 'Gamepad (games)' },
  globe: { icon: Globe, label: 'Globe (websites)' },
  'app-window': { icon: AppWindow, label: 'Window (web apps)' },
  'shopping-cart': { icon: ShoppingCart, label: 'Cart (e-commerce)' },
  target: { icon: Target, label: 'Target (landing pages)' },
  'graduation-cap': { icon: GraduationCap, label: 'Cap (portals & LMS)' },
  'layout-dashboard': { icon: LayoutDashboard, label: 'Dashboard (admin panels)' },
  'pen-tool': { icon: PenTool, label: 'Pen (UI/UX)' },
  palette: { icon: Palette, label: 'Palette (design)' },
  refresh: { icon: RefreshCw, label: 'Refresh (redesign)' },
  wrench: { icon: Wrench, label: 'Wrench (maintenance)' },
  gauge: { icon: Gauge, label: 'Gauge (speed)' },
  search: { icon: Search, label: 'Search (SEO)' },
  server: { icon: Server, label: 'Server (hosting)' },
  cloud: { icon: Cloud, label: 'Cloud' },
  plug: { icon: Plug, label: 'Plug (integrations)' },
  database: { icon: Database, label: 'Database' },
  code: { icon: Code, label: 'Code' },
  shield: { icon: ShieldCheck, label: 'Shield (security)' },
  rocket: { icon: Rocket, label: 'Rocket (launch)' },
  sparkles: { icon: Sparkles, label: 'Sparkles (AI)' },
  bot: { icon: Bot, label: 'Robot (automation)' },
  megaphone: { icon: Megaphone, label: 'Megaphone (marketing)' },
}

export function ServiceIcon({ name, className = 'size-5' }: { name: string; className?: string }) {
  const Icon = SERVICE_ICONS[name]?.icon ?? Smartphone
  return <Icon className={className} aria-hidden="true" />
}
