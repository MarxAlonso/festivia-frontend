import { api } from './api';
import { EventType } from './events';
import { TemplateType } from './templates';

export enum InvitationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  DELIVERED = 'delivered',
  VIEWED = 'viewed',
  EXPIRED = 'expired',
}

export enum InvitationType {
  DIGITAL = 'digital',
  PRINTED = 'printed',
  HYBRID = 'hybrid',
}

export interface Invitation {
  id: string;
  title: string;
  message?: string;
  type: InvitationType;
  status: InvitationStatus;
  eventId: string;
  createdById: string;
  templateId?: string;
  customDesign?: Record<string, any>;
  qrCode?: string;
  uniqueLink?: string;
  sentAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationDto {
  title: string;
  message?: string;
  type?: InvitationType;
  eventId: string;
  templateId?: string;
  customDesign?: Record<string, any>;
  expiresAt?: Date;
}

export interface UpdateInvitationDto extends Partial<CreateInvitationDto> {
  status?: InvitationStatus;
}

export interface InvitationDesignData {
  title: string;
  message?: string;
  eventDetails: {
    date: Date;
    time?: string;
    location?: string;
    address?: string;
  };
  design: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    layout: string;
    customCss?: string;
  };
  content?: {
    header?: string;
    body?: string;
    footer?: string;
    images?: string[];
  };
}

export const invitationService = {
  // Obtener todas las invitaciones del usuario
  getUserInvitations: async (): Promise<Invitation[]> => {
    const response = await api.get('/invitations/mine');
    return response.data;
  },

  // Obtener invitaciones por evento
  getEventInvitations: async (eventId: string): Promise<Invitation[]> => {
    const response = await api.get(`/invitations/event/${eventId}`);
    return response.data;
  },

  // Obtener invitación por ID
  getInvitationById: async (id: string): Promise<Invitation> => {
    const response = await api.get(`/invitations/${id}`);
    return response.data;
  },

  // Crear nueva invitación
  createInvitation: async (data: CreateInvitationDto): Promise<Invitation> => {
    const response = await api.post('/invitations', data);
    return response.data;
  },

  // Actualizar invitación
  updateInvitation: async (id: string, data: UpdateInvitationDto): Promise<Invitation> => {
    const response = await api.patch(`/invitations/${id}`, data);
    return response.data;
  },

  // Actualizar diseño de invitación (endpoint protegido para organizer)
  updateInvitationDesign: async (id: string, customDesign: Record<string, any>): Promise<Invitation> => {
    const response = await api.patch(`/invitations/${id}/design`, { customDesign });
    return response.data;
  },

  // Eliminar invitación
  deleteInvitation: async (id: string): Promise<void> => {
    await api.delete(`/invitations/${id}`);
  },

  // Enviar invitación
  sendInvitation: async (id: string): Promise<Invitation> => {
    const response = await api.post(`/invitations/${id}/send`);
    return response.data;
  },

  // Duplicar invitación
  duplicateInvitation: async (id: string): Promise<Invitation> => {
    const response = await api.post(`/invitations/${id}/duplicate`);
    return response.data;
  },

  // Generar link único
  generateUniqueLink: async (id: string): Promise<{ link: string }> => {
    const response = await api.post(`/invitations/${id}/generate-link`);
    return response.data;
  },

  // Obtener invitación pública por slug (sin auth)
  getPublicInvitationBySlug: async (slug: string): Promise<{
    id: string;
    title: string;
    message?: string;
    customDesign?: Record<string, any>;
    event?: { title: string; description?: string; eventDate: string; location?: string };
  }> => {
    const response = await api.get(`/public/invitations/${slug}`);
    return response.data;
  },

  // Confirmación pública por slug
  confirmPublicInvitation: async (slug: string, data: { name: string; lastName: string }): Promise<{ id: string; name: string; lastName: string; createdAt: string }> => {
    const response = await api.post(`/public/invitations/${slug}/confirmations`, data);
    return response.data;
  },

  // Listar confirmaciones de una invitación (organizer)
  getInvitationConfirmations: async (id: string): Promise<Array<{ id: string; name: string; lastName: string; createdAt: string }>> => {
    const response = await api.get(`/invitations/${id}/confirmations`);
    return response.data;
  },

  // Obtener estadísticas
  getInvitationStats: async (id: string): Promise<{
    views: number;
    rsvpCount: number;
    confirmedCount: number;
    declinedCount: number;
    pendingCount: number;
  }> => {
    const response = await api.get(`/invitations/${id}/stats`);
    return response.data;
  },

  // Marcar como vista
  markAsViewed: async (id: string): Promise<void> => {
    await api.patch(`/invitations/${id}/view`);
  },
};