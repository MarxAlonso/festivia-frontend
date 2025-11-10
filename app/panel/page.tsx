'use client';

import React from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { HeaderPanel } from '@/components/uiPanelCliente/HeaderPanel';
import { 
  Plus, 
  Eye, 
  Download, 
  Share2, 
  Calendar, 
  Users, 
  TrendingUp,
  Sparkles,
  Clock,
  Star
} from 'lucide-react';

// Mock data - esto vendría del backend
const recentInvitations = [
  {
    id: 1,
    title: 'Boda de María & Juan',
    template: 'Elegante Floral',
    status: 'completado',
    createdAt: '2024-01-15',
    views: 245,
    rsvp: 89
  },
  {
    id: 2,
    title: 'Cumpleaños 30 Años',
    template: 'Moderno Dorado',
    status: 'en_progreso',
    createdAt: '2024-01-18',
    views: 156,
    rsvp: 42
  },
  {
    id: 3,
    title: 'Graduación Universidad',
    template: 'Clásico Azul',
    status: 'borrador',
    createdAt: '2024-01-20',
    views: 0,
    rsvp: 0
  }
];

const templates = [
  { id: 1, name: 'Elegante Floral', preview: '/templates/floral.jpg', category: 'Bodas' },
  { id: 2, name: 'Moderno Dorado', preview: '/templates/gold.jpg', category: 'Cumpleaños' },
  { id: 3, name: 'Clásico Azul', preview: '/templates/blue.jpg', category: 'Graduaciones' },
  { id: 4, name: 'Minimalista Blanco', preview: '/templates/minimal.jpg', category: 'Corporativo' }
];

export default function PanelPage() {
  return (
    <div className="flex h-screen bg-celebrity-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <HeaderPanel />

        {/* Stats Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Total Invitaciones</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">24</p>
                </div>
                <div className="w-12 h-12 celebrity-gradient rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">8</p>
                </div>
                <div className="w-12 h-12 celebrity-gold-gradient rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Total Vistas</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">1,247</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-celebrity-pink to-celebrity-purple rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Confirmaciones</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">342</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-celebrity-green to-celebrity-teal rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invitations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif text-celebrity-gray-900">
                Invitaciones Recientes
              </h2>
              <Link href="/panel/eventos" className="text-celebrity-purple hover:text-celebrity-purple/80 font-medium">
                Ver todas
              </Link>
            </div>
            
            <div className="grid gap-4">
              {recentInvitations.map((invitation) => (
                <div key={invitation.id} className="celebrity-card p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 celebrity-gradient rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-celebrity-gray-900">{invitation.title}</h3>
                      <p className="text-sm text-celebrity-gray-600">{invitation.template}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-celebrity-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {invitation.createdAt}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {invitation.views}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {invitation.rsvp}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invitation.status === 'completado' 
                        ? 'bg-green-100 text-green-800'
                        : invitation.status === 'en_progreso'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invitation.status === 'completado' ? 'Completado' :
                       invitation.status === 'en_progreso' ? 'En Progreso' : 'Borrador'}
                    </span>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-serif text-celebrity-gray-900">
                Plantillas Populares
              </h2>
              <Link href="/panel/plantillas" className="text-celebrity-purple hover:text-celebrity-purple/80 font-medium">
                Explorar más
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="celebrity-card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 bg-gradient-to-br from-celebrity-purple/20 to-celebrity-pink/20 flex items-center justify-center">
                    <div className="w-20 h-20 celebrity-gradient rounded-lg flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-celebrity-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-celebrity-gray-600 mb-3">{template.category}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      href={`/panel/crear?template=${template.id}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Usar Plantilla
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}