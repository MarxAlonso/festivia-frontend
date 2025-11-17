import {Palette,Clock,Heart} from 'lucide-react';
export const FeaturesSection: React.FC = () => {

  return (
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
  );
};