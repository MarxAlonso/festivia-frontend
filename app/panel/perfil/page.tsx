'use client';

import React from 'react';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function PerfilPage() {
  const { user, logout } = useAuth();

  return (
    <OrganizerProtectedRoute>
      <div className="flex h-screen bg-celebrity-gray-50">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
            <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">
              Mi Perfil
            </h1>
            <p className="text-celebrity-gray-600 mt-1">
              Información personal del usuario registrado.
            </p>
          </div>
          <div className="px-8 py-10 max-w-3xl mx-auto">
            <div className="celebrity-card p-8 rounded-2xl shadow-sm border border-celebrity-gray-200 bg-white space-y-10">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-celebrity-purple to-celebrity-darkpurple text-white text-4xl flex items-center justify-center shadow-md">
                  {user?.firstName?.[0]}
                </div>
                <p className="text-lg font-semibold text-celebrity-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-celebrity-gray-500">{user?.email}</p>
              </div>

              {/* Datos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs uppercase font-medium text-celebrity-gray-500 tracking-wide">Nombre</p>
                  <p className="text-lg font-semibold text-black">{user?.firstName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase font-medium text-celebrity-gray-500 tracking-wide">Apellido</p>
                  <p className="text-lg font-semibold text-black">{user?.lastName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase font-medium text-celebrity-gray-500 tracking-wide">Correo</p>
                  <p className="text-lg font-semibold text-black">{user?.email}</p>
                </div>

                <div>
                  <p className="text-xs uppercase font-medium text-celebrity-gray-500 tracking-wide">Teléfono</p>
                  <p className="text-lg font-semibold text-black">{user?.phone || 'No registrado'}</p>
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="border-t border-celebrity-gray-200" />

              {/* Botón cerrar sesión */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={logout}
                  className="w-full md:w-1/2 py-3 text-lg border-celebrity-purple text-celebrity-purple
                            hover:bg-celebrity-purple/10 transition-all rounded-xl"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}
