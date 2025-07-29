import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Switch } from '../../ui/switch'
import { Building2, Home, Wrench, Zap, Droplets } from 'lucide-react'

interface BuildingInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function BuildingInformationStep({ data, onUpdate }: BuildingInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Building Type & Construction
    buildingType: data.buildingType || '',
    constructionType: data.constructionType || '',
    yearBuilt: data.yearBuilt || '',
    squareFootage: data.squareFootage || '',
    numberOfStories: data.numberOfStories || '',
    
    // Roof Information
    roofType: data.roofType || '',
    roofAge: data.roofAge || '',
    
    // Foundation & Exterior
    foundationType: data.foundationType || '',
    exteriorWalls: data.exteriorWalls || '',
    
    // Building Systems
    heatingSystems: data.heatingSystems || [],
    plumbingType: data.plumbingType || '',
    electricalType: data.electricalType || '',
    
    // Additional Features
    features: {
      hasBasement: data.features?.hasBasement || false,
      hasGarage: data.features?.hasGarage || false,
      hasSpa: data.features?.hasSpa || false,
      hasDetachedStructures: data.features?.hasDetachedStructures || false,
      hasPool: data.features?.hasPool || false,
      hasFireplace: data.features?.hasFireplace || false,
      hasSecurity: data.features?.hasSecurity || false,
      hasGenerator: data.features?.hasGenerator || false
    },
    
    // Additional Details
    garageType: data.garageType || '',
    basementType: data.basementType || '',
    detachedStructuresDescription: data.detachedStructuresDescription || ''
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

  const toggleHeatingSystem = (system: string) => {
    const currentSystems = stepData.heatingSystems || []
    const updatedSystems = currentSystems.includes(system)
      ? currentSystems.filter(s => s !== system)
      : [...currentSystems, system]
    
    updateField('heatingSystems', updatedSystems)
  }

  const buildingTypes = [
    'Single Family Home',
    'Townhouse',
    'Condominium',
    'Duplex',
    'Multi-Family',
    'Mobile Home',
    'Manufactured Home',
    'Commercial Building',
    'Warehouse',
    'Office Building',
    'Retail Space',
    'Industrial',
    'Other'
  ]

  const constructionTypes = [
    'Frame (Wood)',
    'Masonry',
    'Brick Veneer',
    'Concrete Block',
    'Steel Frame',
    'Log Home',
    'Adobe',
    'Stone',
    'Stucco',
    'Vinyl Siding',
    'Other'
  ]

  const roofTypes = [
    'Asphalt Shingles',
    'Metal',
    'Tile (Clay/Concrete)',
    'Slate',
    'Wood Shingles',
    'Flat/Built-up',
    'Membrane (TPO/EPDM)',
    'Other'
  ]

  const foundationTypes = [
    'Concrete Slab',
    'Crawl Space',
    'Full Basement',
    'Partial Basement',
    'Pier & Beam',
    'Other'
  ]

  const heatingSystemOptions = [
    'Forced Air Gas',
    'Forced Air Electric',
    'Heat Pump',
    'Radiant Floor',
    'Boiler',
    'Baseboard Electric',
    'Window Units',
    'None'
  ]

  const plumbingTypes = [
    'Copper',
    'PVC',
    'PEX',
    'Galvanized',
    'Cast Iron',
    'Mixed',
    'Unknown'
  ]

  const electricalTypes = [
    'Circuit Breakers',
    'Fuse Box',
    'Mixed',
    'Unknown'
  ]

  return (
    <div className="space-y-6">
      {/* Building Type & Construction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Building Type & Construction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Type
              </label>
              <select
                value={stepData.buildingType}
                onChange={(e) => updateField('buildingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select building type</option>
                {buildingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Type
              </label>
              <select
                value={stepData.constructionType}
                onChange={(e) => updateField('constructionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select construction type</option>
                {constructionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <Input
                type="number"
                value={stepData.yearBuilt}
                onChange={(e) => updateField('yearBuilt', e.target.value)}
                placeholder="1985"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Footage
              </label>
              <Input
                type="number"
                value={stepData.squareFootage}
                onChange={(e) => updateField('squareFootage', e.target.value)}
                placeholder="2500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Stories
              </label>
              <Input
                type="number"
                value={stepData.numberOfStories}
                onChange={(e) => updateField('numberOfStories', e.target.value)}
                placeholder="2"
                min="1"
                max="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roof Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Roof Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roof Type
              </label>
              <select
                value={stepData.roofType}
                onChange={(e) => updateField('roofType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select roof type</option>
                {roofTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roof Age (Years)
              </label>
              <Input
                type="number"
                value={stepData.roofAge}
                onChange={(e) => updateField('roofAge', e.target.value)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foundation & Exterior */}
      <Card>
        <CardHeader>
          <CardTitle>Foundation & Exterior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foundation Type
              </label>
              <select
                value={stepData.foundationType}
                onChange={(e) => updateField('foundationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select foundation type</option>
                {foundationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exterior Walls
              </label>
              <Input
                type="text"
                value={stepData.exteriorWalls}
                onChange={(e) => updateField('exteriorWalls', e.target.value)}
                placeholder="Brick, Siding, Stucco, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Systems */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Building Systems
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Heating Systems */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heating Systems (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {heatingSystemOptions.map(system => (
                <div key={system} className="flex items-center gap-2">
                  <Switch
                    checked={stepData.heatingSystems.includes(system)}
                    onChange={() => toggleHeatingSystem(system)}
                  />
                  <span className="text-sm text-gray-700">{system}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plumbing Type
              </label>
              <select
                value={stepData.plumbingType}
                onChange={(e) => updateField('plumbingType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select plumbing type</option>
                {plumbingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Electrical Type
              </label>
              <select
                value={stepData.electricalType}
                onChange={(e) => updateField('electricalType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select electrical type</option>
                {electricalTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasBasement}
                onChange={(checked) => updateNestedField('features', 'hasBasement', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Basement</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasGarage}
                onChange={(checked) => updateNestedField('features', 'hasGarage', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Garage</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasSpa}
                onChange={(checked) => updateNestedField('features', 'hasSpa', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Spa/Hot Tub</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasPool}
                onChange={(checked) => updateNestedField('features', 'hasPool', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Swimming Pool</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasFireplace}
                onChange={(checked) => updateNestedField('features', 'hasFireplace', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Fireplace</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasSecurity}
                onChange={(checked) => updateNestedField('features', 'hasSecurity', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Security System</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasGenerator}
                onChange={(checked) => updateNestedField('features', 'hasGenerator', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Generator</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={stepData.features.hasDetachedStructures}
                onChange={(checked) => updateNestedField('features', 'hasDetachedStructures', checked)}
              />
              <span className="text-sm font-medium text-gray-700">Detached Structures</span>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {stepData.features.hasGarage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garage Type
                </label>
                <Input
                  type="text"
                  value={stepData.garageType}
                  onChange={(e) => updateField('garageType', e.target.value)}
                  placeholder="Attached 2-car, Detached, Carport, etc."
                />
              </div>
            )}

            {stepData.features.hasBasement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basement Type
                </label>
                <Input
                  type="text"
                  value={stepData.basementType}
                  onChange={(e) => updateField('basementType', e.target.value)}
                  placeholder="Finished, Unfinished, Walkout, etc."
                />
              </div>
            )}

            {stepData.features.hasDetachedStructures && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detached Structures Description
                </label>
                <textarea
                  value={stepData.detachedStructuresDescription}
                  onChange={(e) => updateField('detachedStructuresDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe detached structures (shed, barn, guest house, etc.)"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BuildingInformationStep