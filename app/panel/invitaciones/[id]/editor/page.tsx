'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Button } from '@/components/ui/Button';
import { invitationService, Invitation } from '@/lib/invitations';
import { Sparkles, Save, Eye } from 'lucide-react';

export default function InvitationEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  type ColorKey = 'primary' | 'secondary' | 'accent' | 'text';
  type EditableDesign = {
    colors?: Partial<Record<ColorKey, string>>;
    fonts?: { heading?: string; body?: string };
    layout?: string;
    content?: { header?: string; body?: string; footer?: string; images?: string[] };
  };

  const [designData, setDesignData] = useState<EditableDesign>({
    colors: { primary: '#8b5cf6', secondary: '#f59e0b', accent: '#ec4899', text: '#1f2937' },
    fonts: { heading: 'serif', body: 'sans-serif' },
    layout: 'classic',
    content: { header: '', body: '', footer: '', images: [] },
  });

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        setLoading(true);
        const data = await invitationService.getInvitationById(id);
        setInvitation(data);
        if (data.customDesign) setDesignData(data.customDesign as unknown as EditableDesign);
      } catch (err: unknown) {
        console.error('Error cargando invitación:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadInvitation();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await invitationService.updateInvitationDesign(id, designData);
    } catch (err: unknown) {
      console.error('Error guardando diseño:', err);
      alert('No se pudo guardar el diseño');
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${designData?.colors?.primary || '#8b5cf6'}, ${designData?.colors?.secondary || '#f59e0b'})`,
    color: designData?.colors?.text || '#ffffff',
    fontFamily: designData?.fonts?.body || 'sans-serif',
  }), [designData]);

  const colorKeys: ColorKey[] = ['primary','secondary','accent','text'];

  return (
    <OrganizerProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-celebrity-purple/5 via-white to-celebrity-pink/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">Editor de Invitación</h1>
              <p className="text-celebrity-gray-600">Edita visualmente tu diseño y guarda cambios</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Guardar diseño
              </Button>
              <Button onClick={() => window.open('/visualizaciondeldesigndelainvitacion', '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Previa
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebrity-purple"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel izquierdo: controles */}
              <div className="lg:col-span-1 space-y-6">
                {/* Colores */}
                <div className="celebrity-card p-4">
                  <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Colores</h3>
                  <div className="space-y-3">
                    {colorKeys.map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">{key}</label>
                        <input type="color" value={designData?.colors?.[key] || '#000000'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, colors: { ...(prev.colors || {}), [key]: e.target.value } }))} className="w-full h-10 rounded border border-celebrity-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Tipografías */}
                <div className="celebrity-card p-4">
                  <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Tipografías</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Heading</label>
                      <select value={designData?.fonts?.heading || 'serif'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, fonts: { ...(prev.fonts || {}), heading: e.target.value } }))} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded">
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="monospace">Monospace</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Body</label>
                      <select value={designData?.fonts?.body || 'sans-serif'} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, fonts: { ...(prev.fonts || {}), body: e.target.value } }))} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded">
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="monospace">Monospace</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Contenido */}
                <div className="celebrity-card p-4">
                  <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Contenido</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Encabezado" value={designData?.content?.header || ''} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, content: { ...(prev.content || {}), header: e.target.value } }))} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" />
                    <textarea placeholder="Cuerpo" value={designData?.content?.body || ''} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, content: { ...(prev.content || {}), body: e.target.value } }))} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded h-24" />
                    <input type="text" placeholder="Pie de página" value={designData?.content?.footer || ''} onChange={(e) => setDesignData((prev: EditableDesign) => ({ ...prev, content: { ...(prev.content || {}), footer: e.target.value } }))} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" />
                  </div>
                </div>
              </div>
              {/* Panel derecho: vista previa */}
              <div className="lg:col-span-2">
                <div className="celebrity-card p-6">
                  <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Vista previa</h3>
                  <div className="h-[420px] rounded-lg flex items-center justify-center" style={previewStyle}>
                    <div className="text-center" style={{ fontFamily: designData?.fonts?.heading || 'serif' }}>
                      <Sparkles className="w-12 h-12 mx-auto mb-4" />
                      <h2 className="text-3xl font-bold mb-2">{invitation?.title || 'Tu invitación'}</h2>
                      {designData?.content?.header && <p className="text-lg mb-2">{designData.content.header}</p>}
                      {designData?.content?.body && <p className="max-w-xl mx-auto">{designData.content.body}</p>}
                      {designData?.content?.footer && <p className="text-sm mt-4 opacity-80">{designData.content.footer}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}