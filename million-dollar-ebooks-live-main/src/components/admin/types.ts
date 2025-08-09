
import { Tables } from '@/integrations/supabase/types';

export type PendingBook = Tables<'books'>;

export interface ContentFlag {
  id: string;
  book_id: string;
  flag_type: string;
  description: string;
  status: string;
  created_at: string;
  books: {
    title: string;
    author_name: string;
  } | null;
  profiles: {
    display_name: string;
    username: string;
  } | null;
}
