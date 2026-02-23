import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface ContentFeedContent {
  content_type_slug: string;
  title?: string;
  display_style: 'grid' | 'list' | 'cards' | 'compact';
  items_per_page: number;
  show_date: boolean;
  show_excerpt: boolean;
  link_to_detail: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  data: Json;
  created_at: string;
  published_at: string | null;
}

interface ContentFeedSectionProps {
  content: ContentFeedContent;
}

export function ContentFeedSection({ content }: ContentFeedSectionProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentTypeName, setContentTypeName] = useState<string>('');

  useEffect(() => {
    const fetchItems = async () => {
      if (!content.content_type_slug) {
        setLoading(false);
        return;
      }

      try {
        // First get the content type ID from slug
        const { data: contentType, error: ctError } = await supabase
          .from('content_types')
          .select('id, name')
          .eq('slug', content.content_type_slug)
          .single();

        if (ctError || !contentType) {
          console.error('Content type not found:', content.content_type_slug);
          setLoading(false);
          return;
        }

        setContentTypeName(contentType.name);

        // Fetch published items
        const { data: itemsData, error: itemsError } = await supabase
          .from('content_type_items')
          .select('*')
          .eq('content_type_id', contentType.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(content.items_per_page || 10);

        if (itemsError) throw itemsError;
        setItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching content items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [content.content_type_slug, content.items_per_page]);

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!content.content_type_slug) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>Please select a content type to display</p>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {content.title && (
            <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
          )}
          <p className="text-muted-foreground">No {contentTypeName} items found</p>
        </div>
      </section>
    );
  }

  const getExcerpt = (data: Json): string => {
    if (!data || typeof data !== 'object') return '';
    const obj = data as Record<string, unknown>;
    // Look for common excerpt/description fields
    const excerptField = obj.excerpt || obj.description || obj.summary || obj.content;
    if (typeof excerptField === 'string') {
      return excerptField.slice(0, 150) + (excerptField.length > 150 ? '...' : '');
    }
    return '';
  };

  const getImage = (data: Json): string | null => {
    if (!data || typeof data !== 'object') return null;
    const obj = data as Record<string, unknown>;
    // Look for common image fields
    const imageField = obj.image || obj.featured_image || obj.thumbnail || obj.cover;
    if (typeof imageField === 'string') return imageField;
    if (imageField && typeof imageField === 'object' && 'url' in (imageField as Record<string, unknown>)) {
      return (imageField as Record<string, string>).url;
    }
    return null;
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => {
        const image = getImage(item.data);
        const ItemWrapper = content.link_to_detail ? Link : 'div';
        const wrapperProps = content.link_to_detail 
          ? { to: `/${content.content_type_slug}/${item.slug}` } 
          : {};

        return (
          <ItemWrapper 
            key={item.id} 
            {...wrapperProps as any}
            className="group"
          >
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
              {image && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                {content.show_date && item.published_at && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.published_at), 'MMM d, yyyy')}
                  </p>
                )}
              </CardHeader>
              {content.show_excerpt && (
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {getExcerpt(item.data)}
                  </p>
                </CardContent>
              )}
            </Card>
          </ItemWrapper>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {items.map((item) => {
        const image = getImage(item.data);
        const ItemWrapper = content.link_to_detail ? Link : 'div';
        const wrapperProps = content.link_to_detail 
          ? { to: `/${content.content_type_slug}/${item.slug}` } 
          : {};

        return (
          <ItemWrapper 
            key={item.id} 
            {...wrapperProps as any}
            className="block"
          >
            <Card className="transition-shadow hover:shadow-lg">
              <div className="flex gap-4 p-4">
                {image && (
                  <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-md">
                    <img 
                      src={image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                  {content.show_date && item.published_at && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(item.published_at), 'MMM d, yyyy')}
                    </p>
                  )}
                  {content.show_excerpt && (
                    <p className="text-muted-foreground line-clamp-2">
                      {getExcerpt(item.data)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </ItemWrapper>
        );
      })}
    </div>
  );

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {items.map((item) => {
        const image = getImage(item.data);
        const ItemWrapper = content.link_to_detail ? Link : 'div';
        const wrapperProps = content.link_to_detail 
          ? { to: `/${content.content_type_slug}/${item.slug}` } 
          : {};

        return (
          <ItemWrapper 
            key={item.id} 
            {...wrapperProps as any}
            className="group"
          >
            <article className="bg-card rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-xl border">
              {image && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img 
                    src={image} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {content.show_date && item.published_at && (
                  <time className="text-sm text-muted-foreground block mb-3">
                    {format(new Date(item.published_at), 'MMMM d, yyyy')}
                  </time>
                )}
                {content.show_excerpt && (
                  <p className="text-muted-foreground">
                    {getExcerpt(item.data)}
                  </p>
                )}
              </div>
            </article>
          </ItemWrapper>
        );
      })}
    </div>
  );

  const renderCompactView = () => (
    <ul className="divide-y divide-border">
      {items.map((item) => {
        const ItemWrapper = content.link_to_detail ? Link : 'div';
        const wrapperProps = content.link_to_detail 
          ? { to: `/${content.content_type_slug}/${item.slug}` } 
          : {};

        return (
          <li key={item.id}>
            <ItemWrapper 
              {...wrapperProps as any}
              className="flex items-center justify-between py-3 hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
            >
              <span className="font-medium">{item.title}</span>
              {content.show_date && item.published_at && (
                <time className="text-sm text-muted-foreground">
                  {format(new Date(item.published_at), 'MMM d, yyyy')}
                </time>
              )}
            </ItemWrapper>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <h2 className="text-3xl font-bold mb-8 text-center">{content.title}</h2>
        )}
        
        {content.display_style === 'grid' && renderGridView()}
        {content.display_style === 'list' && renderListView()}
        {content.display_style === 'cards' && renderCardsView()}
        {content.display_style === 'compact' && renderCompactView()}
      </div>
    </section>
  );
}
