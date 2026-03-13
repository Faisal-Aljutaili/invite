'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { templates } from '@/lib/api';

export default function TemplatesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => templates.list().then((r: any) => { setList(r); setLoading(false); });
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return;
    await templates.delete(id);
    load();
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
              <p className="text-gray-500 mt-1">Markdown invite templates</p>
            </div>
            <Link href="/templates/new" className="btn-primary">+ New Template</Link>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading…</div>
          ) : list.length === 0 ? (
            <div className="card text-center py-20">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-gray-500">No templates yet.</p>
              <Link href="/templates/new" className="btn-primary inline-block mt-4">Create Template</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {list.map((t: any) => (
                <div key={t.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                        {t.template}
                      </pre>
                      <p className="text-xs text-gray-400 mt-2">
                        Created {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(t.id)} className="btn-danger text-sm shrink-0">
                      Delete
                    </button>
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
