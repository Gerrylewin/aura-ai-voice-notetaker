export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          admin_id: string
          author_id: string
          author_name: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          is_read: boolean
          notification_type: string
          read_at: string | null
          title: string
        }
        Insert: {
          admin_id: string
          author_id: string
          author_name: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type: string
          read_at?: string | null
          title: string
        }
        Update: {
          admin_id?: string
          author_id?: string
          author_name?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type?: string
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      admin_user_notifications: {
        Row: {
          activity_data: Json | null
          admin_id: string
          created_at: string
          id: string
          is_read: boolean
          notification_type: string
          read_at: string | null
          user_display_name: string | null
          user_email: string
          user_id: string
          user_role: string
        }
        Insert: {
          activity_data?: Json | null
          admin_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type: string
          read_at?: string | null
          user_display_name?: string | null
          user_email: string
          user_id: string
          user_role: string
        }
        Update: {
          activity_data?: Json | null
          admin_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          notification_type?: string
          read_at?: string | null
          user_display_name?: string | null
          user_email?: string
          user_id?: string
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_user_notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      author_achievements: {
        Row: {
          achievement_key: string
          created_at: string
          description: string
          icon: string
          id: string
          points_reward: number
          rarity: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          achievement_key: string
          created_at?: string
          description: string
          icon: string
          id?: string
          points_reward?: number
          rarity?: string
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          achievement_key?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          points_reward?: number
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      author_applications: {
        Row: {
          bio: string
          created_at: string
          display_name: string
          email: string
          id: string
          previous_publications: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media_links: string | null
          status: string
          updated_at: string
          writing_genres: string[]
          writing_samples: string[]
        }
        Insert: {
          bio: string
          created_at?: string
          display_name: string
          email: string
          id?: string
          previous_publications?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: string | null
          status?: string
          updated_at?: string
          writing_genres?: string[]
          writing_samples?: string[]
        }
        Update: {
          bio?: string
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          previous_publications?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media_links?: string | null
          status?: string
          updated_at?: string
          writing_genres?: string[]
          writing_samples?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "author_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      author_progress: {
        Row: {
          achievements_unlocked: string[] | null
          author_id: string
          author_level: number
          author_points: number
          books_published: number
          created_at: string
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_days: number
          total_revenue_cents: number
          total_sales: number
          total_words_written: number
          updated_at: string
        }
        Insert: {
          achievements_unlocked?: string[] | null
          author_id: string
          author_level?: number
          author_points?: number
          books_published?: number
          created_at?: string
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_days?: number
          total_revenue_cents?: number
          total_sales?: number
          total_words_written?: number
          updated_at?: string
        }
        Update: {
          achievements_unlocked?: string[] | null
          author_id?: string
          author_level?: number
          author_points?: number
          books_published?: number
          created_at?: string
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_days?: number
          total_revenue_cents?: number
          total_sales?: number
          total_words_written?: number
          updated_at?: string
        }
        Relationships: []
      }
      book_categories: {
        Row: {
          book_id: string
          category_id: string
        }
        Insert: {
          book_id: string
          category_id: string
        }
        Update: {
          book_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_categories_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      book_content: {
        Row: {
          book_id: string
          chapter_data: Json | null
          content_type: string
          created_at: string
          full_content: string
          id: string
          preview_content: string | null
          updated_at: string
          version: number
          word_count: number | null
        }
        Insert: {
          book_id: string
          chapter_data?: Json | null
          content_type?: string
          created_at?: string
          full_content: string
          id?: string
          preview_content?: string | null
          updated_at?: string
          version?: number
          word_count?: number | null
        }
        Update: {
          book_id?: string
          chapter_data?: Json | null
          content_type?: string
          created_at?: string
          full_content?: string
          id?: string
          preview_content?: string | null
          updated_at?: string
          version?: number
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_content_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_genres: {
        Row: {
          book_id: string
          genre_id: string
        }
        Insert: {
          book_id: string
          genre_id: string
        }
        Update: {
          book_id?: string
          genre_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_genres_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      book_gifts: {
        Row: {
          book_id: string
          claimed_at: string | null
          created_at: string
          expires_at: string | null
          gift_message: string | null
          giver_id: string
          id: string
          purchase_id: string | null
          recipient_id: string
          status: string
        }
        Insert: {
          book_id: string
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          gift_message?: string | null
          giver_id: string
          id?: string
          purchase_id?: string | null
          recipient_id: string
          status?: string
        }
        Update: {
          book_id?: string
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          gift_message?: string | null
          giver_id?: string
          id?: string
          purchase_id?: string | null
          recipient_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_gifts_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_gifts_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_gifts_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_gifts_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_images: {
        Row: {
          alt_text: string | null
          book_id: string
          created_at: string
          file_size_bytes: number | null
          height: number | null
          id: string
          import_job_id: string | null
          mime_type: string | null
          original_path: string
          storage_url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          book_id: string
          created_at?: string
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          import_job_id?: string | null
          mime_type?: string | null
          original_path: string
          storage_url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          book_id?: string
          created_at?: string
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          import_job_id?: string | null
          mime_type?: string | null
          original_path?: string
          storage_url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_images_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_images_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          book_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_id: string | null
          author_name: string
          book_file_url: string | null
          book_status: Database["public"]["Enums"]["book_status"] | null
          book_type: Database["public"]["Enums"]["book_type"] | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          id: string
          isbn: string | null
          page_count: number | null
          preview_text: string | null
          price_cents: number | null
          publication_date: string | null
          rating_average: number | null
          rating_count: number | null
          series_name: string | null
          series_price_cents: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
          word_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          book_file_url?: string | null
          book_status?: Database["public"]["Enums"]["book_status"] | null
          book_type?: Database["public"]["Enums"]["book_type"] | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          isbn?: string | null
          page_count?: number | null
          preview_text?: string | null
          price_cents?: number | null
          publication_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          series_name?: string | null
          series_price_cents?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          word_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          book_file_url?: string | null
          book_status?: Database["public"]["Enums"]["book_status"] | null
          book_type?: Database["public"]["Enums"]["book_type"] | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          isbn?: string | null
          page_count?: number | null
          preview_text?: string | null
          price_cents?: number | null
          publication_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          series_name?: string | null
          series_price_cents?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant1_id: string
          participant2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id: string
          participant2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant1_id?: string
          participant2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          book_recommendation_id: string | null
          conversation_id: string
          created_at: string
          encrypted_content: string
          id: string
          is_read: boolean
          message_type: string
          sender_id: string
        }
        Insert: {
          book_recommendation_id?: string | null
          conversation_id: string
          created_at?: string
          encrypted_content: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id: string
        }
        Update: {
          book_recommendation_id?: string | null
          conversation_id?: string
          created_at?: string
          encrypted_content?: string
          id?: string
          is_read?: boolean
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_book_recommendation_id_fkey"
            columns: ["book_recommendation_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_mutes: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          muted_by: string
          reason: string
          user_id: string
          warning_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          muted_by: string
          reason?: string
          user_id: string
          warning_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          muted_by?: string
          reason?: string
          user_id?: string
          warning_count?: number
        }
        Relationships: []
      }
      chat_warnings: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          issued_by: string
          message_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_by: string
          message_id?: string | null
          reason?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_by?: string
          message_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_warnings_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "public_chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      content_flags: {
        Row: {
          book_id: string | null
          created_at: string
          description: string | null
          flag_type: string
          id: string
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          description?: string | null
          flag_type: string
          id?: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          description?: string | null
          flag_type?: string
          id?: string
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_flags_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_transactions: {
        Row: {
          amount_usdc_cents: number
          author_earnings_cents: number
          author_id: string
          block_number: number | null
          book_id: string | null
          chain_id: number
          confirmed_at: string | null
          created_at: string
          failed_at: string | null
          failure_reason: string | null
          gas_fee_wei: string | null
          id: string
          payment_status: string
          platform_fee_cents: number
          split_contract_address: string
          transaction_data: Json | null
          transaction_hash: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount_usdc_cents: number
          author_earnings_cents: number
          author_id: string
          block_number?: number | null
          book_id?: string | null
          chain_id?: number
          confirmed_at?: string | null
          created_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          gas_fee_wei?: string | null
          id?: string
          payment_status?: string
          platform_fee_cents: number
          split_contract_address: string
          transaction_data?: Json | null
          transaction_hash?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount_usdc_cents?: number
          author_earnings_cents?: number
          author_id?: string
          block_number?: number | null
          book_id?: string | null
          chain_id?: number
          confirmed_at?: string | null
          created_at?: string
          failed_at?: string | null
          failure_reason?: string | null
          gas_fee_wei?: string | null
          id?: string
          payment_status?: string
          platform_fee_cents?: number
          split_contract_address?: string
          transaction_data?: Json | null
          transaction_hash?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_transactions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_transactions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_withdrawals: {
        Row: {
          amount_usdc_cents: number
          chain_id: number
          confirmed_at: string | null
          failed_at: string | null
          failure_reason: string | null
          gas_fee_wei: string | null
          id: string
          initiated_at: string
          split_contract_address: string
          status: string
          to_wallet_address: string
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount_usdc_cents: number
          chain_id?: number
          confirmed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          gas_fee_wei?: string | null
          id?: string
          initiated_at?: string
          split_contract_address: string
          status?: string
          to_wallet_address: string
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount_usdc_cents?: number
          chain_id?: number
          confirmed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          gas_fee_wei?: string | null
          id?: string
          initiated_at?: string
          split_contract_address?: string
          status?: string
          to_wallet_address?: string
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_stories: {
        Row: {
          author_id: string
          content: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          read_count: number | null
          story_date: string
          title: string
          total_read_time_seconds: number | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          read_count?: number | null
          story_date?: string
          title: string
          total_read_time_seconds?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          read_count?: number | null
          story_date?: string
          title?: string
          total_read_time_seconds?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_story_winners: {
        Row: {
          author_id: string
          created_at: string
          heart_count: number | null
          id: string
          shock_count: number | null
          story_date: string
          story_id: string
          thumbs_down_count: number | null
          total_score: number
        }
        Insert: {
          author_id: string
          created_at?: string
          heart_count?: number | null
          id?: string
          shock_count?: number | null
          story_date: string
          story_id: string
          thumbs_down_count?: number | null
          total_score: number
        }
        Update: {
          author_id?: string
          created_at?: string
          heart_count?: number | null
          id?: string
          shock_count?: number | null
          story_date?: string
          story_id?: string
          thumbs_down_count?: number | null
          total_score?: number
        }
        Relationships: []
      }
      deleted_accounts: {
        Row: {
          created_at: string
          deleted_at: string
          email: string
          id: string
          is_test_account: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string
          email: string
          id?: string
          is_test_account?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string
          email?: string
          id?: string
          is_test_account?: boolean
          user_id?: string
        }
        Relationships: []
      }
      favorite_authors: {
        Row: {
          author_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          book_id: string | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          book_id?: string | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          book_id?: string | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_activity_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      import_jobs: {
        Row: {
          book_id: string | null
          completed_at: string | null
          completed_steps: number | null
          created_at: string
          current_step: string | null
          error_message: string | null
          id: string
          import_data: Json | null
          import_type: string
          progress_percentage: number | null
          status: string
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          id?: string
          import_data?: Json | null
          import_type: string
          progress_percentage?: number | null
          status?: string
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          current_step?: string | null
          error_message?: string | null
          id?: string
          import_data?: Json | null
          import_type?: string
          progress_percentage?: number | null
          status?: string
          total_steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_jobs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_requests: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          requested_at: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          requested_at?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          app_book_reviews: boolean
          app_comments: boolean
          app_gifts: boolean
          app_messages: boolean
          app_new_books_from_favorites: boolean
          app_new_stories_from_favorites: boolean
          created_at: string
          email_book_reviews: boolean
          email_comments: boolean
          email_gifts: boolean
          email_marketing: boolean
          email_messages: boolean
          email_new_books_from_favorites: boolean
          email_new_stories_from_favorites: boolean
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_book_reviews?: boolean
          app_comments?: boolean
          app_gifts?: boolean
          app_messages?: boolean
          app_new_books_from_favorites?: boolean
          app_new_stories_from_favorites?: boolean
          created_at?: string
          email_book_reviews?: boolean
          email_comments?: boolean
          email_gifts?: boolean
          email_marketing?: boolean
          email_messages?: boolean
          email_new_books_from_favorites?: boolean
          email_new_stories_from_favorites?: boolean
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_book_reviews?: boolean
          app_comments?: boolean
          app_gifts?: boolean
          app_messages?: boolean
          app_new_books_from_favorites?: boolean
          app_new_stories_from_favorites?: boolean
          created_at?: string
          email_book_reviews?: boolean
          email_comments?: boolean
          email_gifts?: boolean
          email_marketing?: boolean
          email_messages?: boolean
          email_new_books_from_favorites?: boolean
          email_new_stories_from_favorites?: boolean
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_crypto_earnings: {
        Row: {
          amount_usdc_cents: number
          chain_id: number
          contract_address: string
          created_at: string
          id: string
          transaction_id: string
          withdrawal_tx_hash: string | null
          withdrawn: boolean
          withdrawn_at: string | null
        }
        Insert: {
          amount_usdc_cents: number
          chain_id?: number
          contract_address: string
          created_at?: string
          id?: string
          transaction_id: string
          withdrawal_tx_hash?: string | null
          withdrawn?: boolean
          withdrawn_at?: string | null
        }
        Update: {
          amount_usdc_cents?: number
          chain_id?: number
          contract_address?: string
          created_at?: string
          id?: string
          transaction_id?: string
          withdrawal_tx_hash?: string | null
          withdrawn?: boolean
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_crypto_earnings_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "crypto_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_earnings: {
        Row: {
          amount_cents: number
          created_at: string | null
          id: string
          purchase_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          id?: string
          purchase_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          id?: string
          purchase_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_earnings_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          crypto_earnings_cents: number | null
          display_name: string | null
          email_confirmed_at: string | null
          external_links: Json | null
          id: string
          is_verified: boolean | null
          last_crypto_withdrawal_at: string | null
          member_number: number | null
          profile_completed: boolean | null
          requires_authentication: boolean | null
          social_links: Json | null
          split_contract_address: string | null
          stripe_account_id: string | null
          stripe_connect_account_id: string | null
          stripe_onboarding_completed: boolean | null
          stripe_payouts_enabled: boolean | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
          username: string | null
          wallet_address: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crypto_earnings_cents?: number | null
          display_name?: string | null
          email_confirmed_at?: string | null
          external_links?: Json | null
          id: string
          is_verified?: boolean | null
          last_crypto_withdrawal_at?: string | null
          member_number?: number | null
          profile_completed?: boolean | null
          requires_authentication?: boolean | null
          social_links?: Json | null
          split_contract_address?: string | null
          stripe_account_id?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crypto_earnings_cents?: number | null
          display_name?: string | null
          email_confirmed_at?: string | null
          external_links?: Json | null
          id?: string
          is_verified?: boolean | null
          last_crypto_withdrawal_at?: string | null
          member_number?: number | null
          profile_completed?: boolean | null
          requires_authentication?: boolean | null
          social_links?: Json | null
          split_contract_address?: string | null
          stripe_account_id?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_completed?: boolean | null
          stripe_payouts_enabled?: boolean | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role"] | null
          username?: string | null
          wallet_address?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      public_chat_messages: {
        Row: {
          created_at: string
          encrypted_content: string
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_content: string
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_content?: string
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          author_earnings_cents: number
          book_id: string | null
          commission_cents: number
          crypto_transaction_id: string | null
          id: string
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          platform_fee_cents: number | null
          purchased_at: string | null
          stripe_connect_account_id: string | null
          stripe_payment_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          author_earnings_cents: number
          book_id?: string | null
          commission_cents: number
          crypto_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee_cents?: number | null
          purchased_at?: string | null
          stripe_connect_account_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          author_earnings_cents?: number
          book_id?: string | null
          commission_cents?: number
          crypto_transaction_id?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          platform_fee_cents?: number | null
          purchased_at?: string | null
          stripe_connect_account_id?: string | null
          stripe_payment_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_crypto_transaction_id_fkey"
            columns: ["crypto_transaction_id"]
            isOneToOne: false
            referencedRelation: "crypto_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_history: {
        Row: {
          book_id: string
          completed_at: string | null
          id: string
          last_position: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          completed_at?: string | null
          id?: string
          last_position?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          completed_at?: string | null
          id?: string
          last_position?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_history_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_preferences: {
        Row: {
          brightness: number
          created_at: string | null
          font_family: string
          font_size: string
          id: string
          line_spacing: string
          margins: string
          theme: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brightness?: number
          created_at?: string | null
          font_family?: string
          font_size?: string
          id?: string
          line_spacing?: string
          margins?: string
          theme?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brightness?: number
          created_at?: string | null
          font_family?: string
          font_size?: string
          id?: string
          line_spacing?: string
          margins?: string
          theme?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string | null
          id: string
          last_read_at: string | null
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          id?: string
          last_read_at?: string | null
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          book_id: string | null
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          rating: number | null
          review_text: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      split_contracts: {
        Row: {
          author_id: string
          author_share_percentage: number
          chain_id: number
          contract_address: string
          created_at: string
          deployment_tx_hash: string | null
          id: string
          is_active: boolean
          platform_share_percentage: number
          updated_at: string
        }
        Insert: {
          author_id: string
          author_share_percentage?: number
          chain_id?: number
          contract_address: string
          created_at?: string
          deployment_tx_hash?: string | null
          id?: string
          is_active?: boolean
          platform_share_percentage?: number
          updated_at?: string
        }
        Update: {
          author_id?: string
          author_share_percentage?: number
          chain_id?: number
          contract_address?: string
          created_at?: string
          deployment_tx_hash?: string | null
          id?: string
          is_active?: boolean
          platform_share_percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_contracts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_duration_seconds: number | null
          story_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_duration_seconds?: number | null
          story_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_duration_seconds?: number | null
          story_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      story_bookmarks: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_bookmarks_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "daily_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          category: string | null
          created_at: string
          description: string
          email: string
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      thank_messages: {
        Row: {
          created_at: string
          gift_id: string
          id: string
          message: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          gift_id: string
          id?: string
          message?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          gift_id?: string
          id?: string
          message?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thank_messages_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "book_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      tips: {
        Row: {
          amount_cents: number
          author_earnings_cents: number
          author_id: string
          book_id: string | null
          created_at: string
          id: string
          payment_status: string | null
          platform_fee_cents: number
          stripe_payment_intent_id: string | null
          tip_message: string | null
          tipper_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          author_earnings_cents: number
          author_id: string
          book_id?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          platform_fee_cents: number
          stripe_payment_intent_id?: string | null
          tip_message?: string | null
          tipper_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          author_earnings_cents?: number
          author_id?: string
          book_id?: string | null
          created_at?: string
          id?: string
          payment_status?: string | null
          platform_fee_cents?: number
          stripe_payment_intent_id?: string | null
          tip_message?: string | null
          tipper_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tips_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          created_at: string
          id: string
          monthly_reading_target: number | null
          monthly_writing_target: number | null
          reading_goal: string | null
          updated_at: string
          user_id: string
          writing_goal: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_reading_target?: number | null
          monthly_writing_target?: number | null
          reading_goal?: string | null
          updated_at?: string
          user_id: string
          writing_goal?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          monthly_reading_target?: number | null
          monthly_writing_target?: number | null
          reading_goal?: string | null
          updated_at?: string
          user_id?: string
          writing_goal?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_story_winner: {
        Args: { target_date?: string }
        Returns: undefined
      }
      complete_import_job: {
        Args: { job_id: string; success: boolean; error_msg?: string }
        Returns: undefined
      }
      generate_category_slug: {
        Args: { category_name: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_story_view: {
        Args: { story_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_moderator_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_import_progress: {
        Args: {
          job_id: string
          new_progress: number
          new_step?: string
          increment_completed_steps?: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      book_status: "draft" | "published" | "archived"
      book_type: "public_domain" | "user_created"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "reader" | "writer" | "admin" | "moderator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      book_status: ["draft", "published", "archived"],
      book_type: ["public_domain", "user_created"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["reader", "writer", "admin", "moderator"],
    },
  },
} as const
