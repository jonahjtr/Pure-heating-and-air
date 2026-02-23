import { cn } from '@/lib/utils';
import type { CTAContent } from '@/types/sections';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface CTASectionProps {
  content: CTAContent;
  className?: string;
}

export function CTASection({ content, className }: CTASectionProps) {
  const { headline, description, button_text, button_link, background_color } = content;
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn('py-16 md:py-24', className)}
      style={{ backgroundColor: background_color || 'hsl(var(--primary))' }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white space-y-6">
          {headline && (
            <h2 className={cn(
              'text-3xl md:text-4xl font-bold tracking-tight reveal-hidden',
              isVisible && 'reveal-visible'
            )}>
              {headline}
            </h2>
          )}
          
          {description && (
            <p className={cn(
              'text-lg text-white/90 max-w-2xl mx-auto reveal-hidden',
              isVisible && 'reveal-visible'
            )}
            style={{ transitionDelay: '0.12s' }}
            >
              {description}
            </p>
          )}

          {button_text && button_link && (
            <div className={cn(
              'pt-4 reveal-scale-hidden',
              isVisible && 'reveal-scale-visible'
            )}
            style={{ transitionDelay: '0.24s' }}
            >
              {button_link.startsWith('/') ? (
                <Button asChild size="lg" variant="secondary">
                  <Link to={button_link}>{button_text}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="secondary">
                  <a href={button_link} target="_blank" rel="noopener noreferrer">
                    {button_text}
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
