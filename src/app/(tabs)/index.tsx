import { ExerciseCatalog } from '@/features/exercises/components/ExerciseCatalog';

// Temporarily shows the exercise catalog here so it's reachable/testable
// (implementation-roadmap.md step 7). step 8 (Workout CRUD) replaces this
// with the real Workout list, and reuses ExerciseCatalog as the "add
// exercises" picker instead (see spec/features/workout.md).
export default function WorkoutScreen() {
  return <ExerciseCatalog />;
}
