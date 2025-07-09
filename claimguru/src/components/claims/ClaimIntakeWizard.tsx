import React, { useState, useEffect } from 'react'
import { User, FileText, Shield, ArrowRight, Building2, Users, CheckCircle, Camera, MapPin, Calendar, DollarSign, Phone, Mail, AlertTriangle } from 'lucide-react'
import { supabase, Client, Insurer, Vendor, Claim, ClaimIntakeProgress } from '../../lib/supabase'
import { useToastContext } from '../../contexts/ToastContext'
import useNotifications from '../../hooks/useNotifications'
import { allVendorCategories, getVendorCategoriesForClaimType } from '../../utils/vendorCategories'

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
  property_address?: {
    address_line_1: string
    address_line_2?: string
    city: string
    state: string
    zip_code: string
    country?: string
    same_as_client: boolean
  }
  estimated_loss_value?: number
  priority: string
  
  // Step 3: Insurance Information
  insurer_id?: string
  insurance_carrier_id?: string
  policy_number: string
  policy_effective_date?: string
  policy_expiration_date?: string
  coverage_limits: {
    dwelling?: number
    other_structures?: number
    personal_property?: number
    loss_of_use?: number
    liability?: number
    medical_payments?: number
  }
  deductible: number
  deductible_type?: string
  carrier_claim_number?: string
  adjuster_name?: string
  adjuster_phone?: string
  adjuster_email?: string
  
  // Step 4: Referral Information
  referral_source: string
  referral_contact?: string
  referral_company?: string
  referral_phone?: string
  referral_email?: string
  marketing_source?: string
  referral_fee?: number
  referral_fee_type?: string
  referral_notes?: string
  
  // Step 5: Vendor Assessment
  emergency_work_done?: boolean
  existing_vendors?: {
    vendor_id?: string
    vendor_name: string
    work_performed: string
    cost: number
    contact_info: string
  }[]
  repairs_needed: boolean
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
  const toast = useToastContext()
  const { createNotification } = useNotifications()
  const [intakeData, setIntakeData] = useState<ClaimIntakeData>({
    // Client selection
    client_id: '',
    new_client: null,
    
    // Claim details
    file_number: `CLM-${Date.now()}`,
    date_of_loss: '',
    cause_of_loss: '',
    loss_description: '',
    estimated_loss_value: 0,
    priority: 'medium',
    
    // Property address
    property_address: {
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      same_as_client: true
    },
    
    // Insurance information
    insurer_id: '',
    policy_number: '',
    policy_effective_date: '',
    policy_expiration_date: '',
    deductible: 0,
    deductible_type: 'fixed',
    coverage_limits: {
      dwelling: 0,
      other_structures: 0,
      personal_property: 0,
      loss_of_use: 0,
      liability: 0,
      medical_payments: 0
    },
    carrier_claim_number: '',
    adjuster_name: '',
    adjuster_phone: '',
    adjuster_email: '',
    
    // Referral information
    referral_source: '',
    marketing_source: '',
    referral_contact: '',
    referral_company: '',
    referral_phone: '',
    referral_email: '',
    referral_fee: 0,
    referral_fee_type: 'percentage',
    referral_notes: '',
    
    // Vendor assessment
    emergency_work_done: undefined,
    existing_vendors: [],
    repairs_needed: false,
    vendor_categories: [],
    special_requirements: '',
    assigned_vendors: []
  })

  const steps = [
    { id: 1, name: 'Client', icon: User, description: 'Create/Select Client' },
    { id: 2, name: 'Claim Details', icon: FileText, description: 'Create Claim with complete information' },
    { id: 3, name: 'Insurance', icon: Shield, description: 'Carrier and policy details' },
    { id: 4, name: 'Referral', icon: ArrowRight, description: 'Referral source information' },
    { id: 5, name: 'Vendor Info', icon: Building2, description: 'Vendor information and assessment' },
    { id: 6, name: 'Assignment', icon: Users, description: 'Assign recommended vendors' },
    { id: 7, name: 'Review', icon: CheckCircle, description: 'Review and submit' }
  ]

  const causeOfLossOptions = [
    'Fire', 'Water Damage', 'Wind Damage', 'Hail', 'Hurricane', 'Tornado',
    'Theft', 'Vandalism', 'Earthquake', 'Flood', 'Lightning', 'Explosion', 'Other'
  ]

  const vendorCategories = allVendorCategories

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
      toast.info('Creating claim...', 'Processing your claim information')
      
      // Create client if new
      let client_id = intakeData.client_id
      let clientName = ''
      
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
        clientName = intakeData.new_client.client_type === 'commercial' 
          ? intakeData.new_client.business_name || `${intakeData.new_client.first_name} ${intakeData.new_client.last_name}`
          : `${intakeData.new_client.first_name} ${intakeData.new_client.last_name}`
      } else {
        const selectedClient = clients.find(c => c.id === client_id)
        if (selectedClient) {
          clientName = selectedClient.client_type === 'commercial' 
            ? selectedClient.business_name || `${selectedClient.first_name} ${selectedClient.last_name}`
            : `${selectedClient.first_name} ${selectedClient.last_name}`
        }
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
        property_address: intakeData.property_address,
        insurance_carrier_id: intakeData.insurer_id,
        policy_number: intakeData.policy_number,
        policy_effective_date: intakeData.policy_effective_date,
        policy_expiration_date: intakeData.policy_expiration_date,
        coverage_limits: intakeData.coverage_limits,
        deductible: intakeData.deductible,
        deductible_type: intakeData.deductible_type,
        carrier_claim_number: intakeData.carrier_claim_number,
        adjuster_name: intakeData.adjuster_name,
        adjuster_phone: intakeData.adjuster_phone,
        adjuster_email: intakeData.adjuster_email,
        referral_source: intakeData.referral_source,
        marketing_source: intakeData.marketing_source,
        referral_contact: intakeData.referral_contact,
        referral_company: intakeData.referral_company,
        referral_phone: intakeData.referral_phone,
        referral_email: intakeData.referral_email,
        referral_fee: intakeData.referral_fee,
        referral_fee_type: intakeData.referral_fee_type,
        referral_notes: intakeData.referral_notes,
        vendor_assessment: {
          emergency_work_done: intakeData.emergency_work_done,
          existing_vendors: intakeData.existing_vendors,
          repairs_needed: intakeData.repairs_needed,
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

      // Create notification for successful claim creation
      await createNotification({
        organization_id: '00000000-0000-0000-0000-000000000000',
        type: 'success',
        title: 'New Claim Created',
        message: `Claim ${intakeData.file_number} for ${clientName} has been successfully created.`,
        user_id: '00000000-0000-0000-0000-000000000000', // Current user
        priority: 'medium',
        entity_type: 'claim',
        entity_id: newClaim.id,
        action_url: `/claims/${newClaim.id}`,
        is_read: false
      })

      toast.success('Claim Created Successfully!', `Claim ${intakeData.file_number} has been created and assigned.`)
      onComplete(newClaim.id)
    } catch (error: any) {
      console.error('Error creating claim:', error)
      toast.error('Failed to Create Claim', 
        error.message || 'An unexpected error occurred while creating the claim. Please try again.'
      )
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
                          client_type: 'residential',
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
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </div>
                  </div>
                  
                  {intakeData.new_client.client_type === 'residential' ? (
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
                      <label className="block text-sm font-medium text-gray-700">Company Name *</label>
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Property Address</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={intakeData.property_address?.same_as_client || false}
                    onChange={(e) => {
                      const sameAsClient = e.target.checked
                      const selectedClient = intakeData.client_id ? clients.find(c => c.id === intakeData.client_id) : intakeData.new_client
                      updateIntakeData({
                        property_address: {
                          ...intakeData.property_address!,
                          same_as_client: sameAsClient,
                          address_line_1: sameAsClient && selectedClient ? selectedClient.address_line_1 || '' : intakeData.property_address?.address_line_1 || '',
                          city: sameAsClient && selectedClient ? selectedClient.city || '' : intakeData.property_address?.city || '',
                          state: sameAsClient && selectedClient ? selectedClient.state || '' : intakeData.property_address?.state || '',
                          zip_code: sameAsClient && selectedClient ? selectedClient.zip_code || '' : intakeData.property_address?.zip_code || ''
                        }
                      })
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Same as client address</span>
                </label>
              </div>
              
              {!intakeData.property_address?.same_as_client && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Property Address *</label>
                    <input
                      type="text"
                      required
                      value={intakeData.property_address?.address_line_1 || ''}
                      onChange={(e) => updateIntakeData({
                        property_address: {
                          ...intakeData.property_address!,
                          address_line_1: e.target.value
                        }
                      })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Property street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">City *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.property_address?.city || ''}
                        onChange={(e) => updateIntakeData({
                          property_address: {
                            ...intakeData.property_address!,
                            city: e.target.value
                          }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.property_address?.state || ''}
                        onChange={(e) => updateIntakeData({
                          property_address: {
                            ...intakeData.property_address!,
                            state: e.target.value
                          }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ZIP *</label>
                      <input
                        type="text"
                        required
                        value={intakeData.property_address?.zip_code || ''}
                        onChange={(e) => updateIntakeData({
                          property_address: {
                            ...intakeData.property_address!,
                            zip_code: e.target.value
                          }
                        })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
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
                <label className="block text-sm font-medium text-gray-700">Policy Effective Date</label>
                <input
                  type="date"
                  value={intakeData.policy_effective_date || ''}
                  onChange={(e) => updateIntakeData({ policy_effective_date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Expiration Date</label>
                <input
                  type="date"
                  value={intakeData.policy_expiration_date || ''}
                  onChange={(e) => updateIntakeData({ policy_expiration_date: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Limits</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Coverage A - Dwelling</label>
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
                  <label className="block text-xs font-medium text-gray-500">Coverage B - Other Structures</label>
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
                  <label className="block text-xs font-medium text-gray-500">Coverage C - Personal Property</label>
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
                  <label className="block text-xs font-medium text-gray-500">Coverage D - Loss of Use</label>
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
                <div>
                  <label className="block text-xs font-medium text-gray-500">Liability Coverage</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.liability || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        liability: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Medical Payments</label>
                  <input
                    type="number"
                    min="0"
                    value={intakeData.coverage_limits.medical_payments || ''}
                    onChange={(e) => updateIntakeData({
                      coverage_limits: {
                        ...intakeData.coverage_limits,
                        medical_payments: parseFloat(e.target.value)
                      }
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700">Deductible Type</label>
                <select
                  value={intakeData.deductible_type || 'fixed'}
                  onChange={(e) => updateIntakeData({ deductible_type: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                  <option value="wind_hail">Wind/Hail Percentage</option>
                </select>
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

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Adjuster Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjuster Name</label>
                  <input
                    type="text"
                    value={intakeData.adjuster_name || ''}
                    onChange={(e) => updateIntakeData({ adjuster_name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjuster Phone</label>
                  <input
                    type="tel"
                    value={intakeData.adjuster_phone || ''}
                    onChange={(e) => updateIntakeData({ adjuster_phone: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adjuster Email</label>
                  <input
                    type="email"
                    value={intakeData.adjuster_email || ''}
                    onChange={(e) => updateIntakeData({ adjuster_email: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
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
                <label className="block text-sm font-medium text-gray-700">Marketing Source</label>
                <select
                  value={intakeData.marketing_source || ''}
                  onChange={(e) => updateIntakeData({ marketing_source: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select marketing source...</option>
                  <option value="google_ads">Google Ads</option>
                  <option value="facebook_ads">Facebook Ads</option>
                  <option value="yellow_pages">Yellow Pages</option>
                  <option value="direct_mail">Direct Mail</option>
                  <option value="radio">Radio</option>
                  <option value="tv">Television</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="billboard">Billboard</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {(intakeData.referral_source && ['attorney', 'contractor', 'realtor', 'existing_client', 'insurance_agent'].includes(intakeData.referral_source)) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Referral Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                    <input
                      type="text"
                      value={intakeData.referral_contact || ''}
                      onChange={(e) => updateIntakeData({ referral_contact: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Name of person who made referral"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company/Firm</label>
                    <input
                      type="text"
                      value={intakeData.referral_company || ''}
                      onChange={(e) => updateIntakeData({ referral_company: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Company or firm name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={intakeData.referral_phone || ''}
                      onChange={(e) => updateIntakeData({ referral_phone: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={intakeData.referral_email || ''}
                      onChange={(e) => updateIntakeData({ referral_email: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

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
              <h3 className="mt-2 text-lg font-medium text-gray-900">Vendor Information</h3>
              <p className="mt-1 text-sm text-gray-500">Collect information about work done and vendor needs</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3">Emergency Work Status</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="emergency_work"
                      checked={intakeData.emergency_work_done === true}
                      onChange={() => updateIntakeData({ emergency_work_done: true })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes, emergency work has already been done</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="emergency_work"
                      checked={intakeData.emergency_work_done === false}
                      onChange={() => updateIntakeData({ emergency_work_done: false })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">No, no emergency work has been done yet</span>
                  </label>
                </div>
              </div>

              {intakeData.emergency_work_done && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Existing Vendor Information</h4>
                  <p className="text-sm text-gray-600 mb-4">Please provide details about the vendors who have already performed work:</p>
                  
                  {(intakeData.existing_vendors || []).map((vendor, index) => (
                    <div key={index} className="border border-gray-100 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vendor/Company Name *</label>
                          <input
                            type="text"
                            required
                            value={vendor.vendor_name}
                            onChange={(e) => {
                              const updatedVendors = [...(intakeData.existing_vendors || [])]
                              updatedVendors[index] = { ...vendor, vendor_name: e.target.value }
                              updateIntakeData({ existing_vendors: updatedVendors })
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                          <input
                            type="text"
                            value={vendor.contact_info}
                            onChange={(e) => {
                              const updatedVendors = [...(intakeData.existing_vendors || [])]
                              updatedVendors[index] = { ...vendor, contact_info: e.target.value }
                              updateIntakeData({ existing_vendors: updatedVendors })
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Phone number or email"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Work Performed *</label>
                          <textarea
                            rows={2}
                            required
                            value={vendor.work_performed}
                            onChange={(e) => {
                              const updatedVendors = [...(intakeData.existing_vendors || [])]
                              updatedVendors[index] = { ...vendor, work_performed: e.target.value }
                              updateIntakeData({ existing_vendors: updatedVendors })
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Describe the work that was performed..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cost</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={vendor.cost || ''}
                            onChange={(e) => {
                              const updatedVendors = [...(intakeData.existing_vendors || [])]
                              updatedVendors[index] = { ...vendor, cost: parseFloat(e.target.value) || 0 }
                              updateIntakeData({ existing_vendors: updatedVendors })
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedVendors = (intakeData.existing_vendors || []).filter((_, i) => i !== index)
                              updateIntakeData({ existing_vendors: updatedVendors })
                            }}
                            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newVendor = {
                        vendor_name: '',
                        work_performed: '',
                        cost: 0,
                        contact_info: ''
                      }
                      updateIntakeData({ 
                        existing_vendors: [...(intakeData.existing_vendors || []), newVendor] 
                      })
                    }}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                  >
                    + Add Another Vendor
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={intakeData.repairs_needed}
                    onChange={(e) => updateIntakeData({ repairs_needed: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Additional repairs are needed</span>
                </label>
              </div>

              {intakeData.cause_of_loss && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-green-900 mb-3">
                    🎯 Recommended Vendors for {intakeData.cause_of_loss} Claims
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vendorCategories
                      .filter(category => 
                        category.claimTypes.includes('all') || 
                        category.claimTypes.includes(intakeData.cause_of_loss.toLowerCase().replace(' ', '_'))
                      )
                      .slice(0, 6)
                      .map((category) => {
                        const Icon = category.icon
                        const isSelected = intakeData.vendor_categories.includes(category.name)
                        return (
                          <label key={`rec-${category.name}`} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-green-500 bg-green-100' 
                              : 'border-green-300 hover:bg-green-100'
                          }`}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...intakeData.vendor_categories, category.name]
                                  : intakeData.vendor_categories.filter(c => c !== category.name)
                                updateIntakeData({ vendor_categories: updated })
                              }}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <Icon className="ml-2 h-4 w-4 text-green-600" />
                            <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                            <span className={`ml-auto text-xs px-2 py-1 rounded ${
                              category.category === 'contractor' 
                                ? 'bg-green-200 text-green-800' 
                                : 'bg-blue-200 text-blue-800'
                            }`}>
                              {category.category === 'contractor' ? 'Contractor' : 'Expert'}
                            </span>
                          </label>
                        )
                      })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">All Available Vendor Categories</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vendorCategories.map((category) => {
                    const Icon = category.icon
                    const isRecommended = intakeData.cause_of_loss && (
                      category.claimTypes.includes('all') || 
                      category.claimTypes.includes(intakeData.cause_of_loss.toLowerCase().replace(' ', '_'))
                    )
                    const isSelected = intakeData.vendor_categories.includes(category.name)
                    
                    return (
                      <label key={category.name} className={`flex items-center p-3 border rounded-lg hover:bg-gray-50 ${
                        isRecommended ? 'border-green-200 bg-green-25' : 'border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
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
                        <div className="ml-auto flex items-center space-x-2">
                          {isRecommended && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                              Recommended
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            category.category === 'contractor' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {category.category === 'contractor' ? 'Contractor' : 'Expert'}
                          </span>
                        </div>
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
        const propertyAddressValid = intakeData.property_address?.same_as_client || (
          intakeData.property_address?.address_line_1 &&
          intakeData.property_address?.city &&
          intakeData.property_address?.state &&
          intakeData.property_address?.zip_code
        )
        return intakeData.file_number && intakeData.date_of_loss && intakeData.cause_of_loss && intakeData.loss_description && propertyAddressValid
      case 3:
        return intakeData.policy_number && intakeData.deductible >= 0
      case 4:
        return intakeData.referral_source
      case 5:
        if (intakeData.emergency_work_done && intakeData.existing_vendors) {
          return intakeData.existing_vendors.every(vendor => 
            vendor.vendor_name && vendor.work_performed
          )
        }
        return intakeData.emergency_work_done !== undefined
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