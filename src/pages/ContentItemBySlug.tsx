import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { useSiteLayout } from "@/contexts/SiteLayoutContext";
import { ChevronLeft, Check, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentTypeRow = {
  id: string;
  name: string;
  slug: string;
  fields: unknown;
  page_id: string | null;
};

type ContentItemRow = {
  id: string;
  title: string;
  slug: string;
  data: Record<string, unknown>;
  status: string;
  published_at: string | null;
  created_at: string;
};

type PageRow = {
  slug: string;
  title: string;
};

export default function ContentItemBySlug() {
  const { typeSlug, itemSlug } = useParams();
  const { header, footer, loading: layoutLoading } = useSiteLayout();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [contentType, setContentType] = useState<ContentTypeRow | null>(null);
  const [item, setItem] = useState<ContentItemRow | null>(null);
  const [parentPage, setParentPage] = useState<PageRow | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // For /services/:itemSlug route, typeSlug will be undefined
  const effectiveTypeSlug = typeSlug || "services";
  const effectiveItemSlug = itemSlug;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!effectiveItemSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      let foundContentType: ContentTypeRow | null = null;
      let foundParentPage: PageRow | null = null;

      // Strategy 1: Check if typeSlug matches a page with a content_type_id
      const { data: pageData } = await supabase
        .from("pages")
        .select("id, slug, title, content_type_id")
        .eq("slug", effectiveTypeSlug)
        .maybeSingle();

      if (cancelled) return;

      if (pageData?.content_type_id) {
        // Found a page that's linked to a content type
        const { data: ctData } = await supabase
          .from("content_types")
          .select("id, name, slug, fields, page_id")
          .eq("id", pageData.content_type_id)
          .maybeSingle();

        if (cancelled) return;

        if (ctData) {
          foundContentType = ctData as ContentTypeRow;
          foundParentPage = { slug: pageData.slug, title: pageData.title };
        }
      }

      // Strategy 2: If not found, check if typeSlug matches a content type slug directly
      if (!foundContentType) {
        const { data: ctData } = await supabase
          .from("content_types")
          .select("id, name, slug, fields, page_id")
          .eq("slug", effectiveTypeSlug)
          .maybeSingle();

        if (cancelled) return;

        if (ctData) {
          foundContentType = ctData as ContentTypeRow;

          // Get the parent page if it exists
          if (ctData.page_id) {
            const { data: masterPage } = await supabase
              .from("pages")
              .select("slug, title")
              .eq("id", ctData.page_id)
              .maybeSingle();

            if (!cancelled && masterPage) {
              foundParentPage = masterPage;
            }
          } else {
            // Default parent for services
            foundParentPage = { slug: "services", title: "Services" };
          }
        }
      }

      if (cancelled) return;

      if (!foundContentType) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setContentType(foundContentType);
      setParentPage(foundParentPage);

      // Fetch the content item by slug
      const { data: itemData, error: itemError } = await supabase
        .from("content_type_items")
        .select("id, title, slug, data, status, published_at, created_at")
        .eq("content_type_id", foundContentType.id)
        .eq("slug", effectiveItemSlug)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;

      if (itemError || !itemData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setItem(itemData as ContentItemRow);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveTypeSlug, effectiveItemSlug]);

  useEffect(() => {
    if (!item || !contentType) return;
    document.title = `${item.title} | Pure Heating & Air`;
  }, [item, contentType]);

  if (loading || layoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (notFound || !item || !contentType) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader config={header} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Content not found</h1>
            <p className="text-sm text-muted-foreground">
              /{effectiveTypeSlug}/{effectiveItemSlug}
            </p>
          </div>
        </div>
        <SiteFooter config={footer} />
      </div>
    );
  }

  // Parse item data
  const data = item.data || {};
  const shortDescription = data.short_description as string | undefined;
  const fullDescription = data.full_description as string | undefined;
  const benefits = (data.benefits as string[]) || [];
  const faqs = (data.faqs as Array<{ question: string; answer: string }>) || [];
  const heroImage = data.hero_image as { url?: string } | null;

  // Product-specific fields
  const productImage = data.product_image as { url?: string; alt?: string } | null;
  const price = data.price as number | undefined;
  const salePrice = data.sale_price as number | undefined;
  const productDescription = data.description as string | undefined;
  const sku = data.sku as string | undefined;
  const brand = data.brand as string | undefined;
  const category = data.category as string | undefined;
  const specifications = data.specifications as string | undefined;
  const inStock = data.in_stock as boolean | undefined;

  // Check if this is a product content type
  const isProductType = contentType.slug === "products" || contentType.slug === "shop";

  // Check if this is a service content type (has specific service fields)
  const isServiceType = !isProductType && (contentType.slug === "services" || 
    Boolean(shortDescription || fullDescription || benefits.length > 0));

  if (isServiceType) {
    // Render service page layout
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader config={header} />
        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-primary text-primary-foreground py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                {parentPage && (
                  <Link 
                    to={`/${parentPage.slug}`}
                    className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to {parentPage.title}
                  </Link>
                )}
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  {item.title}
                </h1>
                {shortDescription && (
                  <p className="text-xl text-primary-foreground/90 max-w-2xl">
                    {shortDescription}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="tel:8595557873"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (859) 555-PURE
                  </a>
                  <Link to="/contact">
                    <Button size="lg" variant="secondary">
                      Get a Free Estimate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Main content */}
                <div className="lg:col-span-2">
                  {fullDescription && (
                    <div 
                      className="prose prose-lg max-w-none mb-12"
                      dangerouslySetInnerHTML={{ __html: fullDescription }}
                    />
                  )}

                  {/* FAQs */}
                  {faqs.length > 0 && (
                    <div className="mt-12">
                      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <div 
                            key={index}
                            className="border rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                              className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-muted/50 transition-colors"
                            >
                              {faq.question}
                              {expandedFaq === index ? (
                                <ChevronUp className="w-5 h-5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground" />
                              )}
                            </button>
                            {expandedFaq === index && (
                              <div className="p-4 pt-0 text-muted-foreground">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  {/* Benefits Card */}
                  {benefits.length > 0 && (
                    <div className="bg-muted rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold mb-4">Why Choose Us</h3>
                      <ul className="space-y-3">
                        {benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Card */}
                  <div className="bg-primary text-primary-foreground rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-2">Ready to Get Started?</h3>
                    <p className="text-primary-foreground/80 mb-4">
                      Contact us today for a free estimate on your {item.title.toLowerCase()} needs.
                    </p>
                    <a
                      href="tel:8595557873"
                      className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-3 rounded-lg font-bold transition-colors w-full mb-3"
                    >
                      <Phone className="w-5 h-5" />
                      (859) 555-PURE
                    </a>
                    <Link to="/contact" className="block">
                      <Button variant="secondary" className="w-full">
                        Schedule Service
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Banner */}
          <section className="bg-accent text-accent-foreground py-12">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Need {item.title} Service?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Our expert technicians are ready to help
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="tel:8595557873"
                  className="inline-flex items-center gap-2 bg-white text-accent px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call (859) 555-PURE
                </a>
                <Link to="/contact">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Get a Free Estimate
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter config={footer} />
      </div>
    );
  }

  // Product detail layout
  if (isProductType) {
    const hasDiscount = salePrice && salePrice < (price || 0);
    const displayPrice = hasDiscount ? salePrice : price;

    const formatPrice = (p: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(p);
    };

    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader config={header} />
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
              <Link to="/shop">
                <ChevronLeft className="h-4 w-4" />
                Back to Shop
              </Link>
            </Button>
          </div>

          {/* Product Content */}
          <section className="container mx-auto px-4 pb-16">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                  {productImage?.url ? (
                    <img
                      src={productImage.url}
                      alt={productImage.alt || item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  *Sizing may vary. Please call for details.
                </p>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Category & Brand */}
                {(category || brand) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {brand && <span className="font-medium">{brand}</span>}
                    {brand && category && <span>•</span>}
                    {category && <span>{category}</span>}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {item.title}
                </h1>

                {/* SKU */}
                {sku && (
                  <p className="text-sm text-muted-foreground">
                    Part #: <span className="font-mono">{sku}</span>
                  </p>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {inStock !== false ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <Check className="w-4 h-4" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Price */}
                {price !== undefined && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(displayPrice || 0)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(price)}
                      </span>
                    )}
                  </div>
                )}

                {/* Short Description */}
                {shortDescription && (
                  <p className="text-lg text-muted-foreground">
                    {shortDescription}
                  </p>
                )}

                {/* Call to Order CTA */}
                <div className="bg-muted rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold">Ready to Order?</h3>
                  <p className="text-sm text-muted-foreground">
                    Call us to place your order or ask questions about this product.
                  </p>
                  <a
                    href="tel:8595557873"
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors w-full"
                  >
                    <Phone className="w-5 h-5" />
                    (859) 555-PURE
                  </a>
                </div>

                {/* Specifications */}
                {specifications && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3">Specifications</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {specifications}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description */}
            {productDescription && (
              <div className="mt-12 border-t pt-12">
                <h2 className="text-2xl font-bold mb-6">Product Details</h2>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: productDescription }}
                />
              </div>
            )}
          </section>

          {/* Contact Banner */}
          <section className="bg-primary text-primary-foreground py-12">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Need Help Finding the Right Part?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Our HVAC experts can help you find exactly what you need
              </p>
              <a
                href="tel:8595557873"
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (859) 555-PURE
              </a>
            </div>
          </section>
        </main>
        <SiteFooter config={footer} />
      </div>
    );
  }

  // Default article layout for non-service content types
  const fields = Array.isArray(contentType.fields) ? contentType.fields : [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader config={header} />
      <main className="flex-1">
        <article className="container max-w-4xl mx-auto py-12 px-4">
          {/* Breadcrumb / Back link */}
          {parentPage && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
                <Link to={`/${parentPage.slug}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Back to {parentPage.title}
                </Link>
              </Button>
            </div>
          )}

          {/* Title */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {item.title}
            </h1>
            {item.published_at && (
              <p className="text-sm text-muted-foreground">
                Published on{" "}
                {new Date(item.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </header>

          {/* Dynamic content based on fields */}
          <div className="prose prose-lg max-w-none">
            {fields.map((field: any) => {
              const value = item.data[field.name];
              if (value === undefined || value === null || value === "") return null;

              switch (field.type) {
                case "text":
                case "textarea":
                  return (
                    <div key={field.name} className="mb-6">
                      {field.label && field.type !== "textarea" && (
                        <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
                      )}
                      <p className="whitespace-pre-wrap">{String(value)}</p>
                    </div>
                  );

                case "richtext":
                  return (
                    <div
                      key={field.name}
                      className="mb-6"
                      dangerouslySetInnerHTML={{ __html: String(value) }}
                    />
                  );

                case "image":
                case "media":
                  const imageUrl = typeof value === "object" && value !== null 
                    ? (value as any).url 
                    : String(value);
                  if (!imageUrl) return null;
                  return (
                    <figure key={field.name} className="mb-6">
                      <img
                        src={imageUrl}
                        alt={field.label || ""}
                        className="w-full rounded-lg"
                      />
                      {field.label && (
                        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
                          {field.label}
                        </figcaption>
                      )}
                    </figure>
                  );

                case "date":
                  return (
                    <div key={field.name} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
                      <p>
                        {new Date(String(value)).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );

                case "link":
                  const linkValue = typeof value === "object" && value !== null
                    ? value as { url?: string; text?: string }
                    : { url: String(value), text: String(value) };
                  if (!linkValue.url) return null;
                  return (
                    <div key={field.name} className="mb-6">
                      <a
                        href={linkValue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {linkValue.text || linkValue.url}
                      </a>
                    </div>
                  );

                default:
                  if (typeof value === "string" || typeof value === "number") {
                    return (
                      <div key={field.name} className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
                        <p>{String(value)}</p>
                      </div>
                    );
                  }
                  return null;
              }
            })}
          </div>
        </article>
      </main>
      <SiteFooter config={footer} />
    </div>
  );
}
