'use client';

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Assuming this path is correct

// Import Lucide Icons
import {
  X, // For close button
  Edit3, // For modal title or general edit
  Calculator, // For quantitative input
  CheckCircle2, // For boolean input (completed)
  Save, // For save button
  Loader2, // For loading state button
  NotebookPen, // For note input
} from 'lucide-react';

export default function UpdateProgressModal({
  goal,
  onClose,
  onUpdated,
}: {
  goal: {
    id: string;
    title: string;
    type: 'quantitative' | 'boolean';
    target_value: number | null;
    unit: string | null;
    week_number: number;
  };
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase
      .from('weekly_progress')
      .upsert(
        {
          goal_id: goal.id,
          week_number: goal.week_number,
          value: goal.type === 'boolean' ? (value === 'yes' ? 1 : 0) : parseFloat(value),
          note,
        },
        {
          onConflict: 'goal_id, week_number', // importante para evitar duplicados
        }
      )

    setLoading(false);

    if (!error) {
      onUpdated();
      onClose();
    } else {
      // Handle error appropriately, maybe show a toast or alert
      console.error('Error saving progress:', error);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-0">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all">
          {/* Header with Title and Close Button */}
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <Dialog.Title className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-blue-600" />
              Actualizar progreso
            </Dialog.Title>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-6 h-6" />
              <span className="sr-only">Cerrar</span>
            </button>
          </div>

          {/* Goal Title */}
          <p className="mb-4 text-lg font-medium text-gray-700">{goal.title}</p>

          {/* Input Fields based on Goal Type */}
          {goal.type === 'quantitative' ? (
            <div className="mb-4">
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                Valor actual {goal.unit ? `(${goal.unit})` : ''}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calculator className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  id="value"
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Ej: ${goal.target_value || 0}`}
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cumplida?
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <select
                  style={{ color: 'black' }}

                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={loading}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          )}

          {/* Note Input */}
          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Nota (opcional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute top-3 left-0 flex items-center pl-3">
                <NotebookPen className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <textarea
                style={{ color: 'black' }}
                id="note"
                className="block w-full rounded-md border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Añade una nota sobre tu progreso..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={loading || (goal.type === 'quantitative' && !value)}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}