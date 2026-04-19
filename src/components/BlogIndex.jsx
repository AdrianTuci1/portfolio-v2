import { PageLayout } from './PageLayout.jsx';
import './Blog.css';

export function BlogIndex({ blog, posts }) {
  return (
    <PageLayout isBlog>
      <aside className="blog-sidebar" aria-label="Blog index">
        {posts.map((post, index) => (
          <a className="blog-side-link blink-link" key={post.slug} href={`/blog/${post.slug}`}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{post.title}</strong>
          </a>
        ))}
      </aside>
      <section className="blog-page">
        <a className="return-link blink-link" href="/">
          {'<-'} {blog.returnLabel}
        </a>
        <h1>Blog</h1>
        <p className="blog-summary">
          Notes and essays about AI, interfaces, systems, and the way digital tools reshape attention.
        </p>
        <div className="post-list">
          {posts.map((post) => (
            <a className="post-card" key={post.slug} href={`/blog/${post.slug}`}>
              <span className="post-status">{post.status}</span>
              <strong>{post.title}</strong>
              <span>{post.summary}</span>
              <small>{post.date}</small>
            </a>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
