import { AsciiTopology } from './AsciiTopology.jsx';

export function PageLayout({ children, isBlog = false, isLoading = false }) {
  return (
    <main className={isBlog ? 'blog-layout' : 'site-shell'}>
      {isBlog ? (
        <>
          {children}
          <AsciiTopology className="blog-topology" isLoading={isLoading} />
        </>
      ) : (
        <>
          <section className="left-section">
            <div className="shell-spacer"></div>
            <div className="content-column">
              {children}
            </div>
          </section>
          <AsciiTopology className="right-section" isLoading={isLoading} />
        </>
      )}
    </main>
  );
}
