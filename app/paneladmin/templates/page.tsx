'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { templateService, Template, TemplateType, CreateTemplateDto } from '@/lib/templates';
import { SidebarAdmin } from '@/components/SidebarAdmin';
import { HeaderAdmin } from '@/components/uiPanelAdmin/HeaderAdmin';
import { TemplatesTable } from './components/TemplatesTable';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { TemplateEditor } from './components/TemplateEditor';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showCreate, setShowCreate] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Template | null>(null);

  const defaultDesign: CreateTemplateDto['design'] = {
    colors: { primary: '#8b5cf6', secondary: '#f59e0b', accent: '#ec4899', background: '#ffffff' },
    fonts: { heading: 'serif', body: 'sans-serif' },
    layout: 'classic',
    customCss: '',
    pages: [],
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

  // --- Editor de páginas del diseño ---
  const addPage = () => {
    setForm((p) => ({
      ...p,
      design: {
        ...p.design,
        pages: [
          ...(p.design.pages || []),
          {
            background: { type: 'image', value: '/pag%201.png' },
            sections: [
              { key: 'header', text: '' },
              { key: 'body', text: '' },
              { key: 'footer', text: '' },
            ],
            elements: [],
          },
        ],
      },
    }));
  };

  const updatePageBackground = (idx: number, type: 'color' | 'image', value: string) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      pages[idx] = {
        ...(pages[idx] || {}),
        background: { type, value },
      };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const updatePageSectionText = (idx: number, key: string, text: string) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      const sections = [...((pages[idx]?.sections) || [])];
      const i = sections.findIndex((s) => s.key === key);
      if (i >= 0) sections[i] = { ...sections[i], text };
      else sections.push({ key, text });
      pages[idx] = { ...(pages[idx] || {}), sections };
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const removePage = (idx: number) => {
    setForm((p) => {
      const pages = [...(p.design.pages || [])];
      pages.splice(idx, 1);
      return { ...p, design: { ...p.design, pages } };
    });
  };

  const openEditorForTemplate = async (id: string) => {
    try {
      setSaving(true);
      const tpl = await templateService.getTemplateById(id);
      setForm({
        name: tpl.name,
        description: tpl.description,
        type: tpl.type,
        design: tpl.design,
        content: tpl.content,
        price: tpl.price,
        eventId: tpl.eventId,
      });
      setEditingId(id);
      setShowCreate(true);
    } catch (err) {
      console.error('Error cargando template para edición:', err);
      alert('No se pudo cargar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingId) {
        await templateService.updateTemplate(editingId, form);
      } else {
        await templateService.createTemplate(form);
      }
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
      setEditingId(null);
      await loadTemplates();
    } catch (err) {
      console.error('Error guardando template:', err);
      alert('No se pudo guardar el template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('¿Eliminar este template? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      // Intentar endpoint de borrado si existe en el servicio
      const svc: any = templateService as any;
      if (typeof svc.deleteTemplate === 'function') {
        await svc.deleteTemplate(id);
      } else {
        // Fallback: DELETE directo al backend asumiendo ruta REST común
        const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const url = `${base}/templates/${id}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
      }
      await loadTemplates();
    } catch (err) {
      console.error('Error eliminando template:', err);
      alert('No se pudo eliminar el template');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      // Intentar usar endpoint dedicado si existe
      try {
        // @ts-ignore puede no existir en backend
        const created = await (templateService as any).duplicateTemplate?.(id);
        if (created) {
          await loadTemplates();
          return;
        }
      } catch {}
      // Fallback: duplicación manual
      const tpl = await templateService.getTemplateById(id);
      const copyName = `${tpl.name} (copia)`;
      await templateService.createTemplate({
        name: copyName,
        description: tpl.description,
        type: tpl.type,
        design: tpl.design,
        content: tpl.content,
        price: tpl.price,
        eventId: tpl.eventId,
      });
      await loadTemplates();
    } catch (err) {
      console.error('Error duplicando template:', err);
      alert('No se pudo duplicar el template');
    }
  };

  return (
    <div className="flex h-screen bg-[#F6E7E4]">
      <SidebarAdmin />

      <div className="flex-1 overflow-auto">
        <HeaderAdmin />

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-serif text-celebrity-gray-900">Templates</h2>
            <Button className="celebrity-gradient text-white" onClick={() => setShowCreate((v) => !v)}>
              <Plus className="w-4 h-4 mr-2" /> {showCreate ? 'Cerrar editor' : 'Nuevo template'}
            </Button>
          </div>

          {showCreate && (
            <TemplateEditor
              form={form}
              setForm={(updater) => setForm((prev) => updater(prev))}
              editingId={editingId}
              saving={saving}
              onCancel={() => setShowCreate(false)}
              onSave={handleSave}
              addPage={addPage}
              updatePageBackground={updatePageBackground}
              updatePageSectionText={updatePageSectionText}
              removePage={removePage}
            />
          )}

          <TemplatesTable
            templates={templates}
            loading={loading}
            onView={(t) => setViewing(t)}
            onEdit={(id) => openEditorForTemplate(id)}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />

          <TemplatePreviewModal viewing={viewing} onClose={() => setViewing(null)} />
        </div>
      </div>
    </div>
  );
}