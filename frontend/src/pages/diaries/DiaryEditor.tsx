// 日记编辑器页面
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDiaryStore } from '@/store/diaryStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/common/Loading'

const PRESET_EMOTIONS = [
  '开心',
  '平静',
  '焦虑',
  '成就感',
  '满足',
  '担忧',
  '期待',
  '疲惫',
  '感动',
  '愤怒',
  '悲伤',
  '兴奋',
]

export default function DiaryEditor() {
  const navigate = useNavigate()
  const { createDiary, isLoading } = useDiaryStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [diaryDate, setDiaryDate] = useState(new Date().toISOString().split('T')[0])
  const [emotionTags, setEmotionTags] = useState<string[]>([])
  const [importanceScore, setImportanceScore] = useState(5)

  const toggleEmotionTag = (tag: string) => {
    setEmotionTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容')
      return
    }

    try {
      const diary = await createDiary({
        title: title.trim(),
        content: content.trim(),
        diaryDate,
        emotionTags: emotionTags.length > 0 ? emotionTags : undefined,
        importanceScore,
      })

      alert('日记保存成功！')
      navigate(`/diaries/${diary.id}`)
    } catch (error: any) {
      alert(error.message || '保存失败')
    }
  }

  const wordCount = content.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button variant="ghost" onClick={() => navigate('/diaries')}>
              ← 取消
            </Button>
            <h1 className="text-xl font-bold">写日记</h1>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : '保存'}
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>为你的日记添加一些基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 标题 */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  标题 *
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="给今天的日记起个标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* 日期 */}
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  日期
                </label>
                <Input
                  id="date"
                  type="date"
                  value={diaryDate}
                  onChange={(e) => setDiaryDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 日记内容 */}
          <Card>
            <CardHeader>
              <CardTitle>日记内容</CardTitle>
              <CardDescription>记录你的想法和感受</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今天发生了什么？你有什么感受？"
                className="w-full min-h-[400px] p-4 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
              <div className="mt-2 text-sm text-muted-foreground text-right">
                {wordCount} 字
              </div>
            </CardContent>
          </Card>

          {/* 情绪标签 */}
          <Card>
            <CardHeader>
              <CardTitle>情绪标签</CardTitle>
              <CardDescription>选择你此刻的心情（可多选）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {PRESET_EMOTIONS.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotionTag(emotion)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      emotionTags.includes(emotion)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 重要性评分 */}
          <Card>
            <CardHeader>
              <CardTitle>重要性评分</CardTitle>
              <CardDescription>这件事对你有多重要？</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={importanceScore}
                    onChange={(e) => setImportanceScore(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-primary min-w-[3rem] text-center">
                    {importanceScore}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>不重要</span>
                  <span>一般</span>
                  <span>非常重要</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/diaries')}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <Loading size="sm" /> : '保存日记'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
