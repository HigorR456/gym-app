import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Pressable, Text, TextInput, View } from 'react-native';

import type { EditableSet } from '@/features/workouts/hooks/useWorkoutEditor';
import { theme } from '@/lib/theme';

type Props = {
  index: number;
  set: EditableSet;
  onChange: (patch: Partial<EditableSet>) => void;
  onRemove: () => void;
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
export function SetRow({ index, set, onChange, onRemove }: Props) {
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
      <Pressable onPress={onRemove} hitSlop={8}>
        <FontAwesome6 name="xmark" iconStyle="solid" color={theme.textMuted} size={16} />
      </Pressable>
    </View>
  );
}
