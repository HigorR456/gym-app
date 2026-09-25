import { useLocalSearchParams } from 'expo-router';

import { SessionScreen } from '@/features/session/screen/SessionScreen';

export default function SessionRoute() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <SessionScreen sessionId={sessionId} />;
}
