import { Text, View } from 'react-native';

type Props = {
  message: string;
  // Used when this sits below other content (e.g. filters) instead of being
  // the only thing on screen — `flex-1 justify-center` would otherwise
  // stretch to fill whatever space is left and vertically center the
  // message in it, reading as a big empty gap above it.
  compact?: boolean;
};

export function EmptyState({ message, compact }: Props) {
  return (
    <View className={compact ? 'items-center px-6 py-12' : 'flex-1 items-center justify-center px-6 py-12'}>
      <Text className="text-textMuted text-center">{message}</Text>
    </View>
  );
}
