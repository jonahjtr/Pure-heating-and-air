// Branding types for global settings

export interface BrandingColors {
  primary: string;    // HEX format
  secondary: string;  // HEX format
  accent: string;     // HEX format
  background: string; // HEX format
  foreground: string; // HEX format
  muted: string;      // HEX format
}

export interface BrandingTypography {
  headingFont: string;
  bodyFont: string;
  baseSize: string;
  headingWeight: string;
  bodyWeight: string;
}

export interface BrandingSettings {
  colors: BrandingColors;
  typography: BrandingTypography;
}

export const defaultBranding: BrandingSettings = {
  colors: {
    primary: '#2B3A67',
    secondary: '#8AD4E0',
    accent: '#F58025',
    background: '#FFFFFF',
    foreground: '#2D3748',
    muted: '#F7FAFC',
  },
  typography: {
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    baseSize: '16',
    headingWeight: '700',
    bodyWeight: '400',
  },
};

export const fontOptions = [
  'Montserrat',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
];

export const fontWeightOptions = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
];
