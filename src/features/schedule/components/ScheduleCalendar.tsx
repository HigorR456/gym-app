import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useScheduleCalendarMonth, type CalendarDayFill } from '@/features/schedule/hooks/useScheduleCalendarMonth';
import type { ActiveSchedule } from '@/features/schedule/types';
import { todayLocalDate } from '@/lib/date';
import { theme } from '@/lib/theme';

type Props = {
  schedule: ActiveSchedule | null;
};

const FILL_COLOR: Record<CalendarDayFill, string> = {
  lightYellow: theme.primaryLight,
  yellow: theme.primary,
  darkYellow: theme.primaryDark,
  black: theme.surface100,
};

// A single month grid with heatmap fill per day (spec/features/schedule.md,
// "Calendar heatmap") — a plain custom grid rather than a calendar library,
// since a 7-column month grid with cell coloring doesn't need one.
export function ScheduleCalendar({ schedule }: Props) {
  const { t } = useTranslation();
  const today = todayLocalDate();
  const [cursor, setCursor] = useState(() => {
    const [year, month] = today.split('-').map(Number);
    return { year, month: month - 1 };
  });

  const { days } = useScheduleCalendarMonth(schedule, cursor.year, cursor.month);
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  function goToMonth(delta: number) {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View>
      <View className="flex-row items-center justify-between px-1 mb-3">
        <Pressable onPress={() => goToMonth(-1)} hitSlop={8}>
          <FontAwesome6 name="chevron-left" iconStyle="solid" color={theme.text} size={16} />
        </Pressable>
        <Text className="text-text font-semibold capitalize">{monthLabel}</Text>
        <Pressable onPress={() => goToMonth(1)} hitSlop={8}>
          <FontAwesome6 name="chevron-right" iconStyle="solid" color={theme.text} size={16} />
        </Pressable>
      </View>

      <View className="flex-row">
        {weekdayLabels.map((label, index) => (
          <View key={index} className="flex-1 items-center py-1">
            <Text className="text-textMuted text-xs">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: firstWeekday }).map((_, index) => (
          <View key={`pad-${index}`} style={{ width: `${100 / 7}%` }} className="aspect-square p-0.5" />
        ))}
        {days.map((day) => (
          <View key={day.date} style={{ width: `${100 / 7}%` }} className="aspect-square p-0.5">
            <View
              className="flex-1 items-center justify-center rounded-md"
              style={{
                backgroundColor: FILL_COLOR[day.fill],
                borderWidth: day.outline ? 1.5 : 0,
                borderColor: theme.primary,
              }}
            >
              <Text className={day.fill === 'black' ? 'text-textMuted text-xs' : 'text-background text-xs font-medium'}>
                {day.dayOfMonth}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap gap-4 mt-4">
        <LegendItem color={theme.primaryLight} label={t('schedule.legendMultiple')} />
        <LegendItem color={theme.primary} label={t('schedule.legendOne')} />
        <LegendItem color={theme.primaryDark} label={t('schedule.legendRest')} />
        <LegendItem color={theme.surface100} label={t('schedule.legendNone')} />
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
      <Text className="text-textMuted text-xs">{label}</Text>
    </View>
  );
}
