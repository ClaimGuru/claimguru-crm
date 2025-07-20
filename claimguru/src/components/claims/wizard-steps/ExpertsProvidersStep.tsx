import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  Users, 
  Brain, 
  Star, 
  MapPin, 
  Phone, 
  Mail,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Hammer,
  Zap,
  Shield,
  Award,
  Clock,
  DollarSign,
  Briefcase
} from 'lucide-react'
import { claimWizardAI } from '../../../services/claimWizardAI'

interface ExpertsProvidersStepProps {
  data: any
  onUpdate: (data: any) => void
}

interface Provider {
  id: string
  type: string
  name: string
  specialties: string[]
  rating: number
  reviewCount: number
  phone: string
  email: string
  website: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  distance: number
  hourlyRate?: number
  availability: string
  certifications: string[]
  yearsExperience: number
  aiRecommended?: boolean
  matchScore?: number
  notes?: string
}

export function ExpertsProvidersStep({ data, onUpdate }: ExpertsProvidersStepProps) {
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>(data.selectedProviders || [])
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([])
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [aiRecommendations, setAiRecommendations] = useState(null)

  const providerTypes = [
    { value: 'contractor', label: 'General Contractor', icon: Hammer },
    { value: 'roofer', label: 'Roofing Specialist', icon: Shield },
    { value: 'plumber', label: 'Plumber', icon: Users },
    { value: 'electrician', label: 'Electrician', icon: Zap },
    { value: 'adjuster', label: 'Public Adjuster', icon: Briefcase },
    { value: 'attorney', label: 'Attorney', icon: Award },
    { value: 'engineer', label: 'Structural Engineer', icon: Users },
    { value: 'appraiser', label: 'Appraiser', icon: DollarSign },
    { value: 'restoration', label: 'Restoration Company', icon: Users },
    { value: 'inspector', label: 'Inspector', icon: Search }
  ]

  // Update parent when selections change
  useEffect(() => {
    onUpdate({ selectedProviders, aiRecommendations })
  }, [selectedProviders, aiRecommendations, onUpdate])

  // Load AI recommendations on component mount
  useEffect(() => {
    if (data.lossDetails && data.mailingAddress && availableProviders.length === 0) {
      loadAIRecommendations()
    }
  }, [data.lossDetails, data.mailingAddress])

  const loadAIRecommendations = async () => {
    if (!data.lossDetails?.causeOfLoss || !data.mailingAddress?.zipCode) {
      return
    }

    setLoadingProviders(true)
    try {
      const recommendations = await claimWizardAI.recommendProviders({
        causeOfLoss: data.lossDetails.causeOfLoss,
        damageTypes: data.damageAnalysis?.damageTypes || [],
        propertyType: data.mailingAddress.propertyType,
        zipCode: data.mailingAddress.zipCode,
        claimValue: data.settlementPrediction?.estimatedAmount || 50000
      })

      setAvailableProviders(recommendations.providers)
      setAiRecommendations({
        totalProviders: recommendations.providers.length,
        topMatches: recommendations.providers.slice(0, 3),
        reasoning: recommendations.reasoning,
        urgentNeeds: recommendations.urgentNeeds
      })

    } catch (error) {
      console.error('Error loading provider recommendations:', error)
    } finally {
      setLoadingProviders(false)
    }
  }

  const addProvider = (provider: Provider) => {
    if (!selectedProviders.find(p => p.id === provider.id)) {
      setSelectedProviders(prev => [...prev, provider])
    }
  }

  const removeProvider = (providerId: string) => {
    setSelectedProviders(prev => prev.filter(p => p.id !== providerId))
  }

  const filteredProviders = availableProviders.filter(provider => {
    const matchesType = filterType === 'all' || provider.type === filterType
    const matchesSearch = (provider.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (provider.specialties || []).some(s => (s?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
    const notSelected = !selectedProviders.find(p => p.id === provider.id)
    
    return matchesType && matchesSearch && notSelected
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProviderIcon = (type: string) => {
    const providerType = providerTypes.find(t => t.value === type)
    return providerType?.icon || Users
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendations Header */}
      {loadingProviders ? (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
              <div>
                <div className="font-medium text-purple-900">AI Provider Matching in Progress</div>
                <div className="text-sm text-purple-700">
                  Analyzing your claim and finding the best local experts...
                </div>
              </div>
              <LoadingSpinner size="sm" />
            </div>
          </CardContent>
        </Card>
      ) : aiRecommendations && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              AI Provider Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{aiRecommendations.totalProviders}</div>
                <div className="text-sm text-green-600">Qualified Providers Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{aiRecommendations.topMatches.length}</div>
                <div className="text-sm text-green-600">Top Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {aiRecommendations.topMatches[0]?.matchScore || 95}%
                </div>
                <div className="text-sm text-green-600">Best Match Score</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-green-900 mb-2">AI Analysis:</h4>
              <p className="text-sm text-green-800">{aiRecommendations.reasoning}</p>
            </div>

            {aiRecommendations.urgentNeeds.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Urgent Needs
                </h4>
                <div className="space-y-1">
                  {aiRecommendations.urgentNeeds.map((need, index) => (
                    <div key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {need}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Providers */}
      {selectedProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Selected Providers ({selectedProviders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedProviders.map(provider => (
                <div key={provider.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        {React.createElement(getProviderIcon(provider.type), {
                          className: "h-5 w-5 text-green-600"
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          {provider.aiRecommended && (
                            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <Brain className="h-3 w-3" />
                              AI Match
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {providerTypes.find(t => t.value === provider.type)?.label}
                        </div>
                        
                        {renderStarRating(provider.rating)}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {provider.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {provider.distance} miles
                          </div>
                          {provider.hourlyRate && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatCurrency(provider.hourlyRate)}/hr
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProvider(provider.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Provider Types</option>
              {providerTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <Button
              onClick={loadAIRecommendations}
              disabled={loadingProviders}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Refresh AI Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            Available Providers ({filteredProviders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProviders.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Providers Found</h3>
              <p className="text-gray-600 mb-4">
                {loadingProviders 
                  ? "Loading AI recommendations..." 
                  : "Try adjusting your search criteria or refresh AI recommendations"
                }
              </p>
              {!loadingProviders && (
                <Button onClick={loadAIRecommendations} className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Load AI Recommendations
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProviders.map(provider => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {React.createElement(getProviderIcon(provider.type), {
                          className: "h-5 w-5 text-blue-600"
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          {provider.aiRecommended && (
                            <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <Brain className="h-3 w-3" />
                              AI Recommended
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {providerTypes.find(t => t.value === provider.type)?.label}
                        </div>
                        
                        {renderStarRating(provider.rating)}
                      </div>
                    </div>
                    
                    {provider.matchScore && (
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{provider.matchScore}%</div>
                        <div className="text-xs text-gray-600">Match</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.address.city}, {provider.address.state} • {provider.distance} miles</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{provider.phone}</span>
                    </div>
                    
                    {provider.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{provider.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>{provider.yearsExperience} years</span>
                      </div>
                      
                      {provider.hourlyRate && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(provider.hourlyRate)}/hr</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{provider.availability}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Specialties:</div>
                    <div className="flex flex-wrap gap-1">
                      {provider.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {provider.certifications.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Certifications:</div>
                      <div className="flex flex-wrap gap-1">
                        {provider.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => addProvider(provider)}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Select Provider
                    </Button>
                    
                    {provider.website && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Visit
                      </Button>
                    )}
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
