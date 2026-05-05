'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import Spinner from '@/components/Spinner';
import { payments, users } from '@/lib/api';
import type { UserProfile, PaymentData } from '@/lib/types';

export default function PaymentsPage() {
  const [list, setList] = useState<PaymentData[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: '', numberOfInvites: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    const [u, p] = await Promise.all([users.me(), payments.list()]);
    setUser(u);
    setList(p);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) errs.amount = 'Enter a valid amount.';
    const num = parseInt(form.numberOfInvites);
    if (!form.numberOfInvites || isNaN(num) || num < 1) errs.numberOfInvites = 'Enter a valid number.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await payments.record({
        amount: parseFloat(form.amount),
        numberOfInvites: parseInt(form.numberOfInvites),
      });
      setForm({ amount: '', numberOfInvites: '' });
      toast.success('Payment recorded! Invites credited.');
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totalSpent = list.reduce((s, p) => s + p.amount, 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 pt-16 lg:pt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
            <p className="text-gray-500 mt-1">Purchase and track your invite credits</p>
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="card text-center">
                  <p className="text-4xl font-bold text-brand-600">{user?.availableNumberOfInvites ?? '—'}</p>
                  <p className="text-sm text-gray-500 mt-1">Available Invites</p>
                </div>
                <div className="card text-center">
                  <p className="text-4xl font-bold text-gray-900">{list.length}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Purchases</p>
                </div>
                <div className="card text-center">
                  <p className="text-4xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Spent</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Purchase form */}
                <div className="card">
                  <h3 className="font-semibold mb-4">Record Payment</h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="label">Amount ($)</label>
                      <input className={`input ${errors.amount ? 'border-red-500' : ''}`}
                        type="number" min="0.01" step="0.01"
                        placeholder="29.99" value={form.amount}
                        onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(p => { const n = { ...p }; delete n.amount; return n; }); }} required />
                      {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                      <label className="label">Number of Invites</label>
                      <input className={`input ${errors.numberOfInvites ? 'border-red-500' : ''}`}
                        type="number" min="1"
                        placeholder="100" value={form.numberOfInvites}
                        onChange={e => { setForm(f => ({ ...f, numberOfInvites: e.target.value })); setErrors(p => { const n = { ...p }; delete n.numberOfInvites; return n; }); }} required />
                      {errors.numberOfInvites && <p className="text-sm text-red-600 mt-1">{errors.numberOfInvites}</p>}
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                      {submitting ? 'Recording…' : 'Record Payment'}
                    </button>
                  </form>
                </div>

                {/* History */}
                <div className="card lg:col-span-2">
                  <h3 className="font-semibold mb-4">Payment History</h3>
                  {list.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No payments recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {list.map(p => (
                        <div key={p.id} className="py-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{p.numberOfInvites} invites</p>
                            <p className="text-xs text-gray-500">
                              {new Date(p.paymentAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="font-semibold text-green-600">${p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
