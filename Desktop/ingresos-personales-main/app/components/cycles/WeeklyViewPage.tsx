'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Assuming this path is correct
import { format, addWeeks, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

// Import Lucide Icons
import {
  Calendar,
  Loader2,
  AlertCircle,
  Target, // For quantitative goal
  CheckSquare, // For boolean goal
  Edit, // For update button
  CheckCircle, // Status: Completed
  Clock, // Status: In Progress / Pending
  XCircle, // Status: Not met
} from 'lucide-react';
import UpdateProgressModal from './UpdateProgressModal';

export default function WeeklyViewComponent() {
  const params = useParams();
  const cycleId = params?.slug as string;
  const weekNumber = parseInt(params?.weekSlug as string);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cycle, setCycle] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0)

  // State to manage the Update Progress Modal
  // Although the modal component isn't here, we add the state
  // to show how you'd integrate it later.
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch Cycle Data
      const { data: c, error: cycleError } = await supabase
        .from('weekly_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (cycleError && cycleError.code !== 'PGRST116') { // PGRST116 is "no rows found"
        throw cycleError;
      }

      // Fetch Goals for the specific week
      const { data: g, error: goalsError } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('cycle_id', cycleId)
        .eq('week_number', weekNumber);

      if (goalsError) {
        throw goalsError;
      }


      let fetchedProgress: any[] = [];
      if (g && g.length > 0) {
        // Fetch Progress for those goals
        const goalIds = g.map((goal) => goal.id);
        const { data: p, error: progressError } = await supabase
          .from('weekly_progress')
          .select('*')
          .in('goal_id', goalIds)
          .eq('week_number', weekNumber); // Ensure progress is for the correct week

        if (progressError) {
          throw progressError;
        }
        fetchedProgress = p || [];
      }

      setCycle(c);
      setGoals(g || []);
      setProgress(fetchedProgress);

    } catch (err: any) {
      console.error('Fetch error:', err);
      // Display a more specific error message if available
      setError(`Error al cargar la información: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (cycleId && weekNumber) {
      // Basic validation for weekNumber
      if (weekNumber <= 0 || isNaN(weekNumber)) {
        setError('Número de semana inválido.');
        setLoading(false);
        return;
      }
      fetchData();
    } else {
      // Handle cases where params are not available yet (e.g., during initial render)
      // Or if weekSlug is missing/invalid
      if (!cycleId || !params?.weekSlug) {
        setLoading(false); // Stop loading if params are incomplete
      }
    }
  }, [cycleId, weekNumber, params?.weekSlug]); // Add params.weekSlug to dependencies


  // Function to open the update modal
  const handleUpdateClick = (goal: any) => {
    setSelectedGoal(goal);
    setIsUpdateModalOpen(true);
    // In a real app, you'd likely pass goal and current progress to the modal
  };

  // Function to close the update modal and refetch data
  const handleModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedGoal(null);
    // Optional: Refetch data to show updated progress immediately
    // fetchData();
  };

  const handleGoalUpdated = () => {
    // Refresh the data after a goal is updated
    fetchData();
    // Close the modal
    handleModalClose();
  }


  const getProgress = (goalId: string) => {
    // Find progress for the specific goal and week
    return progress.find((p) => p.goal_id === goalId && p.week_number === weekNumber)?.value ?? 0;
  };

  const getGoalStatus = (goal: any, value: number) => {
    if (goal.type === 'quantitative') {
      if (goal.target_value !== null && value >= goal.target_value) return 'completed';
      if (value > 0) return 'in-progress';
      return 'not-met';
    } else {
      if (value === 1) return 'completed';
      if (value === 0) return 'not-met';
      return 'pending'; // Boolean goals have no progress between 0 and 1
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in-progress': return 'En progreso';
      case 'not-met': return 'No cumplida';
      case 'pending': return 'Pendiente';
      default: return 'Estado desconocido';
    }
  }

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-yellow-600';
      case 'not-met': return 'text-red-600';
      case 'pending': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'in-progress': return <Clock className="w-4 h-4 mr-1" />;
      case 'not-met': return <XCircle className="w-4 h-4 mr-1" />;
      case 'pending': return <Clock className="w-4 h-4 mr-1" />; // Using Clock for pending too
      default: return null;
    }
  }


  const getWeekDates = () => {
    if (!cycle?.start_date || isNaN(weekNumber) || weekNumber <= 0) {
      return { start: 'Fecha no disponible', end: '' };
    }
    try {
      const startDate = new Date(cycle.start_date);
      // Ensure start date is valid
      if (isNaN(startDate.getTime())) {
        return { start: 'Fecha de inicio inválida', end: '' };
      }
      const start = addWeeks(startDate, weekNumber - 1);
      const end = addDays(start, 6);
      return {
        start: format(start, 'd MMM', { locale: es }),
        end: format(end, 'd MMM', { locale: es }),
      };
    } catch (e) {
      console.error("Error calculating week dates:", e);
      return { start: 'Error de fecha', end: '' };
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center text-blue-600">
          <Loader2 className="h-12 w-12 animate-spin" />
          <p className="mt-3 text-lg font-medium">Cargando semana...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="flex flex-col items-center text-red-600 bg-red-100 border border-red-400 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="h-12 w-12 mb-3" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          {/* Optional: Add a button to retry fetching */}
          {/* <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Reintentar</button> */}
        </div>
      </div>
    );
  }

  const { start, end } = getWeekDates();

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            Semana {weekNumber}
          </h1>
          <p className="text-lg text-gray-700 font-medium mb-4">
            del ciclo "{cycle?.title || 'Cargando...'}"
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="font-semibold">{start}</span> – <span className="font-semibold">{end}</span>
          </p>
        </div>


        {/* Goals List */}
        <div className="space-y-5">
          {goals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
              <p>No hay objetivos definidos para esta semana.</p>
            </div>
          ) : (
            goals.map((goal) => {
              const value = getProgress(goal.id);
              const status = getGoalStatus(goal, value);
              const statusText = getStatusText(status);
              const statusColorClass = getStatusColorClass(status);
              const statusIcon = getStatusIcon(status);


              return (
                <div
                  key={goal.id}
                  className="bg-white border border-gray-200 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                      {goal.type === 'quantitative' ? <Target className="w-6 h-6 text-blue-600" /> : <CheckSquare className="w-6 h-6 text-green-600" />}
                      {goal.title}
                    </h2>
                    {/* Update Button - Connect this to the modal */}
                    <button
                      onClick={() => handleUpdateClick(goal)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                      title="Actualizar Progreso"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Actualizar
                    </button>
                  </div>


                  <p className="text-sm text-gray-600 mb-2">
                    {goal.type === 'quantitative'
                      ? `Meta: ${goal.target_value} ${goal.unit || ''}`
                      : 'Meta: Cumplir (Sí/No)'}
                  </p>

                  {/* Progress Display */}
                  {goal.type === 'quantitative' ? (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Progreso actual: <span className="font-semibold">{value} {goal.unit || ''}</span>
                      </p>
                      {/* Simple Progress Bar */}
                      {goal.target_value !== null && goal.target_value > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (value / goal.target_value) * 100)}%` }}
                          ></div>
                        </div>
                      )}
                      {goal.target_value === null || goal.target_value <= 0 ? (
                        <p className="text-xs text-gray-500 mt-1">Meta no definida o inválida para barra de progreso.</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      Progreso: <span className="font-semibold">{value === 1 ? 'Sí' : (value === 0 ? 'No' : 'Pendiente de registro')}</span>
                    </p>
                  )}


                  {/* Status */}
                  <p className={`text-sm font-medium ${statusColorClass} flex items-center`}>
                    {statusIcon}
                    Estado: {statusText}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/*
          Integration Point for the Update Progress Modal
          You would typically render the modal component here conditionally
          based on `isUpdateModalOpen` and pass `selectedGoal`, `onClose`, and `onUpdated`.
        */}
        {/* {isUpdateModalOpen && selectedGoal && (
            <UpdateProgressModal
                goal={{
                     ...selectedGoal,
                     week_number: weekNumber // Ensure the modal knows the correct week
                }}
                onClose={handleModalClose}
                onUpdated={handleGoalUpdated}
            />
        )} */}
        {selectedGoal && (
          <UpdateProgressModal
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onUpdated={() => setRefreshKey((k) => k + 1)}
          />
        )}

      </div>
    </div>
  );
}