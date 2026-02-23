// Section Types - defines all available section types in the CMS

export type SectionType =
  | 'hero'
  | 'hero-with-form'
  | 'features'
  | 'testimonials'
  | 'cta'
  | 'text-block'
  | 'image-gallery'
  | 'stats'
  | 'faq'
  | 'contact'
  | 'team'
  | 'content-feed'
  | 'legacy-blocks'
  // Grid and layout sections
  | 'card-grid'
  | 'columns'
  | 'image'
  | 'button'
  | 'pricing'
  | 'logo-cloud'
  // HVAC-specific sections
  | 'services-grid'
  | 'service-area'
  | 'trust-badges'
  | 'contact-banner'
  | 'two-column'
  | 'product-grid'
  | 'video-embed';

// Database row type
export interface PageSection {
  id: string;
  page_id: string;
  section_type: SectionType;
  content_json: Record<string, unknown>;
  order: number;
  is_locked: boolean;
  is_visible: boolean;
  style_overrides?: Record<string, unknown>;
  reusable_id?: string;
  is_linked?: boolean;
  created_at: string;
  updated_at: string;
}

// Insert/Update types
export interface PageSectionInsert {
  page_id: string;
  section_type: SectionType;
  content_json?: Record<string, unknown>;
  order?: number;
  is_locked?: boolean;
  is_visible?: boolean;
  reusable_id?: string;
  is_linked?: boolean;
}

export interface PageSectionUpdate {
  section_type?: SectionType;
  content_json?: unknown;
  order?: number;
  is_locked?: boolean;
  is_visible?: boolean;
}

// Field types for the section registry
export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'link'
  | 'select'
  | 'checkbox'
  | 'color'
  | 'number'
  | 'repeater';

// Field definition for section schemas
export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  // For select type
  options?: { label: string; value: string }[];
  // For repeater type
  fields?: FieldDefinition[];
  // For number type
  min?: number;
  max?: number;
}

// Section type metadata
export interface SectionTypeConfig {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
  defaultContent: Record<string, unknown>;
}

// Content type interfaces for each section
export interface HeroContent {
  headline: string;
  subheadline: string;
  background_image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  cta_text: string;
  cta_link: string;
  overlay: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FeaturesContent {
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  company: string;
  avatar: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
}

export interface TestimonialsContent {
  title: string;
  items: TestimonialItem[];
}

export interface CTAContent {
  headline: string;
  description: string;
  button_text: string;
  button_link: string;
  background_color: string;
}

export interface TextBlockContent {
  heading: string;
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface GalleryImage {
  id: string;
  mediaId?: string;
  url: string;
  alt: string;
  caption: string;
}

export interface ImageGalleryContent {
  title: string;
  images: GalleryImage[];
}

export interface StatItem {
  id: string;
  number: string;
  label: string;
  description: string;
}

export interface StatsContent {
  title: string;
  items: StatItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQContent {
  title: string;
  items: FAQItem[];
}

export interface ContactContent {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  form_enabled: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
}

export interface TeamContent {
  title: string;
  members: TeamMember[];
}

// New content interfaces

export interface CardItem {
  id: string;
  title: string;
  description: string;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  link: string;
}

export interface CardGridContent {
  title: string;
  columns: '2' | '3' | '4';
  cards: CardItem[];
}

export interface ColumnItem {
  id: string;
  heading: string;
  content: string;
}

export interface ColumnsContent {
  title: string;
  columns: '2' | '3';
  items: ColumnItem[];
}

export interface ImageContent {
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  caption: string;
  link: string;
  alignment: 'left' | 'center' | 'right';
  max_width: string;
}

export interface ButtonContent {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'outline';
  alignment: 'left' | 'center' | 'right';
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta_text: string;
  cta_link: string;
  highlighted: boolean;
}

export interface PricingContent {
  title: string;
  subtitle: string;
  tiers: PricingTier[];
}

export interface LogoItem {
  id: string;
  name: string;
  image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  link: string;
}

export interface LogoCloudContent {
  title: string;
  logos: LogoItem[];
}

// Union type for all content types
export type SectionContent =
  | HeroContent
  | FeaturesContent
  | TestimonialsContent
  | CTAContent
  | TextBlockContent
  | ImageGalleryContent
  | StatsContent
  | FAQContent
  | ContactContent
  | TeamContent
  | CardGridContent
  | ColumnsContent
  | ImageContent
  | ButtonContent
  | PricingContent
  | LogoCloudContent;
