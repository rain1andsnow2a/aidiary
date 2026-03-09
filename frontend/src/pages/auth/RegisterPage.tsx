// 注册页面
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/common/Loading'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      alert('请输入有效的邮箱地址')
      return
    }

    try {
      await authService.sendRegisterCode(email)
      setCodeSent(true)
      startCountdown()
    } catch (error: any) {
      alert(error.message || '发送验证码失败')
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 验证
    if (!email || !password || !code) {
      alert('请填写完整信息')
      return
    }

    if (password !== confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      alert('密码长度至少6位')
      return
    }

    clearError()

    try {
      await register(email, password, code, username || undefined)
      alert('注册成功！请登录')
      navigate('/login')
    } catch (error: any) {
      console.error('Register failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">创建账号</CardTitle>
          <CardDescription className="text-center">
            注册印记，开始你的智能日记之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱地址
              </label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={!email || !email.includes('@') || (countdown > 0)}
                >
                  {countdown > 0 ? `${countdown}秒` : '发送验证码'}
                </Button>
              </div>
            </div>

            {/* 验证码输入 */}
            {codeSent && (
              <>
                <div className="space-y-2">
                  <label htmlFor="code" className="text-sm font-medium">
                    验证码
                  </label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    验证码已发送到您的邮箱，12秒后可重新发送
                  </p>
                </div>

                {/* 用户名（可选） */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    用户名（可选）
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="如何称呼你"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    密码
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="至少6位密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* 确认密码 */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    确认密码
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* 注册按钮 */}
            <Button
              type="submit"
              className="w-full"
              disabled={!code || !password || isLoading}
            >
              {isLoading ? <Loading size="sm" /> : '注册'}
            </Button>

            {/* 登录链接 */}
            <div className="text-center text-sm">
              已有账号？
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline ml-1"
              >
                立即登录
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
