'use client';

import React, { useMemo } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { MapEmbed } from '@/components/MapEmbed';
import { Button } from '@/components/ui/Button';
import { Palette, Plus, Save } from 'lucide-react';
import { CreateTemplateDto, TemplateType } from '@/lib/templates';

interface TemplateEditorProps {
  form: CreateTemplateDto;
  setForm: (updater: (prev: CreateTemplateDto) => CreateTemplateDto) => void;
  editingId: string | null;
  saving?: boolean;
  onCancel: () => void;
  onSave: () => void;
  addPage: () => void;
  updatePageBackground: (idx: number, type: 'color' | 'image', value: string) => void;
  updatePageSectionText: (idx: number, key: string, text: string) => void;
  removePage: (idx: number) => void;
}

export function TemplateEditor({ form, setForm, editingId, saving, onCancel, onSave, addPage, updatePageBackground, updatePageSectionText, removePage }: TemplateEditorProps) {
  const previewStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${form.design.colors.primary}, ${form.design.colors.secondary})`,
    color: '#1f2937',
    fontFamily: form.design.fonts.body,
  }), [form]);

  const addElement = (pageIdx: number, type: 'text' | 'image' | 'shape' | 'countdown' | 'map') => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      const page = { ...(pages[pageIdx] || {}) } as any;
      const elements = [...(page.elements || [])];
      const id = `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      if (type === 'text') {
        elements.push({ id, type, content: 'Nuevo texto', x: 20, y: 30, zIndex: 1, style: { color: '#1f2937', fontFamily: p.design.fonts.body, fontSize: '16px' } });
      } else if (type === 'image') {
        elements.push({ id, type, src: 'https://via.placeholder.com/150', x: 40, y: 60, width: 120, height: 80, zIndex: 1, style: { objectFit: 'cover' } });
      } else if (type === 'map') {
        elements.push({ id, type, x: 24, y: 24, width: 300, height: 200, zIndex: 1, style: {}, map: { source: 'custom', query: 'Parque Central, Ciudad' } });
      } else if (type === 'countdown') {
        elements.push({ id, type, x: 24, y: 24, width: 300, height: 60, zIndex: 1, style: {}, countdown: { source: 'event' } });
      } else {
        elements.push({ id, type, x: 10, y: 10, width: 80, height: 40, zIndex: 0, style: { background: '#e5e7eb' } });
      }
      pages[pageIdx] = { ...page, elements };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const updateElement = (pageIdx: number, elId: string, updates: any) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      const page = { ...(pages[pageIdx] || {}) } as any;
      const elements = [...(page.elements || [])];
      const idx = elements.findIndex((e) => e.id === elId);
      if (idx >= 0) elements[idx] = { ...elements[idx], ...updates };
      pages[pageIdx] = { ...page, elements };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const updateElementStyle = (pageIdx: number, elId: string, styleUpdates: Record<string, string>) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      const page = { ...(pages[pageIdx] || {}) } as any;
      const elements = [...(page.elements || [])];
      const idx = elements.findIndex((e) => e.id === elId);
      if (idx >= 0) elements[idx] = { ...elements[idx], style: { ...(elements[idx].style || {}), ...styleUpdates } };
      pages[pageIdx] = { ...page, elements };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const removeElement = (pageIdx: number, elId: string) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      const page = { ...(pages[pageIdx] || {}) } as any;
      const elements = (page.elements || []).filter((e: any) => e.id !== elId);
      pages[pageIdx] = { ...page, elements };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Formulario de creación/edición */}
      <div className="celebrity-card p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">{editingId ? 'Editar Template' : 'Crear Template'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Nombre</label>
            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Tipo</label>
            <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TemplateType }))}>
              {Object.values(TemplateType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Descripción</label>
            <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Precio</label>
            <input type="number" className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.price || 0} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Event ID (opcional)</label>
            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.eventId || ''} onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value || undefined }))} />
          </div>

          {/* Diseño - Colores */}
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color primario</label>
            <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.primary} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, primary: e.target.value } } }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color secundario</label>
            <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.secondary} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, secondary: e.target.value } } }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color acento</label>
            <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.accent} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, accent: e.target.value } } }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color fondo</label>
            <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.background} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, background: e.target.value } } }))} />
          </div>

          {/* Diseño - Tipografías */}
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fuente Heading</label>
            <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.fonts.heading} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, fonts: { ...p.design.fonts, heading: e.target.value } } }))}>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fuente Body</label>
            <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.fonts.body} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, fonts: { ...p.design.fonts, body: e.target.value } } }))}>
              <option value="serif">Serif</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          {/* Diseño - Layout y CSS */}
          <div>
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Layout</label>
            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.layout} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, layout: e.target.value } }))} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Custom CSS</label>
            <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.customCss || ''} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, customCss: e.target.value } }))} />
          </div>

          {/* Contenido por defecto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Encabezado</label>
            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.header || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), header: e.target.value } }))} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Cuerpo</label>
            <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.body || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), body: e.target.value } }))} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Pie</label>
            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.footer || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), footer: e.target.value } }))} />
          </div>

          {/* Diseño - Páginas (multi-página) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-celebrity-gray-700">Páginas del diseño</label>
              <Button variant="outline" onClick={addPage}>
                <Plus className="w-4 h-4 mr-2" /> Agregar página
              </Button>
            </div>
            {form.design.pages && form.design.pages.length > 0 ? (
              <div className="space-y-6">
                {form.design.pages.map((page, idx) => {
                  const style = page.background?.type === 'image'
                    ? { backgroundImage: `url(${page.background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: page.background?.value || '#ffffff' };
                  const header = page.sections?.find((s) => s.key === 'header')?.text || '';
                  const body = page.sections?.find((s) => s.key === 'body')?.text || '';
                  const footer = page.sections?.find((s) => s.key === 'footer')?.text || '';
                  return (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Previsualización de la página */}
                      <div className="rounded border border-celebrity-gray-200 p-3">
                        <div className="mx-auto" style={{ width: 360, height: 640, borderRadius: 12, overflow: 'hidden', position: 'relative', ...style }}>
                          <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                            <div className="text-xl font-serif font-bold">{header}</div>
                            <div className="text-sm">{body}</div>
                            <div className="text-xs opacity-80">{footer}</div>
                          </div>
                          {(page.elements || []).map((el) => {
                            const baseStyle: React.CSSProperties = {
                              position: 'absolute',
                              left: el.x,
                              top: el.y,
                              width: el.width,
                              height: el.height,
                              zIndex: el.zIndex || 1,
                              transform: `rotate(${el.rotation || 0}deg)`,
                              ...((el.style || {}) as any),
                            };
                            if (el.type === 'text') {
                              return (
                                <div key={el.id} style={baseStyle}>
                                  {el.content}
                                </div>
                              );
                            }
                            if (el.type === 'image') {
                              return (
                                <img key={el.id} src={el.src || ''} alt="" style={{ ...baseStyle, objectFit: (el.style?.objectFit as any) || 'cover' }} />
                              );
                            }
                            if (el.type === 'map') {
                              const q = (el.map?.source || 'custom') === 'custom' ? (el.map?.query || el.map?.url || '') : '';
                              return (
                                <div key={el.id} style={baseStyle}>
                                  <MapEmbed query={q} />
                                </div>
                              );
                            }
                            if (el.type === 'countdown') {
                              return (
                                <div key={el.id} style={baseStyle}>
                                  <CountdownTimer targetDate={el.countdown?.dateISO || new Date(Date.now() + 7*24*3600*1000).toISOString()} />
                                </div>
                              );
                            }
                            return (
                              <div key={el.id} style={{ ...baseStyle, background: el.style?.background || '#e5e7eb' }} />
                            );
                          })}
                        </div>
                      </div>
                      {/* Controles de la página */}
                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Tipo de fondo</label>
                            <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={page.background?.type || 'image'} onChange={(e) => updatePageBackground(idx, e.target.value as 'color' | 'image', page.background?.value || '')}>
                              <option value="image">Imagen (URL)</option>
                              <option value="color">Color</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
                            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="/pag%201.png o https://... o #f0e6dc" value={page.background?.value || ''} onChange={(e) => updatePageBackground(idx, page.background?.type || 'image', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Header</label>
                            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={header} onChange={(e) => updatePageSectionText(idx, 'header', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Body</label>
                            <textarea rows={3} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={body} onChange={(e) => updatePageSectionText(idx, 'body', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Footer</label>
                            <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={footer} onChange={(e) => updatePageSectionText(idx, 'footer', e.target.value)} />
                          </div>
                          <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="block text-xs font-medium text-celebrity-gray-700">Elementos</span>
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => addElement(idx, 'text')}>Agregar texto</Button>
                                <Button variant="outline" onClick={() => addElement(idx, 'image')}>Agregar imagen</Button>
                                <Button variant="outline" onClick={() => addElement(idx, 'map')}>Agregar mapa</Button>
                                <Button variant="outline" onClick={() => addElement(idx, 'countdown')}>Agregar cronómetro</Button>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {(page.elements || []).map((el) => (
                                <div key={el.id} className="rounded border border-celebrity-gray-200 p-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2 text-xs font-semibold">{el.type.toUpperCase()} • {el.id}</div>
                                    {el.type === 'text' && (
                                      <div className="col-span-2">
                                        <label className="block text-xs font-medium mb-1">Texto</label>
                                        <input className="w-full px-3 py-2 border rounded" value={el.content || ''} onChange={(e) => updateElement(idx, el.id, { content: e.target.value })} />
                                      </div>
                                    )}
                                    {el.type === 'image' && (
                                      <div className="col-span-2">
                                        <label className="block text-xs font-medium mb-1">URL Imagen</label>
                                        <input className="w-full px-3 py-2 border rounded" value={el.src || ''} onChange={(e) => updateElement(idx, el.id, { src: e.target.value })} />
                                      </div>
                                    )}
                                    {el.type === 'countdown' && (
                                      <>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Fuente</label>
                                          <select className="w-full px-3 py-2 border rounded" value={el.countdown?.source || 'event'} onChange={(e) => updateElement(idx, el.id, { countdown: { ...(el.countdown || {}), source: e.target.value } })}>
                                            <option value="event">Fecha del evento</option>
                                            <option value="custom">Fecha personalizada</option>
                                          </select>
                                        </div>
                                        {(el.countdown?.source || 'event') === 'custom' && (
                                          <div className="col-span-2">
                                            <label className="block text-xs font-medium mb-1">Fecha objetivo</label>
                                            <input type="datetime-local" className="w-full px-3 py-2 border rounded" value={(el.countdown?.dateISO || '').replace('Z','')} onChange={(e) => updateElement(idx, el.id, { countdown: { ...(el.countdown || {}), dateISO: new Date(e.target.value).toISOString() } })} />
                                          </div>
                                        )}
                                      </>
                                    )}
                                    {el.type === 'map' && (
                                      <>
                                        <div>
                                          <label className="block text-xs font-medium mb-1">Fuente</label>
                                          <select className="w-full px-3 py-2 border rounded" value={el.map?.source || 'custom'} onChange={(e) => updateElement(idx, el.id, { map: { ...(el.map || {}), source: e.target.value } })}>
                                            <option value="event">Ubicación del evento</option>
                                            <option value="custom">Ubicación personalizada</option>
                                          </select>
                                        </div>
                                        {(el.map?.source || 'custom') === 'custom' && (
                                          <div className="col-span-2">
                                            <label className="block text-xs font-medium mb-1">Texto o URL</label>
                                            <input className="w-full px-3 py-2 border rounded" value={el.map?.query || el.map?.url || ''} onChange={(e) => updateElement(idx, el.id, { map: { ...(el.map || {}), query: e.target.value, url: undefined } })} />
                                          </div>
                                        )}
                                      </>
                                    )}
                                    <div>
                                      <label className="block text-xs font-medium mb-1">X</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.x || 0} onChange={(e) => updateElement(idx, el.id, { x: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Y</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.y || 0} onChange={(e) => updateElement(idx, el.id, { y: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Ancho</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.width || 0} onChange={(e) => updateElement(idx, el.id, { width: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Alto</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.height || 0} onChange={(e) => updateElement(idx, el.id, { height: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Rotación</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.rotation || 0} onChange={(e) => updateElement(idx, el.id, { rotation: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Z-Index</label>
                                      <input type="number" className="w-full px-3 py-2 border rounded" value={el.zIndex || 1} onChange={(e) => updateElement(idx, el.id, { zIndex: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Color</label>
                                      <input type="color" className="w-full h-10 rounded border" value={(el.style?.color as string) || '#000000'} onChange={(e) => updateElementStyle(idx, el.id, { color: e.target.value })} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Fuente</label>
                                      <select className="w-full px-3 py-2 border rounded" value={(el.style?.fontFamily as string) || form.design.fonts.body} onChange={(e) => updateElementStyle(idx, el.id, { fontFamily: e.target.value })}>
                                        <option value="serif">Serif</option>
                                        <option value="sans-serif">Sans Serif</option>
                                        <option value="monospace">Monospace</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium mb-1">Tamaño</label>
                                      <input className="w-full px-3 py-2 border rounded" value={(el.style?.fontSize as string) || '16px'} onChange={(e) => updateElementStyle(idx, el.id, { fontSize: e.target.value })} />
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => removeElement(idx, el.id)}>Eliminar</Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button variant="outline" onClick={() => removePage(idx)}>Eliminar página</Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-celebrity-gray-600">Aún no hay páginas. Usa "Agregar página" para iniciar.</div>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" className="mr-2" onClick={onCancel}>Cancelar</Button>
          <Button onClick={onSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" /> Guardar template
          </Button>
        </div>
      </div>

      {/* Previsualización */}
      <div className="celebrity-card p-6 lg:col-span-1">
        <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Previsualización</h3>
        <div className="h-[260px] rounded-lg flex items-center justify-center" style={previewStyle}>
          <div className="text-center" style={{ fontFamily: form.design.fonts.heading }}>
            <Palette className="w-10 h-10 mx-auto mb-2" />
            <h4 className="text-xl font-bold mb-1">{form.name || 'Nuevo template'}</h4>
            {form.content?.header && <p className="text-sm opacity-80">{form.content.header}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}