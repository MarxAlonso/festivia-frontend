'use client';

import React from 'react';
import Link from 'next/link';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { HeaderAdmin } from '@/components/uiPanelAdmin/HeaderAdmin';
import { Button } from '@/components/ui/Button';
import { Users, Shield, Settings, Database, BarChart3, UserCog, ClipboardList } from 'lucide-react';

export default function PanelAdminPage() {
  return (
    <div className="flex h-screen bg-[#F6E7E4]">
      <SidebarAdmin />

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <HeaderAdmin />

        {/* Stats Cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Usuarios Totales</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">128</p>
                </div>
                <div className="w-12 h-12 celebrity-gradient rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">3</p>
                </div>
                <div className="w-12 h-12 celebrity-gold-gradient rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Proveedores</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-celebrity-pink to-celebrity-purple rounded-lg flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-celebrity-gray-600">Pendientes de Aprobación</p>
                  <p className="text-2xl font-bold text-celebrity-gray-900">5</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-celebrity-green to-celebrity-teal rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif text-celebrity-gray-900">Gestión de Usuarios</h2>
                <Button variant="outline">Ver todos</Button>
              </div>
              <p className="text-celebrity-gray-600 mb-4">Administra cuentas, roles y estados de los usuarios.</p>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" /> Crear usuario
                </Button>
                <Button variant="outline">
                  <Shield className="w-4 h-4 mr-2" /> Cambiar roles
                </Button>
              </div>
            </div>

            <div className="celebrity-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif text-celebrity-gray-900">Configuración del Sistema</h2>
                <Button variant="outline">Abrir</Button>
              </div>
              <p className="text-celebrity-gray-600 mb-4">Parámetros globales, seguridad y backups.</p>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" /> Parámetros
                </Button>
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" /> Copias de seguridad
                </Button>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="mt-6 celebrity-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-serif text-celebrity-gray-900">Reportes</h2>
              <Button variant="outline">Exportar</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-celebrity-purple mr-2" />
                  <span className="font-medium">Actividad de usuarios</span>
                </div>
                <p className="text-sm text-celebrity-gray-600">Últimos 30 días</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-celebrity-purple mr-2" />
                  <span className="font-medium">Uso de plantillas</span>
                </div>
                <p className="text-sm text-celebrity-gray-600">Por categoría</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-5 h-5 text-celebrity-purple mr-2" />
                  <span className="font-medium">Errores del sistema</span>
                </div>
                <p className="text-sm text-celebrity-gray-600">Incidentes recientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}