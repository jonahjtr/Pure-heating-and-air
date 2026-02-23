import { cn } from '@/lib/utils';
import type { TestimonialsContent, TestimonialItem } from '@/types/sections';
import { Quote } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TestimonialsSectionProps {
  content: TestimonialsContent & { embed_url?: string };
  className?: string;
}

export function TestimonialsSection({ content, className }: TestimonialsSectionProps) {
  const { title, items = [], embed_url } = content as TestimonialsContent & { embed_url?: string };
  const { ref, isVisible } = useScrollReveal();

  if (items.length === 0 && !embed_url) {
    return null;
  }

  return (
    <section ref={ref} className={cn('py-16 md:py-24 bg-muted/50', className)}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className={cn(
            'text-3xl md:text-4xl font-bold tracking-tight text-center mb-12 reveal-hidden',
            isVisible && 'reveal-visible'
          )}>
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((testimonial: TestimonialItem, idx: number) => (
            <div
              key={testimonial.id}
              className={cn(
                'bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-300 hover:-translate-y-1',
                'reveal-hidden',
                isVisible && 'reveal-visible',
                `stagger-${Math.min(idx + 1, 6)}`
              )}
            >
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <blockquote className="text-lg mb-4 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                {testimonial.avatar?.url ? (
                  <img
                    src={testimonial.avatar.url}
                    alt={testimonial.avatar.alt || testimonial.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {testimonial.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium">{testimonial.author}</div>
                  {testimonial.company && (
                    <div className="text-sm text-muted-foreground">
                      {testimonial.company}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {embed_url && (
          <div className={cn(
            'flex justify-center mt-12 reveal-hidden',
            isVisible && 'reveal-visible'
          )}>
            <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-lg border bg-card">
              <iframe
                src={embed_url}
                className="w-full"
                style={{ minHeight: 600 }}
                frameBorder="0"
                scrolling="no"
                allowTransparency
                allowFullScreen
                title="Customer video"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
