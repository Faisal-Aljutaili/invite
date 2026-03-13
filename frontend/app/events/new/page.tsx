'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { events, templates, users } from '@/lib/api';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [form, setForm] = useState({ dateOfTheEvent: '', numberOfInvites: 1, templateId: '' });

  useEffect(() => {
    users.me().then(setUser);
    templates.list().then((r: any) => setTemplateList(r));
  }, []);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: any = {
        dateOfTheEvent: form.dateOfTheEvent,
        numberOfInvites: Number(form.numberOfInvites),
      };
      if (form.templateId) payload.templateId = form.templateId;
      const ev: any = await events.create(payload);
      router.push(`/events/${ev.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 max-w-2xl">
          <div className="mb-8">
            <Link href="/events" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Events
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Create New Event</h2>
            {user && (
              <p className="text-sm text-gray-500 mt-1">
                Available invites: <strong className="text-brand-600">{user.availableNumberOfInvites}</strong>
              </p>
            )}
          </div>

          <div className="card">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Event Date</label>
                <input className="input" type="date" value={form.dateOfTheEvent}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={update('dateOfTheEvent')} required />
              </div>

              <div>
                <label className="label">Number of Invites</label>
                <input className="input" type="number" min={1}
                  max={user?.availableNumberOfInvites ?? 9999}
                  value={form.numberOfInvites}
                  onChange={update('numberOfInvites')} required />
                <p className="text-xs text-gray-500 mt-1">
                  These will be deducted from your available invites.
                </p>
              </div>

              <div>
                <label className="label">Template (optional)</label>
                <select className="input" value={form.templateId} onChange={update('templateId')}>
                  <option value="">— No template —</option>
                  {templateList.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.template.slice(0, 60)}{t.template.length > 60 ? '…' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Creating…' : 'Create Event'}
                </button>
                <Link href="/events" className="btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
