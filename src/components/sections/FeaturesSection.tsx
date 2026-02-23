import { cn } from '@/lib/utils';
import type { FeaturesContent, FeatureItem } from '@/types/sections';
import {
  Star,
  Zap,
  Shield,
  Heart,
  Target,
  Rocket,
  Globe,
  Lock,
  Award,
  Check,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface FeaturesSectionProps {
  content: FeaturesContent;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  target: Target,
  rocket: Rocket,
  globe: Globe,
  lock: Lock,
  award: Award,
  check: Check,
};

function FeatureIcon({ name }: { name: string }) {
  const IconComponent = iconMap[name.toLowerCase()] || Star;
  return <IconComponent className="h-6 w-6" />;
}

export function FeaturesSection({ content, className }: FeaturesSectionProps) {
  const { title, subtitle, items = [] } = content;
  const { ref, isVisible } = useScrollReveal();

  if (items.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className={cn(
            'text-center max-w-2xl mx-auto mb-12 reveal-hidden',
            isVisible && 'reveal-visible'
          )}>
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((feature: FeatureItem, idx: number) => (
            <div
              key={feature.id}
              className={cn(
                'text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
                'reveal-hidden',
                isVisible && 'reveal-visible',
                `stagger-${Math.min(idx + 1, 6)}`
              )}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              {feature.description && (
                <p className="text-muted-foreground">{feature.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
