import { cn } from '@/lib/utils';
import type { FAQContent, FAQItem } from '@/types/sections';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQSectionProps {
  content: FAQContent;
  className?: string;
}

export function FAQSection({ content, className }: FAQSectionProps) {
  const { title, items = [] } = content;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
              {title}
            </h2>
          )}

          <Accordion type="single" collapsible className="w-full">
            {items.map((item: FAQItem, index: number) => (
              <AccordionItem key={item.id || index} value={item.id || `faq-${index}`}>
                <AccordionTrigger className="text-left text-lg font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
