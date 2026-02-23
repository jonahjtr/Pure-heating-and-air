import { 
  Snowflake, 
  Flame, 
  Wind, 
  Wrench, 
  ThermometerSun, 
  Fan,
  Shield,
  Clock,
  Settings,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
}

export interface ServicesGridContent {
  title: string;
  subtitle: string;
  items: ServiceItem[];
  columns: '2' | '3' | '4';
}

interface ServicesGridSectionProps {
  content: ServicesGridContent;
}

const iconMap: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  flame: Flame,
  wind: Wind,
  wrench: Wrench,
  thermometer: ThermometerSun,
  fan: Fan,
  shield: Shield,
  clock: Clock,
  settings: Settings,
};

export function ServicesGridSection({ content }: ServicesGridSectionProps) {
  const columns = content.columns || '3';
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className={cn(
            'text-center mb-12 reveal-hidden',
            isVisible && 'reveal-visible'
          )}>
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div
          className={cn(
            'grid gap-6',
            columns === '2' && 'md:grid-cols-2',
            columns === '3' && 'md:grid-cols-2 lg:grid-cols-3',
            columns === '4' && 'md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {content.items?.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Settings;
            
            return (
              <a
                key={item.id}
                href={item.link || '#'}
                className={cn(
                  'group bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-accent/20',
                  'reveal-scale-hidden',
                  isVisible && 'reveal-scale-visible',
                  `stagger-${Math.min(idx + 1, 6)}`
                )}
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors group-hover:animate-float">
                  <IconComponent className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
