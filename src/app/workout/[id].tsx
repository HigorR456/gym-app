import { useLocalSearchParams } from 'expo-router';

import { WorkoutEditor } from '@/features/workouts/components/WorkoutEditor';

// "new" is not a real id — it's the create-workout entry point (see
// spec/features/workout.md); anything else edits that existing Workout.
export default function WorkoutEditorRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <WorkoutEditor workoutId={id === 'new' ? undefined : id} />;
}
