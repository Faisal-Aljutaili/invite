'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { saveToken } from '@/lib/auth';

type Tab = 'password' | 'otp';
type OtpStep = 'request' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('password');
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await auth.login({ email, password });
      saveToken(res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpRequest(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.requestOtp({ email });
      setOtpStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res: any = await auth.verifyOtp({ email, otp });
      saveToken(res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required />
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
                <input className="input" type="email" value={email}
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
                <input className="input text-center text-2xl tracking-widest" type="text"
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
