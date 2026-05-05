'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import Spinner from '@/components/Spinner';
import { events, templates, users } from '@/lib/api';
import type { UserProfile, TemplateData, EventData } from '@/lib/types';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [templateList, setTemplateList] = useState<TemplateData[]>([]);
  const [form, setForm] = useState({ dateOfTheEvent: '', numberOfInvites: 1, templateId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([users.me(), templates.list()])
      .then(([u, t]) => { setUser(u); setTemplateList(t); })
      .finally(() => setPageLoading(false));
  }, []);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(prev => { const next = { ...prev }; delete next[k]; return next; });
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.dateOfTheEvent) errs.dateOfTheEvent = 'Event date is required.';
    if (form.numberOfInvites < 1) errs.numberOfInvites = 'Must have at least 1 invite.';
    if (user && form.numberOfInvites > user.availableNumberOfInvites)
      errs.numberOfInvites = `You only have ${user.availableNumberOfInvites} invites available.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        dateOfTheEvent: form.dateOfTheEvent,
        numberOfInvites: Number(form.numberOfInvites),
      };
      if (form.templateId) payload.templateId = form.templateId;
      const ev: EventData = await events.create(payload);
      toast.success('Event created!');
      router.push(`/events/${ev.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 pt-16 lg:pt-8 max-w-2xl">
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

          {pageLoading ? (
            <Spinner />
          ) : (
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Event Date</label>
                  <input className={`input ${errors.dateOfTheEvent ? 'border-red-500' : ''}`}
                    type="date" value={form.dateOfTheEvent}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={update('dateOfTheEvent')} required />
                  {errors.dateOfTheEvent && <p className="text-sm text-red-600 mt-1">{errors.dateOfTheEvent}</p>}
                </div>

                <div>
                  <label className="label">Number of Invites</label>
                  <input className={`input ${errors.numberOfInvites ? 'border-red-500' : ''}`}
                    type="number" min={1}
                    max={user?.availableNumberOfInvites ?? 9999}
                    value={form.numberOfInvites}
                    onChange={update('numberOfInvites')} required />
                  {errors.numberOfInvites && <p className="text-sm text-red-600 mt-1">{errors.numberOfInvites}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    These will be deducted from your available invites.
                  </p>
                </div>

                <div>
                  <label className="label">Template (optional)</label>
                  <select className="input" value={form.templateId} onChange={update('templateId')}>
                    <option value="">— No template —</option>
                    {templateList.map(t => (
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
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
