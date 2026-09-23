import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { theme } from '@/lib/theme';

import { IconPicker } from './IconPicker';
import { IconSwatch, type IconSwatchVariant } from './IconSwatch';

type Props = {
  label: string;
  variant: IconSwatchVariant;
  selectedIconId: string;
  onSelect: (iconId: string) => void;
};

// Shows only the currently selected icon; tapping it opens the full catalog
// in a modal (spec/features/workout.md and spec/features/program.md, "Icon
// selection") instead of always showing the whole grid inline. Picking an
// icon there closes the modal immediately — same "tap to choose" pattern as
// ExerciseCatalog's row tap, not a separate confirm step.
export function IconPickerField({ label, variant, selectedIconId, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text className="text-textMuted text-sm mb-2">{label}</Text>
      <Pressable onPress={() => setOpen(true)}>
        <IconSwatch iconId={selectedIconId} variant={variant} size={44} />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <Screen className="flex-1 bg-background">
          <View className="flex-row items-center justify-end px-4 pb-2">
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <FontAwesome6 name="xmark" iconStyle="solid" color={theme.text} size={22} />
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="px-4 pb-8">
            <IconPicker
              variant={variant}
              selectedIconId={selectedIconId}
              onSelect={(iconId) => {
                onSelect(iconId);
                setOpen(false);
              }}
            />
          </ScrollView>
        </Screen>
      </Modal>
    </View>
  );
}
