import { getBlogs } from '@/lib/actions/blog';
import Link from 'next/link';
import { FileText, Calendar, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Health Blog - AI-Generated Health Articles',
  description: 'Browse AI-generated health articles covering symptoms, diet recommendations, lifestyle improvements, and more.',
};

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
  const result = await getBlogs();
  const blogs = result.data || [];

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Knowledge Base</p>
        <h1 className="text-3xl font-light text-health-text tracking-tight">
          Health Articles
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">AI-generated health insights from your conversations</p>
      </div>

      {blogs.length === 0 ? (
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-medium text-health-text mb-2">No Articles Yet</h2>
          <p className="text-zinc-500 max-w-sm mx-auto mb-6">
            Articles are automatically generated from your health chat conversations. Start a conversation to generate your first article.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-all"
          >
            Start a Conversation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {blogs.map((blog: any) => (
            <Link
              key={blog.id}
              href={`/blogs/${blog.slug}`}
              className="group rounded-3xl bg-zinc-900 border border-zinc-800 p-8 hover:border-zinc-700 transition-all hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-medium text-health-text group-hover:text-primary-400 transition-colors tracking-tight mb-3">
                    {blog.title}
                  </h2>
                  {blog.metaDescription && (
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                      {blog.metaDescription}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-zinc-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {blog.user?.name && (
                      <span>by {blog.user.name}</span>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-zinc-800 rounded-2xl group-hover:bg-primary-600/20 transition-colors shrink-0">
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
