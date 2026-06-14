import api from '@/lib/api';
import { useWishlistStore } from '@/lib/store';

/** Load wishlisted college IDs from the server into client state. */
export async function syncWishlistFromServer(): Promise<void> {
  try {
    const { data } = await api.get<{ college_ids: number[] }>('/wishlist/ids');
    useWishlistStore.getState().setWishlistIds(data.college_ids);
  } catch {
    useWishlistStore.getState().setWishlistIds([]);
  }
}

export function clearWishlistState(): void {
  useWishlistStore.getState().setWishlistIds([]);
}
