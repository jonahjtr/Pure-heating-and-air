import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BlockToolbar } from '../BlockToolbar';
import { BlockWrapper } from '../BlockWrapper';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { ButtonBlock } from './ButtonBlock';
import { cn } from '@/lib/utils';
import type { 
  ColumnsBlockContent, 
  Block, 
  BlockType,
  TextBlockContent,
  ImageBlockContent,
  ButtonBlockContent,
} from '../types';

interface ColumnsBlockProps {
  content: ColumnsBlockContent;
  onChange: (content: ColumnsBlockContent) => void;
}

// Simple blocks only in columns (no nested columns)
const simpleBlockTypes: BlockType[] = ['text', 'image', 'button'];

function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  
  switch (type) {
    case 'text':
      return { id, type, content: { text: '', alignment: 'left' } as TextBlockContent };
    case 'image':
      return { id, type, content: { mediaId: null, url: '', alt: '', caption: '' } as ImageBlockContent };
    case 'button':
      return { id, type, content: { text: 'Button', url: '', variant: 'primary', alignment: 'center' } as ButtonBlockContent };
    default:
      return { id, type: 'text', content: { text: '', alignment: 'left' } as TextBlockContent };
  }
}

export function ColumnsBlock({ content, onChange }: ColumnsBlockProps) {
  const handleColumnCountChange = (value: string) => {
    const newCount = parseInt(value) as 2 | 3;
    const currentBlocks = [...content.blocks];
    
    if (newCount > content.columns) {
      // Add new empty columns
      while (currentBlocks.length < newCount) {
        currentBlocks.push([]);
      }
    } else {
      // Remove extra columns
      currentBlocks.splice(newCount);
    }
    
    onChange({ ...content, columns: newCount, blocks: currentBlocks });
  };

  const handleAddBlock = (columnIndex: number, type: BlockType) => {
    if (!simpleBlockTypes.includes(type)) return;
    
    const newBlocks = [...content.blocks];
    newBlocks[columnIndex] = [...newBlocks[columnIndex], createBlock(type)];
    onChange({ ...content, blocks: newBlocks });
  };

  const handleUpdateBlock = (columnIndex: number, blockIndex: number, blockContent: Block['content']) => {
    const newBlocks = [...content.blocks];
    newBlocks[columnIndex] = [...newBlocks[columnIndex]];
    newBlocks[columnIndex][blockIndex] = {
      ...newBlocks[columnIndex][blockIndex],
      content: blockContent,
    };
    onChange({ ...content, blocks: newBlocks });
  };

  const handleDeleteBlock = (columnIndex: number, blockIndex: number) => {
    const newBlocks = [...content.blocks];
    newBlocks[columnIndex] = newBlocks[columnIndex].filter((_, i) => i !== blockIndex);
    onChange({ ...content, blocks: newBlocks });
  };

  const handleMoveBlock = (columnIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const newBlocks = [...content.blocks];
    const column = [...newBlocks[columnIndex]];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    if (newIndex < 0 || newIndex >= column.length) return;
    
    [column[blockIndex], column[newIndex]] = [column[newIndex], column[blockIndex]];
    newBlocks[columnIndex] = column;
    onChange({ ...content, blocks: newBlocks });
  };

  const handleDuplicateBlock = (columnIndex: number, blockIndex: number) => {
    const newBlocks = [...content.blocks];
    const block = newBlocks[columnIndex][blockIndex];
    const duplicated = { ...block, id: crypto.randomUUID() };
    newBlocks[columnIndex] = [
      ...newBlocks[columnIndex].slice(0, blockIndex + 1),
      duplicated,
      ...newBlocks[columnIndex].slice(blockIndex + 1),
    ];
    onChange({ ...content, blocks: newBlocks });
  };

  const renderBlock = (block: Block, columnIndex: number, blockIndex: number) => {
    const column = content.blocks[columnIndex];
    
    return (
      <BlockWrapper
        key={block.id}
        label={block.type}
        onDelete={() => handleDeleteBlock(columnIndex, blockIndex)}
        onDuplicate={() => handleDuplicateBlock(columnIndex, blockIndex)}
        onMoveUp={() => handleMoveBlock(columnIndex, blockIndex, 'up')}
        onMoveDown={() => handleMoveBlock(columnIndex, blockIndex, 'down')}
        canMoveUp={blockIndex > 0}
        canMoveDown={blockIndex < column.length - 1}
      >
        {block.type === 'text' && (
          <TextBlock
            content={block.content as TextBlockContent}
            onChange={(c) => handleUpdateBlock(columnIndex, blockIndex, c)}
          />
        )}
        {block.type === 'image' && (
          <ImageBlock
            content={block.content as ImageBlockContent}
            onChange={(c) => handleUpdateBlock(columnIndex, blockIndex, c)}
          />
        )}
        {block.type === 'button' && (
          <ButtonBlock
            content={block.content as ButtonBlockContent}
            onChange={(c) => handleUpdateBlock(columnIndex, blockIndex, c)}
          />
        )}
      </BlockWrapper>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label>Columns</Label>
        <Select
          value={content.columns.toString()}
          onValueChange={handleColumnCountChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 Columns</SelectItem>
            <SelectItem value="3">3 Columns</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={cn(
        'grid gap-4',
        content.columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {content.blocks.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="border border-dashed border-border rounded-lg p-3 min-h-[150px] space-y-3"
          >
            <p className="text-xs font-medium text-muted-foreground text-center">
              Column {columnIndex + 1}
            </p>
            
            {column.map((block, blockIndex) => renderBlock(block, columnIndex, blockIndex))}
            
            <BlockToolbar 
              onAddBlock={(type) => handleAddBlock(columnIndex, type)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
