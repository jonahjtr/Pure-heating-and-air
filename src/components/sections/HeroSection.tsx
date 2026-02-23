import { cn } from '@/lib/utils';
import type { HeroContent } from '@/types/sections';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface HeroSectionProps {
  content: HeroContent;
  className?: string;
}

export function HeroSection({ content, className }: HeroSectionProps) {
  const { headline, subheadline, background_image, cta_text, cta_link, overlay } = content;
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      className={cn(
        'relative min-h-[60vh] flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Background */}
      {background_image?.url ? (
        <div className={cn(
          'absolute inset-0 transition-transform duration-[1.2s] ease-out',
          isVisible ? 'scale-100' : 'scale-110'
        )}>
          <img
            src={background_image.url}
            alt={background_image.alt || ''}
            className="w-full h-full object-cover"
          />
          {overlay && (
            <div className="absolute inset-0 bg-black/50" />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary-foreground/20" />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          {headline && (
            <h1 className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
              background_image?.url ? 'text-white' : 'text-primary-foreground',
              'reveal-hidden',
              isVisible && 'reveal-visible'
            )}
            style={{ transitionDelay: '0.1s' }}
            >
              {headline}
            </h1>
          )}
          
          {subheadline && (
            <p className={cn(
              'text-lg md:text-xl max-w-2xl mx-auto',
              background_image?.url ? 'text-white/90' : 'text-primary-foreground/80',
              'reveal-hidden',
              isVisible && 'reveal-visible'
            )}
            style={{ transitionDelay: '0.25s' }}
            >
              {subheadline}
            </p>
          )}

          {cta_text && cta_link && (
            <div className={cn(
              'pt-4 reveal-scale-hidden',
              isVisible && 'reveal-scale-visible'
            )}
            style={{ transitionDelay: '0.4s' }}
            >
              {cta_link.startsWith('/') ? (
                <Button asChild size="lg" variant="secondary" className="animate-pulse-ring">
                  <Link to={cta_link}>{cta_text}</Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="secondary" className="animate-pulse-ring">
                  <a href={cta_link} target="_blank" rel="noopener noreferrer">
                    {cta_text}
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
