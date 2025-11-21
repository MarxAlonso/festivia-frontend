"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { MapEmbed } from "@/components/MapEmbed";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useParams } from "next/navigation";
import { invitationService } from "@/lib/invitations";

type ColorKey = "primary" | "secondary" | "accent" | "text";
type PageElement = {
  id: string;
  type: "text" | "image" | "countdown" | "map" | "audio" | "whatsapp" | "confirm";
  x: number;
  y: number;
  zIndex?: number;
  rotation?: number;
  content?: string;
  src?: string;
  width?: number;
  height?: number;
  styles?: React.CSSProperties & { objectFit?: "fill" | "contain" | "cover" | "none" | "scale-down" };
  countdown?: { source: "event" | "custom"; dateISO?: string };
  map?: { source: "event" | "custom"; query?: string; url?: string };
  audio?: { source: "file" | "youtube"; url?: string };
  whatsapp?: { phone?: string; message?: string; label?: string };
  confirm?: { label?: string; dateISO?: string; endDateISO?: string };
};

type EditableDesign = {
  colors?: Partial<Record<ColorKey, string>>;
  fonts?: { heading?: string; body?: string };
  layout?: string;
  content?: { header?: string; body?: string; footer?: string; images?: string[] };
  pages?: Array<{
    background?: { type: "color" | "image"; value: string };
    sections?: Array<{ key: string; text?: string }>;
    elements?: PageElement[];
  }>;
};

type EventInfo = {
  id?: string;
  title?: string;
  eventDate?: string;
  location?: string;
  description?: string;
};

export default function PublicInvitationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<string>("");
  const [designData, setDesignData] = useState<EditableDesign | null>(null);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 360, h: 640 });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmLastName, setConfirmLastName] = useState('');
  const [savingConfirm, setSavingConfirm] = useState(false);
  const [activeConfirm, setActiveConfirm] = useState<{ label?: string; dateISO?: string; endDateISO?: string } | null>(null);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new (window as any).ResizeObserver((entries: any) => {
      const rect = entries[0]?.contentRect;
      const w = rect?.width || window.innerWidth;
      const h = rect?.height || window.innerHeight;
      setContainerSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const previewStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${designData?.colors?.primary || '#8b5cf6'}, ${designData?.colors?.secondary || '#f59e0b'})`,
      color: designData?.colors?.text || '#ffffff',
      fontFamily: designData?.fonts?.body || 'sans-serif',
    }),
    [designData]
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D4AF37' }}>
      <div className="px-6 py-6">
        <div
  ref={containerRef}
  className="mx-auto flex justify-center items-start"
  style={{
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#D4AF37",
    paddingTop: "20px",
    paddingBottom: "20px",
  }}
>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebrity-purple"></div>
            </div>
          ) : designData?.pages && designData.pages.length > 0 ? (
            <div className="space-y-6">
              {/* Audio global de la invitación (toma el primero) */}
              {(() => {
                const pages = designData.pages || [];
                for (const pg of pages) {
                  for (const el of (pg.elements || [])) {
                    if (el.type === 'audio' && el.audio) {
                      return (
                        <div key={'audio-global'} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', left: -9999, top: -9999 }}>
                          <AudioPlayer source={(el.audio.source as any) || 'file'} url={el.audio.url || ''} />
                        </div>
                      );
                    }
                  }
                }
                return null;
              })()}
              {designData.pages.map((page, idx) => {
                const style =
  page.background?.type === "image"
    ? {
        backgroundImage: `url(${page.background.value})`,
        backgroundSize: (page as any).background?.fit || "cover",
        backgroundPosition: "center",
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D4AF37',
      }
    : {
        background: page.background?.value || '#D4AF37'
      };

                const header = page.sections?.find((s) => s.key === "header")?.text || "";
                const body = page.sections?.find((s) => s.key === "body")?.text || "";
                const footer = page.sections?.find((s) => s.key === "footer")?.text || "";
                const enhancedBody = body;
                const isCentered = designData?.layout === "centered-header";
                const isLandscape = ((page as any).orientation || 'portrait') === 'landscape';
                const BASE_W = isLandscape ? 640 : 360;
                const BASE_H = isLandscape ? 360 : 640;
                const scale = Math.min(containerSize.w / BASE_W, containerSize.h / BASE_H);
                return (
                  <div key={idx} className="w-full">
                    <div className="rounded-lg overflow-hidden" style={{ width: "100%" }}>
                      <div
  style={{
    position: "relative",
    width: BASE_W * scale,
    height: BASE_H * scale,
    margin: '0 auto',
    background: page.background?.type === "image"
      ? `url(${page.background.value})`
      : page.background?.value || "#D4AF37",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
                        <div style={{ position: 'absolute', left: 0, top: 0, width: BASE_W, height: BASE_H, transform: `scale(${scale})`, transformOrigin: 'top left', ...style }}>
                          <div className="absolute inset-0 p-6">
                            {isCentered ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                                <div
                                  className="text-3xl font-bold text-celebrity-gray-900"
                                  style={{ fontFamily: designData?.fonts?.heading || "serif" }}
                                >
                                  {header}
                                </div>
                                <div
                                  className="mt-4 text-base whitespace-pre-line text-celebrity-gray-800"
                                  style={{ fontFamily: designData?.fonts?.body || "sans-serif" }}
                                >
                                  {enhancedBody}
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  className="text-2xl font-bold text-celebrity-gray-900"
                                  style={{ fontFamily: designData?.fonts?.heading || "serif" }}
                                >
                                  {header}
                                </div>
                                <div
                                  className="mt-4 text-base whitespace-pre-line text-celebrity-gray-800"
                                  style={{ fontFamily: designData?.fonts?.body || "sans-serif" }}
                                >
                                  {enhancedBody}
                                </div>
                              </>
                            )}
                          <div className="absolute left-6 right-6 bottom-6 text-sm opacity-80 text-celebrity-gray-700">{footer}</div>

                          {(page.elements || []).map((el) => {
                            const baseStyle: React.CSSProperties = {
                              position: "absolute",
                              left: el.x,
                              top: el.y,
                              zIndex: el.zIndex || 1,
                              transform: `rotate(${el.rotation || 0}deg)`,
                              ...(el.styles || (el as any).style || {}),
                            };
                            if (el.type === "text") {
                              return (
                                <div
                                  key={el.id}
                                  style={{
                                    ...baseStyle,
                                    fontFamily:
                                      (el.styles?.fontFamily as string) ||
                                      designData?.fonts?.body ||
                                      "sans-serif",
                                  }}
                                >
                                  {el.content}
                                </div>
                              );
                            }
                            if (el.type === "audio") {
                              // Evitar duplicado: se renderiza como global arriba
                              return null;
                            }
                            if (el.type === "image" && el.src) {
                               const objectFitStyle = (el.styles?.objectFit as any) || (el as any).style?.objectFit || "cover";
                              return (
                                <div
                                  key={el.id}
                                  style={{
                                    ...baseStyle,
                                    width: el.width || 200,
                                    height: el.height || 200,
                                    position: "absolute",
                                  }}
                                >
                                  <img
                                    src={el.src}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: objectFitStyle }}
                                  />
                                </div>
                              );
                            }
                            if (el.type === "map") {
                              const q = (el.map?.source || "event") === "event" ? event?.location : (el.map?.query || el.map?.url);
                              return (
                                <div key={el.id} style={{ ...baseStyle, width: el.width || 300, height: el.height || 200 }}>
                                  <MapEmbed query={q || ""} />
                                </div>
                              );
                            }
                            if (el.type === "countdown") {
                              const target = (el.countdown?.source || "event") === "event" ? event?.eventDate : el.countdown?.dateISO;
                              return (
                                <div key={el.id} style={{ ...baseStyle, width: el.width || 300, height: el.height || 60 }}>
                                  <CountdownTimer targetDate={target} />
                                </div>
                              );
                            }
                            if (el.type === "whatsapp") {
                              const phone = el.whatsapp?.phone || "";
                              const message = el.whatsapp?.message || "";
                              const label = el.whatsapp?.label || "Agendar asistencia";
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
                            if (el.type === "confirm") {
                              const label = el.confirm?.label || "Confirmar asistencia";
                              return (
                                <button
                                  key={el.id}
                                  onClick={() => {
                                    setActiveConfirm({ label, dateISO: el.confirm?.dateISO, endDateISO: el.confirm?.endDateISO });
                                    setShowConfirmModal(true);
                                  }}
                                  style={{
                                    ...baseStyle,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: el.width || 220,
                                    height: el.height || 44,
                                    backgroundColor: (el.styles?.backgroundColor as string) || '#8b5cf6',
                                    color: (el.styles?.color as string) || '#ffffff',
                                    borderRadius: (el.styles?.borderRadius as number) || 8,
                                    fontWeight: 600,
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            }
                            return null;
                          })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg flex items-center justify-center" style={{ ...previewStyle, minHeight: 480 }}>
              <div className="text-center" style={{ fontFamily: designData?.fonts?.heading || "serif" }}>
                <h2 className="text-3xl font-bold mb-2">{title || "Invitación"}</h2>
              </div>
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Ingresa tu nombre y apellido</h3>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-black" placeholder="Nombre" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
              <input className="w-full px-3 py-2 border border-gray-300 rounded text-black" placeholder="Apellido" value={confirmLastName} onChange={(e) => setConfirmLastName(e.target.value)} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
              <button
                className="px-3 py-2 rounded celebrity-gradient text-white"
                disabled={savingConfirm}
                onClick={async () => {
                  try {
                    setSavingConfirm(true);
                    const payload = { name: confirmName.trim(), lastName: confirmLastName.trim() };
                    const key = `celebria.confirmations.${slug}`;
                    const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                    const arr = existing ? JSON.parse(existing) : [];
                    arr.push({ ...payload, at: new Date().toISOString() });
                    localStorage.setItem(key, JSON.stringify(arr));
                    try {
                      await invitationService.confirmPublicInvitation(slug, payload);
                    } catch {}
                    const startISO = activeConfirm?.dateISO || event?.eventDate || null;
                    const endISO = activeConfirm?.endDateISO || null;
                    if (startISO && title) {
                      const dt = new Date(startISO);
                      const dtEnd = endISO ? new Date(endISO) : new Date(dt.getTime() + 2 * 60 * 60 * 1000);
                      const ics = [
                        'BEGIN:VCALENDAR',
                        'VERSION:2.0',
                        'PRODID:-//CELEBRIA//ES',
                        'BEGIN:VEVENT',
                        `UID:${slug}-${Date.now()}`,
                        `DTSTAMP:${dt.toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
                        `DTSTART:${dt.toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
                        `DTEND:${dtEnd.toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
                        `SUMMARY:${title}`,
                        event?.location ? `LOCATION:${event.location}` : '',
                        'END:VEVENT',
                        'END:VCALENDAR',
                      ].filter(Boolean).join('\n');
                      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title.replace(/\s+/g, '_')}.ics`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                    setShowConfirmModal(false);
                    setConfirmName('');
                    setConfirmLastName('');
                    alert('Confirmación registrada');
                  } catch (err) {
                    alert('No se pudo confirmar');
                  } finally {
                    setSavingConfirm(false);
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}