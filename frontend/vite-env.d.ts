interface ImportMetaEnv {
  readonly VITE_WEATHER_API: string;
  readonly VITE_MAPS_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
