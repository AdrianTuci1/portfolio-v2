import './HudLink.css';

function normalizeHref(url) {
  return url || '#';
}

export function HudLink({ item, children, compact = false, noBlink = false }) {
  return (
    <a 
      className={`hud-link ${!noBlink ? 'blink-link' : ''} ${compact ? 'is-compact' : ''}`} 
      href={normalizeHref(item.url)}
    >
      {children}
    </a>
  );
}
