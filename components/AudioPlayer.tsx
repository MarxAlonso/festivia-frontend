'use client';

import React from 'react';

function parseYouTubeId(u?: string) {
  if (!u) return '';
  try {
    const url = new URL(u);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') || '';
  } catch {}
  const m = u.match(/(?:v=|be\/)([\w-]{6,})/);
  return m?.[1] || '';
}

export function AudioPlayer({ source, url }: { source: 'file' | 'youtube'; url?: string }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const ytRef = React.useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (source === 'file') {
      const a = audioRef.current;
      if (!a) return;
      const onInteract = () => {
        try {
          a.muted = false;
          a.play().catch(() => {});
        } catch {}
      };
      a.autoplay = true;
      a.loop = true;
      a.setAttribute("playsinline", "true");
      a.muted = true;
      a.play().catch(() => {});
      ['pointerdown','click','touchstart','keydown'].forEach((ev) => document.addEventListener(ev, onInteract, { once: true } as any));
      return () => ['pointerdown','click','touchstart','keydown'].forEach((ev) => document.removeEventListener(ev, onInteract as any));
    }
    const id = parseYouTubeId(url);
    if (!id) return;
    const initYT = () => {
      const YT = (window as any).YT;
      if (!YT || !ytRef.current) return;
      const player = new YT.Player(ytRef.current, {
        width: '0',
        height: '0',
        videoId: id,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, loop: 1, playlist: id, start: 10 },
        events: {
          onReady: (e: any) => {
            setReady(true);
            try { e.target.mute(); e.target.seekTo(10, true); e.target.playVideo(); } catch {}
          },
        },
      });
      const onInteract = () => {
        try { player.unMute(); player.playVideo(); } catch {}
      };
      ['pointerdown','click','touchstart','keydown'].forEach((ev) => document.addEventListener(ev, onInteract, { once: true } as any));
    };
    const scriptId = 'yt-iframe-api';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(s);
    }
    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYT;
    }
    return () => {
    };
  }, [source, url]);

  if (source === 'file') {
    return <audio ref={audioRef} src={url} style={{ display: 'none' }} />;
  }
  return <div ref={ytRef} style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute', left: -9999 }} />;
}

export default AudioPlayer;