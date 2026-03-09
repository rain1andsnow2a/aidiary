// 仪表盘/首页 - 增强版（包含数据图表）
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDiaryStore } from '@/store/diaryStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/common/Loading'
import EmotionChart from '@/components/common/EmotionChart'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { diaries, fetchDiaries, fetchEmotionStats, emotionStats, isLoading } = useDiaryStore()
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    topEmotion: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchDiaries({ page: 1, pageSize: 5 }),
      fetchEmotionStats(30),
    ])
  }

  useEffect(() => {
    if (diaries.length > 0) {
      // 计算统计数据
      const now = new Date()
      const thisMonth = diaries.filter((d) => {
        const date = new Date(d.diary_date)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      }).length

      // 统计最常使用的情绪标签
      const emotionCounts: Record<string, number> = {}
      diaries.forEach((d) => {
        d.emotion_tags.forEach((tag) => {
          emotionCounts[tag] = (emotionCounts[tag] || 0) + 1
        })
      })

      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无'

      setStats({
        total: diaries.length,
        thisMonth,
        topEmotion,
      })
    }
  }, [diaries])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (isLoading && diaries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">印记</h1>
              <span className="text-sm text-muted-foreground">智能日记应用</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user?.username || user?.email?.split('@')[0]}
              </span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                设置
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                登出
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎卡片 */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
          <CardHeader>
            <CardTitle className="text-2xl">
              欢迎回来，{user?.username || user?.email?.split('@')[0]}！
            </CardTitle>
            <CardDescription className="text-white/90">
              今天想记录些什么呢？
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => navigate('/diaries/new')}
              className="bg-white text-primary hover:bg-white/90"
            >
              写日记
            </Button>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>总日记数</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>本月日记</CardDescription>
              <CardTitle className="text-3xl">{stats.thisMonth}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>主要情绪</CardDescription>
              <CardTitle className="text-3xl">{stats.topEmotion || '暂无'}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* 情绪统计图表 */}
        {emotionStats.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>📊 情绪统计（近30天）</CardTitle>
              <CardDescription>你的情绪分布情况</CardDescription>
            </CardHeader>
            <CardContent>
              <EmotionChart data={emotionStats} type="bar" />
            </CardContent>
          </Card>
        )}

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/diaries/new')}
          >
            <CardHeader>
              <CardTitle>✍️ 写日记</CardTitle>
              <CardDescription>记录今天的想法和感受</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/diaries')}
          >
            <CardHeader>
              <CardTitle>📖 查看日记</CardTitle>
              <CardDescription>浏览你过去的所有记录</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/timeline')}
          >
            <CardHeader>
              <CardTitle>📅 时间轴</CardTitle>
              <CardDescription>按时间查看你的历程</CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (diaries.length > 0) {
                navigate(`/analysis/${diaries[0].id}`)
              } else {
                alert('请先创建日记')
              }
            }}
          >
            <CardHeader>
              <CardTitle>🤖 AI分析</CardTitle>
              <CardDescription>深度心理分析</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 最近日记 */}
        {diaries.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>最近的日记</CardTitle>
                  <CardDescription>你最近的记录</CardDescription>
                </div>
                <Button variant="outline" onClick={() => navigate('/diaries')}>
                  查看全部
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diaries.slice(0, 3).map((diary) => (
                  <div
                    key={diary.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate(`/diaries/${diary.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{diary.title}</h3>
                      <span className="text-sm text-muted-foreground">{diary.diary_date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {diary.content}
                    </p>
                    {diary.emotion_tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {diary.emotion_tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-muted-foreground">
                        重要性: {diary.importance_score}/10
                      </span>
                      {diary.is_analyzed && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          已分析
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
