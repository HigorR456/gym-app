import { Text, type TextProps } from 'react-native';

import { formatDuration } from '@/lib/duration';
import { useNowTick } from '@/lib/useNowTick';

type Props = TextProps & {
  startedAt: string;
};

// The session-wide timer (spec/features/workout-execution.md, "Starting a
// session": "immediately start a session-wide timer. This timer keeps
// running for the entire session") — independent of RestTimer (spec/
// technical/business-rules.md, rule 9), timestamp-based like it (rule 8):
// elapsed is always `now - startedAt`, never a value this component itself
// accumulates.
export function Timer({ startedAt, ...rest }: Props) {
  const now = useNowTick();
  const elapsedSeconds = (now - new Date(startedAt).getTime()) / 1000;

  return <Text {...rest}>{formatDuration(elapsedSeconds)}</Text>;
}
