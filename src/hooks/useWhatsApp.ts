import { useCallback } from 'react'
import { useSite } from '../store/siteStore'
import { whatsappLink } from '../lib/utils'

/** Builds WhatsApp links with the number and default message from Site content. */
export function useWhatsApp() {
  const { settings } = useSite()
  const link = useCallback(
    (message?: string) => whatsappLink(settings.whatsappNumber, message || settings.whatsappMessage),
    [settings.whatsappNumber, settings.whatsappMessage],
  )
  return { link, display: settings.whatsappDisplay, number: settings.whatsappNumber }
}
