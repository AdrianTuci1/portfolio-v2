import { useEffect, useMemo, useState } from 'react';
import siteContent from './data/siteContent.json';
import { ProfilePanel } from './components/ProfilePanel.jsx';
import { DrawerMenu } from './components/DrawerMenu.jsx';
import { BlogIndex } from './components/BlogIndex.jsx';
import { BlogPost } from './components/BlogPost.jsx';
import { PageLayout } from './components/PageLayout.jsx';
import './App.css';

// --- Local Fallback Logic (Markdown) ---
const localPostModules = import.meta.glob('./content/posts/*.md', { query: '?raw', eager: true });

function parseMD(raw, filePath) {
  const slug = filePath.split('/').pop().replace('.md', '');
  const metadata = { slug };

  if (typeof raw !== 'string') {
    console.error(`parseMD: raw is not a string for ${filePath}`, raw);
    return { ...metadata, title: slug, subtitle: '', content: '' };
  }

  const match = raw.match(/---\s*([\s\S]*?)\s*---/);
  
  if (match) {
    const yaml = match[1];
    yaml.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^['"](.*)['"]$/, '$1');
        metadata[key] = value;
      }
    });
  }
  
  return {
    ...metadata,
    order: parseInt(metadata.order) || 999,
    subtitle: metadata.summary || metadata.subtitle || '',
    content: raw.replace(match ? match[0] : '', '').trim()
  };
}

const fallbackPosts = Object.entries(localPostModules)
  .map(([path, module]) => parseMD(module.default || module, path))
  .sort((a, b) => a.order - b.order);
// ---------------------------------------

function getRoute() {
  const path = window.location.pathname.replace(/^\//, '');
  const [page, slug] = path.split('/');

  if (page === 'blog' && slug) {
    return { page: 'post', slug };
  }

  if (page === 'blog') {
    return { page: 'blog' };
  }

  return { page: 'home' };
}

function useHistoryRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const syncRoute = () => setRoute(getRoute());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('pushstate', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('pushstate', syncRoute);
    };
  }, []);

  return route;
}

// Helper to navigate without page reload
export const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new Event('pushstate'));
};

function useHashRoute() {
  return useHistoryRoute();
}

function HomePage({ siteContent, isLoading }) {
  if (!siteContent) return null;
  return (
    <PageLayout isLoading={isLoading}>
      <section className="content-column" aria-label="Portfolio content">
        <ProfilePanel content={siteContent} isLoading={isLoading} />
        {!isLoading && <DrawerMenu menus={siteContent.menus} />}
      </section>
    </PageLayout>
  );
}

function App() {
  const route = useHashRoute();
  const [isLoading, setIsLoading] = useState(true);
  
  // Static-first approach: posts come directly from Markdown files
  const posts = fallbackPosts;

  const mergedContent = useMemo(() => {
    // We clone the base siteContent and inject the dynamic blog posts
    const newContent = JSON.parse(JSON.stringify(siteContent));
    const blogMenu = newContent.menus.find(m => m.id === 'blog');
    
    if (blogMenu) {
      blogMenu.items = posts.map(p => ({
        title: p.title,
        subtitle: p.subtitle,
        url: `/blog/${p.slug}`
      }));
    }
    return newContent;
  }, [posts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const link = e.target.closest('a');
      if (
        link && 
        link.href && 
        link.href.startsWith(window.location.origin) && 
        !link.getAttribute('target') &&
        !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
      ) {
        const url = new URL(link.href);
        const relativePath = url.pathname + url.search + url.hash;
        
        if (url.pathname !== window.location.pathname || !url.hash) {
          e.preventDefault();
          navigate(relativePath);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const post = useMemo(
    () => posts.find((item) => item.slug === route.slug),
    [posts, route.slug],
  );

  if (route.page === 'post') {
    return (
      <BlogPost
        post={post}
        posts={posts}
        returnLabel={mergedContent.blog.returnLabel}
        isLive={false}
        fallbackContent={post?.content}
      />
    );
  }

  if (route.page === 'blog') {
    return <BlogIndex blog={mergedContent.blog} posts={posts} />;
  }

  return <HomePage siteContent={mergedContent} isLoading={isLoading} />;
}

export default App;
