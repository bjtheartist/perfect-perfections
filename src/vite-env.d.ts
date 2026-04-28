/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SQUARE_APPLICATION_ID: string;
  readonly VITE_SQUARE_LOCATION_ID: string;
  readonly VITE_SQUARE_ENVIRONMENT: 'sandbox' | 'production';
  readonly VITE_CONTENTFUL_SPACE_ID?: string;
  readonly VITE_CONTENTFUL_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
