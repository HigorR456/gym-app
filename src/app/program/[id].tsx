import { useLocalSearchParams } from 'expo-router';

import { ProgramEditor } from '@/features/programs/components/ProgramEditor';

// "new" is not a real id — it's the create-program entry point (mirrors
// app/workout/[id].tsx); anything else edits that existing Program.
export default function ProgramEditorRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProgramEditor programId={id === 'new' ? undefined : id} />;
}
