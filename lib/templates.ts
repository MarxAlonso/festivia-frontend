import { api } from './api';

export enum TemplateType {
  WEDDING_CLASSIC = 'wedding_classic',
  WEDDING_MODERN = 'wedding_modern',
  BIRTHDAY_FUN = 'birthday_fun',
  BIRTHDAY_ELEGANT = 'birthday_elegant',
  CORPORATE_FORMAL = 'corporate_formal',
  CORPORATE_CASUAL = 'corporate_casual',
  CUSTOM = 'custom',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  type: TemplateType;
  status: TemplateStatus;
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
    pages?: Array<{
      background?: { type: 'color' | 'image'; value: string };
      sections?: Array<{ key: string; text?: string }>;
      elements?: Array<{
        id: string;
        type: 'text' | 'image' | 'shape' | 'countdown' | 'map';
        content?: string;
        src?: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
        rotation?: number;
        zIndex?: number;
        style?: Record<string, string>;
        countdown?: {
          source: 'event' | 'custom';
          dateISO?: string;
        };
        map?: {
          source: 'event' | 'custom';
          query?: string;
          url?: string;
        };
      }>;
    }>;
  };
  content?: {
    header?: string;
    body?: string;
    footer?: string;
    images?: string[];
  };
  price: number;
  previewImage?: string;
  eventId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  type: TemplateType;
  design: Template['design'];
  content?: Template['content'];
  price?: number;
  eventId?: string;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {
  status?: TemplateStatus;
}

export const templateService = {
  // Obtener todos los templates
  getTemplates: async (params?: {
    type?: TemplateType;
    status?: TemplateStatus;
    eventId?: string;
  }): Promise<Template[]> => {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.eventId) query.append('eventId', params.eventId);
    
    const response = await api.get(`/templates?${query.toString()}`);
    return response.data;
  },

  // Obtener template por ID
  getTemplateById: async (id: string): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Crear nuevo template
  createTemplate: async (data: CreateTemplateDto): Promise<Template> => {
    const response = await api.post('/templates', data);
    return response.data;
  },

  // Actualizar template
  updateTemplate: async (id: string, data: UpdateTemplateDto): Promise<Template> => {
    const response = await api.patch(`/templates/${id}`, data);
    return response.data;
  },

  // Eliminar template
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  // Obtener templates por tipo de evento
  getTemplatesByEventType: async (eventType: string): Promise<Template[]> => {
    const response = await api.get(`/templates/event-type/${eventType}`);
    return response.data;
  },

  // Duplicar template
  duplicateTemplate: async (id: string): Promise<Template> => {
    const response = await api.post(`/templates/${id}/duplicate`);
    return response.data;
  },
};