import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/lib/theme';

type Props = {
  name: string;
  subtitle?: string;
  onPress: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
};

export function WorkoutCard({ name, subtitle, onPress, onDuplicate, onDelete }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-surface-100 px-4 py-4"
    >
      <View className="flex-1 pr-3">
        <Text className="text-text text-base font-medium">{name}</Text>
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
