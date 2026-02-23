import { MapPin, CheckCircle } from 'lucide-react';
import serviceAreasMap from '@/assets/service-areas-map.png';
import { cn } from '@/lib/utils';

export interface ServiceAreaContent {
  title: string;
  subtitle: string;
  areas: Array<{
    id: string;
    name: string;
  }>;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  cta_text: string;
  cta_link: string;
  layout: 'list' | 'grid' | 'map';
}

interface ServiceAreaSectionProps {
  content: ServiceAreaContent;
}

export function ServiceAreaSection({ content }: ServiceAreaSectionProps) {
  const layout = content.layout || 'grid';

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <div className="flex items-center gap-2 text-accent font-semibold mb-4">
              <MapPin className="w-5 h-5" />
              <span>Service Area</span>
            </div>
            
            {content.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {content.title}
              </h2>
            )}
            
            {content.subtitle && (
              <p className="text-lg text-muted-foreground mb-8">
                {content.subtitle}
              </p>
            )}

            {/* Areas List/Grid */}
            {content.areas && content.areas.length > 0 && (
              <div
                className={cn(
                  layout === 'list' && 'space-y-3',
                  layout === 'grid' && 'grid grid-cols-2 gap-3'
                )}
              >
                {content.areas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{area.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            {content.cta_text && (
              <a
                href={content.cta_link || '#'}
                className="inline-block mt-8 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                {content.cta_text}
              </a>
            )}
          </div>

          {/* Right - Image */}
          <div className="relative">
            {content.image?.url ? (
              <img
                src={content.image.url}
                alt={content.image.alt || 'Service area map'}
                className="rounded-2xl shadow-lg w-full"
              />
            ) : (
              <img
                src={serviceAreasMap}
                alt="Pure Heating and Air Service Areas Map"
                className="rounded-2xl shadow-lg w-full"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
