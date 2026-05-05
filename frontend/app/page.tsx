'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';
import Spinner from '@/components/Spinner';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isLoggedIn() ? '/dashboard' : '/auth/login');
  }, [router]);
  return <Spinner className="min-h-screen" />;
}
