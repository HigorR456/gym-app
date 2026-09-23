import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Pressable, Text, TextInput, View } from 'react-native';

import { theme } from '@/lib/theme';

// Structural, not imported from a feature — both the Workout editor's
// EditableSet and the session execution's SessionSet satisfy this shape
// (spec/features/workout.md and spec/features/workout-execution.md share
// the same weight/reps/duration/rest fields).
export type SetFields = {
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
};

type Props = {
  index: number;
  set: SetFields;
  onChange: (patch: Partial<SetFields>) => void;
  onRemove: () => void;
  // Session execution only (spec/features/workout-execution.md, "Sets":
  // "marking the set as completed") — omitted in the plain Workout editor,
  // where a set has no completion state.
  completed?: boolean;
  onToggleComplete?: () => void;
};

function toNumberOrNull(text: string): number | null {
  if (text.trim() === '') {
    return null;
  }
  const value = Number(text);
  return Number.isNaN(value) ? null : value;
}

function NumericField({
  value,
  onChangeText,
  placeholder,
}: {
  value: number | null;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <TextInput
      value={value === null ? '' : String(value)}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      keyboardType="numeric"
      className="flex-1 rounded-md bg-surface-100 px-2 py-1.5 text-text text-center"
    />
  );
}

// Shows both reps and duration fields rather than a mode toggle — a set has
// reps OR duration (spec/technical/data-model.md), but either can be left
// blank, so there's no need to force a choice in the UI.
export function SetRow({ index, set, onChange, onRemove, completed, onToggleComplete }: Props) {
  return (
    <View className="flex-row items-center gap-2 py-2">
      <Text className="text-textMuted w-6 text-center">{index + 1}</Text>
      <NumericField value={set.weight} onChangeText={(v) => onChange({ weight: toNumberOrNull(v) })} placeholder="kg" />
      <NumericField value={set.reps} onChangeText={(v) => onChange({ reps: toNumberOrNull(v) })} placeholder="reps" />
      <NumericField
        value={set.durationSeconds}
        onChangeText={(v) => onChange({ durationSeconds: toNumberOrNull(v) })}
        placeholder="sec"
      />
      <NumericField
        value={set.restSeconds}
        onChangeText={(v) => onChange({ restSeconds: toNumberOrNull(v) })}
        placeholder="rest"
      />
      {onToggleComplete ? (
        <Pressable onPress={onToggleComplete} hitSlop={8}>
          <FontAwesome6
            name="circle-check"
            iconStyle={completed ? 'solid' : 'regular'}
            color={completed ? theme.primary : theme.textMuted}
            size={18}
          />
        </Pressable>
      ) : null}
      <Pressable onPress={onRemove} hitSlop={8}>
        <FontAwesome6 name="xmark" iconStyle="solid" color={theme.textMuted} size={16} />
      </Pressable>
    </View>
  );
}
