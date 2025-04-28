'use client';

import {
  DollarSign,         // Simpler Dollar icon for numbers
  ArrowUp,          // For Income (more 'up')
  ArrowDown,      // For Expenses (more 'down')
  Scale,            // For Balance (alternative)
  Target,           // For Goals section title
  Trophy,           // Alternative Goal icon
  CircleDot,        // For individual Goal type (Quantitative process)
  CheckCircle,      // For individual Goal type (Completed boolean)
  Repeat,           // For Rituals/Habits section title
  HeartHandshake,   // Example Ritual Icon
  BookOpen,         // Example Ritual Icon
  Coffee,           // Example Ritual Icon
  MoonStar,        // Example Ritual Icon
  CheckSquare,      // Goal Status: Completed (Alternative)
  Clock,            // Goal Status: Pending/In Progress
  XCircle,          // Goal Status: Not Met
  Sparkles,         // Alternative Rituals icon
  Dumbbell,         // Example Ritual Icon
  LineChart,        // Financial visual alternative
} from 'lucide-react';

// Fictional Data (Same as before)
const fictionalData = {
  financials: {
    income: 4500, // Monthly Income
    expenses: 2800, // Monthly Expenses
    balance: 1700, // Income - Expenses
  },
  goals: [
    {
      id: 'goal-1',
      title: 'Ahorrar $500 para vacaciones',
      type: 'quantitative',
      target_value: 500,
      current_value: 420,
      unit: 'USD',
      status: 'in-progress', // completed, in-progress, not-met
      week_number: 15, // Example week
    },
    {
      id: 'goal-2',
      title: 'Leer 2 libros este mes',
      type: 'quantitative',
      target_value: 2,
      current_value: 1.5,
      unit: 'libros',
      status: 'in-progress',
      week_number: 15, // Example week
    },
    {
      id: 'goal-3',
      title: 'Entrenar 3+ veces',
      type: 'boolean',
      target_value: null,
      current_value: 1,
      unit: null,
      status: 'completed',
      week_number: 15, // Example week
    },
     {
      id: 'goal-4',
      title: 'Planificar comidas semanales',
      type: 'boolean',
      target_value: null,
      current_value: 0,
      unit: null,
      status: 'not-met',
      week_number: 15, // Example week
    },
     {
      id: 'goal-5',
      title: 'Estudiar 5 horas para el examen',
      type: 'quantitative',
      target_value: 5,
      current_value: 3,
      unit: 'horas',
      status: 'in-progress',
      week_number: 15, // Example week
    },
  ],
  rituals: [
    { id: 'ritual-1', name: 'Meditación diaria', icon: <HeartHandshake className="w-5 h-5 text-purple-500" /> },
    { id: 'ritual-2', name: 'Lectura nocturna', icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
    { id: 'ritual-3', name: 'Paseo al aire libre', icon: <Dumbbell className="w-5 h-5 text-emerald-500" /> },
     { id: 'ritual-4', name: 'Rutina de sueño', icon: <MoonStar className="w-5 h-5 text-indigo-500" /> },
      { id: 'ritual-5', name: 'Review semanal', icon: <Repeat className="w-5 h-5 text-teal-500" /> },
       { id: 'ritual-6', name: 'Hidratarse', icon: <Sparkles className="w-5 h-5 text-cyan-500" /> },
  ],
};

// Helper to format currency
const formatCurrency = (amount: number) => {
  const numberAmount = typeof amount === 'number' ? amount : 0;
  // Use a locale with better support for currency symbols and grouping
  return new Intl.NumberFormat('en-US', { // Using en-US might give a cleaner look with $
    style: 'currency',
    currency: 'USD', // Using USD symbol for cleaner look, change currency code as needed
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numberAmount);
};

// Helper to get goal status details
const getGoalStatusDetails = (status: string) => {
    switch(status) {
        case 'completed': return { text: 'Completada', color: 'text-green-600', icon: <CheckCircle className="w-4 h-4 mr-1" /> };
        case 'in-progress': return { text: 'En progreso', color: 'text-yellow-600', icon: <Clock className="w-4 h-4 mr-1" /> };
        case 'not-met': return { text: 'No cumplida', color: 'text-red-600', icon: <XCircle className="w-4 h-4 mr-1" /> };
        default: return { text: 'Estado desconocido', color: 'text-gray-500', icon: null };
    }
}

export default function HomePage() {
  const { financials, goals, rituals } = fictionalData;

  return (
    <div className="min-h-screen bg-gray-100 py-10"> {/* Simple light gray background */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8"> {/* Consistent padding */}

        {/* Welcome Header */}
        <header className="mb-8"> {/* Adjusted margin */}
          <h1 className="text-2xl font-semibold text-gray-800 sm:text-3xl"> {/* Semibold, slightly smaller */}
            Buenos días, [Nombre]
          </h1>
          <p className="mt-1 text-md text-gray-600"> {/* Adjusted size */}
            Tu resumen.
          </p>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"> {/* Grid for main sections, adjusted gap */}

            {/* Financial Overview Section (Widget Style) */}
            <section className="md:col-span-2"> {/* Spans full width on medium+ screens */}
                 <h2 className="sr-only">Finanzas</h2> {/* Screen reader only heading */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"> {/* Clean block with subtle border/shadow */}
                     {/* Balance */}
                    <div className="mb-6">
                         <p className="text-sm font-medium text-gray-500">Saldo Actual</p>
                         <p className={`text-4xl font-bold ${financials.balance >= 0 ? 'text-green-700' : 'text-red-700'} mt-1`}>
                           {formatCurrency(financials.balance)}
                         </p>
                    </div>

                    {/* Income and Expenses */}
                    <div className="grid grid-cols-2 gap-4 text-gray-800 border-t border-gray-100 pt-4"> {/* Subtle divider */}
                        <div className="flex items-center justify-start"> {/* Align left */}
                            <ArrowUp className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ingresos</p>
                                <p className="text-lg font-semibold">{formatCurrency(financials.income)}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start"> {/* Align left */}
                             <ArrowDown className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                             <div>
                                <p className="text-sm font-medium text-gray-500">Gastos</p>
                                <p className="text-lg font-semibold">{formatCurrency(financials.expenses)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Goals Section (Widget Style - List) */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"> {/* Smaller heading, adjusted margin */}
                    <Trophy className="w-5 h-5 text-purple-600" />
                    Metas
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"> {/* Clean block */}
                    {goals.length === 0 ? (
                        <div className="p-5 text-center text-gray-500">
                            <p>No hay metas definidas.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200"> {/* Thin dividers */}
                            {goals.map((goal) => {
                                const statusDetails = getGoalStatusDetails(goal.status);
                                const progressPercentage = goal.type === 'quantitative' && goal.target_value ? Math.min(100, (goal.current_value / goal.target_value) * 100) : (goal.current_value === 1 ? 100 : 0);

                                return (
                                    <li
                                        key={goal.id}
                                        className="px-5 py-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors" // Padding, hover effect
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3 flex-grow pr-4">
                                                {/* Goal Type Icon - subtle color */}
                                                {goal.type === 'quantitative'
                                                   ? <CircleDot className="w-5 h-5 text-gray-500 flex-shrink-0" /> // Use CircleDot
                                                   : <CheckCircle className="w-5 h-5 text-gray-500 flex-shrink-0" /> // Use CheckCircle for type
                                                }
                                                <h3 className="font-medium text-gray-800 truncate">{goal.title}</h3> {/* Medium font */}
                                            </div>
                                             {/* Status with color and icon */}
                                            <div className={`flex-shrink-0 text-sm font-medium ${statusDetails.color} flex items-center text-right`}>
                                                {statusDetails.icon}
                                                <span className="hidden sm:inline">{statusDetails.text}</span> {/* Hide text on small screens */}
                                            </div>
                                        </div>

                                        {/* Quantitative Goal Progress & Visual Bar */}
                                        {goal.type === 'quantitative' && (
                                            <div className="mt-1">
                                                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                                                    <span>Progreso: <span className="font-semibold">{goal.current_value} {goal.unit || ''}</span></span>
                                                    {goal.target_value !== null && goal.target_value > 0 && (
                                                         <span>Meta: <span className="font-semibold">{goal.target_value} {goal.unit || ''}</span></span>
                                                    )}
                                                </div>
                                                 {goal.target_value !== null && goal.target_value > 0 ? (
                                                     <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden"> {/* Thinner bar */}
                                                         <div
                                                             className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out" // Subtle blue color
                                                             style={{ width: `${progressPercentage}%` }}
                                                         ></div>
                                                     </div>
                                                  ) : (
                                                      <p className="text-xs text-gray-500 mt-1">Meta no definida para progreso visual.</p>
                                                  )}
                                            </div>
                                        )}
                                         {/* Boolean Goal Status */}
                                         {goal.type === 'boolean' && (
                                             <p className="text-sm text-gray-600 mt-1">
                                                 Estado: <span className="font-medium">{goal.current_value === 1 ? 'Sí' : (goal.current_value === 0 ? 'No' : 'Pendiente de registro')}</span>
                                             </p>
                                         )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>

            {/* Rituals/Habits Section (Widget Style - Grid of Icons) */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" /> {/* Smaller icon */}
                    Rituales
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"> {/* Clean block with padding */}
                 {rituals.length === 0 ? (
                     <div className="text-center text-gray-500">
                       <p>No hay rituales o hábitos definidos.</p>
                     </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4"> {/* Grid for rituals */}
                        {rituals.map((ritual) => (
                            <div
                                key={ritual.id}
                                className="py-3 flex flex-col items-center text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-2" // Padding, hover effect
                            >
                                <div className="mb-2 flex-shrink-0">
                                    {ritual.icon} {/* Display the icon */}
                                </div>
                                <h3 className="font-medium text-sm text-gray-800 leading-tight line-clamp-2">{ritual.name}</h3> {/* Medium font */}
                            </div>
                        ))}
                    </div>
                 )}
                </div> {/* End Rituals block */}
            </section>

        </div> {/* End of Dashboard Grid container */}

      </div>
    </div>
  );
}