import { api } from './api';

export enum EventType {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  CORPORATE = 'corporate',
  GRADUATION = 'graduation',
  OTHER = 'other',
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  eventDate: string;
  location?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  settings?: Record<string, any>;
  coverImage?: string;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  type: EventType;
  eventDate: string;
  location?: string;
  address?: Event['address'];
  settings?: Record<string, any>;
  coverImage?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: EventStatus;
}

export const eventService = {
  // Obtener todos los eventos del usuario
  getUserEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events/mine');
    return response.data;
  },

  // Obtener evento por ID
  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Crear nuevo evento
  createEvent: async (data: CreateEventDto): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  // Actualizar evento
  updateEvent: async (id: string, data: UpdateEventDto): Promise<Event> => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  // Eliminar evento
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Obtener estadísticas del evento
  getEventStats: async (id: string): Promise<{
    totalInvitations: number;
    sentInvitations: number;
    viewedInvitations: number;
    rsvpCount: number;
    confirmedCount: number;
  }> => {
    const response = await api.get(`/events/${id}/stats`);
    return response.data;
  },
};