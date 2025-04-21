// components/IncomeBySourceList.tsx
'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


// --- Type Definitions ---
// Define la estructura de tus objetos de ingreso.
// Ajusta esto para que coincida exactamente con tus datos.
interface Income {
  amount: number;
  created_at: string; // Usa 'Date' si ya parseas la fecha antes de pasarla
  source_id: string | number; // Ajusta según el tipo real del ID
  // Añade otras propiedades que tenga un ingreso si son relevantes aquí
}

// Define la estructura de tus objetos de fuente.
// Ajusta esto para que coincida exactamente con tus datos.
interface Source {
  id: string | number; // El tipo debe coincidir con income.source_id
  name: string;
  logo?: string; // URL del logo es opcional
  // Añade otras propiedades que tenga una fuente si son relevantes aquí
}

// Define los tipos para las props del componente
interface IncomeBySourceListProps {
  incomesOfDay?: Income[]; // Un array de objetos Income, opcional
  sources?: Source[]; // Un array de objetos Source, opcional
  date?: Date; // Un objeto Date, opcional
}
// --- End Type Definitions ---


// Helper to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0';
   return amount.toLocaleString('es-CO', {
     style: 'currency',
     currency: 'COP',
     minimumFractionDigits: 0,
     maximumFractionDigits: 0,
   }).replace('COP', '').trim();
};

// Define el mapeo de nombres de fuente a los nombres que quieres mostrar
const sourceNameDisplayMap: Record<string, string> = {
  'YouTube': 'Plataforma de Videos',
  'Facebook': 'Red Social',
  'TikTok': 'Videos Cortos',
  // Añade más fuentes aquí si necesitas reemplazar otros nombres
};


// Component to display income grouped by source for a given day
// Usa la interfaz IncomeBySourceListProps para tipar las props
export default function IncomeBySourceList({
    incomesOfDay = [], // Valor por defecto para que TypeScript sepa que siempre será un array
    sources = [], // Valor por defecto para que TypeScript sepa que siempre será un array
    date
}: IncomeBySourceListProps) {

  // Calculate total income per source
  const incomeBySource = useMemo(() => {
    const map: Record<string, number> = {}; // Añade anotación de tipo al mapa
    incomesOfDay.forEach((income: Income) => { // Añade anotación de tipo al elemento del array
      const sourceId = String(income.source_id);
      if (!map[sourceId]) map[sourceId] = 0;
      map[sourceId] += income.amount;
    });
    return map;
  }, [incomesOfDay]);

  // Get the total income for the day
  const dailyTotal: number = useMemo(() => { // Añade anotación de tipo al total
    return incomesOfDay.reduce((acc: number, curr: Income) => acc + curr.amount, 0); // Añade anotaciones a reduce
  }, [incomesOfDay]);


  // Find the source object - Añade tipos a parámetros y retorno
  const findSourceById = (sourceId: string | number): Source | undefined => {
    return sources.find((source: Source) => String(source.id) === String(sourceId)); // Añade anotación a source
  };

  // Get entries as an array, filter, map to {source, amount}, filter nulls, AND SORT
  const incomeEntries = useMemo(() => {
    const entries = Object.entries(incomeBySource) as [string, number][]; // Tipa la salida de Object.entries

    return entries
      .filter(([sourceId, amount]) => amount > 0) // Filter out sources with income <= 0
      .map(([sourceId, amount]) => {
        const source = findSourceById(sourceId);
        // Retorna un objeto tipado o null
        return source ? { source, amount } : null;
      })
      // Filtra los nulls y asegura a TypeScript el tipo de los elementos restantes
      .filter((item): item is { source: Source, amount: number } => item !== null)
      .sort((a, b) => b.amount - a.amount); // Sort by amount DESCENDING
  }, [incomeBySource, sources]); // Depend on calculated income and the sources array


  return (
    <div className="flex flex-col gap-6"> {/* Main container */}

        {/* Optional: Display date header */}
         {date && ( // Verifica si date existe antes de usarlo
             <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {/* Keeping the user's requested text 'Ingresos por fuente' */}
                 Ingresos por fuente
             </h3>
         )}



        {/* Horizontal Scrollable List of Source Cards */}
        {incomeEntries.length > 0 ? ( // Check if there are entries to display
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"> {/* Flex container for horizontal layout, enable scrolling, add padding bottom for scrollbar, hide scrollbar */}
                {incomeEntries.map(({ source, amount }) => { // Tipa los elementos desestructurados si es necesario { source: Source, amount: number }
                    // Determine the name to display using the map
                    const sourceDisplayName = sourceNameDisplayMap[source.name] || source.name || 'Fuente Desconocida';

                    return (
                        <div
                            key={source.id} // Use source id as key (assuming source.id exists and is unique)
                            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex-shrink-0 w-40 hover:shadow-md transition-shadow duration-200" // Vertical flex, centered items, padding, rounded, shadow, border, fixed width, prevent shrinking on hover
                        >
                             {/* Source Logo */}
                             {/* Keeping the user's styles: no rounded-full, no specific bg/border colors */}
                             <div className="w-12 h-12 flex items-center justify-center overflow-hidden mb-3">
                                  {/* Check if source.logo exists and is a valid string before using Image */}
                                  {source.logo && typeof source.logo === 'string' ? (
                                     <Image
                                         src={source.logo}
                                         alt={`${source.name || 'Fuente'} logo`} // Added fallback for alt text
                                         width={48} // Match div size
                                         height={48} // Match div size
                                         objectFit="cover"
                                     />
                                  ) : (
                                      <span className="text-lg font-semibold text-gray-500">{source.name ? source.name.charAt(0).toUpperCase() : '?'}</span> // Fallback text if no logo URL
                                  )}
                             </div>

                             {/* Source Name */}
                             <span className="font-medium text-gray-800 text-sm text-center truncate w-full mb-2">
                                 {sourceDisplayName}
                             </span>

                             {/* Income Amount for this Source */}
                             {/* Keeping the user's styles: no green text color */}
                             <span className="font-semibold text-gray-900 text-lg text-center">
                                 {formatCurrency(amount)}
                             </span>
                        </div>
                    );
                })}
            </div>
        ) : (
            // Message when there are no incomes for the day
            <p className="text-gray-500 text-sm italic text-center py-4">Sin registros de ingresos para este día.</p>
        )}
         {/* Note: The "Agregar / Editar ingresos" button from MonthlyView is not part of THIS component */}
         {/* If you need that button, it should likely be placed in the parent component (MonthlyView) */}
    </div>
  );
}