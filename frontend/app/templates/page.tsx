'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { templates } from '@/lib/api';
import type { TemplateData } from '@/lib/types';

export default function TemplatesPage() {
  const [list, setList] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => templates.list().then(setList).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return;
    try {
      await templates.delete(id);
      setList(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
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
              <h2 className="text-2xl font-bold text-gray-900">Templates</h2>
              <p className="text-gray-500 mt-1">Markdown invite templates</p>
            </div>
            <Link href="/templates/new" className="btn-primary">+ New Template</Link>
          </div>

          {loading ? (
            <Spinner />
          ) : list.length === 0 ? (
            <EmptyState
              icon="📝"
              title="No templates yet"
              description="Create a markdown template to reuse across events."
              actionLabel="Create Template"
              actionHref="/templates/new"
            />
          ) : (
            <div className="grid gap-4">
              {list.map(t => (
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
