import { useState, useCallback } from 'react';
import { BlockToolbar } from './BlockToolbar';
import { BlockWrapper } from './BlockWrapper';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { ColumnsBlock } from './blocks/ColumnsBlock';
import { CardGridBlock } from './blocks/CardGridBlock';
import { AccordionBlock } from './blocks/AccordionBlock';
import { HeroBlock } from './blocks/HeroBlock';
import { HeadlineBlock } from './blocks/HeadlineBlock';
import { HeadlineInspector } from './HeadlineInspector';
import { ReusableEditDialog } from './ReusableEditDialog';
import { useReusableComponents, type ReusableComponent } from '@/hooks/useReusableComponents';
import type { 
  Block, 
  BlockType,
  TextBlockContent,
  HeadlineBlockContent,
  ImageBlockContent,
  ButtonBlockContent,
  ColumnsBlockContent,
  CardGridBlockContent,
  AccordionBlockContent,
  HeroBlockContent,
  StyleOverrides,
} from './types';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  
  switch (type) {
    case 'text':
      return { id, type, content: { text: '', alignment: 'left' } as TextBlockContent };
    case 'headline':
      return { id, type, content: { text: '', tag: 'h2', fontSize: 32, color: '#000000', alignment: 'left' } as HeadlineBlockContent };
    case 'image':
      return { id, type, content: { mediaId: null, url: '', alt: '', caption: '' } as ImageBlockContent };
    case 'button':
      return { id, type, content: { text: 'Button', url: '', variant: 'primary', alignment: 'center' } as ButtonBlockContent };
    case 'columns':
      return { id, type, content: { columns: 2, blocks: [[], []] } as ColumnsBlockContent };
    case 'card-grid':
      return { id, type, content: { columns: 3, cards: [] } as CardGridBlockContent };
    case 'accordion':
      return { id, type, content: { items: [] } as AccordionBlockContent };
    case 'hero':
      return { id, type, content: { title: '', subtitle: '', mediaId: null, backgroundUrl: '', buttonText: '', buttonUrl: '', overlay: true } as HeroBlockContent };
  }
}

function createBlockFromReusable(component: ReusableComponent): Block {
  return {
    id: crypto.randomUUID(),
    type: component.block_type as BlockType,
    content: component.content,
    reusableId: component.id,
    reusableName: component.name,
    isLinked: true,
  };
}

// Helper to get styleOverrides from any block content
function getStyleOverrides(content: Block['content']): StyleOverrides | undefined {
  return (content as { styleOverrides?: StyleOverrides }).styleOverrides;
}

// Helper to update styleOverrides on any block content
function updateStyleOverrides(content: Block['content'], overrides: StyleOverrides): Block['content'] {
  return { ...content, styleOverrides: overrides } as Block['content'];
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [inspectorOpen, setInspectorOpen] = useState<string | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ index: number; content: Block['content'] } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const { components: reusableComponents, saveComponent, updateComponent } = useReusableComponents();

  const handleAddBlock = (type: BlockType) => {
    onChange([...blocks, createBlock(type)]);
  };

  const handleAddReusable = (component: ReusableComponent) => {
    onChange([...blocks, createBlockFromReusable(component)]);
  };

  const handleUpdateBlock = useCallback((index: number, content: Block['content']) => {
    const block = blocks[index];
    
    // If it's a linked reusable block, show the edit dialog
    if (block.isLinked && block.reusableId) {
      setPendingEdit({ index, content });
      setEditDialogOpen(true);
      return;
    }
    
    // Otherwise, update directly
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    onChange(newBlocks);
  }, [blocks, onChange]);

  const handleApplyGlobally = async () => {
    if (!pendingEdit) return;
    
    const block = blocks[pendingEdit.index];
    if (block.reusableId) {
      // Update the reusable component in database
      await updateComponent({ id: block.reusableId, content: pendingEdit.content });
      
      // Update all instances of this reusable component in current blocks
      const newBlocks = blocks.map((b) => 
        b.reusableId === block.reusableId 
          ? { ...b, content: pendingEdit.content }
          : b
      );
      onChange(newBlocks);
    }
    
    setPendingEdit(null);
  };

  const handleUnlink = () => {
    if (!pendingEdit) return;
    
    const newBlocks = [...blocks];
    newBlocks[pendingEdit.index] = {
      ...newBlocks[pendingEdit.index],
      content: pendingEdit.content,
      reusableId: undefined,
      reusableName: undefined,
      isLinked: false,
    };
    onChange(newBlocks);
    setPendingEdit(null);
  };

  const handleStyleChange = (index: number, overrides: StyleOverrides) => {
    const block = blocks[index];
    const newContent = updateStyleOverrides(block.content, overrides);
    
    // For style changes on reusable blocks, apply directly (no dialog)
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], content: newContent };
    onChange(newBlocks);
  };

  const handleSaveAsReusable = async (index: number, name: string, description: string) => {
    const block = blocks[index];
    await saveComponent({
      name,
      description,
      blockType: block.type,
      content: block.content,
    });
  };

  const handleDeleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const handleDuplicateBlock = (index: number) => {
    const block = blocks[index];
    const duplicated = { 
      ...block, 
      id: crypto.randomUUID(),
      // Duplicated blocks are unlinked from reusable
      isLinked: false,
      reusableId: undefined,
      reusableName: undefined,
    };
    const newBlocks = [...blocks.slice(0, index + 1), duplicated, ...blocks.slice(index + 1)];
    onChange(newBlocks);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const renderBlock = (block: Block, index: number) => {
    const commonProps = {
      onDelete: () => handleDeleteBlock(index),
      onDuplicate: () => handleDuplicateBlock(index),
      onMoveUp: () => handleMoveBlock(index, 'up'),
      onMoveDown: () => handleMoveBlock(index, 'down'),
      canMoveUp: index > 0,
      canMoveDown: index < blocks.length - 1,
      label: block.type,
      styleOverrides: getStyleOverrides(block.content),
      onStyleChange: (overrides: StyleOverrides) => handleStyleChange(index, overrides),
      onInspectorOpen: block.type === 'headline' ? () => setInspectorOpen(block.id) : undefined,
      onSaveAsReusable: (name: string, description: string) => handleSaveAsReusable(index, name, description),
      isReusable: block.isLinked,
      reusableName: block.reusableName,
    };

    return (
      <BlockWrapper key={block.id} {...commonProps}>
        {block.type === 'text' && (
          <TextBlock
            content={block.content as TextBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'headline' && (
          <>
            <HeadlineBlock
              content={block.content as HeadlineBlockContent}
              onChange={(content) => handleUpdateBlock(index, content)}
            />
            <HeadlineInspector
              open={inspectorOpen === block.id}
              onOpenChange={(open) => setInspectorOpen(open ? block.id : null)}
              content={block.content as HeadlineBlockContent}
              onChange={(content) => handleUpdateBlock(index, content)}
            />
          </>
        )}
        {block.type === 'image' && (
          <ImageBlock
            content={block.content as ImageBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'button' && (
          <ButtonBlock
            content={block.content as ButtonBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'columns' && (
          <ColumnsBlock
            content={block.content as ColumnsBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'card-grid' && (
          <CardGridBlock
            content={block.content as CardGridBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'accordion' && (
          <AccordionBlock
            content={block.content as AccordionBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
        {block.type === 'hero' && (
          <HeroBlock
            content={block.content as HeroBlockContent}
            onChange={(content) => handleUpdateBlock(index, content)}
          />
        )}
      </BlockWrapper>
    );
  };

  const pendingBlock = pendingEdit ? blocks[pendingEdit.index] : null;

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No content blocks yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Add blocks to build your page content
          </p>
          <BlockToolbar 
            onAddBlock={handleAddBlock} 
            onAddReusable={handleAddReusable}
            reusableComponents={reusableComponents}
          />
        </div>
      ) : (
        <>
          {blocks.map((block, index) => renderBlock(block, index))}
          <BlockToolbar 
            onAddBlock={handleAddBlock}
            onAddReusable={handleAddReusable}
            reusableComponents={reusableComponents}
          />
        </>
      )}

      {/* Reusable Edit Dialog */}
      <ReusableEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        componentName={pendingBlock?.reusableName || 'Component'}
        onApplyGlobally={handleApplyGlobally}
        onUnlink={handleUnlink}
      />
    </div>
  );
}
