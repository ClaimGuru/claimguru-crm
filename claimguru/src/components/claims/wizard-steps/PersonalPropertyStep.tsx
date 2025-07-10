import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  Package, 
  Brain, 
  Camera, 
  DollarSign, 
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Tag,
  Home,
  Shirt,
  Monitor,
  Car,
  BookOpen,
  Zap
} from 'lucide-react'
import { claimWizardAI } from '../../../services/claimWizardAI'

interface PersonalPropertyStepProps {
  data: any
  onUpdate: (data: any) => void
}

interface PropertyItem {
  id: string
  category: string
  description: string
  brand: string
  model: string
  serialNumber: string
  purchaseDate: string
  originalValue: number
  depreciatedValue: number
  quantity: number
  roomLocation: string
  condition: string
  photo?: File
  aiGenerated?: boolean
  damageDescription?: string
  replacementCost?: number
}

export function PersonalPropertyStep({ data, onUpdate }: PersonalPropertyStepProps) {
  const [propertyItems, setPropertyItems] = useState<PropertyItem[]>(data.personalProperty || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterRoom, setFilterRoom] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [bulkPhotos, setBulkPhotos] = useState<File[]>([])
  
  const [newItem, setNewItem] = useState<Partial<PropertyItem>>({
    category: '',
    description: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    originalValue: 0,
    quantity: 1,
    roomLocation: '',
    condition: 'good'
  })

  const [aiSuggestions, setAiSuggestions] = useState(null)

  // Update parent when items change
  useEffect(() => {
    onUpdate({ personalProperty: propertyItems })
  }, [propertyItems, onUpdate])

  const categories = [
    { value: 'electronics', label: 'Electronics', icon: Monitor },
    { value: 'furniture', label: 'Furniture', icon: Home },
    { value: 'clothing', label: 'Clothing', icon: Shirt },
    { value: 'appliances', label: 'Appliances', icon: Package },
    { value: 'jewelry', label: 'Jewelry', icon: Sparkles },
    { value: 'books', label: 'Books/Media', icon: BookOpen },
    { value: 'tools', label: 'Tools', icon: Car },
    { value: 'other', label: 'Other', icon: Package }
  ]

  const rooms = [
    'Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Bathroom',
    'Home Office', 'Garage', 'Basement', 'Attic', 'Laundry Room',
    'Guest Room', 'Master Bedroom', 'Family Room', 'Hallway', 'Closet'
  ]

  const conditions = [
    { value: 'excellent', label: 'Excellent', multiplier: 1.0 },
    { value: 'good', label: 'Good', multiplier: 0.8 },
    { value: 'fair', label: 'Fair', multiplier: 0.6 },
    { value: 'poor', label: 'Poor', multiplier: 0.4 },
    { value: 'damaged', label: 'Damaged', multiplier: 0.2 }
  ]

  const generateAIInventory = async () => {
    if (!data.lossDetails?.causeOfLoss || !data.mailingAddress?.propertyType) {
      alert('Please complete loss details and property information first')
      return
    }

    setAiGenerating(true)
    try {
      // Simulate AI inventory generation based on property type and loss type
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const aiItems = await claimWizardAI.generatePersonalPropertyInventory({
        propertyType: data.mailingAddress.propertyType,
        causeOfLoss: data.lossDetails.causeOfLoss,
        yearBuilt: data.lossDetails.yearBuilt,
        insuredDetails: data.insuredDetails
      })

      const newItems = aiItems.map((item, index) => ({
        id: `ai-${Date.now()}-${index}`,
        ...item,
        aiGenerated: true
      }))

      setPropertyItems(prev => [...prev, ...newItems])
      
      setAiSuggestions({
        totalItems: aiItems.length,
        estimatedValue: aiItems.reduce((sum, item) => sum + (item.originalValue * item.quantity), 0),
        categories: [...new Set(aiItems.map(item => item.category))],
        recommendations: [
          "Review and adjust quantities based on your actual inventory",
          "Add photos and receipts where available",
          "Verify purchase dates and values for high-value items",
          "Consider any recent purchases or replacements"
        ]
      })

    } catch (error) {
      console.error('Error generating AI inventory:', error)
      alert('Error generating inventory. Please try again.')
    } finally {
      setAiGenerating(false)
    }
  }

  const analyzeBulkPhotos = async (files: File[]) => {
    if (files.length === 0) return

    setAiAnalyzing(true)
    try {
      const analysisResults = await claimWizardAI.analyzeBulkPropertyPhotos(files)
      
      const newItems = analysisResults.map((result, index) => ({
        id: `photo-${Date.now()}-${index}`,
        category: result.category,
        description: result.description,
        brand: result.brand || '',
        model: result.model || '',
        originalValue: result.estimatedValue,
        depreciatedValue: result.estimatedValue * 0.7, // Rough depreciation
        quantity: 1,
        roomLocation: result.roomLocation || '',
        condition: result.condition || 'good',
        photo: files[index],
        aiGenerated: true,
        damageDescription: result.damageDescription,
        replacementCost: result.replacementCost
      }))

      setPropertyItems(prev => [...prev, ...newItems])
      setBulkPhotos([])

    } catch (error) {
      console.error('Error analyzing photos:', error)
      alert('Error analyzing photos. Please try again.')
    } finally {
      setAiAnalyzing(false)
    }
  }

  const addItem = () => {
    if (!newItem.description || !newItem.category) {
      alert('Please fill in at least description and category')
      return
    }

    const item: PropertyItem = {
      id: `manual-${Date.now()}`,
      category: newItem.category || '',
      description: newItem.description || '',
      brand: newItem.brand || '',
      model: newItem.model || '',
      serialNumber: newItem.serialNumber || '',
      purchaseDate: newItem.purchaseDate || '',
      originalValue: newItem.originalValue || 0,
      depreciatedValue: calculateDepreciatedValue(newItem.originalValue || 0, newItem.condition || 'good'),
      quantity: newItem.quantity || 1,
      roomLocation: newItem.roomLocation || '',
      condition: newItem.condition || 'good'
    }

    setPropertyItems(prev => [...prev, item])
    setNewItem({
      category: '',
      description: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      originalValue: 0,
      quantity: 1,
      roomLocation: '',
      condition: 'good'
    })
    setShowAddForm(false)
  }

  const removeItem = (id: string) => {
    setPropertyItems(prev => prev.filter(item => item.id !== id))
  }

  const updateItem = (id: string, updates: Partial<PropertyItem>) => {
    setPropertyItems(prev => prev.map(item => 
      item.id === id 
        ? { 
            ...item, 
            ...updates,
            depreciatedValue: updates.originalValue 
              ? calculateDepreciatedValue(updates.originalValue, updates.condition || item.condition)
              : item.depreciatedValue
          }
        : item
    ))
  }

  const calculateDepreciatedValue = (originalValue: number, condition: string) => {
    const multiplier = conditions.find(c => c.value === condition)?.multiplier || 0.8
    return originalValue * multiplier
  }

  const filteredItems = propertyItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory
    const matchesRoom = filterRoom === 'all' || item.roomLocation === filterRoom
    
    return matchesSearch && matchesCategory && matchesRoom
  })

  const totalValue = propertyItems.reduce((sum, item) => sum + (item.depreciatedValue * item.quantity), 0)
  const totalOriginalValue = propertyItems.reduce((sum, item) => sum + (item.originalValue * item.quantity), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header with AI Generation */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-purple-600" />
            AI-Powered Personal Property Inventory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={generateAIInventory}
              disabled={aiGenerating}
              className="flex items-center gap-2"
            >
              {aiGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating Inventory...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate AI Inventory
                </>
              )}
            </Button>
            
            <div>
              <label htmlFor="bulk-photos" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  disabled={aiAnalyzing}
                  className="flex items-center gap-2 w-full"
                >
                  {aiAnalyzing ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Analyzing Photos...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Bulk Photo Analysis
                    </>
                  )}
                </Button>
              </label>
              <input
                id="bulk-photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && analyzeBulkPhotos(Array.from(e.target.files))}
                className="hidden"
              />
            </div>
          </div>

          <div className="text-sm text-purple-700">
            <strong>AI Features:</strong> Generate complete room inventories, analyze photos for automatic item recognition, 
            estimate values based on market data, and create detailed descriptions
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">AI Inventory Generated Successfully</div>
                <div className="text-sm text-green-700">
                  Added {aiSuggestions.totalItems} items worth approximately {formatCurrency(aiSuggestions.estimatedValue)}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-green-900">AI Recommendations:</div>
              {aiSuggestions.recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-green-700 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {rec}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{propertyItems.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-gray-600">Current Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalOriginalValue)}</div>
              <div className="text-sm text-gray-600">Original Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {propertyItems.filter(item => item.aiGenerated).length}
              </div>
              <div className="text-sm text-gray-600">AI Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Rooms</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Item description"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  type="text"
                  value={newItem.brand}
                  onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Brand"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={newItem.model}
                  onChange={(e) => setNewItem(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Model"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  value={newItem.serialNumber}
                  onChange={(e) => setNewItem(prev => ({ ...prev, serialNumber: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Serial number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Value</label>
                <input
                  type="number"
                  value={newItem.originalValue}
                  onChange={(e) => setNewItem(prev => ({ ...prev, originalValue: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                <select
                  value={newItem.roomLocation}
                  onChange={(e) => setNewItem(prev => ({ ...prev, roomLocation: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select room</option>
                  {rooms.map(room => (
                    <option key={room} value={room}>{room}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-green-600" />
              Personal Property Items ({filteredItems.length})
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Report
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600 mb-4">
                {propertyItems.length === 0 
                  ? "Start by generating an AI inventory or adding items manually"
                  : "No items match your current filters"
                }
              </p>
              {propertyItems.length === 0 && (
                <Button onClick={generateAIInventory} className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Generate AI Inventory
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          {categories.find(cat => cat.value === item.category)?.icon && 
                            React.createElement(categories.find(cat => cat.value === item.category)!.icon, {
                              className: "h-4 w-4 text-purple-600"
                            })
                          }
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.description}</div>
                          <div className="text-sm text-gray-600">
                            {item.brand} {item.model} • {item.roomLocation}
                            {item.aiGenerated && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                <Brain className="h-3 w-3" />
                                AI Generated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Original Value:</span>
                          <div className="font-medium">{formatCurrency(item.originalValue)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Current Value:</span>
                          <div className="font-medium text-green-600">{formatCurrency(item.depreciatedValue)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <div className="font-medium">{item.quantity}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <div className="font-medium capitalize">{item.condition}</div>
                        </div>
                      </div>
                      
                      {item.damageDescription && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                          <span className="font-medium text-amber-800">Damage: </span>
                          <span className="text-amber-700">{item.damageDescription}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {item.photo && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Photo
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
