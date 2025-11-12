'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { invitationService, Invitation } from '@/lib/invitations';
import { templateService, Template } from '@/lib/templates';
import { eventService, Event } from '@/lib/events';
import { Plus, Save, Trash2, Eye } from 'lucide-react';
import { EditorHeader } from './components/EditorHeader';

type BackgroundType = 'image' | 'color';

type PageElement = {
  id: string;
  type: 'text' | 'image' | 'shape';
  content?: string; // texto para type=text
  src?: string; // url para type=image
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  styles?: Record<string, any>;
};

type DesignPage = {
  background?: { type: BackgroundType; value: string };
  sections?: { key: 'header' | 'body' | 'footer'; text: string }[];
  elements?: PageElement[];
};

export default function InvitationEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pages, setPages] = useState<DesignPage[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [importTemplateId, setImportTemplateId] = useState<string>('');
  const [event, setEvent] = useState<Event | null>(null);
  const [layout, setLayout] = useState<string>('template');
  const [fonts, setFonts] = useState<{ heading: string; body: string }>({ heading: 'serif', body: 'sans-serif' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const inv = await invitationService.getInvitationById(id);
        setInvitation(inv);

        // Cargar templates disponibles
        const allTpl = await templateService.getTemplates();
        setTemplates(allTpl);

        // Cargar evento asociado si existe
        let ev: Event | null = null;
        if (inv.eventId) {
          try {
            ev = await eventService.getEventById(inv.eventId);
            setEvent(ev);
          } catch (err) {
            console.error('Error cargando evento asociado:', err);
          }
        }

        // Determinar páginas iniciales (custom o template)
        const initialPages: DesignPage[] =
          (inv.customDesign as any)?.pages || (inv.templateId ? (await templateService.getTemplateById(inv.templateId)).design.pages || [] : []);

        // Establecer layout desde customDesign o template si existe
        const initialLayout = (inv.customDesign as any)?.layout || (inv.templateId ? (await templateService.getTemplateById(inv.templateId)).design.layout : undefined) || 'template';
        setLayout(initialLayout);

        const tplFonts = inv.templateId ? (await templateService.getTemplateById(inv.templateId)).design.fonts : undefined;
        const initialFonts = (inv.customDesign as any)?.fonts || tplFonts || { heading: 'serif', body: 'sans-serif' };
        setFonts(initialFonts);

        // Inyectar detalles del evento al body si procede
        const pagesWithEvent = (() => {
          const base = initialPages?.length ? initialPages : [
            { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] },
          ];
          if (!ev) return base;
          const dateStr = ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : '';
          const infoLineParts = [ev.title || '', dateStr, ev.location || ''].filter(Boolean);
          const infoLine = infoLineParts.join(' • ');
          const desc = ev.description || '';
          const details = [infoLine, desc].filter(Boolean).join('\n');
          const pg0 = base[0] || { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] };
          const bodySec = (pg0.sections || []).find((s) => s.key === 'body');
          const bodyText = bodySec?.text || '';
          const alreadyHasInfo = bodyText.includes(ev.title || '') || bodyText.includes(dateStr) || bodyText.includes(ev.location || '');
          const newBody = alreadyHasInfo ? bodyText : [bodyText, details].filter(Boolean).join('\n\n');
          const newSections = (() => {
            const sections = pg0.sections || [];
            const idx = sections.findIndex((s) => s.key === 'body');
            if (idx >= 0) sections[idx] = { ...sections[idx], text: newBody };
            else sections.push({ key: 'body', text: newBody });
            return sections;
          })();
          const updatedPg0 = { ...pg0, sections: newSections };
          const rest = base.slice(1);
          return [updatedPg0, ...rest];
        })();

        setPages(pagesWithEvent);
      } catch (err) {
        console.error('Error cargando editor de invitación:', err);
        const message = err instanceof Error ? err.message : 'Error cargando datos';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const addPage = () => {
    setPages((p) => [...p, { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] }]);
    setSelectedPage(pages.length);
  };

  const removePage = (idx: number) => {
    setPages((p) => p.filter((_, i) => i !== idx));
    setSelectedPage((sp) => (sp > 0 ? sp - 1 : 0));
  };

  const updateBackground = (idx: number, type: BackgroundType, value: string) => {
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, background: { type, value } } : pg)));
  };

  const updateSectionText = (idx: number, key: 'header' | 'body' | 'footer', text: string) => {
    setPages((p) => p.map((pg, i) => {
      if (i !== idx) return pg;
      const sections = pg.sections || [];
      const exists = sections.find((s) => s.key === key);
      if (exists) {
        return { ...pg, sections: sections.map((s) => (s.key === key ? { ...s, text } : s)) };
      }
      return { ...pg, sections: [...sections, { key, text }] };
    }));
  };

  const addTextElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'text',
      content: 'Nuevo texto',
      x: 20,
      y: 20,
      zIndex: 1,
      styles: { color: '#111111', fontSize: 16, fontWeight: 'normal' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const addImageElement = (idx: number, url: string) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'image',
      src: url,
      x: 0,
      y: 0,
      width: 360,
      height: 640,
      zIndex: 0,
      styles: { objectFit: 'cover' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const updateElement = (pageIdx: number, elId: string, patch: Partial<PageElement>) => {
    setPages((p) => p.map((pg, i) => {
      if (i !== pageIdx) return pg;
      return {
        ...pg,
        elements: (pg.elements || []).map((el) => (el.id === elId ? { ...el, ...patch, styles: { ...el.styles, ...(patch.styles || {}) } } : el)),
      };
    }));
  };

  const removeElement = (pageIdx: number, elId: string) => {
    setPages((p) => p.map((pg, i) => (i === pageIdx ? { ...pg, elements: (pg.elements || []).filter((el) => el.id !== elId) } : pg)));
  };

  const importPagesFromTemplate = async (templateId: string) => {
    if (!templateId) return;
    try {
      const tpl = await templateService.getTemplateById(templateId);
      const incoming = tpl.design.pages || [];
      if (!incoming.length) return;
      setPages((p) => [...p, ...incoming.map((pg) => ({ ...pg }))]);
      setImportTemplateId('');
    } catch (err) {
      console.error('Error importando páginas del template:', err);
      alert('No se pudo importar páginas');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await invitationService.updateInvitationDesign(id, { pages, layout, fonts });
      alert('Diseño guardado');
    } catch (err) {
      console.error('Error guardando diseño:', err);
      alert('No se pudo guardar el diseño');
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = useMemo(() => ({
    width: 360,
    height: 640,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative' as const,
    border: '1px solid #e5e7eb',
    background: '#ffffff',
  }), []);

  const currentPage = pages[selectedPage];
  const backgroundStyle = currentPage?.background?.type === 'image'
    ? { backgroundImage: `url(${currentPage.background?.value || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: currentPage?.background?.value || '#ffffff' };

  return (
    <OrganizerProtectedRoute>
      <div className="flex h-screen bg-celebrity-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <EditorHeader saving={saving} onSave={handleSave} />

          <div className="px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Controles */}
            <div className="celebrity-card p-6 xl:col-span-2">
              {loading ? (
                <div className="py-12 text-center text-celebrity-gray-600">Cargando…</div>
              ) : error ? (
                <div className="py-12 text-red-700 bg-red-50 rounded">{error}</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lista de páginas */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-celebrity-gray-900">Páginas</h3>
                      <Button variant="outline" onClick={addPage}><Plus className="w-4 h-4 mr-2" /> Agregar página</Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {pages.map((pg, idx) => (
                        <div key={idx} className={`cursor-pointer rounded border ${idx === selectedPage ? 'border-celebrity-purple' : 'border-celebrity-gray-200'}`} onClick={() => setSelectedPage(idx)}>
                          <div style={{ width: 120, height: 200, ...(
                            pg.background?.type === 'image' ? { backgroundImage: `url(${pg.background?.value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: pg.background?.value || '#ffffff' }
                          ) }} />
                          <div className="p-2 flex items-center justify-between text-xs">
                            <span>Página {idx + 1}</span>
                            <button className="text-red-600" onClick={(e) => { e.stopPropagation(); removePage(idx); }}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Importar desde templates */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-celebrity-gray-900 mb-2">Importar páginas desde template</h4>
                      <div className="flex gap-2">
                        <select className="px-3 py-2 border border-celebrity-gray-300 rounded flex-1" value={importTemplateId} onChange={(e) => setImportTemplateId(e.target.value)}>
                          <option value="">Selecciona un template</option>
                          {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <Button variant="outline" onClick={() => importPagesFromTemplate(importTemplateId)}>Importar</Button>
                      </div>
                      <p className="text-xs text-celebrity-gray-500 mt-1">Puedes importar de varios templates; las páginas se agregan a tu diseño.</p>
                    </div>
                  </div>

                  {/* Configuración de página seleccionada */}
                  <div>
                    <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Fondo y secciones</h3>
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Estilo de encabezado</label>
                      <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={layout} onChange={(e) => setLayout(e.target.value)}>
                        <option value="template">Plantilla (arriba a la izquierda)</option>
                        <option value="centered-header">Centrado medio (encabezado grande y centrado)</option>
                      </select>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de encabezado</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={fonts.heading} onChange={(e) => setFonts((f) => ({ ...f, heading: e.target.value }))}>
                          <option value="serif">Serif</option>
                          <option value="sans-serif">Sans-serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="cursive">Cursive</option>
                          <option value="fantasy">Fantasy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de cuerpo</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={fonts.body} onChange={(e) => setFonts((f) => ({ ...f, body: e.target.value }))}>
                          <option value="sans-serif">Sans-serif</option>
                          <option value="serif">Serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="cursive">Cursive</option>
                          <option value="fantasy">Fantasy</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Tipo de fondo</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.background?.type || 'color'} onChange={(e) => updateBackground(selectedPage, e.target.value as BackgroundType, currentPage?.background?.value || '')}>
                          <option value="image">Imagen (URL)</option>
                          <option value="color">Color</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="https://... o #f0e6dc" value={currentPage?.background?.value || ''} onChange={(e) => updateBackground(selectedPage, currentPage?.background?.type || 'color', e.target.value)} />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Header</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'header')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'header', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Body</label>
                        <textarea rows={3} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'body')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'body', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Footer</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'footer')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'footer', e.target.value)} />
                      </div>

                      {/* Elementos */}
                      <div className="col-span-2 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold">Elementos</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => addTextElement(selectedPage)}><Plus className="w-4 h-4 mr-2" /> Texto</Button>
                            <Button variant="outline" onClick={() => {
                              const url = prompt('URL de imagen (Google Drive u otra):');
                              if (url) addImageElement(selectedPage, url);
                            }}>Imagen (URL)</Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {(currentPage?.elements || []).map((el) => (
                            <div key={el.id} className="border border-celebrity-gray-200 rounded p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-celebrity-gray-600">{el.type.toUpperCase()}</span>
                                <button className="text-red-600" onClick={() => removeElement(selectedPage, el.id)}><Trash2 className="w-4 h-4" /></button>
                              </div>
                              {el.type === 'text' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <input className="col-span-2 px-3 py-2 border border-celebrity-gray-300 rounded" value={el.content || ''} onChange={(e) => updateElement(selectedPage, el.id, { content: e.target.value })} />
                                  <label className="text-xs">Color</label>
                                  <input type="color" value={(el.styles?.color as string) || '#111111'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { color: e.target.value } })} />
                                  <label className="text-xs">Tamaño</label>
                                  <input type="number" value={(el.styles?.fontSize as number) || 16} onChange={(e) => updateElement(selectedPage, el.id, { styles: { fontSize: Number(e.target.value) } })} />
                                </div>
                              ) : el.type === 'image' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <input className="col-span-2 px-3 py-2 border border-celebrity-gray-300 rounded" value={el.src || ''} onChange={(e) => updateElement(selectedPage, el.id, { src: e.target.value })} />
                                  <label className="text-xs">Ancho</label>
                                  <input type="number" value={el.width || 100} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                                  <label className="text-xs">Alto</label>
                                  <input type="number" value={el.height || 100} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                                </div>
                              ) : null}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <label className="text-xs">X</label>
                                <input type="number" value={el.x} onChange={(e) => updateElement(selectedPage, el.id, { x: Number(e.target.value) })} />
                                <label className="text-xs">Y</label>
                                <input type="number" value={el.y} onChange={(e) => updateElement(selectedPage, el.id, { y: Number(e.target.value) })} />
                                <label className="text-xs">Rotación</label>
                                <input type="number" value={el.rotation || 0} onChange={(e) => updateElement(selectedPage, el.id, { rotation: Number(e.target.value) })} />
                                <label className="text-xs">Z-Index</label>
                                <input type="number" value={el.zIndex || 1} onChange={(e) => updateElement(selectedPage, el.id, { zIndex: Number(e.target.value) })} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Previsualización */}
            <div className="celebrity-card p-6 xl:col-span-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-celebrity-gray-900">Vista previa</h3>
                <Eye className="w-5 h-5 text-celebrity-purple" />
              </div>
              <div className="mx-auto" style={previewStyle}>
                <div className="absolute inset-0" style={backgroundStyle} />
                <div className="absolute inset-0 p-3">
                  {/* Secciones */}
                  {layout === 'centered-header' ? (
                    <>
                      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-center" style={{ color: '#1f2937', fontFamily: fonts.heading }}>{currentPage?.sections?.find((s) => s.key === 'header')?.text}</div>
                      <div className="absolute left-4 right-4 top-[60%] text-sm text-center whitespace-pre-line" style={{ color: '#374151', fontFamily: fonts.body }}>{currentPage?.sections?.find((s) => s.key === 'body')?.text}</div>
                    </>
                  ) : (
                    <>
                      <div className="absolute left-3 top-3 text-xl font-bold" style={{ color: '#1f2937', fontFamily: fonts.heading }}>{currentPage?.sections?.find((s) => s.key === 'header')?.text}</div>
                      <div className="absolute left-3 right-3 top-14 text-sm whitespace-pre-line" style={{ color: '#374151', fontFamily: fonts.body }}>{currentPage?.sections?.find((s) => s.key === 'body')?.text}</div>
                    </>
                  )}
                  <div className="absolute left-3 bottom-3 text-xs opacity-80" style={{ color: '#6b7280' }}>{currentPage?.sections?.find((s) => s.key === 'footer')?.text}</div>

                  {/* Elementos */}
                  {(currentPage?.elements || []).map((el) => {
                    const style: React.CSSProperties = {
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      zIndex: el.zIndex || 1,
                      transform: `rotate(${el.rotation || 0}deg)`,
                      ...(el.styles || {}),
                    };
                    if (el.type === 'text') {
                      return <div key={el.id} style={style}>{el.content}</div>;
                    }
                    if (el.type === 'image') {
                      return <img key={el.id} src={el.src} alt="" style={{ ...style, width: el.width || 100, height: el.height || 100 }} />;
                    }
                    return null;
                  })}
                </div>
              </div>
              <p className="text-xs text-celebrity-gray-500 mt-2">Sugerencia: usa URLs públicas de imagen (Drive, CDN) para el fondo.</p>
            </div>
          </div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}