'use client';
import { Suspense, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';
import { saveToken } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';

type Tab = 'password' | 'otp';
type OtpStep = 'request' | 'verify';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('password');
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  const redirect = searchParams.get('redirect') || '/dashboard';

  async function loginAndRedirect(promise: Promise<AuthResponse>) {
    setError('');
    setLoading(true);
    try {
      const res = await promise;
      saveToken(res.token);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    await loginAndRedirect(auth.login({ email, password }));
  }

  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.requestOtp({ email });
      setOtpStep('verify');
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    await loginAndRedirect(auth.verifyOtp({ email, otp }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">InviteApp</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(['password', 'otp'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'password' ? 'Password' : 'Email OTP'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input ref={emailRef} className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input pr-10" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} required />
                  <button type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          {tab === 'otp' && otpStep === 'request' && (
            <form onSubmit={handleOtpRequest} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input ref={emailRef} className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {tab === 'otp' && otpStep === 'verify' && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <p className="text-sm text-gray-600">OTP sent to <strong>{email}</strong></p>
              <div>
                <label className="label">6-digit code</label>
                <input ref={otpRef} className="input text-center text-2xl tracking-widest" type="text"
                  maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying…' : 'Verify & Sign in'}
              </button>
              <button type="button" onClick={() => setOtpStep('request')}
                className="text-sm text-brand-600 hover:underline w-full text-center">
                Resend OTP
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{' '}
            <Link href="/auth/register" className="text-brand-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
