import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface StyleOverrideEditorProps {
  overrides: Record<string, unknown>;
  onChange: (overrides: Record<string, unknown>) => void;
  disabled?: boolean;
}

export function StyleOverrideEditor({ overrides, onChange, disabled }: StyleOverrideEditorProps) {
  const handleChange = (key: string, value: string) => {
    if (value === '' || value === 'inherit') {
      const newOverrides = { ...overrides };
      delete newOverrides[key];
      onChange(newOverrides);
    } else {
      onChange({ ...overrides, [key]: value });
    }
  };

  const handleReset = () => {
    onChange({});
  };

  const hasOverrides = Object.keys(overrides).length > 0;

  if (disabled) {
    return (
      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        This section is locked. Unlock it to customize styles.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Override global branding for this section only.
        </p>
        {hasOverrides && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={(overrides.backgroundColor as string) || '#ffffff'}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <Input
              value={(overrides.backgroundColor as string) || ''}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              placeholder="Inherit from theme"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Text Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={(overrides.textColor as string) || '#000000'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-12 h-8 p-1 cursor-pointer"
            />
            <Input
              value={(overrides.textColor as string) || ''}
              onChange={(e) => handleChange('textColor', e.target.value)}
              placeholder="Inherit from theme"
              className="flex-1 h-8 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Padding</Label>
          <Select
            value={(overrides.padding as string) || 'inherit'}
            onValueChange={(v) => handleChange('padding', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Inherit from theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit from theme</SelectItem>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Font Size</Label>
          <Select
            value={(overrides.fontSize as string) || 'inherit'}
            onValueChange={(v) => handleChange('fontSize', v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Inherit from theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit from theme</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="large">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
