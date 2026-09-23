import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { computeScheduleHistory, findSessionCountsByDate } from '@/data/sqlite/repositories/scheduleRepository';
import { projectDay, type ScheduleDayInfo, type ScheduleProgram } from '@/domain/schedule';
import type { ActiveSchedule } from '@/features/schedule/types';
import { toLocalDateString, todayLocalDate } from '@/lib/date';

export type CalendarDayFill = 'lightYellow' | 'yellow' | 'darkYellow' | 'black';

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  fill: CalendarDayFill;
  // "Future coverage" outline (spec/features/schedule.md, "Calendar
  // heatmap") — only meaningful on top of a black fill.
  outline: boolean;
};

function toScheduleProgram(schedule: ActiveSchedule): ScheduleProgram {
  return { days: schedule.days.map((day) => ({ position: day.position, type: day.workout ? 'workout' : 'rest' })) };
}

// Builds one month's worth of heatmap cells (spec/features/schedule.md,
// "Calendar heatmap"): fill color is driven by *actual* session counts
// first, falling back to the schedule's plan (real history for past dates,
// an optimistic projection for future ones) only to tell a rest day from a
// truly unscheduled/pending one.
export function useScheduleCalendarMonth(schedule: ActiveSchedule | null, year: number, month: number) {
  const db = useSQLiteContext();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const lastOfMonth = new Date(year, month + 1, 0);
      const fromDate = toLocalDateString(new Date(year, month, 1));
      const toDate = toLocalDateString(lastOfMonth);
      const today = todayLocalDate();

      const [sessionCounts, history] = await Promise.all([
        findSessionCountsByDate(db, fromDate, toDate),
        schedule ? computeScheduleHistory(db, today) : Promise.resolve<ScheduleDayInfo[]>([]),
      ]);
      if (cancelled) {
        return;
      }

      const historyByDate = new Map(history.map((day) => [day.date, day]));
      const scheduleProgram = schedule ? toScheduleProgram(schedule) : null;

      const daysInMonth = lastOfMonth.getDate();
      const result: CalendarDay[] = [];
      for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
        const date = toLocalDateString(new Date(year, month, dayOfMonth));
        const sessionCount = sessionCounts.get(date) ?? 0;

        let dayInfo: ScheduleDayInfo | null = historyByDate.get(date) ?? null;
        if (!dayInfo && schedule && scheduleProgram) {
          dayInfo =
            date === schedule.currentDay.date ? schedule.currentDay : projectDay(schedule.state, scheduleProgram, date);
        }

        let fill: CalendarDayFill = 'black';
        if (sessionCount > 1) {
          fill = 'lightYellow';
        } else if (sessionCount === 1) {
          fill = 'yellow';
        } else if (dayInfo?.type === 'rest') {
          fill = 'darkYellow';
        }

        const outline = fill === 'black' && dayInfo !== null && date > today;

        result.push({ date, dayOfMonth, fill, outline });
      }

      setDays(result);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [db, schedule, year, month]);

  return { days, loading };
}
