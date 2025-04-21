'use client'; // This component needs to be a Client Component for useState and framer-motion

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'; // Assuming es locale is needed for any date formatting here

// Helper function to get days in a month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper to get the day of the month (1-based)
const getDayOfMonth = (date) => {
  return date.getDate();
};

// Helper to format currency securely (optional, but good practice)
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
   // Use es-CO locale for Colombian Pesos format
   return amount.toLocaleString('es-CO', {
     style: 'currency',
     currency: 'COP', // Use COP for Colombian Pesos
     minimumFractionDigits: 0, // No decimals for simplicity in this display
     maximumFractionDigits: 0,
   }).replace('COP', '').trim(); // Remove COP symbol, just show the number with thousands separator and '$'
};


export default function IncomeStatisticsCard({ totalIncome, lastMonthIncome, periodName = 'este mes' }) {
  // --- State for Collapsible ---
  const [isExpanded, setIsExpanded] = useState(true); // State to manage expanded/collapsed

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // --- Placeholder Data & Calculations ---
  // In a real app, daysPassed and totalDaysInPeriod might come from props or a hook
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const daysPassed = getDayOfMonth(now); // Days passed in the current month
  const totalDaysInPeriod = getDaysInMonth(currentYear, currentMonth); // Total days in the current month

  // Basic Calculations
  const averageDailyIncome = daysPassed > 0 ? totalIncome / daysPassed : 0;
  const daysRemaining = totalDaysInPeriod - daysPassed;
  const projectedIncome = daysPassed > 0 && daysRemaining >= 0 ? totalIncome + (averageDailyIncome * daysRemaining) : null; // Project only if possible

  // Calculations vs Last Month
  const incomeChangeFromLastMonth = totalIncome - (lastMonthIncome || 0); // Handle if lastMonthIncome is null/undefined
  const percentageChange = (lastMonthIncome && lastMonthIncome > 0)
    ? (incomeChangeFromLastMonth / lastMonthIncome) * 100
    : null; // Avoid division by zero


  // --- Render ---
  return (
    <motion.div
      layout // Enable layout animations for smooth transitions when expanding/collapsing
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 overflow-hidden" // overflow-hidden to clip content during collapse
    >
        {/* Card Header - Clickable to Toggle */}
        <div
           className="flex justify-between items-center cursor-pointer pb-4 border-b border-gray-200" // Add bottom border
           onClick={toggleExpanded}
        >
            <h2 className="text-xl font-semibold text-gray-800">Estadísticas de Ingresos</h2>
            <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }} // Rotate icon based on expanded state
                transition={{ duration: 0.3 }}
            >
                 {/* Chevron Icon (from Heroicons) */}
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
            </motion.div>
        </div>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}> {/* initial={false} avoids animating on first render */}
          {isExpanded && (
            <motion.div
              key="stats-content" // Unique key for AnimatePresence
              initial={{ opacity: 0, height: 0, marginTop: 0 }} // Initial state when entering
              animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }} // Animate to auto height, add margin
              exit={{ opacity: 0, height: 0, marginTop: 0 }} // State when exiting
              transition={{ duration: 0.3, ease: "easeInOut" }}
              layout // Inherit layout animation
            >
              <div className="grid grid-cols-2 gap-y-6 gap-x-4"> {/* Grid for stats, more vertical gap */}

                  {/* Promedio Ingresos por Día */}
                  <div>
                      <p className="text-sm text-gray-600">Promedio Diario ({periodName})</p>
                      <p className="text-lg font-bold text-blue-600 mt-0.5">
                          ${averageDailyIncome.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                  </div>

                   {/* Ingresos Mes Anterior */}
                  {lastMonthIncome !== undefined && lastMonthIncome !== null && (
                      <div>
                          <p className="text-sm text-gray-600">Ingresos Mes Anterior</p>
                          <p className="text-lg font-bold text-gray-800 mt-0.5">
                              {formatCurrency(lastMonthIncome)} {/* Using helper formatter */}
                          </p>
                      </div>
                  )}

                  {/* Cambio vs Mes Anterior */}
                  {percentageChange !== null && ( // Show only if valid percentage change
                     <div>
                         <p className="text-sm text-gray-600">Cambio vs Mes Anterior</p>
                          <p className={`text-lg font-bold mt-0.5 flex items-center ${incomeChangeFromLastMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                             {/* Arrow Icon */}
                             <motion.span className="mr-1" animate={{ rotate: incomeChangeFromLastMonth >= 0 ? 0 : 180 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /> {/* Up arrow */}
                                 </svg>
                             </motion.span>
                              {percentageChange.toFixed(1)}%
                         </p>
                     </div>
                  )}

                  {/* Días Transcurridos */}
                  <div>
                       <p className="text-sm text-gray-600">Días Transcurridos</p>
                       <p className="text-lg font-bold text-gray-800 mt-0.5">
                          {daysPassed} de {totalDaysInPeriod}
                       </p>
                  </div>

                  {/* Días Restantes */}
                   {daysRemaining >= 0 && (
                      <div>
                          <p className="text-sm text-gray-600">Días Restantes</p>
                          <p className="text-lg font-bold text-gray-800 mt-0.5">
                             {daysRemaining}
                          </p>
                      </div>
                   )}


                  {/* Ingreso Proyectado */}
                  {projectedIncome !== null && ( // Only show if projected income is calculated
                      <div>
                          <p className="text-sm text-gray-600">Proyección Fin {periodName}</p>
                          <p className="text-lg font-bold text-purple-600 mt-0.5">
                             {formatCurrency(projectedIncome)}
                          </p>
                      </div>
                  )}


                  {/* Puedes añadir más estadísticas aquí */}
                  {/*
                   <div>
                        <p className="text-sm text-gray-600"># Transacciones</p>
                        <p className="text-lg font-bold text-gray-800 mt-0.5">15</p> // Example static data
                   </div>
                  */}

              </div>
            </motion.div>
          )}
        </AnimatePresence>

    </motion.div>
  );
}