import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
export const HeaderPanel: React.FC = () => {

  return (
    <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">
                Dashboard
              </h1>
              <p className="text-celebrity-gray-600 mt-1">
                Bienvenido a tu panel de diseño
              </p>
            </div>
            <Link href="/panel/crear">
              <Button size="lg" className="celebrity-gradient text-white hover:opacity-90">
                <Plus className="w-5 h-5 mr-2" />
                Nueva Invitación
              </Button>
            </Link>
          </div>
        </div>
  );
};