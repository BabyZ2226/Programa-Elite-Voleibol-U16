import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, BarChart2, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const routineData = [
  {
    day: "Día 01",
    title: "Potencia de Piernas",
    description: "Transfiere la fuerza al suelo para ganar altura en la red. Combina fuerza pura con movimientos pliométricos.",
    exercises: [
      { name: "Saltos al cajón", focus: "Potencia explosiva", sets: "4", reps: "5", rest: "90s desc." },
      { name: "Sentadilla búlgara", focus: "Fuerza unilateral", sets: "3", reps: "8/p", rest: "60s desc." },
      { name: "Jump Squat", focus: "Potencia continua", sets: "3", reps: "8-10", rest: "60s desc." },
      { name: "Peso muerto rumano", focus: "Isquiotibiales", sets: "3", reps: "10", rest: "60s desc." },
      { name: "Elevación gemelos", focus: "Impulso final", sets: "3", reps: "12/p", rest: "45s desc." },
    ]
  },
  {
    day: "Día 02",
    title: "Brazos y Hombros",
    description: "Un remate fuerte nace de la espalda y hombros.",
    exercises: [
      { name: "Press militar mancuerna", focus: "Fuerza de bloqueo", sets: "4", reps: "8-10", rest: "90s desc." },
      { name: "Dominadas", focus: "Estabilidad espalda", sets: "3", reps: "Fallo", rest: "90s desc." },
      { name: "Flexiones pliométricas", focus: "Explosividad empuje", sets: "3", reps: "6-8", rest: "60s desc." },
      { name: "Remo una mano", focus: "Compensación hombro", sets: "3", reps: "10/p", rest: "60s desc." },
      { name: "Med-Ball Slams", focus: "Potencia de remate", sets: "4", reps: "8", rest: "60s desc." },
    ],
    note: "Simula el movimiento del remate en cada lanzamiento. Usa toda la fuerza."
  },
  {
    day: "Día 03",
    title: "Core y Estabilidad",
    description: "El core transfiere la fuerza de las piernas a los brazos en el aire.",
    exercises: [
      { name: "Plancha toques hombro", focus: "Anti-rotación", sets: "3", reps: "16t", rest: "45s desc." },
      { name: "Russian Twists", focus: "Rotación remate", sets: "3", reps: "20", rest: "45s desc." },
      { name: "Farmer's Carry", focus: "Agarre y core", sets: "3", reps: "30m", rest: "60s desc." },
      { name: "Kettlebell Swings", focus: "Explosividad cadera", sets: "4", reps: "12-15", rest: "60s desc." },
      { name: "Elevación de piernas", focus: "Abdomen inferior", sets: "3", reps: "10-12", rest: "45s desc." },
    ]
  }
];

const restDay = {
  day: "Descanso Activo",
  title: "Recuperación y Movilidad",
  description: "Día de descanso activo. Realizar 20-30 min de movilidad articular. Previene la rigidez y favorece la circulación.",
  exercises: [
    { name: "Movilidad dinámica", focus: "Articulaciones", sets: "1", reps: "10 min", rest: "-" },
    { name: "Caminata o trote suave", focus: "Flujo sanguíneo", sets: "1", reps: "20 min", rest: "-" },
    { name: "Estiramiento estático", focus: "Flexibilidad", sets: "1", reps: "10 min", rest: "-" }
  ],
  note: "Mantén la intensidad muy baja. No superar el 60% de la FC Max."
};

const fullRest = {
  day: "Descanso Total",
  title: "Recuperación de Tejidos",
  description: "Día libre de entrenamiento para permitir la sobrecompensación muscular y neurológica.",
  exercises: [],
  note: "Prioriza dormir 8-9 horas e hidratación constante."
};

const workoutsMap: Record<string, any> = {
  'leg_power': routineData[0],
  'arm_strength': routineData[1],
  'core_stability': routineData[2],
  'active_rest': restDay,
  'full_rest': fullRest
};

const workoutOptions = [
  { id: 'leg_power', label: 'Día 01: Potencia de Piernas' },
  { id: 'arm_strength', label: 'Día 02: Brazos y Hombros' },
  { id: 'core_stability', label: 'Día 03: Core y Estabilidad' },
  { id: 'active_rest', label: 'Descanso Activo' },
  { id: 'full_rest', label: 'Descanso Total' }
];

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const initialChartData = [
  { date: '01 Abr', boxJump: 50, squat: 50, slam: 8 },
  { date: '07 Abr', boxJump: 52, squat: 55, slam: 8 },
  { date: '14 Abr', boxJump: 54, squat: 60, slam: 9 },
  { date: '21 Abr', boxJump: 56, squat: 65, slam: 10 },
  { date: '28 Abr', boxJump: 59, squat: 68, slam: 12 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'progress'>('calendar');
  const detailsRef = useRef<HTMLDivElement>(null);
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  // State for Weekly Routine Plan (mapping day of week index to workout ID)
  const [weeklyPlan, setWeeklyPlan] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('voleyfit_weeklyPlan');
    if (saved) return JSON.parse(saved);
    return {
      0: 'full_rest',   // Domingo
      1: 'leg_power',   // Lunes
      2: 'active_rest', // Martes
      3: 'arm_strength',// Miércoles
      4: 'active_rest', // Jueves
      5: 'core_stability', // Viernes
      6: 'full_rest'    // Sábado
    };
  });

  // State for Progress Tracking
  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('voleyfit_completedDates');
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [pbs, setPbs] = useState(() => {
    const saved = localStorage.getItem('voleyfit_pbs');
    if (saved) return JSON.parse(saved);
    return {
      boxJump: { value: 60, unit: "cm", label: "Salto al Cajón (Max)" },
      squat: { value: 70, unit: "kg", label: "Sentadilla (RM)" },
      slam: { value: 12, unit: "kg", label: "Med-Ball Slam (Max)" }
    };
  });

  // Guardar en el almacenamiento local cuando cambien los datos
  useEffect(() => {
    localStorage.setItem('voleyfit_weeklyPlan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem('voleyfit_completedDates', JSON.stringify(completedDates));
  }, [completedDates]);

  useEffect(() => {
    localStorage.setItem('voleyfit_pbs', JSON.stringify(pbs));
  }, [pbs]);

  const handlePbChange = (key: string, val: string) => {
    setPbs({ ...pbs, [key]: { ...pbs[key as keyof typeof pbs], value: val } });
  };

  const toggleCompleted = (dateStr: string) => {
    if (completedDates.includes(dateStr)) {
      setCompletedDates(completedDates.filter(d => d !== dateStr));
    } else {
      setCompletedDates([...completedDates, dateStr]);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const blanks = Array(getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth())).fill(null);
  const days = Array.from({length: getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())}, (_, i) => i + 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDay();
  const endBlanks = Array(6 - lastDayOfMonth).fill(null);

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    // Smooth scroll to details on mobile
    if (window.innerWidth < 1280) {
      setTimeout(() => {
        const offset = 80; // Offset for sticky headers
        const element = detailsRef.current;
        if (element) {
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
             top: offsetPosition,
             behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  const dayOfWeekSelected = selectedDate.getDay();
  const activeWorkoutId = weeklyPlan[dayOfWeekSelected];
  const activeWorkout = workoutsMap[activeWorkoutId];
  
  const fullDateString = selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const getWorkoutLabel = (dayIndex: number) => {
    const id = weeklyPlan[dayIndex];
    if (id === 'leg_power') return "DÍA 01";
    if (id === 'arm_strength') return "DÍA 02";
    if (id === 'core_stability') return "DÍA 03";
    if (id === 'active_rest') return "ACTIVO";
    return "";
  };

  return (
    <div className="min-h-[100dvh] lg:h-screen w-full bg-bg-base text-primary font-main flex flex-col lg:overflow-hidden">
      
      {/* Header */}
      <header className="px-4 py-6 md:p-[40px_60px] md:pb-[20px] border-b border-border-subtle flex justify-between items-start md:items-end flex-col md:flex-row gap-6 shrink-0 bg-bg-base z-10">
        <div className="title-block w-full md:w-auto">
          <h1 className="text-[24px] md:text-[32px] font-bold tracking-[-0.03em] uppercase text-primary leading-tight">
            Programa Elite<br className="max-md:hidden" /> Voleibol U16
          </h1>
          <p className="text-[11px] md:text-[13px] text-secondary mt-[4px] tracking-[0.05em] uppercase">
            Laboratorio de Rendimiento Físico
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
          {/* Navigation Tabs - Full width on mobile for easy tap */}
          <div className="flex w-full md:w-auto gap-1 bg-surface p-1 border border-border-subtle">
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 md:py-2 text-[11px] md:text-[10px] uppercase font-bold tracking-[0.1em] transition-colors ${activeTab === 'calendar' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
            >
              <CalendarIcon size={14} /> Calendario
            </button>
            <button 
              onClick={() => setActiveTab('progress')}
              className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 md:py-2 text-[11px] md:text-[10px] uppercase font-bold tracking-[0.1em] transition-colors ${activeTab === 'progress' ? 'bg-primary text-white' : 'text-secondary hover:text-primary'}`}
            >
              <BarChart2 size={14} /> Progreso
            </button>
          </div>

          <div className="meta-info hidden md:flex gap-[40px]">
            <div className="meta-item text-right">
              <label className="text-[10px] uppercase text-secondary tracking-[0.1em] block">Frecuencia</label>
              <div className="text-[14px] font-semibold text-primary mt-[2px]">3 Días / Sem.</div>
            </div>
            <div className="meta-item text-right">
              <label className="text-[10px] uppercase text-secondary tracking-[0.1em] block">Personalizado</label>
              <div className="text-[14px] font-semibold text-primary mt-[2px]">Adaptable</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Native scroll on mobile, flex-internal scroll on desktop */}
      <main className="flex-1 flex flex-col relative w-full lg:overflow-hidden">
        {activeTab === 'calendar' ? (
          <div className="flex-1 flex flex-col lg:flex-row w-full lg:overflow-hidden">
            
            {/* Calendar section */}
            <div className="flex-1 p-4 py-6 md:p-[40px_60px] flex flex-col xl:flex-row gap-6 md:gap-[40px] lg:overflow-y-auto bg-bg-base order-1">
              
              <div className="flex-1 max-w-[700px] mx-auto xl:mx-0 w-full">
                <div className="border border-border-subtle bg-bg-base shrink-0">
                  <div className="flex justify-between items-center p-3 md:p-4 border-b border-border-subtle bg-surface">
                    <button onClick={prevMonth} className="p-2 md:p-1.5 hover:bg-border-subtle transition-colors rounded text-secondary hover:text-primary">
                      <ChevronLeft size={18}/>
                    </button>
                    <h2 className="text-[13px] md:text-[14px] font-bold uppercase tracking-[0.1em] text-primary">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="p-2 md:p-1.5 hover:bg-border-subtle transition-colors rounded text-secondary hover:text-primary">
                      <ChevronRight size={18}/>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 border-b border-border-subtle bg-surface">
                    {daysOfWeek.map(d => (
                      <div key={d} className="text-[9px] md:text-[10px] uppercase text-secondary font-bold tracking-[0.1em] py-2 md:py-3 text-center">
                        {d}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-px bg-border-subtle">
                    {blanks.map((_, i) => (
                      <div key={`blank-start-${i}`} className="bg-surface/50 min-h-[60px] md:min-h-[80px]" />
                    ))}
                    
                    {days.map(day => {
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isCompleted = completedDates.includes(date.toDateString());
                      
                      const dayOfWeek = date.getDay();
                      const activeIdForThisDay = weeklyPlan[dayOfWeek];
                      const label = getWorkoutLabel(dayOfWeek);
                      const isRest = activeIdForThisDay === 'full_rest';
                      
                      return (
                        <div 
                          key={day}
                          onClick={() => handleDayClick(date)}
                          className={`min-h-[60px] md:min-h-[80px] p-1 md:p-[10px] flex flex-col cursor-pointer transition-colors relative group
                            ${isSelected 
                              ? 'bg-primary text-white' 
                              : isRest
                                ? 'bg-surface/30 hover:bg-surface'
                                : 'bg-bg-base hover:bg-surface'
                            }
                          `}
                        >
                          <span className={`text-[12px] md:text-[13px] font-mono font-bold pl-1 pt-1 md:p-0 ${
                            isSelected ? 'text-white' : isToday ? 'text-accent' : 'text-primary'
                          }`}>
                            {day}
                          </span>
                          
                          {/* Completed Indicator */}
                          {isCompleted && (
                             <div className={`absolute top-[4px] right-[4px] md:top-[10px] md:right-[10px] ${isSelected ? 'text-white' : 'text-primary'}`}>
                                <Check size={14} strokeWidth={3} />
                             </div>
                          )}

                          {label && (
                            <div className={`mt-auto text-[8px] md:text-[9px] uppercase tracking-[0.05em] font-semibold text-center md:text-left leading-tight py-1
                              ${isSelected ? 'text-white/90' : label === 'ACTIVO' ? 'text-secondary/70' : 'text-accent'}
                            `}>
                              <span className="hidden sm:inline">{label}</span>
                              <span className="sm:hidden">{label === 'ACTIVO' ? 'ACT' : label.replace('DÍA ', 'D')}</span>
                            </div>
                          )}

                          {isToday && !isSelected && !isCompleted && (
                             <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                        </div>
                      )
                    })}

                    {endBlanks.map((_, i) => (
                      <div key={`blank-end-${i}`} className="bg-surface/50 min-h-[60px] md:min-h-[80px]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Workout Details */}
              <div className="w-full xl:w-[380px] shrink-0" ref={detailsRef}>
                <div className="day-card border border-border-subtle p-5 md:p-[30px] flex flex-col bg-bg-base xl:sticky xl:top-0">
                  <div className="day-header mb-[20px] border-b-[2px] border-primary pb-[15px]">
                    <h2 className="text-[16px] uppercase tracking-[0.05em] font-bold m-0 text-primary">
                      {activeWorkout.day}
                    </h2>
                    <div className="flex flex-col mt-1">
                      <span className="text-[12px] text-secondary font-medium m-0">{activeWorkout.title}</span>
                      <span className="text-[10px] text-accent font-mono m-0 mt-2 uppercase tracking-[0.05em]">{fullDateString}</span>
                    </div>
                  </div>

                  {/* Configurable Routine Assignment */}
                  <div className="mb-[24px] bg-surface border border-border-subtle p-3 transition-colors focus-within:border-primary/50">
                    <label className="text-[9px] uppercase text-secondary tracking-[0.1em] font-bold mb-2 flex items-center gap-1.5">
                      <Settings size={12} className="text-primary"/> Plan para este día ({selectedDate.toLocaleDateString('es-ES', { weekday: 'long' })})
                    </label>
                    <select 
                      value={activeWorkoutId} 
                      onChange={(e) => setWeeklyPlan(prev => ({...prev, [dayOfWeekSelected]: e.target.value}))}
                      className="w-full bg-surface text-[12px] md:text-[13px] py-3 px-2 md:p-2 border border-border-subtle text-primary font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                      {workoutOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {activeWorkout.description && (
                    <p className="text-[12px] text-secondary mb-6 leading-relaxed">
                      {activeWorkout.description}
                    </p>
                  )}
                  
                  {activeWorkout.exercises.length > 0 ? (
                    <div className="exercise-list flex flex-col gap-[18px]">
                      {activeWorkout.exercises.map((ex: any, exIndex: number) => (
                        <div key={exIndex} className="exercise-item flex flex-col">
                          <div className="ex-name text-[13px] font-semibold mb-[4px] text-primary">{ex.name}</div>
                          <div className="ex-meta text-[11px] text-secondary flex justify-between font-mono">
                            <span>{ex.sets} x {ex.reps}</span>
                            <span>{ex.rest}</span>
                          </div>
                          <div className="ex-focus text-[10px] italic text-accent mt-[2px]">{ex.focus}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[12px] text-secondary italic py-8 text-center bg-surface border border-border-subtle">
                      No hay ejercicios de fuerza hoy.
                    </div>
                  )}

                  {/* Completion Action */}
                  <div className="mt-8 pt-[20px] border-t border-border-subtle">
                    <button
                      onClick={() => toggleCompleted(selectedDate.toDateString())}
                      className={`w-full py-4 text-[12px] font-bold uppercase tracking-[0.1em] border transition-colors flex justify-center items-center gap-2 active:scale-[0.98]
                      ${completedDates.includes(selectedDate.toDateString())
                          ? 'bg-border-subtle text-primary border-border-subtle hover:bg-surface'
                          : 'bg-primary text-white border-primary hover:bg-bg-base hover:text-primary'
                      }`}
                    >
                      {completedDates.includes(selectedDate.toDateString()) ? (
                         <><Check size={16} strokeWidth={2.5}/> Entrenamiento Completado</>
                      ) : (
                         'Marcar Completado'
                      )}
                    </button>
                    {activeWorkout.note && (
                      <p className="text-[10px] text-secondary leading-relaxed italic mt-4 text-center">
                        * {activeWorkout.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar info moves to bottom on mobile, side on desktop */}
            <aside className="order-last lg:order-first w-full lg:w-[280px] p-6 py-8 md:p-[40px_60px] border-t lg:border-t-0 lg:border-r border-border-subtle bg-surface flex flex-col gap-[30px] md:gap-[40px] lg:overflow-y-auto shrink-0">
              <div className="sidebar-section">
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-accent font-bold mb-[15px]">Consideraciones</h3>
                <ul className="list-none space-y-[12px]">
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <strong className="text-primary font-semibold">Calentamiento:</strong> 10 min movilidad dinámica.
                  </li>
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <strong className="text-primary font-semibold">Frecuencia:</strong> Configurable arriba.
                  </li>
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <strong className="text-primary font-semibold">Velocidad:</strong> Fase concéntrica explosiva.
                  </li>
                </ul>
              </div>
              <div className="sidebar-section">
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-accent font-bold mb-[15px]">Recuperación</h3>
                <ul className="list-none space-y-[12px]">
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <span className="text-primary font-semibold">•</span> Dormir 8-9 horas diarias.
                  </li>
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <span className="text-primary font-semibold">•</span> Proteína e Hidratación constante.
                  </li>
                  <li className="text-[13px] leading-[1.6] text-secondary">
                    <span className="text-primary font-semibold">•</span> 5-10 min estiramiento.
                  </li>
                </ul>
              </div>
            </aside>

          </div>
        ) : (
          <div className="flex-1 p-4 py-6 md:p-[40px_60px] lg:overflow-y-auto bg-bg-base flex flex-col pb-20 w-full">
            <div className="max-w-[1000px] w-full mx-auto space-y-12">
              
              {/* Personal Bests Section */}
              <section>
                <div className="flex items-center justify-between mb-6 border-b-2 border-primary pb-2">
                  <h2 className="text-[15px] md:text-[16px] uppercase tracking-[0.1em] font-bold text-primary">Récords Personales</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {Object.entries(pbs).map(([key, pb]) => (
                    <div key={key} className="border border-border-subtle p-5 md:p-6 flex flex-col transition-colors focus-within:border-primary focus-within:bg-surface">
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-[0.1em] mb-4">{pb.label}</span>
                      <div className="flex items-end gap-2 border-b border-border-subtle pb-1">
                        <input 
                          type="number" 
                          value={pb.value} 
                          onChange={(e) => handlePbChange(key, e.target.value)} 
                          className="text-[28px] md:text-[32px] font-black text-primary font-mono w-[80px] outline-none bg-transparent" 
                        />
                        <span className="text-[13px] md:text-[14px] font-mono font-bold text-secondary mb-1.5">{pb.unit}</span>
                      </div>
                      <span className="text-[10px] text-secondary mt-3 italic">↑ Toca el número para actualizar</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Progress Chart Section */}
              <section>
                <div className="flex items-center justify-between mb-6 border-b-2 border-primary pb-2">
                  <h2 className="text-[15px] md:text-[16px] uppercase tracking-[0.1em] font-bold text-primary">Evolución de Cargas</h2>
                </div>
                
                <div className="border border-border-subtle p-4 pb-6 md:p-8 bg-surface">
                  <div className="h-[280px] md:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={initialChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{fontSize: 10, fill: 'var(--color-secondary)', fontFamily: 'var(--font-mono)'}} 
                          axisLine={false} 
                          tickLine={false} 
                          dy={10} 
                        />
                        <YAxis 
                          tick={{fontSize: 10, fill: 'var(--color-secondary)', fontFamily: 'var(--font-mono)'}} 
                          axisLine={false} 
                          tickLine={false} 
                          dx={-10}
                        />
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: 0, fontSize: '11px', fontFamily: 'var(--font-main)' }}
                           itemStyle={{ color: '#111', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                           labelStyle={{ color: 'var(--color-secondary)', marginBottom: '5px' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="boxJump" 
                          stroke="var(--color-primary)" 
                          strokeWidth={2} 
                          dot={{fill: 'var(--color-primary)', r: 4}} 
                          activeDot={{r: 6}} 
                          name="Salto Cajón (cm)" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="squat" 
                          stroke="var(--color-secondary)" 
                          strokeWidth={2} 
                          dot={{fill: 'var(--color-secondary)', r: 4}} 
                          activeDot={{r: 6}} 
                          name="Sentadilla (kg)" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-8 justify-center">
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-mono text-secondary">
                      <div className="w-3 h-3 bg-primary rounded-full"></div> Salto Cajón (cm)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-mono text-secondary">
                      <div className="w-3 h-3 bg-secondary rounded-full"></div> Sentadilla (kg)
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white py-[15px] px-6 md:px-[60px] text-[12px] flex flex-col sm:flex-row justify-between items-center shrink-0 z-10 w-full">
        <div className="opacity-70 font-semibold tracking-[0.05em] font-sans uppercase">
          {completedDates.length > 0 ? `Sesiones completadas: ${completedDates.length}` : 'Próximo paso: Salto al siguiente nivel'}
        </div>
        <span className="opacity-70 mt-2 sm:mt-0 font-sans tracking-[0.05em] text-[10px] uppercase">
          © 2026 Performance Lab • Voley U16
        </span>
      </footer>

    </div>
  );
}
