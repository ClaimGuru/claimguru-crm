import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { 
  Building2, 
  Home, 
  Wrench, 
  Calendar, 
  Ruler,
  Brain,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { Switch } from '../../ui/Switch'

interface BuildingConstructionStepProps {
  data: any
  onUpdate: (data: any) => void
  onAIProcessing?: (isProcessing: boolean) => void
}

export const BuildingConstructionStep: React.FC<BuildingConstructionStepProps> = ({
  data,
  onUpdate,
  onAIProcessing
}) => {
  const [buildingConstruction, setBuildingConstruction] = useState(data.buildingConstruction || {
    buildingType: '',
    constructionType: '',
    roofType: '',
    roofAge: '',
    yearBuilt: '',
    squareFootage: '',
    numberStories: '',
    foundationType: '',
    exteriorWalls: '',
    heatingType: '',
    plumbingType: '',
    electricalType: '',
    hasBasement: false,
    hasGarage: false,
    hasPool: false,
    hasDetachedStructures: false
  })

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [autoPopulated, setAutoPopulated] = useState(false)

  // Update parent data whenever local state changes
  useEffect(() => {
    onUpdate({
      ...data,
      buildingConstruction
    })
  }, [buildingConstruction])

  // Check if data was auto-populated from PDF
  useEffect(() => {
    if (data.dataPopulatedFromPDF && data.buildingConstruction) {
      const hasPopulatedData = Object.values(data.buildingConstruction).some(value => 
        value !== undefined && value !== '' && value !== 0
      )
      setAutoPopulated(hasPopulatedData)
    }
  }, [data.dataPopulatedFromPDF, data.buildingConstruction])

  const handleInputChange = (field: string, value: any) => {
    setBuildingConstruction(prev => ({ ...prev, [field]: value }))
  }

  const buildingTypeOptions = [
    'Single Family Home',
    'Townhouse',
    'Condominium',
    'Duplex',
    'Mobile Home',
    'Manufactured Home',
    'Other'
  ]

  const constructionTypeOptions = [
    'Frame',
    'Masonry',
    'Brick Veneer',
    'Steel Frame',
    'Concrete Block',
    'Log',
    'Other'
  ]

  const roofTypeOptions = [
    'Composition Shingle',
    'Tile',
    'Metal',
    'Slate',
    'Wood Shake',
    'Built-up Tar',
    'Other'
  ]

  const foundationTypeOptions = [
    'Slab',
    'Crawl Space',
    'Full Basement',
    'Partial Basement',
    'Pier & Beam',
    'Other'
  ]

  const exteriorWallOptions = [
    'Wood Siding',
    'Vinyl Siding',
    'Brick',
    'Stucco',
    'Stone',
    'Fiber Cement',
    'Aluminum Siding',
    'Other'
  ]

  const heatingTypeOptions = [
    'Central Heat & Air',
    'Heat Pump',
    'Gas Furnace',
    'Electric Furnace',
    'Baseboard',
    'Other'
  ]

  const plumbingTypeOptions = [
    'Copper',
    'PVC',
    'PEX',
    'Galvanized Steel',
    'Cast Iron',
    'Other'
  ]

  const electricalTypeOptions = [
    'Circuit Breaker',
    'Fuse Box',
    'Mixed',
    'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Auto-Population Notice */}
      {autoPopulated && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Auto-Populated from Policy Document</span>
            </div>
            <p className="text-sm text-green-700">
              Building construction details have been extracted from your policy document. 
              Please review and update any information as needed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Header Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Optional Section</span>
          </div>
          <p className="text-sm text-blue-700">
            Building construction details help provide a more accurate claim assessment. 
            Fill in what you know - all fields are optional.
          </p>
        </CardContent>
      </Card>

      {/* Basic Building Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Basic Building Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Building Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Type
              </label>
              <select
                value={buildingConstruction.buildingType}
                onChange={(e) => handleInputChange('buildingType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select building type</option>
                {buildingTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Construction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Construction Type
              </label>
              <select
                value={buildingConstruction.constructionType}
                onChange={(e) => handleInputChange('constructionType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select construction type</option>
                {constructionTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Year Built */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year Built
              </label>
              <input
                type="number"
                value={buildingConstruction.yearBuilt}
                onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                min="1800"
                max={new Date().getFullYear()}
                placeholder="e.g., 1995"
              />
            </div>

            {/* Square Footage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Square Footage
              </label>
              <input
                type="number"
                value={buildingConstruction.squareFootage}
                onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 2400"
              />
            </div>

            {/* Number of Stories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Stories
              </label>
              <select
                value={buildingConstruction.numberStories}
                onChange={(e) => handleInputChange('numberStories', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select stories</option>
                <option value="1">1 Story</option>
                <option value="1.5">1.5 Stories</option>
                <option value="2">2 Stories</option>
                <option value="2.5">2.5 Stories</option>
                <option value="3">3 Stories</option>
                <option value="3+">3+ Stories</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roof Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Roof Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Roof Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roof Type
              </label>
              <select
                value={buildingConstruction.roofType}
                onChange={(e) => handleInputChange('roofType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select roof type</option>
                {roofTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Roof Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roof Age (years)
              </label>
              <input
                type="number"
                value={buildingConstruction.roofAge}
                onChange={(e) => handleInputChange('roofAge', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                min="0"
                max="100"
                placeholder="e.g., 10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options Toggle */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Wrench className="h-4 w-4" />
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Construction Details
            <Sparkles className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Construction Details */}
      {showAdvancedOptions && (
        <>
          {/* Foundation & Exterior */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Foundation & Exterior
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Foundation Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foundation Type
                  </label>
                  <select
                    value={buildingConstruction.foundationType}
                    onChange={(e) => handleInputChange('foundationType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select foundation type</option>
                    {foundationTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Exterior Walls */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exterior Walls
                  </label>
                  <select
                    value={buildingConstruction.exteriorWalls}
                    onChange={(e) => handleInputChange('exteriorWalls', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select exterior wall type</option>
                    {exteriorWallOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Systems */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Building Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Heating Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heating System
                  </label>
                  <select
                    value={buildingConstruction.heatingType}
                    onChange={(e) => handleInputChange('heatingType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select heating type</option>
                    {heatingTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Plumbing Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plumbing Type
                  </label>
                  <select
                    value={buildingConstruction.plumbingType}
                    onChange={(e) => handleInputChange('plumbingType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select plumbing type</option>
                    {plumbingTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {/* Electrical Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Electrical System
                  </label>
                  <select
                    value={buildingConstruction.electricalType}
                    onChange={(e) => handleInputChange('electricalType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select electrical type</option>
                    {electricalTypeOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Additional Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch
                    checked={buildingConstruction.hasBasement}
                    onChange={(checked) => handleInputChange('hasBasement', checked)}
                  />
                  <span className="text-sm font-medium">Basement</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch
                    checked={buildingConstruction.hasGarage}
                    onChange={(checked) => handleInputChange('hasGarage', checked)}
                  />
                  <span className="text-sm font-medium">Garage</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch
                    checked={buildingConstruction.hasPool}
                    onChange={(checked) => handleInputChange('hasPool', checked)}
                  />
                  <span className="text-sm font-medium">Pool/Spa</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Switch
                    checked={buildingConstruction.hasDetachedStructures}
                    onChange={(checked) => handleInputChange('hasDetachedStructures', checked)}
                  />
                  <span className="text-sm font-medium">Detached Structures</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
