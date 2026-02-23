import type { PageSection, SectionType } from '@/types/sections';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { TextBlockSection } from './TextBlockSection';
import { FAQSection } from './FAQSection';
import { ContentFeedSection } from './ContentFeedSection';
import { HeroWithFormSection } from './HeroWithFormSection';
import { ServicesGridSection } from './ServicesGridSection';
import { ServiceAreaSection } from './ServiceAreaSection';
import { TrustBadgesSection } from './TrustBadgesSection';
import { ContactBannerSection } from './ContactBannerSection';
import { TwoColumnSection } from './TwoColumnSection';
import { ProductGridSection } from './ProductGridSection';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
'@/components/ui/accordion';

interface SectionRendererProps {
  section: PageSection;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const { section_type, content_json } = section;
  const content = content_json as Record<string, unknown>;

  switch (section_type as SectionType) {
    case 'hero':
      return <HeroSection content={content_json as any} />;

    case 'features':
      return <FeaturesSection content={content_json as any} />;

    case 'testimonials':
      return <TestimonialsSection content={content_json as any} />;

    case 'cta':
      return <CTASection content={content_json as any} />;

    case 'text-block':
      return <TextBlockSection content={content_json as any} />;

    case 'faq':
      return <FAQSection content={content_json as any} />;

    case 'content-feed':
      return <ContentFeedSection content={content_json as any} />;

    case 'hero-with-form':
      return <HeroWithFormSection content={content_json as any} />;

    case 'services-grid':
      return <ServicesGridSection content={content_json as any} />;

    case 'service-area':
      return <ServiceAreaSection content={content_json as any} />;

    case 'trust-badges':
      return <TrustBadgesSection content={content_json as any} />;

    case 'contact-banner':
      return <ContactBannerSection content={content_json as any} />;

    case 'two-column':
      return <TwoColumnSection content={content_json as any} />;

    case 'product-grid':
      return <ProductGridSection content={content_json as any} />;

    case 'card-grid':
      return <CardGridSection content={content} />;

    case 'columns':
      return <ColumnsSection content={content} />;

    case 'image':
      return <ImageSection content={content} />;

    case 'button':
      return <ButtonSection content={content} />;

    case 'pricing':
      return <PricingSection content={content} />;

    case 'logo-cloud':
      return <LogoCloudSection content={content} />;

    case 'image-gallery':
      return <ImageGallerySection content={content} />;

    case 'team':
      return <TeamSection content={content} />;

    case 'stats':
    case 'contact':
      return (
        <div className="py-12 container mx-auto px-4 text-center text-muted-foreground">
          <p>Section type "{section_type}" is not yet implemented</p>
        </div>);


    case 'legacy-blocks':
      return null;

    default:
      return (
        <div className="py-8 container mx-auto px-4 text-center text-muted-foreground">
          <p>Unknown section type: {section_type}</p>
        </div>);

  }
}

// Card Grid Section
function CardGridSection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const columns = content.columns as string || '3';
  const cards = content.cards as any[] || [];

  return (
    <section className="py-16 container mx-auto px-4">
      {title &&
      <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
      }
      <div
        className={cn(
          'grid gap-6',
          columns === '2' && 'md:grid-cols-2',
          columns === '3' && 'md:grid-cols-3',
          columns === '4' && 'md:grid-cols-2 lg:grid-cols-4'
        )}>

        {cards.map((card, idx) =>
        <div
          key={card.id || idx}
          className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow">

            {card.image?.url &&
          <img
            src={card.image.url}
            alt={card.image.alt || card.title || ''}
            className="w-full h-48 object-cover" />

          }
            <div className="p-5 space-y-2">
              {card.title &&
            <h3 className="font-semibold text-lg">{card.title}</h3>
            }
              {card.description &&
            <p className="text-sm text-muted-foreground">{card.description}</p>
            }
              {card.link &&
            <a
              href={card.link}
              className="text-sm text-primary hover:underline inline-block mt-2">

                  Learn more →
                </a>
            }
            </div>
          </div>
        )}
      </div>
    </section>);

}

// Columns Section
function ColumnsSection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const columns = content.columns as string || '2';
  const items = content.items as any[] || [];

  return (
    <section className="py-16 container mx-auto px-4">
      {title &&
      <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
      }
      <div
        className={cn(
          'grid gap-8',
          columns === '2' && 'md:grid-cols-2',
          columns === '3' && 'md:grid-cols-3'
        )}>

        {items.map((item, idx) =>
        <div key={item.id || idx} className="space-y-3">
            {item.heading &&
          <h3 className="font-semibold text-xl">{item.heading}</h3>
          }
            {item.content &&
          <div
            className="text-muted-foreground prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item.content }} />

          }
          </div>
        )}
      </div>
    </section>);

}

// Image Section
function ImageSection({ content }: {content: Record<string, unknown>;}) {
  const image = content.image as {url?: string;alt?: string;} | null;
  const caption = content.caption as string;
  const link = content.link as string;
  const alignment = content.alignment as string || 'center';
  const maxWidth = content.max_width as string || '100%';

  if (!image?.url) {
    return (
      <div className="py-8 container mx-auto px-4 text-center text-muted-foreground">
        No image selected
      </div>);

  }

  const imgElement =
  <figure
    className={cn(
      'mx-auto',
      alignment === 'left' && 'mr-auto ml-0',
      alignment === 'right' && 'ml-auto mr-0',
      alignment === 'center' && 'mx-auto'
    )}
    style={{ maxWidth }}>

      <img
      src={image.url}
      alt={image.alt || caption || ''}
      className="w-full h-auto rounded-lg" />

      {caption &&
    <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
    }
    </figure>;


  return (
    <section className="py-8 container mx-auto px-4">
      {link ?
      <a href={link} className="block hover:opacity-90 transition-opacity">
          {imgElement}
        </a> :

      imgElement
      }
    </section>);

}

// Button Section
function ButtonSection({ content }: {content: Record<string, unknown>;}) {
  const text = content.text as string;
  const link = content.link as string;
  const variant = content.variant as string || 'primary';
  const alignment = content.alignment as string || 'center';

  if (!text) return null;

  const buttonVariant = variant === 'secondary' ? 'secondary' : variant === 'outline' ? 'outline' : 'default';

  return (
    <section className="py-8 container mx-auto px-4">
      <div
        className={cn(
          'flex',
          alignment === 'left' && 'justify-start',
          alignment === 'center' && 'justify-center',
          alignment === 'right' && 'justify-end'
        )}>

        {link ?
        <Button asChild variant={buttonVariant} size="lg">
            <a href={link}>{text}</a>
          </Button> :

        <Button variant={buttonVariant} size="lg" disabled>
            {text}
          </Button>
        }
      </div>
    </section>);

}

// Pricing Section
function PricingSection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const subtitle = content.subtitle as string;
  const tiers = content.tiers as any[] || [];

  return (
    <section className="py-16 container mx-auto px-4">
      {(title || subtitle) &&
      <div className="text-center mb-12">
          {title && <h2 className="text-3xl font-bold">{title}</h2>}
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
      }
      <div
        className={cn(
          'grid gap-6 max-w-5xl mx-auto',
          tiers.length === 1 && 'md:grid-cols-1 max-w-md',
          tiers.length === 2 && 'md:grid-cols-2',
          tiers.length >= 3 && 'md:grid-cols-3'
        )}>

        {tiers.map((tier, idx) => {
          const features = typeof tier.features === 'string' ?
          tier.features.split('\n').filter(Boolean) :
          tier.features || [];

          return (
            <div
              key={tier.id || idx}
              className={cn(
                'rounded-xl border p-6 flex flex-col',
                tier.highlighted && 'border-primary ring-2 ring-primary/20 bg-primary/5'
              )}>

              <div className="mb-4">
                <h3 className="text-xl font-semibold">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period &&
                  <span className="text-muted-foreground">{tier.period}</span>
                  }
                </div>
                {tier.description &&
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
                }
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {features.map((feature: string, fIdx: number) =>
                <li key={fIdx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">✓</span>
                    <span>{feature}</span>
                  </li>
                )}
              </ul>
              {tier.cta_text &&
              <Button
                asChild
                variant={tier.highlighted ? 'default' : 'outline'}
                className="w-full">

                  <a href={tier.cta_link || '#'}>{tier.cta_text}</a>
                </Button>
              }
            </div>);

        })}
      </div>
    </section>);

}

// Logo Cloud Section
function LogoCloudSection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const logos = content.logos as any[] || [];

  return (
    <section className="py-12 container mx-auto px-4">
      {title &&
      <h2 className="text-xl font-medium text-center text-muted-foreground mb-8">
          {title}
        </h2>
      }
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos.map((logo, idx) => {
          const img =
          <img
            src={logo.image?.url}
            alt={logo.name || ''}
            className="h-8 md:h-10 w-auto grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />;



          return logo.link ?
          <a
            key={logo.id || idx}
            href={logo.link}
            target="_blank"
            rel="noopener noreferrer"
            title={logo.name}>

              {img}
            </a> :

          <div key={logo.id || idx} title={logo.name}>
              {img}
            </div>;

        })}
      </div>
    </section>);

}

// Image Gallery Section
function ImageGallerySection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const images = content.images as any[] || [];

  if (images.length === 0) {
    return (
      <section className="py-12 container mx-auto px-4 text-center text-muted-foreground">
        <p>No images in gallery</p>
      </section>);

  }

  return (
    <section className="py-16 container mx-auto px-4">
      {title &&
      <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
      }
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) =>
        <figure
          key={img.id || idx}
          className="overflow-hidden rounded-lg group">

            <img
            src={img.url || img.image?.url}
            alt={img.alt || img.image?.alt || img.caption || ''}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105" />

            {img.caption &&
          <figcaption className="mt-2 text-sm text-muted-foreground text-center">
                {img.caption}
              </figcaption>
          }
          </figure>
        )}
      </div>
    </section>);

}

// Team Section
function TeamSection({ content }: {content: Record<string, unknown>;}) {
  const title = content.title as string;
  const members = content.members as any[] || [];

  return;












































}