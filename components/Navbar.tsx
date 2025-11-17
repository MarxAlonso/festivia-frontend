'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Sparkles, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-[#FFD8C2] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-celebrity-purple to-celebrity-pink rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-celebrity-purple to-celebrity-pink bg-clip-text text-transparent font-serif">
              CELEBRIA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#1E1E1E] hover:text-celebrity-purple transition-colors">
              Inicio
            </Link>
            <Link href="/templates" className="text-[#1E1E1E] hover:text-celebrity-purple transition-colors">
              Plantillas
            </Link>
            <Link href="/como-funciona" className="text-[#1E1E1E] hover:text-celebrity-purple transition-colors">
              Cómo Funciona
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/panelcliente">
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Mi Panel
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-celebrity-gray-700 hover:text-celebrity-purple hover:bg-celebrity-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-celebrity-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-celebrity-gray-700 hover:text-celebrity-purple transition-colors">
                Inicio
              </Link>
              <Link href="/templates" className="text-celebrity-gray-700 hover:text-celebrity-purple transition-colors">
                Plantillas
              </Link>
              <Link href="/como-funciona" className="text-celebrity-gray-700 hover:text-celebrity-purple transition-colors">
                Cómo Funciona
              </Link>
              
              {user ? (
                <>
                  <Link href="/panelcliente">
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Mi Panel
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/registro">
                    <Button variant="primary" size="sm" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};