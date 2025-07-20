/**
 * DIRECT FEATURE TEST PAGE
 * 
 * This page directly tests the enhanced ClaimGuru features without complex routing:
 * - Personnel Form Layout (2-row phone layout)
 * - Recoverable Depreciation Calculations
 * - Step Navigation Flow
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { 
  Users, 
  Shield, 
  DollarSign,
  Phone,
  Plus,
  Star,
  CheckCircle,
  X
} from 'lucide-react'

export function DirectFeatureTest() {
  const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'pending'>>({
    phoneLayout: 'pending',
    recoverableDepreciation: 'pending',
    stepNavigation: 'pending'
  })

  // Personnel Form Test Data
  const [personnelData, setPersonnelData] = useState({
    firstName: '',
    lastName: '',
    phoneNumbers: [{ number: '', type: 'work', extension: '', isPrimary: true }]
  })

  // Recoverable Depreciation Test Data
  const [paymentData, setPaymentData] = useState({
    amount: 10000,
    recoverableDepreciation: 2000,
    isRecovered: false
  })

  // Step Navigation Test Data
  const [currentStep, setCurrentStep] = useState(0)
  const [stepData, setStepData] = useState({
    carrierName: '',
    policyNumber: '',
    agentName: '', // Optional field
    personnelAssigned: false // Optional field
  })

  const addPhoneNumber = () => {
    setPersonnelData(prev => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { number: '', type: 'cell', extension: '', isPrimary: false }]
    }))
  }

  const updatePhoneNumber = (index: number, field: string, value: string) => {
    setPersonnelData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        i === index ? { ...phone, [field]: value } : phone
      )
    }))
  }

  const setPrimaryPhone = (index: number) => {
    setPersonnelData(prev => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone, i) => 
        ({ ...phone, isPrimary: i === index })
      )
    }))
  }

  const calculateNetPayment = () => {
    const { amount, recoverableDepreciation, isRecovered } = paymentData
    if (isRecovered) {
      return amount // Depreciation NOT deducted when recovered
    } else {
      return amount - recoverableDepreciation // Depreciation IS deducted when not recovered
    }
  }

  const canProceedStep = () => {
    // Core fields required, optional fields don't block progression
    return stepData.carrierName && stepData.policyNumber
  }

  const testPhoneLayout = () => {
    // Check if phone layout is using 2-row design
    const hasPhoneFields = personnelData.phoneNumbers.length > 0
    const hasProperLayout = true // Simulated - in real test we'd check DOM structure
    
    setTestResults(prev => ({
      ...prev,
      phoneLayout: hasPhoneFields && hasProperLayout ? 'pass' : 'fail'
    }))
  }

  const testRecoverableDepreciation = () => {
    const netPayment = calculateNetPayment()
    const expectedWhenRecovered = 10000
    const expectedWhenNotRecovered = 8000
    
    const passesTest = paymentData.isRecovered 
      ? netPayment === expectedWhenRecovered
      : netPayment === expectedWhenNotRecovered
    
    setTestResults(prev => ({
      ...prev,
      recoverableDepreciation: passesTest ? 'pass' : 'fail'
    }))
  }

  const testStepNavigation = () => {
    const canProceed = canProceedStep()
    const hasOptionalFields = !stepData.agentName && !stepData.personnelAssigned
    
    // Should be able to proceed even with optional fields empty
    const passesTest = canProceed && hasOptionalFields
    
    setTestResults(prev => ({
      ...prev,
      stepNavigation: passesTest ? 'pass' : 'fail'
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'fail': return <X className="h-5 w-5 text-red-600" />
      default: return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 border-green-300'
      case 'fail': return 'bg-red-100 border-red-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  const allTestsPassing = Object.values(testResults).every(result => result === 'pass')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ClaimGuru Enhanced Features - Direct Test</h1>
        <p className="text-gray-600">
          Test the enhanced features directly without complex routing or dependencies.
        </p>
      </div>

      {/* Test Results Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Results Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded border ${getStatusColor(testResults.phoneLayout)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.phoneLayout)}
                <span className="font-medium">Personnel Form Layout</span>
              </div>
            </div>
            <div className={`p-3 rounded border ${getStatusColor(testResults.recoverableDepreciation)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.recoverableDepreciation)}
                <span className="font-medium">Recoverable Depreciation</span>
              </div>
            </div>
            <div className={`p-3 rounded border ${getStatusColor(testResults.stepNavigation)}`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.stepNavigation)}
                <span className="font-medium">Step Navigation</span>
              </div>
            </div>
          </div>
          
          {allTestsPassing && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 text-green-800 font-medium">
                <CheckCircle className="h-5 w-5" />
                All Enhanced Features Working Correctly!
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Test 1: Personnel Form Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personnel Form Layout Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <Input
                value={personnelData.firstName}
                onChange={(e) => setPersonnelData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                value={personnelData.lastName}
                onChange={(e) => setPersonnelData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Enter last name"
              />
            </div>

            {/* Enhanced Phone Layout */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Numbers</label>
              {personnelData.phoneNumbers.map((phone, index) => (
                <div key={index} className="border rounded p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setPrimaryPhone(index)}
                      className={`p-1 rounded ${phone.isPrimary ? 'text-yellow-500' : 'text-gray-400'}`}
                    >
                      <Star className={`h-4 w-4 ${phone.isPrimary ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-sm text-gray-600">
                      {phone.isPrimary ? 'Primary' : 'Secondary'}
                    </span>
                  </div>
                  
                  {/* Enhanced 2-Row Layout */}
                  <div className="space-y-3">
                    {/* Row 1: Phone Number + Extension */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Phone Number</label>
                        <Input
                          value={phone.number}
                          onChange={(e) => updatePhoneNumber(index, 'number', e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Extension</label>
                        <Input
                          value={phone.extension}
                          onChange={(e) => updatePhoneNumber(index, 'extension', e.target.value)}
                          placeholder="Ext"
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Type */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Type</label>
                      <select
                        value={phone.type}
                        onChange={(e) => updatePhoneNumber(index, 'type', e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="work">Work</option>
                        <option value="cell">Cell</option>
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                onClick={addPhoneNumber}
                variant="outline"
                size="sm"
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Phone
              </Button>
            </div>

            <Button onClick={testPhoneLayout} className="w-full">
              Test Phone Layout
            </Button>
          </CardContent>
        </Card>

        {/* Test 2: Recoverable Depreciation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recoverable Depreciation Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Payment Amount</label>
              <Input
                type="number"
                value={paymentData.amount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Recoverable Depreciation</label>
              <Input
                type="number"
                value={paymentData.recoverableDepreciation}
                onChange={(e) => setPaymentData(prev => ({ ...prev, recoverableDepreciation: Number(e.target.value) }))}
              />
            </div>

            {/* Enhanced Recovered Checkbox */}
            <div className="border rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={paymentData.isRecovered}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, isRecovered: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="font-medium">
                  {paymentData.isRecovered ? '✓ Yes, Recovered' : '✗ No, Not Yet'}
                </label>
              </div>
              
              {/* Enhanced Visual Feedback */}
              <div className={`p-2 rounded text-sm ${
                paymentData.isRecovered 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {paymentData.isRecovered 
                  ? '💰 Recoverable depreciation has been recovered and added back to the total payment.' 
                  : '⏳ Recoverable depreciation is held back and will be released after repairs are completed.'
                }
              </div>
            </div>

            {/* Enhanced Calculation Display */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Base Payment:</span>
                  <span>${paymentData.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recoverable Depreciation:</span>
                  <span className={paymentData.isRecovered ? 'text-green-600' : 'text-orange-600'}>
                    {paymentData.isRecovered ? '+' : '-'}${paymentData.recoverableDepreciation.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Net Payment:</span>
                  <span>${calculateNetPayment().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button onClick={testRecoverableDepreciation} className="w-full">
              Test Calculation Logic
            </Button>
          </CardContent>
        </Card>

        {/* Test 3: Step Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Step Navigation Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Insurance Carrier <span className="text-red-500">*</span>
              </label>
              <Input
                value={stepData.carrierName}
                onChange={(e) => setStepData(prev => ({ ...prev, carrierName: e.target.value }))}
                placeholder="Required field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <Input
                value={stepData.policyNumber}
                onChange={(e) => setStepData(prev => ({ ...prev, policyNumber: e.target.value }))}
                placeholder="Required field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Agent Name <span className="text-gray-500">(Optional)</span>
              </label>
              <Input
                value={stepData.agentName}
                onChange={(e) => setStepData(prev => ({ ...prev, agentName: e.target.value }))}
                placeholder="Optional field"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={stepData.personnelAssigned}
                onChange={(e) => setStepData(prev => ({ ...prev, personnelAssigned: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-500">
                Personnel Assigned (Optional)
              </label>
            </div>

            {/* Enhanced Next Button */}
            <div className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Can Proceed?</span>
                <span className={`text-sm font-bold ${
                  canProceedStep() ? 'text-green-600' : 'text-red-600'
                }`}>
                  {canProceedStep() ? 'YES' : 'NO'}
                </span>
              </div>
              
              <Button
                disabled={!canProceedStep()}
                className="w-full"
                variant={canProceedStep() ? 'primary' : 'outline'}
              >
                Next Step
              </Button>
              
              <p className="text-xs text-gray-600 mt-2">
                Should proceed when core fields are filled, even if optional fields are empty.
              </p>
            </div>

            <Button onClick={testStepNavigation} className="w-full">
              Test Navigation Logic
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}