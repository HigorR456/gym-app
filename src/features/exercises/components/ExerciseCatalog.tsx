import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseCard } from '@/components/ExerciseCard';
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
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 mr-2 ${active ? 'bg-primary' : 'bg-surface-100'}`}
    >
      <Text className={`text-sm capitalize ${active ? 'text-background' : 'text-text'}`}>
        {label.replace(/_/g, ' ')}
      </Text>
    </Pressable>
  );
}

export function ExerciseCatalog() {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const { exercises, filters, setFilters, filterOptions } = useExerciseCatalog();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  return (
    <View className="flex-1 bg-background">
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-2" contentContainerClassName="py-1">
          {filterOptions.bodyParts.map((bodyPart) => (
            <FilterChip
              key={bodyPart}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-2" contentContainerClassName="py-1">
          {filterOptions.equipment.map((equipment) => (
            <FilterChip
              key={equipment}
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

      <FlatList
        data={exercises}
        keyExtractor={(exercise) => exercise.id}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} language={language} onPress={() => setSelectedExercise(item)} />
        )}
        ListEmptyComponent={<EmptyState message={t('exercises.noResults')} />}
      />

      <ExerciseDetail
        exercise={selectedExercise}
        language={language}
        onClose={() => setSelectedExercise(null)}
      />
    </View>
  );
}
