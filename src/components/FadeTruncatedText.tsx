import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { theme } from '@/lib/theme';

type Props = {
  text: string;
  className?: string;
};

// A single line that fades into the background at the cut-off edge instead
// of an ellipsis — used wherever a row previews a comma-joined name list
// that may be longer than the row (WorkoutCard, programs' WorkoutPicker).
// Fades to theme.background specifically since every place this is used
// sits directly on that background.
export function FadeTruncatedText({ text, className }: Props) {
  return (
    <View>
      <Text className={className} numberOfLines={1} ellipsizeMode="clip">
        {text}
      </Text>
      <LinearGradient
        colors={['transparent', theme.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        pointerEvents="none"
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32 }}
      />
    </View>
  );
}
