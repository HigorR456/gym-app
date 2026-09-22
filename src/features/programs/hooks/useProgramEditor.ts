import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import {
  createProgram,
  findProgramById,
  updateProgram,
  type ProgramInput,
} from '@/data/sqlite/repositories/programRepository';
import type { ProgramDayWorkout } from '@/features/programs/types';
import { generateId } from '@/lib/id';

export type EditableDay = {
  id: string;
  // null = rest day (see features/programs/types.ts).
  workout: ProgramDayWorkout | null;
};

// Manages the in-progress edit state for both creating and editing a
// Program (spec/features/program.md) — mirrors useWorkoutEditor.ts. Nothing
// is written to SQLite until save() is called.
export function useProgramEditor(programId: string | undefined) {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<EditableDay[]>([]);
  const [loading, setLoading] = useState(!!programId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!programId) {
      return;
    }
    let cancelled = false;
    findProgramById(db, programId).then((program) => {
      if (!cancelled && program) {
        setName(program.name);
        setDescription(program.description ?? '');
        setDays(program.days.map((day) => ({ id: day.id, workout: day.workout })));
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, programId]);

  // "Add rest" — appended directly as a rest day, no picker involved.
  function addDay() {
    setDays((prev) => [...prev, { id: generateId(), workout: null }]);
  }

  // "Add workout" — the picker selection itself creates the day (see
  // ProgramEditor), instead of adding a blank/rest day first and requiring a
  // second "assign workout" step.
  function addWorkoutDay(workout: ProgramDayWorkout) {
    setDays((prev) => [...prev, { id: generateId(), workout }]);
  }

  function removeDay(dayLocalId: string) {
    setDays((prev) => prev.filter((d) => d.id !== dayLocalId));
  }

  function setDayWorkout(dayLocalId: string, workout: ProgramDayWorkout | null) {
    setDays((prev) => prev.map((d) => (d.id === dayLocalId ? { ...d, workout } : d)));
  }

  function moveDay(dayLocalId: string, direction: -1 | 1) {
    setDays((prev) => {
      const index = prev.findIndex((d) => d.id === dayLocalId);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  async function save(): Promise<string> {
    setSaving(true);
    try {
      const input: ProgramInput = {
        name: name.trim(),
        description: description.trim() || null,
        days: days.map((d) => ({ workoutId: d.workout?.id ?? null })),
      };
      if (programId) {
        await updateProgram(db, programId, input);
        return programId;
      }
      return await createProgram(db, input);
    } finally {
      setSaving(false);
    }
  }

  const canSave = name.trim().length > 0;

  return {
    name,
    setName,
    description,
    setDescription,
    days,
    loading,
    saving,
    canSave,
    addDay,
    addWorkoutDay,
    removeDay,
    setDayWorkout,
    moveDay,
    save,
  };
}
