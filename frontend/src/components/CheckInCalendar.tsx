import { CheckIn } from '../types';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

interface CheckInCalendarProps {
  checkIns: CheckIn[];
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onDayClick?: (checkIn: CheckIn) => void;
}

export default function CheckInCalendar({ checkIns, year, month, onMonthChange, onDayClick }: CheckInCalendarProps) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let offset = firstDay.getDay() - 1;
  if (offset < 0) offset = 6;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  const checkedDays = new Set<number>();
  const checkInMap = new Map<number, CheckIn>();
  checkIns.forEach(c => {
    const day = parseInt(c.checkinDate.split('-')[2], 10);
    checkedDays.add(day);
    checkInMap.set(day, c);
  });

  const prevMonth = () => {
    if (month === 1) onMonthChange(year - 1, 12);
    else onMonthChange(year, month - 1);
  };
  const nextMonth = () => {
    if (month === 12) onMonthChange(year + 1, 1);
    else onMonthChange(year, month + 1);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center text-gray-400 cursor-pointer border-0 bg-transparent hover:text-gray-600 text-sm">&lt;</button>
        <span className="text-sm font-semibold text-gray-700">{year}年{month}月</span>
        <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center text-gray-400 cursor-pointer border-0 bg-transparent hover:text-gray-600 text-sm">&gt;</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 leading-none mb-1">
        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const checked = checkedDays.has(day);
          const isToday = isCurrentMonth && day === todayDate;
          const checkIn = checkInMap.get(day);
          return (
            <button
              key={day}
              onClick={() => checkIn && onDayClick?.(checkIn)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm border-0 ${
                checked ? 'bg-peach-500 text-white font-semibold shadow-sm' : 'bg-warm-50 text-gray-400'
              } ${isToday ? 'ring-2 ring-peach-400' : ''} ${checkIn ? 'cursor-pointer hover:bg-peach-400 hover:text-white transition-colors' : 'cursor-default'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
