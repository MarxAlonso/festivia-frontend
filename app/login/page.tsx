'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(
        formData.email,
        formData.password
      );
    } catch (error) {
      console.error('Login error:', error);
      // Error handling is already managed in the auth context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-invitaciones from-celebrity-purple/5 via-white to-celebrity-pink/5">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-10 h-10 celebrity-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-3xl font-bold font-serif bg-gradient-to-r from-celebrity-purple to-celebrity-pink bg-clip-text text-transparent">
                  CELEBRIA
                </span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold font-serif text-celebrity-gray-900 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-celebrity-gray-600">
              Inicia sesión para acceder a tu panel de diseño
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-celebrity-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-celebrity-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full text-[#1E1E1E] pl-10 pr-3 py-3 border ${
                      errors.email ? 'border-red-500' : 'border-celebrity-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-celebrity-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-celebrity-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full text-[#1E1E1E] pl-10 pr-10 py-3 border ${
                      errors.password ? 'border-red-500' : 'border-celebrity-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-celebrity-purple focus:border-transparent`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-celebrity-gray-400 hover:text-celebrity-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-celebrity-gray-400 hover:text-celebrity-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-celebrity-purple focus:ring-celebrity-purple border-celebrity-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-celebrity-gray-700">
                  Recordarme
                </label>
              </div>
              <div className="text-sm">
                <Link href="/recuperar-contrasena" className="font-medium text-celebrity-purple hover:text-celebrity-purple/80">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                size="lg"
                className="w-full celebrity-gradient text-white hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-celebrity-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link href="/registro" className="font-medium text-celebrity-purple hover:text-celebrity-purple/80">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}