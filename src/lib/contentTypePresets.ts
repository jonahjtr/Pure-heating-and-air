// Content Type Presets - Pre-configured content types with appropriate fields

export interface ContentTypePreset {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  fields: PresetField[];
}

export interface PresetField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'number' | 'date' | 'image' | 'select' | 'checkbox' | 'repeater' | 'link';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export const contentTypePresets: ContentTypePreset[] = [
  {
    id: 'blogs',
    name: 'Blog Posts',
    slug: 'blog',
    description: 'Articles and blog posts with featured images, categories, and rich content',
    icon: 'file-text',
    fields: [
      { id: 'f1', name: 'featured_image', label: 'Featured Image', type: 'image', required: false },
      { id: 'f2', name: 'excerpt', label: 'Excerpt', type: 'textarea', required: false, placeholder: 'A brief summary of the post...' },
      { id: 'f3', name: 'content', label: 'Content', type: 'richtext', required: true },
      { id: 'f4', name: 'category', label: 'Category', type: 'select', required: false, options: ['News', 'Tutorial', 'Case Study', 'Opinion', 'Announcement'] },
      { id: 'f5', name: 'tags', label: 'Tags', type: 'text', required: false, placeholder: 'Comma-separated tags' },
      { id: 'f6', name: 'author_name', label: 'Author Name', type: 'text', required: false },
      { id: 'f7', name: 'reading_time', label: 'Reading Time (minutes)', type: 'number', required: false },
    ],
  },
  {
    id: 'videos',
    name: 'Videos',
    slug: 'videos',
    description: 'Video content with thumbnails, embed URLs, and descriptions',
    icon: 'video',
    fields: [
      { id: 'f1', name: 'thumbnail', label: 'Thumbnail', type: 'image', required: false },
      { id: 'f2', name: 'video_url', label: 'Video URL', type: 'text', required: true, placeholder: 'YouTube or Vimeo URL' },
      { id: 'f3', name: 'description', label: 'Description', type: 'richtext', required: false },
      { id: 'f4', name: 'duration', label: 'Duration', type: 'text', required: false, placeholder: '5:30' },
      { id: 'f5', name: 'category', label: 'Category', type: 'select', required: false, options: ['Tutorial', 'Interview', 'Webinar', 'Demo', 'Behind the Scenes'] },
      { id: 'f6', name: 'featured', label: 'Featured Video', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'gallery',
    name: 'Gallery',
    slug: 'gallery',
    description: 'Image galleries and photo collections with captions',
    icon: 'images',
    fields: [
      { id: 'f1', name: 'cover_image', label: 'Cover Image', type: 'image', required: true },
      { id: 'f2', name: 'description', label: 'Description', type: 'textarea', required: false },
      { id: 'f3', name: 'category', label: 'Category', type: 'select', required: false, options: ['Portfolio', 'Events', 'Products', 'Team', 'Locations'] },
      { id: 'f4', name: 'location', label: 'Location', type: 'text', required: false, placeholder: 'Where was this taken?' },
      { id: 'f5', name: 'date_taken', label: 'Date', type: 'date', required: false },
      { id: 'f6', name: 'photographer', label: 'Photographer', type: 'text', required: false },
    ],
  },
  {
    id: 'reviews',
    name: 'Reviews',
    slug: 'reviews',
    description: 'Customer reviews and testimonials with ratings',
    icon: 'star',
    fields: [
      { id: 'f1', name: 'reviewer_name', label: 'Reviewer Name', type: 'text', required: true },
      { id: 'f2', name: 'reviewer_photo', label: 'Reviewer Photo', type: 'image', required: false },
      { id: 'f3', name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
      { id: 'f4', name: 'review_text', label: 'Review', type: 'textarea', required: true },
      { id: 'f5', name: 'company', label: 'Company/Organization', type: 'text', required: false },
      { id: 'f6', name: 'position', label: 'Position/Title', type: 'text', required: false },
      { id: 'f7', name: 'verified', label: 'Verified Purchase', type: 'checkbox', required: false },
      { id: 'f8', name: 'product_service', label: 'Product/Service', type: 'text', required: false },
    ],
  },
  {
    id: 'before-after',
    name: 'Before & After',
    slug: 'before-after',
    description: 'Transformation showcases with before/after images',
    icon: 'git-compare',
    fields: [
      { id: 'f1', name: 'before_image', label: 'Before Image', type: 'image', required: true },
      { id: 'f2', name: 'after_image', label: 'After Image', type: 'image', required: true },
      { id: 'f3', name: 'description', label: 'Description', type: 'richtext', required: false },
      { id: 'f4', name: 'category', label: 'Category', type: 'select', required: false, options: ['Renovation', 'Design', 'Fitness', 'Beauty', 'Restoration'] },
      { id: 'f5', name: 'duration', label: 'Transformation Duration', type: 'text', required: false, placeholder: 'e.g., 3 months' },
      { id: 'f6', name: 'client_name', label: 'Client Name', type: 'text', required: false },
      { id: 'f7', name: 'featured', label: 'Featured', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'news',
    name: 'News',
    slug: 'news',
    description: 'News articles and press releases',
    icon: 'newspaper',
    fields: [
      { id: 'f1', name: 'featured_image', label: 'Featured Image', type: 'image', required: false },
      { id: 'f2', name: 'headline', label: 'Headline', type: 'text', required: true },
      { id: 'f3', name: 'summary', label: 'Summary', type: 'textarea', required: true, placeholder: 'Brief news summary...' },
      { id: 'f4', name: 'content', label: 'Full Article', type: 'richtext', required: true },
      { id: 'f5', name: 'category', label: 'Category', type: 'select', required: false, options: ['Company News', 'Press Release', 'Industry', 'Awards', 'Events'] },
      { id: 'f6', name: 'source', label: 'Source', type: 'text', required: false },
      { id: 'f7', name: 'breaking', label: 'Breaking News', type: 'checkbox', required: false },
    ],
  },
  {
    id: 'shop',
    name: 'Products',
    slug: 'products',
    description: 'HVAC parts, filters, and equipment for sale',
    icon: 'shopping-bag',
    fields: [
      { id: 'f1', name: 'product_image', label: 'Product Image', type: 'image', required: true },
      { id: 'f2', name: 'price', label: 'Price', type: 'number', required: true },
      { id: 'f3', name: 'sale_price', label: 'Sale Price', type: 'number', required: false },
      { id: 'f4', name: 'short_description', label: 'Short Description', type: 'textarea', required: true, placeholder: 'Brief product description...' },
      { id: 'f5', name: 'description', label: 'Full Description', type: 'richtext', required: true },
      { id: 'f6', name: 'sku', label: 'SKU / Part Number', type: 'text', required: false },
      { id: 'f7', name: 'brand', label: 'Brand', type: 'text', required: false },
      { id: 'f8', name: 'category', label: 'Category', type: 'select', required: false, options: ['Air Filters', 'Replacement Parts', 'Thermostats', 'UV Products', 'Accessories', 'Other'] },
      { id: 'f9', name: 'specifications', label: 'Specifications', type: 'textarea', required: false, placeholder: 'Size, weight, compatibility, etc.' },
      { id: 'f10', name: 'in_stock', label: 'In Stock', type: 'checkbox', required: false },
      { id: 'f11', name: 'featured', label: 'Featured Product', type: 'checkbox', required: false },
    ],
  },
];

export function getPresetById(id: string): ContentTypePreset | undefined {
  return contentTypePresets.find(p => p.id === id);
}
