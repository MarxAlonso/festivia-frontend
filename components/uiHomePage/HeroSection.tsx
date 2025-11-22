import Link from 'next/link';
import {ArrowRight} from 'lucide-react';
import { Button } from '@/components/ui/Button';
export const HeroSection: React.FC = () => {

  return (
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
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-celebrity-purple/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-celebrity-pink/10 rounded-full blur-xl"></div>
      </section>
  );
};