import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrandingContext } from '@/contexts/BrandingContext';
import type { FooterConfig, SocialLink } from '@/types/siteLayout';

interface SiteFooterProps {
  config: FooterConfig;
}

function getSocialIcon(platform: SocialLink['platform']) {
  switch (platform) {
    case 'facebook': return Facebook;
    case 'twitter': return Twitter;
    case 'instagram': return Instagram;
    case 'linkedin': return Linkedin;
    case 'youtube': return Youtube;
    case 'github': return Github;
    default: return ExternalLink;
  }
}

export function SiteFooter({ config }: SiteFooterProps) {
  const { branding } = useBrandingContext();

  const hasLogo = Boolean(config.logo.url);
  const hasSocial = config.showSocialLinks && config.socialLinks.length > 0;
  const hasContact = config.showContactInfo && (config.contactInfo.email || config.contactInfo.phone || config.contactInfo.address);
  const hasColumns = config.layout === 'columns' && config.columns.length > 0;

  if (config.layout === 'minimal') {
    return (
      <footer className="w-full py-6 border-t border-border bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 text-center">
          {config.showCopyright && (
            <p className="text-sm text-muted-foreground">{config.copyrightText}</p>
          )}
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Google Maps */}
          <div>
            <h4 
              className="font-bold text-lg mb-4 text-accent"
              style={{ fontFamily: branding.typography.headingFont }}
            >
              Find Us
            </h4>
            <a
              href="https://www.google.com/maps?q=Pure+Heating+and+Air+Lexington+KY"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden border border-white/10 hover:border-accent transition-colors"
            >
                <iframe
                  src="https://maps.google.com/maps?q=Pure+Heating+and+Air+Lexington+KY&output=embed"
                  width="100%"
                  height="180"
                  className="max-w-full"
                style={{ border: 0, pointerEvents: 'none' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pure Heating and Air Location"
              />
            </a>
            <p className="text-xs opacity-70 mt-2">Click to view on Google Maps</p>
          </div>

          {/* Col 2: Contact Info + Hours + Logo & Socials */}
          <div className="space-y-4">
            {hasContact && (
              <div className="space-y-3 text-sm">
                {config.contactInfo.phone && (
                  <a 
                    href={`tel:${config.contactInfo.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-3 hover:text-accent transition-colors font-semibold text-lg"
                  >
                    <Phone className="w-5 h-5 text-accent" />
                    {config.contactInfo.phone}
                  </a>
                )}
                {config.contactInfo.email && (
                  <a 
                    href={`mailto:${config.contactInfo.email}`}
                    className="flex items-center gap-3 hover:text-accent transition-colors"
                  >
                    <Mail className="w-5 h-5 text-accent" />
                    {config.contactInfo.email}
                  </a>
                )}
                {config.contactInfo.address && (
                  <p className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-accent" />
                    <span className="whitespace-pre-line opacity-90">{config.contactInfo.address}</span>
                  </p>
                )}
                <div className="flex items-start gap-3 pt-2">
                  <Clock className="w-5 h-5 mt-0.5 shrink-0 text-accent" />
                  <div className="opacity-90">
                    <p>Mon-Fri: 8am - 6pm</p>
                    <p>24/7 Emergency Service</p>
                  </div>
                </div>
              </div>
            )}

            {/* Logo & Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              {(hasLogo || config.showSiteName) && (
                <Link to="/" className="inline-flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0">
                  {hasLogo && (
                    <img 
                      src={config.logo.url} 
                      alt={config.logo.alt} 
                      className="h-14 w-auto object-contain"
                    />
                  )}
                  {config.showSiteName && (
                    <span 
                      className="text-xl font-bold"
                      style={{ fontFamily: branding.typography.headingFont }}
                    >
                      {config.siteName}
                    </span>
                  )}
                </Link>
              )}
              {hasSocial && (
                <div className="flex items-center gap-2">
                  {config.socialLinks.map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground transition-colors"
                        title={link.label || link.platform}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cols 3-5: Footer Columns */}
          {hasColumns && config.columns.map((column) => (
            <div key={column.id}>
              <h4 
                className="font-bold text-lg mb-4 text-accent"
                style={{ fontFamily: branding.typography.headingFont }}
              >
                {column.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      to={link.url}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="opacity-90 hover:opacity-100 hover:text-accent transition-all"
                    >
                      {link.label}
                      {link.openInNewTab && <ExternalLink className="inline w-3 h-3 ml-1" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            {config.showCopyright && (
              <p className="opacity-80 text-center md:text-left">{config.copyrightText}</p>
            )}
            <div className="flex items-center gap-6 opacity-80">
              <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
