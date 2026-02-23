import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface TwoColumnContent {
  title: string;
  subtitle: string;
  content: string;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  image_position: 'left' | 'right';
  bullets: Array<{
    id: string;
    text: string;
  }>;
  cta_text: string;
  cta_link: string;
  background: 'white' | 'muted';
}

interface TwoColumnSectionProps {
  content: TwoColumnContent;
}

export function TwoColumnSection({ content }: TwoColumnSectionProps) {
  const imagePosition = content.image_position || 'right';
  const background = content.background || 'white';
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        'py-16 lg:py-24',
        background === 'white' && 'bg-white',
        background === 'muted' && 'bg-muted'
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'grid lg:grid-cols-2 gap-12 items-center',
            imagePosition === 'left' && 'lg:[direction:rtl]'
          )}
        >
          {/* Text Content */}
          <div className={cn(
            imagePosition === 'left' && 'lg:[direction:ltr]',
            imagePosition === 'left' ? 'reveal-right-hidden' : 'reveal-left-hidden',
            isVisible && (imagePosition === 'left' ? 'reveal-right-visible' : 'reveal-left-visible')
          )}>
            {content.subtitle && (
              <p className="text-accent font-semibold mb-2 uppercase tracking-wide text-sm">
                {content.subtitle}
              </p>
            )}
            
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {content.title}
              </h2>
            )}

            {content.content && (
              <div
                className="text-muted-foreground text-lg leading-relaxed mb-6 prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            )}

            {/* Bullets */}
            {content.bullets && content.bullets.length > 0 && (
              <ul className="space-y-3 mb-8">
                {content.bullets.map((bullet, idx) => (
                  <li
                    key={bullet.id}
                    className={cn(
                      'flex items-start gap-3 reveal-hidden',
                      isVisible && 'reveal-visible',
                      `stagger-${Math.min(idx + 1, 6)}`
                    )}
                  >
                    <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{bullet.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            {content.cta_text && (
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <a href={content.cta_link || '#'}>{content.cta_text}</a>
              </Button>
            )}
          </div>

          {/* Image */}
          <div className={cn(
            imagePosition === 'left' && 'lg:[direction:ltr]',
            imagePosition === 'left' ? 'reveal-left-hidden' : 'reveal-right-hidden',
            isVisible && (imagePosition === 'left' ? 'reveal-left-visible' : 'reveal-right-visible')
          )}>
            {content.image?.url ? (
              <img
                src={content.image.url}
                alt={content.image.alt || ''}
                className="rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-500"
              />
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/20 rounded-2xl" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
