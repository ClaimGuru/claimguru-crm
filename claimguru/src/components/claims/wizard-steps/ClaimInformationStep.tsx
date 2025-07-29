import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { MultiTextArea } from '../../ui/MultiTextArea'
import { CauseOfLossSelector } from '../../ui/CauseOfLossSelector'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { Switch } from '../../ui/switch'
import { 
  FileText, 
  AlertTriangle,
  Home,
  MapPin,
  Shield,
  CloudRain,
  Eye,
  Building,
  Calendar
} from 'lucide-react'

interface ClaimInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function ClaimInformationStep({ data, onUpdate }: ClaimInformationStepProps) {
  const [lossDetails, setLossDetails] = useState({
    reasonForLoss: data.lossDetails?.reasonForLoss || '',
    dateOfLoss: data.lossDetails?.dateOfLoss || '',
    timeOfLoss: data.lossDetails?.timeOfLoss || '',
    causeOfLoss: data.lossDetails?.causeOfLoss || '',
    severity: data.lossDetails?.severity || '',
    lossDescription: data.lossDetails?.lossDescription || '',
    causeDetails: data.lossDetails?.causeDetails || '',
    estimatedDamageValue: data.lossDetails?.estimatedDamageValue || '',
    
    // Loss Location
    lossLocationAddress: data.lossDetails?.lossLocationAddress || {
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      zipCode: ''
    },
    room: data.lossDetails?.room || '',
    
    // Weather Related
    isWeatherRelated: data.lossDetails?.isWeatherRelated || false,
    weatherType: data.lossDetails?.weatherType || '',
    stormName: data.lossDetails?.stormName || '',
    
    // Property Status Toggles
    femalDeclaredDisaster: data.lossDetails?.femalDeclaredDisaster || false,
    policeCalled: data.lossDetails?.policeCalled || false,
    policeReportNumber: data.lossDetails?.policeReportNumber || '',
    propertyUninhabitable: data.lossDetails?.propertyUninhabitable || false,
    damageToOtherStructures: data.lossDetails?.damageToOtherStructures || false,
    stateOfEmergencyDeclared: data.lossDetails?.stateOfEmergencyDeclared || false,
    emergencyMitigationRequired: data.lossDetails?.emergencyMitigationRequired || false,
    damagedPersonalProperty: data.lossDetails?.damagedPersonalProperty || false,
    additionalLivingExpenses: data.lossDetails?.additionalLivingExpenses || false,
    repairsMade: data.lossDetails?.repairsMade || false,
    vendorsRepairsNeeded: data.lossDetails?.vendorsRepairsNeeded || false
  })

  const updateField = (field: string, value: any) => {
    const updatedData = { ...lossDetails, [field]: value }
    setLossDetails(updatedData)
    onUpdate({ lossDetails: updatedData })
  }

  const updateNestedField = (section: string, field: string, value: any) => {
    const updatedData = {
      ...lossDetails,
      [section]: {
        ...lossDetails[section],
        [field]: value
      }
    }
    setLossDetails(updatedData)
    onUpdate({ lossDetails: updatedData })
  }

  // Weather type options
  const weatherTypes = [
    'Thunderstorm',
    'Hurricane',
    'Tornado', 
    'Derecho',
    'Hail'
  ]

  // Hurricane/Tropical Storm names (example list)
  const stormNames = [
    'Hurricane Ian',
    'Hurricane Nicole',
    'Hurricane Debby',
    'Hurricane Helene',
    'Hurricane Milton',
    'Other (specify)'
  ]

  // Severity options
  const severityOptions = [
    'Minor',
    'Moderate',
    'Major',
    'Total Loss'
  ]

  // Update parent component when data changes

  return (
    <div className="space-y-6">
      {/* Loss Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            Loss Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reason for Loss - Multi-text field as specified */}
          <div>
            <MultiTextArea
              label="Reason for Loss"
              value={lossDetails.reasonForLoss}
              onChange={(value) => updateField('reasonForLoss', value)}
              placeholder="Provide detailed explanation of the reason for loss..."
              required
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Loss <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={lossDetails.dateOfLoss}
                onChange={(e) => updateField('dateOfLoss', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time of Loss
              </label>
              <Input
                type="time"
                value={lossDetails.timeOfLoss}
                onChange={(e) => updateField('timeOfLoss', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity of Loss
              </label>
              <select
                value={lossDetails.severity}
                onChange={(e) => updateField('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select severity</option>
                {severityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comprehensive Cause of Loss Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cause of Loss <span className="text-red-500">*</span>
            </label>
            <CauseOfLossSelector
              value={lossDetails.causeOfLoss}
              onChange={(value) => updateField('causeOfLoss', value)}
              required
            />
          </div>

          {/* Additional Loss Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cause Details (Optional)
              </label>
              <textarea
                value={lossDetails.causeDetails}
                onChange={(e) => updateField('causeDetails', e.target.value)}
                placeholder="Additional details about the cause of loss..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Damage Value (Optional)
              </label>
              <Input
                type="number"
                value={lossDetails.estimatedDamageValue}
                onChange={(e) => updateField('estimatedDamageValue', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Loss Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loss Description (Optional)
            </label>
            <textarea
              value={lossDetails.lossDescription}
              onChange={(e) => updateField('lossDescription', e.target.value)}
              placeholder="Detailed description of the loss..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loss Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-green-600" />
            Loss Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StandardizedAddressInput
            address={lossDetails.lossLocationAddress}
            onChange={(address) => updateField('lossLocationAddress', address)}
            label="Loss Location Address"
            allowAutocomplete
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room (Optional)
            </label>
            <Input
              type="text"
              value={lossDetails.room}
              onChange={(e) => updateField('room', e.target.value)}
              placeholder="e.g., Kitchen, Master Bedroom, Living Room"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weather Related Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CloudRain className="h-6 w-6 text-blue-600" />
            Weather Related Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={lossDetails.isWeatherRelated}
              onChange={(checked) => updateField('isWeatherRelated', checked)}
            />
            <span className="text-sm font-medium text-gray-700">Is this Weather Related?</span>
          </div>

          {lossDetails.isWeatherRelated && (
            <div className="space-y-4 ml-6 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weather Type
                </label>
                <select
                  value={lossDetails.weatherType}
                  onChange={(e) => updateField('weatherType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select weather type</option>
                  {weatherTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {(lossDetails.weatherType === 'Hurricane') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storm Name
                  </label>
                  <select
                    value={lossDetails.stormName}
                    onChange={(e) => updateField('stormName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select storm name</option>
                    {stormNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Status Selectors (All Toggle Switches) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building className="h-6 w-6 text-orange-600" />
            Property Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* FEMA Declared Disaster */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.femalDeclaredDisaster}
                onChange={(checked) => updateField('femalDeclaredDisaster', checked)}
              />
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">FEMA Declared Disaster</span>
            </div>

            {/* Police Called */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.policeCalled}
                onChange={(checked) => updateField('policeCalled', checked)}
              />
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Police Called</span>
            </div>

            {/* Property Uninhabitable */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.propertyUninhabitable}
                onChange={(checked) => updateField('propertyUninhabitable', checked)}
              />
              <Home className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Property Uninhabitable</span>
            </div>

            {/* Damage to Other Structures */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.damageToOtherStructures}
                onChange={(checked) => updateField('damageToOtherStructures', checked)}
              />
              <Building className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Damage to Other Structures</span>
            </div>

            {/* State of Emergency Declared */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.stateOfEmergencyDeclared}
                onChange={(checked) => updateField('stateOfEmergencyDeclared', checked)}
              />
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">State of Emergency Declared</span>
            </div>

            {/* Emergency Mitigation/Repairs Required */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.emergencyMitigationRequired}
                onChange={(checked) => updateField('emergencyMitigationRequired', checked)}
              />
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Emergency Mitigation/Repairs Required</span>
            </div>

            {/* Damaged Personal Property */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.damagedPersonalProperty}
                onChange={(checked) => updateField('damagedPersonalProperty', checked)}
              />
              <Home className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Damaged Personal Property</span>
            </div>


            {/* Additional Living Expenses */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.additionalLivingExpenses}
                onChange={(checked) => updateField("additionalLivingExpenses", checked)}
              />
              <Home className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Additional Living Expenses</span>
            </div>

            {/* Repairs Made */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.repairsMade}
                onChange={(checked) => updateField("repairsMade", checked)}
              />
              <Eye className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Repairs Made?</span>
            </div>

            {/* Vendors/Repairs Needed */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Switch
                checked={lossDetails.vendorsRepairsNeeded}
                onChange={(checked) => updateField("vendorsRepairsNeeded", checked)}
              />
              <Eye className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Vendors/Repairs Needed?</span>
            </div>
          </div>

          {/* Police Report Number (if police was called) */}
          {lossDetails.policeCalled && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police Report Number
              </label>
              <Input
                type="text"
                value={lossDetails.policeReportNumber}
                onChange={(e) => updateField("policeReportNumber", e.target.value)}
                placeholder="Enter police report number"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
