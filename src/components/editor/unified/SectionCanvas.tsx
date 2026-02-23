import { useBrandingContext } from '@/contexts/BrandingContext';
import { SectionWrapper } from './SectionWrapper';
import { InlineEditableField } from './InlineEditableField';
import type { PageSection } from '@/types/sections';
import { getSectionConfig } from '@/lib/sectionRegistry';
import { cn } from '@/lib/utils';

interface SectionCanvasProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  isAdmin: boolean;
  saving: boolean;
  onSelectSection: (sectionId: string) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
  onToggleVisibility: (sectionId: string) => void;
  onToggleLock: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
  onOpenSettings: (sectionId: string) => void;
  onOpenStyleInspector: (sectionId: string) => void;
  onSaveAsReusable: (sectionId: string) => void;
  onInlineFieldUpdate: (sectionId: string, fieldName: string, value: unknown) => void;
  getCanMoveUp: (sectionId: string) => boolean;
  getCanMoveDown: (sectionId: string) => boolean;
}

export function SectionCanvas({
  sections,
  selectedSectionId,
  isAdmin,
  saving,
  onSelectSection,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onOpenSettings,
  onOpenStyleInspector,
  onSaveAsReusable,
  onInlineFieldUpdate,
  getCanMoveUp,
  getCanMoveDown,
}: SectionCanvasProps) {
  const { branding } = useBrandingContext();

  if (sections.length === 0) {
    return (
      <div 
        className="min-h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: branding.colors.background,
          color: branding.colors.foreground,
        }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No sections yet</p>
          <p className="text-sm mt-1">Add sections to start building your page</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[400px] rounded-lg overflow-hidden border"
      style={{
        backgroundColor: branding.colors.background,
        color: branding.colors.foreground,
        fontFamily: branding.typography.bodyFont,
      }}
    >
      {sections.map((section) => (
        <SectionWrapper
          key={section.id}
          section={section}
          isSelected={selectedSectionId === section.id}
          isAdmin={isAdmin}
          canMoveUp={getCanMoveUp(section.id)}
          canMoveDown={getCanMoveDown(section.id)}
          saving={saving}
          onSelect={() => onSelectSection(section.id)}
          onMoveUp={() => onMoveUp(section.id)}
          onMoveDown={() => onMoveDown(section.id)}
          onToggleVisibility={() => onToggleVisibility(section.id)}
          onToggleLock={() => onToggleLock(section.id)}
          onDelete={() => onDelete(section.id)}
          onOpenSettings={() => onOpenSettings(section.id)}
          onOpenStyleInspector={() => onOpenStyleInspector(section.id)}
          onSaveAsReusable={() => onSaveAsReusable(section.id)}
        >
          <EditableSectionContent
            section={section}
            isSelected={selectedSectionId === section.id}
            onFieldUpdate={(fieldName, value) => onInlineFieldUpdate(section.id, fieldName, value)}
          />
        </SectionWrapper>
      ))}
    </div>
  );
}

interface EditableSectionContentProps {
  section: PageSection;
  isSelected: boolean;
  onFieldUpdate: (fieldName: string, value: unknown) => void;
}

function EditableSectionContent({ section, isSelected, onFieldUpdate }: EditableSectionContentProps) {
  const { branding } = useBrandingContext();
  const config = getSectionConfig(section.section_type);
  const content = section.content_json as Record<string, unknown>;

  // Render different section types with inline editing
  switch (section.section_type) {
    case 'hero':
      return (
        <HeroPreview
          content={content}
          isSelected={isSelected}
          isLocked={section.is_locked}
          branding={branding}
          onFieldUpdate={onFieldUpdate}
        />
      );

    case 'text-block':
      return (
        <TextBlockPreview
          content={content}
          isSelected={isSelected}
          isLocked={section.is_locked}
          branding={branding}
          onFieldUpdate={onFieldUpdate}
        />
      );

    case 'cta':
      return (
        <CTAPreview
          content={content}
          isSelected={isSelected}
          isLocked={section.is_locked}
          branding={branding}
          onFieldUpdate={onFieldUpdate}
        />
      );

    case 'features':
      return (
        <FeaturesPreview
          content={content}
          isSelected={isSelected}
          isLocked={section.is_locked}
          branding={branding}
          onFieldUpdate={onFieldUpdate}
        />
      );

    case 'testimonials':
      return (
        <TestimonialsPreview
          content={content}
          isSelected={isSelected}
          branding={branding}
        />
      );

    case 'faq':
      return (
        <FAQPreview
          content={content}
          isSelected={isSelected}
          branding={branding}
        />
      );

    case 'content-feed':
      return (
        <ContentFeedPreview
          content={content}
          branding={branding}
        />
      );

    case 'card-grid':
      return <CardGridPreview content={content} branding={branding} />;

    case 'columns':
      return <ColumnsPreview content={content} branding={branding} />;

    case 'image':
      return <ImagePreview content={content} branding={branding} />;

    case 'button':
      return <ButtonPreview content={content} branding={branding} />;

    case 'pricing':
      return <PricingPreview content={content} branding={branding} />;

    case 'logo-cloud':
      return <LogoCloudPreview content={content} branding={branding} />;

    default:
      return (
        <div className="py-12 container mx-auto px-4 text-center text-muted-foreground">
          <p>{config.label}</p>
          <p className="text-sm mt-1">Click the settings icon to edit</p>
        </div>
      );
  }
}

// Hero section with inline editing
function HeroPreview({ 
  content, 
  isSelected,
  isLocked,
  branding, 
  onFieldUpdate 
}: { 
  content: Record<string, unknown>; 
  isSelected: boolean;
  isLocked: boolean;
  branding: any; 
  onFieldUpdate: (field: string, value: unknown) => void;
}) {
  const bgImage = content.background_image as { url?: string } | null;
  const hasBg = Boolean(bgImage?.url);

  return (
    <div
      className={cn(
        "relative overflow-hidden min-h-[360px] flex items-center justify-center",
      )}
      style={{
        backgroundImage: hasBg ? `url(${bgImage?.url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: !hasBg ? 'hsl(var(--muted))' : undefined,
      }}
    >
      {content.overlay && hasBg && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      <div 
        className="relative w-full px-6 py-16 text-center"
        style={{
          color: content.overlay && hasBg ? 'white' : branding.colors.foreground,
        }}
      >
        <InlineEditableField
          value={(content.headline as string) || ''}
          onChange={(value) => onFieldUpdate('headline', value)}
          placeholder="Enter headline..."
          disabled={isLocked}
          className="text-4xl md:text-5xl tracking-tight block"
          tag="h2"
        />
        <InlineEditableField
          value={(content.subheadline as string) || ''}
          onChange={(value) => onFieldUpdate('subheadline', value)}
          placeholder="Enter subheadline..."
          disabled={isLocked}
          className="mt-4 text-base md:text-lg opacity-85 block"
          tag="p"
        />
        {content.cta_text && (
          <div className="mt-8">
            <span 
              className="inline-block px-6 py-3 rounded-lg font-medium"
              style={{ backgroundColor: branding.colors.primary, color: 'white' }}
            >
              {content.cta_text as string}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Text block with inline editing
function TextBlockPreview({
  content,
  isSelected,
  isLocked,
  branding,
  onFieldUpdate,
}: {
  content: Record<string, unknown>;
  isSelected: boolean;
  isLocked: boolean;
  branding: any;
  onFieldUpdate: (field: string, value: unknown) => void;
}) {
  const alignment = (content.alignment as string) || 'left';

  return (
    <div className="py-12 container mx-auto px-4">
      <div className={cn('max-w-3xl', alignment === 'center' && 'mx-auto text-center', alignment === 'right' && 'ml-auto text-right')}>
        {content.heading && (
          <InlineEditableField
            value={(content.heading as string) || ''}
            onChange={(value) => onFieldUpdate('heading', value)}
            placeholder="Enter heading..."
            disabled={isLocked}
            className="text-2xl font-bold mb-4 block"
            tag="h2"
          />
        )}
        <InlineEditableField
          value={(content.content as string) || ''}
          onChange={(value) => onFieldUpdate('content', value)}
          placeholder="Enter content..."
          disabled={isLocked}
          multiline
          className="text-base leading-7 whitespace-pre-wrap block"
          tag="div"
        />
      </div>
    </div>
  );
}

// CTA section with inline editing
function CTAPreview({
  content,
  isSelected,
  isLocked,
  branding,
  onFieldUpdate,
}: {
  content: Record<string, unknown>;
  isSelected: boolean;
  isLocked: boolean;
  branding: any;
  onFieldUpdate: (field: string, value: unknown) => void;
}) {
  const bgColor = (content.background_color as string) || branding.colors.primary;

  return (
    <div 
      className="py-16"
      style={{ backgroundColor: bgColor }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <InlineEditableField
          value={(content.headline as string) || ''}
          onChange={(value) => onFieldUpdate('headline', value)}
          placeholder="Enter headline..."
          disabled={isLocked}
          className="text-3xl md:text-4xl font-bold block"
          tag="h2"
        />
        <InlineEditableField
          value={(content.description as string) || ''}
          onChange={(value) => onFieldUpdate('description', value)}
          placeholder="Enter description..."
          disabled={isLocked}
          className="mt-4 text-lg opacity-90 max-w-2xl mx-auto block"
          tag="p"
        />
        {content.button_text && (
          <div className="mt-8">
            <span className="inline-block px-6 py-3 rounded-lg font-medium bg-white text-foreground">
              {content.button_text as string}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Features section preview
function FeaturesPreview({
  content,
  isSelected,
  isLocked,
  branding,
  onFieldUpdate,
}: {
  content: Record<string, unknown>;
  isSelected: boolean;
  isLocked: boolean;
  branding: any;
  onFieldUpdate: (field: string, value: unknown) => void;
}) {
  const items = (content.items as any[]) || [];

  return (
    <div className="py-16 container mx-auto px-4">
      <div className="text-center mb-12">
        <InlineEditableField
          value={(content.title as string) || ''}
          onChange={(value) => onFieldUpdate('title', value)}
          placeholder="Enter section title..."
          disabled={isLocked}
          className="text-3xl font-bold block"
          tag="h2"
        />
        <InlineEditableField
          value={(content.subtitle as string) || ''}
          onChange={(value) => onFieldUpdate('subtitle', value)}
          placeholder="Enter subtitle..."
          disabled={isLocked}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto block"
          tag="p"
        />
      </div>
      {items.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="text-center p-6 rounded-lg bg-muted/30">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xl">⭐</span>
              </div>
              <h3 className="font-semibold text-lg">{item.title || 'Feature'}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description || 'Description'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No features yet. Use settings to add items.
        </div>
      )}
    </div>
  );
}

// Testimonials preview (read-only for items)
function TestimonialsPreview({
  content,
  isSelected,
  branding,
}: {
  content: Record<string, unknown>;
  isSelected: boolean;
  branding: any;
}) {
  const items = (content.items as any[]) || [];

  return (
    <div className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        {(content.title as string) || 'Testimonials'}
      </h2>
      {items.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="p-6 rounded-lg bg-muted/30 border">
              <p className="italic text-muted-foreground">"{item.quote || 'Quote'}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20" />
                <div>
                  <p className="font-medium">{item.author || 'Author'}</p>
                  <p className="text-sm text-muted-foreground">{item.company || ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No testimonials yet. Use settings to add items.
        </div>
      )}
    </div>
  );
}

// FAQ preview
function FAQPreview({
  content,
  isSelected,
  branding,
}: {
  content: Record<string, unknown>;
  isSelected: boolean;
  branding: any;
}) {
  const items = (content.items as any[]) || [];

  return (
    <div className="py-16 container mx-auto px-4 max-w-3xl">
      <h2 className="text-3xl font-bold text-center mb-12">
        {(content.title as string) || 'FAQ'}
      </h2>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="border rounded-lg p-4">
              <h3 className="font-medium">{item.question || 'Question'}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.answer || 'Answer'}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No FAQ items yet. Use settings to add questions.
        </div>
      )}
    </div>
  );
}

// Content feed preview placeholder
function ContentFeedPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  return (
    <div className="py-16 container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">
        {(content.title as string) || 'Content Feed'}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <div className="h-40 bg-muted" />
            <div className="p-4">
              <div className="h-4 w-3/4 bg-muted rounded mb-2" />
              <div className="h-3 w-full bg-muted/50 rounded" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Content will be loaded from: {(content.content_type_slug as string) || 'Not selected'}
      </p>
    </div>
  );
}

// Card Grid preview
function CardGridPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const cards = (content.cards as any[]) || [];
  const columns = (content.columns as string) || '3';
  const colClass = columns === '2' ? 'md:grid-cols-2' : columns === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <div className="py-16 container mx-auto px-4">
      {content.title && (
        <h2 className="text-3xl font-bold text-center mb-12">{content.title as string}</h2>
      )}
      {cards.length > 0 ? (
        <div className={cn('grid gap-6', colClass)}>
          {cards.map((card: any, index: number) => (
            <div key={card.id || index} className="rounded-lg border overflow-hidden bg-card">
              {card.image?.url ? (
                <img src={card.image.url} alt={card.image.alt || ''} className="w-full h-40 object-cover" />
              ) : (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold">{card.title || 'Card Title'}</h3>
                {card.description && (
                  <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No cards yet. Use settings to add items.
        </div>
      )}
    </div>
  );
}

// Columns preview
function ColumnsPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const items = (content.items as any[]) || [];
  const columns = (content.columns as string) || '2';
  const colClass = columns === '3' ? 'md:grid-cols-3' : 'md:grid-cols-2';

  return (
    <div className="py-16 container mx-auto px-4">
      {content.title && (
        <h2 className="text-3xl font-bold text-center mb-12">{content.title as string}</h2>
      )}
      {items.length > 0 ? (
        <div className={cn('grid gap-8', colClass)}>
          {items.map((item: any, index: number) => (
            <div key={item.id || index}>
              {item.heading && <h3 className="font-semibold text-lg mb-2">{item.heading}</h3>}
              <div className="text-muted-foreground whitespace-pre-wrap">{item.content || ''}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No columns yet. Use settings to add content.
        </div>
      )}
    </div>
  );
}

// Image preview
function ImagePreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const image = content.image as { url?: string; alt?: string } | null;
  const alignment = (content.alignment as string) || 'center';
  const maxWidth = (content.max_width as string) || '100%';

  return (
    <div className="py-12 container mx-auto px-4">
      <div className={cn(
        'mx-auto',
        alignment === 'left' && 'mr-auto ml-0',
        alignment === 'right' && 'ml-auto mr-0',
        alignment === 'center' && 'mx-auto'
      )} style={{ maxWidth }}>
        {image?.url ? (
          <>
            <img src={image.url} alt={image.alt || ''} className="w-full rounded-lg" />
            {content.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">{content.caption as string}</p>
            )}
          </>
        ) : (
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">No image selected</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Button preview
function ButtonPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const variant = (content.variant as string) || 'primary';
  const alignment = (content.alignment as string) || 'center';

  const buttonStyles = {
    primary: { backgroundColor: branding.colors.primary, color: 'white' },
    secondary: { backgroundColor: branding.colors.secondary, color: branding.colors.foreground },
    outline: { border: `2px solid ${branding.colors.primary}`, color: branding.colors.primary, backgroundColor: 'transparent' },
  };

  return (
    <div className={cn(
      'py-8 container mx-auto px-4',
      alignment === 'left' && 'text-left',
      alignment === 'right' && 'text-right',
      alignment === 'center' && 'text-center'
    )}>
      <span
        className="inline-block px-6 py-3 rounded-lg font-medium cursor-pointer"
        style={buttonStyles[variant as keyof typeof buttonStyles] || buttonStyles.primary}
      >
        {(content.text as string) || 'Click Here'}
      </span>
    </div>
  );
}

// Pricing preview
function PricingPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const tiers = (content.tiers as any[]) || [];

  return (
    <div className="py-16 container mx-auto px-4">
      {content.title && (
        <h2 className="text-3xl font-bold text-center mb-4">{content.title as string}</h2>
      )}
      {content.subtitle && (
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{content.subtitle as string}</p>
      )}
      {tiers.length > 0 ? (
        <div className={cn('grid gap-6', tiers.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3')}>
          {tiers.map((tier: any, index: number) => (
            <div
              key={tier.id || index}
              className={cn(
                'rounded-lg border p-6 bg-card',
                tier.highlighted && 'border-primary ring-2 ring-primary/20'
              )}
            >
              <h3 className="font-semibold text-lg">{tier.name || 'Plan'}</h3>
              <div className="mt-4">
                <span className="text-3xl font-bold">{tier.price || '$0'}</span>
                <span className="text-muted-foreground">{tier.period || '/month'}</span>
              </div>
              {tier.description && (
                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
              )}
              <div className="mt-4 pt-4 border-t space-y-2">
                {(tier.features || '').split('\n').filter(Boolean).map((feature: string, i: number) => (
                  <p key={i} className="text-sm">✓ {feature}</p>
                ))}
              </div>
              {tier.cta_text && (
                <button
                  className="w-full mt-6 px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: tier.highlighted ? branding.colors.primary : 'transparent',
                    color: tier.highlighted ? 'white' : branding.colors.foreground,
                    border: tier.highlighted ? 'none' : '1px solid currentColor',
                  }}
                >
                  {tier.cta_text}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No pricing tiers yet. Use settings to add tiers.
        </div>
      )}
    </div>
  );
}

// Logo Cloud preview
function LogoCloudPreview({
  content,
  branding,
}: {
  content: Record<string, unknown>;
  branding: any;
}) {
  const logos = (content.logos as any[]) || [];

  return (
    <div className="py-16 container mx-auto px-4">
      {content.title && (
        <h2 className="text-xl font-medium text-center mb-8 text-muted-foreground">{content.title as string}</h2>
      )}
      {logos.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo: any, index: number) => (
            <div key={logo.id || index} className="flex items-center justify-center">
              {logo.image?.url ? (
                <img
                  src={logo.image.url}
                  alt={logo.name || ''}
                  className="h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                />
              ) : (
                <div className="h-10 w-24 bg-muted rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{logo.name || 'Logo'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          No logos yet. Use settings to add partner logos.
        </div>
      )}
    </div>
  );
}
