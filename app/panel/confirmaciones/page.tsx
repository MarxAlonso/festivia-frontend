"use client";

import React, { useEffect, useState } from 'react';
import { OrganizerProtectedRoute } from '@/components/OrganizerProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { invitationService, Invitation } from '@/lib/invitations';

export default function ConfirmacionesPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
  const [confirmations, setConfirmations] = useState<Array<{ id: string; name: string; lastName: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [editLastName, setEditLastName] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const mine = await invitationService.getUserInvitations();
        setInvitations(mine);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const events = Array.from(new Set(invitations.map((i) => i.eventId))).map((eventId) => ({ eventId }));
  const filteredInvitations = invitations.filter((i) => !selectedEventId || i.eventId === selectedEventId);

  return (
    <OrganizerProtectedRoute>
      <div className="flex h-screen bg-celebrity-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="bg-white border-b border-celebrity-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-serif text-celebrity-gray-900">Confirmaciones</h1>
                <p className="text-celebrity-gray-600 mt-1">Filtra por evento e invitación para ver confirmados.</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="celebrity-card p-6 lg:col-span-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Evento</label>
                <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={selectedEventId} onChange={(e) => { setSelectedEventId(e.target.value); setSelectedInvitationId(''); setConfirmations([]); }}>
                  <option value="">Todos</option>
                  {events.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>{ev.eventId}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-celebrity-gray-700 mb-2">Invitación</label>
                <select className="w-full px-3 py-2 border border-celebrity-gray-300 rounded text-black" value={selectedInvitationId} onChange={(e) => setSelectedInvitationId(e.target.value)}>
                  <option value="">Selecciona una</option>
                  {filteredInvitations.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button disabled={!selectedInvitationId || loading} onClick={async () => {
                  if (!selectedInvitationId) return;
                  try {
                    setLoading(true);
                    const res = await invitationService.getInvitationConfirmations(selectedInvitationId);
                    setConfirmations(res);
                  } finally {
                    setLoading(false);
                  }
                }}>Buscar</Button>
              </div>
            </div>

            <div className="celebrity-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-celebrity-gray-900 mb-4">Resultados</h3>
              {confirmations.length === 0 ? (
                <p className="text-sm text-celebrity-gray-600">Sin confirmaciones</p>
              ) : (
                <div className="space-y-2">
                  {confirmations.map((c) => (
                    <div key={c.id} className="flex items-center justify-between border border-celebrity-gray-200 rounded px-3 py-2 gap-3">
                      {editingId === c.id ? (
                        <>
                          <input className="px-2 py-1 border border-gray-300 rounded text-black" value={editName} onChange={(e) => setEditName(e.target.value)} />
                          <input className="px-2 py-1 border border-gray-300 rounded text-black" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                          <div className="ml-auto flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(''); setEditName(''); setEditLastName(''); }}>Cancelar</Button>
                            <Button size="sm" onClick={async () => {
                              if (!selectedInvitationId) return;
                              const res = await invitationService.updateInvitationConfirmation(selectedInvitationId, c.id, { name: editName.trim(), lastName: editLastName.trim() });
                              setConfirmations((prev) => prev.map((x) => x.id === c.id ? res : x));
                              setEditingId('');
                              setEditName('');
                              setEditLastName('');
                            }}>Guardar</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-black">{c.name} {c.lastName}</span>
                          <span className="text-xs text-celebrity-gray-600">{new Date(c.createdAt).toLocaleString()}</span>
                          <div className="ml-auto flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(c.id); setEditName(c.name); setEditLastName(c.lastName); }}>Editar</Button>
                            <Button size="sm" variant="outline" onClick={async () => {
                              if (!selectedInvitationId) return;
                              await invitationService.deleteInvitationConfirmation(selectedInvitationId, c.id);
                              setConfirmations((prev) => prev.filter((x) => x.id !== c.id));
                            }}>Eliminar</Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </OrganizerProtectedRoute>
  );
}