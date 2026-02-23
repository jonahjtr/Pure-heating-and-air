import { Link } from 'react-router-dom';
import { Menu, X, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube, Github, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBrandingContext } from '@/contexts/BrandingContext';
import type { HeaderConfig, SocialLink, NavMenuItem } from '@/types/siteLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SiteHeaderProps {
  config: HeaderConfig;
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

export function SiteHeader({ config }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const { branding } = useBrandingContext();

  const hasLogo = Boolean(config.logo.url);
  const hasNav = config.navigation.length > 0;
  const hasSocial = config.showSocialLinks && config.socialLinks.length > 0;
  const hasContact = config.showContactInfo && (config.contactInfo.email || config.contactInfo.phone);

  const renderNavItem = (item: NavMenuItem) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <DropdownMenu key={item.id}>
          <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors outline-none">
            {item.label}
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border shadow-lg">
            {item.children!.map((child) => (
              <DropdownMenuItem key={child.id} asChild>
                <Link
                  to={child.url}
                  target={child.openInNewTab ? '_blank' : undefined}
                  rel={child.openInNewTab ? 'noopener noreferrer' : undefined}
                  className="w-full cursor-pointer"
                >
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.url}
        target={item.openInNewTab ? '_blank' : undefined}
        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
        className="text-sm font-medium hover:text-accent transition-colors"
      >
        {item.label}
        {item.openInNewTab && <ExternalLink className="inline w-3 h-3 ml-1" />}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        'w-full',
        config.sticky && 'sticky top-0 z-50'
      )}
    >
      {/* Top utility bar */}
      {hasContact && (
        <div className="bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {config.contactInfo.email && (
                <a 
                  href={`mailto:${config.contactInfo.email}`}
                  className="hidden sm:flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {config.contactInfo.email}
                </a>
              )}
              {config.contactInfo.phone && (
                <a 
                  href={`tel:${config.contactInfo.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-2 hover:text-accent transition-colors font-semibold"
                >
                  <Phone className="w-4 h-4" />
                  {config.contactInfo.phone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link to="/specials" className="hidden sm:inline hover:text-accent transition-colors">
                See Specials
              </Link>
              <Link to="/financing" className="hidden sm:inline hover:text-accent transition-colors">
                Financing
              </Link>
              {hasSocial && (
                <div className="flex items-center gap-1">
                  {config.socialLinks.slice(0, 3).map((link) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:text-accent transition-colors"
                        title={link.label || link.platform}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <div 
        className="bg-background border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Site Name */}
            <Link 
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              {hasLogo && (
                <img 
                  src={config.logo.url} 
                  alt={config.logo.alt} 
                  className="h-20 w-auto object-contain"
                />
              )}
              {config.showSiteName && (
                <span 
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: branding.typography.headingFont }}
                >
                  {config.siteName}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            {hasNav && (
              <nav className="hidden lg:flex items-center gap-6 text-foreground">
                {config.navigation.map((item) => renderNavItem(item))}
              </nav>
            )}

            {/* Right side - CTA buttons */}
            <div className="flex items-center gap-3">
              {/* Phone CTA - Desktop */}
              {config.contactInfo.phone && (
                <a
                  href={`tel:${config.contactInfo.phone.replace(/\D/g, '')}`}
                  className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2.5 rounded-lg font-bold transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </a>
              )}

              {/* Book Online CTA */}
              <Link to="/contact">
                <Button className="hidden sm:inline-flex bg-primary hover:bg-primary/90">
                  Book Online
                </Button>
              </Link>

              {/* Mobile menu button */}
              {hasNav && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && hasNav && (
          <nav className="lg:hidden border-t border-border bg-background">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {config.navigation.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedMobileItem === item.id;

                return (
                  <div key={item.id}>
                    {hasChildren ? (
                      <>
                        <button
                          onClick={() => setExpandedMobileItem(isExpanded ? null : item.id)}
                          className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                          {item.label}
                          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                        </button>
                        {isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.children!.map((child) => (
                              <Link
                                key={child.id}
                                to={child.url}
                                className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.url}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="block px-3 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}
              
              {/* Mobile CTAs */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {config.contactInfo.phone && (
                  <a
                    href={`tel:${config.contactInfo.phone.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-3 rounded-lg font-bold"
                  >
                    <Phone className="w-5 h-5" />
                    {config.contactInfo.phone}
                  </a>
                )}
                <Link 
                  to="/contact"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Book Online</Button>
                </Link>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
