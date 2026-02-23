// General Site Settings types (WordPress-like general settings)

export interface SiteIdentity {
  siteName: string;
  tagline: string;
  siteUrl: string;
  adminEmail: string;
  favicon: string;
}

export interface ReadingSettings {
  postsPerPage: number;
  showOnFront: 'latest_posts' | 'static_page';
  frontPageId: string | null;
  searchEngineVisibility: boolean; // true = visible to search engines
}

export interface DateLanguageSettings {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: 'sunday' | 'monday';
  language: string;
}

export interface SiteSettings {
  identity: SiteIdentity;
  reading: ReadingSettings;
  dateLanguage: DateLanguageSettings;
}

export const defaultSiteSettings: SiteSettings = {
  identity: {
    siteName: 'My Website',
    tagline: 'Just another awesome website',
    siteUrl: '',
    adminEmail: '',
    favicon: '',
  },
  reading: {
    postsPerPage: 10,
    showOnFront: 'latest_posts',
    frontPageId: null,
    searchEngineVisibility: true,
  },
  dateLanguage: {
    timezone: 'UTC',
    dateFormat: 'MMMM d, yyyy',
    timeFormat: 'h:mm a',
    weekStartsOn: 'sunday',
    language: 'en',
  },
};

export const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Delhi' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
];

export const dateFormatOptions = [
  { value: 'MMMM d, yyyy', label: 'January 1, 2025', example: 'MMMM d, yyyy' },
  { value: 'MM/dd/yyyy', label: '01/01/2025', example: 'MM/dd/yyyy' },
  { value: 'dd/MM/yyyy', label: '01/01/2025 (UK)', example: 'dd/MM/yyyy' },
  { value: 'yyyy-MM-dd', label: '2025-01-01', example: 'yyyy-MM-dd' },
  { value: 'd MMM yyyy', label: '1 Jan 2025', example: 'd MMM yyyy' },
];

export const timeFormatOptions = [
  { value: 'h:mm a', label: '1:30 PM', example: '12-hour' },
  { value: 'HH:mm', label: '13:30', example: '24-hour' },
];

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
];
