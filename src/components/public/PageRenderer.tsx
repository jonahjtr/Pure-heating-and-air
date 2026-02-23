import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useBrandingContext } from "@/contexts/BrandingContext";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { PageSection } from "@/types/sections";
import type {
  AccordionBlockContent,
  Block,
  ButtonBlockContent,
  CardGridBlockContent,
  ColumnsBlockContent,
  HeroBlockContent,
  ImageBlockContent,
  StyleOverrides,
  TextBlockContent,
} from "@/components/editor/types";

function isBlockArray(value: unknown): value is Block[] {
  return (
    Array.isArray(value) &&
    value.every(
      (b) =>
        b &&
        typeof b === "object" &&
        "type" in b &&
        "content" in b &&
        typeof (b as any).type === "string"
    )
  );
}

function safeUrl(url: string) {
  if (!url) return "";
  return url;
}

// Helper to get resolved styles (override or global branding)
function useBlockStyles(overrides?: StyleOverrides) {
  const { branding } = useBrandingContext();
  
  if (overrides?.useCustomStyles) {
    return {
      primary: overrides.primaryColor || branding.colors.primary,
      secondary: overrides.secondaryColor || branding.colors.secondary,
      accent: overrides.accentColor || branding.colors.accent,
      background: overrides.backgroundColor || branding.colors.background,
      foreground: overrides.textColor || branding.colors.foreground,
      headingFont: overrides.headingFont || branding.typography.headingFont,
      bodyFont: overrides.bodyFont || branding.typography.bodyFont,
      headingWeight: overrides.headingWeight || branding.typography.headingWeight,
      bodyWeight: overrides.bodyWeight || branding.typography.bodyWeight,
    };
  }
  
  return {
    primary: branding.colors.primary,
    secondary: branding.colors.secondary,
    accent: branding.colors.accent,
    background: branding.colors.background,
    foreground: branding.colors.foreground,
    headingFont: branding.typography.headingFont,
    bodyFont: branding.typography.bodyFont,
    headingWeight: branding.typography.headingWeight,
    bodyWeight: branding.typography.bodyWeight,
  };
}

interface PageRendererProps {
  title: string;
  seoDescription: string | null;
  blocks: unknown;
  sections?: PageSection[];
}

export function PageRenderer({
  title,
  seoDescription,
  blocks,
  sections = [],
}: PageRendererProps) {
  const parsedBlocks: Block[] = isBlockArray(blocks) ? blocks : [];
  const { branding } = useBrandingContext();

  // Filter visible sections
  const visibleSections = sections.filter((s) => s.is_visible);

  // Determine if we should render sections or blocks
  const useSections = visibleSections.length > 0;
  const hasBlocks = parsedBlocks.length > 0;

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: branding.colors.background,
        color: branding.colors.foreground,
        fontFamily: branding.typography.bodyFont,
      }}
    >
      {/* Single H1 for SEO */}
      <header className="sr-only">
        <h1>{title}</h1>
        {seoDescription ? <p>{seoDescription}</p> : null}
      </header>

      {/* Render sections if available */}
      {useSections && (
        <div>
          {visibleSections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* Render legacy blocks if no sections OR fallback content */}
      {(!useSections && hasBlocks) && (
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
          {parsedBlocks.map((block) => (
            <RenderedBlock key={block.id} block={block} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!useSections && !hasBlocks && (
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="text-center py-16 opacity-60">
            This page has no content yet.
          </div>
        </div>
      )}
    </div>
  );
}

function RenderedBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":
      return <HeroView content={block.content as HeroBlockContent} />;
    case "text":
      return <TextView content={block.content as TextBlockContent} />;
    case "image":
      return <ImageView content={block.content as ImageBlockContent} />;
    case "button":
      return <ButtonView content={block.content as ButtonBlockContent} />;
    case "columns":
      return <ColumnsView content={block.content as ColumnsBlockContent} />;
    case "card-grid":
      return <CardGridView content={block.content as CardGridBlockContent} />;
    case "accordion":
      return <AccordionView content={block.content as AccordionBlockContent} />;
    default:
      return null;
  }
}

function TextView({ content }: { content: TextBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  
  return (
    <section>
      <div
        className={cn(
          "text-base leading-7 whitespace-pre-wrap",
          content.alignment === "center" && "text-center",
          content.alignment === "right" && "text-right"
        )}
        style={{
          fontFamily: styles.bodyFont,
          fontWeight: styles.bodyWeight,
          color: content.styleOverrides?.useCustomStyles 
            ? styles.foreground
            : undefined,
        }}
      >
        {content.text}
      </div>
    </section>
  );
}

function ImageView({ content }: { content: ImageBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  
  if (!content.url) return null;
  return (
    <section>
      <figure className="space-y-2">
        <img
          src={content.url}
          alt={content.alt || "Image"}
          loading="lazy"
          className="w-full max-h-[70vh] object-contain rounded-lg"
          style={{
            backgroundColor: content.styleOverrides?.useCustomStyles 
              ? styles.secondary
              : undefined,
          }}
        />
        {content.caption ? (
          <figcaption 
            className="text-sm text-center opacity-70"
            style={{ fontFamily: styles.bodyFont }}
          >
            {content.caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function ButtonView({ content }: { content: ButtonBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  
  if (!content.text) return null;

  const href = safeUrl(content.url);
  const useCustom = content.styleOverrides?.useCustomStyles;

  // Custom inline styles when override is enabled
  const buttonStyle = useCustom ? {
    backgroundColor: content.variant === 'primary' 
      ? styles.primary
      : content.variant === 'secondary'
        ? styles.secondary
        : 'transparent',
    color: content.variant === 'primary'
      ? 'white'
      : styles.foreground,
    borderColor: content.variant === 'outline' 
      ? styles.primary
      : undefined,
    fontFamily: styles.bodyFont,
  } : undefined;

  const variant =
    content.variant === "secondary"
      ? "secondary"
      : content.variant === "outline"
        ? "outline"
        : "default";

  return (
    <section>
      <div
        className={cn(
          "flex",
          content.alignment === "center" && "justify-center",
          content.alignment === "right" && "justify-end"
        )}
      >
        {href ? (
          <Button 
            asChild 
            variant={useCustom ? undefined : variant as any}
            style={buttonStyle}
            className={useCustom ? "px-4 py-2 rounded-md font-medium border" : undefined}
          >
            <a href={href}>{content.text}</a>
          </Button>
        ) : (
          <Button 
            variant={useCustom ? undefined : variant as any} 
            disabled
            style={buttonStyle}
            className={useCustom ? "px-4 py-2 rounded-md font-medium border" : undefined}
          >
            {content.text}
          </Button>
        )}
      </div>
    </section>
  );
}

function HeroView({ content }: { content: HeroBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  const hasBg = Boolean(content.backgroundUrl);
  const useCustom = content.styleOverrides?.useCustomStyles;
  
  return (
    <section>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          hasBg ? "min-h-[360px]" : "min-h-[240px]",
          "flex items-center"
        )}
        style={{
          backgroundImage: hasBg ? `url(${content.backgroundUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: !hasBg && useCustom 
            ? styles.secondary
            : !hasBg ? 'hsl(var(--muted))' : undefined,
        }}
      >
        {content.overlay && hasBg ? (
          <div className="absolute inset-0 bg-black/50" />
        ) : null}

        <div
          className={cn(
            "relative w-full px-6 py-16 text-center",
          )}
          style={{
            color: content.overlay && hasBg 
              ? 'white' 
              : useCustom 
                ? styles.foreground
                : undefined,
          }}
        >
          {content.title ? (
            <h2 
              className="text-4xl md:text-5xl tracking-tight"
              style={{
                fontFamily: styles.headingFont,
                fontWeight: styles.headingWeight,
              }}
            >
              {content.title}
            </h2>
          ) : null}
          {content.subtitle ? (
            <p
              className="mt-4 text-base md:text-lg opacity-85"
              style={{ fontFamily: styles.bodyFont }}
            >
              {content.subtitle}
            </p>
          ) : null}

          {content.buttonText ? (
            <div className="mt-8 flex justify-center">
              <Button 
                asChild
                style={useCustom ? {
                  backgroundColor: styles.primary,
                  color: 'white',
                } : undefined}
              >
                <a href={safeUrl(content.buttonUrl)}>{content.buttonText}</a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ColumnsView({ content }: { content: ColumnsBlockContent }) {
  const cols = content.columns === 3 ? 3 : 2;
  return (
    <section>
      <div className={cn("grid gap-6", cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {content.blocks.map((column, idx) => (
          <div key={idx} className="space-y-6">
            {column.map((b) => (
              <RenderedBlock key={b.id} block={b} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CardGridView({ content }: { content: CardGridBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  const useCustom = content.styleOverrides?.useCustomStyles;
  const cols = content.columns;
  
  return (
    <section>
      <div
        className={cn(
          "grid gap-5",
          cols === 2 && "sm:grid-cols-2",
          cols === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          cols === 4 && "sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {content.cards.map((card) => {
          const href = safeUrl(card.linkUrl);
          const Wrapper: any = href ? "a" : "div";
          return (
            <Wrapper
              key={card.id}
              href={href || undefined}
              className={cn(
                "block rounded-xl border overflow-hidden",
                href && "hover:opacity-90 transition-opacity"
              )}
              style={{
                backgroundColor: useCustom 
                  ? styles.background
                  : 'hsl(var(--card))',
                borderColor: useCustom
                  ? styles.secondary
                  : undefined,
              }}
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.title || "Card image"}
                  loading="lazy"
                  className="w-full h-44 object-cover"
                />
              ) : null}
              <div className="p-5 space-y-2">
                {card.title ? (
                  <h3 
                    className="leading-6"
                    style={{
                      fontFamily: styles.headingFont,
                      fontWeight: styles.headingWeight,
                      color: useCustom ? styles.foreground : undefined,
                    }}
                  >
                    {card.title}
                  </h3>
                ) : null}
                {card.description ? (
                  <p 
                    className="text-sm opacity-70"
                    style={{ fontFamily: styles.bodyFont }}
                  >
                    {card.description}
                  </p>
                ) : null}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
}

function AccordionView({ content }: { content: AccordionBlockContent }) {
  const styles = useBlockStyles(content.styleOverrides);
  
  if (!content.items?.length) return null;

  return (
    <section 
      style={{ 
        fontFamily: styles.bodyFont,
      }}
    >
      <Accordion type="single" collapsible className="w-full">
        {content.items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger 
              style={{ 
                fontFamily: styles.headingFont,
                fontWeight: styles.headingWeight,
              }}
            >
              {item.title}
            </AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
