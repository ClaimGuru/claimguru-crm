import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Switch } from '../../ui/switch'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { FileText, Shield, User, Scale } from 'lucide-react'

interface PolicyInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function PolicyInformationStep({ data, onUpdate }: PolicyInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Policy Status
    policyStatus: data.policyStatus || '',
    isForcedPlacedPolicy: data.isForcedPlacedPolicy || false,
    
    // Insurance Agent & Agency
    agencyName: data.agencyName || '',
    agencyLicenseNumber: data.agencyLicenseNumber || '',
    agentFirstName: data.agentFirstName || '',
    agentLastName: data.agentLastName || '',
    agentEmail: data.agentEmail || '',
    agentPhoneNumbers: data.agentPhoneNumbers || [{
      id: 'agent_primary',
      type: 'office',
      number: '',
      extension: '',
      isPrimary: true
    }],
    
    // Policy Details
    effectiveDate: data.effectiveDate || '',
    expirationDate: data.expirationDate || '',
    policyType: data.policyType || '',
    policyTypeOther: data.policyTypeOther || '',
    formType: data.formType || '',
    formTypeOther: data.formTypeOther || '',
    
    // Coverage Information
    coverageA: data.coverageA || '',
    coverageB: data.coverageB || '',
    coverageC: data.coverageC || '',
    coverageD: data.coverageD || '',
    
    // Additional Coverages
    additionalCoverages: data.additionalCoverages || {
      ordinanceOrLaw: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageA' },
      moldCoverage: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
      waterBackup: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
      identityTheft: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
      inflationGuard: { enabled: false, limit: '', isPercentage: true, coverage: 'coverageA' },
      replacementCost: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
      extendedReplacementCost: { enabled: false, limit: '', isPercentage: true, coverage: 'coverageA' },
      other: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageA' },
      otherDescription: ''
    },
    
    // Deductibles
    deductibles: data.deductibles || {
      allOtherPerils: { amount: '', isPercentage: false, coverage: 'coverageA' },
      windHail: { amount: '', isPercentage: false, coverage: 'coverageA' },
      hurricane: { amount: '', isPercentage: false, coverage: 'coverageA' },
      earthquake: { amount: '', isPercentage: false, coverage: 'coverageA' },
      flood: { amount: '', isPercentage: false, coverage: 'coverageA' },
      other: { amount: '', isPercentage: false, coverage: 'coverageA' },
      otherDescription: ''
    },
    
    // Alternative Dispute Resolution
    disputeResolution: data.disputeResolution || {
      mediation: false,
      arbitration: false,
      appraisal: false,
      litigation: false,
      appraisalType: '', // 'bilateral' or 'unilateral'
      // Appraisal fields
      opposingAppraiser: '',
      assignedAppraiser: '',
      umpire: '',
      // Arbitration/Mediation fields
      arbitrator: '',
      mediator: '',
      // Litigation field
      assignedLitigator: ''
    }
  })

  // Sync local state with props when data changes
  useEffect(() => {
    setStepData({
      // Policy Status
      policyStatus: data.policyStatus || '',
      isForcedPlacedPolicy: data.isForcedPlacedPolicy || false,
      
      // Insurance Agent & Agency
      agencyName: data.agencyName || '',
      agencyLicenseNumber: data.agencyLicenseNumber || '',
      agentFirstName: data.agentFirstName || '',
      agentLastName: data.agentLastName || '',
      agentEmail: data.agentEmail || '',
      agentPhoneNumbers: data.agentPhoneNumbers || [{
        id: 'agent_primary',
        type: 'office',
        number: '',
        extension: '',
        isPrimary: true
      }],
      
      // Policy Details
      effectiveDate: data.effectiveDate || '',
      expirationDate: data.expirationDate || '',
      policyType: data.policyType || '',
      policyTypeOther: data.policyTypeOther || '',
      formType: data.formType || '',
      formTypeOther: data.formTypeOther || '',
      
      // Coverage Information
      coverageA: data.coverageA || '',
      coverageB: data.coverageB || '',
      coverageC: data.coverageC || '',
      coverageD: data.coverageD || '',
      
      // Additional Coverages
      additionalCoverages: data.additionalCoverages || {
        ordinanceOrLaw: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageA' },
        moldCoverage: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
        waterBackup: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
        identityTheft: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
        inflationGuard: { enabled: false, limit: '', isPercentage: true, coverage: 'coverageA' },
        replacementCost: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageC' },
        extendedReplacementCost: { enabled: false, limit: '', isPercentage: true, coverage: 'coverageA' },
        other: { enabled: false, limit: '', isPercentage: false, coverage: 'coverageA' },
        otherDescription: ''
      },
      
      // Deductibles
      deductibles: data.deductibles || {
        allOtherPerils: { amount: '', isPercentage: false, coverage: 'coverageA' },
        windHail: { amount: '', isPercentage: false, coverage: 'coverageA' },
        hurricane: { amount: '', isPercentage: false, coverage: 'coverageA' },
        earthquake: { amount: '', isPercentage: false, coverage: 'coverageA' },
        flood: { amount: '', isPercentage: false, coverage: 'coverageA' },
        other: { amount: '', isPercentage: false, coverage: 'coverageA' },
        otherDescription: ''
      },
      
      // Alternative Dispute Resolution
      disputeResolution: data.disputeResolution || {
        mediation: false,
        arbitration: false,
        appraisal: false,
        litigation: false,
        appraisalType: '',
        // Appraisal fields
        opposingAppraiser: '',
        assignedAppraiser: '',
        umpire: '',
        // Arbitration/Mediation fields
        arbitrator: '',
        mediator: '',
        // Litigation field
        assignedLitigator: ''
      }
    })
  }, [data])

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const updateNestedField = (section: string, field: string, value: any) => {
    const updatedData = {
      ...stepData,
      [section]: {
        ...stepData[section],
        [field]: value
      }
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Auto-calculate expiration date (1 year from effective date)
  const handleEffectiveDateChange = (date: string) => {
    let expirationDate = ''
    
    if (date) {
      const effectiveDateObj = new Date(date)
      const expirationDateObj = new Date(effectiveDateObj.getFullYear() + 1, effectiveDateObj.getMonth(), effectiveDateObj.getDate())
      expirationDate = expirationDateObj.toISOString().split('T')[0]
    }
    
    // Update both dates in a single call to prevent race conditions
    const updatedData = { 
      ...stepData, 
      effectiveDate: date,
      expirationDate: expirationDate
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Calculate percentage-based amounts
  const calculatePercentageAmount = (percentage: string, coverageType: string) => {
    const coverageValue = parseCurrencyToNumber(stepData[coverageType] || '0')
    const percentageValue = parseFloat(percentage)
    
    if (isNaN(coverageValue) || isNaN(percentageValue) || coverageValue === 0) {
      return ''
    }
    
    const calculatedAmount = (coverageValue * percentageValue) / 100
    return formatCurrency(calculatedAmount)
  }

  // Parse currency string to number
  const parseCurrencyToNumber = (currencyString: string): number => {
    return parseFloat(currencyString.replace(/[^\d.]/g, '')) || 0
  }

  // Format number as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Update deductible with auto-calculation
  const updateDeductibleField = (deductibleType: string, field: string, value: any) => {
    const updatedDeductibles = {
      ...stepData.deductibles,
      [deductibleType]: {
        ...stepData.deductibles[deductibleType],
        [field]: value
      }
    }

    // If percentage toggle was changed and it's now percentage, calculate amount
    if (field === 'isPercentage' && value && stepData.deductibles[deductibleType].amount) {
      const calculatedAmount = calculatePercentageAmount(
        stepData.deductibles[deductibleType].amount,
        stepData.deductibles[deductibleType].coverage
      )
      if (calculatedAmount) {
        updatedDeductibles[deductibleType].calculatedAmount = calculatedAmount
      }
    }

    // If amount changed and it's percentage mode, recalculate
    if (field === 'amount' && stepData.deductibles[deductibleType].isPercentage) {
      const calculatedAmount = calculatePercentageAmount(
        value,
        stepData.deductibles[deductibleType].coverage
      )
      if (calculatedAmount) {
        updatedDeductibles[deductibleType].calculatedAmount = calculatedAmount
      }
    }

    const updatedData = {
      ...stepData,
      deductibles: updatedDeductibles
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  // Update additional coverage with auto-calculation
  const updateAdditionalCoverageField = (coverageType: string, field: string, value: any) => {
    const updatedCoverages = {
      ...stepData.additionalCoverages,
      [coverageType]: {
        ...stepData.additionalCoverages[coverageType],
        [field]: value
      }
    }

    // If percentage toggle was changed and it's now percentage, calculate amount
    if (field === 'isPercentage' && value && stepData.additionalCoverages[coverageType].limit) {
      const calculatedAmount = calculatePercentageAmount(
        stepData.additionalCoverages[coverageType].limit,
        stepData.additionalCoverages[coverageType].coverage
      )
      if (calculatedAmount) {
        updatedCoverages[coverageType].calculatedAmount = calculatedAmount
      }
    }

    // If limit changed and it's percentage mode, recalculate
    if (field === 'limit' && stepData.additionalCoverages[coverageType].isPercentage) {
      const calculatedAmount = calculatePercentageAmount(
        value,
        stepData.additionalCoverages[coverageType].coverage
      )
      if (calculatedAmount) {
        updatedCoverages[coverageType].calculatedAmount = calculatedAmount
      }
    }

    const updatedData = {
      ...stepData,
      additionalCoverages: updatedCoverages
    }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const policyTypes = [
    'HO-3 (Special Form)',
    'HO-4 (Renters)',
    'HO-6 (Condo)',
    'HO-5 (Comprehensive)',
    'HO-8 (Modified Coverage)',
    'Commercial Property',
    'Dwelling Fire',
    'Other'
  ]

  const formTypes = [
    'ISO HO-3',
    'ISO HO-4',
    'ISO HO-6',
    'Company Specific',
    'State Specific',
    'Other'
  ]

  const policyStatuses = [
    'Active',
    'Inactive', 
    'Pending',
    'Suspended',
    'Cancelled',
    'Expired',
    'In Renewal',
    'Force Placed',
    'Lapsed',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Policy Status & Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Status <span className="text-red-500">*</span>
            </label>
            <select
              value={stepData.policyStatus}
              onChange={(e) => updateField('policyStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select policy status</option>
              {policyStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          {/* Keep the original toggle for backward compatibility */}
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.isForcedPlacedPolicy}
              onCheckedChange={(checked) => {
                updateField('isForcedPlacedPolicy', checked)
                // Auto-set policy status if force placed is selected
                if (checked) {
                  updateField('policyStatus', 'Force Placed')
                }
              }}
            />
            <span className="text-sm font-medium text-gray-700">Forced Placed Policy</span>
          </div>
        </CardContent>
      </Card>

      {/* Insurance Agent & Agency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Insurance Agent & Agency Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency Name
              </label>
              <Input
                type="text"
                value={stepData.agencyName}
                onChange={(e) => updateField('agencyName', e.target.value)}
                placeholder="Insurance agency name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agency License Number
              </label>
              <Input
                type="text"
                value={stepData.agencyLicenseNumber}
                onChange={(e) => updateField('agencyLicenseNumber', e.target.value)}
                placeholder="License number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent First Name
              </label>
              <Input
                type="text"
                value={stepData.agentFirstName}
                onChange={(e) => updateField('agentFirstName', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Last Name
              </label>
              <Input
                type="text"
                value={stepData.agentLastName}
                onChange={(e) => updateField('agentLastName', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <StandardizedPhoneInput
                phoneNumbers={stepData.agentPhoneNumbers}
                onChange={(phoneNumbers) => updateField('agentPhoneNumbers', phoneNumbers)}
                label="Agent Phone Number"
                allowMultiple={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Email
              </label>
              <Input
                type="email"
                value={stepData.agentEmail}
                onChange={(e) => updateField('agentEmail', e.target.value)}
                placeholder="agent@agency.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Policy Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={stepData.effectiveDate}
                onChange={(e) => handleEffectiveDateChange(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={stepData.expirationDate}
                onChange={(e) => updateField('expirationDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Type
              </label>
              <select
                value={stepData.policyType}
                onChange={(e) => updateField('policyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select policy type</option>
                {policyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {stepData.policyType === 'Other' && (
                <div className="mt-2">
                  <Input
                    type="text"
                    value={stepData.policyTypeOther}
                    onChange={(e) => updateField('policyTypeOther', e.target.value)}
                    placeholder="Specify other policy type"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Type
              </label>
              <select
                value={stepData.formType}
                onChange={(e) => updateField('formType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select form type</option>
                {formTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {stepData.formType === 'Other' && (
                <div className="mt-2">
                  <Input
                    type="text"
                    value={stepData.formTypeOther}
                    onChange={(e) => updateField('formTypeOther', e.target.value)}
                    placeholder="Specify other form type"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Coverage Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage A (Dwelling)
              </label>
              <Input
                type="text"
                value={stepData.coverageA}
                onChange={(e) => updateField('coverageA', e.target.value)}
                placeholder="$500,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage B (Other Structures)
              </label>
              <Input
                type="text"
                value={stepData.coverageB}
                onChange={(e) => updateField('coverageB', e.target.value)}
                placeholder="$50,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage C (Personal Property)
              </label>
              <Input
                type="text"
                value={stepData.coverageC}
                onChange={(e) => updateField('coverageC', e.target.value)}
                placeholder="$350,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage D (Loss of Use)
              </label>
              <Input
                type="text"
                value={stepData.coverageD}
                onChange={(e) => updateField('coverageD', e.target.value)}
                placeholder="$100,000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Coverages */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Coverages Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(stepData.additionalCoverages).map(([key, coverageData]) => {
              if (key === 'otherDescription') return null
              
              const coverage = coverageData as any
              const labels = {
                ordinanceOrLaw: 'Ordinance or Law',
                moldCoverage: 'Mold Coverage',
                waterBackup: 'Water Backup',
                identityTheft: 'Identity Theft',
                inflationGuard: 'Inflation Guard',
                replacementCost: 'Replacement Cost',
                extendedReplacementCost: 'Extended Replacement Cost',
                other: 'Other'
              }
              
              return (
                <div key={key} className="border rounded-lg p-4 space-y-3">
                  {/* Coverage Toggle */}
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={coverage.enabled || false}
                      onCheckedChange={(checked) => updateAdditionalCoverageField(key, 'enabled', checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">{labels[key]}</span>
                  </div>
                  
                  {/* Coverage Configuration */}
                  {coverage.enabled && (
                    <div className="ml-6 space-y-3 bg-gray-50 rounded p-3">
                      {/* Percentage/Dollar Toggle */}
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`${key}_type`}
                            checked={!coverage.isPercentage}
                            onChange={() => updateAdditionalCoverageField(key, 'isPercentage', false)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Dollar Amount</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`${key}_type`}
                            checked={coverage.isPercentage || false}
                            onChange={() => updateAdditionalCoverageField(key, 'isPercentage', true)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm">Percentage</span>
                        </label>
                      </div>
                      
                      {/* Amount/Percentage Input */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {coverage.isPercentage ? 'Percentage' : 'Limit Amount'}
                          </label>
                          <Input
                            type="text"
                            value={coverage.limit || ''}
                            onChange={(e) => updateAdditionalCoverageField(key, 'limit', e.target.value)}
                            placeholder={coverage.isPercentage ? '10%' : '$25,000'}
                          />
                        </div>
                        {coverage.isPercentage && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Calculate from
                            </label>
                            <select
                              value={coverage.coverage || 'coverageA'}
                              onChange={(e) => updateAdditionalCoverageField(key, 'coverage', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="coverageA">Coverage A (Dwelling)</option>
                              <option value="coverageB">Coverage B (Other Structures)</option>
                              <option value="coverageC">Coverage C (Personal Property)</option>
                              <option value="coverageD">Coverage D (Loss of Use)</option>
                            </select>
                          </div>
                        )}
                      </div>
                      
                      {/* Calculated Amount Display */}
                      {coverage.isPercentage && coverage.calculatedAmount && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <span className="text-xs font-medium text-blue-800">
                            Calculated Amount: {coverage.calculatedAmount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {stepData.additionalCoverages.other?.enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Coverage Description
              </label>
              <Input
                type="text"
                value={stepData.additionalCoverages.otherDescription}
                onChange={(e) => updateNestedField('additionalCoverages', 'otherDescription', e.target.value)}
                placeholder="Describe other coverage"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deductibles */}
      <Card>
        <CardHeader>
          <CardTitle>Deductibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(stepData.deductibles).map(([key, deductibleData]) => {
            if (key === 'otherDescription') return null
            
            const deductible = deductibleData as any
            const labels = {
              allOtherPerils: 'All Other Perils',
              windHail: 'Wind/Hail',
              hurricane: 'Hurricane',
              earthquake: 'Earthquake',
              flood: 'Flood',
              other: 'Other'
            }
            
            return (
              <div key={key} className="border rounded-lg p-4 space-y-3">
                {/* Deductible Label */}
                <div>
                  <span className="text-sm font-medium text-gray-700">{labels[key]}</span>
                </div>
                
                {/* Percentage/Dollar Toggle */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`${key}_type`}
                      checked={!deductible.isPercentage}
                      onChange={() => updateDeductibleField(key, 'isPercentage', false)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Dollar Amount</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`${key}_type`}
                      checked={deductible.isPercentage || false}
                      onChange={() => updateDeductibleField(key, 'isPercentage', true)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Percentage</span>
                  </label>
                </div>
                
                {/* Amount/Percentage Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {deductible.isPercentage ? 'Percentage' : 'Deductible Amount'}
                    </label>
                    <Input
                      type="text"
                      value={deductible.amount || ''}
                      onChange={(e) => updateDeductibleField(key, 'amount', e.target.value)}
                      placeholder={deductible.isPercentage ? '2%' : '$2,500'}
                    />
                  </div>
                  {deductible.isPercentage && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Calculate from
                      </label>
                      <select
                        value={deductible.coverage || 'coverageA'}
                        onChange={(e) => updateDeductibleField(key, 'coverage', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="coverageA">Coverage A (Dwelling)</option>
                        <option value="coverageB">Coverage B (Other Structures)</option>
                        <option value="coverageC">Coverage C (Personal Property)</option>
                        <option value="coverageD">Coverage D (Loss of Use)</option>
                      </select>
                    </div>
                  )}
                </div>
                
                {/* Calculated Amount Display */}
                {deductible.isPercentage && deductible.calculatedAmount && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <span className="text-xs font-medium text-green-800">
                      Calculated Deductible: {deductible.calculatedAmount}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
          
          {stepData.deductibles.other?.amount && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Deductible Description
              </label>
              <Input
                type="text"
                value={stepData.deductibles.otherDescription}
                onChange={(e) => updateNestedField('deductibles', 'otherDescription', e.target.value)}
                placeholder="Describe other deductible"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Dispute Resolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Alternative Dispute Resolution Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.mediation}
                  onCheckedChange={(checked) => updateNestedField('disputeResolution', 'mediation', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Mediation</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.arbitration}
                  onCheckedChange={(checked) => updateNestedField('disputeResolution', 'arbitration', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Arbitration</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.appraisal}
                  onCheckedChange={(checked) => updateNestedField('disputeResolution', 'appraisal', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Appraisal</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.litigation}
                  onCheckedChange={(checked) => updateNestedField('disputeResolution', 'litigation', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Litigation</span>
              </div>
            </div>
            
            {/* Mediation Fields */}
            {stepData.disputeResolution.mediation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-3">Mediation Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mediator
                  </label>
                  <Input
                    type="text"
                    value={stepData.disputeResolution.mediator}
                    onChange={(e) => updateNestedField('disputeResolution', 'mediator', e.target.value)}
                    placeholder="Mediator name or firm"
                  />
                </div>
              </div>
            )}
            
            {/* Arbitration Fields */}
            {stepData.disputeResolution.arbitration && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-sm font-medium text-purple-800 mb-3">Arbitration Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arbitrator
                  </label>
                  <Input
                    type="text"
                    value={stepData.disputeResolution.arbitrator}
                    onChange={(e) => updateNestedField('disputeResolution', 'arbitrator', e.target.value)}
                    placeholder="Arbitrator name or firm"
                  />
                </div>
              </div>
            )}
            
            {/* Appraisal Fields */}
            {stepData.disputeResolution.appraisal && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-3">Appraisal Details</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appraisal Type
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="appraisalType"
                        value="bilateral"
                        checked={stepData.disputeResolution.appraisalType === 'bilateral'}
                        onChange={(e) => updateNestedField('disputeResolution', 'appraisalType', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Agreed (Bilateral)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="appraisalType"
                        value="unilateral"
                        checked={stepData.disputeResolution.appraisalType === 'unilateral'}
                        onChange={(e) => updateNestedField('disputeResolution', 'appraisalType', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Demanded (Unilateral)</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opposing Appraiser
                    </label>
                    <Input
                      type="text"
                      value={stepData.disputeResolution.opposingAppraiser}
                      onChange={(e) => updateNestedField('disputeResolution', 'opposingAppraiser', e.target.value)}
                      placeholder="Opposing appraiser name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Appraiser
                    </label>
                    <Input
                      type="text"
                      value={stepData.disputeResolution.assignedAppraiser}
                      onChange={(e) => updateNestedField('disputeResolution', 'assignedAppraiser', e.target.value)}
                      placeholder="Assigned appraiser name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Umpire
                    </label>
                    <Input
                      type="text"
                      value={stepData.disputeResolution.umpire}
                      onChange={(e) => updateNestedField('disputeResolution', 'umpire', e.target.value)}
                      placeholder="Umpire name"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Litigation Fields */}
            {stepData.disputeResolution.litigation && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="text-sm font-medium text-red-800 mb-3">Litigation Details</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Litigator/Attorney
                  </label>
                  <Input
                    type="text"
                    value={stepData.disputeResolution.assignedLitigator}
                    onChange={(e) => updateNestedField('disputeResolution', 'assignedLitigator', e.target.value)}
                    placeholder="Attorney name or law firm"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PolicyInformationStep