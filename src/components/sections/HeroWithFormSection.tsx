import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroWithFormContent {
  headline: string;
  subheadline: string;
  phone_number: string;
  background_image: {
    mediaId?: string;
    url: string;
    alt: string;
  } | null;
  badges: Array<{
    id: string;
    icon: string;
    text: string;
  }>;
  form_title: string;
  form_subtitle: string;
  show_form: boolean;
}

interface HeroWithFormSectionProps {
  content: HeroWithFormContent;
}

export function HeroWithFormSection({ content }: HeroWithFormSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'clock':
        return <Clock className="w-5 h-5" />;
      case 'shield':
        return <Shield className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: content.background_image?.url
            ? `url(${content.background_image.url})`
            : 'linear-gradient(135deg, hsl(224 41% 25%) 0%, hsl(224 41% 35%) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-primary/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Headline */}
          <div className="text-white space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {content.headline || 'Professional HVAC Services'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {content.subheadline || 'Heating, Cooling & Indoor Air Quality Experts'}
            </p>
            
            {/* Phone CTA */}
            {content.phone_number && (
              <a
                href={`tel:${content.phone_number.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-3 bg-accent text-white px-6 py-4 rounded-lg text-xl font-bold hover:bg-accent/90 transition-colors shadow-accent"
              >
                <Phone className="w-6 h-6" />
                {content.phone_number}
              </a>
            )}

            {/* Badges */}
            {content.badges && content.badges.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-4">
                {content.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm"
                  >
                    {getIcon(badge.icon)}
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Form */}
          {content.show_form !== false && (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {content.form_title || 'Get a Free Estimate'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {content.form_subtitle || 'Fill out the form and we\'ll get back to you shortly'}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12"
                />
                <Textarea
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                />
                <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-white">
                  Request Service
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
