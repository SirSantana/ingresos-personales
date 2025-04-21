'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


// Helper to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
   return amount.toLocaleString('es-CO', {
     style: 'currency',
     currency: 'COP',
     minimumFractionDigits: 0,
     maximumFractionDigits: 0,
   }).replace('COP', '').trim();
};

// Define el mapeo de nombres de fuente a los nombres que quieres mostrar
const sourceNameDisplayMap = {
  'YouTube': 'Plataforma de Videos', // Ejemplo de reemplazo en español
  'Facebook': 'Red Social',
  'TikTok': 'Videos Cortos',
  // Añade más fuentes aquí si necesitas reemplazar otros nombres
};


// Component to display income grouped by source for a given day
export default function IncomeBySourceList({ incomesOfDay = [], sources = [], date }) {
  // Calculate total income per source
  const incomeBySource = useMemo(() => {
    const map = {};
    incomesOfDay.forEach((income) => {
      const sourceId = String(income.source_id);
      if (!map[sourceId]) map[sourceId] = 0;
      map[sourceId] += income.amount;
    });
    return map;
  }, [incomesOfDay]);

  // Get the total income for the day
  const dailyTotal = useMemo(() => {
    return incomesOfDay.reduce((acc, curr) => acc + curr.amount, 0);
  }, [incomesOfDay]);


  // Find the source object
  const findSourceById = (sourceId) => {
    return sources.find(source => String(source.id) === String(sourceId));
  };

  // Get entries as an array, filter, map to {source, amount}, filter nulls, AND SORT
  const incomeEntries = useMemo(() => {
    return Object.entries(incomeBySource)
      .filter(([sourceId, amount]) => amount > 0) // Only include sources with income > 0
      .map(([sourceId, amount]) => {
        const source = findSourceById(sourceId);
        // Return source object and amount, or null if source not found
        return source ? { source, amount } : null;
      })
      .filter(item => item !== null) // Remove entries where source was not found
      .sort((a, b) => b.amount - a.amount); // <--- Added sorting by amount DESCENDING
  }, [incomeBySource, sources]); // Depend on calculated income and the sources array


  return (
    <div className="flex flex-col gap-6"> {/* Main container */}

        {/* Optional: Display date header */}
         {date && (
             <h3 className="text-xl font-semibold text-gray-800 mb-2">
                 {/* Keeping the user's requested text 'Ingresos por fuente' */}
                 Ingresos por fuente
             </h3>
         )}


        {/* Horizontal Scrollable List of Source Cards */}
        {incomeEntries.length > 0 ? ( // Check if there are entries to display
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"> {/* Flex container for horizontal layout, enable scrolling, add padding bottom for scrollbar, hide scrollbar */}
                {incomeEntries.map(({ source, amount }) => {
                    // Determine the name to display using the map
                    const sourceDisplayName = sourceNameDisplayMap[source.name] || source.name || 'Fuente Desconocida';

                    return (
                        <div
                            key={source.id} // Use source id as key
                            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex-shrink-0 w-40 hover:shadow-md transition-shadow duration-200" // Vertical flex, centered items, padding, rounded, shadow, border, fixed width, prevent shrinking on hover
                        >
                             {/* Source Logo */}
                             {/* Keeping the user's styles: no rounded-full, no specific bg/border colors */}
                             <div className="w-12 h-12 flex items-center justify-center overflow-hidden mb-3">
                                  {source.logo && typeof source.logo === 'string' ? (
                                     <Image
                                         src={source.logo}
                                         alt={`${source.name || 'Fuente'} logo`}
                                         width={48}
                                         height={48}
                                         objectFit="cover"
                                     />
                                  ) : (
                                      <span className="text-lg font-semibold text-gray-500">{source.name ? source.name.charAt(0).toUpperCase() : '?'}</span>
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