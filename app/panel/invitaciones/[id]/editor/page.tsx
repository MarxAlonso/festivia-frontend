'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CountdownTimer } from '@/components/CountdownTimer';
import { useParams } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { invitationService, Invitation } from '@/lib/invitations';
import { templateService, Template } from '@/lib/templates';
import { eventService, Event } from '@/lib/events';
import { Plus, Save, Trash2, Eye } from 'lucide-react';
import { EditorHeader } from './components/EditorHeader';
import { MapEmbed } from '@/components/MapEmbed';
import { AudioPlayer } from '@/components/AudioPlayer';

type BackgroundType = 'image' | 'color';

type PageElement = {
  id: string;
  type: 'text' | 'image' | 'shape' | 'countdown' | 'map' | 'audio' | 'whatsapp' | 'confirm';
  content?: string; // texto para type=text
  src?: string; // url para type=image
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  styles?: Record<string, any>;
  countdown?: { source: 'event' | 'custom'; dateISO?: string };
  map?: { source: 'event' | 'custom'; query?: string; url?: string };
  audio?: { source: 'file' | 'youtube'; url?: string };
  whatsapp?: { phone?: string; message?: string; label?: string };
  confirm?: { label?: string; dateISO?: string; endDateISO?: string };
};

type DesignPage = {
  background?: { type: BackgroundType; value: string; fit?: 'cover' | 'contain' };
  sections?: { key: 'header' | 'body' | 'footer'; text: string }[];
  elements?: PageElement[];
  orientation?: 'portrait' | 'landscape';
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
  const [eventDraft, setEventDraft] = useState<Partial<Event> | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);

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
            setEventDraft(ev);
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

        const normalizedPages: DesignPage[] = (initialPages?.length ? initialPages : [
          { background: { type: 'color' as BackgroundType, value: '#ffffff' }, sections: [], elements: [] },
        ]).map((pg) => {
          if (pg.background) {
            const type: BackgroundType = pg.background.type === 'image' ? 'image' : 'color';
            return {
              ...pg,
              background: {
                type,
                value: pg.background.value,
              },
            };
          }
          return pg;
        });

        setPages(normalizedPages);
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

  const movePage = (from: number, to: number) => {
    setPages((p) => {
      const arr = [...p];
      if (to < 0 || to >= arr.length || from === to) return arr;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setSelectedPage((_) => Math.max(0, to));
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
      styles: { color: '#111111', fontSize: 16, fontWeight: 'normal', fontFamily: 'Arial, sans-serif' },
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
  const addMapElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'map',
      x: 16,
      y: 16,
      width: 328,
      height: 200,
      zIndex: 1,
      styles: {},
      map: { source: 'event' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const addCountdownElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'countdown',
      x: 20,
      y: 20,
      width: 300,
      height: 60,
      zIndex: 1,
      styles: {},
      countdown: { source: 'event' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const addAudioElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'audio',
      x: 0,
      y: 0,
      zIndex: 0,
      styles: {},
      audio: { source: 'file', url: '' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const addWhatsAppElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'whatsapp',
      x: 24,
      y: 24,
      width: 220,
      height: 44,
      zIndex: 2,
      styles: { backgroundColor: '#25D366', color: '#ffffff', borderRadius: 8 },
      whatsapp: { phone: '+51', message: '', label: 'Agendar asistencia' },
    };
    setPages((p) => p.map((pg, i) => (i === idx ? { ...pg, elements: [...(pg.elements || []), newEl] } : pg)));
  };

  const addConfirmElement = (idx: number) => {
    const newEl: PageElement = {
      id: `el-${Date.now()}`,
      type: 'confirm',
      x: 24,
      y: 80,
      width: 220,
      height: 44,
      zIndex: 2,
      styles: { backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: 8, fontWeight: 600 },
      confirm: { label: 'Confirmar asistencia', dateISO: '', endDateISO: '' },
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

  const EVENT_ELEMENT_IDS = { title: 'event-title', date: 'event-date', location: 'event-location', description: 'event-description' } as const;
  const getEventElement = (key: keyof typeof EVENT_ELEMENT_IDS) => {
    const pg0 = pages[0];
    const id = EVENT_ELEMENT_IDS[key];
    return (pg0?.elements || []).find((e) => e.id === id);
  };
  const ensureEventTextElement = (key: keyof typeof EVENT_ELEMENT_IDS) => {
    const pageIdx = 0;
    const id = EVENT_ELEMENT_IDS[key];
    const dateStr = eventDraft?.eventDate ? new Date(eventDraft.eventDate).toLocaleDateString() : '';
    const contentMap: Record<keyof typeof EVENT_ELEMENT_IDS, string> = {
      title: eventDraft?.title || '',
      date: dateStr,
      location: eventDraft?.location || '',
      description: eventDraft?.description || '',
    };
    setPages((p) => p.map((pg, i) => {
      if (i !== pageIdx) return pg;
      const existing = (pg.elements || []).find((e) => e.id === id);
      if (existing) {
        return {
          ...pg,
          elements: (pg.elements || []).map((e) => e.id === id ? { ...e, content: contentMap[key] } : e),
        };
      }
      const base: PageElement = {
        id,
        type: 'text',
        content: contentMap[key],
        x: 24,
        y: 80,
        zIndex: 2,
        styles: { color: '#111111', fontSize: 18, fontWeight: 'normal' },
      };
      return { ...pg, elements: [...(pg.elements || []), base] };
    }));
  };
  const nudgeEventElement = (key: keyof typeof EVENT_ELEMENT_IDS, dx: number, dy: number) => {
    const pageIdx = 0;
    const id = EVENT_ELEMENT_IDS[key];
    setPages((p) => p.map((pg, i) => {
      if (i !== pageIdx) return pg;
      const els = pg.elements || [];
      const found = els.find((e) => e.id === id);
      if (!found) {
        const dateStr = eventDraft?.eventDate ? new Date(eventDraft.eventDate).toLocaleDateString() : '';
        const contentMap: Record<keyof typeof EVENT_ELEMENT_IDS, string> = {
          title: eventDraft?.title || '',
          date: dateStr,
          location: eventDraft?.location || '',
          description: eventDraft?.description || '',
        };
        const base: PageElement = {
          id,
          type: 'text',
          content: contentMap[key],
          x: 24 + dx,
          y: 80 + dy,
          zIndex: 2,
          styles: { color: '#111111', fontSize: 18, fontWeight: 'normal' },
        };
        return { ...pg, elements: [...els, base] };
      }
      return {
        ...pg,
        elements: els.map((e) => e.id === id ? { ...e, x: (e.x || 0) + dx, y: (e.y || 0) + dy } : e),
      };
    }));
  };
  const updateEventElementStyle = (key: keyof typeof EVENT_ELEMENT_IDS, styles: Record<string, any>) => {
    const pageIdx = 0;
    const id = EVENT_ELEMENT_IDS[key];
    setPages((p) => p.map((pg, i) => {
      if (i !== pageIdx) return pg;
      const els = pg.elements || [];
      const found = els.find((e) => e.id === id);
      if (!found) return pg;
      return {
        ...pg,
        elements: els.map((e) => e.id === id ? { ...e, styles: { ...(e.styles || {}), ...styles } } : e),
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

    // Aseguramos que todas las secciones tengan los tipos correctos
    const validPages: DesignPage[] = incoming.map((pg) => ({
      background: pg.background
        ? { type: pg.background.type as BackgroundType, value: pg.background.value }
        : undefined,
      sections: pg.sections
        ? pg.sections
            .filter((s): s is { key: 'header' | 'body' | 'footer'; text: string } =>
              ['header', 'body', 'footer'].includes(s.key)
            )
            .map((s) => ({
              key: s.key as 'header' | 'body' | 'footer',
              text: s.text ?? '',
            }))
        : [],
      elements: pg.elements || [],
    }));

    setPages((p) => [...p, ...validPages]);
    setImportTemplateId('');
  } catch (err) {
    console.error('Error importando páginas del template:', err);
    alert('No se pudo importar páginas');
  }
};

  const syncEventDetailsIntoBody = () => {
    if (!eventDraft) return;
    setPages((p) => {
      const arr = [...p];
      const pg0 = arr[0] || { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] };
      const dateStr = eventDraft.eventDate ? new Date(eventDraft.eventDate).toLocaleDateString() : '';
      const infoLineParts = [eventDraft.title || '', dateStr, eventDraft.location || ''].filter(Boolean);
      const infoLine = infoLineParts.join(' • ');
      const desc = eventDraft.description || '';
      const details = [infoLine, desc].filter(Boolean).join('\n');
      const bodySec = (pg0.sections || []).find((s) => s.key === 'body');
      const bodyText = bodySec?.text || '';
      const alreadyHasInfo = bodyText.includes(eventDraft.title || '') || bodyText.includes(dateStr) || bodyText.includes(eventDraft.location || '');
      const newBody = alreadyHasInfo ? [bodyText.split('\n\n')[0], details].filter(Boolean).join('\n\n') : [bodyText, details].filter(Boolean).join('\n\n');
      const newSections = (() => {
        const sections = pg0.sections || [];
        const idx = sections.findIndex((s) => s.key === 'body');
        if (idx >= 0) sections[idx] = { ...sections[idx], text: newBody };
        else sections.push({ key: 'body', text: newBody });
        return sections;
      })();
      arr[0] = { ...pg0, sections: newSections };
      return arr;
    });
  };

  const saveEventDraft = async () => {
    if (!eventDraft?.id) return;
    try {
      setSavingEvent(true);
      const payload = {
        title: eventDraft.title,
        description: eventDraft.description,
        location: eventDraft.location,
        eventDate: eventDraft.eventDate || (event?.eventDate ?? ''),
      };
      const updated = await eventService.updateEvent(eventDraft.id, payload);
      setEvent(updated);
      setEventDraft(updated);
      alert('Evento actualizado');
    } catch (err) {
      console.error('Error actualizando evento:', err);
      alert('No se pudo actualizar el evento');
    } finally {
      setSavingEvent(false);
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

  const currentPage = pages[selectedPage];
  const previewStyle = useMemo(() => ({
    width: (currentPage?.orientation || 'portrait') === 'landscape' ? 640 : 360,
    height: (currentPage?.orientation || 'portrait') === 'landscape' ? 360 : 640,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative' as const,
    border: '1px solid #e5e7eb',
    background: '#ffffff',
  }), [currentPage?.orientation]);
  const backgroundStyle = currentPage?.background?.type === 'image'
    ? { backgroundImage: `url(${currentPage.background?.value || ''})`, backgroundSize: (currentPage.background?.fit || 'cover'), backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#D4AF37' }
    : { background: currentPage?.background?.value || '#D4AF37' };

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
                          <div style={{ width: pg.orientation === 'landscape' ? 200 : 120, height: pg.orientation === 'landscape' ? 120 : 200, ...(
                            pg.background?.type === 'image' ? { backgroundImage: `url(${pg.background?.value})`, backgroundSize: (pg.background?.fit || 'cover'), backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#D4AF37' } : { background: pg.background?.value || '#D4AF37' }
                          ) }} />
                          <div className="p-2 flex items-center justify-between text-xs">
                            <span className="text-black">Página {idx + 1}</span>
                            <div className="flex items-center gap-2">
                              <button className="text-celebrity-gray-700" onClick={(e) => { e.stopPropagation(); movePage(idx, idx - 1); }} title="Subir">↑</button>
                              <button className="text-celebrity-gray-700" onClick={(e) => { e.stopPropagation(); movePage(idx, idx + 1); }} title="Bajar">↓</button>
                              <button className="text-red-600" onClick={(e) => { e.stopPropagation(); removePage(idx); }}><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Importar desde templates */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-celebrity-gray-900 mb-2">Importar páginas desde template</h4>
                      <div className="flex gap-2">
                        <select className="px-3 py-2 border border-celebrity-gray-300 rounded flex-1 text-black" value={importTemplateId} onChange={(e) => setImportTemplateId(e.target.value)}>
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
                      <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={layout} onChange={(e) => setLayout(e.target.value)}>
                        <option value="template">Plantilla (arriba a la izquierda)</option>
                        <option value="centered-header">Centrado medio (encabezado grande y centrado)</option>
                      </select>
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de encabezado</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={fonts.heading} onChange={(e) => setFonts((f) => ({ ...f, heading: e.target.value }))}>
                          <option value="serif">Serif</option>
                          <option value="sans-serif">Sans-serif</option>
                          <option value="monospace">Monospace</option>
                          <option value="cursive">Cursive</option>
                          <option value="fantasy">Fantasy</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de cuerpo</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={fonts.body} onChange={(e) => setFonts((f) => ({ ...f, body: e.target.value }))}>
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
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={currentPage?.background?.type || 'color'} onChange={(e) => updateBackground(selectedPage, e.target.value as BackgroundType, currentPage?.background?.value || '')}>
                          <option value="image">Imagen (URL)</option>
                          <option value="color">Color</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" placeholder="https://... o #f0e6dc" value={currentPage?.background?.value || ''} onChange={(e) => updateBackground(selectedPage, currentPage?.background?.type || 'color', e.target.value)} />
                      </div>
                      {currentPage?.background?.type === 'image' && (
                        <div>
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Ajuste de imagen</label>
                          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={currentPage?.background?.fit || 'cover'} onChange={(e) => setPages((p) => p.map((pg, i) => i === selectedPage ? { ...pg, background: { ...(pg.background || { type: 'image', value: '' }), fit: e.target.value as 'cover' | 'contain' } } : pg))}>
                            <option value="cover">Cubrir (recorta)</option>
                            <option value="contain">Contener (completa)</option>
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Orientación</label>
                        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={currentPage?.orientation || 'portrait'} onChange={(e) => setPages((p) => p.map((pg, i) => i === selectedPage ? { ...pg, orientation: e.target.value as 'portrait' | 'landscape' } : pg))}>
                          <option value="portrait">Vertical</option>
                          <option value="landscape">Horizontal</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Header</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={currentPage?.sections?.find((s) => s.key === 'header')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'header', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Body</label>
                        <textarea rows={3} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black text-black" value={currentPage?.sections?.find((s) => s.key === 'body')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'body', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Footer</label>
                        <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={currentPage?.sections?.find((s) => s.key === 'footer')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'footer', e.target.value)} />
                      </div>

                      {/* Elementos */}
                      <div className="col-span-2 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-black">Elementos</h4>
                        <div className="flex flex-wrap gap-2">
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addTextElement(selectedPage)}><Plus className="w-4 h-4 mr-2" /> Texto</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => {
                          const url = prompt('URL de imagen (Google Drive u otra):');
                          if (url) addImageElement(selectedPage, url);
                        }}>Imagen (URL)</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addMapElement(selectedPage)}>Mapa</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addCountdownElement(selectedPage)}>Cronómetro</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addAudioElement(selectedPage)}>Audio</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addWhatsAppElement(selectedPage)}>WhatsApp</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => addConfirmElement(selectedPage)}>Confirmación</Button>
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
                                  <input className="col-span-2 px-3 py-2 border border-gray-300 rounded text-black" value={el.content || ''} onChange={(e) => updateElement(selectedPage, el.id, { content: e.target.value })} />
                                  <label className="text-xs text-black">Color</label>
                                  <input className='border border-gray-300 rounded' type="color" value={(el.styles?.color as string) || '#111111'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), color: e.target.value } })} />
                                  <label className="text-xs text-black">Tamaño</label>
                                  <input type="number" className="text-black border border-gray-300 rounded" value={(el.styles?.fontSize as number) || 16} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), fontSize: Number(e.target.value) } })} />
                                  <label className="text-xs text-black">Fuente</label>
                                  <select className="text-black border border-gray-300 rounded" value={(el.styles?.fontFamily as string) || 'Arial, sans-serif'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), fontFamily: e.target.value } })}>
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Arial Black, Arial, sans-serif">Arial Black</option>
                                    <option value="Verdana, Geneva, sans-serif">Verdana</option>
                                    <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                                    <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                                    <option value="Times New Roman, Times, serif">Times New Roman</option>
                                    <option value="Georgia, serif">Georgia</option>
                                    <option value="Courier New, Courier, monospace">Courier New</option>
                                    <option value="Impact, Charcoal, sans-serif">Impact</option>
                                    <option value="Comic Sans MS, cursive, sans-serif">Comic Sans MS</option>
                                    <option value="serif">Serif (tema)</option>
                                    <option value="sans-serif">Sans-serif (tema)</option>
                                  </select>
                                </div>
                              ) : el.type === 'image' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <input className="col-span-2 px-3 py-2 border border-gray-300 rounded text-black" value={el.src || ''} onChange={(e) => updateElement(selectedPage, el.id, { src: e.target.value })} />
                                  <label className="text-xs text-black">Ancho</label>
                                  <input type="number text-black" value={el.width || 100} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Alto</label>
                                  <input type="number text-black" value={el.height || 100} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Ajuste</label>
                                  <select className="text-black" value={(el.styles?.objectFit as any) || 'contain'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), objectFit: e.target.value as any } })}>
                                    <option value="contain">Mostrar completa (contain)</option>
                                    <option value="cover">Cubrir (cover)</option>
                                  </select>
                                </div>
                              ) : el.type === 'countdown' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <label className="text-xs text-black">Fuente</label>
                                  <select className="text-black" value={el.countdown?.source || 'event'} onChange={(e) => updateElement(selectedPage, el.id, { countdown: { ...(el.countdown || {}), source: e.target.value as 'event' | 'custom' } })}>
                                    <option value="event">Usar fecha del evento</option>
                                    <option value="custom">Fecha personalizada</option>
                                  </select>
                                  { (el.countdown?.source || 'event') === 'custom' && (
                                    <>
                                      <label className="text-xs text-black">Fecha objetivo</label>
                                      <input className="text-black"
  type="datetime-local"
  value={(el.countdown?.dateISO || '').replace('Z','')}
  onChange={(e) => {
    const raw = e.target.value;
    if (!raw) return; // evita ISO inválido cuando el input queda vacío
    const iso = new Date(raw).toISOString();
    updateElement(selectedPage, el.id, {
      countdown: {
        ...(el.countdown ?? { source: 'custom' }), // <-- aseguramos source
        dateISO: iso,
      },
    });
  }}
/>

                                    </>
                                  )}
                                  <label className="text-xs text-black">Tamaño</label>
                                  <input className="text-black" type="number" value={(el.styles?.fontSize as number) || 18} onChange={(e) => updateElement(selectedPage, el.id, { styles: { fontSize: Number(e.target.value) } })} />
                                  <label className="text-xs text-black">Color</label>
                                  <input className="text-black" type="color" value={(el.styles?.color as string) || '#111111'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { color: e.target.value } })} />
                                </div>
                              ) : el.type === 'map' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <label className="text-xs text-black">Fuente</label>
                                  <select className="text-black" value={el.map?.source || 'event'} onChange={(e) => updateElement(selectedPage, el.id, { map: { ...(el.map || {}), source: e.target.value as 'event' | 'custom' } })}>
                                    <option value="event">Usar ubicación del evento</option>
                                    <option value="custom">Ubicación personalizada</option>
                                  </select>
                                  {(el.map?.source || 'event') === 'custom' && (
                                    <>
                                      <label className="text-xs text-black">Texto o URL</label>
                                      <input className="col-span-2 px-3 py-2 border border-gray-300 rounded text-black" value={el.map?.query || el.map?.url || ''} onChange={(e) =>
                                        updateElement(selectedPage, el.id, {
                                          map: {
                                            source: el.map?.source ?? "custom",
                                            query: e.target.value,
                                            url: undefined
                                          }
                                        })
                                      }/>
                                    </>
                                  )}
                                  <label className="text-xs text-black">Ancho</label>
                                  <input className="text-black" type="number" value={el.width || 300} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Alto</label>
                                  <input className="text-black" type="number" value={el.height || 200} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                                </div>
                              ) : el.type === 'audio' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <label className="text-xs text-black">Fuente</label>
                                  <select className="text-black" value={el.audio?.source || 'file'} onChange={(e) => updateElement(selectedPage, el.id, { audio: { ...(el.audio || {}), source: e.target.value as 'file' | 'youtube' } })}>
                                    <option value="file">Archivo local</option>
                                    <option value="youtube">YouTube</option>
                                  </select>
                                  <label className="text-xs text-black">URL</label>
                                  <input className="col-span-2 px-3 py-2 border border-gray-300 rounded text-black" placeholder="/audio.mp3 o https://youtube.com/watch?v=..." value={el.audio?.url || ''} onChange={(e) =>updateElement(selectedPage, el.id,{
                                    audio: {
                                        source: el.audio?.source ?? "file",
                                        ...(el.audio ?? {}),
                                        url: e.target.value
                                      }
                                    })
                                  }
                                  />
                                  <p className="col-span-2 text-[10px] text-celebrity-gray-600">El audio se reproduce en bucle y no ocupa espacio visible.</p>
                                </div>
                              ) : el.type === 'whatsapp' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <label className="text-xs text-black">Teléfono (con +51)</label>
                                  <input className="text-black border border-gray-300 rounded" value={el.whatsapp?.phone || ''} onChange={(e) => updateElement(selectedPage, el.id, { whatsapp: { ...(el.whatsapp || {}), phone: e.target.value } })} />
                                  <label className="text-xs text-black">Mensaje</label>
                                  <input className="text-black border border-gray-300 rounded" value={el.whatsapp?.message || ''} onChange={(e) => updateElement(selectedPage, el.id, { whatsapp: { ...(el.whatsapp || {}), message: e.target.value } })} />
                                  <label className="text-xs text-black">Texto del botón</label>
                                  <input className="text-black border border-gray-300 rounded" value={el.whatsapp?.label || ''} onChange={(e) => updateElement(selectedPage, el.id, { whatsapp: { ...(el.whatsapp || {}), label: e.target.value } })} />
                                  <label className="text-xs text-black">Ancho</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={el.width || 220} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Alto</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={el.height || 44} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Color fondo</label>
                                  <input className="text-black border border-gray-300 rounded" type="color" value={(el.styles?.backgroundColor as string) || '#25D366'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), backgroundColor: e.target.value } })} />
                                  <label className="text-xs text-black">Color texto</label>
                                  <input className="text-black border border-gray-300 rounded" type="color" value={(el.styles?.color as string) || '#ffffff'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), color: e.target.value } })} />
                                  <label className="text-xs text-black">Radio</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={(el.styles?.borderRadius as number) || 8} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), borderRadius: Number(e.target.value) } })} />
                                </div>
                              ) : el.type === 'confirm' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <label className="text-xs text-black">Texto del botón</label>
                                  <input className="text-black border border-gray-300 rounded" value={el.confirm?.label || ''} onChange={(e) => updateElement(selectedPage, el.id, { confirm: { ...(el.confirm || {}), label: e.target.value } })} />
                                  <label className="text-xs text-black">Inicio (fecha y hora)</label>
                                  <input
                                    className="text-black border border-gray-300 rounded"
                                    type="datetime-local"
                                    value={(el.confirm?.dateISO || '').replace('Z','')}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      if (!raw) return;
                                      const iso = new Date(raw).toISOString();
                                      updateElement(selectedPage, el.id, { confirm: { ...(el.confirm || {}), dateISO: iso } });
                                    }}
                                  />
                                  <label className="text-xs text-black">Fin (opcional)</label>
                                  <input
                                    className="text-black border border-gray-300 rounded"
                                    type="datetime-local"
                                    value={(el.confirm?.endDateISO || '').replace('Z','')}
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const iso = raw ? new Date(raw).toISOString() : '';
                                      updateElement(selectedPage, el.id, { confirm: { ...(el.confirm || {}), endDateISO: iso } });
                                    }}
                                  />
                                  <label className="text-xs text-black">Ancho</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={el.width || 220} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Alto</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={el.height || 44} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                                  <label className="text-xs text-black">Color fondo</label>
                                  <input className="text-black border border-gray-300 rounded" type="color" value={(el.styles?.backgroundColor as string) || '#8b5cf6'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), backgroundColor: e.target.value } })} />
                                  <label className="text-xs text-black">Color texto</label>
                                  <input className="text-black border border-gray-300 rounded" type="color" value={(el.styles?.color as string) || '#ffffff'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), color: e.target.value } })} />
                                  <label className="text-xs text-black">Radio</label>
                                  <input className="text-black border border-gray-300 rounded" type="number" value={(el.styles?.borderRadius as number) || 8} onChange={(e) => updateElement(selectedPage, el.id, { styles: { ...(el.styles || {}), borderRadius: Number(e.target.value) } })} />
                                </div>
                              ) : null}
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <label className="text-xs text-black">X</label>
                                <input className="text-black" type="number" value={el.x} onChange={(e) => updateElement(selectedPage, el.id, { x: Number(e.target.value) })} />
                                <label className="text-xs text-black">Y</label>
                                <input className="text-black" type="number" value={el.y} onChange={(e) => updateElement(selectedPage, el.id, { y: Number(e.target.value) })} />
                                <label className="text-xs text-black">Rotación</label>
                                <input className="text-black" type="number" value={el.rotation || 0} onChange={(e) => updateElement(selectedPage, el.id, { rotation: Number(e.target.value) })} />
                                <label className="text-xs text-black">Z-Index</label>
                                <input className="text-black" type="number" value={el.zIndex || 1} onChange={(e) => updateElement(selectedPage, el.id, { zIndex: Number(e.target.value) })} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Edición de evento asociado */}
              <div className="mt-6 border-t border-celebrity-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Editar datos del evento</h3>
                {!eventDraft ? (
                  <div className="text-sm text-celebrity-gray-600">No hay evento asociado a esta invitación.</div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-celebrity-gray-700 mb-1">Título</label>
                      <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={eventDraft.title || ''} onChange={(e) => setEventDraft((d) => ({ ...(d || {}), title: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-1">Fecha</label>
                        <input type="date" className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={(eventDraft.eventDate || '').split('T')[0]} onChange={(e) => setEventDraft((d) => ({ ...(d || {}), eventDate: new Date(e.target.value).toISOString() }))} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-1">Ubicación</label>
                        <input className="w-full text-black px-3 py-2 border border-celebrity-gray-300 rounded" value={eventDraft.location || ''} onChange={(e) => setEventDraft((d) => ({ ...(d || {}), location: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-celebrity-gray-700 mb-1">Descripción</label>
                      <textarea rows={3} className="w-full text-black px-3 py-2 border border-celebrity-gray-300 rounded" value={eventDraft.description || ''} onChange={(e) => setEventDraft((d) => ({ ...(d || {}), description: e.target.value }))} />
                    </div>
                        <div className="flex items-center gap-2">
                      <Button onClick={saveEventDraft} disabled={savingEvent}><Save className="w-4 h-4 mr-2" /> Guardar evento</Button>
                      <Button variant="outline" onClick={syncEventDetailsIntoBody}><Eye className="w-4 h-4 mr-2" /> Sincronizar con el Body (pág. 1)</Button>
                    </div>
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => ensureEventTextElement('title')}>Elemento</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('title', 0, -5)}>↑</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('title', 0, 5)}>↓</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('title', -5, 0)}>←</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('title', 5, 0)}>→</Button>
                          <input type="number" className="px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={(getEventElement('title')?.styles?.fontSize as number) || 18} onChange={(e) => updateEventElementStyle('title', { fontSize: Number(e.target.value) })} />
                          <input type="color" className="h-10 border border-celebrity-gray-300 rounded" value={(getEventElement('title')?.styles?.color as string) || '#111111'} onChange={(e) => updateEventElementStyle('title', { color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => ensureEventTextElement('date')}>Elemento</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('date', 0, -5)}>↑</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('date', 0, 5)}>↓</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('date', -5, 0)}>←</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('date', 5, 0)}>→</Button>
                          <input type="number" className="px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={(getEventElement('date')?.styles?.fontSize as number) || 18} onChange={(e) => updateEventElementStyle('date', { fontSize: Number(e.target.value) })} />
                          <input type="color" className="h-10 border border-celebrity-gray-300 rounded" value={(getEventElement('date')?.styles?.color as string) || '#111111'} onChange={(e) => updateEventElementStyle('date', { color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => ensureEventTextElement('location')}>Elemento</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('location', 0, -5)}>↑</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('location', 0, 5)}>↓</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('location', -5, 0)}>←</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('location', 5, 0)}>→</Button>
                          <input type="number" className="px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={(getEventElement('location')?.styles?.fontSize as number) || 18} onChange={(e) => updateEventElementStyle('location', { fontSize: Number(e.target.value) })} />
                          <input type="color" className="h-10 border border-celebrity-gray-300 rounded" value={(getEventElement('location')?.styles?.color as string) || '#111111'} onChange={(e) => updateEventElementStyle('location', { color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => ensureEventTextElement('description')}>Elemento</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('description', 0, -5)}>↑</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('description', 0, 5)}>↓</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('description', -5, 0)}>←</Button>
                          <Button size="sm" variant="outline" onClick={() => nudgeEventElement('description', 5, 0)}>→</Button>
                          <input type="number" className="px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={(getEventElement('description')?.styles?.fontSize as number) || 18} onChange={(e) => updateEventElementStyle('description', { fontSize: Number(e.target.value) })} />
                          <input type="color" className="h-10 border border-celebrity-gray-300 rounded" value={(getEventElement('description')?.styles?.color as string) || '#111111'} onChange={(e) => updateEventElementStyle('description', { color: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                      const objectFitStyle = (el.styles?.objectFit as any) || 'contain';
                      return <img key={el.id} src={el.src} alt="" style={{ ...style, width: el.width || 100, height: el.height || 100, objectFit: objectFitStyle }} />;
                    }
                    if (el.type === 'map') {
                      const q = (el.map?.source || 'event') === 'event' ? (eventDraft?.location || event?.location) : (el.map?.query || el.map?.url);
                      return <div key={el.id} style={{ ...style, width: el.width || 300, height: el.height || 200 }}><MapEmbed query={q || ''} /></div>;
                    }
                    if (el.type === 'audio') {
                      return (
                        <div key={el.id} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', left: -9999, top: -9999 }}>
                          <AudioPlayer source={(el.audio?.source || 'file') as 'file' | 'youtube'} url={el.audio?.url || ''} />
                        </div>
                      );
                    }
                    if (el.type === 'countdown') {
                      const target = (el.countdown?.source || 'event') === 'event' ? (eventDraft?.eventDate || event?.eventDate) : el.countdown?.dateISO;
                      return <div key={el.id} style={{ ...style, width: el.width, height: el.height }}><CountdownTimer targetDate={target} className="text-celebrity-gray-900" /></div>;
                    }
                    if (el.type === 'whatsapp') {
                      const phone = el.whatsapp?.phone || '';
                      const message = el.whatsapp?.message || '';
                      const label = el.whatsapp?.label || 'Agendar asistencia';
                      return (
                        <a
                          key={el.id}
                          href={`https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            ...style,
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
                    if (el.type === 'confirm') {
                      const label = el.confirm?.label || 'Confirmar asistencia';
                      return (
                        <div
                          key={el.id}
                          style={{
                            ...style,
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
                        </div>
                      );
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