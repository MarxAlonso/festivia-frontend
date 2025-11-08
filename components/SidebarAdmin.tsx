'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutDashboard, FolderOpen, Calendar, Palette, Settings, 
  LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SidebarAdmin() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const navItems = [
    { href: '/paneladmin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/paneladmin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/paneladmin/invitaciones', label: 'Invitaciones', icon: FolderOpen },
    { href: '/paneladmin/templates', label: 'Templates', icon: Palette },
    { href: '/paneladmin/eventos', label: 'Eventos', icon: Calendar },
    { href: '/paneladmin/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-celebrity-gray-200 h-screen p-4">
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 celebrity-gradient rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="font-serif font-bold text-celebrity-gray-900">Admin</span>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-celebrity-purple/10 text-celebrity-purple'
                  : 'text-celebrity-gray-700 hover:bg-celebrity-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
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
    </aside>
  );
}