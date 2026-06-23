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
  const invertedStress = 11 - stress;
  const weightedSum =
    sleep * 0.25 +
    energy * 0.25 +
    focus * 0.20 +
    motivation * 0.20 +
    invertedStress * 0.10;
  return Math.round(weightedSum * 10);
}
