/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the device API. Defaults to the page origin, where the mock API is served. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
