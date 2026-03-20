// 用户画像设置页面 - 温暖柔和心理日记风格
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { toast } from '@/components/ui/toast'

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const SOCIAL_STYLES = [
  { value: 'formal', label: '正式', emoji: '👔' },
  { value: 'casual', label: '随意', emoji: '😎' },
  { value: 'humorous', label: '幽默', emoji: '😄' },
  { value: 'professional', label: '专业', emoji: '💼' },
  { value: 'friendly', label: '友好', emoji: '🤝' },
  { value: 'reserved', label: '内敛', emoji: '🌙' },
]

const CURRENT_STATES = [
  { value: '工作', emoji: '💻' },
  { value: '学习', emoji: '📚' },
  { value: '创业', emoji: '🚀' },
  { value: '自由职业', emoji: '🎨' },
  { value: '退休', emoji: '🌴' },
  { value: '间隔年', emoji: '✈️' },
  { value: '其他', emoji: '✨' },
]

const gradientBtn = { background: 'linear-gradient(135deg, #fb7185, #c084fc)' }
const warmBg = { background: 'linear-gradient(160deg, #fff8f5 0%, #fdf4ff 60%, #f5f3ff 100%)' }

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [username, setUsername] = useState(user?.username || '')
  const [mbti, setMbti] = useState(user?.mbti || '')
  const [socialStyle, setSocialStyle] = useState(user?.social_style || '')
  const [currentState, setCurrentState] = useState(user?.current_state || '')
  const [catchphrases, setCatchphrases] = useState<string[]>(user?.catchphrases || [])
  const [newCatchphrase, setNewCatchphrase] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = username || user?.username || user?.email?.split('@')[0] || '用户'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  // 从后端加载最新画像数据
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile()
        setUsername(profile.username || '')
        setMbti(profile.mbti || '')
        setSocialStyle(profile.social_style || '')
        setCurrentState(profile.current_state || '')
        setCatchphrases(profile.catchphrases || [])
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
      } catch (err) {
        console.error('加载画像失败:', err)
      }
    }
    loadProfile()
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast('图片大小不能超过 2MB', 'error')
      return
    }
    // 先预览
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 上传到后端
    try {
      const updatedUser = await authService.uploadAvatar(file)
      setAvatarPreview(updatedUser.avatar_url || null)
      // 同步更新authStore中的user
      useAuthStore.setState({ user: updatedUser })
      toast('头像上传成功', 'success')
    } catch (err) {
      console.error('头像上传失败:', err)
      toast('头像上传失败', 'error')
    }
  }

  const handleAddCatchphrase = () => {
    if (newCatchphrase.trim() && !catchphrases.includes(newCatchphrase.trim())) {
      setCatchphrases([...catchphrases, newCatchphrase.trim()])
      setNewCatchphrase('')
    }
  }

  const handleRemoveCatchphrase = (index: number) => {
    setCatchphrases(catchphrases.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedUser = await authService.updateProfile({
        username: username.trim() || undefined,
        mbti: mbti || undefined,
        social_style: socialStyle || undefined,
        current_state: currentState || undefined,
        catchphrases,
      })
      // 同步更新authStore中的user
      useAuthStore.setState({ user: updatedUser })
      toast('设置已保存 🌸', 'success')
      navigate('/')
    } catch (err: any) {
      console.error('保存失败:', err)
      toast(err.response?.data?.detail || '保存失败', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`card-warm p-6 ${className}`}>{children}</div>
  )

  const SectionTitle = ({ title, desc }: { title: string; desc?: string }) => (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
      {desc && <p className="text-xs text-stone-400 mt-0.5">{desc}</p>}
    </div>
  )

  return (
    <div className="min-h-screen" style={warmBg}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-rose-100/60" style={{ background: 'rgba(255,248,245,0.88)' }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex justify-between items-center py-3.5">
            <button onClick={() => navigate('/')} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
              ← 返回
            </button>
            <span className="text-sm font-semibold text-stone-600">个人设置</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 rounded-xl text-xs font-semibold text-white disabled:opacity-50 shadow-sm transition-all active:scale-[0.97]"
              style={gradientBtn}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-5">

          {/* 头像 + 基本信息 */}
          <SectionCard>
            {/* 头像 Hero 区域 */}
            <div className="relative -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
              <img src="/settings-hero-bg_1.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90" />
              <div className="relative flex flex-col items-center py-10">
                {/* 头像 */}
                <div className="relative group mb-3">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white/90 overflow-hidden cursor-pointer"
                    style={gradientBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="头像" className="w-full h-full object-cover" />
                    ) : (
                      avatarLetter
                    )}
                  </div>
                  <div
                    className="absolute inset-0 rounded-full bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <p className="text-base font-bold text-stone-700">{displayName}</p>
                <p className="text-xs text-stone-400">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-rose-400/80 hover:text-rose-500 transition-colors"
                >
                  点击更换头像
                </button>
              </div>
            </div>

            <SectionTitle title="基本信息" desc="告诉我们如何称呼你" />
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">用户名</label>
                <input
                  type="text"
                  placeholder="如何称呼你"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-stone-50/80 border border-stone-100 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">邮箱（不可修改）</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full h-11 px-4 rounded-xl bg-stone-50/50 border border-stone-100 text-sm text-stone-400 cursor-not-allowed"
                />
              </div>
            </div>
          </SectionCard>

          {/* MBTI */}
          <SectionCard>
            <SectionTitle title="MBTI 性格类型" desc="选择你的性格类型（可选）" />
            <div className="grid grid-cols-4 gap-2">
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMbti(mbti === type ? '' : type)}
                  className={`h-10 rounded-xl text-xs font-medium transition-all duration-200 ${
                    mbti === type
                      ? 'text-white shadow-sm'
                      : 'bg-stone-50/80 text-stone-500 border border-stone-100 hover:border-rose-200 hover:text-rose-400'
                  }`}
                  style={mbti === type ? gradientBtn : undefined}
                >
                  {type}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 社交风格 */}
          <SectionCard>
            <SectionTitle title="社交风格" desc="你通常如何表达自己？" />
            <div className="grid grid-cols-3 gap-2.5">
              {SOCIAL_STYLES.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setSocialStyle(socialStyle === style.value ? '' : style.value)}
                  className={`h-12 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    socialStyle === style.value
                      ? 'text-white shadow-sm'
                      : 'bg-stone-50/80 text-stone-500 border border-stone-100 hover:border-rose-200 hover:text-rose-400'
                  }`}
                  style={socialStyle === style.value ? gradientBtn : undefined}
                >
                  <span>{style.emoji}</span>
                  {style.label}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 当前状态 */}
          <SectionCard>
            <SectionTitle title="当前状态" desc="你目前的生活状态" />
            <div className="flex flex-wrap gap-2.5">
              {CURRENT_STATES.map((state) => (
                <button
                  key={state.value}
                  type="button"
                  onClick={() => setCurrentState(currentState === state.value ? '' : state.value)}
                  className={`h-10 px-4 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    currentState === state.value
                      ? 'text-white shadow-sm'
                      : 'bg-stone-50/80 text-stone-500 border border-stone-100 hover:border-rose-200 hover:text-rose-400'
                  }`}
                  style={currentState === state.value ? gradientBtn : undefined}
                >
                  <span>{state.emoji}</span>
                  {state.value}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 口头禅 */}
          <SectionCard>
            <SectionTitle title="口头禅" desc="添加你常用的表达，AI 会学习你的风格" />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="例如：哈哈、好的、收到..."
                value={newCatchphrase}
                onChange={(e) => setNewCatchphrase(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCatchphrase()
                  }
                }}
                className="flex-1 h-10 px-4 rounded-xl bg-stone-50/80 border border-stone-100 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 transition-all"
              />
              <button
                type="button"
                onClick={handleAddCatchphrase}
                className="h-10 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.97]"
                style={gradientBtn}
              >
                添加
              </button>
            </div>
            {catchphrases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {catchphrases.map((phrase, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1.5 rounded-2xl text-white font-medium flex items-center gap-1.5"
                    style={gradientBtn}
                  >
                    {phrase}
                    <button
                      type="button"
                      onClick={() => handleRemoveCatchphrase(index)}
                      className="hover:opacity-70 text-white/80 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {catchphrases.length === 0 && (
              <p className="text-xs text-stone-300 text-center py-3">还没有添加口头禅</p>
            )}
          </SectionCard>

          {/* 底部操作 */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 h-12 rounded-2xl text-sm font-medium bg-white border border-stone-100 text-stone-400 hover:bg-stone-50 transition-all active:scale-[0.98] shadow-sm"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-[0.98] shadow-md"
              style={gradientBtn}
            >
              {isSaving
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                : '保存设置 🌸'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
