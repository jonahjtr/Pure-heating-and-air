import { Phone, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export interface ContactBannerContent {
  headline: string;
  subheadline: string;
  phone_number: string;
  cta_text: string;
  cta_link: string;
  show_hours: boolean;
  hours_text: string;
  background: 'primary' | 'accent' | 'dark';
}

interface ContactBannerSectionProps {
  content: ContactBannerContent;
}

export function ContactBannerSection({ content }: ContactBannerSectionProps) {
  const background = content.background || 'accent';
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={cn(
        'py-12 lg:py-16',
        background === 'primary' && 'bg-primary',
        background === 'accent' && 'bg-accent',
        background === 'dark' && 'bg-foreground'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left - Content */}
          <div className={cn(
            'text-center lg:text-left reveal-left-hidden',
            isVisible && 'reveal-left-visible'
          )}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              {content.headline || 'Ready to Get Started?'}
            </h2>
            {content.subheadline && (
              <p className="text-white/90 text-lg">
                {content.subheadline}
              </p>
            )}
            
            {/* Hours */}
            {content.show_hours && content.hours_text && (
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-4 text-white/80">
                <Clock className="w-5 h-5" />
                <span>{content.hours_text}</span>
              </div>
            )}
          </div>

          {/* Right - CTA */}
          <div className={cn(
            'flex flex-col sm:flex-row items-center gap-4 reveal-right-hidden',
            isVisible && 'reveal-right-visible'
          )}>
            {/* Phone */}
            {content.phone_number && (
              <a
                href={`tel:${content.phone_number.replace(/\D/g, '')}`}
                className={cn(
                  'flex items-center gap-3 px-6 py-4 rounded-lg font-bold text-xl transition-all duration-300 hover:scale-105 animate-pulse-ring',
                  background === 'accent' && 'bg-white text-accent hover:bg-white/90',
                  background === 'primary' && 'bg-accent text-white hover:bg-accent/90',
                  background === 'dark' && 'bg-accent text-white hover:bg-accent/90'
                )}
              >
                <Phone className="w-6 h-6" />
                {content.phone_number}
              </a>
            )}

            {/* Secondary CTA */}
            {content.cta_text && (
              <a
                href={content.cta_link || '#'}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105',
                  'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                )}
              >
                {content.cta_text}
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
