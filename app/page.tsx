'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Sparkles, Palette, Clock, Heart, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-celebrity-purple/5 via-white to-celebrity-pink/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-celebrity-gray-900 mb-6">
              Crea Invitaciones
              <span className="block bg-gradient-to-r from-celebrity-purple to-celebrity-pink bg-clip-text text-transparent">
                Inolvidables
              </span>
            </h1>
            <p className="text-xl text-celebrity-gray-600 mb-8 max-w-3xl mx-auto">
              Diseña invitaciones elegantes y personalizadas para tus eventos especiales. 
              Con plantillas profesionales y herramientas intuitivas, tus invitaciones 
              reflejarán la magia de tu celebración.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg" className="celebrity-gradient text-white hover:opacity-90">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="lg" variant="outline">
                  Ver Plantillas
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-celebrity-purple/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-celebrity-pink/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#F6E7E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-celebrity-gray-900 mb-4">
              ¿Por Qué Elegir CELEBRIA?
            </h2>
            <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">
              Creamos herramientas que hacen que el diseño de invitaciones sea fácil, 
              rápido y hermoso.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="celebrity-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 celebrity-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Diseños Exclusivos
              </h3>
              <p className="text-celebrity-gray-600">
                Plantillas diseñadas por profesionales que se adaptan a cualquier estilo de evento.
              </p>
            </div>
            
            <div className="celebrity-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 celebrity-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Rápido y Fácil
              </h3>
              <p className="text-celebrity-gray-600">
                Crea tu invitación perfecta en minutos con nuestras herramientas intuitivas.
              </p>
            </div>
            
            <div className="celebrity-card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-celebrity-pink to-celebrity-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Personalización Total
              </h3>
              <p className="text-celebrity-gray-600">
                Personaliza cada detalle para que tu invitación sea única y especial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#F6E7E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-serif text-celebrity-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-lg text-celebrity-gray-600 max-w-2xl mx-auto">
              En solo 3 pasos simples, tendrás la invitación perfecta para tu evento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 celebrity-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Elige Tu Plantilla
              </h3>
              <p className="text-celebrity-gray-600">
                Selecciona entre nuestra colección de plantillas elegantes y modernas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 celebrity-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Personaliza
              </h3>
              <p className="text-celebrity-gray-600">
                Añade tus detalles, cambia colores y ajusta el diseño a tu gusto.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-celebrity-pink to-celebrity-purple rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-semibold text-celebrity-gray-900 mb-4">
                Descarga y Comparte
              </h3>
              <p className="text-celebrity-gray-600">
                Descarga tu invitación en alta calidad y compártela con tus invitados.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/pasosparacrearlainvitacion">
              <Button size="lg" variant="primary">
                Ver Tutorial Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 celebrity-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold font-serif text-white mb-6">
            ¿Listo para Crear Tu Invitación Perfecta?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas que ya han creado invitaciones memorables con CELEBRIA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" variant="secondary">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/visualizaciondeldesigndelainvitacion">
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white hover:text-celebrity-purple">
                Ver Ejemplos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer -[#FFD8C2]*/}
      <footer className="bg-[#FFD8C2] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 celebrity-gradient rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold font-serif bg-gradient-to-r from-celebrity-purple to-celebrity-pink bg-clip-text text-transparent">
                  CELEBRIA
                </span>
              </div>
              <p className="text-[#1E1E1E]">
                Creando invitaciones memorables para eventos especiales.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#1E1E1E]">Producto</h4>
              <ul className="space-y-2 text-[#1E1E1E]">
                <li><Link href="/templates" className="hover:text-white">Plantillas</Link></li>
                <li><Link href="/precios" className="hover:text-white">Precios</Link></li>
                <li><Link href="/caracteristicas" className="hover:text-white">Características</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#1E1E1E]">Soporte</h4>
              <ul className="space-y-2 text-[#1E1E1E]">
                <li><Link href="/ayuda" className="hover:text-white">Centro de Ayuda</Link></li>
                <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
                <li><Link href="/tutorial" className="hover:text-white">Tutorial</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#1E1E1E]">Empresa</h4>
              <ul className="space-y-2 text-[#1E1E1E]">
                <li><Link href="/acerca" className="hover:text-white">Acerca de</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/trabajo" className="hover:text-white">Trabaja con Nosotros</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-celebrity-gray-800 mt-8 pt-8 text-center text-celebrity-gray-400">
            <p>&copy; 2025 CELEBRIA. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
