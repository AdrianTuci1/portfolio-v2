import { HudLink } from './HudLink.jsx';
import './ProfilePanel.css';

const profileImage = '/profile.jpg';

const socialIconAssets = {
  gh: '/git.png',
  in: '/in.png',
};

export function ProfilePanel({ content, isLoading = false }) {
  const { profile, social, tags } = content;

  if (isLoading) {
    return (
      <header className="profile-panel">
        <div className="loading-message">
          <div className="loading-line-1">Welcome, enjoy your day</div>
          <div className="loading-line-2">(Just a moment...)</div>
        </div>
      </header>
    );
  }

  return (
    <header className="profile-panel">
      <h1>{profile.name}</h1>
      <div className="profile-grid">
        <div className="portrait-placeholder" role="img" aria-label={profile.imageAlt}>
          <img src={profileImage} alt={profile.imageAlt} aria-hidden="false" width={360} height={360} style={{ marginTop: '-120px', marginLeft: '-170px' }} />
        </div>
        <div className="bio-copy">
          <p className="role-line">{profile.role}</p>
          {profile.intro.map((paragraph) => {
            const linkMapping = {
              'Staticlabs': 'https://staticlabs.ro',
              'V8media': 'https://v8media.ro',
              'adrian@tuci.dev': 'mailto:adrian@tuci.dev'
            };

            const keywords = Object.keys(linkMapping).join('|');
            const linkRegex = new RegExp(`(${keywords})`, 'gi');
            const parts = paragraph.split(linkRegex).filter(Boolean);

            return (
              <p key={paragraph}>
                {parts.map((part, i) => {
                  // Normalize for lookup (emails are case insensitive, but we match exactly for names)
                  const normalizedPart = Object.keys(linkMapping).find(k => k.toLowerCase() === part.toLowerCase());
                  const href = linkMapping[normalizedPart];

                  if (href) {
                    const isEmail = href.startsWith('mailto:');
                    return (
                      <a
                        key={i}
                        href={href}
                        target={!isEmail ? "_blank" : undefined}
                        rel={!isEmail ? "noopener noreferrer" : undefined}
                        className="blink-link underline-link"
                      >
                        {part}
                      </a>
                    );
                  }
                  return part;
                })}
              </p>
            );
          })}
        </div>
      </div>

      <nav className="social-row" aria-label="Social links">
        {social.map((item) => (
          <HudLink key={item.label} item={item} compact noBlink>
            <span className={`social-icon ${socialIconAssets[item.icon] ? 'has-image' : 'is-letter'}`}>
              {socialIconAssets[item.icon] ? (
                <img src={socialIconAssets[item.icon]} alt={`${item.label} icon`} aria-hidden="true" />
              ) : (
                item.icon
              )}
            </span>
            <span className="blink-link social-label">{item.label}</span>
          </HudLink>
        ))}
      </nav>

      <div className="tag-row" aria-label="Topics">
        {tags.map((tag) => (
          <span key={tag} className="topic-tag">
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
}
