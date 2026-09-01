import type { Metadata } from 'next';
import { ProfileClient } from '@/components/profile/ProfileClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Profil Saya | Embun',
  description: 'Kelola profil akun Embun Anda.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
