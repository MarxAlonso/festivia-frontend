'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { useInvitationCreator } from '@/hooks/useInvitationCreator';
import { EventType } from '@/lib/events';
import { Template, TemplateStatus, templateService } from '@/lib/templates';
import { InvitationType, invitationService } from '@/lib/invitations';
import {
  CheckCircle,
  Sparkles,
  Palette,
  Type,
  Image,
  Share2,
  Calendar,
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Crear Evento', description: 'Configura los detalles básicos de tu evento', icon: Calendar },
  { id: 2, title: 'Personaliza el diseño', description: 'Ajusta colores, fuentes y elementos visuales', icon: Palette },
  { id: 3, title: 'Elige tu plantilla', description: 'Selecciona una plantilla que se adapte a tu estilo y tipo de evento', icon: Sparkles },
  { id: 4, title: 'Añade el contenido', description: 'Escribe el texto de tu invitación con todos los detalles', icon: Type },
  { id: 5, title: 'Sube imágenes', description: 'Añade fotos o imágenes que complementen tu invitación', icon: Image },
  { id: 6, title: 'Revisa y guarda', description: 'Guarda y abre el editor para continuar', icon: Share2 },
];

type EditableDesign = {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    text?: string;
  };
  fonts?: { heading?: string; body?: string };
  layout?: string;
  content?: { header?: string; body?: string; footer?: string; images?: string[] };
  pages?: {
    background?: { type: 'image' | 'color'; value: string };
    sections?: { key: 'header' | 'body' | 'footer'; text: string }[];
    elements?: {
      id: string;
      type: 'text' | 'image' | 'shape';
      content?: string;
      src?: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      rotation?: number;
      zIndex?: number;
      styles?: Record<string, any>;
    }[];
  }[];
};

export default function PanelCreateInvitationPage() {
  const router = useRouter();
  const {
    loading,
    currentStep,
    setCurrentStep,
    event,
    createEvent,
    selectedTemplateId,
    setSelectedTemplateId,
    invitation,
    createInvitation,
    designData,
    setDesignData,
  } = useInvitationCreator();

  const [selectedPage, setSelectedPage] = useState(0);

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    type: EventType.OTHER,
    eventDate: new Date(),
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [invitationData, setInvitationData] = useState({
    title: '',
    message: '',
    content: { header: '', body: '', footer: '', images: [] as string[] },
  });

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const availableTemplates = await templateService.getTemplates({ status: TemplateStatus.ACTIVE });
        setTemplates(availableTemplates);
      } catch (err) {
        console.error('Error cargando templates:', err);
      }
    };
    loadTemplates();
  }, []);

  // Asegura al menos una página para vista previa/edición aunque no se haya elegido plantilla
  useEffect(() => {
    setDesignData((prev: EditableDesign) => {
      const pages = (prev.pages || []) as any[];
      if (!pages.length) {
        return { ...prev, pages: [{ background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] }] };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        if (!eventData.title || !eventData.eventDate) {
          alert('Por favor completa los campos requeridos del evento');
          return;
        }
        await createEvent({
          ...eventData,
          // Enviar como ISO string para cumplir con @IsDateString del backend
          eventDate: eventData.eventDate.toISOString(),
        });
      } else if (currentStep === 3 && selectedTemplateId) {
        // selección de template ya actualiza el diseño
      } else if (currentStep === 6) {
        await handleComplete();
        return;
      }
      if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error('Error en el paso:', err);
      alert('Hubo un error. Por favor intenta nuevamente.');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => setCurrentStep(stepId);
  // Mapeo de secciones a páginas (editable)
  const [mapPages, setMapPages] = useState({ headerPage: 0, bodyPage: 0, footerPage: 0 });

  // === Edición de páginas (similar al editor de invitaciones) ===
  const addPage = () => {
    setDesignData((prev: EditableDesign) => {
      const newPages = [
        ...((prev.pages || []) as any[]),
        { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] },
      ];
      setSelectedPage(newPages.length - 1);
      return { ...prev, pages: newPages };
    });
  };

  const removePage = (idx: number) => {
    setDesignData((prev: EditableDesign) => {
      const updated = ((prev.pages || []) as any[]).filter((_: any, i: number) => i !== idx);
      const nextSelected = Math.max(0, Math.min(selectedPage, updated.length - 1));
      setSelectedPage(nextSelected);
      return { ...prev, pages: updated };
    });
  };

  const movePage = (from: number, to: number) => {
    setDesignData((prev: EditableDesign) => {
      const arr = [ ...(((prev.pages || []) as any[]) || []) ];
      if (to < 0 || to >= arr.length || from === to) return prev;
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      setSelectedPage(Math.max(0, to));
      return { ...prev, pages: arr };
    });
  };

  const updateBackground = (idx: number, type: 'image' | 'color', value: string) => {
    setDesignData((prev: EditableDesign) => {
      const pages = ((prev.pages || []) as any[]).map((pg: any, i: number) => (i === idx ? { ...pg, background: { type, value } } : pg));
      return { ...prev, pages };
    });
  };

  const updateSectionText = (idx: number, key: 'header' | 'body' | 'footer', text: string) => {
    setDesignData((prev: EditableDesign) => {
      let pages = [...(((prev.pages || []) as any[]) || [])];
      // Asegurar que exista la página destino
      while (pages.length <= idx) {
        pages.push({ background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] });
      }
      pages = pages.map((pg: any, i: number) => {
        if (i !== idx) return pg;
        const sections = (pg.sections || []) as any[];
        const exists = sections.find((s: any) => s.key === key);
        if (exists) {
          return { ...pg, sections: sections.map((s: any) => (s.key === key ? { ...s, text } : s)) };
        }
        return { ...pg, sections: [...sections, { key, text }] };
      });
      return { ...prev, pages };
    });
  };

  // Sincroniza los textos escritos con las secciones mapeadas en las páginas
  useEffect(() => {
    // Header: prioriza título escrito, luego título de evento creado
    const headerText = (invitationData.title || invitationData.content.header || event?.title || eventData.title || '').trim();

    // Componer body con mensaje principal + datos del evento (título/fecha/ubicación/descripción)
    const messageText = (invitationData.message || invitationData.content.body || '').trim();
    const dateStr = event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : (eventData.eventDate ? eventData.eventDate.toLocaleDateString() : '');
    const infoLineParts = [event?.title || eventData.title || '', dateStr, event?.location || eventData.location || ''].filter(Boolean);
    const infoLine = infoLineParts.join(' • ');
    const descText = (event?.description || eventData.description || '').trim();
    const bodyText = [messageText, infoLine, descText].filter(Boolean).join('\n');

    const footerText = (invitationData.content.footer || '').trim();

    updateSectionText(mapPages.headerPage, 'header', headerText);
    updateSectionText(mapPages.bodyPage, 'body', bodyText);
    updateSectionText(mapPages.footerPage, 'footer', footerText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationData, mapPages, event, eventData]);

  // Al elegir plantilla principal: aplica diseño y asegura páginas + reemplaza textos
  const applyTemplatePrincipal = (template: Template) => {
    const tplDesign = template.design || {} as EditableDesign;
    const incomingPages = (tplDesign.pages || []) as any[];
    setDesignData((prev: EditableDesign) => {
      let pages = [...incomingPages.map(p => ({ ...p }))];
      const neededPages = Math.max(mapPages.headerPage, mapPages.bodyPage, mapPages.footerPage) + 1;
      while (pages.length < neededPages) pages.push({ background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] });
      // Reemplaza textos con lo que ya escribió el usuario
      const headerText = invitationData.title || invitationData.content.header || '';
      const bodyText = invitationData.message || invitationData.content.body || '';
      const footerText = invitationData.content.footer || '';
      const setSec = (i: number, key: 'header'|'body'|'footer', text: string) => {
        const secs = (pages[i].sections || []) as any[];
        const ex = secs.find((s: any) => s.key === key);
        if (ex) pages[i].sections = secs.map((s: any) => (s.key === key ? { ...s, text } : s));
        else pages[i].sections = [...secs, { key, text }];
      };
      if (headerText) setSec(mapPages.headerPage, 'header', headerText);
      if (bodyText) setSec(mapPages.bodyPage, 'body', bodyText);
      if (footerText) setSec(mapPages.footerPage, 'footer', footerText);
      setSelectedPage(0);
      return { ...tplDesign, pages };
    });
    setSelectedTemplateId(template.id);
  };

  const handleComplete = async () => {
    try {
      if (!event) {
        alert('Primero debes crear un evento');
        return;
      }
      // Construir diseño inicial con páginas y contenido mapeado
      type Page = NonNullable<EditableDesign['pages']>[number];

      const pages: Page[] = (designData.pages ?? []).map((pg: Page) => ({ ...pg }));

      const ensurePage = (i: number) => {
        if (!pages[i]) pages[i] = { background: { type: 'color', value: '#ffffff' }, sections: [], elements: [] };
      };
      ensurePage(mapPages.headerPage);
      ensurePage(mapPages.bodyPage);
      ensurePage(mapPages.footerPage);
      const setSection = (i: number, key: 'header' | 'body' | 'footer', text: string) => {
        const sections = pages[i].sections || [];
        const idx = sections.findIndex((s) => s.key === key);
        if (idx >= 0) sections[idx] = { ...sections[idx], text };
        else sections.push({ key, text });
        pages[i].sections = sections;
      };
      // Componer textos con detalles del evento
      const headerText = (invitationData.title || invitationData.content.header || event.title || '').trim();
      const dateStr = event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '';
      const infoLineParts = [event.title || '', dateStr, event.location || ''].filter(Boolean);
      const infoLine = infoLineParts.join(' • ');
      const descText = (event.description || '').trim();
      const messageText = (invitationData.message || invitationData.content.body || '').trim();
      const bodyText = [messageText, infoLine, descText].filter(Boolean).join('\n');

      if (headerText) setSection(mapPages.headerPage, 'header', headerText);
      if (bodyText) setSection(mapPages.bodyPage, 'body', bodyText);
      if (invitationData.content.footer) setSection(mapPages.footerPage, 'footer', invitationData.content.footer);
      // Insertar datos del evento como elemento de texto para reubicar luego
      const eventText = `${event.title}\n${new Date(event.eventDate).toLocaleDateString()}${event.location ? `\n${event.location}` : ''}`;
      pages[mapPages.bodyPage].elements = [
        ...((pages[mapPages.bodyPage].elements || []) as any[]),
        {
          id: `el-${Date.now()}`,
          type: 'text',
          content: eventText,
          x: 24,
          y: 320,
          zIndex: 2,
          styles: { color: designData.colors?.text || '#1f2937', fontSize: 14 },
        },
      ];

      const invitationPayload = {
        title: invitationData.title || event.title,
        message: invitationData.message,
        type: InvitationType.DIGITAL,
        eventId: event.id,
        templateId: selectedTemplateId || undefined,
        customDesign: { ...designData, pages },
      };
      const created = await createInvitation(invitationPayload);
      const id = (created as { id?: string })?.id ?? invitation?.id;
      if (id) {
        router.push(`/panel/invitaciones/${id}/editor`);
      }
    } catch (err) {
      console.error('Error completando la invitación:', err);
      alert('Hubo un error al guardar la invitación');
    }
  };

  const handleDeleteInvitation = async () => {
    try {
      if (!invitation?.id) {
        alert('Aún no has creado una invitación para eliminar.');
        return;
      }
      const confirmed = window.confirm('¿Seguro que deseas eliminar esta invitación?');
      if (!confirmed) return;
      await invitationService.deleteInvitation(invitation.id);
      alert('Invitación eliminada.');
    } catch (err) {
      console.error('Error eliminando la invitación:', err);
      alert('No se pudo eliminar la invitación');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Crea tu Evento</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Comienza configurando los detalles básicos de tu evento especial.</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Título del evento *</label>
                <input type="text" value={eventData.title} onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Ej: Boda de María y Juan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Tipo de evento</label>
                <select value={eventData.type} onChange={(e) => setEventData(prev => ({ ...prev, type: e.target.value as EventType }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent text-black">
                  <option value={EventType.WEDDING}>Boda</option>
                  <option value={EventType.BIRTHDAY}>Cumpleaños</option>
                  <option value={EventType.CORPORATE}>Corporativo</option>
                  <option value={EventType.GRADUATION}>Graduación</option>
                  <option value={EventType.OTHER}>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Descripción</label>
                <textarea value={eventData.description} onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-32 text-black" placeholder="Describe tu evento..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fecha del evento *</label>
                  <input type="date" value={eventData.eventDate.toISOString().split('T')[0]} onChange={(e) => setEventData(prev => ({ ...prev, eventDate: new Date(e.target.value) }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent text-black" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Ubicación</label>
                  <input type="text" value={eventData.location} onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent text-black" placeholder="Lugar del evento" />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Personaliza el diseño</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Ajusta los colores y la apariencia de tu invitación para que refleje tu estilo personal.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-celebrity-gray-900">Colores principales</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color principal</label>
                    <input type="color" value={designData.colors?.primary || '#8b5cf6'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), primary: e.target.value } }))} className="w-full h-12 rounded-lg border border-celebrity-gray-300 text-black" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color secundario</label>
                    <input type="color" value={designData.colors?.secondary || '#f59e0b'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), secondary: e.target.value } }))} className="w-full h-12 rounded-lg border border-celebrity-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color de acento</label>
                    <input type="color" value={designData.colors?.accent || '#ec4899'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), accent: e.target.value } }))} className="w-full h-12 rounded-lg border border-celebrity-gray-300" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color de texto</label>
                    <input type="color" value={designData.colors?.text || '#1f2937'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), text: e.target.value } }))} className="w-full h-12 rounded-lg border border-celebrity-gray-300" />
                  </div>
                </div>
              </div>
              <div className="celebrity-card p-6">
                <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Vista previa</h3>
                <div className="h-64 rounded-lg flex items-center justify-center font-bold text-xl" style={{ background: `linear-gradient(135deg, ${designData.colors?.primary || '#8b5cf6'}, ${designData.colors?.secondary || '#f59e0b'})`, color: designData.colors?.text || '#ffffff' }}>
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4" />
                    <p>Tu invitación</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Elige tu plantilla</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Selecciona una plantilla que se adapte al estilo de tu evento. Puedes personalizarla después.</p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebrity-purple"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className={`celebrity-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${template?.id === selectedTemplateId ? 'ring-2 ring-celebrity-purple' : ''}`}>
                    <div className="h-48 bg-gradient-to-br from-celebrity-purple/20 to-celebrity-pink/20 flex items-center justify-center">
                      <div className="w-20 h-20 celebrity-gradient rounded-lg flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-celebrity-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-celebrity-gray-600 mb-3 capitalize">{template.type}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Button variant="outline" onClick={() => applyTemplatePrincipal(template)}>Usar como principal</Button>
                        <Button variant="ghost" onClick={() => {
                          try {
                            const pagesToAdd = (template.design?.pages || []);
                            if (!pagesToAdd || pagesToAdd.length === 0) return;
                            setDesignData((prev: EditableDesign) => ({
                              ...prev,
                              pages: [
                                ...((prev.pages || []) as any[]).map((p: any) => ({ ...p })),
                                ...pagesToAdd.map((p: any) => ({ ...p })),
                              ],
                            }));
                          } catch (err) {
                            console.error('Error importando páginas del template:', err);
                            alert('No se pudo importar páginas de este template');
                          }
                        }}>Agregar páginas</Button>
                      </div>
                      {template?.id === selectedTemplateId && (
                        <div className="flex items-center text-celebrity-purple">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Seleccionado</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Añade el contenido</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Escribe los datos y visualiza la invitación en vivo al costado.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Inputs */}
              <div className="celebrity-card p-6 xl:col-span-2 space-y-4">
                {/* Estilo del encabezado */}
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Estilo de encabezado</label>
                  <select
                    className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent"
                    value={designData.layout || 'template'}
                    onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, layout: e.target.value }))}
                  >
                    <option value="template">Mantener estilo de plantilla (arriba)</option>
                    <option value="centered-header">Centrado grande (medio de la página)</option>
                  </select>
                  <p className="text-xs text-celebrity-gray-500 mt-1">Tu selección se mantendrá en “Sube imágenes” y en la vista final.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Título del evento (Header)</label>
                  <input type="text" value={invitationData.title} onChange={(e) => setInvitationData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder={event?.title ? `Ej: ${event.title}` : 'Ej: Boda de María y Juan'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Mensaje principal (Body)</label>
                  <textarea value={invitationData.message} onChange={(e) => setInvitationData(prev => ({ ...prev, message: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-32" placeholder="Incluye fecha, hora, ubicación y detalles relevantes." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Contenido adicional</label>
                  <textarea value={invitationData.content.body} onChange={(e) => setInvitationData(prev => ({ ...prev, content: { ...prev.content, body: e.target.value } }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-24" placeholder="Instrucciones, dress code, hashtag, etc." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Pie de página (Footer)</label>
                  <input type="text" value={invitationData.content.footer} onChange={(e) => setInvitationData(prev => ({ ...prev, content: { ...prev.content, footer: e.target.value } }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Contacto, RSVP, redes sociales…" />
                </div>

                {/* Mapeo de secciones a páginas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Página para Header</label>
                    <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={mapPages.headerPage} onChange={(e) => setMapPages(prev => ({ ...prev, headerPage: Number(e.target.value) }))}>
                      {((designData.pages || []) as any[]).map((_, i) => <option key={`hp-${i}`} value={i}>Página {i + 1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Página para Body</label>
                    <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={mapPages.bodyPage} onChange={(e) => setMapPages(prev => ({ ...prev, bodyPage: Number(e.target.value) }))}>
                      {((designData.pages || []) as any[]).map((_, i) => <option key={`bp-${i}`} value={i}>Página {i + 1}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Página para Footer</label>
                    <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={mapPages.footerPage} onChange={(e) => setMapPages(prev => ({ ...prev, footerPage: Number(e.target.value) }))}>
                      {((designData.pages || []) as any[]).map((_, i) => <option key={`fp-${i}`} value={i}>Página {i + 1}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vista previa y fondo */}
              <div className="celebrity-card p-6 xl:col-span-1">
                <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Vista previa</h3>
                {(() => {
                  const pg = ((designData.pages || []) as any[])[selectedPage];
                  const previewStyle: React.CSSProperties = { width: 360, height: 640, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid #e5e7eb', background: '#ffffff' };
                  const backgroundStyle = pg?.background?.type === 'image'
                    ? { backgroundImage: `url(${pg?.background?.value || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: pg?.background?.value || '#ffffff' };
                  const isCentered = (designData.layout === 'centered-header');
                  return (
                    <>
                      <div className="mx-auto" style={previewStyle}>
                        <div className="absolute inset-0" style={backgroundStyle} />
                        <div className="absolute inset-0 p-3">
                          {isCentered ? (
                            <>
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-3xl font-serif font-bold text-center" style={{ color: designData.colors?.text || '#1f2937' }}>{(pg?.sections || []).find((s: any) => s.key === 'header')?.text}</div>
                              <div className="absolute left-4 right-4 top-[60%] text-sm text-center whitespace-pre-line" style={{ color: designData.colors?.text || '#374151' }}>{(pg?.sections || []).find((s: any) => s.key === 'body')?.text}</div>
                            </>
                          ) : (
                            <>
                              <div className="absolute left-3 top-3 text-xl font-serif font-bold" style={{ color: designData.colors?.text || '#1f2937' }}>{(pg?.sections || []).find((s: any) => s.key === 'header')?.text}</div>
                              <div className="absolute left-3 right-3 top-14 text-sm whitespace-pre-line" style={{ color: designData.colors?.text || '#374151' }}>{(pg?.sections || []).find((s: any) => s.key === 'body')?.text}</div>
                            </>
                          )}
                          <div className="absolute left-3 bottom-3 text-xs opacity-80" style={{ color: designData.colors?.text || '#6b7280' }}>{(pg?.sections || []).find((s: any) => s.key === 'footer')?.text}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Tipo de fondo</label>
                          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={pg?.background?.type || 'color'} onChange={(e) => updateBackground(selectedPage, e.target.value as 'image' | 'color', pg?.background?.value || '')}>
                            <option value="image">Imagen (URL)</option>
                            <option value="color">Color</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
                          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="https://... o #f0e6dc" value={pg?.background?.value || ''} onChange={(e) => updateBackground(selectedPage, pg?.background?.type || 'color', e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Página seleccionada</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {((designData.pages || []) as any[]).map((p: any, i: number) => (
                            <button key={`sel-${i}`} onClick={() => setSelectedPage(i)} className={`px-3 py-2 rounded border text-xs ${selectedPage === i ? 'border-celebrity-purple text-celebrity-purple' : 'border-celebrity-gray-300 text-celebrity-gray-700'}`}>Página {i + 1}</button>
                          ))}
                          <Button variant="outline" onClick={addPage}>Agregar página</Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-2">Páginas del diseño</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-3xl mx-auto">
                Ajusta el fondo y los textos por página. Importa páginas en el paso anterior y aquí reemplaza <strong>Header</strong>, <strong>Body</strong> y <strong>Footer</strong> con los datos de tu evento.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Lista de páginas */}
              <div className="celebrity-card p-6 xl:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-celebrity-gray-900">Páginas</h3>
                  <Button variant="outline" onClick={addPage}>Agregar página</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {((designData.pages || []) as any[]).map((pg: any, idx: number) => (
                    <div key={idx} className={`cursor-pointer rounded border ${idx === selectedPage ? 'border-celebrity-purple' : 'border-celebrity-gray-200'}`} onClick={() => setSelectedPage(idx)}>
                      <div style={{ width: 120, height: 200, ...(pg?.background?.type === 'image' ? { backgroundImage: `url(${pg?.background?.value})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: pg?.background?.value || '#ffffff' }) }} />
                      <div className="p-2 flex items-center justify-between text-xs">
                        <span>Página {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <button className="text-celebrity-gray-700" onClick={(e) => { e.stopPropagation(); movePage(idx, idx - 1); }} title="Subir">↑</button>
                          <button className="text-celebrity-gray-700" onClick={(e) => { e.stopPropagation(); movePage(idx, idx + 1); }} title="Bajar">↓</button>
                          <button className="text-red-600" onClick={(e) => { e.stopPropagation(); removePage(idx); }}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Configuración de página seleccionada */}
              <div className="celebrity-card p-6 xl:col-span-1">
                <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Fondo y secciones</h3>
                {(() => {
                  const pg = ((designData.pages || []) as any[])[selectedPage];
                  const previewStyle: React.CSSProperties = { width: 360, height: 640, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid #e5e7eb', background: '#ffffff' };
                  const backgroundStyle = pg?.background?.type === 'image'
                    ? { backgroundImage: `url(${pg?.background?.value || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: pg?.background?.value || '#ffffff' };
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Tipo de fondo</label>
                          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={pg?.background?.type || 'color'} onChange={(e) => updateBackground(selectedPage, e.target.value as 'image' | 'color', pg?.background?.value || '')}>
                            <option value="image">Imagen (URL)</option>
                            <option value="color">Color</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
                          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="https://... o #f0e6dc" value={pg?.background?.value || ''} onChange={(e) => updateBackground(selectedPage, pg?.background?.type || 'color', e.target.value)} />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Header (título)</label>
                          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder={event?.title ? `Ej: ${event.title}` : 'Título del evento'} value={(pg?.sections || []).find((s: any) => s.key === 'header')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'header', e.target.value)} />
                          <p className="text-xs text-celebrity-gray-500 mt-1">Sugerencia: usa el título del evento (ej. “Boda de María y Juan”).</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Body (mensaje) </label>
                          <textarea rows={3} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder={event?.eventDate ? `Ej: ${new Date(event.eventDate).toLocaleDateString()} · ${event?.location || 'Lugar'}` : 'Mensaje principal y detalles del evento'} value={(pg?.sections || []).find((s: any) => s.key === 'body')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'body', e.target.value)} />
                          <p className="text-xs text-celebrity-gray-500 mt-1">Incluye fecha, hora, ubicación y cualquier instrucción importante.</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Footer (pie de página)</label>
                          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="Contacto, RSVP, redes sociales…" value={(pg?.sections || []).find((s: any) => s.key === 'footer')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'footer', e.target.value)} />
                        </div>
                      </div>

                      {/* Vista previa */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Vista previa</h4>
                        <div className="mx-auto" style={previewStyle}>
                          <div className="absolute inset-0" style={backgroundStyle} />
                          <div className="absolute inset-0 p-3">
                            {designData.layout === 'centered-header' ? (
                              <>
                                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-3xl font-serif font-bold text-center" style={{ color: designData.colors?.text || '#1f2937' }}>{(pg?.sections || []).find((s: any) => s.key === 'header')?.text}</div>
                                <div className="absolute left-4 right-4 top-[60%] text-sm text-center whitespace-pre-line" style={{ color: designData.colors?.text || '#374151' }}>{(pg?.sections || []).find((s: any) => s.key === 'body')?.text}</div>
                              </>
                            ) : (
                              <>
                                <div className="absolute left-3 top-3 text-xl font-serif font-bold" style={{ color: designData.colors?.text || '#1f2937' }}>{(pg?.sections || []).find((s: any) => s.key === 'header')?.text}</div>
                                <div className="absolute left-3 right-3 top-14 text-sm whitespace-pre-line" style={{ color: designData.colors?.text || '#374151' }}>{(pg?.sections || []).find((s: any) => s.key === 'body')?.text}</div>
                              </>
                            )}
                            <div className="absolute left-3 bottom-3 text-xs opacity-80" style={{ color: designData.colors?.text || '#6b7280' }}>{(pg?.sections || []).find((s: any) => s.key === 'footer')?.text}</div>
                          </div>
                        </div>
                        <p className="text-xs text-celebrity-gray-500 mt-2">Usa URLs públicas de imagen (Drive, CDN) para el fondo, o colores HEX (#f0e6dc).</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Revisa y guarda</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Guarda tu invitación y continúa en el editor visual.</p>
            </div>
            <div className="celebrity-card p-6 max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-celebrity-gray-900">Resumen</h3>
                <p className="text-sm text-celebrity-gray-700">Plantilla principal: {templates.find(t => t.id === selectedTemplateId)?.name || 'Ninguna'}</p>
                <p className="text-sm text-celebrity-gray-700">Páginas totales: {(designData.pages || []).length || 0}</p>
                <p className="text-sm text-celebrity-gray-700">Título: {invitationData.title || event?.title || '-'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleComplete} className="celebrity-gradient text-white">Guardar y abrir editor</Button>
                {invitation?.id ? (
                  <Button variant="outline" onClick={handleDeleteInvitation}>Eliminar invitación</Button>
                ) : null}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <OrganizerProtectedRoute>
      <div className="flex h-screen bg-celebrity-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">Crear Invitación</h1>
                <p className="text-celebrity-gray-600 mt-1">Sigue los pasos para crear y personalizar tu invitación</p>
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>Atrás</Button>
                <Button onClick={handleNext}>{currentStep === steps.length ? 'Guardar y abrir editor' : 'Siguiente'}</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <button key={step.id} onClick={() => handleStepClick(step.id)} className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${isActive ? 'bg-celebrity-purple/10 text-celebrity-purple' : 'text-celebrity-gray-700 hover:bg-celebrity-gray-100'}`}>
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="font-medium">{step.title}</span>
                    {isCompleted ? <CheckCircle className="w-4 h-4 ml-2 text-celebrity-purple" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-8 py-6">
            <div className="celebrity-card p-6">{renderStepContent()}</div>
          </div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}