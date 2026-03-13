'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { users, events, payments } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [eventList, setEventList] = useState<any[]>([]);
  const [paymentList, setPaymentList] = useState<any[]>([]);

  useEffect(() => {
    users.me().then(setUser);
    events.list().then((r: any) => setEventList(r));
    payments.list().then((r: any) => setPaymentList(r));
  }, []);

  const activeEvents = eventList.filter(e => !e.eventDone).length;
  const doneEvents = eventList.filter(e => e.eventDone).length;
  const totalSpent = paymentList.reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back{user ? `, ${user.userName}` : ''}!
            </h2>
            <p className="text-gray-500 mt-1">Here's what's happening with your invites.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon="🎟️"
              label="Available Invites"
              value={user?.availableNumberOfInvites ?? '—'}
              color="blue"
            />
            <StatCard icon="🎉" label="Active Events" value={activeEvents} color="green" />
            <StatCard icon="✅" label="Done Events" value={doneEvents} color="gray" />
            <StatCard
              icon="💳"
              label="Total Spent"
              value={`$${totalSpent.toFixed(2)}`}
              color="purple"
            />
          </div>

          {/* Recent Events */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Events</h3>
              <Link href="/events/new" className="btn-primary text-sm">+ New Event</Link>
            </div>
            {eventList.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No events yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {eventList.slice(0, 5).map((ev: any) => (
                  <div key={ev.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{ev.dateOfTheEvent}</p>
                      <p className="text-xs text-gray-500">{ev.numberOfInvites} invites</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${ev.eventDone ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                        {ev.eventDone ? 'Done' : 'Active'}
                      </span>
                      <Link href={`/events/${ev.id}`} className="text-sm text-brand-600 hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: any; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
