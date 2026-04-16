import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EyeOff, ShieldCheck, UserCog, Users, FileWarning, Search } from 'lucide-react'

import { useAuthStore } from '@/store/authStore'
import { adminService } from '@/services/admin.service'
import { toast } from '@/components/ui/toast'
import type {
  AdminDashboardResponse,
  AdminPostResponse,
  AdminUserResponse,
  CounselorApplicationResponse,
} from '@/types/auth'

const roleLabels: Record<string, string> = {
  student: '学生',
  counselor: '辅导员',
  psychologist: '心理老师',
  admin: '管理员',
}

const statusLabels: Record<string, { text: string; color: string }> = {
  pending: { text: '待审核', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { text: '已通过', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { text: '已拒绝', color: 'bg-rose-100 text-rose-700 border-rose-200' },
}

type TabKey = 'dashboard' | 'applications' | 'users' | 'posts'

type UserDraftMap = Record<
  number,
  {
    role: string
    department: string
    class_name: string
    is_active: boolean
    is_verified: boolean
  }
>

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState<TabKey>('dashboard')
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [applications, setApplications] = useState<CounselorApplicationResponse[]>([])
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [posts, setPosts] = useState<AdminPostResponse[]>([])
  const [userDrafts, setUserDrafts] = useState<UserDraftMap>({})
  const [savingUserId, setSavingUserId] = useState<number | null>(null)
  const [savingPostId, setSavingPostId] = useState<number | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    if (tab === 'dashboard') void loadDashboard()
    if (tab === 'applications') void loadApplications()
    if (tab === 'users') void loadUsers()
    if (tab === 'posts') void loadPosts()
  }, [tab])

  async function loadDashboard() {
    setLoading(true)
    try {
      setDashboard(await adminService.getDashboard())
    } catch (error) {
      console.error(error)
      toast('系统看板加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadApplications() {
    setLoading(true)
    try {
      const data = await adminService.listApplications({ page_size: 100 })
      setApplications(data.items)
    } catch (error) {
      console.error(error)
      toast('认证申请加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await adminService.listUsers({ page_size: 100 })
      setUsers(data.items)
      const nextDrafts: UserDraftMap = {}
      data.items.forEach((item) => {
        nextDrafts[item.id] = {
          role: item.role,
          department: item.department || '',
          class_name: item.class_name || '',
          is_active: item.is_active,
          is_verified: item.is_verified,
        }
      })
      setUserDrafts(nextDrafts)
    } catch (error) {
      console.error(error)
      toast('用户列表加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadPosts() {
    setLoading(true)
    try {
      const data = await adminService.listPosts({ page_size: 100 })
      setPosts(data.items)
    } catch (error) {
      console.error(error)
      toast('帖子列表加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleReview(id: number, action: 'approve' | 'reject') {
    try {
      await adminService.reviewApplication(id, { action })
      toast(action === 'approve' ? '认证申请已通过' : '认证申请已拒绝', 'success')
      await Promise.all([loadApplications(), loadDashboard(), loadUsers()])
    } catch (error) {
      console.error(error)
      toast('审核操作失败', 'error')
    }
  }

  async function handleSaveUser(userId: number) {
    const draft = userDrafts[userId]
    if (!draft) return
    setSavingUserId(userId)
    try {
      await adminService.updateUser(userId, draft)
      toast('用户信息已更新', 'success')
      await Promise.all([loadUsers(), loadDashboard()])
    } catch (error) {
      console.error(error)
      toast('用户更新失败', 'error')
    } finally {
      setSavingUserId(null)
    }
  }

  async function handleDisableUser(userId: number) {
    const confirmed = window.confirm('确认禁用该用户吗？禁用后将无法继续登录。')
    if (!confirmed) return
    setSavingUserId(userId)
    try {
      await adminService.disableUser(userId)
      toast('用户已禁用', 'success')
      await Promise.all([loadUsers(), loadDashboard()])
    } catch (error) {
      console.error(error)
      toast('禁用用户失败', 'error')
    } finally {
      setSavingUserId(null)
    }
  }

  async function handleTogglePost(post: AdminPostResponse) {
    setSavingPostId(post.id)
    try {
      await adminService.updatePost(post.id, { is_hidden: !post.is_hidden })
      toast(post.is_hidden ? '帖子已恢复显示' : '帖子已隐藏', 'success')
      await Promise.all([loadPosts(), loadDashboard()])
    } catch (error) {
      console.error(error)
      toast('帖子状态更新失败', 'error')
    } finally {
      setSavingPostId(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  const tabs = [
    { key: 'dashboard' as const, label: '系统看板' },
    { key: 'applications' as const, label: '认证审核' },
    { key: 'users' as const, label: '用户管理' },
    { key: 'posts' as const, label: '帖子管理' },
  ]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f5_0%,#f6f1ec_100%)]">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 backdrop-blur-xl bg-[rgba(255,251,247,0.9)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-stone-400">Yinji Admin</p>
            <h1 className="text-2xl font-semibold text-stone-800 mt-1">映记管理后台</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="h-10 px-4 rounded-2xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-100 transition-all"
          >
            返回前台
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="rounded-[28px] border border-[#eadfd6] bg-white/80 p-3 shadow-[0_16px_48px_rgba(121,88,62,0.08)] backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`rounded-[22px] px-4 py-3 text-sm font-medium transition-all ${
                  tab === item.key
                    ? 'bg-[linear-gradient(135deg,#dc8f7f,#9f95b7)] text-white shadow-[0_12px_32px_rgba(135,102,133,0.22)]'
                    : 'text-stone-500 hover:bg-stone-100/80'
                }`}
              >
                {item.label}
                {item.key === 'applications' && dashboard && dashboard.pending_applications > 0 && (
                  <span className="ml-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px]">
                    {dashboard.pending_applications}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 rounded-full border-4 border-stone-200 border-t-[#b47669] animate-spin" />
          </div>
        ) : null}

        {!loading && tab === 'dashboard' && dashboard ? <DashboardView data={dashboard} /> : null}
        {!loading && tab === 'applications' ? (
          <ApplicationsView items={applications} onReview={handleReview} />
        ) : null}
        {!loading && tab === 'users' ? (
          <UsersView
            items={users}
            drafts={userDrafts}
            savingUserId={savingUserId}
            onDraftChange={(userId, patch) => {
              setUserDrafts((prev) => ({
                ...prev,
                [userId]: { ...prev[userId], ...patch },
              }))
            }}
            onSave={handleSaveUser}
            onDisable={handleDisableUser}
          />
        ) : null}
        {!loading && tab === 'posts' ? (
          <PostsView
            items={posts}
            savingPostId={savingPostId}
            onToggle={handleTogglePost}
          />
        ) : null}
      </main>
    </div>
  )
}

function DashboardView({ data }: { data: AdminDashboardResponse }) {
  const cards = [
    { icon: <Users className="w-4 h-4" />, label: '总用户', value: data.total_users, sub: `活跃 ${data.active_users}` },
    { icon: <ShieldCheck className="w-4 h-4" />, label: '辅导员', value: data.counselor_count, sub: '已审核通过' },
    { icon: <ShieldCheck className="w-4 h-4" />, label: '心理老师', value: data.psychologist_count, sub: '已审核通过' },
    { icon: <UserCog className="w-4 h-4" />, label: '总日记', value: data.total_diaries, sub: '平台沉淀记录' },
    { icon: <FileWarning className="w-4 h-4" />, label: '总帖子', value: data.total_posts, sub: `匿名 ${data.anonymous_posts}` },
    { icon: <ShieldCheck className="w-4 h-4" />, label: '待审核', value: data.pending_applications, sub: '需要管理员处理' },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[26px] border border-[#eadfd6] bg-white/85 p-5 shadow-[0_12px_36px_rgba(118,89,79,0.08)]"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-2xl bg-[#f7efe9] text-[#b56f61] flex items-center justify-center">
              {card.icon}
            </div>
            <span className="text-xs text-stone-400">{card.sub}</span>
          </div>
          <div className="mt-6">
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="text-3xl font-semibold text-stone-800 mt-2">{card.value}</p>
          </div>
        </article>
      ))}
    </section>
  )
}

function ApplicationsView({
  items,
  onReview,
}: {
  items: CounselorApplicationResponse[]
  onReview: (id: number, action: 'approve' | 'reject') => void
}) {
  if (!items.length) {
    return <EmptyState title="暂无认证申请" desc="后续提交的辅导员/心理老师申请会汇总到这里。" />
  }

  return (
    <section className="space-y-4">
      {items.map((app) => {
        const status = statusLabels[app.status] || { text: app.status, color: 'bg-stone-100 text-stone-700 border-stone-200' }
        return (
          <article
            key={app.id}
            className="rounded-[28px] border border-[#eadfd6] bg-white/88 p-6 shadow-[0_16px_48px_rgba(118,89,79,0.08)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-stone-800">{app.real_name}</h3>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs ${status.color}`}>
                    {status.text}
                  </span>
                  <span className="text-xs text-[#9d7f72] bg-[#f7efe9] rounded-full px-3 py-1">
                    申请角色：{app.target_role === 'counselor' ? '辅导员' : '心理老师'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-stone-500">
                  <p>账号：{app.user_email || `用户 #${app.user_id}`}</p>
                  <p>姓名：{app.user_username || '未填写用户名'}</p>
                  <p>所属单位：{app.department}</p>
                  <p>工号：{app.employee_id || '未填写'}</p>
                  <p>电话：{app.phone || '未填写'}</p>
                  <p>提交时间：{new Date(app.created_at).toLocaleString()}</p>
                </div>
                {app.introduction ? (
                  <div className="rounded-2xl bg-[#faf5f0] border border-[#efe3da] px-4 py-3 text-sm text-stone-600 leading-7">
                    {app.introduction}
                  </div>
                ) : null}
                {app.review_comment ? (
                  <p className="text-sm text-stone-400">审核意见：{app.review_comment}</p>
                ) : null}
              </div>

              {app.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onReview(app.id, 'approve')}
                    className="h-10 px-4 rounded-2xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
                  >
                    通过
                  </button>
                  <button
                    onClick={() => onReview(app.id, 'reject')}
                    className="h-10 px-4 rounded-2xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-all"
                  >
                    拒绝
                  </button>
                </div>
              ) : null}
            </div>
          </article>
        )
      })}
    </section>
  )
}

function UsersView({
  items,
  drafts,
  savingUserId,
  onDraftChange,
  onSave,
  onDisable,
}: {
  items: AdminUserResponse[]
  drafts: UserDraftMap
  savingUserId: number | null
  onDraftChange: (userId: number, patch: Partial<UserDraftMap[number]>) => void
  onSave: (userId: number) => void
  onDisable: (userId: number) => void
}) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.trim().toLowerCase()
      if (keyword) {
        const haystack = `${item.email} ${item.username || ''} ${item.department || ''} ${item.class_name || ''}`.toLowerCase()
        if (!haystack.includes(keyword)) return false
      }
      if (roleFilter && item.role !== roleFilter) return false
      return true
    })
  }, [items, roleFilter, search])

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-[#eadfd6] bg-white/85 p-4 shadow-[0_12px_36px_rgba(118,89,79,0.08)]">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索邮箱、用户名、院系或班级"
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none focus:border-[#d7b7ab]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-11 px-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none"
          >
            <option value="">全部角色</option>
            <option value="student">学生</option>
            <option value="counselor">辅导员</option>
            <option value="psychologist">心理老师</option>
            <option value="admin">管理员</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => {
          const draft = drafts[item.id]
          return (
            <article
              key={item.id}
              className="rounded-[28px] border border-[#eadfd6] bg-white/88 p-5 shadow-[0_16px_48px_rgba(118,89,79,0.08)]"
            >
              <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-stone-800">{item.username || '未命名用户'}</h3>
                    <span className="px-3 py-1 rounded-full text-xs bg-[#f7efe9] text-[#9d7f72]">
                      {roleLabels[item.role] || item.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {item.is_active ? '正常' : '已禁用'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs ${item.is_verified ? 'bg-sky-100 text-sky-700' : 'bg-stone-100 text-stone-500'}`}>
                      {item.is_verified ? '已验证' : '未验证'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-400 mt-2">{item.email}</p>
                  <p className="text-xs text-stone-400 mt-2">
                    绑定范围：{item.bindings.length ? item.bindings.map((binding) => binding.scope_name).join('、') : '无'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 xl:min-w-[720px]">
                  <select
                    value={draft?.role || item.role}
                    onChange={(e) => onDraftChange(item.id, { role: e.target.value })}
                    className="h-11 px-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none"
                  >
                    <option value="student">学生</option>
                    <option value="counselor">辅导员</option>
                    <option value="psychologist">心理老师</option>
                    <option value="admin">管理员</option>
                  </select>

                  <input
                    value={draft?.department || ''}
                    onChange={(e) => onDraftChange(item.id, { department: e.target.value })}
                    placeholder="所属院系"
                    className="h-11 px-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none focus:border-[#d7b7ab]"
                  />

                  <input
                    value={draft?.class_name || ''}
                    onChange={(e) => onDraftChange(item.id, { class_name: e.target.value })}
                    placeholder="所属班级"
                    className="h-11 px-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none focus:border-[#d7b7ab]"
                  />

                  <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#fcfaf8] px-4">
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      <input
                        type="checkbox"
                        checked={draft?.is_verified ?? item.is_verified}
                        onChange={(e) => onDraftChange(item.id, { is_verified: e.target.checked })}
                      />
                      已验证
                    </label>
                    <label className="flex items-center gap-2 text-sm text-stone-600">
                      <input
                        type="checkbox"
                        checked={draft?.is_active ?? item.is_active}
                        onChange={(e) => onDraftChange(item.id, { is_active: e.target.checked })}
                      />
                      激活
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSave(item.id)}
                      disabled={savingUserId === item.id}
                      className="flex-1 h-11 rounded-2xl bg-[linear-gradient(135deg,#de8f80,#9d95b7)] text-white text-sm font-medium disabled:opacity-50"
                    >
                      {savingUserId === item.id ? '保存中...' : '保存'}
                    </button>
                    {item.role !== 'admin' ? (
                      <button
                        onClick={() => onDisable(item.id)}
                        disabled={savingUserId === item.id}
                        className="h-11 px-4 rounded-2xl border border-rose-200 text-rose-500 text-sm font-medium hover:bg-rose-50 disabled:opacity-50"
                      >
                        禁用
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          )
        })}

        {!filtered.length ? <EmptyState title="暂无匹配用户" desc="可以尝试更换关键词或筛选条件。" /> : null}
      </div>
    </section>
  )
}

function PostsView({
  items,
  savingPostId,
  onToggle,
}: {
  items: AdminPostResponse[]
  savingPostId: number | null
  onToggle: (post: AdminPostResponse) => void
}) {
  const [search, setSearch] = useState('')
  const [anonymousOnly, setAnonymousOnly] = useState(false)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (anonymousOnly && !item.is_anonymous) return false
      if (!search.trim()) return true
      const haystack = `${item.content} ${item.author_email || ''} ${item.author_username || ''}`.toLowerCase()
      return haystack.includes(search.trim().toLowerCase())
    })
  }, [anonymousOnly, items, search])

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-[#eadfd6] bg-white/85 p-4 shadow-[0_12px_36px_rgba(118,89,79,0.08)] flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索帖子正文或作者信息"
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-700 outline-none focus:border-[#d7b7ab]"
          />
        </div>
        <label className="h-11 px-4 rounded-2xl border border-stone-200 bg-[#fcfaf8] text-sm text-stone-600 inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={anonymousOnly}
            onChange={(e) => setAnonymousOnly(e.target.checked)}
          />
          仅看匿名帖子
        </label>
      </div>

      <div className="space-y-4">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="rounded-[28px] border border-[#eadfd6] bg-white/88 p-5 shadow-[0_16px_48px_rgba(118,89,79,0.08)]"
          >
            <div className="flex flex-col xl:flex-row gap-5 xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-[#f7efe9] text-[#9d7f72]">
                    圈子 #{item.circle_id}
                  </span>
                  {item.is_anonymous ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-[#f2eefc] text-[#7f69b6]">
                      匿名发布
                    </span>
                  ) : null}
                  {item.is_hidden ? (
                    <span className="px-3 py-1 rounded-full text-xs bg-rose-100 text-rose-700">
                      已隐藏
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                      正常展示
                    </span>
                  )}
                </div>

                <p className="text-sm leading-7 text-stone-700 whitespace-pre-wrap">{item.content}</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-400">
                  <p>真实作者：{item.author_username || '未设置用户名'} / {item.author_email || '未知'}</p>
                  <p>角色：{roleLabels[item.author_role || 'student'] || item.author_role || '学生'}</p>
                  <p>互动：{item.likes_count} 赞 · {item.comments_count} 评论</p>
                  <p>发布时间：{new Date(item.created_at).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => onToggle(item)}
                disabled={savingPostId === item.id}
                className={`h-11 px-5 rounded-2xl text-sm font-medium transition-all ${
                  item.is_hidden
                    ? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    : 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                } disabled:opacity-50`}
              >
                {savingPostId === item.id ? (
                  '处理中...'
                ) : item.is_hidden ? (
                  '恢复显示'
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    隐藏帖子
                  </span>
                )}
              </button>
            </div>
          </article>
        ))}

        {!filtered.length ? <EmptyState title="暂无匹配帖子" desc="可以试试关闭匿名筛选，或换个搜索词。" /> : null}
      </div>
    </section>
  )
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#e5d9d0] bg-white/70 px-6 py-16 text-center">
      <p className="text-lg font-medium text-stone-700">{title}</p>
      <p className="text-sm text-stone-400 mt-2">{desc}</p>
    </div>
  )
}
