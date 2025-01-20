/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string; // Define other variables here as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  