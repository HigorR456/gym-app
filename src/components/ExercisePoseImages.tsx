import { useWindowDimensions, View } from 'react-native';

import { ExerciseImage } from '@/components/ExerciseImage';
import type { ExerciseImages } from '@/features/exercises/types';

const GAP = 8;
const FALLBACK_SIZE = 200;

type Props = {
  images: ExerciseImages;
  // Horizontal space already consumed by the screen's own padding (both
  // call sites use `px-4`, i.e. 16 on each side) — subtracted from the
  // window width so the pair of images fills exactly the remaining row.
  horizontalPadding?: number;
};

// Shows the exercise's start and peak position images side by side, large
// enough to fill the screen's width (spec/features/workout.md, "Exercise
// catalog (picker)", and spec/features/workout-execution.md, "Exercise
// information") — the dataset only ever has both or neither (see
// ExerciseImage.tsx), so an exercise with just a `main` image falls back to
// ExerciseImage's own single, smaller, centered rendering.
export function ExercisePoseImages({ images, horizontalPadding = 32 }: Props) {
  const { width: windowWidth } = useWindowDimensions();

  if (!images.start || !images.peak) {
    return (
      <View className="items-center">
        <ExerciseImage images={images} size={FALLBACK_SIZE} />
      </View>
    );
  }

  const size = (windowWidth - horizontalPadding - GAP) / 2;
  return (
    <View className="flex-row w-full">
      <ExerciseImage images={images} pose="start" size={size} style={{ marginRight: GAP }} />
      <ExerciseImage images={images} pose="peak" size={size} />
    </View>
  );
}
