import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { EmptyState } from '@/components/EmptyState';
import { ExerciseImage } from '@/components/ExerciseImage';
import { Screen } from '@/components/Screen';
import { SetRow } from '@/components/SetRow';
import { ExerciseCatalog } from '@/features/exercises/components/ExerciseCatalog';
import type { SupportedLanguage } from '@/i18n';
import { pickLocalized } from '@/i18n/localizedText';
import { formatDuration } from '@/lib/duration';
import { theme } from '@/lib/theme';

import { useSessionExecution } from '../hooks/useSessionExecution';

type Props = {
  sessionId: string;
};

function Tag({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-surface-100 px-3 py-1">
      <Text className="text-textMuted text-xs capitalize">{label.replace(/_/g, ' ')}</Text>
    </View>
  );
}

// spec/features/workout-execution.md — the exercise execution screen: one
// exercise at a time, its sets, adding exercises/sets, and finishing.
export function SessionScreen({ sessionId }: Props) {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const router = useRouter();
  const {
    session,
    loading,
    exercises,
    total,
    exerciseIndex,
    currentExercise,
    goPrevious,
    goNext,
    updateSet,
    toggleSetCompleted,
    addSet,
    removeSet,
    addExercise,
    finish,
    discard,
  } = useSessionExecution(sessionId);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (loading || !session) {
    return <View className="flex-1 bg-background" />;
  }

  const completedExerciseCount = exercises.filter((e) => e.sets.length > 0 && e.sets.every((s) => s.completed)).length;
  const elapsedSeconds = (Date.now() - new Date(session.startedAt).getTime()) / 1000;

  async function handleFinish() {
    await finish();
    setConfirmFinish(false);
    router.back();
  }

  async function handleDiscard() {
    await discard();
    setConfirmDiscard(false);
    router.back();
  }

  return (
    <Screen className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Pressable onPress={() => setConfirmDiscard(true)}>
          <Text className="text-textMuted text-sm">{t('session.discardAction')}</Text>
        </Pressable>
        <Text className="text-text text-base font-medium">
          {total > 0 ? t('session.exerciseCounter', { current: exerciseIndex + 1, total }) : ''}
        </Text>
        <Pressable onPress={() => setConfirmFinish(true)} className="rounded-lg bg-primary px-3 py-2">
          <Text className="text-background font-semibold text-sm">{t('session.finishWorkout')}</Text>
        </Pressable>
      </View>

      {currentExercise ? (
        <ScrollView contentContainerClassName="px-4 pb-4">
          <View className="items-center">
            <ExerciseImage images={currentExercise.exercise.images} size={180} />
          </View>
          <Text className="text-text text-xl font-semibold mt-4">
            {pickLocalized(currentExercise.exercise.name, language)}
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {currentExercise.exercise.bodyPart ? <Tag label={currentExercise.exercise.bodyPart} /> : null}
            {currentExercise.exercise.equipment ? <Tag label={currentExercise.exercise.equipment} /> : null}
          </View>

          <View className="mt-6">
            {currentExercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                index={index}
                set={set}
                completed={set.completed}
                onToggleComplete={() => toggleSetCompleted(currentExercise.id, set.id)}
                onChange={(patch) => updateSet(currentExercise.id, set.id, patch)}
                onRemove={() => removeSet(currentExercise.id, set.id)}
              />
            ))}
            <Pressable onPress={() => addSet(currentExercise.id)} className="mt-2">
              <Text className="text-primary text-sm">{t('workouts.addSet')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <EmptyState message={t('session.noExercises')} />
      )}

      <View className="px-4 pb-2">
        <Pressable onPress={() => setCatalogOpen(true)} className="flex-row items-center justify-center gap-2 rounded-lg bg-surface py-3">
          <FontAwesome6 name="plus" iconStyle="solid" color={theme.primary} size={14} />
          <Text className="text-primary font-medium">{t('session.addExercise')}</Text>
        </Pressable>
      </View>

      <View className="flex-row border-t border-surface-100">
        <Pressable disabled={exerciseIndex === 0} onPress={goPrevious} className="flex-1 items-center py-4">
          <Text className={exerciseIndex === 0 ? 'text-textMuted' : 'text-primary'}>← {t('session.previous')}</Text>
        </Pressable>
        <Pressable disabled={exerciseIndex >= total - 1} onPress={goNext} className="flex-1 items-center py-4">
          <Text className={exerciseIndex >= total - 1 ? 'text-textMuted' : 'text-primary'}>{t('session.next')} →</Text>
        </Pressable>
      </View>

      <Modal visible={catalogOpen} animationType="slide" onRequestClose={() => setCatalogOpen(false)}>
        <ExerciseCatalog
          onSelect={(exercise) => {
            void addExercise(exercise);
          }}
          onClose={() => setCatalogOpen(false)}
        />
      </Modal>

      <ConfirmationModal
        visible={confirmFinish}
        title={t('session.finishTitle')}
        message={t('session.finishMessage', {
          completed: completedExerciseCount,
          total,
          duration: formatDuration(elapsedSeconds),
        })}
        confirmLabel={t('session.finishConfirm')}
        cancelLabel={t('session.finishCancel')}
        onConfirm={handleFinish}
        onCancel={() => setConfirmFinish(false)}
      />

      <ConfirmationModal
        visible={confirmDiscard}
        title={t('session.discardTitle')}
        message={t('session.discardMessage')}
        confirmLabel={t('session.discardConfirm')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={handleDiscard}
        onCancel={() => setConfirmDiscard(false)}
      />
    </Screen>
  );
}
