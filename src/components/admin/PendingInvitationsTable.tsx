import { useState } from 'react';
import { RefreshCw, X, Mail, Clock, Shield, Edit2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  expires_at: string;
  created_at: string;
}

interface PendingInvitationsTableProps {
  invitations: Invitation[];
  loading: boolean;
  onRefresh: () => void;
}

export function PendingInvitationsTable({ invitations, loading, onRefresh }: PendingInvitationsTableProps) {
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleResend = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      const { data, error } = await supabase.functions.invoke('resend-invitation', {
        body: { invitationId },
      });

      if (error) {
        toast.error(error.message || 'Failed to resend invitation');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Invitation resent');
      onRefresh();
    } catch (err) {
      console.error('Resend error:', err);
      toast.error('Failed to resend invitation');
    } finally {
      setResendingId(null);
    }
  };

  const handleCancel = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        toast.error('Failed to cancel invitation');
        return;
      }

      toast.success('Invitation cancelled');
      onRefresh();
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error('Failed to cancel invitation');
    } finally {
      setCancellingId(null);
      setConfirmCancelId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No pending invitations</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {invitation.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={invitation.role === 'admin' ? 'default' : 'secondary'} className="gap-1 capitalize">
                  {invitation.role === 'admin' ? <Shield className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                  {invitation.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {isExpired(invitation.expires_at) ? (
                    <span className="text-destructive">Expired</span>
                  ) : (
                    formatDate(invitation.expires_at)
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResend(invitation.id)}
                    disabled={resendingId === invitation.id}
                  >
                    {resendingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Resend</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmCancelId(invitation.id)}
                    disabled={cancellingId === invitation.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {cancellingId === invitation.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Cancel</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!confirmCancelId} onOpenChange={() => setConfirmCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this invitation? The user will no longer be able to use the invitation link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Invitation</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCancelId && handleCancel(confirmCancelId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
