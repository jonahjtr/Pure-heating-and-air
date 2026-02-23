// Types for site-wide header and footer configuration

export interface NavMenuItem {
  id: string;
  label: string;
  url: string;
  openInNewTab?: boolean;
  children?: NavMenuItem[];
}

export interface SocialLink {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'github' | 'custom';
  url: string;
  label?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface HeaderConfig {
  logo: {
    mediaId: string | null;
    url: string;
    alt: string;
  };
  showSiteName: boolean;
  siteName: string;
  navigation: NavMenuItem[];
  showSocialLinks: boolean;
  socialLinks: SocialLink[];
  showContactInfo: boolean;
  contactInfo: ContactInfo;
  sticky: boolean;
  layout: 'left' | 'center' | 'split';
}

export interface FooterColumn {
  id: string;
  title: string;
  links: NavMenuItem[];
}

export interface FooterConfig {
  logo: {
    mediaId: string | null;
    url: string;
    alt: string;
  };
  showSiteName: boolean;
  siteName: string;
  columns: FooterColumn[];
  showSocialLinks: boolean;
  socialLinks: SocialLink[];
  showContactInfo: boolean;
  contactInfo: ContactInfo;
  copyrightText: string;
  showCopyright: boolean;
  layout: 'simple' | 'columns' | 'minimal';
}

export const defaultHeaderConfig: HeaderConfig = {
  logo: { mediaId: null, url: '', alt: 'Logo' },
  showSiteName: true,
  siteName: 'My Site',
  navigation: [],
  showSocialLinks: false,
  socialLinks: [],
  showContactInfo: false,
  contactInfo: {},
  sticky: true,
  layout: 'left',
};

export const defaultFooterConfig: FooterConfig = {
  logo: { mediaId: null, url: '', alt: 'Logo' },
  showSiteName: false,
  siteName: 'My Site',
  columns: [],
  showSocialLinks: true,
  socialLinks: [],
  showContactInfo: true,
  contactInfo: {},
  copyrightText: `© ${new Date().getFullYear()} My Site. All rights reserved.`,
  showCopyright: true,
  layout: 'simple',
};

export const socialPlatformIcons: Record<SocialLink['platform'], string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  pinterest: 'Pinterest',
  github: 'GitHub',
  custom: 'Link',
};
