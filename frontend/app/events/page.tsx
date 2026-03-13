'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { events } from '@/lib/api';

export default function EventsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => events.list().then((r: any) => { setList(r); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    await events.delete(id);
    load();
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <p className="text-gray-500 mt-1">Manage your invite events</p>
            </div>
            <Link href="/events/new" className="btn-primary">+ New Event</Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading…</div>
          ) : list.length === 0 ? (
            <div className="card text-center py-20">
              <p className="text-4xl mb-4">🎉</p>
              <p className="text-gray-500">No events yet. Create your first event!</p>
              <Link href="/events/new" className="btn-primary inline-block mt-4">Create Event</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {list.map((ev: any) => (
                <div key={ev.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{ev.dateOfTheEvent}</p>
                      <p className="text-sm text-gray-500">{ev.numberOfInvites} invites allocated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${ev.eventDone ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {ev.eventDone ? 'Done' : 'Active'}
                    </span>
                    <Link href={`/events/${ev.id}`} className="btn-secondary text-sm">
                      Manage
                    </Link>
                    {!ev.eventDone && (
                      <button onClick={() => handleDelete(ev.id)} className="btn-danger text-sm">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
