// 登录页面
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/common/Loading'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      alert('请输入有效的邮箱地址')
      return
    }

    try {
      await authService.sendLoginCode(email)
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

    if (!email || !code) {
      alert('请填写完整信息')
      return
    }

    clearError()

    try {
      await login(email, code)
      navigate('/')
    } catch (error: any) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">欢迎回来</CardTitle>
          <CardDescription className="text-center">
            使用邮箱验证码登录印记
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
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <Button type="submit" className="w-full" disabled={!code || isLoading}>
              {isLoading ? <Loading size="sm" /> : '登录'}
            </Button>

            {/* 注册链接 */}
            <div className="text-center text-sm">
              还没有账号？
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:underline ml-1"
              >
                立即注册
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
