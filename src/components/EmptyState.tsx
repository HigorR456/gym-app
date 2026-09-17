import { Text, View } from 'react-native';

type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <Text className="text-textMuted text-center">{message}</Text>
    </View>
  );
}
