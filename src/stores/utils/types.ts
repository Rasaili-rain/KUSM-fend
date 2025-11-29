export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
