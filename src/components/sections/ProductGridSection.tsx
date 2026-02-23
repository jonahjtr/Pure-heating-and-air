import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Tag } from "lucide-react";

interface ProductGridContent {
  content_type_slug?: string;
  title?: string;
  show_filters?: boolean;
  show_price?: boolean;
  columns?: "2" | "3" | "4";
  items_per_page?: number;
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  data: {
    product_image?: { url?: string; alt?: string } | null;
    price?: number;
    sale_price?: number;
    short_description?: string;
    category?: string;
    sku?: string;
    brand?: string;
    in_stock?: boolean;
  };
}

interface ProductGridSectionProps {
  content: ProductGridContent;
}

export function ProductGridSection({ content }: ProductGridSectionProps) {
  const {
    content_type_slug = "products",
    title = "Shop Our Products",
    show_filters = true,
    show_price = true,
    columns = "3",
    items_per_page = 12,
  } = content;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      // First get the content type ID
      const { data: contentType } = await supabase
        .from("content_types")
        .select("id")
        .eq("slug", content_type_slug)
        .maybeSingle();

      if (!contentType) {
        setLoading(false);
        return;
      }

      // Fetch products
      const { data: items } = await supabase
        .from("content_type_items")
        .select("id, title, slug, data")
        .eq("content_type_id", contentType.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(items_per_page);

      if (items) {
        setProducts(items as ProductItem[]);

        // Extract unique categories
        const cats = new Set<string>();
        items.forEach((item) => {
          const cat = (item.data as any)?.category;
          if (cat) cats.add(cat);
        });
        setCategories(Array.from(cats).sort());
      }

      setLoading(false);
    }

    fetchProducts();
  }, [content_type_slug, items_per_page]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.data.category === selectedCategory)
    : products;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 container mx-auto px-4">
        <div className="text-center text-muted-foreground">Loading products...</div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground">No products available yet.</p>
      </section>
    );
  }

  return (
    <section className="py-16 container mx-auto px-4">
      {title && (
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      )}

      {/* Category Filters */}
      {show_filters && categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Products
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div
        className={cn(
          "grid gap-6",
          columns === "2" && "md:grid-cols-2",
          columns === "3" && "md:grid-cols-2 lg:grid-cols-3",
          columns === "4" && "md:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {filteredProducts.map((product) => {
          const {
            product_image,
            price,
            sale_price,
            short_description,
            category,
            sku,
            brand,
            in_stock,
          } = product.data;

          const hasDiscount = sale_price && sale_price < (price || 0);
          const displayPrice = hasDiscount ? sale_price : price;

          return (
            <Link
              key={product.id}
              to={`/shop/${product.slug}`}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-muted overflow-hidden">
                {product_image?.url ? (
                  <img
                    src={product_image.url}
                    alt={product_image.alt || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}

                {/* Sale Badge */}
                {hasDiscount && (
                  <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
                    SALE
                  </div>
                )}

                {/* Out of Stock */}
                {in_stock === false && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-2">
                {/* Category & Brand */}
                {(category || brand) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {brand && <span>{brand}</span>}
                    {brand && category && <span>•</span>}
                    {category && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {category}
                      </span>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                  {product.title}
                </h3>

                {/* SKU */}
                {sku && (
                  <p className="text-xs text-muted-foreground">SKU: {sku}</p>
                )}

                {/* Description */}
                {short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {short_description}
                  </p>
                )}

                {/* Price */}
                {show_price && price !== undefined && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(displayPrice || 0)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(price)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Call to Order CTA */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          Questions? Call us to order or get sizing help.
        </p>
        <a
          href="tel:8595557873"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          <Phone className="w-5 h-5" />
          (859) 555-PURE
        </a>
      </div>
    </section>
  );
}
