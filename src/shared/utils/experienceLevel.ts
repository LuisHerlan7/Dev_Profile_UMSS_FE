export type ExperienceLevel = 'senior' | 'semi-senior' | 'junior';

export function normalizeExperienceLevel(raw?: string | null): ExperienceLevel {
  const value = String(raw ?? 'junior')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  if (value === 'senior') return 'senior';
  if (value === 'semi-senior' || value === 'semisenior') return 'semi-senior';
  return 'junior';
}

export function formatExperienceLevelLabel(level?: string | null): string {
  const normalized = normalizeExperienceLevel(level);
  return {
    senior: 'Senior',
    'semi-senior': 'Semi-Senior',
    junior: 'Junior',
  }[normalized];
}

export function experienceLevelBadgeClass(level?: string | null): string {
  const normalized = normalizeExperienceLevel(level);
  return `vp-level vp-level--${normalized.replace('-', '_')}`;
}
