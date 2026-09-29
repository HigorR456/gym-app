import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTranslation } from 'react-i18next';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { discardSession } from '@/data/sqlite/repositories/sessionRepository';
import { secondsBetween } from '@/lib/date';
import { formatDuration } from '@/lib/duration';

import { useSessionRecovery } from '../hooks/useSessionRecovery';

// Mounted once at the app root (src/app/_layout.tsx), alongside the
// schedule reconciliation check — spec/features/workout-execution.md,
// "Resuming or discarding an in-progress session": offers to resume
// directly on the exercise screen, or discard it (this modal doubles as
// the "confirmation popup" that action requires).
export function SessionRecoveryPrompt() {
  const { t } = useTranslation();
  const router = useRouter();
  const db = useSQLiteContext();
  const { pending, dismiss } = useSessionRecovery();

  const message = pending
    ? pending.workoutName
      ? t('session.recoveryMessageNamed', {
          workoutName: pending.workoutName,
          duration: formatDuration(secondsBetween(new Date(pending.startedAt).getTime(), Date.now())),
        })
      : t('session.recoveryMessageGeneric', {
          duration: formatDuration(secondsBetween(new Date(pending.startedAt).getTime(), Date.now())),
        })
    : undefined;

  async function handleDiscard() {
    if (!pending) {
      return;
    }
    await discardSession(db, pending.id);
    dismiss();
  }

  function handleResume() {
    if (!pending) {
      return;
    }
    const sessionId = pending.id;
    dismiss();
    router.push(`/session/${sessionId}`);
  }

  return (
    <ConfirmationModal
      visible={pending !== null}
      title={t('session.recoveryTitle')}
      message={message}
      confirmLabel={t('session.resumeAction')}
      cancelLabel={t('session.discardAction')}
      onConfirm={handleResume}
      onCancel={() => void handleDiscard()}
    />
  );
}
