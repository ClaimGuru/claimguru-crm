import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Switch } from '../../ui/Switch'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { FileText, Shield, User, Scale } from 'lucide-react'

interface PolicyInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function PolicyInformationStep({ data, onUpdate }: PolicyInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Policy Status
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
    formType: data.formType || '',
    
    // Coverage Information
    coverageA: data.coverageA || '',
    coverageB: data.coverageB || '',
    coverageC: data.coverageC || '',
    coverageD: data.coverageD || '',
    
    // Additional Coverages
    additionalCoverages: data.additionalCoverages || {
      ordinanceOrLaw: false,
      moldCoverage: false,
      waterBackup: false,
      identityTheft: false,
      inflationGuard: false,
      replacementCost: false,
      extendedReplacementCost: false,
      other: false,
      otherDescription: ''
    },
    
    // Deductibles
    deductibles: data.deductibles || {
      allOtherPerils: '',
      windHail: '',
      hurricane: '',
      earthquake: '',
      flood: '',
      other: '',
      otherDescription: ''
    },
    
    // Alternative Dispute Resolution
    disputeResolution: data.disputeResolution || {
      mediation: false,
      arbitration: false,
      appraisal: false,
      litigation: false,
      appraisalType: '' // 'bilateral' or 'unilateral'
    }
  })

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
    updateField('effectiveDate', date)
    
    if (date) {
      const effectiveDate = new Date(date)
      const expirationDate = new Date(effectiveDate.getFullYear() + 1, effectiveDate.getMonth(), effectiveDate.getDate())
      updateField('expirationDate', expirationDate.toISOString().split('T')[0])
    }
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

  return (
    <div className="space-y-6">
      {/* Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Policy Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.isForcedPlacedPolicy}
              onChange={(checked) => updateField('isForcedPlacedPolicy', checked)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <StandardizedPhoneInput
            phoneNumbers={stepData.agentPhoneNumbers}
            onChange={(phoneNumbers) => updateField('agentPhoneNumbers', phoneNumbers)}
            label="Agent Phone Number"
            allowMultiple={false}
          />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stepData.additionalCoverages).map(([key, value]) => {
              if (key === 'otherDescription') return null
              
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
                <div key={key} className="flex items-center gap-3">
                  <Switch
                    checked={value as boolean}
                    onChange={(checked) => updateNestedField('additionalCoverages', key, checked)}
                  />
                  <span className="text-sm font-medium text-gray-700">{labels[key]}</span>
                </div>
              )
            })}
          </div>
          
          {stepData.additionalCoverages.other && (
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                All Other Perils
              </label>
              <Input
                type="text"
                value={stepData.deductibles.allOtherPerils}
                onChange={(e) => updateNestedField('deductibles', 'allOtherPerils', e.target.value)}
                placeholder="$2,500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wind/Hail
              </label>
              <Input
                type="text"
                value={stepData.deductibles.windHail}
                onChange={(e) => updateNestedField('deductibles', 'windHail', e.target.value)}
                placeholder="$5,000 or 2%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hurricane
              </label>
              <Input
                type="text"
                value={stepData.deductibles.hurricane}
                onChange={(e) => updateNestedField('deductibles', 'hurricane', e.target.value)}
                placeholder="$10,000 or 5%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Earthquake
              </label>
              <Input
                type="text"
                value={stepData.deductibles.earthquake}
                onChange={(e) => updateNestedField('deductibles', 'earthquake', e.target.value)}
                placeholder="$25,000 or 10%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flood
              </label>
              <Input
                type="text"
                value={stepData.deductibles.flood}
                onChange={(e) => updateNestedField('deductibles', 'flood', e.target.value)}
                placeholder="$1,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other
              </label>
              <Input
                type="text"
                value={stepData.deductibles.other}
                onChange={(e) => updateNestedField('deductibles', 'other', e.target.value)}
                placeholder="$1,000"
              />
            </div>
          </div>
          
          {stepData.deductibles.other && (
            <div>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.mediation}
                  onChange={(checked) => updateNestedField('disputeResolution', 'mediation', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Mediation</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.arbitration}
                  onChange={(checked) => updateNestedField('disputeResolution', 'arbitration', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Arbitration</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.appraisal}
                  onChange={(checked) => updateNestedField('disputeResolution', 'appraisal', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Appraisal</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={stepData.disputeResolution.litigation}
                  onChange={(checked) => updateNestedField('disputeResolution', 'litigation', checked)}
                />
                <span className="text-sm font-medium text-gray-700">Litigation</span>
              </div>
            </div>
            
            {stepData.disputeResolution.appraisal && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PolicyInformationStep