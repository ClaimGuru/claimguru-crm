import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Claim } from '../lib/supabase'

export function useClaims() {
  const { userProfile } = useAuth()
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClaims()
    }
  }, [userProfile?.organization_id])

  async function loadClaims() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      
      // Production mode: make real database calls
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setClaims(data || [])
    } catch (error: any) {
      console.error('Error loading claims:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function createClaim(claimData: any) {
    if (!userProfile?.organization_id || !userProfile?.id) {
      throw new Error('User not properly authenticated')
    }

    try {
      console.log('🚀 Creating comprehensive claim with data:', claimData)
      
      // Generate file number if not provided
      const fileNumber = claimData.file_number || `CG-${new Date().getFullYear()}-${String(claims.length + 1).padStart(3, '0')}`

      // Start a transaction by creating claim first
      let clientId = claimData.client_id
      
      // 1. Create or get client if needed
      if (!clientId && (claimData.firstName || claimData.businessName)) {
        const clientData = {
          organization_id: userProfile.organization_id,
          created_by: userProfile.id,
          client_type: claimData.clientType || 'individual',
          first_name: claimData.firstName,
          last_name: claimData.lastName,
          business_name: claimData.businessName,
          primary_email: claimData.primaryEmail,
          primary_phone: claimData.primaryPhone,
          secondary_phone: claimData.phoneNumbers?.[1]?.number,
          work_phone: claimData.phoneNumbers?.find((p: any) => p.type === 'work')?.number,
          mobile_phone: claimData.phoneNumbers?.find((p: any) => p.type === 'cell')?.number,
          is_policyholder: true,
          country: 'USA',
          mailing_same_as_address: false,
          mailing_address_line_1: claimData.mailingAddress?.addressLine1,
          mailing_address_line_2: claimData.mailingAddress?.addressLine2,
          mailing_city: claimData.mailingAddress?.city,
          mailing_state: claimData.mailingAddress?.state,
          mailing_zip_code: claimData.mailingAddress?.zipCode,
          mailing_country: 'USA',
          spouse_name: claimData.hasCoInsured ? `${claimData.coInsuredFirstName} ${claimData.coInsuredLastName}`.trim() : undefined,
          notes: claimData.hasCoInsured ? `Co-Insured: ${claimData.coInsuredName}, Relationship: ${claimData.coInsuredRelationship}, Email: ${claimData.coInsuredEmail}, Phone: ${claimData.coInsuredPhone}${claimData.coInsuredPhoneExtension ? ` Ext: ${claimData.coInsuredPhoneExtension}` : ''}` : undefined
        }

        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single()

        if (clientError) {
          console.error('Error creating client:', clientError)
          throw new Error(`Failed to create client: ${clientError.message}`)
        }

        clientId = newClient.id
        console.log('✅ Created client:', newClient.id)

        // Store phone extension information in notes if needed
        if (claimData.phoneNumbers && claimData.phoneNumbers.some((p: any) => p.extension)) {
          const phoneExtensionInfo = claimData.phoneNumbers
            .filter((phone: any) => phone.extension)
            .map((phone: any) => `${phone.number} Ext: ${phone.extension} (${phone.type})`)
            .join(', ')
          
          if (phoneExtensionInfo) {
            // Update client with phone extension info in notes
            const currentNotes = clientData.notes || ''
            const extensionNotes = `Phone Extensions: ${phoneExtensionInfo}`
            clientData.notes = currentNotes ? `${currentNotes}\n${extensionNotes}` : extensionNotes
          }
        }
      }

      // 2. Create insurance carrier if needed
      let carrierId = claimData.insurance_carrier_id
      if (!carrierId && (claimData.insurerName || claimData.policyDetails?.insurerName)) {
        const insurerName = claimData.insurerName || claimData.policyDetails?.insurerName
        
        // Check if insurer already exists
        const { data: existingInsurer } = await supabase
          .from('insurers')
          .select('id')
          .eq('organization_id', userProfile.organization_id)
          .eq('name', insurerName)
          .single()
        
        if (existingInsurer) {
          carrierId = existingInsurer.id
          console.log('✅ Found existing insurer:', existingInsurer.id)
        } else {
          const insurerData = {
            organization_id: userProfile.organization_id,
            name: insurerName,
            is_active: true,
            preferred_communication: 'email'
          }

          const { data: newInsurer, error: insurerError } = await supabase
            .from('insurers')
            .insert([insurerData])
            .select()
            .single()

          if (insurerError) {
            console.warn('Warning: Failed to create insurer:', insurerError)
          } else {
            carrierId = newInsurer.id
            console.log('✅ Created insurer:', newInsurer.id)
          }
        }
      }

      // 3. Create property if property address is provided
      let propertyId = claimData.property_id
      if (!propertyId && (claimData.propertyAddress || claimData.claimInformation?.lossLocation)) {
        const propertyAddress = claimData.propertyAddress || claimData.claimInformation?.lossLocation
        
        const propertyData = {
          organization_id: userProfile.organization_id,
          client_id: clientId,
          property_type: 'residential',
          property_status: 'active',
          property_address: propertyAddress,
          property_value: parseFloat(claimData.propertyValue || claimData.dwellingValue || '0') || undefined
        }

        const { data: newProperty, error: propertyError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single()

        if (propertyError) {
          console.warn('Warning: Failed to create property:', propertyError)
        } else {
          propertyId = newProperty.id
          console.log('✅ Created property:', newProperty.id)
        }
      }

      // 4. Create vendors/experts if provided
      if (claimData.selectedProviders && claimData.selectedProviders.length > 0) {
        const vendorInserts = claimData.selectedProviders.map((provider: any) => ({
          organization_id: userProfile.organization_id,
          company_name: provider.name || provider.vendorName || provider.company_name,
          contact_name: provider.contactName,
          contact_first_name: provider.firstName,
          contact_last_name: provider.lastName,
          category: provider.type || provider.vendorType || 'contractor',
          specialty: provider.specialization,
          phone: provider.phone,
          email: provider.email,
          address_line_1: provider.address,
          is_active: true,
          is_preferred: provider.isPreferred || false,
          country: 'USA'
        }))

        const { error: vendorError } = await supabase
          .from('vendors')
          .insert(vendorInserts)

        if (vendorError) {
          console.warn('Warning: Failed to create vendors:', vendorError)
        } else {
          console.log('✅ Created vendors:', vendorInserts.length)
        }
      }

      // 5. Now create the main claim record
      const newClaim = {
        organization_id: userProfile.organization_id,
        assigned_adjuster_id: userProfile.id,
        created_by: userProfile.id,
        client_id: clientId,
        property_id: propertyId,
        carrier_id: carrierId,
        file_number: fileNumber,
        carrier_claim_number: claimData.policyDetails?.carrierClaimNumber || claimData.carrierClaimNumber,
        
        // Policy information
        policy_number: claimData.policyDetails?.policyNumber || claimData.policyNumber,
        policy_effective_date: claimData.policyDetails?.effectiveDate || claimData.effectiveDate,
        policy_expiration_date: claimData.policyDetails?.expirationDate || claimData.expirationDate,
        deductible: parseFloat(claimData.policyDetails?.deductible || claimData.deductible || '0'),
        
        // Loss information
        date_of_loss: claimData.claimInformation?.dateOfLoss || claimData.dateOfLoss || claimData.lossDate || new Date().toISOString(),
        time_of_loss: claimData.claimInformation?.timeOfLoss || claimData.timeOfLoss,
        cause_of_loss: claimData.claimInformation?.causeOfLoss || claimData.causeOfLoss || claimData.reasonForLoss || 'Unknown',
        loss_description: claimData.claimInformation?.damageDescription || claimData.damageDescription || claimData.lossDescription,
        estimated_loss_value: parseFloat(claimData.claimInformation?.estimatedDamages || claimData.estimatedDamages || claimData.estimatedLossAmount || '0'),
        
        // Property information
        property_address: claimData.claimInformation?.lossLocation || claimData.lossLocation || claimData.propertyAddress,
        
        // Claim status and metadata
        claim_status: claimData.claim_status || 'new',
        claim_phase: claimData.claim_phase || 'intake',
        priority: claimData.priority || 'medium',
        contract_fee_type: claimData.contractInformation?.feeType || claimData.feeType || 'percentage',
        contract_fee_amount: parseFloat(claimData.contractInformation?.feePercentage || claimData.feePercentage || '0'),
        
        // Boolean flags
        is_claim_filed: claimData.is_claim_filed || false,
        is_fema_claim: claimData.is_fema_claim || false,
        is_state_emergency: claimData.is_state_emergency || false,
        has_ale_expenses: claimData.has_ale_expenses || false,
        has_repairs_been_done: claimData.has_repairs_been_done || false,
        has_prior_claims: claimData.has_prior_claims || false,
        is_final_settlement: claimData.is_final_settlement || false,
        settlement_status: claimData.settlement_status || 'pending',
        watch_list: claimData.watch_list || false
      }

      const { data, error } = await supabase
        .from('claims')
        .insert([newClaim])
        .select()
        .single()

      if (error) {
        console.error('Error creating claim:', error)
        throw error
      }

      console.log('✅ Created claim successfully:', data.id)
      setClaims(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('❌ Error in comprehensive createClaim:', error)
      throw error
    }
  }

  async function updateClaim(id: string, updates: Partial<Claim>) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('claims')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setClaims(prev => prev.map(claim => 
        claim.id === id ? data : claim
      ))
      return data
    } catch (error: any) {
      console.error('Error updating claim:', error)
      throw error
    }
  }

  async function deleteClaim(id: string) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        throw error
      }

      setClaims(prev => prev.filter(claim => claim.id !== id))
    } catch (error: any) {
      console.error('Error deleting claim:', error)
      throw error
    }
  }

  return {
    claims,
    loading,
    error,
    createClaim,
    updateClaim,
    deleteClaim,
    refetch: loadClaims
  }
}