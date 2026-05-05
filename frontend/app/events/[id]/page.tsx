'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import Spinner from '@/components/Spinner';
import { events } from '@/lib/api';
import type { EventData, InviteeData } from '@/lib/types';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  NO_RESPONSE: 'bg-gray-100 text-gray-600',
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => toast.success('Invite link copied!'))
    .catch(() => toast.error('Failed to copy'));
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [invitees, setInvitees] = useState<InviteeData[]>([]);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const [ev, inv] = await Promise.all([
      events.get(id),
      events.listInvitees(id),
    ]);
    setEvent(ev);
    setInvitees(inv);
  }, [id]);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  async function addInvitee(e: React.FormEvent) {
    e.preventDefault();
    const phonePattern = /^\+?[1-9]\d{7,14}$/;
    if (!phonePattern.test(phone)) {
      setPhoneError('Enter a valid phone number (e.g. +1234567890).');
      return;
    }
    setPhoneError('');
    setAdding(true);
    try {
      const inv = await events.addInvitee(id, { phoneNumber: phone });
      setInvitees(prev => [...prev, inv]);
      setPhone('');
      toast.success('Invitee added');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  }

  async function sendAll() {
    setSending(true);
    try {
      await events.sendInvites(id);
      toast.success('Invites sent!');
      await load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <AuthGuard><div className="flex min-h-screen"><Sidebar /><main className="flex-1 p-8 pt-16 lg:pt-8"><Spinner /></main></div></AuthGuard>;
  if (!event) return null;

  const unsent = invitees.filter(i => !i.sentAt).length;

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <Link href="/events" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Events
            </Link>
            <div className="flex items-center justify-between mt-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event: {event.dateOfTheEvent}</h2>
                <p className="text-gray-500 mt-1">
                  {event.numberOfInvites} invites allocated ·{' '}
                  <span className={`badge ${event.eventDone ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                    {event.eventDone ? 'Done' : 'Active'}
                  </span>
                </p>
              </div>
              {!event.eventDone && unsent > 0 && (
                <button onClick={sendAll} disabled={sending} className="btn-primary">
                  {sending ? 'Sending…' : `Send ${unsent} Invite${unsent !== 1 ? 's' : ''}`}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add invitee form */}
            {!event.eventDone && (
              <div className="card">
                <h3 className="font-semibold mb-4">Add Invitee</h3>
                <form onSubmit={addInvitee} className="space-y-3">
                  <div>
                    <label className="label">Phone Number</label>
                    <input className={`input ${phoneError ? 'border-red-500' : ''}`}
                      type="tel" placeholder="+1234567890"
                      value={phone} onChange={e => { setPhone(e.target.value); setPhoneError(''); }} required />
                    {phoneError && <p className="text-sm text-red-600 mt-1">{phoneError}</p>}
                  </div>
                  <button type="submit" disabled={adding || invitees.length >= event.numberOfInvites}
                    className="btn-primary w-full">
                    {adding ? 'Adding…' : 'Add Invitee'}
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    {invitees.length} / {event.numberOfInvites} slots used
                  </p>
                </form>
              </div>
            )}

            {/* Invitees list */}
            <div className={`card ${!event.eventDone ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <h3 className="font-semibold mb-4">Invitees ({invitees.length})</h3>
              {invitees.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No invitees yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {invitees.map(inv => (
                    <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{inv.phoneNumber}</p>
                        <p className="text-xs text-gray-500">
                          {inv.sentAt ? `Sent ${new Date(inv.sentAt).toLocaleString()}` : 'Not sent yet'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/invite/${inv.id}`)}
                          className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
                          title="Copy invite link"
                        >
                          🔗
                        </button>
                        <span className={`badge ${STATUS_STYLES[inv.status]}`}>{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
