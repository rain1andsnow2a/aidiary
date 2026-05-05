// 主题色 / 心灯皮肤 Provider：把当前选中状态映射成 CSS 变量挂在 <html>
//
// 使用：在 App.tsx 顶层包一层 <CosmeticsProvider />，组件里直接读 :root 的 var
//
// :root --yinji-primary  主色（强调色 / 按钮）
// :root --yinji-surface  背景轻色
// :root --yinji-heart-glow  心灯主页 glow 渐变开始色
// :root --yinji-heart-glow-end 渐变结束色
// :root --yinji-sprite-sticker emoji（精灵贴纸覆盖）

import { useEffect } from 'react'
import { useCosmeticsStore } from '@/store/cosmeticsStore'
import { findCosmetic } from './catalog'

const DEFAULT_VARS = {
  '--yinji-primary': '#b76458',
  '--yinji-surface': '#fff8f4',
  '--yinji-heart-glow': '#f58b7d',
  '--yinji-heart-glow-end': '#b19adc',
  '--yinji-sprite-sticker': '"🦊"',
}

export default function CosmeticsProvider({ children }: { children: React.ReactNode }) {
  const themeId = useCosmeticsStore((s) => s.selected.themeColor)
  const skinId = useCosmeticsStore((s) => s.selected.heartLightSkin)
  const stickerId = useCosmeticsStore((s) => s.selected.spriteSticker)

  useEffect(() => {
    const root = document.documentElement
    const next: Record<string, string> = { ...DEFAULT_VARS }

    if (themeId) {
      const theme = findCosmetic(themeId)
      if (theme) {
        next['--yinji-primary'] = theme.preview.primary
        if (theme.preview.secondary) next['--yinji-surface'] = theme.preview.secondary
      }
    }

    if (skinId) {
      const skin = findCosmetic(skinId)
      if (skin) {
        next['--yinji-heart-glow'] = skin.preview.primary
        if (skin.preview.secondary) next['--yinji-heart-glow-end'] = skin.preview.secondary
      }
    }

    if (stickerId) {
      const sticker = findCosmetic(stickerId)
      if (sticker?.preview.emoji) next['--yinji-sprite-sticker'] = `"${sticker.preview.emoji}"`
    }

    for (const [k, v] of Object.entries(next)) root.style.setProperty(k, v)

    return () => {
      // 不主动清除，让 SPA 切页时保持
    }
  }, [themeId, skinId, stickerId])

  return <>{children}</>
}
