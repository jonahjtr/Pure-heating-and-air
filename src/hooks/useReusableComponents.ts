import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Block } from '@/components/editor/types';
import type { Json } from '@/integrations/supabase/types';

export interface ReusableComponent {
  id: string;
  name: string;
  description: string | null;
  block_type: string;
  content: Block['content'];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useReusableComponents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: components = [], isLoading } = useQuery({
    queryKey: ['reusable-components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reusable_components')
        .select('*')
        .order('name');
      
      if (error) throw error;
      // Map database rows to our type
      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        block_type: row.block_type,
        content: row.content as unknown as Block['content'],
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })) as ReusableComponent[];
    },
    enabled: !!user,
  });

  const saveComponent = useMutation({
    mutationFn: async ({
      name,
      description,
      blockType,
      content,
    }: {
      name: string;
      description: string;
      blockType: string;
      content: Block['content'];
    }) => {
      const { data, error } = await supabase
        .from('reusable_components')
        .insert([{
          name,
          description: description || null,
          block_type: blockType,
          content: content as unknown as Json,
          created_by: user?.id,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reusable-components'] });
      toast.success('Component saved to library');
    },
    onError: (error) => {
      console.error('Error saving component:', error);
      toast.error('Failed to save component');
    },
  });

  const updateComponent = useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: string;
      content: Block['content'];
    }) => {
      const { data, error } = await supabase
        .from('reusable_components')
        .update({
          content: content as unknown as Json,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reusable-components'] });
      toast.success('Component updated globally');
    },
    onError: (error) => {
      console.error('Error updating component:', error);
      toast.error('Failed to update component');
    },
  });

  const deleteComponent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reusable_components')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reusable-components'] });
      toast.success('Component deleted');
    },
    onError: (error) => {
      console.error('Error deleting component:', error);
      toast.error('Failed to delete component');
    },
  });

  return {
    components,
    isLoading,
    saveComponent: saveComponent.mutateAsync,
    updateComponent: updateComponent.mutateAsync,
    deleteComponent: deleteComponent.mutateAsync,
  };
}
