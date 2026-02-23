import { useState } from 'react';
import { Users as UsersIcon, Shield, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'editor';
}

interface UsersTableProps {
  users: UserWithRole[];
  currentUserId: string | undefined;
  loading: boolean;
  searchQuery: string;
  onRoleChange: (userId: string, newRole: 'admin' | 'editor') => void;
  onUserDeleted: () => void;
}

export function UsersTable({ 
  users, 
  currentUserId, 
  loading, 
  searchQuery,
  onRoleChange,
  onUserDeleted,
}: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<UserWithRole | null>(null);

  const handleDeleteUser = async (user: UserWithRole) => {
    setDeletingUserId(user.user_id);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.user_id },
      });

      if (error) {
        toast.error(error.message || 'Failed to delete user');
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      toast.success('User deleted');
      onUserDeleted();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user');
    } finally {
      setDeletingUserId(null);
      setConfirmDeleteUser(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (user: UserWithRole) => {
    if (user.display_name) {
      return user.display_name.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const filteredUsers = users.filter(u =>
    (u.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <TableRow key={i}>
            <TableCell colSpan={4}>
              <div className="h-12 bg-muted rounded animate-pulse" />
            </TableCell>
          </TableRow>
        ))}
      </>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={4} className="text-center py-12">
          <UsersIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No users match your search' : 'No users found'}
          </p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {filteredUsers.map((u) => (
        <TableRow key={u.id}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={u.avatar_url || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {getInitials(u)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {u.display_name || u.email?.split('@')[0]}
                </p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              {u.user_id === currentUserId && (
                <Badge variant="outline" className="ml-2">You</Badge>
              )}
            </div>
          </TableCell>
          <TableCell>
            {u.user_id === currentUserId ? (
              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="gap-1 capitalize">
                <Shield className="w-3 h-3" />
                {u.role}
              </Badge>
            ) : (
              <Select
                value={u.role}
                onValueChange={(value: 'admin' | 'editor') => onRoleChange(u.user_id, value)}
              >
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-3 h-3" />
                      Editor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {formatDate(u.created_at)}
          </TableCell>
          <TableCell className="text-right">
            {u.user_id !== currentUserId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDeleteUser(u)}
                disabled={deletingUserId === u.user_id}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {deletingUserId === u.user_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}

      <ConfirmDeleteDialog
        open={!!confirmDeleteUser}
        onOpenChange={() => setConfirmDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to delete ${confirmDeleteUser?.display_name || confirmDeleteUser?.email}? This action cannot be undone.`}
        onConfirm={() => confirmDeleteUser && handleDeleteUser(confirmDeleteUser)}
      />
    </>
  );
}
