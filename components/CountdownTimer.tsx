'use client';

import React from 'react';

function diffParts(target: Date) {
  const now = new Date();
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function parseLocal(targetDate?: string | Date) {
  if (typeof targetDate === 'string') {
    const m = targetDate.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const h = Number(m[4]);
      const mi = Number(m[5]);
      return new Date(y, mo - 1, d, h, mi, 0, 0);
    }
    return new Date(targetDate);
  }
  return targetDate instanceof Date ? targetDate : new Date();
}

export function CountdownTimer({ targetDate, className, style }: { targetDate?: string | Date; className?: string; style?: React.CSSProperties }) {
  const initial = React.useMemo(() => diffParts(parseLocal(targetDate)), [targetDate]);

  const [parts, setParts] = React.useState(initial);

  React.useEffect(() => {
    const target = parseLocal(targetDate);
    const id = setInterval(() => {
      setParts(diffParts(target));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const itemCls = 'flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-white/70 backdrop-blur text-celebrity-gray-900';
  const numCls = 'text-2xl font-bold';
  const labelCls = 'text-xs opacity-70';

  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')} style={style}>
      <div className={itemCls}><div className={numCls}>{String(parts.days).padStart(2, '0')}</div><div className={labelCls}>D</div></div>
      <div className={itemCls}><div className={numCls}>{String(parts.hours).padStart(2, '0')}</div><div className={labelCls}>H</div></div>
      <div className={itemCls}><div className={numCls}>{String(parts.minutes).padStart(2, '0')}</div><div className={labelCls}>M</div></div>
      <div className={itemCls}><div className={numCls}>{String(parts.seconds).padStart(2, '0')}</div><div className={labelCls}>S</div></div>
    </div>
  );
}

export default CountdownTimer;