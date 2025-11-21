'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MapEmbed } from '@/components/MapEmbed';
import { useParams } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { invitationService, Invitation } from '@/lib/invitations';
import { eventService, Event } from '@/lib/events';
import { Sparkles, Eye, TrendingUp } from 'lucide-react';
import Image from 'next/image';

type ColorKey = 'primary' | 'secondary' | 'accent' | 'text';
type PageElement = {
  id: string;
  type: 'text' | 'image' | 'countdown' | 'map' | 'whatsapp' | 'audio';
  x: number;
  y: number;
  zIndex?: number;
  rotation?: number;
  content?: string;   // para tipo 'text'
  src?: string;       // para tipo 'image'
  width?: number;
  height?: number;
  styles?: React.CSSProperties;
  countdown?: { source: 'event' | 'custom'; dateISO?: string };
  map?: { source: 'event' | 'custom'; query?: string; url?: string };
  whatsapp?: { phone?: string; message?: string; label?: string };
};

type EditableDesign = {
  colors?: Partial<Record<ColorKey, string>>;
  fonts?: { heading?: string; body?: string };
  layout?: string;
  content?: { header?: string; body?: string; footer?: string; images?: string[] };
  pages?: Array<{
    background?: { type: 'color' | 'image'; value: string };
    sections?: Array<{ key: string; text?: string }>;
    elements?: PageElement[]; // <-- aquí agregamos elements
  }>;
};

export default function InvitationPreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);

  const [designData, setDesignData] = useState<EditableDesign>({
    colors: { primary: '#8b5cf6', secondary: '#f59e0b', accent: '#ec4899', text: '#1f2937' },
    fonts: { heading: 'serif', body: 'sans-serif' },
    layout: 'classic',
    content: { header: '', body: '', footer: '', images: [] },
  });

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);
        const data = await invitationService.getInvitationById(id);
        setInvitation(data);
        // Cargar detalles del evento asociado, si existe
        if (data.eventId) {
          try {
            const ev = await eventService.getEventById(data.eventId);
            setEvent(ev);
          } catch (eventErr) {
            console.error('Error cargando evento asociado:', eventErr);
          }
        }
        if (data.customDesign) {
          setDesignData(data.customDesign as unknown as EditableDesign);
        }
      } catch (err) {
        console.error('Error cargando invitación para vista:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadInvitation();
  }, [id]);

  const previewStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${designData?.colors?.primary || '#8b5cf6'}, ${designData?.colors?.secondary || '#f59e0b'})`,
      color: designData?.colors?.text || '#ffffff',
      fontFamily: designData?.fonts?.body || 'sans-serif',
    }),
    [designData]
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 720, h: 480 });
  const [confirmations, setConfirmations] = useState<Array<{ id: string; name: string; lastName: string; createdAt: string }>>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new (window as any).ResizeObserver((entries: any) => {
      const rect = entries[0]?.contentRect;
      setContainerSize({ w: rect?.width || 720, h: rect?.height || 480 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <OrganizerProtectedRoute>
      <div className="flex h-screen" style={{ backgroundColor: '#D4AF37' }}>
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">Vista previa</h1>
                <p className="text-celebrity-gray-600 mt-1">Previsualiza tu invitación antes de compartirla</p>
              </div>
              <div className="space-x-2">
                <Button onClick={() => window.print()}>
                  <Eye className="w-4 h-4 mr-2" /> Imprimir/Guardar
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const res = await invitationService.generateUniqueLink(id);
                      const link = res.link;
                      try { await navigator.clipboard.writeText(link); } catch {}
                      window.open(link, '_blank');
                    } catch (err) {
                      console.error('Error generando enlace de invitación:', err);
                      alert('No se pudo generar el enlace público.');
                    }
                  }}
                >
                  Compartir
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vista previa principal (multi-página si existe) */}
            <div className="lg:col-span-2 celebrity-card p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebrity-purple"></div>
                </div>
              ) : designData?.pages && designData.pages.length > 0 ? (
                <div className="space-y-6" ref={containerRef}>
                  {/* Audio global de la invitación (toma el primero) */}
                  {(() => {
                    const all = designData.pages || [];
                    for (const pg of all) {
                      for (const el of (pg.elements || [])) {
                        if ((el as any).type === 'audio' && (el as any).audio) {
                          const a = (el as any).audio as { source: 'file' | 'youtube'; url?: string };
                          return (
                            <div key={`audio-global`} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', left: -9999, top: -9999 }}>
                              <AudioPlayer source={a.source} url={a.url || ''} />
                            </div>
                          );
                        }
                      }
                    }
                    return null;
                  })()}
                  {designData.pages.map((page, idx) => {
                    const style = page.background?.type === 'image'
                      ? { backgroundImage: `url(${page.background.value})`, backgroundSize: (((page as any).background?.fit as string) || 'cover'), backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#D4AF37' }
                      : { background: page.background?.value || '#D4AF37' };
                    const header = page.sections?.find((s) => s.key === 'header')?.text || '';
                    const body = page.sections?.find((s) => s.key === 'body')?.text || '';
                    const footer = page.sections?.find((s) => s.key === 'footer')?.text || '';
                    const enhancedBody = body;
                    const isCentered = designData?.layout === 'centered-header';
                    const isLandscape = ((page as any).orientation || 'portrait') === 'landscape';
                    const pageW = isLandscape ? 640 : 360;
                    const pageH = isLandscape ? 360 : 640;
                    const scale = Math.min(containerSize.w / pageW, (containerSize.h || 480) / pageH);
                    return (
                      <div key={idx} className="mx-auto" style={{ width: pageW * scale, height: pageH * scale }}>
                        <div className="rounded-lg overflow-hidden" style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, width: pageW, height: pageH, transform: `scale(${scale})`, transformOrigin: 'top left', ...style }}>
                            <div className="absolute inset-0 p-4">
                            {isCentered ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                <div className="text-3xl font-bold text-celebrity-gray-900" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>{header}</div>
                                <div className="mt-4 text-sm whitespace-pre-line text-celebrity-gray-800" style={{ fontFamily: designData?.fonts?.body || 'sans-serif' }}>{enhancedBody}</div>
                              </div>
                            ) : (
                              <>
                                <div className="text-xl font-bold text-celebrity-gray-900" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>{header}</div>
                                <div className="mt-4 text-sm whitespace-pre-line text-celebrity-gray-800" style={{ fontFamily: designData?.fonts?.body || 'sans-serif' }}>{enhancedBody}</div>
                              </>
                            )}
                            <div className="absolute left-4 right-4 bottom-4 text-xs opacity-80 text-celebrity-gray-700">{footer}</div>

                            {/* Elementos dinámicos (texto/imágenes/mapa/cronómetro) guardados en las páginas */}
                            {(page.elements || []).map((el) => {
                              const baseStyle: React.CSSProperties = {
                                position: 'absolute',
                                left: el.x,
                                top: el.y,
                                zIndex: el.zIndex || 1,
                                transform: `rotate(${el.rotation || 0}deg)`,
                                ...(el.styles || (el as any).style || {}),
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
                                <div
                                  key={el.id}
                                  style={{
                                    ...baseStyle,
                                    width: el.width || 100,
                                    height: el.height || 100,
                                    position: 'absolute',
                                  }}
                                >
                                  {(() => {
                                    const objectFitStyle = (el.styles?.objectFit as any) || (el as any).style?.objectFit || 'contain';
                                    return (
                                      <Image
                                        src={el.src}
                                        alt=""
                                        fill
                                        style={{ objectFit: objectFitStyle }}
                                      />
                                    );
                                  })()}
                                </div>
                              );
                              }
                              if (el.type === 'map') {
                                const q = (el.map?.source || 'event') === 'event' ? (event?.location || '') : (el.map?.query || el.map?.url || '');
                                return (
                                  <div key={el.id} style={{ ...baseStyle, width: el.width || 300, height: el.height || 200 }}>
                                    <MapEmbed query={q} />
                                  </div>
                                );
                              }
                              if (el.type === 'countdown') {
                                const target = (el.countdown?.source || 'event') === 'event' ? event?.eventDate : el.countdown?.dateISO;
                                return (
                                  <div key={el.id} style={{ ...baseStyle, width: el.width || 300, height: el.height || 60 }}>
                                    <CountdownTimer targetDate={target} />
                                  </div>
                                );
                              }
                              if ((el as any).type === 'audio') {
                                
                                return <></>;
                              }
                              if (el.type === 'whatsapp') {
                                const phone = el.whatsapp?.phone || '';
                                const message = el.whatsapp?.message || '';
                                const label = el.whatsapp?.label || 'Agendar asistencia';
                                const num = (phone || '').replace(/[^0-9]/g, '');
                                return (
                                  <a
                                    key={el.id}
                                    href={`https://wa.me/${num}?text=${encodeURIComponent(message)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      ...baseStyle,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: el.width || 220,
                                      height: el.height || 44,
                                      backgroundColor: (el.styles?.backgroundColor as string) || '#25D366',
                                      color: (el.styles?.color as string) || '#ffffff',
                                      borderRadius: (el.styles?.borderRadius as number) || 8,
                                      textDecoration: 'none',
                                      fontWeight: 600,
                                    }}
                                  >
                                    {label}
                                  </a>
                                );
                              }
                              return null;
                            })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[480px] rounded-lg flex items-center justify-center" style={previewStyle}>
                  <div className="text-center" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>
                    <Sparkles className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">{invitation?.title || 'Tu invitación'}</h2>
                    {designData?.content?.header && <p className="text-lg mb-2">{designData.content.header}</p>}
                    {/* Añadir datos del evento en la vista básica */}
                    <div className="max-w-xl mx-auto whitespace-pre-line">
                      {[designData?.content?.body, [event?.title, event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : '', event?.location].filter(Boolean).join(' • '), event?.description].filter(Boolean).join('\n\n')}
                    </div>
                    {designData?.content?.footer && <p className="text-sm mt-4 opacity-80">{designData.content.footer}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Panel lateral de datos */}
            <div className="celebrity-card p-6">
              <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-celebrity-purple" />
                Detalles
              </h3>
              <div className="space-y-2 text-sm text-celebrity-gray-700">
                <p><span className="font-medium">Título:</span> {invitation?.title || '-'}</p>
                <p><span className="font-medium">Estado:</span> {invitation?.status || '-'}</p>
                <p><span className="font-medium">Evento:</span> {event?.title || invitation?.eventId || '-'}</p>
                <p><span className="font-medium">Creada:</span> {invitation?.createdAt ? new Date(invitation.createdAt).toLocaleString() : '-'}</p>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-celebrity-gray-900">Confirmaciones</h4>
                  <Button variant="outline" size="sm" onClick={async () => {
                    if (!invitation?.id) return;
                    try {
                      const res = await invitationService.getInvitationConfirmations(invitation.id);
                      setConfirmations(res);
                    } catch {}
                  }}>Actualizar</Button>
                </div>
                {confirmations.length === 0 ? (
                  <p className="text-sm text-celebrity-gray-600">Sin confirmaciones</p>
                ) : (
                  <div className="space-y-2">
                    {confirmations.map((c) => (
                      <div key={c.id} className="flex items-center justify-between border border-celebrity-gray-200 rounded px-3 py-2">
                        <span className="text-sm text-black">{c.name} {c.lastName}</span>
                        <span className="text-xs text-celebrity-gray-600">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}