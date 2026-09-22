import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  onDuplicate: () => void;
  onDuplicateWithWorkouts: () => void;
  onCancel: () => void;
};

// spec/features/program.md, "Duplicating a program": two clear options, the
// Workout-sharing one emphasized (contained button) and shown first, the
// Workout-copying one secondary/less emphasized. Reuses ConfirmationModal's
// visual language (centered card over a dim backdrop) instead of a third
// modal style.
export function DuplicateProgramModal({ visible, onDuplicate, onDuplicateWithWorkouts, onCancel }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full rounded-xl bg-surface p-5">
          <Text className="text-text text-lg font-semibold">{t('programs.duplicateTitle')}</Text>

          <Pressable onPress={onDuplicate} className="mt-4 rounded-lg bg-primary py-3 items-center">
            <Text className="text-background font-semibold">{t('programs.duplicateOption')}</Text>
          </Pressable>

          <Pressable onPress={onDuplicateWithWorkouts} className="mt-3 py-3 items-center">
            <Text className="text-text">{t('programs.duplicateWithWorkoutsOption')}</Text>
          </Pressable>

          <Pressable onPress={onCancel} className="py-2 items-center">
            <Text className="text-textMuted">{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
