import { CURRENCY_SYMBOL } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  originalPrice: number;
  sellingPrice: number;
  showSavings?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Price display component showing original, selling, and savings.
 * Savings are calculated from the provided server values — never from client input.
 */
export function PriceDisplay({
  originalPrice,
  sellingPrice,
  showSavings = true,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const savings = originalPrice - sellingPrice;
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const sizeClasses = {
    sm: { selling: 'text-base font-semibold', original: 'text-xs', savings: 'text-xs' },
    md: { selling: 'text-xl font-bold', original: 'text-sm', savings: 'text-sm' },
    lg: { selling: 'text-2xl font-bold', original: 'text-base', savings: 'text-base' },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn(s.selling, 'text-foreground')}>
          {CURRENCY_SYMBOL}{sellingPrice.toLocaleString()}
        </span>
        {originalPrice > sellingPrice && (
          <span className={cn(s.original, 'text-muted-foreground line-through')}>
            {CURRENCY_SYMBOL}{originalPrice.toLocaleString()}
          </span>
        )}
      </div>
      {showSavings && savings > 0 && (
        <span className={cn(s.savings, 'text-success font-medium')}>
          Save {CURRENCY_SYMBOL}{savings.toLocaleString()} ({savingsPercent}%)
        </span>
      )}
    </div>
  );
}
