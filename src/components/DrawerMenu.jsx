import { useState } from 'react';
import { HudLink } from './HudLink.jsx';
import { MetaZone } from './MetaZone.jsx';
import './DrawerLights.css';
import './DrawerMenu.css';

export function DrawerMenu({ menus }) {
  const [openIds, setOpenIds] = useState([]);

  const toggleDrawer = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section className="drawer-stack" aria-label="Portfolio sections">
      {menus.map((menu) => {
        const isOpen = openIds.includes(menu.id);

        return (
          <article className={`drawer ${isOpen ? 'is-open' : ''}`} key={menu.id}>
            <button
              className="drawer-trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${menu.id}-drawer`}
              onClick={() => toggleDrawer(menu.id)}
            >
              <span className="drawer-title">{menu.title}</span>
              <span className="drawer-dots" aria-hidden="true">
                <span className="drawer-dot" />
                <span className="drawer-dot" />
                <span className="drawer-dot" />
              </span>
            </button>
            <div className="drawer-body" id={`${menu.id}-drawer`}>
              <div className="drawer-inner">
                {menu.items.map((item) => (
                  <div
                    className={`drawer-item ${item.noHover ? 'no-hover' : ''}`}
                    key={`${menu.id}-${item.title}`}
                  >
                    {item.url ? (
                      <HudLink item={item}>
                        {item.image && (
                          <div className="item-image-placeholder">
                            {typeof item.image === 'string' ? (
                              <img src={item.image} alt={item.title} className="item-image" />
                            ) : (
                              <div className="placeholder-content">
                                <span className="placeholder-icon">IMG</span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="item-copy">
                          <strong>{item.title}</strong>
                          <span>{item.subtitle}</span>
                        </span>
                        {(item.period || item.meta) && (
                          <span className="item-meta">
                            <span className={item.period && !/\d/.test(item.period) ? 'item-period-chip' : ''}>{item.period}</span>
                            <span>{item.meta}</span>
                          </span>
                        )}
                      </HudLink>
                    ) : (
                      <div className="item-static">
                        {item.image && (
                          <div className="item-image-placeholder">
                            {typeof item.image === 'string' ? (
                              <img src={item.image} alt={item.title} className="item-image" />
                            ) : (
                              <div className="placeholder-content">
                                <span className="placeholder-icon">IMG</span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="item-copy">
                          <strong>{item.title}</strong>
                          <span>{item.subtitle}</span>
                        </span>
                        {(item.period || item.meta) && (
                          <span className="item-meta">
                            <span className={item.period && !/\d/.test(item.period) ? 'item-period-chip' : ''}>{item.period}</span>
                            <span>{item.meta}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
      <MetaZone />
    </section>
  );
}
