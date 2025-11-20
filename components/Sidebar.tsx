'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  PlusCircle, 
  Grid3X3, 
  Settings, 
  LogOut,
  User,
  Users
} from 'lucide-react';
//,FileText,Palette,
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', href: '/panel', icon: Grid3X3 },
  { name: 'Crear Invitación', href: '/panel/crear', icon: PlusCircle },
  { name: 'Mis Invitaciones', href: '/panel/invitaciones', icon: Sparkles },
  /*{ name: 'Mis Plantillas', href: '/panel/plantillas', icon: Palette },*/
  /*{ name: 'Mis Eventos', href: '/panel/eventos', icon: FileText },*/
  { name: 'Confirmaciones', href: '/panel/confirmaciones', icon: Users },
  { name: 'Perfil', href: '/panel/perfil', icon: User },
  { name: 'Configuración', href: '/panel/configuracion', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-[#FFD8C2] border-r border-celebrity-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-celebrity-gray-200">
        <Link href="/panel" className="flex items-center space-x-3">
          <div className="w-8 h-8 celebrity-gradient rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-serif bg-gradient-to-r from-celebrity-purple to-celebrity-pink bg-clip-text text-transparent">
            CELEBRIA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-celebrity-purple/10 text-celebrity-purple border border-celebrity-purple/20"
                      : "text-celebrity-gray-600 hover:bg-celebrity-gray-50 hover:text-celebrity-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-celebrity-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-celebrity-gray-600 hover:bg-celebrity-gray-50 hover:text-red-600 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
