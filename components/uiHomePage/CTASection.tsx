import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const CTASection: React.FC = () => {

  return (
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
                Probar Celebria Plus
              </Button>
            </Link>
          </div>
        </div>
      </section>
  );
};