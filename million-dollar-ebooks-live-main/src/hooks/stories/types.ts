
export interface Story {
  id: string;
  title: string;
  description: string;
  content: string;
  author_id: string;
  story_date: string;
  created_at: string;
  view_count: number;
  read_count: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
  reactions: {
    heart: number;
    shock: number;
    'thumbs-down': number;
  };
  user_reaction?: string;
  is_daily_winner?: boolean;
}
