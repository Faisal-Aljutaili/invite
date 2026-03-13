'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { events } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  NO_RESPONSE: 'bg-gray-100 text-gray-600',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [invitees, setInvitees] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [ev, inv] = await Promise.all([
      events.get(id) as Promise<any>,
      events.listInvitees(id) as Promise<any>,
    ]);
    setEvent(ev);
    setInvitees(inv);
  };

  useEffect(() => { load(); }, [id]);

  async function addInvitee(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await events.addInvitee(id, { phoneNumber: phone });
      setPhone('');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function sendAll() {
    setSending(true);
    setMsg('');
    try {
      await events.sendInvites(id);
      setMsg('Invites sent successfully!');
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!event) return null;

  const unsent = invitees.filter(i => !i.sentAt).length;

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
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

          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
          {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">{msg}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add invitee form */}
            {!event.eventDone && (
              <div className="card">
                <h3 className="font-semibold mb-4">Add Invitee</h3>
                <form onSubmit={addInvitee} className="space-y-3">
                  <div>
                    <label className="label">Phone Number</label>
                    <input className="input" type="tel" placeholder="+1234567890"
                      value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading || invitees.length >= event.numberOfInvites}
                    className="btn-primary w-full">
                    {loading ? 'Adding…' : 'Add Invitee'}
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
                  {invitees.map((inv: any) => (
                    <div key={inv.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{inv.phoneNumber}</p>
                        <p className="text-xs text-gray-500">
                          {inv.sentAt ? `Sent ${new Date(inv.sentAt).toLocaleString()}` : 'Not sent yet'}
                        </p>
                      </div>
                      <span className={`badge ${STATUS_STYLES[inv.status]}`}>{inv.status}</span>
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
