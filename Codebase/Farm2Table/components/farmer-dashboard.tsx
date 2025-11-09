'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFarmById, updateFarm, updateProduct, createProduct } from '@/lib/data-store'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Package, Brain } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

export function FarmerDashboard() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const farmId = session?.user?.farmId

  const { data: farm } = useQuery({
    queryKey: ['farm', farmId],
    queryFn: () => farmId ? getFarmById(farmId) : null,
    enabled: !!farmId,
  })

  const { data: products } = useQuery({
    queryKey: ['products', farmId],
    queryFn: async () => {
      if (!farmId) return []
      const response = await fetch(`/api/products?farmId=${farmId}`)
      if (!response.ok) return []
      const data = await response.json()
      return data.products || []
    },
    enabled: !!farmId,
  })

  const updateFarmMutation = useMutation({
    mutationFn: async (updates: any) => {
      if (!farmId) throw new Error('No farm ID')
      const response = await fetch('/api/farm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update farm')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farm', farmId] })
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: any }) => {
      const response = await fetch('/api/product', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...updates }),
      })
      if (!response.ok) throw new Error('Failed to update product')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', farmId] })
    },
  })

  const createProductMutation = useMutation({
    mutationFn: async (product: any) => {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, farmId }),
      })
      if (!response.ok) throw new Error('Failed to create product')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', farmId] })
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/product?productId=${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete product')
      }
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch products to update the UI
      queryClient.invalidateQueries({ queryKey: ['products', farmId] })
      queryClient.refetchQueries({ queryKey: ['products', farmId] })
    },
    onError: (error: any) => {
      console.error('Delete product error:', error)
      alert(`Failed to delete product: ${error.message}`)
    },
  })

  if (!farm) {
    return <div>Farm not found</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Farmer Dashboard</h1>
        <p className="text-gray-600">Manage your farm profile and products</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="flex gap-6">
          <div className="w-48 bg-green-50 rounded-lg p-3 shadow-sm">
            <TabsList className="flex-col h-auto w-full bg-transparent p-0 gap-1">
              <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Farm Profile</TabsTrigger>
              <TabsTrigger value="products" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Products</TabsTrigger>
              <TabsTrigger value="analytics" className="w-full justify-start data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-base font-medium py-2.5">Analytics</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1">

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Edit Farm Profile</CardTitle>
              <CardDescription>Update your farm information</CardDescription>
            </CardHeader>
            <CardContent>
              <FarmProfileForm farm={farm} onUpdate={updateFarmMutation.mutate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Manage Products</CardTitle>
              <CardDescription>Add, edit, or archive products</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsManager
                products={products || []}
                onCreate={createProductMutation.mutate}
                onUpdate={updateProductMutation.mutate}
                onDelete={deleteProductMutation.mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

function FarmProfileForm({ farm, onUpdate }: { farm: any; onUpdate: (updates: any) => void }) {
  const [name, setName] = useState(farm.name)
  const [bio, setBio] = useState(farm.bio)
  const [bannerImage, setBannerImage] = useState(farm.bannerImage)
  const [videoUrl, setVideoUrl] = useState(farm.videoUrl)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      onUpdate({ name, bio, bannerImage, videoUrl })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Farm Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          required
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bannerImage">Banner Image URL</Label>
        <Input
          id="bannerImage"
          value={bannerImage}
          onChange={(e) => setBannerImage(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  )
}

function ProductsManager({ products, onCreate, onUpdate, onDelete }: { products: any[]; onCreate: (product: any) => void; onUpdate: (data: any) => void; onDelete: (productId: string) => void }) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowCreate(true)}>Add Product</Button>
      {showCreate && (
        <ProductForm
          onSave={(product) => {
            onCreate(product)
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
        />
      )}
      <div className="space-y-4">
        {products.map(product => (
          <ProductForm
            key={product.id}
            product={product}
            onSave={(updates) => onUpdate({ productId: product.id, updates })}
            onDelete={() => {
              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                onDelete(product.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ProductForm({ product, onSave, onCancel, onDelete }: { product?: any; onSave: (data: any) => void; onCancel?: () => void; onDelete?: () => void }) {
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [unit, setUnit] = useState(product?.unit || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || '')
  const [image, setImage] = useState(product?.image || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      unit,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image,
      available: product?.available !== false,
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            {onDelete && product && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function AnalyticsTab() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch('/api/farmer/analytics')
      if (!response.ok) return null
      const data = await response.json()
      return data.analytics || []
    },
  })

  const [aiInsights, setAIInsights] = useState<string | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!analyticsData || analyticsData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data for profit by product
  const productNames = new Set<string>()
  analyticsData.forEach((month: any) => {
    month.products.forEach((p: any) => productNames.add(p.productName))
  })

  const profitData = analyticsData.map((month: any) => {
    const data: any = { month: month.month }
    month.products.forEach((p: any) => {
      data[p.productName] = p.profit
    })
    return data
  })

  // Prepare sales volume data
  const salesData = analyticsData.map((month: any) => ({
    month: month.month,
    totalQuantity: month.totalQuantity,
    totalRevenue: month.totalRevenue,
    totalProfit: month.totalProfit,
  }))

  // Calculate summary statistics
  const latestMonth = analyticsData[analyticsData.length - 1]
  const previousMonth = analyticsData[analyticsData.length - 2]
  const revenueGrowth = previousMonth
    ? ((latestMonth.totalRevenue - previousMonth.totalRevenue) / previousMonth.totalRevenue) * 100
    : 0
  const profitGrowth = previousMonth
    ? ((latestMonth.totalProfit - previousMonth.totalProfit) / previousMonth.totalProfit) * 100
    : 0

  const fetchAIInsights = async () => {
    setLoadingInsights(true)
    setAIInsights(null) // Clear previous insights
    try {
      const response = await fetch('/api/farmer/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analytics: analyticsData }),
      })
      
      const data = await response.json()
      console.log('AI insights response:', data)
      
      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429 || data.rateLimited) {
          setAIInsights(`⚠️ Rate Limit Exceeded: ${data.insights || 'The AI service is currently experiencing high demand. Please wait a moment and try again.'}`)
          return
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      if (data.insights) {
        setAIInsights(data.insights)
      } else if (data.error) {
        setAIInsights(`Error: ${data.error}`)
      } else {
        setAIInsights('No insights received from the server.')
      }
    } catch (error: any) {
      console.error('AI insights error:', error)
      const errorMessage = error?.message || 'Sorry, I encountered an error while analyzing your data. Please try again later.'
      
      // Check if it's a rate limit error
      if (errorMessage.includes('429') || errorMessage.includes('Rate limit') || errorMessage.includes('Too Many Requests')) {
        setAIInsights(`⚠️ Rate Limit Exceeded: The AI service is currently experiencing high demand. Please wait a moment and try again.`)
      } else {
        setAIInsights(`Error: ${errorMessage}`)
      }
    } finally {
      setLoadingInsights(false)
    }
  }

  // Color palette for products
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${latestMonth.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(revenueGrowth).toFixed(1)}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${latestMonth.totalProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {profitGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(profitGrowth).toFixed(1)}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestMonth.totalQuantity}</div>
            <p className="text-xs text-muted-foreground mt-1">units sold this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit by Product Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit by Product</CardTitle>
          <CardDescription>Track profit trends for each product over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Array.from(productNames).map((productName, index) => (
                  <Line
                    key={productName}
                    type="monotone"
                    dataKey={productName}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Sales Volume</CardTitle>
          <CardDescription>Monthly sales quantity, revenue, and profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalQuantity" fill="#3b82f6" name="Quantity" />
                <Bar yAxisId="right" dataKey="totalRevenue" fill="#10b981" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="totalProfit" fill="#f59e0b" name="Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Brain className="h-5 w-5 text-green-600" />
            AI Business Insights
          </CardTitle>
          <CardDescription className="text-green-700">
            Weather analysis, demand planning, and consumer preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Button
            onClick={fetchAIInsights}
            disabled={loadingInsights}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white"
            variant="default"
          >
            {loadingInsights ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Insights Report
              </>
            )}
          </Button>
          {aiInsights && (() => {
            // Try to parse as JSON
            let insightsData: {
              weatherImpact?: { title: string; insights: string[] }
              demandPlanning?: { title: string; insights: string[] }
              consumerPreferences?: { title: string; insights: string[] }
            } | null = null

            try {
              // Clean the response - remove markdown code blocks if present
              let cleanResponse = aiInsights
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
              
              // Try to extract JSON if it's wrapped in other text
              const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                cleanResponse = jsonMatch[0]
              }
              
              insightsData = JSON.parse(cleanResponse)
            } catch (error) {
              console.error('Failed to parse AI insights as JSON:', error)
              // Fallback to text parsing
            }

            // If JSON parsing succeeded, render using the structured component
            if (insightsData && (insightsData.weatherImpact || insightsData.demandPlanning || insightsData.consumerPreferences)) {
              return <InsightsRenderer data={insightsData} />
            }
            
            // Fallback: Parse as structured text (original logic)
            interface ProductGroup {
              name: string
              items: string[]
            }
            
            interface Section {
              title: string
              products: ProductGroup[]
              regularItems: string[]
            }
            
            const sections: Section[] = []
            const lines = aiInsights.split('\n')
            let currentSection: Section | null = null
            let currentProduct: ProductGroup | null = null

            lines.forEach((line) => {
              const trimmed = line.trim()
              if (!trimmed) {
                currentProduct = null
                return
              }

              const mainHeaderMatch = trimmed.match(/^\*\*(\d+)\.\s*(.+?):\*\*/)
              
              if (mainHeaderMatch) {
                if (currentSection) {
                  sections.push(currentSection)
                }
                const title = mainHeaderMatch[2].trim()
                currentSection = { title, products: [], regularItems: [] }
                currentProduct = null
              } else if (currentSection) {
                const productHeaderMatch = trimmed.match(/^\*\*(.+?):\*\*/)
                
                if (productHeaderMatch) {
                  const productName = productHeaderMatch[1].trim()
                  currentProduct = { name: productName, items: [] }
                  currentSection.products.push(currentProduct)
                } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
                  const cleanItem = trimmed.replace(/^[-•]\s*/, '').trim()
                  
                  if (currentProduct) {
                    currentProduct.items.push(cleanItem)
                  } else {
                    currentSection.regularItems.push(cleanItem)
                  }
                } else {
                  if (currentProduct) {
                    currentProduct.items.push(trimmed)
                  } else {
                    currentSection.regularItems.push(trimmed)
                  }
                }
              } else {
                if (!currentSection) {
                  currentSection = { title: 'Insights', products: [], regularItems: [] }
                }
                currentSection.regularItems.push(trimmed)
              }
            })

            if (currentSection) {
              sections.push(currentSection)
            }

            if (sections.length === 0) {
              return (
                <div className="mt-4 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-50 rounded-xl border-2 border-green-300 shadow-lg">
                  <div className="space-y-2">
                    {aiInsights.split('\n').filter(line => line.trim()).map((line, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1.5 flex-shrink-0 text-lg">•</span>
                        <span className="flex-1 text-gray-700 leading-relaxed">{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div className="mt-4 space-y-4">
                {sections.map((section, sectionIndex) => (
                  <Card 
                    key={sectionIndex} 
                    className="bg-gradient-to-br from-green-50 via-emerald-50 to-emerald-50 border-2 border-green-300 shadow-lg"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-green-900 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0"></div>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {section.products.map((product, productIndex) => (
                          <div key={productIndex} className="space-y-2">
                            <div className="ml-1">
                              <span className="font-semibold text-green-900 text-base">{product.name}:</span>
                            </div>
                            <div className="ml-6 space-y-1.5">
                              {product.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start gap-2">
                                  <span className="text-green-600 mt-1.5 flex-shrink-0">•</span>
                                  <span className="flex-1 text-gray-700 leading-relaxed text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {section.regularItems.length > 0 && (
                          <div className="space-y-1.5">
                            {section.regularItems.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-start gap-2">
                                <span className="text-green-600 mt-1.5 flex-shrink-0">•</span>
                                <span className="flex-1 text-gray-700 leading-relaxed text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}

// Component to render structured insights from JSON
function InsightsRenderer({ 
  data 
}: { 
  data: {
    weatherImpact?: { title: string; insights: string[] }
    demandPlanning?: { title: string; insights: string[] }
    consumerPreferences?: { title: string; insights: string[] }
  }
}) {
  const sections = [
    data.weatherImpact,
    data.demandPlanning,
    data.consumerPreferences,
  ].filter(Boolean) as Array<{ title: string; insights: string[] }>

  return (
    <div className="mt-4 space-y-6">
      {sections.map((section, index) => (
        <div
          key={index}
          className="rounded-xl border border-green-200 bg-gradient-to-b from-green-50 to-green-100 p-5 md:p-6 shadow-sm space-y-3"
        >
          <h3 className="text-xl font-bold text-green-900 mb-4">{section.title}</h3>
          <div className="space-y-3">
            {section.insights.map((insight, insightIndex) => (
              <div key={insightIndex} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-green-600 flex-shrink-0"></span>
                <span className="text-slate-700 text-sm leading-relaxed">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

