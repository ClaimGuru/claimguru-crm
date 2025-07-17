import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { AddressAutocomplete } from '../../ui/AddressAutocomplete'
import { 
  Shield, 
  Brain, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Sparkles,
  Building,
  Phone,
  MapPin,
  User,
  Zap
} from 'lucide-react'
import { formatPhoneNumber, getPhoneInputProps } from '../../../utils/phoneUtils'
import { InsurerPersonnelInformation } from './InsurerPersonnelInformation'

interface InsuranceInfoStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function InsuranceInfoStep({ data, onUpdate }: InsuranceInfoStepProps) {
  const [insuranceInfo, setInsuranceInfo] = useState(data.insuranceInfo || {
    carrier: '',
    policyNumber: '',
    effectiveDate: '',
    expirationDate: '',
    claimNumber: '',
    reportedDate: '',
    agentInfo: {
      agencyName: '',
      agentFirstName: '',
      agentLastName: '',
      agentEmail: '',
      agentPhone: '',
      agencyLicenseNumber: '',
      agentAddress: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    companyAddress: {
      addressLine1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })

  const [mortgageInfo, setMortgageInfo] = useState(data.mortgageInfo || {
    hasMortgage: false,
    mortgageCompany: '',
    loanNumber: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    address: {
      addressLine1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  })

  const [insurerPersonnel, setInsurerPersonnel] = useState(data.insurerPersonnel || [])

  const [coverageAnalysis, setCoverageAnalysis] = useState(null)
  const [aiValidating, setAiValidating] = useState(false)

  // Auto-populate from AI extracted data
  useEffect(() => {
    if (data.aiExtractedData?.extractedData) {
      const extractedData = data.aiExtractedData.extractedData
      
      setInsuranceInfo(prev => ({
        ...prev,
        carrier: extractedData.insuranceCarrier || prev.carrier,
        policyNumber: extractedData.policyNumber || prev.policyNumber,
        effectiveDate: extractedData.effectiveDate || prev.effectiveDate,
        expirationDate: extractedData.expirationDate || prev.expirationDate,
        agentInfo: {
          ...prev.agentInfo,
          agentFirstName: extractedData.agentFirstName || prev.agentInfo?.agentFirstName || '',
          agentLastName: extractedData.agentLastName || prev.agentInfo?.agentLastName || '',
          agentEmail: extractedData.agentEmail || prev.agentInfo?.agentEmail || '',
          agentPhone: extractedData.agentPhone || prev.agentInfo?.agentPhone || '',
          agencyName: extractedData.agencyName || prev.agentInfo?.agencyName || ''
        }
      }))

      // Perform AI coverage analysis
      if (extractedData.coverages && !coverageAnalysis) {
        performCoverageAnalysis(extractedData)
      }
    }
  }, [data.aiExtractedData])

  // Update parent component when data changes
  useEffect(() => {
    onUpdate({
      insuranceInfo,
      mortgageInfo,
      coverageAnalysis,
      insurerPersonnel
    })
  }, [insuranceInfo, mortgageInfo, coverageAnalysis, insurerPersonnel, onUpdate])

  const performCoverageAnalysis = async (extractedData) => {
    setAiValidating(true)
    try {
      // Simulate AI coverage analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const analysis = {
        adequateCoverage: true,
        riskFactors: [
          "High deductible amount may impact claim value",
          "Personal property coverage limit is relatively low"
        ],
        recommendations: [
          "Consider additional living expenses coverage enhancement",
          "Review replacement cost vs actual cash value provisions"
        ],
        estimatedClaim: {
          min: 15000,
          max: 45000,
          mostLikely: 28000
        }
      }
      
      setCoverageAnalysis(analysis)
    } catch (error) {
      console.error('Error performing coverage analysis:', error)
    } finally {
      setAiValidating(false)
    }
  }

  const handleInputChange = (section, field, value) => {
    if (section === 'insurance') {
      setInsuranceInfo(prev => ({ ...prev, [field]: value }))
    } else if (section === 'agent') {
      setInsuranceInfo(prev => ({
        ...prev,
        agentInfo: { ...prev.agentInfo, [field]: value }
      }))
    } else if (section === 'mortgage') {
      setMortgageInfo(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleAddressChange = (section, field, value) => {
    if (section === 'insurance') {
      setInsuranceInfo(prev => ({
        ...prev,
        companyAddress: { ...prev.companyAddress, [field]: value }
      }))
    } else if (section === 'agent') {
      setInsuranceInfo(prev => ({
        ...prev,
        agentInfo: {
          ...prev.agentInfo,
          agentAddress: { 
            ...((prev.agentInfo && prev.agentInfo.agentAddress) || {}), 
            [field]: value 
          }
        }
      }))
    } else if (section === 'mortgage') {
      setMortgageInfo(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const insuranceCarriers = [
    'State Farm', 'Allstate', 'GEICO', 'Progressive', 'USAA', 'Liberty Mutual',
    'Farmers', 'Nationwide', 'American Family', 'Travelers', 'The Hartford',
    'Auto-Owners', 'Erie Insurance', 'Country Financial', 'Amica', 'Other'
  ]

  return (
    <div className="space-y-6">
      {/* AI Auto-Population Notice */}
      {data.aiExtractedData && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">AI Auto-Population Complete</div>
                <div className="text-sm text-purple-700">
                  Insurance information has been automatically extracted from your policy document
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Carrier *
              </label>
              <select
                value={insuranceInfo.carrier}
                onChange={(e) => handleInputChange('insurance', 'carrier', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select carrier</option>
                {insuranceCarriers.map(carrier => (
                  <option key={carrier} value={carrier}>{carrier}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                value={insuranceInfo.policyNumber}
                onChange={(e) => handleInputChange('insurance', 'policyNumber', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Policy number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Effective Date *
              </label>
              <input
                type="date"
                value={insuranceInfo.effectiveDate}
                onChange={(e) => handleInputChange('insurance', 'effectiveDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Expiration Date *
              </label>
              <input
                type="date"
                value={insuranceInfo.expirationDate}
                onChange={(e) => handleInputChange('insurance', 'expirationDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Number
              </label>
              <input
                type="text"
                value={insuranceInfo.claimNumber}
                onChange={(e) => handleInputChange('insurance', 'claimNumber', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Claim number (if available)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Reported to Insurance
              </label>
              <input
                type="date"
                value={insuranceInfo.reportedDate}
                onChange={(e) => handleInputChange('insurance', 'reportedDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Agent Information */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Insurance Agent & Agency Information
            </h4>
            
            {/* Agency Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                Agency Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.agentInfo?.agencyName || ''}
                    onChange={(e) => handleInputChange('agent', 'agencyName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Insurance agency name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency License Number
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.agentInfo?.agencyLicenseNumber || ''}
                    onChange={(e) => handleInputChange('agent', 'agencyLicenseNumber', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="License number"
                  />
                </div>
              </div>
            </div>

            {/* Agent Personal Information */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                Agent Details
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent First Name *
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.agentInfo?.agentFirstName || ''}
                    onChange={(e) => handleInputChange('agent', 'agentFirstName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Last Name *
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.agentInfo?.agentLastName || ''}
                    onChange={(e) => handleInputChange('agent', 'agentLastName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Phone *
                  </label>
                  <input
                    type="tel"
                    value={insuranceInfo.agentInfo?.agentPhone || ''}
                    onChange={(e) => handleInputChange('agent', 'agentPhone', formatPhoneNumber(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="(555) 123-4567"
                    {...getPhoneInputProps()}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Email *
                  </label>
                  <input
                    type="email"
                    value={insuranceInfo.agentInfo?.agentEmail || ''}
                    onChange={(e) => handleInputChange('agent', 'agentEmail', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="agent@insurance.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Agent Address */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                Agent/Agency Address
              </h5>
              
              <div className="space-y-4">
                <AddressAutocomplete
                  value={insuranceInfo.agentInfo?.agentAddress?.addressLine1 || ''}
                  onChange={(address, details) => {
                    console.log('🏢 Agent Address Selected:', { address, details })
                    handleAddressChange('agent', 'addressLine1', address)
                    
                    if (details?.address_components) {
                      const components = details.address_components
                      console.log('📍 Address Components:', components)
                      
                      // Extract street number and route for addressLine1
                      const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || ''
                      const route = components.find(c => c.types.includes('route'))?.long_name || ''
                      const fullStreet = `${streetNumber} ${route}`.trim()
                      
                      // Extract city (locality, sublocality, or administrative_area_level_3)
                      const city = components.find(c => c.types.includes('locality'))?.long_name || 
                                  components.find(c => c.types.includes('sublocality'))?.long_name ||
                                  components.find(c => c.types.includes('administrative_area_level_3'))?.long_name || ''
                      
                      // Extract state (administrative_area_level_1)
                      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || ''
                      
                      // Extract zip code (postal_code)
                      const zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || ''
                      
                      console.log('📊 Parsed Address Components:', { fullStreet, city, state, zipCode })
                      
                      // Update fields with parsed components
                      if (fullStreet) handleAddressChange('agent', 'addressLine1', fullStreet)
                      if (city) handleAddressChange('agent', 'city', city)
                      if (state) handleAddressChange('agent', 'state', state)
                      if (zipCode) handleAddressChange('agent', 'zipCode', zipCode)
                    }
                  }}
                  label="Agent/Agency Address"
                  placeholder="Start typing agent/agency address..."
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={insuranceInfo.agentInfo?.agentAddress?.addressLine2 || ''}
                    onChange={(e) => handleAddressChange('agent', 'addressLine2', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Suite, Unit, etc."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={insuranceInfo.agentInfo?.agentAddress?.city || ''}
                      onChange={(e) => handleAddressChange('agent', 'city', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={insuranceInfo.agentInfo?.agentAddress?.state || ''}
                      onChange={(e) => handleAddressChange('agent', 'state', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={insuranceInfo.agentInfo?.agentAddress?.zipCode || ''}
                      onChange={(e) => handleAddressChange('agent', 'zipCode', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Company Address */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Insurance Company Address
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <AddressAutocomplete
                value={insuranceInfo.companyAddress.addressLine1}
                onChange={(address, details) => {
                  // Update the main address field
                  handleAddressChange('insurance', 'addressLine1', address)
                  
                  // Auto-populate other fields from Google Places details if available
                  if (details?.address_components) {
                    const components = details.address_components
                    const city = components.find(c => c.types.includes('locality'))?.long_name || 
                                components.find(c => c.types.includes('administrative_area_level_3'))?.long_name || ''
                    const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || ''
                    const zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || ''
                    
                    if (city) handleAddressChange('insurance', 'city', city)
                    if (state) handleAddressChange('insurance', 'state', state)
                    if (zipCode) handleAddressChange('insurance', 'zipCode', zipCode)
                    if (details.formatted_address) handleAddressChange('insurance', 'addressLine1', details.formatted_address)
                  }
                }}
                label="Insurance Company Address"
                placeholder="Start typing company address for autocomplete..."
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={insuranceInfo.companyAddress.city}
                  onChange={(e) => handleAddressChange('insurance', 'city', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Auto-filled from address"
                />
                <input
                  type="text"
                  value={insuranceInfo.companyAddress.state}
                  onChange={(e) => handleAddressChange('insurance', 'state', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Auto-filled from address"
                />
                <input
                  type="text"
                  value={insuranceInfo.companyAddress.zipCode}
                  onChange={(e) => handleAddressChange('insurance', 'zipCode', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Auto-filled from address"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Coverage Analysis */}
      {aiValidating && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
              <div>
                <div className="font-medium text-purple-900">AI Coverage Analysis in Progress</div>
                <div className="text-sm text-purple-700">
                  Analyzing policy coverage against potential claim scenarios...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {coverageAnalysis && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-green-600" />
              AI Coverage Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {coverageAnalysis.adequateCoverage ? '✓' : '⚠'}
                </div>
                <div className="text-sm text-green-600">Coverage Assessment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(coverageAnalysis.estimatedClaim.mostLikely)}
                </div>
                <div className="text-sm text-green-600">Estimated Claim Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(coverageAnalysis.estimatedClaim.min)} - {formatCurrency(coverageAnalysis.estimatedClaim.max)}
                </div>
                <div className="text-sm text-green-600">Range</div>
              </div>
            </div>

            {coverageAnalysis.riskFactors.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {coverageAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {coverageAnalysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1">
                  {coverageAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insurer Personnel Information */}
      <InsurerPersonnelInformation
        data={insurerPersonnel}
        onUpdate={setInsurerPersonnel}
        insurerName={insuranceInfo.carrier || 'the insurance company'}
      />

      {/* Mortgage Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-orange-600" />
              Mortgage Information
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mortgageInfo.hasMortgage}
                onChange={(e) => setMortgageInfo(prev => ({ ...prev, hasMortgage: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium">Property has mortgage</span>
            </label>
          </CardTitle>
        </CardHeader>
        {mortgageInfo.hasMortgage && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mortgage Company *
                </label>
                <input
                  type="text"
                  value={mortgageInfo.mortgageCompany}
                  onChange={(e) => handleInputChange('mortgage', 'mortgageCompany', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Mortgage company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Number
                </label>
                <input
                  type="text"
                  value={mortgageInfo.loanNumber}
                  onChange={(e) => handleInputChange('mortgage', 'loanNumber', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Loan number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={mortgageInfo.contactName}
                  onChange={(e) => handleInputChange('mortgage', 'contactName', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Contact person"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={mortgageInfo.contactPhone}
                  onChange={(e) => handleInputChange('mortgage', 'contactPhone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={mortgageInfo.contactEmail}
                  onChange={(e) => handleInputChange('mortgage', 'contactEmail', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="contact@mortgage.com"
                />
              </div>
            </div>

            {/* Mortgage Company Address */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Mortgage Company Address
              </h4>
              
              <div className="grid grid-cols-1 gap-4">
                <AddressAutocomplete
                  value={mortgageInfo.address.addressLine1}
                  onChange={(address, details) => {
                    // Update the main address field
                    handleAddressChange('mortgage', 'addressLine1', address)
                    
                    // Auto-populate other fields from Google Places details if available
                    if (details?.address_components) {
                      const components = details.address_components
                      const city = components.find(c => c.types.includes('locality'))?.long_name || 
                                  components.find(c => c.types.includes('administrative_area_level_3'))?.long_name || ''
                      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || ''
                      const zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || ''
                      
                      if (city) handleAddressChange('mortgage', 'city', city)
                      if (state) handleAddressChange('mortgage', 'state', state)
                      if (zipCode) handleAddressChange('mortgage', 'zipCode', zipCode)
                      if (details.formatted_address) handleAddressChange('mortgage', 'addressLine1', details.formatted_address)
                    }
                  }}
                  label="Mortgage Company Address"
                  placeholder="Start typing mortgage company address for autocomplete..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={mortgageInfo.address.city}
                    onChange={(e) => handleAddressChange('mortgage', 'city', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Auto-filled from address"
                  />
                  <input
                    type="text"
                    value={mortgageInfo.address.state}
                    onChange={(e) => handleAddressChange('mortgage', 'state', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Auto-filled from address"
                  />
                  <input
                    type="text"
                    value={mortgageInfo.address.zipCode}
                    onChange={(e) => handleAddressChange('mortgage', 'zipCode', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Auto-filled from address"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
