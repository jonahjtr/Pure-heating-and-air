import type { SectionType, SectionTypeConfig, FieldDefinition } from '@/types/sections';

// Registry of all section types with their schemas and defaults
export const sectionRegistry: Record<SectionType, SectionTypeConfig> = {
  hero: {
    type: 'hero',
    label: 'Hero Section',
    description: 'A prominent banner with headline, subheadline, and call-to-action',
    icon: 'image',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', required: true, placeholder: 'Enter headline...' },
      { name: 'subheadline', label: 'Subheadline', type: 'textarea', placeholder: 'Enter subheadline...' },
      { name: 'background_image', label: 'Background Image', type: 'image' },
      { name: 'cta_text', label: 'Button Text', type: 'text', placeholder: 'Get Started' },
      { name: 'cta_link', label: 'Button Link', type: 'link', placeholder: '/signup' },
      { name: 'overlay', label: 'Show Overlay', type: 'checkbox', defaultValue: true },
    ],
    defaultContent: {
      headline: 'Welcome to Our Platform',
      subheadline: 'The best solution for your needs',
      background_image: null,
      cta_text: 'Get Started',
      cta_link: '#',
      overlay: true,
    },
  },

  features: {
    type: 'features',
    label: 'Features Section',
    description: 'Showcase key features with icons and descriptions',
    icon: 'grid-3x3',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Our Features' },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea', placeholder: 'What makes us different' },
      {
        name: 'items',
        label: 'Features',
        type: 'repeater',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'icon', label: 'Icon Name', type: 'text', placeholder: 'star' },
        ],
      },
    ],
    defaultContent: {
      title: 'Our Features',
      subtitle: 'Everything you need to succeed',
      items: [],
    },
  },

  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Customer quotes and reviews',
    icon: 'quote',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'What Our Clients Say' },
      {
        name: 'items',
        label: 'Testimonials',
        type: 'repeater',
        fields: [
          { name: 'quote', label: 'Quote', type: 'textarea', required: true },
          { name: 'author', label: 'Author Name', type: 'text', required: true },
          { name: 'company', label: 'Company', type: 'text' },
          { name: 'avatar', label: 'Avatar', type: 'image' },
        ],
      },
    ],
    defaultContent: {
      title: 'What Our Clients Say',
      items: [],
    },
  },

  cta: {
    type: 'cta',
    label: 'Call to Action',
    description: 'Prominent call-to-action banner',
    icon: 'megaphone',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'button_text', label: 'Button Text', type: 'text', placeholder: 'Learn More' },
      { name: 'button_link', label: 'Button Link', type: 'link' },
      { name: 'background_color', label: 'Background Color', type: 'color', defaultValue: '#3b82f6' },
    ],
    defaultContent: {
      headline: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today.',
      button_text: 'Sign Up Now',
      button_link: '/signup',
      background_color: '#3b82f6',
    },
  },

  'text-block': {
    type: 'text-block',
    label: 'Text Block',
    description: 'Rich text content with heading',
    icon: 'file-text',
    fields: [
      { name: 'heading', label: 'Heading', type: 'text' },
      { name: 'content', label: 'Content', type: 'richtext', required: true },
      {
        name: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'left',
      },
    ],
    defaultContent: {
      heading: '',
      content: '',
      alignment: 'left',
    },
  },

  'image-gallery': {
    type: 'image-gallery',
    label: 'Image Gallery',
    description: 'Grid of images with captions',
    icon: 'images',
    fields: [
      { name: 'title', label: 'Gallery Title', type: 'text' },
      {
        name: 'images',
        label: 'Images',
        type: 'repeater',
        fields: [
          { name: 'image', label: 'Image', type: 'image', required: true },
          { name: 'caption', label: 'Caption', type: 'text' },
        ],
      },
    ],
    defaultContent: {
      title: '',
      images: [],
    },
  },

  stats: {
    type: 'stats',
    label: 'Statistics',
    description: 'Numerical highlights and metrics',
    icon: 'trending-up',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text' },
      {
        name: 'items',
        label: 'Stats',
        type: 'repeater',
        fields: [
          { name: 'number', label: 'Number', type: 'text', required: true, placeholder: '100+' },
          { name: 'label', label: 'Label', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'text' },
        ],
      },
    ],
    defaultContent: {
      title: '',
      items: [],
    },
  },

  faq: {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    icon: 'help-circle',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Frequently Asked Questions' },
      {
        name: 'items',
        label: 'Questions',
        type: 'repeater',
        fields: [
          { name: 'question', label: 'Question', type: 'text', required: true },
          { name: 'answer', label: 'Answer', type: 'textarea', required: true },
        ],
      },
    ],
    defaultContent: {
      title: 'Frequently Asked Questions',
      items: [],
    },
  },

  contact: {
    type: 'contact',
    label: 'Contact Section',
    description: 'Contact information and optional form',
    icon: 'mail',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Contact Us' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'email', label: 'Email Address', type: 'text', placeholder: 'hello@example.com' },
      { name: 'phone', label: 'Phone Number', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'form_enabled', label: 'Show Contact Form', type: 'checkbox', defaultValue: true },
    ],
    defaultContent: {
      title: 'Contact Us',
      subtitle: "We'd love to hear from you",
      email: '',
      phone: '',
      address: '',
      form_enabled: true,
    },
  },

  team: {
    type: 'team',
    label: 'Team Section',
    description: 'Team member profiles',
    icon: 'users',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Meet Our Team' },
      {
        name: 'members',
        label: 'Team Members',
        type: 'repeater',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'role', label: 'Role/Title', type: 'text' },
          { name: 'bio', label: 'Bio', type: 'textarea' },
          { name: 'image', label: 'Photo', type: 'image' },
        ],
      },
    ],
    defaultContent: {
      title: 'Meet Our Team',
      members: [],
    },
  },

  'content-feed': {
    type: 'content-feed',
    label: 'Content Feed',
    description: 'Display items from a content type in various layouts',
    icon: 'rss',
    fields: [
      { name: 'content_type_slug', label: 'Content Type', type: 'select', required: true, options: [] },
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Latest Posts' },
      {
        name: 'display_style',
        label: 'Display Style',
        type: 'select',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'List', value: 'list' },
          { label: 'Cards', value: 'cards' },
          { label: 'Compact', value: 'compact' },
        ],
        defaultValue: 'grid',
      },
      { name: 'items_per_page', label: 'Items to Show', type: 'number', defaultValue: 6, min: 1, max: 50 },
      { name: 'show_date', label: 'Show Date', type: 'checkbox', defaultValue: true },
      { name: 'show_excerpt', label: 'Show Excerpt', type: 'checkbox', defaultValue: true },
      { name: 'link_to_detail', label: 'Link to Detail Page', type: 'checkbox', defaultValue: true },
    ],
    defaultContent: {
      content_type_slug: '',
      title: '',
      display_style: 'grid',
      items_per_page: 6,
      show_date: true,
      show_excerpt: true,
      link_to_detail: true,
    },
  },

  'legacy-blocks': {
    type: 'legacy-blocks',
    label: 'Legacy Content',
    description: 'Content from the original block editor',
    icon: 'layers',
    fields: [],
    defaultContent: {
      blocks: [],
    },
  },

  // New section types

  'card-grid': {
    type: 'card-grid',
    label: 'Card Grid',
    description: 'Grid of cards with images, titles, and links',
    icon: 'layout-grid',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Our Services' },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        defaultValue: '3',
      },
      {
        name: 'cards',
        label: 'Cards',
        type: 'repeater',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'image', label: 'Image', type: 'image' },
          { name: 'link', label: 'Link', type: 'link' },
        ],
      },
    ],
    defaultContent: {
      title: '',
      columns: '3',
      cards: [],
    },
  },

  columns: {
    type: 'columns',
    label: 'Columns',
    description: 'Multi-column text layout',
    icon: 'columns',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text' },
      {
        name: 'columns',
        label: 'Number of Columns',
        type: 'select',
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
        ],
        defaultValue: '2',
      },
      {
        name: 'items',
        label: 'Column Content',
        type: 'repeater',
        fields: [
          { name: 'heading', label: 'Heading', type: 'text' },
          { name: 'content', label: 'Content', type: 'richtext' },
        ],
      },
    ],
    defaultContent: {
      title: '',
      columns: '2',
      items: [],
    },
  },

  image: {
    type: 'image',
    label: 'Image',
    description: 'Single image with caption',
    icon: 'image',
    fields: [
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'caption', label: 'Caption', type: 'text' },
      { name: 'link', label: 'Link (optional)', type: 'link' },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      },
      { name: 'max_width', label: 'Max Width', type: 'text', placeholder: '100%', defaultValue: '100%' },
    ],
    defaultContent: {
      image: null,
      caption: '',
      link: '',
      alignment: 'center',
      max_width: '100%',
    },
  },

  button: {
    type: 'button',
    label: 'Button',
    description: 'Standalone call-to-action button',
    icon: 'mouse-pointer',
    fields: [
      { name: 'text', label: 'Button Text', type: 'text', required: true, placeholder: 'Click Here' },
      { name: 'link', label: 'Link', type: 'link', required: true },
      {
        name: 'variant',
        label: 'Style',
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ],
        defaultValue: 'primary',
      },
      {
        name: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'center',
      },
    ],
    defaultContent: {
      text: 'Click Here',
      link: '#',
      variant: 'primary',
      alignment: 'center',
    },
  },

  pricing: {
    type: 'pricing',
    label: 'Pricing Table',
    description: 'Compare pricing tiers side by side',
    icon: 'dollar-sign',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Pricing Plans' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        name: 'tiers',
        label: 'Pricing Tiers',
        type: 'repeater',
        fields: [
          { name: 'name', label: 'Plan Name', type: 'text', required: true },
          { name: 'price', label: 'Price', type: 'text', required: true, placeholder: '$29' },
          { name: 'period', label: 'Period', type: 'text', placeholder: '/month' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'features', label: 'Features (one per line)', type: 'textarea' },
          { name: 'cta_text', label: 'Button Text', type: 'text', placeholder: 'Get Started' },
          { name: 'cta_link', label: 'Button Link', type: 'link' },
          { name: 'highlighted', label: 'Highlight This Tier', type: 'checkbox' },
        ],
      },
    ],
    defaultContent: {
      title: 'Pricing Plans',
      subtitle: 'Choose the plan that works for you',
      tiers: [],
    },
  },

  'logo-cloud': {
    type: 'logo-cloud',
    label: 'Logo Cloud',
    description: 'Grid of partner or client logos',
    icon: 'building2',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Trusted By' },
      {
        name: 'logos',
        label: 'Logos',
        type: 'repeater',
        fields: [
          { name: 'name', label: 'Company Name', type: 'text', required: true },
          { name: 'image', label: 'Logo Image', type: 'image', required: true },
          { name: 'link', label: 'Link (optional)', type: 'link' },
        ],
      },
    ],
    defaultContent: {
      title: 'Trusted By',
      logos: [],
    },
  },

  // HVAC-specific sections

  'hero-with-form': {
    type: 'hero-with-form',
    label: 'Hero with Form',
    description: 'Hero section with embedded contact form',
    icon: 'layout',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', required: true, placeholder: 'Professional HVAC Services' },
      { name: 'subheadline', label: 'Subheadline', type: 'textarea', placeholder: 'Heating, Cooling & Indoor Air Quality' },
      { name: 'phone_number', label: 'Phone Number', type: 'text', placeholder: '(555) 123-4567' },
      { name: 'background_image', label: 'Background Image', type: 'image' },
      {
        name: 'badges',
        label: 'Trust Badges',
        type: 'repeater',
        fields: [
          { name: 'icon', label: 'Icon', type: 'select', options: [
            { label: 'Phone', value: 'phone' },
            { label: 'Clock', value: 'clock' },
            { label: 'Shield', value: 'shield' },
          ]},
          { name: 'text', label: 'Text', type: 'text' },
        ],
      },
      { name: 'form_title', label: 'Form Title', type: 'text', placeholder: 'Get a Free Estimate' },
      { name: 'form_subtitle', label: 'Form Subtitle', type: 'text', placeholder: 'Fill out the form...' },
      { name: 'show_form', label: 'Show Form', type: 'checkbox', defaultValue: true },
    ],
    defaultContent: {
      headline: 'Professional HVAC Services',
      subheadline: 'Heating, Cooling & Indoor Air Quality Experts',
      phone_number: '',
      background_image: null,
      badges: [],
      form_title: 'Get a Free Estimate',
      form_subtitle: "Fill out the form and we'll get back to you shortly",
      show_form: true,
    },
  },

  'services-grid': {
    type: 'services-grid',
    label: 'Services Grid',
    description: 'Grid of service cards with icons',
    icon: 'grid-3x3',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Our Services' },
      { name: 'subtitle', label: 'Section Subtitle', type: 'textarea' },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        defaultValue: '3',
      },
      {
        name: 'items',
        label: 'Services',
        type: 'repeater',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'icon', label: 'Icon', type: 'select', options: [
            { label: 'Snowflake (AC)', value: 'snowflake' },
            { label: 'Flame (Heat)', value: 'flame' },
            { label: 'Wind (Air Quality)', value: 'wind' },
            { label: 'Wrench (Repair)', value: 'wrench' },
            { label: 'Thermometer', value: 'thermometer' },
            { label: 'Fan', value: 'fan' },
            { label: 'Shield', value: 'shield' },
            { label: 'Clock', value: 'clock' },
            { label: 'Settings', value: 'settings' },
          ]},
          { name: 'link', label: 'Link', type: 'link' },
        ],
      },
    ],
    defaultContent: {
      title: 'Our Services',
      subtitle: 'Professional HVAC solutions for your home or business',
      columns: '3',
      items: [],
    },
  },

  'service-area': {
    type: 'service-area',
    label: 'Service Area',
    description: 'Display counties and regions served',
    icon: 'map-pin',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Areas We Serve' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        name: 'areas',
        label: 'Service Areas',
        type: 'repeater',
        fields: [
          { name: 'name', label: 'Area Name', type: 'text', required: true },
        ],
      },
      { name: 'image', label: 'Map Image', type: 'image' },
      { name: 'cta_text', label: 'CTA Button Text', type: 'text', placeholder: 'Check Availability' },
      { name: 'cta_link', label: 'CTA Button Link', type: 'link' },
      {
        name: 'layout',
        label: 'Layout',
        type: 'select',
        options: [
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
        ],
        defaultValue: 'grid',
      },
    ],
    defaultContent: {
      title: 'Areas We Serve',
      subtitle: 'Providing quality HVAC services throughout the region',
      areas: [],
      image: null,
      cta_text: 'Check Availability',
      cta_link: '/contact',
      layout: 'grid',
    },
  },

  'trust-badges': {
    type: 'trust-badges',
    label: 'Trust Badges',
    description: 'Display certifications and partner logos',
    icon: 'award',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Why Choose Us' },
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      {
        name: 'badges',
        label: 'Badges',
        type: 'repeater',
        fields: [
          { name: 'title', label: 'Title', type: 'text', required: true },
          { name: 'subtitle', label: 'Subtitle', type: 'text' },
          { name: 'icon', label: 'Icon', type: 'select', options: [
            { label: 'Award', value: 'award' },
            { label: 'Star', value: 'star' },
            { label: 'Shield', value: 'shield' },
            { label: 'Thumbs Up', value: 'thumbsup' },
          ]},
          { name: 'image', label: 'Image (optional)', type: 'image' },
        ],
      },
      {
        name: 'layout',
        label: 'Layout',
        type: 'select',
        options: [
          { label: 'Row', value: 'row' },
          { label: 'Grid', value: 'grid' },
        ],
        defaultValue: 'row',
      },
      {
        name: 'background',
        label: 'Background',
        type: 'select',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Primary', value: 'primary' },
        ],
        defaultValue: 'light',
      },
    ],
    defaultContent: {
      title: '',
      subtitle: '',
      badges: [],
      layout: 'row',
      background: 'light',
    },
  },

  'contact-banner': {
    type: 'contact-banner',
    label: 'Contact Banner',
    description: 'Full-width CTA with phone number',
    icon: 'phone',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', placeholder: 'Ready to Get Started?' },
      { name: 'subheadline', label: 'Subheadline', type: 'text' },
      { name: 'phone_number', label: 'Phone Number', type: 'text', placeholder: '(555) 123-4567' },
      { name: 'cta_text', label: 'Secondary CTA Text', type: 'text', placeholder: 'Schedule Online' },
      { name: 'cta_link', label: 'Secondary CTA Link', type: 'link' },
      { name: 'show_hours', label: 'Show Hours', type: 'checkbox', defaultValue: false },
      { name: 'hours_text', label: 'Hours Text', type: 'text', placeholder: 'Mon-Fri: 8am-6pm' },
      {
        name: 'background',
        label: 'Background Color',
        type: 'select',
        options: [
          { label: 'Primary (Navy)', value: 'primary' },
          { label: 'Accent (Orange)', value: 'accent' },
          { label: 'Dark', value: 'dark' },
        ],
        defaultValue: 'accent',
      },
    ],
    defaultContent: {
      headline: 'Ready to Get Started?',
      subheadline: 'Call us today for a free estimate',
      phone_number: '',
      cta_text: 'Schedule Online',
      cta_link: '/contact',
      show_hours: false,
      hours_text: '',
      background: 'accent',
    },
  },

  'two-column': {
    type: 'two-column',
    label: 'Two Column',
    description: 'Image and text side by side',
    icon: 'columns',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'subtitle', label: 'Eyebrow Text', type: 'text' },
      { name: 'content', label: 'Content', type: 'richtext' },
      { name: 'image', label: 'Image', type: 'image' },
      {
        name: 'image_position',
        label: 'Image Position',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ],
        defaultValue: 'right',
      },
      {
        name: 'bullets',
        label: 'Bullet Points',
        type: 'repeater',
        fields: [
          { name: 'text', label: 'Text', type: 'text', required: true },
        ],
      },
      { name: 'cta_text', label: 'CTA Button Text', type: 'text' },
      { name: 'cta_link', label: 'CTA Button Link', type: 'link' },
      {
        name: 'background',
        label: 'Background',
        type: 'select',
        options: [
          { label: 'White', value: 'white' },
          { label: 'Muted', value: 'muted' },
        ],
        defaultValue: 'white',
      },
    ],
    defaultContent: {
      title: '',
      subtitle: '',
      content: '',
      image: null,
      image_position: 'right',
      bullets: [],
      cta_text: '',
      cta_link: '',
      background: 'white',
    },
  },

  'product-grid': {
    type: 'product-grid',
    label: 'Product Grid',
    description: 'Display products with prices and filtering',
    icon: 'shopping-bag',
    fields: [
      { name: 'content_type_slug', label: 'Content Type Slug', type: 'text', defaultValue: 'products', placeholder: 'products' },
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Shop Our Products' },
      { name: 'show_filters', label: 'Show Category Filters', type: 'checkbox', defaultValue: true },
      { name: 'show_price', label: 'Show Prices', type: 'checkbox', defaultValue: true },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        options: [
          { label: '2 Columns', value: '2' },
          { label: '3 Columns', value: '3' },
          { label: '4 Columns', value: '4' },
        ],
        defaultValue: '3',
      },
      { name: 'items_per_page', label: 'Products to Show', type: 'number', defaultValue: 12, min: 1, max: 50 },
    ],
    defaultContent: {
      content_type_slug: 'products',
      title: 'Shop Air Filters & HVAC Supplies',
      show_filters: true,
      show_price: true,
      columns: '3',
      items_per_page: 12,
    },
  },

  'video-embed': {
    type: 'video-embed',
    label: 'Video Embed',
    description: 'Embed a video from Instagram, YouTube, or other platforms',
    icon: 'play-circle',
    fields: [
      { name: 'title', label: 'Section Title', type: 'text', placeholder: 'Watch Our Video' },
      { name: 'embed_url', label: 'Embed URL', type: 'text', required: true, placeholder: 'https://www.instagram.com/reel/.../embed' },
      { name: 'platform', label: 'Platform', type: 'select', options: [
        { label: 'Instagram', value: 'instagram' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Other', value: 'other' },
      ], defaultValue: 'instagram' },
    ],
    defaultContent: {
      title: 'Watch Our Video',
      embed_url: '',
      platform: 'instagram',
    },
  },
};

// Helper functions
export function getSectionConfig(type: SectionType): SectionTypeConfig {
  return sectionRegistry[type];
}

export function getSectionTypes(): SectionType[] {
  return Object.keys(sectionRegistry) as SectionType[];
}

export function getAddableSectionTypes(): SectionType[] {
  // Exclude legacy-blocks from the add picker
  return getSectionTypes().filter((type) => type !== 'legacy-blocks');
}

export function getDefaultContent(type: SectionType): Record<string, unknown> {
  return { ...sectionRegistry[type].defaultContent };
}

export function getSectionLabel(type: SectionType): string {
  return sectionRegistry[type].label;
}

export function getSectionIcon(type: SectionType): string {
  return sectionRegistry[type].icon;
}
