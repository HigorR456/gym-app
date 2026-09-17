import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useState } from 'react';
import { Image, type ImageStyle, type StyleProp, View } from 'react-native';

import { exerciseImages } from '@/data/sqlite/seed/exerciseImages.generated';
import type { ExerciseImages } from '@/features/exercises/types';
import { theme } from '@/lib/theme';

type Props = {
  images: ExerciseImages;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

function pickImageKey(images: ExerciseImages): string | undefined {
  return images.start ?? images.main ?? images.peak;
}

// Falls back to a generic placeholder both when there's no image key at all
// and when the resolved image fails to load — see
// spec/features/workout-execution.md, "Exercise information".
export function ExerciseImage({ images, size = 56, style }: Props) {
  const [failed, setFailed] = useState(false);
  const key = pickImageKey(images);
  const source = key ? exerciseImages[key] : undefined;

  if (!source || failed) {
    return (
      <View
        style={[{ width: size, height: size, borderRadius: 8 }, style]}
        className="items-center justify-center bg-surface-100"
      >
        <FontAwesome6 name="image" iconStyle="regular" color={theme.textMuted} size={size * 0.4} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={[{ width: size, height: size, borderRadius: 8 }, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
