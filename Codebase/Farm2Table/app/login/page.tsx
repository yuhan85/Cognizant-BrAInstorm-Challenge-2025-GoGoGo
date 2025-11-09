'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Navigation } from '@/components/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(true)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Sign in to your Farm2Table account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showDemo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg relative">
                  <button
                    onClick={() => setShowDemo(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <h4 className="font-semibold mb-2">Demo Credentials</h4>
                  <div className="text-sm space-y-1">
                    <p
                      onClick={() => {
                        setEmail('farmer_demo@example.com')
                        setPassword('FarmDemo!23')
                      }}
                      className="cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <strong>Farmer:</strong> farmer_demo@example.com / FarmDemo!23
                    </p>
                    <p
                      onClick={() => {
                        setEmail('basic_demo@example.com')
                        setPassword('BasicDemo!23')
                      }}
                      className="cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <strong>Basic:</strong> basic_demo@example.com / BasicDemo!23
                    </p>
                    <p
                      onClick={() => {
                        setEmail('premium_demo@example.com')
                        setPassword('PremiumDemo!23')
                      }}
                      className="cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <strong>Premium:</strong> premium_demo@example.com / PremiumDemo!23
                    </p>
                    <p
                      onClick={() => {
                        setEmail('driver_demo@example.com')
                        setPassword('DriverDemo!23')
                      }}
                      className="cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors"
                    >
                      <strong>Driver:</strong> driver_demo@example.com / DriverDemo!23
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}

