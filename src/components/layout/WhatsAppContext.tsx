import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const Ctx = createContext<{ message: string | null; setMessage: (m: string | null) => void }>({
  message: null,
  setMessage: () => {},
})

export function WhatsAppMessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  return <Ctx.Provider value={{ message, setMessage }}>{children}</Ctx.Provider>
}

/** The floating button's message for the current page, or null for the default one. */
export const usePageWhatsAppMessage = () => useContext(Ctx).message

/** Lets a page change the floating WhatsApp button's pre-filled message while it is open. */
export function useSetWhatsAppMessage(message: string | null) {
  const { setMessage } = useContext(Ctx)
  useEffect(() => {
    setMessage(message)
    return () => setMessage(null)
  }, [message, setMessage])
}
