import React, { useState, useEffect } from 'react'
import { User, FileText, Shield, ArrowRight, Building2, Users, CheckCircle, Camera, MapPin, Calendar, DollarSign, Phone, Mail, AlertTriangle } from 'lucide-react'
import { supabase, Client, Insurer, Vendor, Claim, ClaimIntakeProgress } from '../../lib/supabase'

interface ClaimIntakeData {
  // Step 1: Client Selection
  client_id?: string
  new_client?: {
    client_type: string
    first_name: string
    last_name: string
    business_name?: string
    primary_email: string
    primary_phone: string
    address_line_1: string
    city: string
    state: string
    zip_code: string
    is_policyholder: boolean
  }
  
  // Step 2: Claim Details
  file_number: string
  claim_number?: string
  date_of_loss: string
  cause_of_loss: string
  loss_description: string
  estimated_loss_value?: number
  priority: string
  
  // Step 3: Insurance Information
  insurance_carrier_id?: string
  policy_number: string
  coverage_limits: {
    dwelling?: number
    other_structures?: number
    personal_property?: number
    loss_of_use?: number
    liability?: number
  }
  deductible: number
  carrier_claim_number?: string
  
  // Step 4: Referral Information
  referral_source: string
  referral_contact?: string
  referral_fee?: number
  referral_fee_type?: string
  referral_notes?: string
  
  // Step 5: Vendor Assessment
  repairs_needed: boolean
  emergency_services: boolean
  vendor_categories: string[]
  special_requirements?: string
  
  // Step 6: Vendor Assignment
  assigned_vendors: string[]
  vendor_instructions?: { [key: string]: string }
}

interface ClaimIntakeWizardProps {
  onComplete: (claimId: string) => void
  onCancel: () => void
}

const ClaimIntakeWizard: React.FC<ClaimIntakeWizardProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [intakeData, setIntakeData] = useState<ClaimIntakeData>({
    file_number: `CLM-${Date.now()}`,
    date_of_loss: '',
    cause_of_loss: '',
    loss_description: '',
    priority: 'medium',
    policy_number: '',
    coverage_limits: {},
    deductible: 0,
    referral_source: '',
    repairs_needed: false,
    emergency_services: false,
    vendor_categories: [],
    assigned_vendors: []
  })

  const steps = [
    { id: 1, name: 'Client', icon: User, description: 'Select or create client' },
    { id: 2, name: 'Claim Details', icon: FileText, description: 'Basic claim information' },
    { id: 3, name: 'Insurance', icon: Shield, description: 'Carrier and policy details' },
    { id: 4, name: 'Referral', icon: ArrowRight, description: 'Referral source information' },
    { id: 5, name: 'Assessment', icon: Building2, description: 'Vendor needs assessment' },
    { id: 6, name: 'Vendors', icon: Users, description: 'Assign vendors' },
    { id: 7, name: 'Review', icon: CheckCircle, description: 'Review and submit' }
  ]

  const causeOfLossOptions = [
    'Fire', 'Water Damage', 'Wind Damage', 'Hail', 'Hurricane', 'Tornado',
    'Theft', 'Vandalism', 'Earthquake', 'Flood', 'Lightning', 'Explosion', 'Other'
  ]

  const vendorCategories = [
    // Contractors
    { category: 'contractor', name: 'General Contractor', icon: Building2 },
    { category: 'contractor', name: 'Mold Remediation Specialist', icon: AlertTriangle },
    { category: 'contractor', name: 'Water Mitigation/Restoration', icon: Building2 },
    { category: 'contractor', name: 'Lead Testing Specialist', icon: AlertTriangle },
    { category: 'contractor', name: 'Emergency Tarping Service', icon: Building2 },
    { category: 'contractor', name: 'Roofing Contractor', icon: Building2 },
    { category: 'contractor', name: 'Plumbing Contractor', icon: Building2 },
    { category: 'contractor', name: 'Electrical Contractor', icon: Building2 },
    { category: 'contractor', name: 'HVAC Contractor', icon: Building2 },
    { category: 'contractor', name: 'Flooring Specialist', icon: Building2 },
    { category: 'contractor', name: 'Drywall/Painting Contractor', icon: Building2 },
    { category: 'contractor', name: 'Window/Glass Replacement', icon: Building2 },
    { category: 'contractor', name: 'Structural Repair', icon: Building2 },
    { category: 'contractor', name: 'Landscaping/Exterior', icon: Building2 },
    { category: 'contractor', name: 'Cleaning/Restoration Services', icon: Building2 },
    
    // Experts
    { category: 'expert', name: 'Structural Engineer', icon: Users },
    { category: 'expert', name: 'Environmental Consultant', icon: Users },
    { category: 'expert', name: 'Public Adjuster', icon: Users },
    { category: 'expert', name: 'Insurance Consultant', icon: Users },
    { category: 'expert', name: 'Legal Expert/Attorney', icon: Users },
    { category: 'expert', name: 'Forensic Accountant', icon: Users },
    { category: 'expert', name: 'Building Code Consultant', icon: Users },
    { category: 'expert', name: 'Fire Investigation Expert', icon: Users },
    { category: 'expert', name: 'Weather Expert/Meteorologist', icon: Users },
    { category: 'expert', name: 'Construction Consultant', icon: Users },
    { category: 'expert', name: 'Safety Inspector', icon: Users },
    { category: 'expert', name: 'Appraisal Expert', icon: Users }
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clientsResult, insurersResult, vendorsResult] = await Promise.all([
        supabase.from('clients').select('*').order('first_name'),
        supabase.from('insurers').select('*').eq('is_active', true).order('name'),
        supabase.from('vendors').select('*').eq('is_active', true).order('company_name')
      ])

      if (clientsResult.data) setClients(clientsResult.data)
      if (insurersResult.data) setInsurers(insurersResult.data)
      if (vendorsResult.data) setVendors(vendorsResult.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const updateIntakeData = (updates: Partial<ClaimIntakeData>) => {
    setIntakeData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create client if new
      let client_id = intakeData.client_id
      if (!client_id && intakeData.new_client) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            ...intakeData.new_client,
            organization_id: '00000000-0000-0000-0000-000000000000',
            country: 'US'
          })
          .select()
          .single()
        
        if (clientError) throw clientError
        client_id = newClient.id
      }

      // Create claim
      const claimData = {
        organization_id: '00000000-0000-0000-0000-000000000000',
        client_id,
        file_number: intakeData.file_number,
        claim_number: intakeData.claim_number,
        date_of_loss: intakeData.date_of_loss,
        cause_of_loss: intakeData.cause_of_loss,
        loss_description: intakeData.loss_description,
        estimated_loss_value: intakeData.estimated_loss_value,
        priority: intakeData.priority,
        insurance_carrier_id: intakeData.insurance_carrier_id,
        policy_number: intakeData.policy_number,
        coverage_limits: intakeData.coverage_limits,
        deductible: intakeData.deductible,
        carrier_claim_number: intakeData.carrier_claim_number,
        referral_source: intakeData.referral_source,
        referral_fee: intakeData.referral_fee,
        referral_notes: intakeData.referral_notes,
        vendor_assessment: {
          repairs_needed: intakeData.repairs_needed,
          emergency_services: intakeData.emergency_services,
          vendor_categories: intakeData.vendor_categories,
          special_requirements: intakeData.special_requirements
        },
        assigned_vendors: intakeData.assigned_vendors,
        claim_status: 'open',
        claim_phase: 'intake',
        contract_fee_type: 'percentage'
      }

      const { data: newClaim, error: claimError } = await supabase
        .from('claims')
        .insert(claimData)
        .select()
        .single()
      
      if (claimError) throw claimError

      // Create intake progress record
      await supabase
        .from('claim_intake_progress')
        .insert({
          claim_id: newClaim.id,
          current_step: 7,
          completed_steps: [1, 2, 3, 4, 5, 6, 7],
          intake_data: intakeData
        })

      onComplete(newClaim.id)
    } catch (error) {
      console.error('Error creating claim:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Client Selection</h3>
              <p className="mt-1 text-sm text-gray-500">Select an existing client or create a new one</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Selection</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="clientType"
                      checked={!!intakeData.client_id}
                      onChange={() => updateIntakeData({ client_id: '', new_client: undefined })}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Select existing client</span>
                  </label>
                  
                  {!intakeData.new_client && (
                    <select
                      value={intakeData.client_id || ''}
                      onChange={(e) => updateIntakeData({ client_id: e.target.value })}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name} {client.business_name && `- ${client.business_name}`}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="clientType"
                      checked={!!intakeData.new_client}
                      onChange={() => updateIntakeData({ 
                        client_id: undefined, 
                        new_client: {
                          client_type: 'individual',
                          first_name: '',
                          last_name: '',
                          primary_email: '',
                          primary_phone: '',
                          address_line_1: '',
                          city: '',
                          state: '',
                          zip_code: '',
                          is_policyholder: true
                        }
                      })}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Create new client</span>
                  </label>
                </div>
              </div>

              {intakeData.new_client && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Client Type</label>
                      <select
                        value={intakeData.new_client.client_type}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, client_type: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="individual">Individual</option>
                        <option value="business">Business</option>
                      </select>
                    </div>
                  </div>
                  
                  {intakeData.new_client.client_type === 'individual' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                          type="text"
                          required
                          value={intakeData.new_client.first_name}
                          onChange={(e) => updateIntakeData({
                            new_client: { ...intakeData.new_client!, first_name: e.target.value }
                          })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={intakeData.new_client.last_name}
                          onChange={(e) => updateIntakeData({
                            new_client: { ...intakeData.new_client!, last_name: e.target.value }
                          })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Name *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.new_client.business_name || ''}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, business_name: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={intakeData.new_client.primary_email}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, primary_email: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={intakeData.new_client.primary_phone}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, primary_phone: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address *</label>
                    <input
                      type="text"
                      required
                      value={intakeData.new_client.address_line_1}
                      onChange={(e) => updateIntakeData({
                        new_client: { ...intakeData.new_client!, address_line_1: e.target.value }
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">City *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.new_client.city}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, city: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.new_client.state}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, state: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.new_client.zip_code}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, zip_code: e.target.value }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={intakeData.new_client.is_policyholder}
                        onChange={(e) => updateIntakeData({
                          new_client: { ...intakeData.new_client!, is_policyholder: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">This person is the policyholder</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Claim Details</h3>
              <p className="mt-1 text-sm text-gray-500">Basic information about the claim</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">File Number *</label>
                <input
                  type="text"
                  required
                  value={intakeData.file_number}
                  onChange={(e) => updateIntakeData({ file_number: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Claim Number</label>
                <input
                  type="text"
                  value={intakeData.claim_number || ''}
                  onChange={(e) => updateIntakeData({ claim_number: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Loss *</label>
                <input
                  type="date"
                  required
                  value={intakeData.date_of_loss}
                  onChange={(e) => updateIntakeData({ date_of_loss: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cause of Loss *</label>
                <select
                  required
                  value={intakeData.cause_of_loss}
                  onChange={(e) => updateIntakeData({ cause_of_loss: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select cause of loss...</option>
                  {causeOfLossOptions.map((cause) => (
                    <option key={cause} value={cause}>{cause}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Loss Description *</label>
              <textarea
                rows={4}
                required
                value={intakeData.loss_description}
                onChange={(e) => updateIntakeData({ loss_description: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the loss in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Loss Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={intakeData.estimated_loss_value || ''}
                  onChange={(e) => updateIntakeData({ estimated_loss_value: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={intakeData.priority}
                  onChange={(e) => updateIntakeData({ priority: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Insurance Information</h3>
              <p className="mt-1 text-sm text-gray-500">Insurance carrier and policy details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Carrier</label>
                <select
                  value={intakeData.insurance_carrier_id || ''}
                  onChange={(e) => updateIntakeData({ insurance_carrier_id: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select insurance carrier...</option>
                  {insurers.map((insurer) => (
                    <option key={insurer.id} value={insurer.id}>{insurer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Number *</label>
                <input
                  type="text"
                  required
                  value={intakeData.policy_number}
                  onChange={(e) => updateIntakeData({ policy_number: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Limits</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Dwelling</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.dwelling || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        dwelling: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Other Structures</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.other_structures || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        other_structures: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Personal Property</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.personal_property || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        personal_property: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Loss of Use</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.loss_of_use || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        loss_of_use: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Deductible *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={intakeData.deductible}
                  onChange={(e) => updateIntakeData({ deductible: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Carrier Claim Number</label>
                <input
                  type="text"
                  value={intakeData.carrier_claim_number || ''}
                  onChange={(e) => updateIntakeData({ carrier_claim_number: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ArrowRight className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Referral Information</h3>
              <p className="mt-1 text-sm text-gray-500">How was this claim referred to you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Referral Source *</label>
                <select
                  required
                  value={intakeData.referral_source}
                  onChange={(e) => updateIntakeData({ referral_source: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select referral source...</option>
                  <option value="direct">Direct Contact</option>
                  <option value="website">Website</option>
                  <option value="attorney">Attorney</option>
                  <option value="contractor">Contractor</option>
                  <option value="realtor">Realtor</option>
                  <option value="existing_client">Existing Client</option>
                  <option value="insurance_agent">Insurance Agent</option>
                  <option value="advertising">Advertising</option>
                  <option value="social_media">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Referral Contact</label>
                <input
                  type="text"
                  value={intakeData.referral_contact || ''}
                  onChange={(e) => updateIntakeData({ referral_contact: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Name or company that made the referral"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Referral Fee</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={intakeData.referral_fee || ''}
                  onChange={(e) => updateIntakeData({ referral_fee: parseFloat(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fee Type</label>
                <select
                  value={intakeData.referral_fee_type || 'percentage'}
                  onChange={(e) => updateIntakeData({ referral_fee_type: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat_fee">Flat Fee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Referral Notes</label>
              <textarea
                rows={3}
                value={intakeData.referral_notes || ''}
                onChange={(e) => updateIntakeData({ referral_notes: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Additional notes about the referral..."
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Vendor Assessment</h3>
              <p className="mt-1 text-sm text-gray-500">Determine vendor needs for this claim</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={intakeData.repairs_needed}
                    onChange={(e) => updateIntakeData({ repairs_needed: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Repairs are needed</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={intakeData.emergency_services}
                    onChange={(e) => updateIntakeData({ emergency_services: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Emergency services required</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Required Vendor Categories</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vendorCategories.map((category) => {
                    const Icon = category.icon
                    return (
                      <label key={category.name} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={intakeData.vendor_categories.includes(category.name)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...intakeData.vendor_categories, category.name]
                              : intakeData.vendor_categories.filter(c => c !== category.name)
                            updateIntakeData({ vendor_categories: updated })
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Icon className="ml-2 h-4 w-4 text-gray-500" />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                        <span className={`ml-auto text-xs px-2 py-1 rounded ${
                          category.category === 'contractor' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {category.category === 'contractor' ? 'Contractor' : 'Expert'}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                <textarea
                  rows={3}
                  value={intakeData.special_requirements || ''}
                  onChange={(e) => updateIntakeData({ special_requirements: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any special requirements or considerations for vendors..."
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-blue-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Vendor Assignment</h3>
              <p className="mt-1 text-sm text-gray-500">Assign specific vendors to this claim</p>
            </div>

            <div className="space-y-4">
              {intakeData.vendor_categories.length > 0 ? (
                intakeData.vendor_categories.map((category) => {
                  const categoryVendors = vendors.filter(v => 
                    v.specialty === category || v.specialties?.includes(category)
                  )
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                      
                      {categoryVendors.length > 0 ? (
                        <div className="space-y-2">
                          {categoryVendors.map((vendor) => (
                            <label key={vendor.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={intakeData.assigned_vendors.includes(vendor.id)}
                                onChange={(e) => {
                                  const updated = e.target.checked
                                    ? [...intakeData.assigned_vendors, vendor.id]
                                    : intakeData.assigned_vendors.filter(id => id !== vendor.id)
                                  updateIntakeData({ assigned_vendors: updated })
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">{vendor.company_name}</p>
                                  <div className="flex items-center space-x-2">
                                    {vendor.emergency_available && (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                        Emergency
                                      </span>
                                    )}
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      ⭐ {vendor.rating}/5
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  {vendor.phone && (
                                    <span className="flex items-center">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {vendor.phone}
                                    </span>
                                  )}
                                  {vendor.email && (
                                    <span className="flex items-center">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {vendor.email}
                                    </span>
                                  )}
                                  <span>{vendor.total_jobs} jobs completed</span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No vendors available for this category. You can add vendors later.</p>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor categories selected</h3>
                  <p className="mt-1 text-sm text-gray-500">Go back to the assessment step to select vendor categories.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Review & Submit</h3>
              <p className="mt-1 text-sm text-gray-500">Review all information before creating the claim</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              {/* Client Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Client Information</h4>
                {intakeData.client_id ? (
                  <p className="text-sm text-gray-600">
                    Selected existing client: {clients.find(c => c.id === intakeData.client_id)?.first_name} {clients.find(c => c.id === intakeData.client_id)?.last_name}
                  </p>
                ) : intakeData.new_client ? (
                  <div className="text-sm text-gray-600">
                    <p><strong>New Client:</strong> {intakeData.new_client.first_name} {intakeData.new_client.last_name} {intakeData.new_client.business_name}</p>
                    <p>{intakeData.new_client.primary_email} • {intakeData.new_client.primary_phone}</p>
                    <p>{intakeData.new_client.address_line_1}, {intakeData.new_client.city}, {intakeData.new_client.state} {intakeData.new_client.zip_code}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">No client selected</p>
                )}
              </div>

              {/* Claim Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Claim Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>File Number:</strong> {intakeData.file_number}</p>
                    <p><strong>Date of Loss:</strong> {intakeData.date_of_loss}</p>
                    <p><strong>Cause:</strong> {intakeData.cause_of_loss}</p>
                  </div>
                  <div>
                    <p><strong>Priority:</strong> {intakeData.priority}</p>
                    {intakeData.estimated_loss_value && (
                      <p><strong>Estimated Value:</strong> ${intakeData.estimated_loss_value.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600"><strong>Description:</strong> {intakeData.loss_description}</p>
              </div>

              {/* Insurance Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Insurance Information</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Carrier:</strong> {insurers.find(i => i.id === intakeData.insurance_carrier_id)?.name || 'Not selected'}</p>
                  <p><strong>Policy Number:</strong> {intakeData.policy_number}</p>
                  <p><strong>Deductible:</strong> ${intakeData.deductible?.toLocaleString()}</p>
                </div>
              </div>

              {/* Referral Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Referral Information</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Source:</strong> {intakeData.referral_source}</p>
                  {intakeData.referral_contact && <p><strong>Contact:</strong> {intakeData.referral_contact}</p>}
                  {intakeData.referral_fee && <p><strong>Fee:</strong> {intakeData.referral_fee}% ({intakeData.referral_fee_type})</p>}
                </div>
              </div>

              {/* Vendor Assignment */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Vendor Assignment</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>Categories Needed:</strong> {intakeData.vendor_categories.length} selected</p>
                  <p><strong>Vendors Assigned:</strong> {intakeData.assigned_vendors.length} vendors</p>
                  {intakeData.assigned_vendors.length > 0 && (
                    <div className="mt-2">
                      {intakeData.assigned_vendors.map(vendorId => {
                        const vendor = vendors.find(v => v.id === vendorId)
                        return vendor ? (
                          <span key={vendorId} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {vendor.company_name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return intakeData.client_id || (
          intakeData.new_client &&
          intakeData.new_client.first_name &&
          intakeData.new_client.last_name &&
          intakeData.new_client.primary_email &&
          intakeData.new_client.primary_phone &&
          intakeData.new_client.address_line_1 &&
          intakeData.new_client.city &&
          intakeData.new_client.state &&
          intakeData.new_client.zip_code
        )
      case 2:
        return intakeData.file_number && intakeData.date_of_loss && intakeData.cause_of_loss && intakeData.loss_description
      case 3:
        return intakeData.policy_number && intakeData.deductible >= 0
      case 4:
        return intakeData.referral_source
      case 5:
        return true // Assessment step is optional
      case 6:
        return true // Vendor assignment is optional
      case 7:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep
              const Icon = step.icon
              
              return (
                <li key={step.id} className={`relative ${
                  index !== steps.length - 1 ? 'flex-1' : ''
                }`}>
                  {index !== steps.length - 1 && (
                    <div className={`absolute top-4 left-8 right-0 h-0.5 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                  
                  <div className="relative flex items-center group">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={`ml-2 text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          {currentStep < 7 ? (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Claim...' : 'Create Claim'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClaimIntakeWizard