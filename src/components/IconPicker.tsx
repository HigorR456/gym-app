import { Pressable, View } from 'react-native';

import { ICON_OPTIONS } from '@/lib/icons';

import { IconSwatch, type IconSwatchVariant } from './IconSwatch';

type Props = {
  variant: IconSwatchVariant;
  selectedIconId: string;
  onSelect: (iconId: string) => void;
};

// Icon grid for the Workout/Program creation forms (spec/features/workout.md
// and spec/features/program.md, "Icon selection"). `variant` only controls
// each swatch's colors (see IconSwatch) — the same fixed catalog is offered
// either way.
export function IconPicker({ variant, selectedIconId, onSelect }: Props) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {ICON_OPTIONS.map((icon) => {
        const selected = icon.id === selectedIconId;
        return (
          <Pressable
            key={icon.id}
            onPress={() => onSelect(icon.id)}
            className={`rounded-xl p-1 border-2 ${selected ? 'border-text' : 'border-transparent'}`}
          >
            <IconSwatch iconId={icon.id} variant={variant} size={44} />
          </Pressable>
        );
      })}
    </View>
  );
}
