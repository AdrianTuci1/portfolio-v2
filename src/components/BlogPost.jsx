import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PageLayout } from './PageLayout.jsx';
import { useMemo } from 'react';
import { MetaZone } from './MetaZone.jsx';
import './Blog.css';

const SCRAMBLE_CHARS = '-@#$%^';

function ScrambledText({ text, isHovered }) {
  const [displayValue, setDisplayValue] = useState(isHovered ? '' : text);

  useEffect(() => {
    if (isHovered) {
      setDisplayValue('');
    } else {
      let iteration = 0;
      const targetText = text;
      const interval = setInterval(() => {
        const scrambled = targetText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('');

        setDisplayValue(scrambled);
        iteration += 2; // Faster speed adjustment

        if (iteration >= targetText.length) {
          clearInterval(interval);
          setDisplayValue(targetText);
        }
      }, 35);
      return () => clearInterval(interval);
    }
  }, [isHovered, text]);

  return <span className="scrambled-part">{displayValue}</span>;
}

const ThickArrow = () => (
  <svg
    width="16"
    height="12"
    viewBox="0 0 16 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="thick-arrow-svg"
  >
    <path
      d="M14 6H2M2 6L6 2M2 6L6 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function BlogPost({ post, returnLabel, isLive, fallbackContent }) {
  const [isHovered, setIsHovered] = useState(false);



  useEffect(() => {
    if (post) {
      const originalTitle = document.title;
      const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');

      // Update for the current post
      document.title = `${post.title} | Tucicovenco Adrian`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.summary || post.subtitle || '');
      }

      return () => {
        // Restore original metadata
        document.title = originalTitle;
        if (metaDescription && originalDescription) {
          metaDescription.setAttribute('content', originalDescription);
        }
      };
    }
  }, [post]);

  if (!post) {
    return (
      <PageLayout isBlog>
        <section className="blog-page">
          <a className="return-link" href="#/">
            <ThickArrow /> {returnLabel}
          </a>
          <h1>Post not found</h1>
          <p>The requested note is not in the content file yet.</p>
        </section>
      </PageLayout>
    );
  }

  // Generate a URL-friendly ID from a string
  const slugify = (str) => str?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  // Use fallback local markdown content
  const mdownContent = fallbackContent;
  const legacyContent = post.content;

  // Dynamic TOC for Markdown content
  const mdownSections = useMemo(() => {
    if (!mdownContent) return null;
    const lines = mdownContent.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      // Look for custom eyebrows/titles like "### I. Title"
      const headerMatch = trimmedLine.match(/^###\s+([A-Z]+\.)\s+(.*)/);
      if (headerMatch) {
        currentSection = { eyebrow: headerMatch[1], title: headerMatch[2], links: [] };
        sections.push(currentSection);
      } else if (currentSection) {
        // Look for subheadings if any
        const subMatch = trimmedLine.match(/^####\s+(.*)/);
        if (subMatch) {
          currentSection.links.push({ title: subMatch[1] });
        }
      }
    });

    // If we have ### but no ####, let's at least make the ### clickable
    return sections.length > 0 ? sections : null;
  }, [mdownContent]);

  const activeSections = mdownSections || post.sections;

  return (
    <PageLayout isBlog>
      <section className="blog-left-panel">
        {activeSections && (
          <aside className="blog-sidebar" aria-label="Table of contents">
            <div className="sidebar-toc-container">
              <nav className="sidebar-toc">
                {activeSections.map((section) => (
                  <div className="toc-group" key={section.eyebrow}>
                    <a href={`#${slugify(section.eyebrow)}`} className="toc-eyebrow">
                      {section.eyebrow}
                    </a>
                    <div className="toc-links">
                      {section.links?.map((link) => (
                        <a
                          key={link.title}
                          href={`#${slugify(link.title)}`}
                          className="toc-link"
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        )}

        <article className={`blog-page post-page ${!activeSections ? 'no-sidebar' : ''}`}>
          <div className="return-banner-container">
            <a
              className={`return-link ${isHovered ? 'is-hovered' : ''}`}
              href="/"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="return-inner">
                {!isHovered && (
                  <span className="arrow">
                    <ThickArrow />
                  </span>
                )}
                <span className="return-text">
                  <span className="primary-text">Return</span>
                  <ScrambledText text=" to main page" isHovered={isHovered} />
                </span>
              </span>
            </a>
          </div>

          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <p className="post-summary">{post.summary}</p>
            <div className="post-meta-row">
              <span className="post-status-tag">{post.status}</span>
              <span className="post-date">{post.date}</span>
            </div>
          </header>

          <div className="post-body">
            {mdownContent ? (
              <div className="post-markdown-content">
                <ReactMarkdown
                  components={{
                    h3: ({ node, children, ...props }) => {
                      const text = String(children);
                      const eyebrowMatch = text.match(/([A-Z]+\.)/);
                      const id = eyebrowMatch ? slugify(eyebrowMatch[1]) : slugify(text);
                      return (
                        <h3 id={id} {...props}>
                          {children}
                        </h3>
                      );
                    },
                    h4: ({ node, children, ...props }) => {
                      const id = slugify(String(children));
                      return (
                        <h4 id={id} {...props}>
                          {children}
                        </h4>
                      );
                    },
                  }}
                >
                  {mdownContent}
                </ReactMarkdown>
              </div>
            ) : legacyContent ? (
              <div className="post-text-content">
                {legacyContent.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : post.sections ? (
              post.sections.map((section) => (
                <section
                  className="essay-section"
                  key={section.title}
                  id={slugify(section.eyebrow)}
                >
                  <h2 className="section-title">
                    <span className="section-num">{section.eyebrow}</span> {section.title}
                  </h2>
                  <div className="section-content">
                    {section.links.map((link) => (
                      <div
                        className="essay-block"
                        key={link.title}
                        id={slugify(link.title)}
                      >
                        <a className="essay-anchor-link" href={`#${slugify(link.title)}`}>
                          {link.title}
                        </a>
                        <p className="essay-body-text">{link.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p>No content available.</p>
            )}
          </div>
          <MetaZone />
        </article>
      </section>
    </PageLayout>
  );
}
