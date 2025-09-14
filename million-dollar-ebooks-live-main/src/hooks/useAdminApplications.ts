
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WriterApplication {
  id: string;
  display_name: string;
  email: string;
  bio: string;
  writing_samples: string[];
  previous_publications: string | null;
  writing_genres: string[];
  social_media_links: string | null;
  status: string;
  created_at: string;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function useAdminApplications() {
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription for applications
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'author_applications'
        },
        (payload) => {
          console.log('📋 Application change detected:', payload);
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('author_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      const applicationsData = data || [];
      setApplications(applicationsData);
      setPendingCount(applicationsData.filter(app => app.status === 'pending').length);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    pendingCount,
    refetch: fetchApplications
  };
}
