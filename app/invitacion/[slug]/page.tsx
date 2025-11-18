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
  type: "text" | "image" | "countdown" | "map" | "audio";
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
                const dateStr = event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : "";
                const infoLineParts = [event?.title || "", dateStr, event?.location || ""].filter(Boolean);
                const infoLine = infoLineParts.join(" • ");
                const desc = event?.description || "";
                const details = [infoLine, desc].filter(Boolean).join("\n");
                const enhancedBody = idx === 0 ? [body, details].filter(Boolean).join("\n\n") : body;
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
    </div>
  );
}