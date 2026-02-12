export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark;
        Insert: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
