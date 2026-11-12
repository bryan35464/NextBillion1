import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { BlogPost } from '@/types';
import { formatDate } from '@/lib/format';
import { Plus, Save, Trash2, Edit3, X, Loader2, Newspaper } from 'lucide-react';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<BlogPost>>({});
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }).then(({ data }) => {
      if (data) setPosts(data as BlogPost[]);
    });
  };

  useEffect(() => { fetch(); }, []);

  const startAdd = () => {
    setShowAdd(true);
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', category: 'News', author: 'Next billion technologies Team', status: 'published' });
  };

  const startEdit = (post: BlogPost) => {
    setEditing(post);
    setShowAdd(false);
    setForm(post);
  };

  const handleSave = async () => {
    setSaving(true);
    const slug = form.slug || form.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '';
    const data = { ...form, slug };
    if (editing) {
      await supabase.from('blog_posts').update(data).eq('id', editing.id);
    } else {
      await supabase.from('blog_posts').insert(data);
    }
    fetch();
    setSaving(false);
    setEditing(null);
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog & News</h1>
          <p className="text-dark-400 mt-1">Manage blog posts and news articles</p>
        </div>
        <button onClick={startAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-brand-400" />
              </div>
              <span className={`badge ${post.status === 'published' ? 'badge-success' : 'bg-dark-600 text-dark-200'}`}>
                {post.status}
              </span>
            </div>
            <h3 className="text-white font-medium mb-1 line-clamp-2">{post.title}</h3>
            <p className="text-dark-400 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-dark-400 mb-3">
              <span>{post.category}</span>
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => startEdit(post)} className="flex-1 py-1.5 rounded-lg bg-dark-700 text-dark-300 hover:text-brand-400 text-xs font-medium transition-all flex items-center justify-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => handleDelete(post.id)} className="px-3 py-1.5 rounded-lg bg-dark-700 text-dark-300 hover:text-danger-400 text-xs transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="card p-12 text-center text-dark-400 col-span-full">No blog posts yet</div>}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Title</label>
                <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Slug</label>
                <input value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated-from-title" className="input-field" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Excerpt</label>
                <textarea value={form.excerpt || ''} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="input-field resize-y" />
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Content</label>
                <textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} className="input-field resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Category</label>
                  <input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Status</label>
                  <select value={form.status || 'published'} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Cover Image URL</label>
                <input value={form.cover_image_url || ''} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
