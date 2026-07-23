export type Player = {
  id: string;
  name: string;
  slug: string;
  rating: number;
  photo_url: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};