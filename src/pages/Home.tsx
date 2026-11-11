import { useSeo } from '../lib/seo'
import { FaqSection } from '../components/sections/FaqSection'
import { ContactSection } from '../components/sections/ContactSection'
import { CeoSection, ClientsSection, Hero, ProcessSection, ServicesSection, TechStackSection, WorkSection } from '../components/sections/HomeSections'

export default function Home() {
  useSeo({ path: '/' })
  return (
    <>
      <Hero />
      <ServicesSection />
      <WorkSection />
      <TechStackSection />
      <ProcessSection />
      <ClientsSection />
      <CeoSection />
      <FaqSection />
      <ContactSection />
    </>
  )
}
