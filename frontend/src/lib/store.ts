import { create } from 'zustand';
import { User } from '@/types';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loadTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('collegesathi_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    set({ theme: newTheme });
  },
  
  loadTheme: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('collegesathi_theme') as 'light' | 'dark' | null;
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, token) => {
    localStorage.setItem('collegesathi_token', token);
    localStorage.setItem('collegesathi_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('collegesathi_token');
    localStorage.removeItem('collegesathi_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('collegesathi_token');
    const userStr = localStorage.getItem('collegesathi_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('collegesathi_token');
        localStorage.removeItem('collegesathi_user');
      }
    }
  },
}));

interface WishlistState {
  wishlistIds: number[];
  setWishlistIds: (ids: number[]) => void;
  toggleWishlist: (id: number) => void;
  isWishlisted: (id: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  
  setWishlistIds: (ids) => set({ wishlistIds: ids }),
  
  toggleWishlist: (id) => {
    const current = get().wishlistIds;
    if (current.includes(id)) {
      set({ wishlistIds: current.filter((i) => i !== id) });
    } else {
      set({ wishlistIds: [...current, id] });
    }
  },
  
  isWishlisted: (id) => get().wishlistIds.includes(id),
}));
