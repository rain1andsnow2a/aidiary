// 映光商店商品目录（前端配置，0 后端）
//
// 三类商品：心灯皮肤 / 精灵贴纸 / 主题色
// price: 映光成本（后端 spend 端点扣账）
// id: 全局唯一，写进 ledger.meta.item_id 用于幂等
//
// 想加新品：在这里追加一项 + 在 zh-CN.json / en-US.json 加 shop.items.<id> + label/desc

export type CosmeticKind = 'heartLightSkin' | 'spriteSticker' | 'themeColor'

export interface CosmeticItem {
  id: string
  kind: CosmeticKind
  price: number
  // 用于预览的 css 颜色或 emoji；不依赖图片资源以减小体积
  preview: {
    primary: string
    secondary?: string
    emoji?: string
  }
}

export const HEART_LIGHT_SKINS: CosmeticItem[] = [
  { id: 'skin-warm', kind: 'heartLightSkin', price: 50, preview: { primary: '#f58b7d', secondary: '#b19adc', emoji: '🕯️' } },
  { id: 'skin-aurora', kind: 'heartLightSkin', price: 100, preview: { primary: '#7cc4b3', secondary: '#8ea7d4', emoji: '🌌' } },
  { id: 'skin-sakura', kind: 'heartLightSkin', price: 100, preview: { primary: '#f0a09a', secondary: '#fcd1d1', emoji: '🌸' } },
  { id: 'skin-deep-sea', kind: 'heartLightSkin', price: 150, preview: { primary: '#5b6f9c', secondary: '#a895c3', emoji: '🌊' } },
]

export const SPRITE_STICKERS: CosmeticItem[] = [
  { id: 'sticker-scarf', kind: 'spriteSticker', price: 80, preview: { primary: '#dd6d62', emoji: '🧣' } },
  { id: 'sticker-crown', kind: 'spriteSticker', price: 150, preview: { primary: '#f6b95c', emoji: '👑' } },
  { id: 'sticker-glasses', kind: 'spriteSticker', price: 80, preview: { primary: '#8f65e8', emoji: '🤓' } },
  { id: 'sticker-leaf', kind: 'spriteSticker', price: 80, preview: { primary: '#4bbf88', emoji: '🌿' } },
]

export const THEME_COLORS: CosmeticItem[] = [
  { id: 'theme-warm', kind: 'themeColor', price: 30, preview: { primary: '#b76458', secondary: '#fff8f4' } },
  { id: 'theme-mist', kind: 'themeColor', price: 30, preview: { primary: '#5b6f9c', secondary: '#f0f3f8' } },
  { id: 'theme-meadow', kind: 'themeColor', price: 30, preview: { primary: '#4bbf88', secondary: '#f3faf6' } },
]

export const ALL_COSMETICS: CosmeticItem[] = [
  ...HEART_LIGHT_SKINS,
  ...SPRITE_STICKERS,
  ...THEME_COLORS,
]

export function findCosmetic(id: string): CosmeticItem | undefined {
  return ALL_COSMETICS.find((c) => c.id === id)
}
