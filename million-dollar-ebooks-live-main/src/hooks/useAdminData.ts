
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { PendingBook, ContentFlag } from '@/components/admin/types';

export type { PendingBook, ContentFlag };

export function useAdminData() {
  const [pendingBooks, setPendingBooks] = useState<PendingBook[]>([]);
  const [contentFlags, setContentFlags] = useState<ContentFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch books with draft status that need approval (including recently updated ones)
        // Order by updated_at to show most recently updated books first
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('*')
          .eq('book_status', 'draft')
          .order('updated_at', { ascending: false });

        if (booksError) {
          console.error('Error fetching pending books:', booksError);
        } else {
          console.log('Fetched pending books for admin review:', booksData?.length || 0);
          setPendingBooks(booksData || []);
        }

        // Fetch content flags with related data
        const { data: flagsData, error: flagsError } = await supabase
          .from('content_flags')
          .select(`
            *,
            books (
              title,
              author_name
            ),
            profiles:reporter_id (
              display_name,
              username
            )
          `)
          .order('created_at', { ascending: false });

        if (flagsError) {
          console.error('Error fetching content flags:', flagsError);
        } else {
          // Map the data to match our ContentFlag interface
          const mappedFlags: ContentFlag[] = (flagsData || []).map((flag: any) => ({
            id: flag.id,
            book_id: flag.book_id,
            flag_type: flag.flag_type,
            description: flag.description || 'No description provided',
            status: flag.status,
            created_at: flag.created_at,
            books: flag.books,
            profiles: flag.profiles
          }));
          setContentFlags(mappedFlags);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();

    // Set up real-time subscription for immediate updates
    const channel = supabase
      .channel('admin-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        (payload) => {
          console.log('📚 Book change detected:', payload);
          // Refetch data when books are updated
          fetchAdminData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          console.log('🔔 Admin notification change detected:', payload);
          // Refetch data when notifications change
          fetchAdminData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pendingBooks,
    contentFlags,
    loading
  };
}
