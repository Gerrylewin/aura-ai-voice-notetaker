
export interface PublicChatMessage {
  id: string;
  user_id: string;
  encrypted_content: string;
  message_type: string;
  created_at: string;
  decrypted_content: string; // Make this required since we always decrypt
  user_role?: 'reader' | 'writer' | 'moderator' | 'admin';
  profiles?: {
    display_name: string;
    avatar_url?: string;
  } | null;
}
