import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Link2Off, RefreshCw } from 'lucide-react';

interface ReusableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  componentName: string;
  onApplyGlobally: () => void;
  onUnlink: () => void;
}

export function ReusableEditDialog({
  open,
  onOpenChange,
  componentName,
  onApplyGlobally,
  onUnlink,
}: ReusableEditDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Reusable Component</AlertDialogTitle>
          <AlertDialogDescription>
            You've edited "{componentName}". How would you like to apply this change?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4"
            onClick={() => {
              onApplyGlobally();
              onOpenChange(false);
            }}
          >
            <RefreshCw className="mr-3 h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium">Apply to all instances</p>
              <p className="text-sm text-muted-foreground">
                Update this component everywhere it's used
              </p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="justify-start h-auto py-3 px-4"
            onClick={() => {
              onUnlink();
              onOpenChange(false);
            }}
          >
            <Link2Off className="mr-3 h-5 w-5 text-orange-500" />
            <div className="text-left">
              <p className="font-medium">Unlink and edit standalone</p>
              <p className="text-sm text-muted-foreground">
                Convert to a regular block (won't affect other instances)
              </p>
            </div>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
