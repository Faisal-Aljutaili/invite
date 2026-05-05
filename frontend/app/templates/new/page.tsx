'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { templates } from '@/lib/api';

const STARTER = `# You're Invited! 🎉

Hi there,

We'd love to have you join us for our special event.

**Date:** {{date}}

Please click the link below to accept or decline this invitation.`;

export default function NewTemplatePage() {
  const router = useRouter();
  const [content, setContent] = useState(STARTER);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await templates.create({ template: content });
      toast.success('Template saved!');
      router.push('/templates');
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
        <main className="flex-1 p-8 pt-16 lg:pt-8">
          <div className="mb-6">
            <Link href="/templates" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Templates
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">New Template</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <button type="button" onClick={() => setPreview(false)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${!preview ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Write
                </button>
                <button type="button" onClick={() => setPreview(true)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${preview ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  Preview
                </button>
              </div>

              {preview ? (
                <div className="prose max-w-none min-h-64 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  className="w-full min-h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              )}

              <p className="text-xs text-gray-400 mt-2">Supports Markdown. Use plain text for WhatsApp messages.</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Saving…' : 'Save Template'}
              </button>
              <Link href="/templates" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
