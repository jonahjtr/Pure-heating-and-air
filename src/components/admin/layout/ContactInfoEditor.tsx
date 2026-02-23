import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';
import type { ContactInfo } from '@/types/siteLayout';

interface ContactInfoEditorProps {
  info: ContactInfo;
  onChange: (info: ContactInfo) => void;
}

export function ContactInfoEditor({ info, onChange }: ContactInfoEditorProps) {
  const update = (field: keyof ContactInfo, value: string) => {
    onChange({ ...info, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Label>
        <Input
          type="email"
          value={info.email || ''}
          onChange={(e) => update('email', e.target.value)}
          placeholder="contact@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone
        </Label>
        <Input
          type="tel"
          value={info.phone || ''}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Address
        </Label>
        <Textarea
          value={info.address || ''}
          onChange={(e) => update('address', e.target.value)}
          placeholder="123 Main St, City, State 12345"
          rows={2}
        />
      </div>
    </div>
  );
}
