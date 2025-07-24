import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Switch } from '../../ui/Switch'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { AlertTriangle, MapPin, Cloud, Phone, Shield, Wrench, Home } from 'lucide-react'

interface LossInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function LossInformationStep({ data, onUpdate }: LossInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Loss Details
    reasonForLoss: data.reasonForLoss || '',
    causeOfLoss: data.causeOfLoss || '',
    lossDate: data.lossDate || '',
    lossTime: data.lossTime || '',
    lossSeverity: data.lossSeverity || '',
    
    // Loss Location
    lossLocationAddress: {
      streetAddress1: data.lossLocationAddress?.streetAddress1 || '',
      streetAddress2: data.lossLocationAddress?.streetAddress2 || '',
      city: data.lossLocationAddress?.city || '',
      state: data.lossLocationAddress?.state || '',
      zipCode: data.lossLocationAddress?.zipCode || ''
    },
    lossRoom: data.lossRoom || '',
    
    // Loss Description
    causeDetails: data.causeDetails || '',
    lossDescription: data.lossDescription || '',
    estimatedDamageValue: data.estimatedDamageValue || '',
    
    // Weather Related
    isWeatherRelated: data.isWeatherRelated || false,
    weatherType: data.weatherType || '',
    stormName: data.stormName || '',
    
    // Property Status Toggles
    propertyStatus: {
      femaDisaster: data.propertyStatus?.femaDisaster || false,
      policeCalled: data.propertyStatus?.policeCalled || false,
      policeReportNumber: data.propertyStatus?.policeReportNumber || '',
      propertyUninhabitable: data.propertyStatus?.propertyUninhabitable || false,
      damageToOtherStructures: data.propertyStatus?.damageToOtherStructures || false,
      stateOfEmergency: data.propertyStatus?.stateOfEmergency || false,
      emergencyMitigationRequired: data.propertyStatus?.emergencyMitigationRequired || false,
      damagedPersonalProperty: data.propertyStatus?.damagedPersonalProperty || false,
      additionalLivingExpenses: data.propertyStatus?.additionalLivingExpenses || false,
      repairsMade: data.propertyStatus?.repairsMade || false,
      vendorsRepairsNeeded: data.propertyStatus?.vendorsRepairsNeeded || false
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

  const lossReasons = [
    'Fire',
    'Water Damage',
    'Wind Damage',
    'Hail Damage',
    'Hurricane',
    'Tornado',
    'Flood',
    'Theft',
    'Vandalism',
    'Lightning',
    'Explosion',
    'Collapse',
    'Other'
  ]

  const lossSeverities = [
    'Minor',
    'Moderate',
    'Major',
    'Total Loss'
  ]

  const weatherTypes = [
    'Thunderstorm',
    'Hurricane',
    'Tornado',
    'Derecho',
    'Hail',
    'Ice Storm',
    'Wildfire',
    'Other'
  ]

  const hurricaneNames = [
    'Hurricane Ian (2022)',
    'Hurricane Nicole (2022)',
    'Hurricane Ida (2021)',
    'Hurricane Laura (2020)',
    'Hurricane Sally (2020)',
    'Hurricane Isaias (2020)',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Loss Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Loss Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Loss <span className="text-red-500">*</span>
              </label>
              <select
                value={stepData.reasonForLoss}
                onChange={(e) => updateField('reasonForLoss', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select reason</option>
                {lossReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cause of Loss <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={stepData.causeOfLoss}
                onChange={(e) => updateField('causeOfLoss', e.target.value)}
                placeholder="Specify cause of loss"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Loss <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={stepData.lossDate}
                onChange={(e) => updateField('lossDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time of Loss
              </label>
              <Input
                type="time"
                value={stepData.lossTime}
                onChange={(e) => updateField('lossTime', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity of Loss
              </label>
              <select
                value={stepData.lossSeverity}
                onChange={(e) => updateField('lossSeverity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select severity</option>
                {lossSeverities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loss Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Loss Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StandardizedAddressInput
            address={stepData.lossLocationAddress}
            onChange={(address) => updateField('lossLocationAddress', address)}
            label="Loss Location Address"
            required
            allowAutocomplete
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room/Area of Loss
            </label>
            <Input
              type="text"
              value={stepData.lossRoom}
              onChange={(e) => updateField('lossRoom', e.target.value)}
              placeholder="e.g., Kitchen, Living Room, Roof, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Loss Description */}
      <Card>
        <CardHeader>
          <CardTitle>Loss Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cause Details
            </label>
            <textarea
              value={stepData.causeDetails}
              onChange={(e) => updateField('causeDetails', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detailed description of what caused the loss..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loss Description
            </label>
            <textarea
              value={stepData.lossDescription}
              onChange={(e) => updateField('lossDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the damage and affected areas..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Damage Value
            </label>
            <Input
              type="text"
              value={stepData.estimatedDamageValue}
              onChange={(e) => updateField('estimatedDamageValue', e.target.value)}
              placeholder="$50,000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weather Related */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={stepData.isWeatherRelated}
              onChange={(checked) => updateField('isWeatherRelated', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Is this Weather Related?</span>
          </div>

          {stepData.isWeatherRelated && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weather Type
                  </label>
                  <select
                    value={stepData.weatherType}
                    onChange={(e) => updateField('weatherType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select weather type</option>
                    {weatherTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {(stepData.weatherType === 'Hurricane' || stepData.weatherType === 'Tropical Storm') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storm Name
                    </label>
                    <select
                      value={stepData.stormName}
                      onChange={(e) => updateField('stormName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select storm name</option>
                      {hurricaneNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Property Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.femaDisaster}
                onChange={(checked) => updateNestedField('propertyStatus', 'femaDisaster', checked)}
              />
              <span className="text-sm font-medium text-gray-700">FEMA Declared Disaster</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.policeCalled}
                onChange={(checked) => updateNestedField('propertyStatus', 'policeCalled', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Police Called</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.propertyUninhabitable}
                onChange={(checked) => updateNestedField('propertyStatus', 'propertyUninhabitable', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Property Uninhabitable</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.damageToOtherStructures}
                onChange={(checked) => updateNestedField('propertyStatus', 'damageToOtherStructures', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Damage to Other Structures</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.stateOfEmergency}
                onChange={(checked) => updateNestedField('propertyStatus', 'stateOfEmergency', checked)}
              />
              <span className="text-sm font-medium text-gray-700">State of Emergency Declared</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.emergencyMitigationRequired}
                onChange={(checked) => updateNestedField('propertyStatus', 'emergencyMitigationRequired', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Emergency Mitigation/Repairs Required</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.damagedPersonalProperty}
                onChange={(checked) => updateNestedField('propertyStatus', 'damagedPersonalProperty', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Damaged Personal Property</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.additionalLivingExpenses}
                onChange={(checked) => updateNestedField('propertyStatus', 'additionalLivingExpenses', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Additional Living Expenses</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.repairsMade}
                onChange={(checked) => updateNestedField('propertyStatus', 'repairsMade', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Repairs Made?</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.propertyStatus.vendorsRepairsNeeded}
                onChange={(checked) => updateNestedField('propertyStatus', 'vendorsRepairsNeeded', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Vendors/Repairs Needed?</span>
            </div>
          </div>
          
          {stepData.propertyStatus.policeCalled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Police Report Number
              </label>
              <Input
                type="text"
                value={stepData.propertyStatus.policeReportNumber}
                onChange={(e) => updateNestedField('propertyStatus', 'policeReportNumber', e.target.value)}
                placeholder="Enter police report number"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LossInformationStep