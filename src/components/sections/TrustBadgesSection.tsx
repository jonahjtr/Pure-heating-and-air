import { Award, Star, Shield, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface TrustBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
}

export interface TrustBadgesContent {
  title: string;
  subtitle: string;
  badges: TrustBadge[];
  layout: 'row' | 'grid';
  background: 'light' | 'dark' | 'primary';
}

interface TrustBadgesSectionProps {
  content: TrustBadgesContent;
}

const iconMap: Record<string, React.ReactNode> = {
  award: <Award className="w-10 h-10" />,
  star: <Star className="w-10 h-10" />,
  shield: <Shield className="w-10 h-10" />,
  thumbsup: <ThumbsUp className="w-10 h-10" />,
};

export function TrustBadgesSection({ content }: TrustBadgesSectionProps) {
  const layout = content.layout || 'row';
  const background = content.background || 'light';
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        'py-12 lg:py-16',
        background === 'light' && 'bg-white',
        background === 'dark' && 'bg-foreground text-white',
        background === 'primary' && 'bg-primary text-white'
      )}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className={cn(
            'text-center mb-10 reveal-hidden',
            isVisible && 'reveal-visible'
          )}>
            {content.title && (
              <h2
                className={cn(
                  'text-2xl md:text-3xl font-bold mb-2',
                  background === 'light' && 'text-foreground',
                  (background === 'dark' || background === 'primary') && 'text-white'
                )}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p
                className={cn(
                  'text-lg',
                  background === 'light' && 'text-muted-foreground',
                  (background === 'dark' || background === 'primary') && 'text-white/80'
                )}
              >
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Badges */}
        <div
          className={cn(
            layout === 'row' && 'flex flex-wrap justify-center items-center gap-8 lg:gap-12',
            layout === 'grid' && 'grid grid-cols-2 md:grid-cols-4 gap-6'
          )}
        >
          {content.badges?.map((badge, idx) => (
            <div
              key={badge.id}
              className={cn(
                'flex flex-col items-center text-center',
                layout === 'row' && 'max-w-[150px]',
                'reveal-scale-hidden',
                isVisible && 'reveal-scale-visible',
                `stagger-${Math.min(idx + 1, 6)}`
              )}
            >
              {badge.image?.url ? (
                <img
                  src={badge.image.url}
                  alt={badge.image.alt || badge.title}
                  className="h-16 w-auto mb-3 object-contain"
                />
              ) : (
                <div
                  className={cn(
                    'mb-3',
                    background === 'light' && 'text-accent',
                    (background === 'dark' || background === 'primary') && 'text-white'
                  )}
                >
                  {iconMap[badge.icon] || iconMap.award}
                </div>
              )}
              <h3
                className={cn(
                  'font-bold text-sm',
                  background === 'light' && 'text-foreground',
                  (background === 'dark' || background === 'primary') && 'text-white'
                )}
              >
                {badge.title}
              </h3>
              {badge.subtitle && (
                <p
                  className={cn(
                    'text-xs mt-1',
                    background === 'light' && 'text-muted-foreground',
                    (background === 'dark' || background === 'primary') && 'text-white/70'
                  )}
                >
                  {badge.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
