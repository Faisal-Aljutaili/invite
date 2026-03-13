'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { publicInvite } from '@/lib/api';

type Status = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NO_RESPONSE';

export default function PublicInvitePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    publicInvite.get(id)
      .then(setData)
      .catch(() => setError('Invite not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function respond(status: 'ACCEPTED' | 'DECLINED') {
    setResponding(true);
    try {
      const res = await publicInvite.respond(id, status);
      setData((d: any) => ({ ...d, invitee: res }));
    } catch (err: any) {
      setError(err.error || err.message || 'Something went wrong');
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white">
        <div className="text-brand-600 text-xl animate-pulse">Loading invite…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-gray-700 font-medium">{error || 'Invite not found'}</p>
        </div>
      </div>
    );
  }

  const { invitee, event, template } = data;
  const status: Status = invitee.status;

  const statusInfo: Record<Status, { icon: string; text: string; color: string }> = {
    PENDING: { icon: '⏳', text: 'Awaiting your response', color: 'text-yellow-600' },
    ACCEPTED: { icon: '✅', text: "You've accepted this invitation!", color: 'text-green-600' },
    DECLINED: { icon: '❌', text: "You've declined this invitation.", color: 'text-red-600' },
    NO_RESPONSE: { icon: '⏰', text: 'This invitation has expired.', color: 'text-gray-500' },
  };

  const { icon, text, color } = statusInfo[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto mb-4">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You're Invited!</h1>
          <p className="text-gray-500 mt-1">Event on {event.dateOfTheEvent}</p>
        </div>

        {/* Template content */}
        <div className="card mb-4">
          {template ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{template.template}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-700 text-center">
              You are invited to our event on <strong>{event.dateOfTheEvent}</strong>.
            </p>
          )}
        </div>

        {/* Status & actions */}
        <div className="card text-center">
          <p className={`text-lg font-semibold mb-4 ${color}`}>
            {icon} {text}
          </p>

          {status === 'PENDING' && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => respond('ACCEPTED')}
                disabled={responding}
                className="btn-primary px-8"
              >
                {responding ? '…' : '✓ Accept'}
              </button>
              <button
                onClick={() => respond('DECLINED')}
                disabled={responding}
                className="btn-danger px-8"
              >
                {responding ? '…' : '✗ Decline'}
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by InviteApp</p>
      </div>
    </div>
  );
}
