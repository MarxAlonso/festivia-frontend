'use client';

import React from 'react';

function buildEmbedSrc({ query, url }: { query?: string; url?: string }) {
  const u = url || '';
  if (u.includes('/embed')) return u;
  const q = query || url || '';
  const enc = encodeURIComponent(q);
  return `https://www.google.com/maps?q=${enc}&output=embed`;
}

export function MapEmbed({ query, url, className, style }: { query?: string; url?: string; className?: string; style?: React.CSSProperties }) {
  const src = React.useMemo(() => buildEmbedSrc({ query, url }), [query, url]);
  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 8, overflow: 'hidden', ...(style || {}) }}>
      <iframe
        src={src}
        style={{ border: 0, width: '100%', height: '100%' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}

export default MapEmbed;