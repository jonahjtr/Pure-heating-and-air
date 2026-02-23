import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAddableSectionTypes, getSectionConfig } from '@/lib/sectionRegistry';
import { useReusableComponents, ReusableComponent } from '@/hooks/useReusableComponents';
import type { SectionType } from '@/types/sections';
import {
  Image,
  Grid3X3,
  Quote,
  Megaphone,
  FileText,
  Images,
  TrendingUp,
  HelpCircle,
  Mail,
  Users,
  LayoutGrid,
  Columns,
  MousePointer,
  DollarSign,
  Building2,
  Rss,
  Library,
  Loader2,
} from 'lucide-react';

interface SectionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: SectionType) => void;
  onSelectReusable?: (reusable: ReusableComponent) => void;
}

// Map of icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  'grid-3x3': Grid3X3,
  quote: Quote,
  megaphone: Megaphone,
  'file-text': FileText,
  images: Images,
  'trending-up': TrendingUp,
  'help-circle': HelpCircle,
  mail: Mail,
  users: Users,
  'layout-grid': LayoutGrid,
  columns: Columns,
  'mouse-pointer': MousePointer,
  'dollar-sign': DollarSign,
  building2: Building2,
  rss: Rss,
};

export function SectionPicker({ open, onOpenChange, onSelect, onSelectReusable }: SectionPickerProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');
  const sectionTypes = getAddableSectionTypes();
  const { components, isLoading } = useReusableComponents();

  const handleSelect = (type: SectionType) => {
    onSelect(type);
    onOpenChange(false);
  };

  const handleSelectReusable = (component: ReusableComponent) => {
    if (onSelectReusable) {
      onSelectReusable(component);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Section</DialogTitle>
          <DialogDescription>
            Choose a section type or use a saved template
          </DialogDescription>
        </DialogHeader>
        

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'saved')} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Section</TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Library className="h-4 w-4" />
              Saved Sections
              {components.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  {components.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 gap-3 p-1">
                {sectionTypes.map((type) => {
                  const config = getSectionConfig(type);
                  const IconComponent = iconMap[config.icon] || FileText;

                    return (
                      <Button
                        key={type}
                        variant="outline"
                        className="h-auto flex-col items-start gap-2 p-4 text-left overflow-hidden"
                        onClick={() => handleSelect(type)}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium truncate">{config.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 w-full">
                          {config.description}
                        </p>
                      </Button>
                    );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="saved" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : components.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Library className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No saved sections yet</p>
                  <p className="text-sm mt-1">
                    Save sections from the editor to reuse them here
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-1">
                  {components.map((component) => {
                    const config = getSectionConfig(component.block_type as SectionType);
                    const IconComponent = iconMap[config?.icon] || FileText;

                    return (
                      <Button
                        key={component.id}
                        variant="outline"
                        className="h-auto flex-col items-start gap-2 p-4 text-left overflow-hidden"
                        onClick={() => handleSelectReusable(component)}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          <div className="p-2 rounded-lg bg-accent flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium block truncate">{component.name}</span>
                            <span className="text-xs text-muted-foreground truncate block">
                              {config?.label || component.block_type}
                            </span>
                          </div>
                        </div>
                        {component.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 w-full">
                            {component.description}
                          </p>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
