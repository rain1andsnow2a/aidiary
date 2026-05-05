// 装扮 store：unlock 列表 + 当前选中（localStorage 持久化）
//
// 后端只持久化映光余额（spend ledger），unlock + 选中状态留在前端。
// 同一用户跨设备的 unlock 暂不同步——v2 可以挪到 user.preferences。

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { findCosmetic, type CosmeticKind } from '@/features/cosmetics/catalog'

interface CosmeticsState {
  unlocked: Record<string, true>
  selected: Record<CosmeticKind, string | null>

  unlock: (id: string) => void
  setSelected: (kind: CosmeticKind, id: string | null) => void
  isUnlocked: (id: string) => boolean
}

const INITIAL_SELECTED: Record<CosmeticKind, string | null> = {
  heartLightSkin: null,
  spriteSticker: null,
  themeColor: null,
}

export const useCosmeticsStore = create<CosmeticsState>()(
  persist(
    (set, get) => ({
      unlocked: {},
      selected: { ...INITIAL_SELECTED },

      unlock: (id) => {
        const cosmetic = findCosmetic(id)
        if (!cosmetic) return
        const next = { ...get().unlocked, [id]: true as const }
        // 第一次解锁某分类的物品，自动选中
        const selected = { ...get().selected }
        if (!selected[cosmetic.kind]) selected[cosmetic.kind] = id
        set({ unlocked: next, selected })
      },

      setSelected: (kind, id) => {
        if (id && !get().unlocked[id]) return
        set({ selected: { ...get().selected, [kind]: id } })
      },

      isUnlocked: (id) => Boolean(get().unlocked[id]),
    }),
    {
      name: 'yinji-cosmetics-v1',
      version: 1,
    },
  ),
)
