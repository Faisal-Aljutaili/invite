'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { events } from '@/lib/api';
import type { EventData } from '@/lib/types';

export default function EventsPage() {
  const [list, setList] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => events.list().then(setList).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    try {
      await events.delete(id);
      setList(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 pt-16 lg:pt-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <p className="text-gray-500 mt-1">Manage your invite events</p>
            </div>
            <Link href="/events/new" className="btn-primary">+ New Event</Link>
          </div>

          {loading ? (
            <Spinner />
          ) : list.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="No events yet"
              description="Create your first invite event to get started."
              actionLabel="Create Event"
              actionHref="/events/new"
            />
          ) : (
            <div className="grid gap-4">
              {list.map(ev => (
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
