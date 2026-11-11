import { Outlet } from 'react-router'
import { WhatsAppButton } from '../WhatsAppButton'
import { Footer } from './Footer'
import { Header } from './Header'
import { WhatsAppMessageProvider } from './WhatsAppContext'
import { ScrollControls } from '../ScrollControls'

export function SiteLayout() {
  return (
    <WhatsAppMessageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <WhatsAppButton />
      <ScrollControls />
    </WhatsAppMessageProvider>
  )
}
