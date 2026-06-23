import { IST_OFFSET_MINUTES } from './constants';

export function toIST(utcDate: Date): Date {
  return new Date(utcDate.getTime() + IST_OFFSET_MINUTES * 60000);
}

export function todayIST(): string {
  const istDate = toIST(new Date());
  return istDate.toISOString().split('T')[0];
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function computeReadinessScore(
  sleep: number,
  stress: number,
  energy: number,
  focus: number,
  motivation: number
): number {
  // Stress is inverted: 10 means high stress (bad), 1 means low stress (good).
  // So we convert stress to a positive contribution: 11 - stress.
  const invertedStress = 11 - stress;
  const total = sleep + invertedStress + energy + focus + motivation;
  // Max possible total = 50. Convert to a score out of 100.
  return Math.round((total / 50) * 100);
}
