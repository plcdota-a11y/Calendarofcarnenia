import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Star, Sparkles, Moon } from 'lucide-react';

// === DADOS DO CALENDÁRIO ===
const MONTHS = [
  { name: "Ordan", days: 30, season: "Primavera" },
  { name: "Escordin", days: 30, season: "Primavera" },
  { name: "Yunar", days: 29, season: "Primavera" },
  { name: "Junar", days: 30, season: "Verão" },
  { name: "Peikar", days: 30, season: "Verão" },
  { name: "Escorin", days: 29, season: "Verão" },
  { name: "Voltin", days: 30, season: "Verão" },
  { name: "Moiarin", days: 30, season: "Outono" },
  { name: "Nóber", days: 29, season: "Outono" },
  { name: "Dëcar", days: 30, season: "Outono" },
  { name: "Orgin", days: 30, season: "Inverno" },
  { name: "Mungin", days: 29, season: "Inverno" },
  { name: "Jinfer", days: 30, season: "Inverno" },
  { name: "Uiver", days: 30, season: "Inverno" }, // Perde 1 dia nos anos curtos
];

const WEEKDAYS = [
  "D'kalir", "Elhelihúm", "Laselys", "Vôely", "Pracele", "Dimeer", "Foraeyl"
];

// === FUNÇÕES DE LÓGICA CORE ===

const isShortYear = (year) => {
  return year % 5 === 0;
};

const getDaysInMonth = (year, monthIdx) => {
  if (monthIdx === 13 && isShortYear(year)) return 29;
  return MONTHS[monthIdx].days;
};

// Calcula o "Dia Absoluto" desde o Dia 1, Ano 1 DGS (Ponto Zero do Universo)
const getAbsoluteDay = (year, monthIdx, day) => {
  const fullCycles = Math.floor((year - 1) / 5);
  const remainingYears = (year - 1) % 5;
  
  // Um ciclo de 5 anos tem exatos 2079 dias (4 comuns + 1 curto)
  // Um ano comum avulso tem 416 dias
  let pastDays = (fullCycles * 2079) + (remainingYears * 416);
  
  // Adiciona os dias dos meses que já passaram no ano atual
  for (let m = 0; m < monthIdx; m++) {
    pastDays += getDaysInMonth(year, m);
  }
  
  return pastDays + day;
};

const getWeekday = (absDay) => {
  // Dia 1 Absoluto = D'kalir (índice 0)
  return WEEKDAYS[(absDay - 1) % 7];
};

const getMoonPhases = (absDay) => {
  const majorCycle = 29.7;
  const minorCycle = 14.85;

  const majorPos = (absDay - 1) % majorCycle;
  const minorPos = (absDay - 1) % minorCycle;

  const resolvePhase = (pos, cycle) => {
    const ratio = pos / cycle;
    if (ratio < 0.25) return { name: "Minguante", id: 0, description: "Perdendo a luz após o ápice", icon: WaningIcon };
    if (ratio < 0.50) return { name: "Nova", id: 1, description: "Escura, oculta no céu noturno", icon: NewIcon };
    if (ratio < 0.75) return { name: "Crescente", id: 2, description: "Ganhando força gradualmente", icon: WaxingIcon };
    return { name: "Cheia", id: 3, description: "Em seu brilho total e majestoso", icon: FullIcon };
  };

  return {
    major: resolvePhase(majorPos, majorCycle),
    minor: resolvePhase(minorPos, minorCycle)
  };
};

// === COMPONENTES VISUAIS (ÍCONES SVG CUSTOMIZADOS) ===

const WaningIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14c-4.418 0-8-6.268-8-14S11.582 2 16 2z" />
  </svg>
);

const WaxingIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <path d="M16 2c7.732 0 14 6.268 14 14s-6.268 14-14 14c4.418 0 8-6.268 8-14S20.418 2 16 2z" />
  </svg>
);

const FullIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
      <circle cx="16" cy="16" r="14" />
  </svg>
);

const NewIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" className={className} fill="transparent" stroke="currentColor" strokeWidth="1.5">
      <circle cx="16" cy="16" r="14" strokeDasharray="4 4" opacity="0.4" />
  </svg>
);


// === COMPONENTE PRINCIPAL ===

export default function App() {
  const [year, setYear] = useState(1);
  const [month, setMonth] = useState(0); // 0 a 13
  const [selectedDay, setSelectedDay] = useState(1);

  // Garante que o dia selecionado seja válido quando o mês ou ano mudar
  useEffect(() => {
    const maxDays = getDaysInMonth(year, month);
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [year, month, selectedDay]);

  const handlePrevMonth = () => {
    if (month === 0) {
      if (year > 1) {
        setYear(year - 1);
        setMonth(13);
      }
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 13) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleYearChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) {
      setYear(val);
    }
  };

  // Cálculos da grade do calendário
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDayOfMonthAbsolute = getAbsoluteDay(year, month, 1);
  const startingWeekdayIndex = (firstDayOfMonthAbsolute - 1) % 7;
  
  // Pad do início do calendário
  const blanks = Array.from({ length: startingWeekdayIndex }, (_, i) => i);
  // Dias do mês
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Cálculos do dia selecionado
  const selectedAbsoluteDay = getAbsoluteDay(year, month, selectedDay);
  const selectedWeekday = getWeekday(selectedAbsoluteDay);
  const moonPhases = getMoonPhases(selectedAbsoluteDay);
  const currentSeason = MONTHS[month].season;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1d] to-black text-slate-200 p-4 md:p-8 flex items-center justify-center font-sans">
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Calendário */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-indigo-900/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Cabeçalho do Calendário */}
          <div className="p-6 border-b border-indigo-900/50 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <Star className="w-24 h-24 text-indigo-400" />
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth} 
                disabled={year === 1 && month === 0}
                className="p-2 rounded-full hover:bg-indigo-600/30 disabled:opacity-30 disabled:hover:bg-transparent transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <h1 className="text-2xl font-bold text-amber-100 tracking-wide">
                  {MONTHS[month].name}
                </h1>
                <div className="text-indigo-300 text-sm font-medium tracking-widest uppercase mt-1">
                  {currentSeason}
                </div>
              </div>

              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-full hover:bg-indigo-600/30 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-xl border border-indigo-900/50">
              <span className="text-sm text-slate-400">Ano (DGS)</span>
              <input 
                type="number" 
                value={year} 
                onChange={handleYearChange}
                min="1"
                className="w-20 bg-transparent text-amber-200 font-bold text-lg outline-none text-center"
              />
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="p-6 flex-grow">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEKDAYS.map(day => (
                <div key={day} className="text-center text-xs font-bold text-indigo-400/70 uppercase tracking-wider truncate">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="aspect-square opacity-0"></div>
              ))}
              
              {days.map(day => {
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`
                      relative aspect-square rounded-xl flex items-center justify-center text-lg font-medium transition-all duration-300
                      ${isSelected 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-300 transform scale-105 z-10' 
                        : 'bg-slate-800/30 text-slate-300 hover:bg-indigo-900/40 hover:text-amber-100 border border-transparent hover:border-indigo-700/50'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Indicador de Ano Bissexto (Carneniano) */}
          {isShortYear(year) && month === 13 && (
            <div className="bg-amber-900/20 text-amber-300/80 text-xs text-center p-2 border-t border-amber-900/30">
              ✦ Ano de Intercalação: Uiver tem 29 dias para alinhar as luas.
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes Astronômicos */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-amber-900/30 rounded-3xl shadow-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Moon className="w-64 h-64 text-amber-200" />
          </div>

          <div className="border-b border-indigo-900/50 pb-6 relative z-10">
            <div className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 
              Dia Absoluto: {selectedAbsoluteDay.toLocaleString()}
            </div>
            <h2 className="text-3xl font-bold text-amber-100 mb-1">
              {selectedDay} de {MONTHS[month].name}
            </h2>
            <div className="text-lg text-slate-300">
              Ano {year} DGS <span className="mx-2 text-indigo-700">•</span> {selectedWeekday}
            </div>
          </div>

          <div className="flex-grow flex flex-col gap-5 relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Alinhamento Duo-Lunar
            </h3>

            {/* Lua Maior */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-5 hover:border-amber-700/50 transition duration-300 group">
              <div className="flex-shrink-0">
                <moonPhases.major.icon className="w-14 h-14 text-amber-100 group-hover:drop-shadow-[0_0_12px_rgba(254,243,199,0.5)] transition" />
              </div>
              <div>
                <div className="text-xs text-amber-400/80 font-bold uppercase tracking-wider mb-1">Lua Maior</div>
                <div className="text-xl font-semibold text-slate-100 mb-1">{moonPhases.major.name}</div>
                <div className="text-xs text-slate-400">{moonPhases.major.description}</div>
              </div>
            </div>

            {/* Lua Menor */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex items-center gap-5 hover:border-slate-400/50 transition duration-300 group">
              <div className="flex-shrink-0">
                <moonPhases.minor.icon className="w-10 h-10 text-slate-300 group-hover:drop-shadow-[0_0_12px_rgba(203,213,225,0.4)] transition" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Lua Menor</div>
                <div className="text-xl font-semibold text-slate-100 mb-1">{moonPhases.minor.name}</div>
                <div className="text-xs text-slate-400">{moonPhases.minor.description}</div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 text-center text-xs text-slate-600">
              <p>Ciclo Maior: ~29,7 dias | Ciclo Menor: ~14,85 dias</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}