import { useState, useCallback } from 'react';
import { invitationService, CreateInvitationDto, Invitation } from '@/lib/invitations';
import { eventService, CreateEventDto, Event } from '@/lib/events';
import { templateService, CreateTemplateDto, Template } from '@/lib/templates';

interface UseInvitationCreatorReturn {
  loading: boolean;
  error: string | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // Evento
  event: Event | null;
  createEvent: (data: CreateEventDto) => Promise<Event>;
  
  // Template
  template: Template | null;
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string) => void;
  createTemplate: (data: CreateTemplateDto) => Promise<Template>;
  
  // Invitación
  invitation: Invitation | null;
  createInvitation: (data: CreateInvitationDto) => Promise<Invitation>;
  updateInvitation: (id: string, data: any) => Promise<Invitation>;
  
  // Diseño
  designData: any;
  setDesignData: (data: any) => void;
  
  // Finalizar proceso
  completeInvitation: () => Promise<Invitation>;
}

export const useInvitationCreator = (): UseInvitationCreatorReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [event, setEvent] = useState<Event | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [designData, setDesignData] = useState<any>({});

  const handleError = (err: any) => {
    const message = err.response?.data?.message || err.message || 'Error desconocido';
    setError(message);
    throw new Error(message);
  };

  const createEvent = useCallback(async (data: CreateEventDto): Promise<Event> => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await eventService.createEvent(data);
      setEvent(newEvent);
      return newEvent;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateDto): Promise<Template> => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate = await templateService.createTemplate(data);
      setTemplate(newTemplate);
      return newTemplate;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvitation = useCallback(async (data: CreateInvitationDto): Promise<Invitation> => {
    setLoading(true);
    setError(null);
    try {
      const newInvitation = await invitationService.createInvitation(data);
      setInvitation(newInvitation);
      return newInvitation;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvitation = useCallback(async (id: string, data: any): Promise<Invitation> => {
    setLoading(true);
    setError(null);
    try {
      const updatedInvitation = await invitationService.updateInvitation(id, data);
      setInvitation(updatedInvitation);
      return updatedInvitation;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const completeInvitation = useCallback(async (): Promise<Invitation> => {
    if (!invitation) {
      throw new Error('No hay invitación para completar');
    }

    setLoading(true);
    setError(null);
    try {
      // Preparar el diseño personalizado en formato JSONB para el backend
      const customDesign = {
        colors: designData.colors || {
          primary: '#8b5cf6',
          secondary: '#f59e0b',
          accent: '#ec4899',
          text: '#1f2937'
        },
        typography: designData.typography || {
          fontFamily: 'serif',
          fontSize: 'medium',
          textAlign: 'center'
        },
        layout: designData.layout || {
          background: 'gradient',
          borderRadius: 'rounded',
          spacing: 'normal'
        },
        images: designData.images || [],
        music: designData.music || null,
        customizations: designData.customizations || {}
      };

      // Actualizar el diseño personalizado en endpoint dedicado
      const updatedInvitation = await invitationService.updateInvitationDesign(invitation.id, customDesign);
      
      setInvitation(updatedInvitation);
      return updatedInvitation;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [invitation, designData]);

  return {
    loading,
    error,
    currentStep,
    setCurrentStep,
    event,
    createEvent,
    template,
    selectedTemplateId,
    setSelectedTemplateId,
    createTemplate,
    invitation,
    createInvitation,
    updateInvitation,
    designData,
    setDesignData,
    completeInvitation,
  };
};