import { redirect } from 'next/navigation';

export default function RootPage() {
  // Since we use output: 'export', Next.js static export does not support server-side redirects in next.config.js.
  // However, next/navigation redirect in a Server Component will generate a meta refresh tag for static exports.
  redirect('/id');
}
