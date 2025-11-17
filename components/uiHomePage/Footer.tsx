import Link from 'next/link';
import {Sparkles} from 'lucide-react';
export const Footer: React.FC = () => {

  return (
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
  );
};