import { cn } from '@shared/utils/cn';
import { useI18n } from './I18nProvider';
import type { AppLanguage } from './storage';

type LanguageSwitcherProps = {
  onSelect?: (language: AppLanguage) => void;
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({
  onSelect,
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();

  const handleSelect = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    onSelect?.(nextLanguage);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm',
        compact ? 'text-xs' : 'text-sm',
        className
      )}
      aria-label={t('common.language')}
    >
      {(['es', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleSelect(option)}
          className={cn(
            'rounded-full px-3 py-1.5 font-semibold transition',
            language === option
              ? 'bg-[var(--umss-brand)] text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
