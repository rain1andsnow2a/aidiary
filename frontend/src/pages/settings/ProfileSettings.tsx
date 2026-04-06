// 用户画像设置页面 - 温暖柔和心理日记风格
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { integrationService, type OpenClawIntegrationStatus } from '@/services/integration.service'
import { toast } from '@/components/ui/toast'
import { Briefcase, Smile, Laugh, Award, Handshake, Moon, Monitor, BookOpen, Rocket, Palette, TreePalm, Plane, Sparkles, Link2, Copy, RefreshCw, PlugZap, Shield, Trash2 } from 'lucide-react'

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const SOCIAL_STYLES = [
  { value: 'formal', labelKey: 'profileSettings.socialStyles.formal', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { value: 'casual', labelKey: 'profileSettings.socialStyles.casual', icon: <Smile className="w-3.5 h-3.5" /> },
  { value: 'humorous', labelKey: 'profileSettings.socialStyles.humorous', icon: <Laugh className="w-3.5 h-3.5" /> },
  { value: 'professional', labelKey: 'profileSettings.socialStyles.professional', icon: <Award className="w-3.5 h-3.5" /> },
  { value: 'friendly', labelKey: 'profileSettings.socialStyles.friendly', icon: <Handshake className="w-3.5 h-3.5" /> },
  { value: 'reserved', labelKey: 'profileSettings.socialStyles.reserved', icon: <Moon className="w-3.5 h-3.5" /> },
]

const CURRENT_STATES = [
  { value: 'work', labelKey: 'profileSettings.currentStates.work', icon: <Monitor className="w-3.5 h-3.5" /> },
  { value: 'study', labelKey: 'profileSettings.currentStates.study', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { value: 'startup', labelKey: 'profileSettings.currentStates.startup', icon: <Rocket className="w-3.5 h-3.5" /> },
  { value: 'freelance', labelKey: 'profileSettings.currentStates.freelance', icon: <Palette className="w-3.5 h-3.5" /> },
  { value: 'retired', labelKey: 'profileSettings.currentStates.retired', icon: <TreePalm className="w-3.5 h-3.5" /> },
  { value: 'gapYear', labelKey: 'profileSettings.currentStates.gapYear', icon: <Plane className="w-3.5 h-3.5" /> },
  { value: 'other', labelKey: 'profileSettings.currentStates.other', icon: <Sparkles className="w-3.5 h-3.5" /> },
]

const gradientBtn = { background: 'linear-gradient(135deg, #fb7185, #c084fc)' }
const warmBg = { background: 'linear-gradient(160deg, #fff8f5 0%, #fdf4ff 60%, #f5f3ff 100%)' }

export default function ProfileSettings() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const [username, setUsername] = useState(user?.username || '')
  const [mbti, setMbti] = useState(user?.mbti || '')
  const [socialStyle, setSocialStyle] = useState(user?.social_style || '')
  const [currentState, setCurrentState] = useState(user?.current_state || '')
  const [catchphrases, setCatchphrases] = useState<string[]>(user?.catchphrases || [])
  const [newCatchphrase, setNewCatchphrase] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const [openClawStatus, setOpenClawStatus] = useState<OpenClawIntegrationStatus | null>(null)
  const [plainToken, setPlainToken] = useState('')
  const [isTokenLoading, setIsTokenLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = username || user?.username || user?.email?.split('@')[0] || t('profileSettings.defaultUser')
  const avatarLetter = displayName.charAt(0).toUpperCase()

  // 从后端加载最新画像数据
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [profile, openClaw] = await Promise.all([
          authService.getProfile(),
          integrationService.getOpenClawStatus().catch(() => null),
        ])
        setUsername(profile.username || '')
        setMbti(profile.mbti || '')
        setSocialStyle(profile.social_style || '')
        setCurrentState(profile.current_state || '')
        setCatchphrases(profile.catchphrases || [])
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
        if (openClaw) setOpenClawStatus(openClaw)
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
      toast(t('profileSettings.avatarTooLarge'), 'error')
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
      toast(t('profileSettings.avatarSuccess'), 'success')
    } catch (err) {
      console.error('Avatar upload failed:', err)
      toast(t('profileSettings.avatarFailed'), 'error')
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
      toast(t('profileSettings.saveSuccess'), 'success')
      navigate('/')
    } catch (err: any) {
      console.error('Save failed:', err)
      toast(err.response?.data?.detail || t('profileSettings.saveFailed'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const copyText = async (text: string, successMessage: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', 'true')
        textarea.style.position = 'fixed'
        textarea.style.top = '-9999px'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!copied) {
          throw new Error('execCommand copy failed')
        }
      }
      toast(successMessage, 'success')
    } catch (err) {
      console.error('Copy failed:', err)
      toast(t('profileSettings.copyFailed'), 'error')
    }
  }

  const handleCreateOpenClawToken = async () => {
    setIsTokenLoading(true)
    try {
      const next = await integrationService.createOpenClawToken()
      setOpenClawStatus(next)
      setPlainToken(next.token)
      toast(t('profileSettings.tokenGenerated'), 'success')
    } catch (err) {
      console.error('Token generation failed:', err)
      toast(t('profileSettings.tokenGenerateFailed'), 'error')
    } finally {
      setIsTokenLoading(false)
    }
  }

  const handleRevokeOpenClawToken = async () => {
    setIsTokenLoading(true)
    try {
      await integrationService.revokeOpenClawToken()
      setPlainToken('')
      setOpenClawStatus((prev) => prev ? { ...prev, connected: false, token_hint: null, last_used_at: null } : prev)
      toast(t('profileSettings.accessRevoked'), 'success')
    } catch (err) {
      console.error('Revoke failed:', err)
      toast(t('profileSettings.revokeFailed'), 'error')
    } finally {
      setIsTokenLoading(false)
    }
  }

  const openClawSkillRepo = 'https://github.com/rain1andsnow2a/yinji-openclaw-skill'
  const openClawSkillRaw = 'https://raw.githubusercontent.com/rain1andsnow2a/yinji-openclaw-skill/main/skill.md'
  const openClawSnippet = openClawStatus ? [
    '你是映记的日记速记助手。优先执行以下流程：',
    '',
    '第 1 步（推荐）先下载并加载官方 skill：',
    `Skill 仓库：${openClawSkillRepo}`,
    `Skill 直链：${openClawSkillRaw}`,
    '',
    '第 2 步（回退）若平台暂不支持 skill 下载，则改用 HTTP 直连：',
    `POST ${openClawStatus.ingest_url}`,
    plainToken || openClawStatus.token_hint
      ? `Authorization: Bearer ${plainToken || '请填入你刚生成的令牌'}`
      : 'Authorization: Bearer {你的映记接入令牌}',
    'Content-Type: application/json',
    '',
    '{',
    '  "content": "用户刚刚说的内容",',
    '  "title": "可选标题",',
    '  "diary_date": "YYYY-MM-DD",',
    '  "emotion_tags": ["开心"],',
    '  "importance_score": 6,',
    '  "mode": "append_today"',
    '}',
    '',
    '如果用户明确说“单独存一篇/新开一篇”，把 mode 改为 create。',
  ].join('\n') : ''

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
              ← {t('common.back')}
            </button>
            <span className="text-sm font-semibold text-stone-600">{t('profileSettings.title')}</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 rounded-xl text-xs font-semibold text-white disabled:opacity-50 shadow-sm transition-all active:scale-[0.97]"
              style={gradientBtn}
            >
              {isSaving ? t('profileSettings.saving') : t('common.save')}
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
                      <img src={avatarPreview} alt={t('profileSettings.avatar')} className="w-full h-full object-cover" />
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
                  {t('profileSettings.changeAvatar')}
                </button>
              </div>
            </div>

            <SectionTitle title={t('profileSettings.basicInfo')} desc={t('profileSettings.basicInfoDesc')} />
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">{t('profileSettings.username')}</label>
                <input
                  type="text"
                  placeholder={t('profileSettings.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-stone-50/80 border border-stone-100 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-rose-200 focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">{t('profileSettings.emailLabel')} ({t('profileSettings.notModifiable')})</label>
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
            <SectionTitle title={t('profileSettings.mbti')} desc={t('profileSettings.mbtiDesc')} />
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
            <SectionTitle title={t('profileSettings.socialStyle')} desc={t('profileSettings.socialStyleDesc')} />
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
                  {style.icon}
                  {t(style.labelKey)}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 当前状态 */}
          <SectionCard>
            <SectionTitle title={t('profileSettings.currentState')} desc={t('profileSettings.currentStateDesc')} />
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
                  {state.icon}
                  {t(state.labelKey)}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* 口头禅 */}
          <SectionCard>
            <SectionTitle title={t('profileSettings.catchphrases')} desc={t('profileSettings.catchphrasesDesc')} />
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={t('profileSettings.catchphrasePlaceholder')}
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
                {t('profileSettings.add')}
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
              <p className="text-xs text-stone-300 text-center py-3">{t('profileSettings.noCatchphrases')}</p>
            )}
          </SectionCard>

          <SectionCard className="overflow-hidden">
            <div className="relative -mx-6 -mt-6 px-6 py-5 mb-5 border-b border-rose-100/60 bg-gradient-to-r from-[#fff9f3] via-[#fff7fb] to-[#f7f3ff]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 border border-rose-100 text-[11px] font-semibold text-rose-500 mb-3">
                    <PlugZap className="w-3.5 h-3.5" />
                    OpenClaw {t('profileSettings.quickNoteIntegration')}
                  </div>
                  <h3 className="text-base font-semibold text-stone-700">{t('profileSettings.openClawTitle')}</h3>
                  <p className="text-xs text-stone-400 mt-1 leading-6">
                    {t('profileSettings.openClawDesc1')}
                    {t('profileSettings.openClawDesc2')}
                  </p>
                </div>
                <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/80 border border-white shadow-sm items-center justify-center">
                  <Shield className="w-5 h-5 text-violet-400" />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <p className="text-[11px] text-stone-400 mb-1">{t('profileSettings.currentStatus')}</p>
                  <p className={`text-sm font-semibold ${openClawStatus?.connected ? 'text-emerald-500' : 'text-stone-500'}`}>
                    {openClawStatus?.connected ? t('profileSettings.connected') : t('profileSettings.notConnected')}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <p className="text-[11px] text-stone-400 mb-1">{t('profileSettings.tokenFingerprint')}</p>
                  <p className="text-sm font-semibold text-stone-600">{openClawStatus?.token_hint || '—'}</p>
                </div>
                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <p className="text-[11px] text-stone-400 mb-1">{t('profileSettings.validity')}</p>
                  <p className={`text-sm font-semibold ${openClawStatus?.expires_at && new Date(openClawStatus.expires_at) < new Date() ? 'text-rose-500' : 'text-stone-600'}`}>
                    {openClawStatus?.connected
                      ? (openClawStatus?.expires_at
                          ? (new Date(openClawStatus.expires_at) < new Date() ? new Date(openClawStatus.expires_at).toLocaleDateString('zh-CN') + ' (已过期)' : new Date(openClawStatus.expires_at).toLocaleDateString('zh-CN'))
                          : '永久有效')
                      : '—'}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
                  <p className="text-[11px] text-stone-400 mb-1">{t('profileSettings.lastWrite')}</p>
                  <p className="text-sm font-semibold text-stone-600">{openClawStatus?.last_used_at ? new Date(openClawStatus.last_used_at).toLocaleString('zh-CN') : '—'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleCreateOpenClawToken}
                  disabled={isTokenLoading}
                  className="h-10 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 inline-flex items-center gap-2"
                  style={gradientBtn}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTokenLoading ? 'animate-spin' : ''}`} />
                  {openClawStatus?.connected ? t('profileSettings.resetToken') : t('profileSettings.generateToken')}
                </button>

                {plainToken && (
                  <button
                    type="button"
                    onClick={() => copyText(plainToken, t('profileSettings.tokenCopied'))}
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 transition-all inline-flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {t('profileSettings.copyToken')}
                  </button>
                )}

                {openClawStatus?.ingest_url && (
                  <button
                    type="button"
                    onClick={() => copyText(openClawStatus.ingest_url, t('profileSettings.ingressUrlCopied'))}
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-all inline-flex items-center gap-2"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    {t('profileSettings.copyIngressUrl')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => copyText(openClawSkillRepo, t('profileSettings.skillRepoCopied'))}
                  className="h-10 px-4 rounded-xl text-xs font-semibold border border-violet-200 bg-white text-violet-600 hover:bg-violet-50 transition-all inline-flex items-center gap-2"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {t('profileSettings.copySkillUrl')}
                </button>

                {openClawStatus?.connected && (
                  <button
                    type="button"
                    onClick={handleRevokeOpenClawToken}
                    disabled={isTokenLoading}
                    className="h-10 px-4 rounded-xl text-xs font-semibold border border-rose-100 bg-white text-rose-400 hover:bg-rose-50 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('profileSettings.closeAccess')}
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/70 to-rose-50/70 px-4 py-3">
                <p className="text-xs font-medium text-stone-600">
                  {t('profileSettings.tokenSecurityNotice')}
                </p>
              </div>

              {plainToken && (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                  <p className="text-xs font-medium text-violet-500 mb-2">{t('profileSettings.newTokenLabel')}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl bg-white px-3 py-2 text-[12px] text-stone-700 break-all border border-violet-100">{plainToken}</code>
                    <button
                      type="button"
                      onClick={() => copyText(plainToken, '令牌已复制')}
                      className="h-10 px-3 rounded-xl bg-white border border-violet-100 text-violet-500 hover:bg-violet-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-stone-100 bg-[#fffdfb] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-700">{t('profileSettings.skillPromptTitle')}</p>
                    <p className="text-xs text-stone-400 mt-1">{t('profileSettings.skillPromptDesc')}</p>
                  </div>
                  {openClawSnippet && (
                    <button
                      type="button"
                      onClick={() => copyText(openClawSnippet, t('profileSettings.skillPromptCopied'))}
                      className="text-xs px-3 py-1.5 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {t('common.copy')}
                    </button>
                  )}
                </div>
                <pre className="whitespace-pre-wrap rounded-2xl bg-stone-950/[0.03] border border-stone-100 px-4 py-3 text-[12px] leading-6 text-stone-600 overflow-x-auto">
{openClawSnippet || t('profileSettings.noTokenHint')}
                </pre>
              </div>
            </div>
          </SectionCard>

          {/* 底部操作 */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 h-12 rounded-2xl text-sm font-medium bg-white border border-stone-100 text-stone-400 hover:bg-stone-50 transition-all active:scale-[0.98] shadow-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-all active:scale-[0.98] shadow-md"
              style={gradientBtn}
            >
              {isSaving
                ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
                : t('profileSettings.saveSettings')}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
