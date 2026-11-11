import { ChevronDown } from 'lucide-react'
import { SectionHeading } from './HomeSections'

const FAQS = [
  {
    question: 'What happens after I send an enquiry?',
    answer: 'Your message opens in WhatsApp or your email app so you can review and send it. We can then discuss your goals, timeline and the right next step for your project.',
  },
  {
    question: 'Android, iOS or both?',
    answer: 'We can build for Android, iOS or both. A cross-platform app (for example with Flutter) uses one codebase for both platforms, which usually saves time and cost. We’ll recommend what fits your users and budget.',
  },
  {
    question: 'What should I prepare before starting an app?',
    answer: 'A short description of your idea, who will use the app, and the main things they should be able to do. Examples of apps you like, your logo and brand colours are helpful too.',
  },
  {
    question: 'Will you publish the app on Google Play and the App Store?',
    answer: 'Yes. We prepare the store listing, screenshots and privacy policy and help you publish the app on your own developer account, so you stay the owner of the app.',
  },
  {
    question: 'Can I manage the app content myself?',
    answer: 'Yes. Apps that need it come with an admin panel, so you can update products, courses, posts or orders without touching the code.',
  },
  {
    question: 'How do we get started?',
    answer: 'Use the contact form or floating WhatsApp button to tell us what you need. We’ll follow up to understand the scope and discuss a suitable plan.',
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-20">
      <div className="container-x">
        <SectionHeading title="Frequently asked questions" text="A few helpful details before we get started." />
        <div className="mt-8 divide-y divide-line border-y border-line">
          {FAQS.map(({ question, answer }) => (
            <details key={question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold text-ink marker:hidden focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown className="size-5 shrink-0 text-ink-faint transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-ink-muted">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
