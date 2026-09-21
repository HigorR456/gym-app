import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-xl bg-surface p-5">
          <Text className="text-text text-lg font-semibold">{title}</Text>
          {message ? <Text className="text-textMuted mt-2">{message}</Text> : null}
          <View className="flex-row justify-end gap-3 mt-5">
            <Pressable onPress={onCancel} className="px-4 py-2">
              <Text className="text-text">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`px-4 py-2 rounded-lg ${destructive ? 'bg-red-600' : 'bg-primary'}`}
            >
              <Text className={`font-semibold ${destructive ? 'text-white' : 'text-background'}`}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
