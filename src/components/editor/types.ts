// Block types for the page editor

export type BlockType = 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'columns' 
  | 'card-grid' 
  | 'accordion' 
  | 'hero'
  | 'headline';

// Style override for blocks - allows custom colors/typography per block
export interface StyleOverrides {
  useCustomStyles?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: string;
  bodyWeight?: string;
}

export interface TextBlockContent {
  text: string;
  alignment: 'left' | 'center' | 'right';
  styleOverrides?: StyleOverrides;
}

export interface HeadlineBlockContent {
  text: string;
  tag: 'h1' | 'h2' | 'h3' | 'h4';
  fontSize: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  styleOverrides?: StyleOverrides;
}

export interface ImageBlockContent {
  mediaId: string | null;
  url: string;
  alt: string;
  caption: string;
  styleOverrides?: StyleOverrides;
}

export interface ButtonBlockContent {
  text: string;
  url: string;
  variant: 'primary' | 'secondary' | 'outline';
  alignment: 'left' | 'center' | 'right';
  styleOverrides?: StyleOverrides;
}

export interface ColumnsBlockContent {
  columns: 2 | 3;
  blocks: Block[][];
  styleOverrides?: StyleOverrides;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  mediaId: string | null;
  imageUrl: string;
  linkUrl: string;
}

export interface CardGridBlockContent {
  columns: 2 | 3 | 4;
  cards: CardItem[];
  styleOverrides?: StyleOverrides;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface AccordionBlockContent {
  items: AccordionItem[];
  styleOverrides?: StyleOverrides;
}

export interface HeroBlockContent {
  title: string;
  subtitle: string;
  mediaId: string | null;
  backgroundUrl: string;
  buttonText: string;
  buttonUrl: string;
  overlay: boolean;
  styleOverrides?: StyleOverrides;
}

export interface Block {
  id: string;
  type: BlockType;
  content: 
    | TextBlockContent 
    | HeadlineBlockContent
    | ImageBlockContent 
    | ButtonBlockContent 
    | ColumnsBlockContent 
    | CardGridBlockContent 
    | AccordionBlockContent 
    | HeroBlockContent;
  // Reusable component tracking
  reusableId?: string;
  reusableName?: string;
  isLinked?: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  alt_text: string | null;
  tags: string[];
  created_at: string;
}
