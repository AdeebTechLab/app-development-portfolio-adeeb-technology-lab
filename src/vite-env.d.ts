/// <reference types="vite/client" />

declare const __HASH_ROUTER__: boolean
declare const __BUILD_DATE__: string

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
