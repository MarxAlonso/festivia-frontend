'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { BackgroundType, DesignPage, PageElement } from '../types';

interface PageConfigProps {
  currentPage: DesignPage | undefined;
  selectedPage: number;
  updateBackground: (idx: number, type: BackgroundType, value: string) => void;
  updateSectionText: (idx: number, key: 'header' | 'body' | 'footer', text: string) => void;
  fonts: { heading: string; body: string };
  setFonts: (updater: (f: { heading: string; body: string }) => { heading: string; body: string }) => void;
  layout: string;
  setLayout: (v: string) => void;
  addTextElement: (idx: number) => void;
  addImageElement: (idx: number, url: string) => void;
  updateElement: (pageIdx: number, elId: string, patch: Partial<PageElement>) => void;
  removeElement: (pageIdx: number, elId: string) => void;
}

export function PageConfig({ currentPage, selectedPage, updateBackground, updateSectionText, fonts, setFonts, layout, setLayout, addTextElement, addImageElement, updateElement, removeElement }: PageConfigProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-3">Fondo y secciones</h3>
      <div className="mb-3">
        <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Estilo de encabezado</label>
        <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={layout} onChange={(e) => setLayout(e.target.value)}>
          <option value="template">Plantilla (arriba a la izquierda)</option>
          <option value="centered-header">Centrado medio (encabezado grande y centrado)</option>
        </select>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de encabezado</label>
          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={fonts.heading} onChange={(e) => setFonts((f) => ({ ...f, heading: e.target.value }))}>
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans-serif</option>
            <option value="monospace">Monospace</option>
            <option value="cursive">Cursive</option>
            <option value="fantasy">Fantasy</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Fuente de cuerpo</label>
          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={fonts.body} onChange={(e) => setFonts((f) => ({ ...f, body: e.target.value }))}>
            <option value="sans-serif">Sans-serif</option>
            <option value="serif">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="cursive">Cursive</option>
            <option value="fantasy">Fantasy</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Tipo de fondo</label>
          <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.background?.type || 'color'} onChange={(e) => updateBackground(selectedPage, e.target.value as BackgroundType, currentPage?.background?.value || '')}>
            <option value="image">Imagen (URL)</option>
            <option value="color">Color</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Valor</label>
          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" placeholder="https://... o #f0e6dc" value={currentPage?.background?.value || ''} onChange={(e) => updateBackground(selectedPage, currentPage?.background?.type || 'color', e.target.value)} />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Header</label>
          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'header')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'header', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Body</label>
          <textarea rows={3} className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'body')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'body', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Footer</label>
          <input className="w-full px-3 py-2 border border-celebrity-gray-300 rounded" value={currentPage?.sections?.find((s) => s.key === 'footer')?.text || ''} onChange={(e) => updateSectionText(selectedPage, 'footer', e.target.value)} />
        </div>

        {/* Elementos */}
        <div className="col-span-2 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Elementos</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => addTextElement(selectedPage)}><Plus className="w-4 h-4 mr-2" /> Texto</Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = prompt('URL de imagen (Google Drive u otra):');
                  if (url) addImageElement(selectedPage, url);
                }}
              >
                Imagen (URL)
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {(currentPage?.elements || []).map((el) => (
              <div key={el.id} className="border border-celebrity-gray-200 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-celebrity-gray-600">{el.type.toUpperCase()}</span>
                  <button className="text-red-600" onClick={() => removeElement(selectedPage, el.id)}><Trash2 className="w-4 h-4" /></button>
                </div>
                {el.type === 'text' ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input className="col-span-2 px-3 py-2 border border-celebrity-gray-300 rounded" value={el.content || ''} onChange={(e) => updateElement(selectedPage, el.id, { content: e.target.value })} />
                    <label className="text-xs">Color</label>
                    <input type="color" value={(el.styles?.color as string) || '#111111'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { color: e.target.value } })} />
                    <label className="text-xs">Tamaño</label>
                    <input type="number" value={(el.styles?.fontSize as number) || 16} onChange={(e) => updateElement(selectedPage, el.id, { styles: { fontSize: Number(e.target.value) } })} />
                  </div>
                ) : el.type === 'image' ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input className="col-span-2 px-3 py-2 border border-celebrity-gray-300 rounded" value={el.src || ''} onChange={(e) => updateElement(selectedPage, el.id, { src: e.target.value })} />
                    <label className="text-xs">Ancho</label>
                    <input type="number" value={el.width || 0} onChange={(e) => updateElement(selectedPage, el.id, { width: Number(e.target.value) })} />
                    <label className="text-xs">Alto</label>
                    <input type="number" value={el.height || 0} onChange={(e) => updateElement(selectedPage, el.id, { height: Number(e.target.value) })} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className="text-xs">Color</label>
                    <input type="color" value={(el.styles?.background as string) || '#e5e7eb'} onChange={(e) => updateElement(selectedPage, el.id, { styles: { background: e.target.value } })} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="text-xs">X</label>
                  <input type="number" value={el.x || 0} onChange={(e) => updateElement(selectedPage, el.id, { x: Number(e.target.value) })} />
                  <label className="text-xs">Y</label>
                  <input type="number" value={el.y || 0} onChange={(e) => updateElement(selectedPage, el.id, { y: Number(e.target.value) })} />
                  <label className="text-xs">Rotación</label>
                  <input type="number" value={el.rotation || 0} onChange={(e) => updateElement(selectedPage, el.id, { rotation: Number(e.target.value) })} />
                  <label className="text-xs">Z-Index</label>
                  <input type="number" value={el.zIndex || 1} onChange={(e) => updateElement(selectedPage, el.id, { zIndex: Number(e.target.value) })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}