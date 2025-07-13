import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { 
  Building2, 
  Plus, 
  X, 
  MapPin, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  Brain
} from 'lucide-react'
import { enhancedClaimWizardAI } from '../../../services/enhancedClaimWizardAI'

interface MortgageInfo {
  id: string
  lenderName: string
  lenderAddress: string
  contactPerson?: string
  phone?: string
  email?: string
  loanNumber?: string
  balance?: number
  monthlyPayment?: number
  type: 'primary' | 'secondary' | 'heloc' | 'other'
  priority: number
}

interface MortgageInformationStepProps {
  data: any
  onUpdate: (data: any) => void
  onComplete?: () => void
}

export const MortgageInformationStep: React.FC<MortgageInformationStepProps> = ({
  data,
  onUpdate,
  onComplete
}) => {
  const [mortgageInfo, setMortgageInfo] = useState<MortgageInfo[]>(
    data.mortgageInformation || []
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMortgage, setNewMortgage] = useState<Partial<MortgageInfo>>({
    lenderName: '',
    lenderAddress: '',
    contactPerson: '',
    phone: '',
    email: '',
    loanNumber: '',
    type: 'primary',
    priority: 1
  })
  const [isValidating, setIsValidating] = useState(false)

  // AI validation
  const validateMortgageInfo = async () => {
    setIsValidating(true)
    try {
      await enhancedClaimWizardAI.validateMortgageInformation({
        mortgageInfo,
        claimData: data
      })
    } catch (error) {
      console.error('Mortgage validation failed:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const addMortgage = () => {
    if (!newMortgage.lenderName) return

    const mortgage: MortgageInfo = {
      id: Date.now().toString(),
      lenderName: newMortgage.lenderName!,
      lenderAddress: newMortgage.lenderAddress || '',
      contactPerson: newMortgage.contactPerson,
      phone: newMortgage.phone,
      email: newMortgage.email,
      loanNumber: newMortgage.loanNumber,
      balance: newMortgage.balance,
      monthlyPayment: newMortgage.monthlyPayment,
      type: newMortgage.type || 'primary',
      priority: mortgageInfo.length + 1
    }

    const updated = [...mortgageInfo, mortgage]
    setMortgageInfo(updated)
    onUpdate({
      ...data,
      mortgageInformation: updated
    })

    // Reset form
    setNewMortgage({
      lenderName: '',
      lenderAddress: '',
      contactPerson: '',
      phone: '',
      email: '',
      loanNumber: '',
      type: 'primary',
      priority: 1
    })
    setShowAddForm(false)
  }

  const removeMortgage = (id: string) => {
    const updated = mortgageInfo.filter(m => m.id !== id)
    setMortgageInfo(updated)
    onUpdate({
      ...data,
      mortgageInformation: updated
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span>Mortgage Information</span>
          </CardTitle>
          <p className="text-gray-600">
            Add mortgage lender information for claim notifications and loss payee requirements.
          </p>
        </CardHeader>
      </Card>

      {/* Existing Mortgages */}
      {mortgageInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Mortgage Lenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mortgageInfo.map((mortgage) => (
                <div key={mortgage.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{mortgage.lenderName}</h4>
                      <p className="text-sm text-gray-600">{mortgage.lenderAddress}</p>
                      {mortgage.contactPerson && (
                        <p className="text-sm text-gray-600">Contact: {mortgage.contactPerson}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mortgage.type === 'primary' ? 'bg-blue-100 text-blue-800' :
                          mortgage.type === 'secondary' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mortgage.type.charAt(0).toUpperCase() + mortgage.type.slice(1)}
                        </span>
                        {mortgage.loanNumber && (
                          <span className="text-xs text-gray-500">Loan: {mortgage.loanNumber}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMortgage(mortgage.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Mortgage Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add Mortgage Lender</span>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : 'Add Lender'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showAddForm && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Lender Name *"
                  value={newMortgage.lenderName || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, lenderName: e.target.value })}
                  placeholder="Bank of America"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mortgage Type *
                  </label>
                  <select
                    value={newMortgage.type}
                    onChange={(e) => setNewMortgage({ ...newMortgage, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="primary">Primary Mortgage</option>
                    <option value="secondary">Second Mortgage</option>
                    <option value="heloc">HELOC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Input
                label="Lender Address"
                value={newMortgage.lenderAddress || ''}
                onChange={(e) => setNewMortgage({ ...newMortgage, lenderAddress: e.target.value })}
                placeholder="123 Main St, City, State 12345"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Contact Person"
                  value={newMortgage.contactPerson || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, contactPerson: e.target.value })}
                  placeholder="John Smith"
                />
                <Input
                  label="Phone"
                  value={newMortgage.phone || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Email"
                  type="email"
                  value={newMortgage.email || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, email: e.target.value })}
                  placeholder="contact@lender.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Loan Number"
                  value={newMortgage.loanNumber || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, loanNumber: e.target.value })}
                  placeholder="1234567890"
                />
                <Input
                  label="Outstanding Balance"
                  type="number"
                  value={newMortgage.balance || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, balance: parseFloat(e.target.value) })}
                  placeholder="250000"
                  prefix="$"
                />
                <Input
                  label="Monthly Payment"
                  type="number"
                  value={newMortgage.monthlyPayment || ''}
                  onChange={(e) => setNewMortgage({ ...newMortgage, monthlyPayment: parseFloat(e.target.value) })}
                  placeholder="1500"
                  prefix="$"
                />
              </div>

              <Button
                onClick={addMortgage}
                disabled={!newMortgage.lenderName}
              >
                Add Mortgage Lender
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div></div>
        <Button onClick={onComplete}>
          Continue to Next Step
        </Button>
      </div>
    </div>
  )
}
