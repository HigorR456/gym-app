import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/lib/theme';

import { FadeTruncatedText } from './FadeTruncatedText';
import { IconSwatch, type IconSwatchVariant } from './IconSwatch';

type Props = {
  name: string;
  // One line previewing e.g. the Workout's exercise names — rendered above
  // subtitle, truncated with a fade instead of wrapping/ellipsis.
  description?: string;
  subtitle?: string;
  // The Workout/Program's own icon (see lib/icons.ts) — shown to the left
  // of the title. Both must be given together or omitted together.
  iconId?: string;
  iconVariant?: IconSwatchVariant;
  onPress: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export function WorkoutCard({
  name,
  description,
  subtitle,
  iconId,
  iconVariant,
  onPress,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-surface-100 px-4 py-4"
    >
      {iconVariant ? (
        <View className="mr-3">
          <IconSwatch iconId={iconId} variant={iconVariant} size={36} />
        </View>
      ) : null}
      <View className="flex-1 pr-3">
        <Text className="text-text text-base font-medium">{name}</Text>
        {description ? (
          <FadeTruncatedText text={description} className="text-textMuted text-sm mt-1" />
        ) : null}
        {subtitle ? <Text className="text-textMuted text-sm mt-1">{subtitle}</Text> : null}
      </View>
      <View className="flex-row gap-4">
        {onDuplicate ? (
          <Pressable onPress={onDuplicate} hitSlop={8}>
            <FontAwesome6 name="copy" iconStyle="regular" color={theme.textMuted} size={18} />
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={8}>
            <FontAwesome6 name="trash" iconStyle="solid" color={theme.textMuted} size={18} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}
