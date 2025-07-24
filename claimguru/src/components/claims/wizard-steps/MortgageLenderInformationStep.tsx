import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { Building2, Plus, X, DollarSign } from 'lucide-react'

interface MortgageLenderInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function MortgageLenderInformationStep({ data, onUpdate }: MortgageLenderInformationStepProps) {
  const [stepData, setStepData] = useState({
    mortgageLenders: data.mortgageLenders || []
  })

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const addMortgageLender = () => {
    const newLender = {
      id: `lender_${Date.now()}`,
      lenderName: '',
      mortgageType: '',
      lenderAddress: {
        streetAddress1: '',
        streetAddress2: '',
        city: '',
        state: '',
        zipCode: ''
      },
      contactPersonFirstName: '',
      contactPersonLastName: '',
      phoneNumbers: [{
        id: `lender_phone_${Date.now()}`,
        type: 'office',
        number: '',
        extension: '',
        isPrimary: true
      }],
      emailAddress: '',
      loanNumber: '',
      monthlyPayments: '',
      outstandingBalance: ''
    }
    
    const updatedLenders = [...stepData.mortgageLenders, newLender]
    updateField('mortgageLenders', updatedLenders)
  }

  const updateLender = (index: number, field: string, value: any) => {
    const updatedLenders = [...stepData.mortgageLenders]
    updatedLenders[index] = { ...updatedLenders[index], [field]: value }
    updateField('mortgageLenders', updatedLenders)
  }

  const updateLenderNestedField = (index: number, section: string, field: string, value: any) => {
    const updatedLenders = [...stepData.mortgageLenders]
    updatedLenders[index] = {
      ...updatedLenders[index],
      [section]: {
        ...updatedLenders[index][section],
        [field]: value
      }
    }
    updateField('mortgageLenders', updatedLenders)
  }

  const removeLender = (index: number) => {
    const updatedLenders = stepData.mortgageLenders.filter((_, i) => i !== index)
    updateField('mortgageLenders', updatedLenders)
  }

  const mortgageTypes = [
    'Conventional',
    'FHA',
    'VA',
    'USDA',
    'Jumbo',
    'ARM (Adjustable Rate)',
    'Fixed Rate',
    'Interest Only',
    'Reverse Mortgage',
    'Home Equity Line of Credit (HELOC)',
    'Second Mortgage',
    'Other'
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Mortgage Lender Information
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMortgageLender}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Mortgage Lender
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stepData.mortgageLenders.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No mortgage lenders added yet.</p>
              <Button
                type="button"
                onClick={addMortgageLender}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add First Mortgage Lender
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {stepData.mortgageLenders.map((lender: any, index: number) => (
                <div key={lender.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">Mortgage Lender #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLender(index)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>

                  {/* Lender Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mortgage Lender Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={lender.lenderName}
                        onChange={(e) => updateLender(index, 'lenderName', e.target.value)}
                        placeholder="Bank or lender name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mortgage Type
                      </label>
                      <select
                        value={lender.mortgageType}
                        onChange={(e) => updateLender(index, 'mortgageType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select mortgage type</option>
                        {mortgageTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Lender Address */}
                  <div>
                    <StandardizedAddressInput
                      address={lender.lenderAddress}
                      onChange={(address) => updateLender(index, 'lenderAddress', address)}
                      label="Lender Address"
                      allowAutocomplete
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person First Name
                      </label>
                      <Input
                        type="text"
                        value={lender.contactPersonFirstName}
                        onChange={(e) => updateLender(index, 'contactPersonFirstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person Last Name
                      </label>
                      <Input
                        type="text"
                        value={lender.contactPersonLastName}
                        onChange={(e) => updateLender(index, 'contactPersonLastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <StandardizedPhoneInput
                        phoneNumbers={lender.phoneNumbers}
                        onChange={(phoneNumbers) => updateLender(index, 'phoneNumbers', phoneNumbers)}
                        label="Phone Number"
                        allowMultiple={false}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={lender.emailAddress}
                        onChange={(e) => updateLender(index, 'emailAddress', e.target.value)}
                        placeholder="email@lender.com"
                      />
                    </div>
                  </div>

                  {/* Loan Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loan Number
                      </label>
                      <Input
                        type="text"
                        value={lender.loanNumber}
                        onChange={(e) => updateLender(index, 'loanNumber', e.target.value)}
                        placeholder="Loan account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Payments
                      </label>
                      <Input
                        type="text"
                        value={lender.monthlyPayments}
                        onChange={(e) => updateLender(index, 'monthlyPayments', e.target.value)}
                        placeholder="$2,500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outstanding Balance
                      </label>
                      <Input
                        type="text"
                        value={lender.outstandingBalance}
                        onChange={(e) => updateLender(index, 'outstandingBalance', e.target.value)}
                        placeholder="$350,000"
                      />
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

export default MortgageLenderInformationStep