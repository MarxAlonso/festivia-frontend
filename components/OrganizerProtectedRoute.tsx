'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/auth';

interface OrganizerProtectedRouteProps {
  children: React.ReactNode;
}

export function OrganizerProtectedRoute({ children }: OrganizerProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== UserRole.ORGANIZER) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-celebrity-purple/5 via-white to-celebrity-pink/5">
        <div className="text-center">
          <div className="w-16 h-16 celebrity-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-celebrity-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== UserRole.ORGANIZER) {
    return null;
  }

  return <>{children}</>;
}