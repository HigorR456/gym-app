import { addDaysToLocalDate, daysBetweenLocalDates, secondsBetween, toLocalDateString } from './date';

describe('toLocalDateString', () => {
  it('zero-pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('addDaysToLocalDate', () => {
  it('adds days within the same month', () => {
    expect(addDaysToLocalDate('2026-03-10', 3)).toBe('2026-03-13');
  });

  it('rolls over a month boundary', () => {
    expect(addDaysToLocalDate('2026-01-30', 3)).toBe('2026-02-02');
  });

  it('rolls over a year boundary', () => {
    expect(addDaysToLocalDate('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('handles a leap day', () => {
    expect(addDaysToLocalDate('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDaysToLocalDate('2028-02-29', 1)).toBe('2028-03-01');
  });

  it('subtracts days with a negative count', () => {
    expect(addDaysToLocalDate('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('daysBetweenLocalDates', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetweenLocalDates('2026-03-10', '2026-03-10')).toBe(0);
  });

  it('returns a positive count when `to` is after `from`', () => {
    expect(daysBetweenLocalDates('2026-03-10', '2026-03-15')).toBe(5);
  });

  it('returns a negative count when `to` is before `from`', () => {
    expect(daysBetweenLocalDates('2026-03-15', '2026-03-10')).toBe(-5);
  });

  it('is consistent with addDaysToLocalDate across a month boundary', () => {
    expect(daysBetweenLocalDates('2026-01-30', '2026-02-02')).toBe(3);
  });
});

describe('secondsBetween', () => {
  it('converts a millisecond span to seconds', () => {
    expect(secondsBetween(0, 5_000)).toBe(5);
  });

  it('returns a negative value when `toMs` precedes `fromMs`', () => {
    expect(secondsBetween(5_000, 0)).toBe(-5);
  });

  it('supports fractional seconds', () => {
    expect(secondsBetween(0, 1_500)).toBe(1.5);
  });
});
