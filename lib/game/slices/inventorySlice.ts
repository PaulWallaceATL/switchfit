import type { GameSliceCreator } from "@/lib/game/store";
import { getProduct, type BagItem } from "@/lib/catalog";

/**
 * The inventory: a "bag" (cart of items the player intends to buy) and "owned"
 * (items purchased with credits). Checkout spends credits via the player slice.
 */
export interface InventorySlice {
  bag: BagItem[];
  owned: BagItem[];
  addToBag: (item: BagItem) => void;
  removeFromBag: (index: number) => void;
  /** Spend credits on everything in the bag; returns success. */
  checkout: () => boolean;
}

function bagTotal(items: BagItem[]): number {
  return items.reduce((sum, item) => sum + (getProduct(item.productId)?.price ?? 0), 0);
}

export const createInventorySlice: GameSliceCreator<InventorySlice> = (set, get) => ({
  bag: [],
  owned: [],

  addToBag: (item) => set((s) => ({ bag: [...s.bag, item] })),

  removeFromBag: (index) =>
    set((s) => ({ bag: s.bag.filter((_, i) => i !== index) })),

  checkout: () => {
    const { bag, spendCredits } = get();
    if (bag.length === 0) return false;
    const total = bagTotal(bag);
    if (!spendCredits(total)) return false;
    set((s) => ({ owned: [...s.owned, ...s.bag], bag: [] }));
    return true;
  },
});
