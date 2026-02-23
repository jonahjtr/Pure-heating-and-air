import { cn } from '@/lib/utils';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface VideoEmbedSectionProps {
  content: {
    title?: string;
    embed_url: string;
    platform?: string;
  };
  className?: string;
}

export function VideoEmbedSection({ content, className }: VideoEmbedSectionProps) {
  const { title, embed_url, platform } = content;
  const { ref, isVisible } = useScrollReveal();

  if (!embed_url) return null;

  return (
    <section ref={ref} className={cn('py-16 md:py-24 bg-muted/30', className)}>
      <div className="container mx-auto px-4">
        {title && (
          <h2
            className={cn(
              'text-3xl md:text-4xl font-bold tracking-tight text-center mb-10 reveal-hidden',
              isVisible && 'reveal-visible'
            )}
          >
            {title}
          </h2>
        )}
        <div
          className={cn(
            'flex justify-center reveal-hidden',
            isVisible && 'reveal-visible'
          )}
        >
          <div className="w-full max-w-lg rounded-xl overflow-hidden shadow-lg border bg-card">
            <iframe
              src={embed_url}
              className="w-full"
              style={{ minHeight: 600 }}
              frameBorder="0"
              scrolling="no"
              allowTransparency
              allowFullScreen
              title={title || 'Video embed'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
