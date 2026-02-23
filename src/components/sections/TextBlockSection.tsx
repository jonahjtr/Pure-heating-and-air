import { cn } from '@/lib/utils';
import type { TextBlockContent as TextBlockSectionContent } from '@/types/sections';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TextBlockSectionProps {
  content: TextBlockSectionContent;
  className?: string;
}

export function TextBlockSection({ content, className }: TextBlockSectionProps) {
  const { heading, content: textContent, alignment = 'left' } = content;
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'max-w-3xl prose prose-lg dark:prose-invert reveal-hidden',
            isVisible && 'reveal-visible',
            alignment === 'center' && 'mx-auto text-center',
            alignment === 'right' && 'ml-auto text-right',
            alignment === 'left' && 'mr-auto text-left'
          )}
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
              {heading}
            </h2>
          )}
          {textContent && (
            <div
              dangerouslySetInnerHTML={{ __html: textContent }}
              className="text-muted-foreground"
            />
          )}
        </div>
      </div>
    </section>
  );
}
