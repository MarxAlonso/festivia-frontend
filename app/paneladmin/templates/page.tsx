'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Palette, Plus, Save } from 'lucide-react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { templateService, Template, TemplateType, TemplateStatus, CreateTemplateDto } from '@/lib/templates';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const defaultDesign: CreateTemplateDto['design'] = {
    colors: { primary: '#8b5cf6', secondary: '#f59e0b', accent: '#ec4899', background: '#ffffff' },
    fonts: { heading: 'serif', body: 'sans-serif' },
    layout: 'classic',
    customCss: ''
  };

  const [form, setForm] = useState<CreateTemplateDto>({
    name: '',
    description: '',
    type: TemplateType.CUSTOM,
    design: defaultDesign,
    content: { header: '', body: '', footer: '', images: [] },
    price: 0,
    eventId: undefined,
  });

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Listar todos los templates (o solo activos)
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error cargando templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    try {
      setSaving(true);
      await templateService.createTemplate(form);
      setShowCreate(false);
      // Reset formulario tras crear
      setForm({
        name: '',
        description: '',
        type: TemplateType.CUSTOM,
        design: defaultDesign,
        content: { header: '', body: '', footer: '', images: [] },
        price: 0,
        eventId: undefined,
      });
      await loadTemplates();
    } catch (err) {
      console.error('Error creando template:', err);
      alert('No se pudo crear el template');
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = useMemo(() => ({
    background: `linear-gradient(135deg, ${form.design.colors.primary}, ${form.design.colors.secondary})`,
    color: '#1f2937',
    fontFamily: form.design.fonts.body,
  }), [form]);

  return (
    <AdminProtectedRoute>
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-serif text-celebrity-gray-900">Templates</h2>
          <Button className="celebrity-gradient text-white" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo template
          </Button>
        </div>

        {showCreate && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Formulario de creación */}
            <div className="celebrity-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Crear Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Nombre</label>
                  <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Tipo</label>
                  <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TemplateType }))}>
                    {Object.values(TemplateType).map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Descripción</label>
                  <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.description || ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Precio</label>
                  <input type="number" className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.price || 0} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Event ID (opcional)</label>
                  <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.eventId || ''} onChange={(e) => setForm((p) => ({ ...p, eventId: e.target.value || undefined }))} />
                </div>

                {/* Diseño - Colores */}
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color primario</label>
                  <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.primary} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, primary: e.target.value } } }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color secundario</label>
                  <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.secondary} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, secondary: e.target.value } } }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color acento</label>
                  <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.accent} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, accent: e.target.value } } }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Color fondo</label>
                  <input type="color" className="w-full h-10 rounded border border-celebrity-gray-300" value={form.design.colors.background} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, colors: { ...p.design.colors, background: e.target.value } } }))} />
                </div>

                {/* Diseño - Tipografías */}
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fuente Heading</label>
                  <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.fonts.heading} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, fonts: { ...p.design.fonts, heading: e.target.value } } }))}>
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Fuente Body</label>
                  <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.fonts.body} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, fonts: { ...p.design.fonts, body: e.target.value } } }))}>
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                {/* Diseño - Layout y CSS */}
                <div>
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Layout</label>
                  <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.layout} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, layout: e.target.value } }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Custom CSS</label>
                  <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.design.customCss || ''} onChange={(e) => setForm((p) => ({ ...p, design: { ...p.design, customCss: e.target.value } }))} />
                </div>

                {/* Contenido por defecto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Encabezado</label>
                  <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.header || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), header: e.target.value } }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Cuerpo</label>
                  <textarea className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.body || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), body: e.target.value } }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-celebrity-gray-700 mb-2">Pie</label>
                  <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={form.content?.footer || ''} onChange={(e) => setForm((p) => ({ ...p, content: { ...(p.content || {}), footer: e.target.value } }))} />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button onClick={handleCreate} loading={saving}>
                  <Save className="w-4 h-4 mr-2" /> Guardar template
                </Button>
              </div>
            </div>

            {/* Previsualización */}
            <div className="celebrity-card p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Previsualización</h3>
              <div className="h-[260px] rounded-lg flex items-center justify-center" style={previewStyle}>
                <div className="text-center" style={{ fontFamily: form.design.fonts.heading }}>
                  <Palette className="w-10 h-10 mx-auto mb-2" />
                  <h4 className="text-xl font-bold mb-1">{form.name || 'Nuevo template'}</h4>
                  {form.content?.header && <p className="text-sm opacity-80">{form.content.header}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="celebrity-card p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-celebrity-purple mr-2" />
            <span className="font-medium">Gestión de templates</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-celebrity-gray-600">Cargando templates…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-celebrity-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-celebrity-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-celebrity-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-celebrity-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-celebrity-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-celebrity-gray-500 uppercase">Creado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-celebrity-gray-200">
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2">{t.name}</td>
                      <td className="px-4 py-2">{t.type}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded bg-celebrity-purple/10 text-celebrity-purple text-xs">{t.status || TemplateStatus.ACTIVE}</span>
                      </td>
                      <td className="px-4 py-2">${Number(t.price ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {templates.length === 0 && (
                <div className="py-6 text-center text-celebrity-gray-600">No hay templates aún. Crea uno para comenzar.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}