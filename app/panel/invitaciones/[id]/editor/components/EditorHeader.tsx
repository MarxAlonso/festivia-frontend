"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export function EditorHeader({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">Editar Invitación</h1>
          <p className="text-celebrity-gray-600 mt-1">Personaliza las páginas y elementos de tu diseño</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onSave} loading={saving} className="celebrity-gradient text-white">
            <Save className="w-4 h-4 mr-2" /> Guardar diseño
          </Button>
        </div>
      </div>
    </div>
  );
}