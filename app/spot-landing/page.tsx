import type { Metadata } from 'next';
import { SpotRedirectClient } from './SpotRedirectClient';

export const metadata: Metadata = {
  title: 'Membuka Embun App…',
  robots: { index: false, follow: false },
};

/**
 * /spot-landing — static fallback page served (via a Firebase Hosting
 * rewrite of `/spot/**`) when a Share_Spot Universal Link/App Link
 * (`https://link.embun.app/spot/<id>`) isn't intercepted by the OS. See
 * `SpotRedirectClient` for the actual redirect/fallback behavior.
 */
export default function SpotLandingPage() {
  return <SpotRedirectClient />;
}
