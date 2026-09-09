import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CATEGORIES } from '../types';

export default function NewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('other');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/posts', { title, content, category });
      navigate('/forum?justPosted=1');
    } catch {
      alert('Failed to post. Please sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-brown-900 mb-6">Start a Discussion</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-peach-100 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-peach-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            placeholder="Summarize your topic in one sentence"
            className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-peach-400"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Content (Markdown supported)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
            placeholder="Share your thoughts, questions, and reflections..."
            className="w-full px-3 py-2 border border-peach-100 rounded-lg text-sm resize-y focus:outline-none focus:ring-1 focus:ring-peach-400 font-mono"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/forum')}
            className="px-4 py-2 text-gray-600 bg-transparent border border-peach-100 rounded-lg text-sm cursor-pointer hover:bg-warm-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-peach-500 text-white rounded-lg text-sm cursor-pointer border-0 hover:bg-peach-600 disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
}
