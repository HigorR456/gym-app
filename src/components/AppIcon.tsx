import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { FontAwesome6 } from '@react-native-vector-icons/fontawesome6';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { SimpleLineIcons } from '@react-native-vector-icons/simple-line-icons';
import type { ComponentProps } from 'react';

import { getIconOption } from '@/lib/icons';

type Props = {
  iconId: string | null | undefined;
  size: number;
  color: string;
};

// Renders the bare glyph for a catalog icon id (see lib/icons.ts) — falls
// back to the default icon rather than rendering nothing if iconId is
// missing/unrecognized (e.g. data saved before this catalog changes).
//
// Each vector-icon component types `name` as a strict per-family string
// literal union, not `string` — the casts below are safe because
// lib/icons.ts's ICON_OPTIONS entries were checked against each family's
// actual glyph map, but TS can't verify that itself across this generic
// dispatch.
export function AppIcon({ iconId, size, color }: Props) {
  const icon = getIconOption(iconId);
  switch (icon.family) {
    case 'ionicons':
      return <Ionicons name={icon.name as ComponentProps<typeof Ionicons>['name']} size={size} color={color} />;
    case 'material-design-icons':
      return (
        <MaterialDesignIcons
          name={icon.name as ComponentProps<typeof MaterialDesignIcons>['name']}
          size={size}
          color={color}
        />
      );
    case 'fontawesome5':
      // FontAwesome5/6's exported `name` type is internally inconsistent
      // for this kind of dynamic extraction (ComponentProps<> resolves a
      // wider union — including non-glyph keys like "meta"/"line" leaked
      // from the underlying glyph-map JSON — than the component's own
      // declared prop type actually accepts). `as never` is the standard,
      // narrowly-scoped escape hatch for a single prop value here, instead
      // of a blanket `any` or fighting the library's overload resolution.
      return <FontAwesome5 name={icon.name as never} iconStyle="solid" size={size} color={color} />;
    case 'fontawesome6':
      return <FontAwesome6 name={icon.name as never} iconStyle="solid" size={size} color={color} />;
    case 'material-icons':
      return (
        <MaterialIcons name={icon.name as ComponentProps<typeof MaterialIcons>['name']} size={size} color={color} />
      );
    case 'simple-line-icons':
      return (
        <SimpleLineIcons
          name={icon.name as ComponentProps<typeof SimpleLineIcons>['name']}
          size={size}
          color={color}
        />
      );
  }
}
