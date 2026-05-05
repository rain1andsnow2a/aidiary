// 映光商店：心灯皮肤 / 精灵贴纸 / 主题色
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles, Check, Lock } from 'lucide-react'

import { diaryService } from '@/services/diary.service'
import { toast } from '@/components/ui/toast'
import { useCosmeticsStore } from '@/store/cosmeticsStore'
import {
  HEART_LIGHT_SKINS,
  SPRITE_STICKERS,
  THEME_COLORS,
  type CosmeticItem,
  type CosmeticKind,
} from '@/features/cosmetics/catalog'

export default function ShopPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [total, setTotal] = useState<number | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const unlocked = useCosmeticsStore((s) => s.unlocked)
  const selected = useCosmeticsStore((s) => s.selected)
  const unlock = useCosmeticsStore((s) => s.unlock)
  const setSelected = useCosmeticsStore((s) => s.setSelected)

  const loadBalance = async () => {
    try {
      const res = await diaryService.getLightPoints()
      setTotal(res.total)
    } catch {
      setTotal(0)
    }
  }

  useEffect(() => {
    void loadBalance()
  }, [])

  const handlePurchase = async (item: CosmeticItem) => {
    if (unlocked[item.id]) {
      setSelected(item.kind, item.id)
      toast(t('shop.equipped'), 'success')
      return
    }
    if (total !== null && total < item.price) {
      toast(t('shop.notEnough'), 'error')
      return
    }
    setBusy(item.id)
    try {
      const res = await diaryService.spendLightPoints({
        amount: item.price,
        item_id: item.id,
        reason: 'shop_purchase',
        meta: { kind: item.kind },
      })
      setTotal(res.new_total)
      unlock(item.id)
      setSelected(item.kind, item.id)
      toast(t('shop.purchaseSuccess'), 'success')
    } catch (e: any) {
      toast(e?.response?.data?.detail || t('shop.purchaseFailed'), 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleUnequip = (kind: CosmeticKind) => {
    setSelected(kind, null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(158deg, #fbf7f2 0%, #f4efea 62%, #f8f2ec 100%)' }}>
      <header className="sticky top-0 z-30 border-b border-[#ead9cd]/70 bg-[rgba(251,247,242,0.9)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <button onClick={() => navigate('/')} className="text-sm text-stone-400 hover:text-stone-600">
            ← {t('shop.back')}
          </button>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-600">
            <Sparkles className="h-4 w-4 text-[#b56f61]" /> {t('shop.title')}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm font-bold text-[#b56f61]">
            <Sparkles className="h-3.5 w-3.5" /> {total ?? '—'}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <ShopSection
          titleKey="shop.heartLightSkin"
          descKey="shop.heartLightSkinDesc"
          items={HEART_LIGHT_SKINS}
          unlocked={unlocked}
          selectedId={selected.heartLightSkin}
          busy={busy}
          onPurchase={handlePurchase}
          onUnequip={() => handleUnequip('heartLightSkin')}
          t={t}
        />
        <ShopSection
          titleKey="shop.spriteSticker"
          descKey="shop.spriteStickerDesc"
          items={SPRITE_STICKERS}
          unlocked={unlocked}
          selectedId={selected.spriteSticker}
          busy={busy}
          onPurchase={handlePurchase}
          onUnequip={() => handleUnequip('spriteSticker')}
          t={t}
        />
        <ShopSection
          titleKey="shop.themeColor"
          descKey="shop.themeColorDesc"
          items={THEME_COLORS}
          unlocked={unlocked}
          selectedId={selected.themeColor}
          busy={busy}
          onPurchase={handlePurchase}
          onUnequip={() => handleUnequip('themeColor')}
          t={t}
        />

        <p className="text-center text-xs text-stone-400">{t('shop.footnote')}</p>
      </main>
    </div>
  )
}

function ShopSection({
  titleKey,
  descKey,
  items,
  unlocked,
  selectedId,
  busy,
  onPurchase,
  onUnequip,
  t,
}: {
  titleKey: string
  descKey: string
  items: CosmeticItem[]
  unlocked: Record<string, true>
  selectedId: string | null
  busy: string | null
  onPurchase: (item: CosmeticItem) => void
  onUnequip: () => void
  t: ReturnType<typeof useTranslation>['t']
}) {
  return (
    <section className="rounded-[28px] border border-[#eadfd8] bg-white/82 p-6 shadow-[0_14px_40px_rgba(115,84,69,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-800">{t(titleKey)}</h2>
          <p className="mt-1 text-xs text-stone-400">{t(descKey)}</p>
        </div>
        {selectedId && (
          <button
            onClick={onUnequip}
            className="text-xs font-semibold text-stone-400 hover:text-[#b56f61]"
          >
            {t('shop.unequip')}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const isUnlocked = Boolean(unlocked[item.id])
          const isSelected = selectedId === item.id
          const isBusy = busy === item.id
          return (
            <button
              key={item.id}
              type="button"
              disabled={isBusy}
              onClick={() => onPurchase(item)}
              className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                isSelected
                  ? 'border-[#b56f61] bg-[#fff4ec] shadow-[0_8px_22px_rgba(183,100,88,0.18)]'
                  : 'border-[#eadfd8] bg-white hover:border-[#d8b8ad]'
              } ${isBusy ? 'opacity-60' : ''}`}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-inner"
                style={{
                  background: item.preview.secondary
                    ? `linear-gradient(135deg, ${item.preview.primary}, ${item.preview.secondary})`
                    : item.preview.primary,
                  color: '#fff',
                }}
              >
                {item.preview.emoji ?? '✦'}
              </div>
              <p className="text-sm font-semibold text-stone-700">{t(`shop.items.${item.id}.name`)}</p>
              <p className="text-xs text-stone-400 line-clamp-2">{t(`shop.items.${item.id}.desc`)}</p>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4bbf88]">
                  <Check className="h-3.5 w-3.5" />
                  {isSelected ? t('shop.equipped') : t('shop.owned')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b56f61]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {item.price}
                </span>
              )}
              {!isUnlocked && (
                <Lock className="absolute right-2 top-2 h-3.5 w-3.5 text-stone-300" />
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
