import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookHeart,
  CircleAlert,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { counselorService } from '@/services/admin.service'
import { toast } from '@/components/ui/toast'
import { useAuthStore } from '@/store/authStore'
import type { CounselorDashboardResponse } from '@/types/auth'

const emotionPalette: Record<string, string> = {
  开心: '#E5A84B',
  平静: '#6FB39A',
  成就感: '#7BAE73',
  焦虑: '#7A88B4',
  担忧: '#A27F9A',
  疲惫: '#91A1B2',
  失落: '#A7857D',
  困惑: '#B39274',
  满足: '#D29363',
}

const riskStyle: Record<string, string> = {
  较高: 'bg-rose-100 text-rose-700 border-rose-200',
  中等: 'bg-amber-100 text-amber-700 border-amber-200',
  平稳: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function CounselorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [windowDays, setWindowDays] = useState(14)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CounselorDashboardResponse | null>(null)

  useEffect(() => {
    void fetchDashboard(windowDays)
  }, [windowDays])

  async function fetchDashboard(days: number) {
    setLoading(true)
    try {
      const response = await counselorService.getDashboard(days)
      setData(response)
    } catch (error) {
      console.error(error)
      toast('辅导员看板加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f4ef_0%,#f2f0f8_55%,#f7f4f0_100%)]">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 backdrop-blur-xl bg-[rgba(251,248,244,0.88)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="h-10 px-4 rounded-2xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-100 transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>
            <div>
              <p className="text-xs tracking-[0.28em] uppercase text-stone-400">Counselor Desk</p>
              <h1 className="text-2xl font-semibold text-stone-800 mt-1">辅导员 / 心理老师工作台</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setWindowDays(days)}
                className={`h-10 px-4 rounded-2xl text-sm font-medium transition-all ${
                  windowDays === days
                    ? 'bg-[linear-gradient(135deg,#da8d7a,#9591b7)] text-white shadow-[0_12px_30px_rgba(135,102,133,0.22)]'
                    : 'border border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}
              >
                近 {days} 天
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="relative overflow-hidden rounded-[34px] border border-[#eadfd8] bg-[linear-gradient(135deg,rgba(255,251,247,0.92),rgba(246,242,251,0.92))] p-8 shadow-[0_20px_55px_rgba(116,86,82,0.1)]">
          <div className="absolute right-0 top-0 h-full w-[38%] bg-[radial-gradient(circle_at_top_right,rgba(234,194,168,0.48),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(170,159,205,0.36),transparent_55%)]" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd8] bg-white/70 px-3 py-1 text-xs text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b46d5b]" />
              当前身份：{user?.role === 'psychologist' ? '心理老师' : user?.role === 'admin' ? '管理员视角' : '辅导员'}
            </div>
            <h2 className="text-[30px] leading-tight font-semibold text-stone-800 mt-4">
              先看范围内学生的整体情绪状态，再决定是否需要进一步干预。
            </h2>
            <p className="text-sm leading-7 text-stone-500 mt-4 max-w-2xl">
              这里展示的是脱敏后的趋势、频次和重点关注线索，不包含学生原始日记正文。你可以先做整体判断，再进入对应功能页进行后续支持。
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {(data?.bindings || []).length ? (
                data?.bindings.map((binding) => (
                  <span
                    key={binding.id}
                    className="rounded-full border border-[#eadfd8] bg-white/70 px-3 py-1.5 text-xs text-[#9e786b]"
                  >
                    {binding.scope_type === 'department' ? '院系' : '班级'} · {binding.scope_name}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-[#eadfd8] bg-white/60 px-3 py-1.5 text-xs text-stone-400">
                  暂未配置绑定范围
                </span>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 rounded-full border-4 border-stone-200 border-t-[#b47669] animate-spin" />
          </div>
        ) : null}

        {!loading && data ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {data.metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-[28px] border border-[#eadfd8] bg-white/85 p-5 shadow-[0_14px_40px_rgba(116,86,82,0.08)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-[#f7efe9] text-[#b46d5b] flex items-center justify-center">
                      {metric.label.includes('绑定') ? (
                        <Users className="w-4 h-4" />
                      ) : metric.label.includes('重点') ? (
                        <CircleAlert className="w-4 h-4" />
                      ) : (
                        <BookHeart className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs text-stone-400">{metric.detail}</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-6">{metric.label}</p>
                  <p className="text-3xl font-semibold text-stone-800 mt-1">{metric.value}</p>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
              <article className="rounded-[30px] border border-[#eadfd8] bg-white/88 p-6 shadow-[0_16px_48px_rgba(116,86,82,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-stone-400">Trend</p>
                    <h3 className="text-lg font-semibold text-stone-800 mt-1">近 {windowDays} 天活跃趋势</h3>
                  </div>
                  <p className="text-xs text-stone-400">按日记数量与活跃学生数聚合</p>
                </div>

                <div className="h-[320px] mt-5 rounded-[24px] border border-stone-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,240,250,0.62))] px-3 pt-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend}>
                      <defs>
                        <linearGradient id="counselorDiaryArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d88979" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#d88979" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="counselorStudentArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8f90c5" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#8f90c5" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ece5de" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#9a8d82', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(5)}
                      />
                      <YAxis tick={{ fill: '#9a8d82', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '18px',
                          border: '1px solid #eadfd8',
                          background: 'rgba(255,251,247,0.96)',
                          boxShadow: '0 14px 30px rgba(110, 81, 69, 0.14)',
                        }}
                        formatter={(value: number, name: string) => [
                          value,
                          name === 'diary_count' ? '日记数' : name === 'active_students' ? '活跃学生' : '平均重要性',
                        ]}
                        labelFormatter={(label) => `日期：${label}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="diary_count"
                        stroke="#cf7f70"
                        strokeWidth={3}
                        fill="url(#counselorDiaryArea)"
                      />
                      <Area
                        type="monotone"
                        dataKey="active_students"
                        stroke="#8e8dc1"
                        strokeWidth={3}
                        fill="url(#counselorStudentArea)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-[30px] border border-[#eadfd8] bg-white/88 p-6 shadow-[0_16px_48px_rgba(116,86,82,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-stone-400">Emotion</p>
                    <h3 className="text-lg font-semibold text-stone-800 mt-1">情绪分布</h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#b46d5b]" />
                </div>

                <div className="mt-6 space-y-3">
                  {data.emotion_distribution.length ? (
                    data.emotion_distribution.map((item) => (
                      <div key={item.emotion} className="rounded-[22px] border border-stone-200/70 bg-[#fcfaf8] px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-stone-700">{item.emotion}</span>
                          <span className="text-stone-400">{item.count} 次</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(item.ratio * 100, 4)}%`,
                              background: emotionPalette[item.emotion] || '#b18d83',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#eadfd8] bg-[#fcfaf8] px-4 py-10 text-center text-sm text-stone-400">
                      近期暂无足够的情绪标签数据
                    </div>
                  )}
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
              <article className="rounded-[30px] border border-[#eadfd8] bg-white/88 p-6 shadow-[0_16px_48px_rgba(116,86,82,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-stone-400">Focus</p>
                    <h3 className="text-lg font-semibold text-stone-800 mt-1">重点关注学生</h3>
                  </div>
                  <p className="text-xs text-stone-400">仅展示脱敏线索，不展示原始日记内容</p>
                </div>

                <div className="mt-5 space-y-3">
                  {data.focus_students.length ? (
                    data.focus_students.map((student) => (
                      <div
                        key={`${student.masked_name}-${student.class_name}-${student.last_diary_date}`}
                        className="rounded-[24px] border border-stone-200/70 bg-[linear-gradient(145deg,#fffdfa,#faf6f2)] px-5 py-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-semibold text-stone-800">{student.masked_name}</h4>
                              <span className={`rounded-full border px-3 py-1 text-xs ${riskStyle[student.risk_level] || riskStyle['平稳']}`}>
                                {student.risk_level}
                              </span>
                            </div>
                            <p className="text-xs text-stone-400 mt-1">
                              {(student.department || '未标注院系')} / {(student.class_name || '未标注班级')}
                            </p>
                          </div>
                          <div className="text-xs text-stone-400">
                            最近记录：{student.last_diary_date || '暂无'}
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-2xl bg-[#f7efe9] px-3 py-2">
                            <p className="text-[11px] text-stone-400">记录篇数</p>
                            <p className="text-lg font-semibold text-[#a55d4d] mt-1">{student.diary_count}</p>
                          </div>
                          <div className="rounded-2xl bg-[#f3eef9] px-3 py-2">
                            <p className="text-[11px] text-stone-400">主情绪</p>
                            <p className="text-lg font-semibold text-[#7d71a7] mt-1">{student.dominant_emotion}</p>
                          </div>
                          <div className="rounded-2xl bg-[#f2f5f8] px-3 py-2">
                            <p className="text-[11px] text-stone-400">观察建议</p>
                            <p className="text-sm text-stone-600 mt-1">{student.note}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#eadfd8] bg-[#fcfaf8] px-4 py-12 text-center text-sm text-stone-400">
                      当前范围内没有需要额外关注的学生
                    </div>
                  )}
                </div>
              </article>

              <article className="rounded-[30px] border border-[#eadfd8] bg-white/88 p-6 shadow-[0_16px_48px_rgba(116,86,82,0.08)]">
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-[#b46d5b]" />
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-stone-400">Digest</p>
                    <h3 className="text-lg font-semibold text-stone-800 mt-1">周报发送记录</h3>
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-[#eadfd8] bg-[linear-gradient(160deg,#fffaf6,#f7f2fb)] px-5 py-4">
                  {data.weekly_digest ? (
                    <>
                      <p className="text-sm text-stone-500">最近一次周报已发送</p>
                      <p className="text-lg font-semibold text-stone-800 mt-2">
                        周起始：{data.weekly_digest.week_start || '未知'}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        发送时间：{data.weekly_digest.sent_at ? new Date(data.weekly_digest.sent_at).toLocaleString() : '未知'}
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        <p>覆盖学生数：{data.weekly_digest.summary?.student_count ?? 0}</p>
                        <p>活跃学生数：{data.weekly_digest.summary?.active_student_count ?? 0}</p>
                        <p>周内日记数：{data.weekly_digest.summary?.diary_count ?? 0}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-stone-500">暂无历史周报记录</p>
                      <p className="text-sm leading-7 text-stone-400 mt-3">
                        系统会在配置的每周推送日自动向辅导员 / 心理老师发送绑定范围内学生的脱敏摘要邮件。
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4 rounded-[24px] border border-stone-200/70 bg-[#fcfaf8] px-4 py-4">
                  <p className="text-sm font-medium text-stone-700">这页能看到什么？</p>
                  <ul className="mt-3 space-y-2 text-sm text-stone-500 leading-7">
                    <li>1. 绑定范围内学生的活跃趋势和情绪分布</li>
                    <li>2. 脱敏后的重点关注名单</li>
                    <li>3. 最近一次周报发送情况</li>
                    <li>4. 不包含原始日记正文，避免越权查看</li>
                  </ul>
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction
                title="维护绑定范围"
                desc="如果你负责的班级或院系变更了，可以回到认证申请页重新核对自己的负责范围。"
                actionLabel="查看认证信息"
                onClick={() => navigate('/counselor/apply')}
              />
              <QuickAction
                title="查看成长中心"
                desc="继续查看学生群体之外的个人趋势与成长地图，辅助你理解平台的分析展示方式。"
                actionLabel="打开成长中心"
                onClick={() => navigate('/growth')}
              />
              <QuickAction
                title="回到社区"
                desc="如果你也在社区里做支持互动，可以直接回到情绪共鸣圈继续浏览和回应。"
                actionLabel="打开社区"
                onClick={() => navigate('/community')}
              />
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

function QuickAction({
  title,
  desc,
  actionLabel,
  onClick,
}: {
  title: string
  desc: string
  actionLabel: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-[28px] border border-[#eadfd8] bg-white/86 p-5 text-left shadow-[0_14px_40px_rgba(116,86,82,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(116,86,82,0.12)]"
    >
      <p className="text-base font-semibold text-stone-800">{title}</p>
      <p className="text-sm text-stone-500 leading-7 mt-3">{desc}</p>
      <div className="mt-5 text-sm font-medium text-[#b46d5b] group-hover:text-[#9d5f50]">
        {actionLabel} →
      </div>
    </button>
  )
}
