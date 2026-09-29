import { createScheduleState, describeCurrentDay, projectDay, reconcileSchedule, skipCurrentDay } from './cycle';
import type { HasCheckout, ScheduleProgram } from './types';

// workout, rest, workout — a 3-day cycle with one rest day, matching the
// shapes reconcileSchedule/skipCurrentDay/projectDay actually branch on.
const PROGRAM: ScheduleProgram = {
  days: [
    { position: 0, type: 'workout' },
    { position: 1, type: 'rest' },
    { position: 2, type: 'workout' },
  ],
};

function hasCheckoutOn(...dates: string[]): HasCheckout {
  const set = new Set(dates);
  return (date) => set.has(date);
}

describe('createScheduleState', () => {
  it('starts pending on the start day itself', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    expect(state).toEqual({
      status: 'active',
      startDate: '2026-01-01',
      startDayPosition: 0,
      endDate: null,
      currentCyclePosition: 0,
      pendingSinceDate: '2026-01-01',
    });
  });
});

describe('reconcileSchedule', () => {
  it('does not advance past an unresolved workout day, even when today has moved on', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    const result = reconcileSchedule(state, PROGRAM, '2026-01-01', hasCheckoutOn());

    expect(result.resolvedDays).toEqual([]);
    expect(result.state).toEqual(state);
  });

  it('auto-completes an elapsed rest day without a checkout', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 1, endDate: null });
    const result = reconcileSchedule(state, PROGRAM, '2026-01-05', hasCheckoutOn());

    expect(result.resolvedDays).toEqual([
      { date: '2026-01-01', position: 1, type: 'rest', state: 'rest', overdue: false },
    ]);
    expect(result.state.currentCyclePosition).toBe(2);
    expect(result.state.pendingSinceDate).toBe('2026-01-02');
  });

  it('does not resolve a rest day dated today or later', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 1, endDate: null });
    const result = reconcileSchedule(state, PROGRAM, '2026-01-01', hasCheckoutOn());

    expect(result.resolvedDays).toEqual([]);
    expect(result.state).toEqual(state);
  });

  it('produces a cumulative slide: a missed checkout freezes the pointer, so later days never get dated', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    // Day 0 (workout) is checked out; day 1 (rest) has since elapsed; day 2
    // (workout) is never checked out, even though "today" is far ahead.
    const result = reconcileSchedule(state, PROGRAM, '2026-01-05', hasCheckoutOn('2026-01-01'));

    expect(result.resolvedDays).toEqual([
      { date: '2026-01-01', position: 0, type: 'workout', state: 'completed', overdue: false },
      { date: '2026-01-02', position: 1, type: 'rest', state: 'rest', overdue: false },
    ]);
    // The stuck workout day keeps the pointer here, not at some
    // start-date + N*position projection of "today".
    expect(result.state.currentCyclePosition).toBe(2);
    expect(result.state.pendingSinceDate).toBe('2026-01-03');
  });

  it('stops resolving once past the schedule end date, even with checkouts available', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: '2026-01-02' });
    const result = reconcileSchedule(
      state,
      PROGRAM,
      '2026-01-10',
      hasCheckoutOn('2026-01-01', '2026-01-03'),
    );

    // Day 0 (workout, checked out) and day 1 (rest, elapsed) fall within
    // endDate; day 2 (workout) is dated past endDate and never resolves,
    // regardless of its checkout.
    expect(result.resolvedDays).toEqual([
      { date: '2026-01-01', position: 0, type: 'workout', state: 'completed', overdue: false },
      { date: '2026-01-02', position: 1, type: 'rest', state: 'rest', overdue: false },
    ]);
    expect(result.state.pendingSinceDate).toBe('2026-01-03');
  });
});

describe('describeCurrentDay', () => {
  it('reports a rest day regardless of its date relative to today', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 1, endDate: null });
    expect(describeCurrentDay(state, PROGRAM, '2026-01-10')).toEqual({
      date: '2026-01-01',
      position: 1,
      type: 'rest',
      state: 'rest',
      overdue: false,
    });
  });

  it('reports a future workout day as planned', () => {
    const state = createScheduleState({ startDate: '2026-01-05', startDayPosition: 0, endDate: null });
    expect(describeCurrentDay(state, PROGRAM, '2026-01-01')).toEqual({
      date: '2026-01-05',
      position: 0,
      type: 'workout',
      state: 'planned',
      overdue: false,
    });
  });

  it('reports today\'s workout day as pending, not overdue', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    expect(describeCurrentDay(state, PROGRAM, '2026-01-01')).toEqual({
      date: '2026-01-01',
      position: 0,
      type: 'workout',
      state: 'pending',
      overdue: false,
    });
  });

  it('reports a past, unresolved workout day as pending and overdue', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    expect(describeCurrentDay(state, PROGRAM, '2026-01-04')).toEqual({
      date: '2026-01-01',
      position: 0,
      type: 'workout',
      state: 'pending',
      overdue: true,
    });
  });
});

describe('skipCurrentDay', () => {
  it('throws when the pending day is a rest day', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 1, endDate: null });
    expect(() => skipCurrentDay(state, PROGRAM, '2026-01-01', hasCheckoutOn())).toThrow();
  });

  it('marks the pending workout day skipped and advances the pointer', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    const result = skipCurrentDay(state, PROGRAM, '2026-01-01', hasCheckoutOn());

    expect(result.resolvedDays).toEqual([
      { date: '2026-01-01', position: 0, type: 'workout', state: 'skipped', overdue: false },
    ]);
    expect(result.state.currentCyclePosition).toBe(1);
    expect(result.state.pendingSinceDate).toBe('2026-01-02');
  });

  it('continues reconciling right after the skip, resolving whatever that immediately exposes', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    const result = skipCurrentDay(state, PROGRAM, '2026-01-05', hasCheckoutOn());

    expect(result.resolvedDays).toEqual([
      { date: '2026-01-01', position: 0, type: 'workout', state: 'skipped', overdue: false },
      { date: '2026-01-02', position: 1, type: 'rest', state: 'rest', overdue: false },
    ]);
    expect(result.state.currentCyclePosition).toBe(2);
    expect(result.state.pendingSinceDate).toBe('2026-01-03');
  });
});

describe('projectDay', () => {
  it('returns null for a date before the pending day', () => {
    const state = createScheduleState({ startDate: '2026-01-05', startDayPosition: 0, endDate: null });
    expect(projectDay(state, PROGRAM, '2026-01-01')).toBeNull();
  });

  it('projects the pending day itself', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    expect(projectDay(state, PROGRAM, '2026-01-01')).toEqual({
      date: '2026-01-01',
      position: 0,
      type: 'workout',
      state: 'planned',
      overdue: false,
    });
  });

  it('projects a future date by walking the cycle forward from the pending day', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: null });
    // 3 days ahead, cycle length 3 -> wraps back to position 0.
    expect(projectDay(state, PROGRAM, '2026-01-04')).toEqual({
      date: '2026-01-04',
      position: 0,
      type: 'workout',
      state: 'planned',
      overdue: false,
    });
    // 1 day ahead -> position 1 (rest).
    expect(projectDay(state, PROGRAM, '2026-01-02')).toEqual({
      date: '2026-01-02',
      position: 1,
      type: 'rest',
      state: 'planned',
      overdue: false,
    });
  });

  it('returns null for a date past the schedule end date', () => {
    const state = createScheduleState({ startDate: '2026-01-01', startDayPosition: 0, endDate: '2026-01-02' });
    expect(projectDay(state, PROGRAM, '2026-01-03')).toBeNull();
    expect(projectDay(state, PROGRAM, '2026-01-02')).not.toBeNull();
  });
});
