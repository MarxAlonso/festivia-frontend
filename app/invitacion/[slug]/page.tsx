'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { invitationService } from '@/lib/invitations';

type ColorKey = 'primary' | 'secondary' | 'accent' | 'text';
type PageElement = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  zIndex?: number;
  rotation?: number;
  content?: string;
  src?: string;
  width?: number;
  height?: number;
  styles?: React.CSSProperties;
};

type EditableDesign = {
  colors?: Partial<Record<ColorKey, string>>;
  fonts?: { heading?: string; body?: string };
  layout?: string;
  content?: { header?: string; body?: string; footer?: string; images?: string[] };
  pages?: Array<{
    background?: { type: 'color' | 'image'; value: string };
    sections?: Array<{ key: string; text?: string }>;
    elements?: PageElement[];
  }>;
};

export default function PublicInvitationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>('');
  const [designData, setDesignData] = useState<EditableDesign | null>(null);
  const [event, setEvent] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await invitationService.getPublicInvitationBySlug(slug);
        setTitle(data.title);
        setDesignData((data.customDesign || {}) as EditableDesign);
        setEvent(data.event || null);
      } catch (err) {
        console.error('Error cargando invitación pública:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const previewStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${designData?.colors?.primary || '#8b5cf6'}, ${designData?.colors?.secondary || '#f59e0b'})`,
      color: designData?.colors?.text || '#ffffff',
      fontFamily: designData?.fonts?.body || 'sans-serif',
    }),
    [designData]
  );

  return (
    <div className="min-h-screen bg-[#F6E7E4]">
      <div className="px-6 py-6">
        {/* Vista de ancho completo, sin barras laterales */}
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebrity-purple"></div>
            </div>
          ) : designData?.pages && designData.pages.length > 0 ? (
            <div className="space-y-6">
              {designData.pages.map((page, idx) => {
                const style = page.background?.type === 'image'
                  ? { backgroundImage: `url(${page.background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: page.background?.value || '#ffffff' };
                const header = page.sections?.find((s) => s.key === 'header')?.text || '';
                const body = page.sections?.find((s) => s.key === 'body')?.text || '';
                const footer = page.sections?.find((s) => s.key === 'footer')?.text || '';
                const dateStr = event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : '';
                const infoLineParts = [event?.title || '', dateStr, event?.location || ''].filter(Boolean);
                const infoLine = infoLineParts.join(' • ');
                const desc = event?.description || '';
                const details = [infoLine, desc].filter(Boolean).join('\n');
                const enhancedBody = [body, details].filter(Boolean).join('\n\n');
                const isCentered = designData?.layout === 'centered-header';
                return (
                  <div key={idx} className="w-full">
                    <div className="rounded-lg border border-celebrity-gray-200 overflow-hidden" style={{ width: '100%', minHeight: 640, position: 'relative', ...style }}>
                      <div className="absolute inset-0 p-6">
                        {isCentered ? (
                          <>
                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-center text-celebrity-gray-900" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>{header}</div>
                            <div className="absolute left-6 right-6 top-[60%] text-base text-center whitespace-pre-line text-celebrity-gray-800" style={{ fontFamily: designData?.fonts?.body || 'sans-serif' }}>{enhancedBody}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-2xl font-bold text-celebrity-gray-900" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>{header}</div>
                            <div className="mt-4 text-base whitespace-pre-line text-celebrity-gray-800" style={{ fontFamily: designData?.fonts?.body || 'sans-serif' }}>{enhancedBody}</div>
                          </>
                        )}
                        <div className="absolute left-6 right-6 bottom-6 text-sm opacity-80 text-celebrity-gray-700">{footer}</div>

                        {(page.elements || []).map((el) => {
                          const baseStyle: React.CSSProperties = {
                            position: 'absolute',
                            left: el.x,
                            top: el.y,
                            zIndex: el.zIndex || 1,
                            transform: `rotate(${el.rotation || 0}deg)`,
                            ...(el.styles || {}),
                          };
                          if (el.type === 'text') {
                            return (
                              <div key={el.id} style={{ ...baseStyle, fontFamily: (el.styles?.fontFamily as string) || designData?.fonts?.body || 'sans-serif' }}>
                                {el.content}
                              </div>
                            );
                          }
                          if (el.type === 'image' && el.src) {
                            return (
                              <div key={el.id} style={{ ...baseStyle, width: el.width || 200, height: el.height || 200, position: 'absolute' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: (el.styles?.objectFit as any) || 'cover' }} />
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg flex items-center justify-center" style={{ ...previewStyle, minHeight: 480 }}>
              <div className="text-center" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>
                <h2 className="text-3xl font-bold mb-2">{title || 'Invitación'}</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}