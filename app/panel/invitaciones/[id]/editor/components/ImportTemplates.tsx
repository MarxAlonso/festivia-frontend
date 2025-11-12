"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Template } from "@/lib/templates";

export function ImportTemplates({
  templates,
  importTemplateId,
  setImportTemplateId,
  importPagesFromTemplate,
}: {
  templates: Template[];
  importTemplateId: string;
  setImportTemplateId: (id: string) => void;
  importPagesFromTemplate: (id?: string) => void;
}) {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-celebrity-gray-900 mb-2">Importar páginas desde template</h4>
      <div className="flex gap-2">
        <select
          className="px-3 py-2 border border-celebrity-gray-300 rounded flex-1"
          value={importTemplateId}
          onChange={(e) => setImportTemplateId(e.target.value)}
        >
          <option value="">Selecciona un template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => importPagesFromTemplate(importTemplateId)}>
          Importar
        </Button>
      </div>
      <p className="text-xs text-celebrity-gray-500 mt-1">
        Puedes importar de varios templates; las páginas se agregan a tu diseño.
      </p>
    </div>
  );
}