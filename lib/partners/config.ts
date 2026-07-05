export const PUBLIC_CAMPSITES_ENDPOINT = process.env.EMBUN_BACKEND_PUBLIC_API_URL
  ? `${process.env.EMBUN_BACKEND_PUBLIC_API_URL}/public/campsites`
  : 'https://api-staging.embun.app/api/public/campsites';
// Build-time-only env var — NOT prefixed with NEXT_PUBLIC_ since it is never
// read in the browser bundle, only inside next build's Node process.
