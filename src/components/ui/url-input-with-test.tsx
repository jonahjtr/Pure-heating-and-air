import { useState, useEffect } from 'react';
import { ExternalLink, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UrlInputWithTestProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type UrlStatus = 'idle' | 'valid' | 'invalid';

export function UrlInputWithTest({
  id,
  value,
  onChange,
  placeholder = 'https://...',
  className,
}: UrlInputWithTestProps) {
  const [urlStatus, setUrlStatus] = useState<UrlStatus>('idle');

  // Validate URL format
  useEffect(() => {
    if (!value) {
      setUrlStatus('idle');
      return;
    }

    // Check if it's a valid URL format
    try {
      // Allow relative URLs starting with /
      if (value.startsWith('/')) {
        setUrlStatus('valid');
        return;
      }
      
      // Check for valid absolute URL
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:') {
        setUrlStatus('valid');
      } else {
        setUrlStatus('invalid');
      }
    } catch {
      // If it doesn't start with a protocol, check if adding https makes it valid
      if (value.includes('.') && !value.includes(' ')) {
        setUrlStatus('valid'); // Likely a valid domain
      } else {
        setUrlStatus('invalid');
      }
    }
  }, [value]);

  const handleTestLink = () => {
    if (!value) return;
    
    let url = value;
    // Add protocol if missing for external URLs
    if (!url.startsWith('/') && !url.includes('://')) {
      url = 'https://' + url;
    }
    // For relative URLs, prepend current origin
    if (url.startsWith('/')) {
      url = window.location.origin + url;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'pr-8',
            urlStatus === 'valid' && value && 'border-green-500 focus-visible:ring-green-500/20',
            urlStatus === 'invalid' && value && 'border-destructive focus-visible:ring-destructive/20'
          )}
        />
        {value && urlStatus !== 'idle' && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {urlStatus === 'valid' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={handleTestLink}
        disabled={!value || urlStatus === 'invalid'}
        title="Test link in new tab"
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Error message component for form validation
interface ValidationMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'success';
}

export function ValidationMessage({ message, type = 'error' }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p
      className={cn(
        'text-xs mt-1',
        type === 'error' && 'text-destructive',
        type === 'warning' && 'text-yellow-600',
        type === 'success' && 'text-green-600'
      )}
    >
      {message}
    </p>
  );
}