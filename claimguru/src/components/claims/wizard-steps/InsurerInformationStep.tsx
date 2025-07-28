import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { StandardizedAddressInput } from '../../ui/StandardizedAddressInput'
import { StandardizedPhoneInput } from '../../ui/StandardizedPhoneInput'
import { Shield, Plus, Search, Users, Award, Building2 } from 'lucide-react'

interface InsurerInformationStepProps {
  data: any
  onUpdate: (data: any) => void
}

export function InsurerInformationStep({ data, onUpdate }: InsurerInformationStepProps) {
  const [stepData, setStepData] = useState({
    // Insurer Selection
    selectedInsurerId: data.selectedInsurerId || '',
    isNewInsurer: data.isNewInsurer || false,
    
    // Insurer Details
    insurerName: data.insurerName || '',
    insurerAddress: {
      streetAddress1: data.insurerAddress?.streetAddress1 || '',
      streetAddress2: data.insurerAddress?.streetAddress2 || '',
      city: data.insurerAddress?.city || '',
      state: data.insurerAddress?.state || '',
      zipCode: data.insurerAddress?.zipCode || ''
    },
    insurerPhoneNumbers: data.insurerPhoneNumbers || [{
      id: 'insurer_primary',
      type: 'office',
      number: '',
      extension: '',
      isPrimary: true
    }],
    insurerEmail: data.insurerEmail || '',
    insurerWebsite: data.insurerWebsite || '',
    
    // Personnel Information
    personnel: data.personnel || []
  })

  const [showNewInsurerForm, setShowNewInsurerForm] = useState(false)
  const [availableInsurers] = useState([
    { id: '1', name: 'State Farm Insurance', email: 'claims@statefarm.com', phone: '(800) 782-8332' },
    { id: '2', name: 'Allstate Insurance', email: 'claims@allstate.com', phone: '(800) 255-7828' },
    { id: '3', name: 'Progressive Insurance', email: 'claims@progressive.com', phone: '(800) 776-4737' },
    { id: '4', name: 'GEICO Insurance', email: 'claims@geico.com', phone: '(800) 841-3000' },
    { id: '5', name: 'USAA Insurance', email: 'claims@usaa.com', phone: '(800) 531-8722' }
  ])

  const updateField = (field: string, value: any) => {
    const updatedData = { ...stepData, [field]: value }
    setStepData(updatedData)
    onUpdate(updatedData)
  }

  const selectInsurer = (insurer: any) => {
    const updatedData = {
      ...stepData,
      selectedInsurerId: insurer.id,
      insurerName: insurer.name,
      insurerEmail: insurer.email,
      insurerPhoneNumbers: [{
        id: 'insurer_primary',
        type: 'office',
        number: insurer.phone,
        extension: '',
        isPrimary: true
      }],
      isNewInsurer: false
    }
    setStepData(updatedData)
    onUpdate(updatedData)
    setShowNewInsurerForm(false)
  }

  const addNewInsurer = () => {
    setShowNewInsurerForm(true)
    updateField('isNewInsurer', true)
  }

  const addPersonnel = () => {
    const newPersonnel = {
      id: `personnel_${Date.now()}`,
      department: '',
      jobTitle: '',
      personnelType: 'adjuster',
      vendorSpecialty: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumbers: [{
        id: `personnel_phone_${Date.now()}`,
        type: 'office',
        number: '',
        extension: '',
        isPrimary: true
      }],
      professionalLicenses: [],
      notes: ''
    }
    
    const updatedPersonnel = [...stepData.personnel, newPersonnel]
    updateField('personnel', updatedPersonnel)
  }

  const updatePersonnel = (index: number, field: string, value: any) => {
    const updatedPersonnel = [...stepData.personnel]
    updatedPersonnel[index] = { ...updatedPersonnel[index], [field]: value }
    updateField('personnel', updatedPersonnel)
  }

  const removePersonnel = (index: number) => {
    const updatedPersonnel = stepData.personnel.filter((_, i) => i !== index)
    updateField('personnel', updatedPersonnel)
  }

  const personnelTypes = [
    'Adjuster',
    'Vendor',
    'Attorney',
    'Supervisor',
    'Manager',
    'Claims Representative',
    'Other'
  ]

  const vendorSpecialties = [
    'Public Adjuster',
    'Contractor',
    'Restoration',
    'Roofing',
    'Water Damage',
    'Fire Damage',
    'Contents',
    'Engineering',
    'Legal',
    'Other'
  ]

  const licenseTypes = [
    'Public Adjuster License',
    'Contractor License',
    'Engineering License',
    'Legal License',
    'Other Professional License'
  ]

  return (
    <div className="space-y-6">
      {/* Insurer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Select Insurance Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewInsurerForm(false)}
                className={!showNewInsurerForm ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Search className="h-4 w-4 mr-2" />
                Select Existing
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={addNewInsurer}
                className={showNewInsurerForm ? 'bg-blue-50 border-blue-300' : ''}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Insurer
              </Button>
            </div>

            {!showNewInsurerForm ? (
              <div className="grid gap-3">
                {availableInsurers.map(insurer => (
                  <div
                    key={insurer.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      stepData.selectedInsurerId === insurer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectInsurer(insurer)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{insurer.name}</h4>
                        <p className="text-sm text-gray-600">{insurer.email}</p>
                        <p className="text-sm text-gray-600">{insurer.phone}</p>
                      </div>
                      {stepData.selectedInsurerId === insurer.id && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Company Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={stepData.insurerName}
                    onChange={(e) => updateField('insurerName', e.target.value)}
                    placeholder="Enter insurer name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={stepData.insurerEmail}
                      onChange={(e) => updateField('insurerEmail', e.target.value)}
                      placeholder="email@insurer.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      type="url"
                      value={stepData.insurerWebsite}
                      onChange={(e) => updateField('insurerWebsite', e.target.value)}
                      placeholder="https://www.insurer.com"
                    />
                  </div>
                </div>

                <StandardizedPhoneInput
                  phoneNumbers={stepData.insurerPhoneNumbers}
                  onChange={(phoneNumbers) => updateField('insurerPhoneNumbers', phoneNumbers)}
                  label="Phone Number"
                  allowMultiple
                />

                <StandardizedAddressInput
                  address={stepData.insurerAddress}
                  onChange={(address) => updateField('insurerAddress', address)}
                  label="Insurer Address"
                  allowAutocomplete
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personnel Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Insurer Personnel
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPersonnel}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Personnel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stepData.personnel.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No personnel added yet. Click "Add Personnel" to get started.</p>
            ) : (
              stepData.personnel.map((person: any, index: number) => (
                <div key={person.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">Personnel #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePersonnel(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <Input
                        type="text"
                        value={person.department}
                        onChange={(e) => updatePersonnel(index, 'department', e.target.value)}
                        placeholder="Claims Department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <Input
                        type="text"
                        value={person.jobTitle}
                        onChange={(e) => updatePersonnel(index, 'jobTitle', e.target.value)}
                        placeholder="Claims Adjuster"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Personnel Type
                      </label>
                      <select
                        value={person.personnelType}
                        onChange={(e) => updatePersonnel(index, 'personnelType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {personnelTypes.map(type => (
                          <option key={type} value={type.toLowerCase()}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {person.personnelType === 'vendor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendor Specialty
                      </label>
                      <select
                        value={person.vendorSpecialty}
                        onChange={(e) => updatePersonnel(index, 'vendorSpecialty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select specialty</option>
                        {vendorSpecialties.map(specialty => (
                          <option key={specialty} value={specialty.toLowerCase()}>{specialty}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={person.firstName}
                        onChange={(e) => updatePersonnel(index, 'firstName', e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={person.lastName}
                        onChange={(e) => updatePersonnel(index, 'lastName', e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={person.email}
                        onChange={(e) => updatePersonnel(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <StandardizedPhoneInput
                    phoneNumbers={person.phoneNumbers}
                    onChange={(phoneNumbers) => updatePersonnel(index, 'phoneNumbers', phoneNumbers)}
                    label="Phone Number"
                    allowMultiple={false}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={person.notes}
                      onChange={(e) => updatePersonnel(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes about this person..."
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InsurerInformationStep