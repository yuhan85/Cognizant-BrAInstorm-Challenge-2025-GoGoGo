'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Loader2, ShoppingCart, Heart, Package, CheckCircle2, Clock, Truck, RotateCcw } from 'lucide-react'
import { getProductById, getFarmById } from '@/lib/data-store'

export function CustomerDashboard() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id
  const plan = session?.user?.plan

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const stored = localStorage.getItem(`profile-${userId}`)
      if (stored) return JSON.parse(stored)
      return {
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        address: '',
        city: '',
        phone: '',
        allergies: '',
        specialNotes: '',
      }
    },
    enabled: !!userId,
  })

  const { data: orders } = useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const response = await fetch('/api/orders')
      if (!response.ok) return []
      const data = await response.json()
      return data.orders || []
    },
    enabled: !!userId,
  })

  const { data: weeklyItems } = useQuery({
    queryKey: ['weekly-items', userId],
    queryFn: async () => {
      if (plan === 'basic') {
        // First check localStorage
        const stored = localStorage.getItem(`weekly-bundle-${userId}`)
        if (stored) {
          try {
            return JSON.parse(stored)
          } catch (e) {
            console.error('Failed to parse stored weekly bundle:', e)
          }
        }
        // If not in localStorage, fetch from API
        const response = await fetch('/api/orders/weekly-bundle')
        if (!response.ok) return []
        const data = await response.json()
        if (data.items) {
          localStorage.setItem(`weekly-bundle-${userId}`, JSON.stringify(data.items))
        }
        return data.items || []
      }
      return []
    },
    enabled: !!userId && plan === 'basic',
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!userId) throw new Error('No user ID')
      localStorage.setItem(`profile-${userId}`, JSON.stringify(updates))
      return updates
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
  })

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Dashboard</h1>
        <p className="text-gray-600">Manage your profile, orders, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex gap-6">
          <div className="w-48 bg-green-50 rounded-lg p-3 shadow-sm">
            <TabsList className="flex-col h-auto w-full bg-transparent p-0 gap-1">
              <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Profile</TabsTrigger>
              <TabsTrigger value="preferences" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Preferences</TabsTrigger>
              <TabsTrigger value="nutrition" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Nutrition</TabsTrigger>
              <TabsTrigger value="recipes" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Recipes</TabsTrigger>
              <TabsTrigger value="orders" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Orders</TabsTrigger>
              {plan === 'basic' && <TabsTrigger value="weekly" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Weekly Bundle</TabsTrigger>}
              {plan === 'premium' && <TabsTrigger value="build" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Build Box</TabsTrigger>}
            </TabsList>
          </div>
          <div className="flex-1">

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm profile={profile} onUpdate={updateProfileMutation.mutate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Allergies and special notes for your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm profile={profile} onUpdate={updateProfileMutation.mutate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionTab userId={userId} plan={plan} />
        </TabsContent>

        <TabsContent value="recipes">
          <RecipesTab userId={userId} plan={plan} />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab orders={orders || []} />
        </TabsContent>

        {plan === 'basic' && (
          <TabsContent value="weekly">
            <WeeklyBundleTab items={weeklyItems || []} />
          </TabsContent>
        )}

        {plan === 'premium' && (
          <TabsContent value="build">
            <BuildBoxTab />
          </TabsContent>
        )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function ProfileForm({ profile, onUpdate }: { profile: any; onUpdate: (updates: any) => void }) {
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [address, setAddress] = useState(profile.address)
  const [city, setCity] = useState(profile.city)
  const [phone, setPhone] = useState(profile.phone)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...profile, name, email, address, city, phone })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  )
}

function PreferencesForm({ profile, onUpdate }: { profile: any; onUpdate: (updates: any) => void }) {
  const [allergies, setAllergies] = useState(profile.allergies || '')
  const [specialNotes, setSpecialNotes] = useState(profile.specialNotes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...profile, allergies, specialNotes })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          rows={3}
          placeholder="List any food allergies or dietary restrictions"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Special Notes</Label>
        <Textarea
          id="notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          rows={3}
          placeholder="Any special instructions for your orders"
        />
      </div>
      <Button type="submit">Save Preferences</Button>
    </form>
  )
}

function NutritionTab({ userId, plan }: { userId?: string; plan?: string }) {
  const [nutrition, setNutrition] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Calculate current week start and end dates
  const getWeekDates = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust to Monday
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return { weekStart, weekEnd }
  }

  // Get orders for basic users (weekly bundle)
  const { data: basicWeeklyItems } = useQuery({
    queryKey: ['weekly-items', userId],
    queryFn: async () => {
      if (plan === 'basic') {
        // First check localStorage
        const stored = localStorage.getItem(`weekly-bundle-${userId}`)
        if (stored) {
          try {
            return JSON.parse(stored)
          } catch (e) {
            console.error('Failed to parse stored weekly bundle:', e)
          }
        }
        // If not in localStorage, fetch from API
        const response = await fetch('/api/orders/weekly-bundle')
        if (!response.ok) return []
        const data = await response.json()
        if (data.items) {
          localStorage.setItem(`weekly-bundle-${userId}`, JSON.stringify(data.items))
        }
        return data.items || []
      }
      return []
    },
    enabled: !!userId && plan === 'basic',
  })

  // Get orders for premium users (this week's orders)
  const { data: premiumOrders } = useQuery({
    queryKey: ['orders', userId, 'this-week'],
    queryFn: async () => {
      if (plan === 'premium' && userId) {
        const response = await fetch('/api/orders')
        if (!response.ok) return []
        const data = await response.json()
        const orders = data.orders || []
        
        // Filter orders from this week
        const { weekStart, weekEnd } = getWeekDates()
        const thisWeekOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekStart && orderDate <= weekEnd
        })
        
        return thisWeekOrders
      }
      return []
    },
    enabled: !!userId && plan === 'premium',
  })

  // Convert premium orders to weeklyItems format
  const premiumWeeklyItems = premiumOrders ? (() => {
    const itemsMap = new Map<string, number>()
    
    premiumOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const currentQuantity = itemsMap.get(item.productId) || 0
        itemsMap.set(item.productId, currentQuantity + item.quantity)
      })
    })
    
    return Array.from(itemsMap.entries()).map(([id, quantity]) => ({
      id,
      quantity,
    }))
  })() : []

  // Use basic weekly items for basic plan, premium weekly items for premium plan
  const weeklyItems = plan === 'basic' ? basicWeeklyItems : premiumWeeklyItems

  const handleAnalyze = async () => {
    if (!weeklyItems || weeklyItems.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/nutrition/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyItems,
          allergies: localStorage.getItem(`profile-${userId}`) ? JSON.parse(localStorage.getItem(`profile-${userId}`)!).allergies : '',
        }),
      })

      const data = await response.json()
      setNutrition(data)
    } catch (error) {
      console.error('Nutrition analysis error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Recommended daily values (for a week, multiply by 7)
  const recommendedWeekly = {
    calories: 2000 * 7, // 2000 cal/day
    proteinG: 50 * 7, // 50g/day
    fiberG: 25 * 7, // 25g/day
    vitaminCMg: 90 * 7, // 90mg/day
    ironMg: 18 * 7, // 18mg/day
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Tracking</CardTitle>
          <CardDescription>Analyze your weekly nutrition intake</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyItems && weeklyItems.length > 0 ? (
            <div className="space-y-4">
              <Button onClick={handleAnalyze} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Nutrition'
                )}
              </Button>
              {nutrition && (
                <div className="mt-6 space-y-6">
                  {/* Weekly Totals Chart */}
                  {nutrition.weeklyTotals && (
                    <div>
                      <h4 className="font-semibold mb-4 text-lg">Weekly Nutrition Totals</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <NutritionBar
                          label="Calories"
                          current={nutrition.weeklyTotals.calories}
                          recommended={recommendedWeekly.calories}
                          unit="cal"
                        />
                        <NutritionBar
                          label="Protein"
                          current={nutrition.weeklyTotals.proteinG}
                          recommended={recommendedWeekly.proteinG}
                          unit="g"
                        />
                        <NutritionBar
                          label="Fiber"
                          current={nutrition.weeklyTotals.fiberG}
                          recommended={recommendedWeekly.fiberG}
                          unit="g"
                        />
                        <NutritionBar
                          label="Vitamin C"
                          current={nutrition.weeklyTotals.vitaminCMg}
                          recommended={recommendedWeekly.vitaminCMg}
                          unit="mg"
                        />
                        <NutritionBar
                          label="Iron"
                          current={nutrition.weeklyTotals.ironMg}
                          recommended={recommendedWeekly.ironMg}
                          unit="mg"
                        />
                      </div>
                    </div>
                  )}

                  {/* AI Advice Section */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Nutrition Advisor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {nutrition.target_nutrients && nutrition.target_nutrients.length > 0 ? (
                        <div>
                          <h4 className="font-semibold mb-2 text-[#2D4A36]">Target Nutrients</h4>
                          <div className="flex flex-wrap gap-2">
                            {nutrition.target_nutrients.map((nutrient: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="bg-white">{nutrient}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">Analyzing target nutrients...</p>
                      )}
                      {nutrition.gaps && nutrition.gaps.length > 0 ? (
                        <div>
                          <h4 className="font-semibold mb-2 text-[#2D4A36]">Nutritional Gaps Identified</h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {nutrition.gaps.map((gap: string, idx: number) => (
                              <li key={idx}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold mb-2 text-[#2D4A36]">Nutritional Gaps Identified</h4>
                          <p className="text-gray-600 text-sm">Based on your current intake, you may need to supplement:</p>
                          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                            {nutrition.weeklyTotals && (
                              <>
                                {nutrition.weeklyTotals.calories < recommendedWeekly.calories * 0.7 && (
                                  <li>Calories - You're getting {((nutrition.weeklyTotals.calories / recommendedWeekly.calories) * 100).toFixed(0)}% of your weekly goal</li>
                                )}
                                {nutrition.weeklyTotals.proteinG < recommendedWeekly.proteinG * 0.7 && (
                                  <li>Protein - You're getting {((nutrition.weeklyTotals.proteinG / recommendedWeekly.proteinG) * 100).toFixed(0)}% of your weekly goal</li>
                                )}
                                {nutrition.weeklyTotals.fiberG < recommendedWeekly.fiberG * 0.7 && (
                                  <li>Fiber - You're getting {((nutrition.weeklyTotals.fiberG / recommendedWeekly.fiberG) * 100).toFixed(0)}% of your weekly goal</li>
                                )}
                                {nutrition.weeklyTotals.vitaminCMg < recommendedWeekly.vitaminCMg * 0.7 && (
                                  <li>Vitamin C - You're getting {((nutrition.weeklyTotals.vitaminCMg / recommendedWeekly.vitaminCMg) * 100).toFixed(0)}% of your weekly goal</li>
                                )}
                                {nutrition.weeklyTotals.ironMg < recommendedWeekly.ironMg * 0.7 && (
                                  <li>Iron - You're getting {((nutrition.weeklyTotals.ironMg / recommendedWeekly.ironMg) * 100).toFixed(0)}% of your weekly goal</li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* This Week's Supplements Needed */}
                  {nutrition.gaps && nutrition.gaps.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-lg">This Week's Supplements Needed</CardTitle>
                        <CardDescription>Based on your current intake, consider adding these items</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {nutrition.recommendations && nutrition.recommendations.length > 0 ? (
                          <div className="space-y-3">
                            {nutrition.recommendations.map((rec: any, idx: number) => (
                              <Card key={idx} className="bg-white">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#4CAF50] mt-2 flex-shrink-0" />
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-[#2D4A36] mb-1">{rec.item}</h5>
                                      <p className="text-sm text-gray-600">{rec.why}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No specific recommendations at this time.</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              {plan === 'basic' 
                ? 'No weekly items to analyze yet. Generate a weekly bundle first.'
                : 'No weekly items to analyze yet. Place some orders this week to build your box.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RecipesTab({ userId, plan }: { userId?: string; plan?: string }) {
  const [recipe, setRecipe] = useState<any>(null)
  const [recipeLoading, setRecipeLoading] = useState(false)

  // Calculate current week start and end dates
  const getWeekDates = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust to Monday
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return { weekStart, weekEnd }
  }

  // Get orders for basic users (weekly bundle)
  const { data: basicWeeklyItems } = useQuery({
    queryKey: ['weekly-items', userId],
    queryFn: async () => {
      if (plan === 'basic') {
        // First check localStorage
        const stored = localStorage.getItem(`weekly-bundle-${userId}`)
        if (stored) {
          try {
            return JSON.parse(stored)
          } catch (e) {
            console.error('Failed to parse stored weekly bundle:', e)
          }
        }
        // If not in localStorage, fetch from API
        const response = await fetch('/api/orders/weekly-bundle')
        if (!response.ok) return []
        const data = await response.json()
        if (data.items) {
          localStorage.setItem(`weekly-bundle-${userId}`, JSON.stringify(data.items))
        }
        return data.items || []
      }
      return []
    },
    enabled: !!userId && plan === 'basic',
  })

  // Get orders for premium users (this week's orders)
  const { data: premiumOrders } = useQuery({
    queryKey: ['orders', userId, 'this-week'],
    queryFn: async () => {
      if (plan === 'premium' && userId) {
        const response = await fetch('/api/orders')
        if (!response.ok) return []
        const data = await response.json()
        const orders = data.orders || []
        
        // Filter orders from this week
        const { weekStart, weekEnd } = getWeekDates()
        const thisWeekOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= weekStart && orderDate <= weekEnd
        })
        
        return thisWeekOrders
      }
      return []
    },
    enabled: !!userId && plan === 'premium',
  })

  // Convert premium orders to weeklyItems format
  const premiumWeeklyItems = premiumOrders ? (() => {
    const itemsMap = new Map<string, number>()
    
    premiumOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const currentQuantity = itemsMap.get(item.productId) || 0
        itemsMap.set(item.productId, currentQuantity + item.quantity)
      })
    })
    
    return Array.from(itemsMap.entries()).map(([id, quantity]) => ({
      id,
      quantity,
    }))
  })() : []

  // Use basic weekly items for basic plan, premium weekly items for premium plan
  const weeklyItems = plan === 'basic' ? basicWeeklyItems : premiumWeeklyItems

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <span>🍳</span>
            AI Recipe Recommendations
          </CardTitle>
          <CardDescription>Get personalized recipes using ingredients from your weekly box</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyItems && weeklyItems.length > 0 ? (
            <div className="space-y-4">
              {!recipe ? (
                <Button 
                  onClick={async () => {
                    if (!weeklyItems || weeklyItems.length === 0) return
                    setRecipeLoading(true)
                    try {
                      const response = await fetch('/api/nutrition/recipe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          weeklyItems,
                          allergies: localStorage.getItem(`profile-${userId}`) ? JSON.parse(localStorage.getItem(`profile-${userId}`)!).allergies : '',
                        }),
                      })
                      if (!response.ok) throw new Error('Failed to generate recipe')
                      const data = await response.json()
                      setRecipe(data.recipe)
                    } catch (error) {
                      console.error('Recipe generation error:', error)
                      alert('Failed to generate recipe. Please try again.')
                    } finally {
                      setRecipeLoading(false)
                    }
                  }}
                  disabled={recipeLoading}
                  className="w-full"
                  size="lg"
                >
                  {recipeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Recipe...
                    </>
                  ) : (
                    'Generate Recipe'
                  )}
                </Button>
              ) : (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h4 className="font-bold text-2xl text-[#2D4A36] mb-2">{recipe.title}</h4>
                        {recipe.description && (
                          <p className="text-gray-700 mb-4 text-lg">{recipe.description}</p>
                        )}
                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                          {recipe.servings && (
                            <span className="flex items-center gap-1">🍽️ Serves {recipe.servings}</span>
                          )}
                          {recipe.prepTime && (
                            <span className="flex items-center gap-1">⏱️ Prep: {recipe.prepTime}</span>
                          )}
                          {recipe.cookTime && (
                            <span className="flex items-center gap-1">🔥 Cook: {recipe.cookTime}</span>
                          )}
                        </div>
                      </div>

                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-xl mb-3 text-[#2D4A36]">Ingredients</h5>
                          <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {recipe.ingredients.map((ingredient: string, idx: number) => (
                              <li key={idx} className="text-base">{ingredient}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {recipe.instructions && recipe.instructions.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-xl mb-3 text-[#2D4A36]">Instructions</h5>
                          <ol className="list-decimal list-inside space-y-3 text-gray-700">
                            {recipe.instructions.map((instruction: string, idx: number) => (
                              <li key={idx} className="ml-2 text-base">{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {recipe.nutritionalNotes && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-base text-gray-700">
                            <span className="font-semibold">💡 Nutritional Note: </span>
                            {recipe.nutritionalNotes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setRecipe(null)
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Generate Another Recipe
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">
              {plan === 'basic' 
                ? 'No weekly items available yet. Generate a weekly bundle first to get recipe recommendations.'
                : 'No weekly items available yet. Place some orders this week to build your box and get recipe recommendations.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function NutritionBar({ label, current, recommended, unit }: { label: string; current: number; recommended: number; unit: string }) {
  const percentage = Math.min((current / recommended) * 100, 100)
  const isLow = percentage < 70
  const isGood = percentage >= 70 && percentage < 100
  const isHigh = percentage >= 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm text-gray-700">{label}</span>
          <span className="text-sm font-semibold">
            {current.toFixed(1)} / {recommended.toFixed(0)} {unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all ${
              isLow ? 'bg-red-500' : isGood ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{percentage.toFixed(0)}% of weekly goal</span>
          {isLow && <span className="text-red-600 font-medium">Needs more</span>}
          {isGood && <span className="text-yellow-600 font-medium">Getting there</span>}
          {isHigh && <span className="text-green-600 font-medium">Goal met!</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function OrdersTab({ orders }: { orders: any[] }) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [returnLoading, setReturnLoading] = useState(false)

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const handleReturn = async () => {
    if (!selectedOrder || !returnReason.trim()) {
      alert('Please provide a reason for return')
      return
    }

    setReturnLoading(true)
    try {
      // In a real app, this would call an API to process the return
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`Return request submitted for Order #${selectedOrder.id}. Reason: ${returnReason}`)
      setReturnReason('')
      setDialogOpen(false)
    } catch (error) {
      console.error('Return error:', error)
      alert('Failed to submit return request. Please try again.')
    } finally {
      setReturnLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-500" />
      case 'preparing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'created':
        return 'Order Created'
      case 'preparing':
        return 'Preparing'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>View your past and current orders</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <Card 
                  key={order.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleOrderClick(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Order #{order.id}</h4>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Created: {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </p>
                    {order.deliveryDate && (
                      <p className="text-sm text-gray-600 mb-2">
                        Delivery: {format(new Date(order.deliveryDate), 'MMM d, yyyy')} {order.deliveryWindow}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">Total: ${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Click to view details</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Order placed on {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Order Status */}
                <div>
                  <h3 className="font-semibold mb-3">Order Status</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(selectedOrder.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">
                        {getStatusLabel(selectedOrder.status)}
                      </p>
                      {selectedOrder.status === 'delivered' && selectedOrder.deliveredAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Delivered on {format(new Date(selectedOrder.deliveredAt), 'MMM d, yyyy')}
                        </p>
                      )}
                      {selectedOrder.status === 'created' && (
                        <p className="text-sm text-gray-500 mt-1">
                          Order created on {format(new Date(selectedOrder.createdAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => {
                      const product = getProductById(item.productId)
                      const farm = getFarmById(item.farmId)
                      return (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {product?.image && (
                                <img
                                  src={product.image}
                                  alt={product?.name || 'Product'}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold">{product?.name || 'Unknown Product'}</h4>
                                <p className="text-sm text-gray-600">{farm?.name || 'Unknown Farm'}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity} {product?.unit || ''}
                                  </p>
                                  <p className="font-semibold">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                {item.status && (
                                  <Badge className={`mt-2 ${getStatusColor(item.status)}`}>
                                    {getStatusLabel(item.status)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Delivery Information */}
                {selectedOrder.deliveryDate && (
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Information</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Date:</strong> {format(new Date(selectedOrder.deliveryDate), 'MMM d, yyyy')}
                    </p>
                    {selectedOrder.deliveryWindow && (
                      <p className="text-sm text-gray-600">
                        <strong>Time Window:</strong> {selectedOrder.deliveryWindow}
                      </p>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-xl text-primary">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Return Section */}
                {selectedOrder.status === 'delivered' && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <RotateCcw className="h-5 w-5" />
                      Request Return
                    </h3>
                    <Textarea
                      placeholder="Please provide a reason for return..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={3}
                      className="mb-3"
                    />
                    <Button
                      onClick={handleReturn}
                      disabled={returnLoading || !returnReason.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      {returnLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Submit Return Request
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function WeeklyBundleTab({ items }: { items: any[] }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id
  const [loading, setLoading] = useState(false)

  const handleGetBundle = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/orders/weekly-bundle', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        // Save to localStorage
        if (data.items) {
          localStorage.setItem(`weekly-bundle-${userId}`, JSON.stringify(data.items))
        }
        // Invalidate and refetch the query
        queryClient.invalidateQueries({ queryKey: ['weekly-items', userId] })
      } else {
        const error = await response.json()
        console.error('Failed to get weekly bundle:', error)
        alert('Failed to generate weekly bundle. Please try again.')
      }
    } catch (error) {
      console.error('Weekly bundle error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Bundle</CardTitle>
        <CardDescription>Your fixed weekly bundle from local farms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleGetBundle} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Get Weekly Bundle'
            )}
          </Button>
          {items.length === 0 ? (
            <p className="text-gray-600">No items in this week's bundle yet. Click "Get Weekly Bundle" to generate.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item: any) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.price.toFixed(2)}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function BuildBoxTab() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const userId = session?.user?.id
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null)
  const [cart, setCart] = useState<Array<{ productId: string; farmId: string; name: string; quantity: number; unit: string; price: number }>>([])
  const [loading, setLoading] = useState(false)

  // Get subscription to get cityId
  const { data: subscription } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null
      const response = await fetch('/api/subscription')
      if (!response.ok) return null
      const data = await response.json()
      return data.subscription
    },
    enabled: !!userId,
  })

  // Get farms in the user's city
  const { data: farms } = useQuery({
    queryKey: ['farms', subscription?.cityId],
    queryFn: async () => {
      if (!subscription?.cityId) return []
      const response = await fetch(`/api/farms?cityId=${subscription.cityId}`)
      if (!response.ok) return []
      const data = await response.json()
      return data.farms || []
    },
    enabled: !!subscription?.cityId,
  })

  // Get products for selected farm
  const { data: products } = useQuery({
    queryKey: ['products', selectedFarm],
    queryFn: async () => {
      if (!selectedFarm) return []
      const response = await fetch(`/api/products?farmId=${selectedFarm}`)
      if (!response.ok) return []
      const data = await response.json()
      return (data.products || []).filter((p: any) => p.available && p.quantity > 0)
    },
    enabled: !!selectedFarm,
  })

  // Load cart from localStorage
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`build-box-cart-${userId}`)
      if (stored) {
        try {
          setCart(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse cart:', e)
        }
      }
    }
  }, [userId])

  // Save cart to localStorage
  useEffect(() => {
    if (userId && cart.length >= 0) {
      localStorage.setItem(`build-box-cart-${userId}`, JSON.stringify(cart))
    }
  }, [cart, userId])

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        farmId: product.farmId,
        name: product.name,
        quantity: 1,
        unit: product.unit,
        price: product.price,
      }])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId))
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const handleCreateOrder = async () => {
    if (!userId || !subscription || cart.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            farmId: item.farmId,
          })),
          subscriptionId: subscription.id,
        }),
      })

      if (response.ok) {
        setCart([])
        queryClient.invalidateQueries({ queryKey: ['orders', userId] })
        alert('Order created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create order: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Create order error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Build Your Box</CardTitle>
          <CardDescription>Choose products from available farms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Farms and Products Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-2 block">Select a Farm</Label>
                <div className="space-y-2">
                  {farms && farms.length > 0 ? (
                    farms.map((farm: any) => (
                      <Button
                        key={farm.id}
                        variant={selectedFarm === farm.id ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedFarm(farm.id)}
                      >
                        {farm.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No farms available in your city.</p>
                  )}
                </div>
              </div>

              {selectedFarm && products && (
                <div>
                  <Label className="text-lg font-semibold mb-2 block">Available Products</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {products.length > 0 ? (
                      products.map((product: any) => (
                        <Card key={product.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{product.name}</h4>
                                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-primary">
                                      ${product.price.toFixed(2)} / {product.unit}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {product.quantity} {product.unit} available
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(product)}
                                    disabled={product.quantity === 0}
                                  >
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-gray-600 text-sm">No products available for this farm.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold mb-2 block">Your Cart</Label>
                <Card>
                  <CardContent className="p-4">
                    {cart.length > 0 ? (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between border-b pb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                ${item.price.toFixed(2)} / {item.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                +
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold">Total:</span>
                            <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                          </div>
                          <Button
                            onClick={handleCreateOrder}
                            disabled={loading || cart.length === 0}
                            className="w-full"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Order...
                              </>
                            ) : (
                              'Create Order'
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">Your cart is empty. Select a farm and add products.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

