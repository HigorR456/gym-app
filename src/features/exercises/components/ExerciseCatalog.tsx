import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Screen } from '@/components/Screen';
import { Toast, type ToastData } from '@/components/Toast';
import type { Exercise } from '@/features/exercises/types';
import type { SupportedLanguage } from '@/i18n';
import { theme } from '@/lib/theme';

import { useExerciseCatalog } from '../hooks/useExerciseCatalog';
import { ExerciseDetail } from './ExerciseDetail';

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    // self-start + shrink-0/grow-0: without them, this Pressable is a flex
    // child of a `flex-row` ScrollView content container whose `alignItems`
    // defaults to `stretch`, letting it stretch to the row's cross-axis
    // size instead of hugging its own (small) content.
    //
    // Text color/content and the number of children here are deliberately
    // fixed regardless of `active` — only `borderColor` (an existing
    // element's own style) varies. On this device, the active chip's text
    // reproducibly failed to repaint correctly whenever the active/inactive
    // switch changed the Text's own color, or added/removed a sibling next
    // to it (a check icon), even though Yoga's layout was always correct
    // (confirmed via a UI dump) — some paint-on-restyle bug specific to
    // Text inside this horizontal ScrollView. Restyling the border only,
    // with the Text itself untouched, is what actually renders reliably.
    <Pressable
      onPress={onPress}
      className="self-start shrink-0 grow-0 rounded-full border px-3 py-2 mr-2 justify-center"
      style={{
        backgroundColor: theme.surface100,
        borderColor: active ? theme.primary : theme.surface100,
      }}
    >
      <Text className="text-sm leading-5 capitalize" style={{ color: theme.text }}>
        {label.replace(/_/g, ' ')}
      </Text>
    </Pressable>
  );
}

type Props = {
  // Picker mode: tapping an exercise adds it immediately instead of opening
  // the detail preview (see spec/features/workout.md). Omitted elsewhere
  // this is reused as a read-only browsable catalog.
  onSelect?: (exercise: Exercise) => void;
  // Ids already present in the target Workout, for the "already added"
  // indicator (see ExerciseCard) — only meaningful together with onSelect.
  addedExerciseIds?: string[];
  // Picker mode: tapping an already-added exercise's row removes it instead
  // of adding a duplicate (see spec/features/workout.md). Only meaningful
  // together with onSelect/addedExerciseIds.
  onDeselect?: (exercise: Exercise) => void;
  // Shown as a header X and a bottom "Done" button when this is presented
  // modally (picker mode keeps the catalog open across multiple adds, so it
  // needs its own explicit way back — see WorkoutEditor).
  onClose?: () => void;
};

export function ExerciseCatalog({ onSelect, addedExerciseIds, onDeselect, onClose }: Props = {}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const { exercises, filters, setFilters, filterOptions } = useExerciseCatalog();
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastIdRef = useRef(0);
  const addedIds = new Set(addedExerciseIds ?? []);

  // Not tied to filters/category state at all — only add/remove trigger it —
  // so switching tabs or toggling a filter chip can never restart or
  // interfere with whatever toast is showing.
  function showToast(message: string) {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message });
  }

  function handleAdd(exercise: Exercise) {
    onSelect?.(exercise);
    showToast(t('exercises.addedToast'));
  }

  function handleRemove(exercise: Exercise) {
    onDeselect?.(exercise);
    showToast(t('exercises.removedToast'));
  }

  function handleRowPress(exercise: Exercise) {
    if (addedIds.has(exercise.id)) {
      handleRemove(exercise);
    } else {
      handleAdd(exercise);
    }
  }

  return (
    <Screen className="flex-1 bg-background">
      {onClose ? (
        <View className="flex-row items-center justify-end px-4 pb-2">
          <Pressable onPress={onClose} hitSlop={12}>
            <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
          </Pressable>
        </View>
      ) : null}

      <View>
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center gap-2 rounded-lg bg-surface-100 px-3">
            <FontAwesome6 name="magnifying-glass" iconStyle="solid" color={theme.textMuted} size={16} />
            <TextInput
              value={filters.query ?? ''}
              onChangeText={(query) => setFilters((prev) => ({ ...prev, query: query || undefined }))}
              placeholder={t('exercises.searchPlaceholder')}
              placeholderTextColor={theme.textMuted}
              className="flex-1 py-2.5 text-text"
            />
          </View>
        </View>

        {filterOptions.bodyParts.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-2"
            contentContainerClassName="py-1 items-start"
          >
            {filterOptions.bodyParts.map((bodyPart) => (
              <FilterChip
                // Includes `active` on purpose — see the remount note in
                // FilterChip below.
                key={`${bodyPart}-${filters.bodyPart === bodyPart}`}
                label={bodyPart}
                active={filters.bodyPart === bodyPart}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    bodyPart: prev.bodyPart === bodyPart ? undefined : bodyPart,
                  }))
                }
              />
            ))}
          </ScrollView>
        )}

        {filterOptions.equipment.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 mb-2"
            contentContainerClassName="py-1 items-start"
          >
            {filterOptions.equipment.map((equipment) => (
              <FilterChip
                key={`${equipment}-${filters.equipment === equipment}`}
                label={equipment}
                active={filters.equipment === equipment}
                onPress={() =>
                  setFilters((prev) => ({
                    ...prev,
                    equipment: prev.equipment === equipment ? undefined : equipment,
                  }))
                }
              />
            ))}
          </ScrollView>
        )}
      </View>


      <FlatList
        data={exercises}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            language={language}
            added={addedIds.has(item.id)}
            onPress={() => (onSelect ? handleRowPress(item) : setDetailExercise(item))}
            onPressInfo={() => setDetailExercise(item)}
          />
        )}
        ListEmptyComponent={<EmptyState message={t('exercises.noResults')} compact />}
      />

      {onClose ? (
        <View className="px-4 pb-6 pt-2">
          <Pressable onPress={onClose} className="rounded-lg bg-primary py-3 items-center">
            <Text className="text-background font-semibold">{t('exercises.done')}</Text>
          </Pressable>
        </View>
      ) : null}

      <ExerciseDetail
        exercise={detailExercise}
        language={language}
        onClose={() => setDetailExercise(null)}
        onSelect={
          onSelect
            ? (exercise) => {
                handleAdd(exercise);
                setDetailExercise(null);
              }
            : undefined
        }
      />

      <Toast toast={toast} onHide={() => setToast(null)} />
    </Screen>
  );
}
