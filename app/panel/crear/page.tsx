'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useInvitationCreator } from '@/hooks/useInvitationCreator';
import { EventType } from '@/lib/events';
import { Template, TemplateStatus, templateService } from '@/lib/templates';
import { InvitationType } from '@/lib/invitations';
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

  const handleComplete = async () => {
    try {
      if (!event) {
        alert('Primero debes crear un evento');
        return;
      }
      const invitationPayload = {
        title: invitationData.title || event.title,
        message: invitationData.message,
        type: InvitationType.DIGITAL,
        eventId: event.id,
        templateId: selectedTemplateId || undefined,
        customDesign: designData,
      };
      const created = await createInvitation(invitationPayload);
      const id = (created as { id?: string })?.id ?? invitation?.id;
      if (id) {
        router.push(`/panel/invitaciones/${id}/editor`);
      } else {
        router.push('/visualizaciondeldesigndelainvitacion');
      }
    } catch (err) {
      console.error('Error completando la invitación:', err);
      alert('Hubo un error al guardar la invitación');
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
                <input type="text" value={eventData.title} onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Ej: Boda de María y Juan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Tipo de evento</label>
                <select value={eventData.type} onChange={(e) => setEventData(prev => ({ ...prev, type: e.target.value as EventType }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent">
                  <option value={EventType.WEDDING}>Boda</option>
                  <option value={EventType.BIRTHDAY}>Cumpleaños</option>
                  <option value={EventType.CORPORATE}>Corporativo</option>
                  <option value={EventType.GRADUATION}>Graduación</option>
                  <option value={EventType.OTHER}>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Descripción</label>
                <textarea value={eventData.description} onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-32" placeholder="Describe tu evento..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fecha del evento *</label>
                  <input type="date" value={eventData.eventDate.toISOString().split('T')[0]} onChange={(e) => setEventData(prev => ({ ...prev, eventDate: new Date(e.target.value) }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Ubicación</label>
                  <input type="text" value={eventData.location} onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Lugar del evento" />
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
                    <input type="color" value={designData.colors?.primary || '#8b5cf6'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), primary: e.target.value } }))} className="w-full h-12 rounded-lg border border-celebrity-gray-300" />
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
                  <div key={template.id} className={`celebrity-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${template?.id === selectedTemplateId ? 'ring-2 ring-celebrity-purple' : ''}`} onClick={() => { setSelectedTemplateId(template.id); setDesignData(template.design); }}>
                    <div className="h-48 bg-gradient-to-br from-celebrity-purple/20 to-celebrity-pink/20 flex items-center justify-center">
                      <div className="w-20 h-20 celebrity-gradient rounded-lg flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-celebrity-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-celebrity-gray-600 mb-3 capitalize">{template.type}</p>
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
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Escribe toda la información importante para tus invitados.</p>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Título del evento</label>
                <input type="text" value={invitationData.title} onChange={(e) => setInvitationData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Ej: Boda de María y Juan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Mensaje de la invitación</label>
                <textarea value={invitationData.message} onChange={(e) => setInvitationData(prev => ({ ...prev, message: e.target.value }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-32" placeholder="Escribe el mensaje principal de tu invitación..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Contenido adicional</label>
                <textarea value={invitationData.content.body} onChange={(e) => setInvitationData(prev => ({ ...prev, content: { ...prev.content, body: e.target.value } }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent h-32" placeholder="Información adicional, instrucciones, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Pie de página</label>
                <input type="text" value={invitationData.content.footer} onChange={(e) => setInvitationData(prev => ({ ...prev, content: { ...prev.content, footer: e.target.value } }))} className="w-full px-4 py-3 border border-celebrity-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent" placeholder="Información de contacto, RSVP, etc." />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-4">Sube imágenes</h2>
              <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">Añade fotos o imágenes que complementen tu invitación y la hagan única.</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="border-2 border-dashed border-celebrity-gray-300 rounded-lg p-8 text-center hover:border-celebrity-purple transition-colors cursor-pointer">
                <Image className="w-12 h-12 text-celebrity-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-celebrity-gray-900 mb-2">Arrastra tus imágenes aquí</p>
                <p className="text-sm text-celebrity-gray-600 mb-4">o haz clic para seleccionar archivos</p>
                <Button variant="outline">Seleccionar archivos</Button>
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
          </div>
        );
    }
  };

  return (
    <OrganizerProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-celebrity-purple/5 via-white to-celebrity-pink/5">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-serif text-celebrity-gray-900">Crear Invitación</h1>
            <p className="text-celebrity-gray-600">Sigue los pasos para crear y personalizar tu invitación</p>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
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
            <div className="space-x-2">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>Atrás</Button>
              <Button onClick={handleNext}>{currentStep === steps.length ? 'Guardar y abrir editor' : 'Siguiente'}</Button>
            </div>
          </div>
          <div className="celebrity-card p-6">{renderStepContent()}</div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}