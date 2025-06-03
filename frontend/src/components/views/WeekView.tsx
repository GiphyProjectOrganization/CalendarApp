import React from "react";
import { generateHours } from "../../services/calendarService";

interface WeekViewProps {
  startDate?: Date;
}

export function WeekView({ startDate = new Date() }: WeekViewProps) {
    const hours = generateHours();

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        d.setDate(d.getDate() + diff);
        return d;
    };

    const weekStart = getWeekStart(startDate);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });
    
    return (
    <div className="max-w-5xl mx-auto p-4 bg-white-100">
      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))]">
        <div></div>
        {days.map((date, idx) => (
          <div key={idx} className="text-center py-2 font-semibold border-b border-base-300">
            {date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
          </div>
        ))}

        {hours.map((hour, idx) => (
          <React.Fragment key={idx}>
            <div className="text-sm text-right pr-2 py-2 border-r border-base-300 text-base-content">
              {hour}
            </div>

            {days.map((_, dayIdx) => (
              <div
                key={dayIdx}
                className="h-10 border-b border-l border-base-300 hover:bg-base-200 transition-colors"
              ></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}