import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary text-white',
  secondary: 'gradient-secondary',
  accent: 'gradient-accent',
};

export function StatCard({ title, value, icon, description, trend, variant = 'default' }: StatCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <Card className={cn('overflow-hidden transition-all hover:shadow-soft', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={cn('text-sm font-medium', isPrimary ? 'text-white/80' : 'text-muted-foreground')}>
              {title}
            </p>
            <p className={cn('text-3xl font-display font-bold', isPrimary ? 'text-white' : 'text-foreground')}>
              {value}
            </p>
            {description && (
              <p className={cn('text-xs', isPrimary ? 'text-white/70' : 'text-muted-foreground')}>
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive
                      ? isPrimary ? 'text-white' : 'text-success'
                      : isPrimary ? 'text-white' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className={cn('text-xs', isPrimary ? 'text-white/70' : 'text-muted-foreground')}>
                  from last month
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-xl',
              isPrimary ? 'bg-white/20' : 'bg-primary/10'
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
