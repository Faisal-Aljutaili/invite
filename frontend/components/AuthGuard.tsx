'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import Spinner from '@/components/Spinner';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      const redirect = pathname !== '/dashboard' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/auth/login${redirect}`);
    } else {
      setReady(true);
    }
  }, [router, pathname]);

  if (!ready) return <Spinner className="min-h-screen" />;
  return <>{children}</>;
}
