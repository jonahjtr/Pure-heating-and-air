import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
  label: string;
  value: string; // HEX format: "#RRGGBB"
  onChange: (value: string) => void;
}

// Convert HEX to HSV
function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

// Convert HSV to HEX
function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Validate and normalize HEX
function normalizeHex(input: string): string {
  let hex = input.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  
  // Handle 3-char shorthand
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return hex.toUpperCase();
  }
  
  return '#000000';
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const normalizedValue = normalizeHex(value);
  const [hsv, setHsv] = useState(() => hexToHsv(normalizedValue));
  const [inputValue, setInputValue] = useState(normalizedValue);
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const normalized = normalizeHex(value);
    setHsv(hexToHsv(normalized));
    setInputValue(normalized);
  }, [value]);

  const updateColor = (newHsv: { h: number; s: number; v: number }) => {
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setInputValue(hex);
    onChange(hex);
  };

  const handleSatValMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const s = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const v = Math.max(0, Math.min(100, 100 - ((e.clientY - rect.top) / rect.height) * 100));
      updateColor({ ...hsv, s, v });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    handleMove(e.nativeEvent);
  };

  const handleHueMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (e: MouseEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const h = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
      updateColor({ ...hsv, h });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    handleMove(e.nativeEvent);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Only update if valid hex
    const testHex = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/i.test(testHex)) {
      const normalized = testHex.toUpperCase();
      setHsv(hexToHsv(normalized));
      onChange(normalized);
    }
  };

  const handleInputBlur = () => {
    const normalized = normalizeHex(inputValue);
    setInputValue(normalized);
    setHsv(hexToHsv(normalized));
    onChange(normalized);
  };

  // Presets for quick selection
  const presets = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', 
    '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#F43F5E',
    '#000000', '#374151', '#6B7280', '#D1D5DB', '#FFFFFF',
  ];

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-10"
          >
            <div
              className="w-6 h-6 rounded-md border border-border shadow-sm"
              style={{ backgroundColor: normalizedValue }}
            />
            <span className="font-mono text-sm">
              {normalizedValue}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Saturation/Value picker */}
            <div
              ref={satValRef}
              className="relative w-full h-36 rounded-lg cursor-crosshair overflow-hidden"
              style={{
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, transparent),
                  hsl(${hsv.h}, 100%, 50%)
                `,
              }}
              onMouseDown={handleSatValMouseDown}
            >
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: normalizedValue,
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              ref={hueRef}
              className="relative w-full h-3 rounded-full cursor-pointer"
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
              onMouseDown={handleHueMouseDown}
            >
              <div
                className="absolute w-4 h-4 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 top-1/2 pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                }}
              />
            </div>

            {/* Preset colors */}
            <div className="grid grid-cols-5 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  className="w-8 h-8 rounded-md border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: preset }}
                  onClick={() => {
                    setHsv(hexToHsv(preset));
                    setInputValue(preset);
                    onChange(preset);
                  }}
                />
              ))}
            </div>

            {/* HEX input */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground w-8">HEX</span>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#000000"
                className="font-mono text-sm h-8"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
