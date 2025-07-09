import { supabase } from '../lib/supabase'

// Sample data for testing the application
export async function insertSampleData(organizationId: string, userId: string) {
  try {
    console.log('Inserting sample data...')

    // Sample clients
    const clients = [
      {
        organization_id: organizationId,
        client_type: 'individual',
        first_name: 'John',
        last_name: 'Smith',
        primary_email: 'john.smith@email.com',
        primary_phone: '(555) 123-4567',
        address_line_1: '123 Main Street',
        city: 'Tampa',
        state: 'FL',
        zip_code: '33601',
        country: 'United States',
        created_by: userId
      },
      {
        organization_id: organizationId,
        client_type: 'individual',
        first_name: 'Sarah',
        last_name: 'Johnson',
        primary_email: 'sarah.johnson@email.com',
        primary_phone: '(555) 987-6543',
        address_line_1: '456 Oak Avenue',
        city: 'Orlando',
        state: 'FL',
        zip_code: '32801',
        country: 'United States',
        created_by: userId
      },
      {
        organization_id: organizationId,
        client_type: 'business',
        business_name: 'Sunshine Restaurant Group',
        first_name: 'Mike',
        last_name: 'Rodriguez',
        primary_email: 'mike@sunshinerestaurants.com',
        primary_phone: '(555) 456-7890',
        address_line_1: '789 Business Blvd',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101',
        country: 'United States',
        created_by: userId
      }
    ]

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(clients)
      .select()

    if (clientsError) {
      console.error('Error inserting clients:', clientsError)
      return
    }

    // Sample properties
    const properties = [
      {
        organization_id: organizationId,
        client_id: clientsData[0].id,
        property_type: 'residential - home',
        address_line_1: '123 Main Street',
        city: 'Tampa',
        state: 'FL',
        zip_code: '33601',
        country: 'United States',
        year_built: 2015,
        square_footage: 2200,
        bedrooms: 3,
        bathrooms: 2,
        stories: 2,
        construction_type: 'Frame',
        roof_type: 'Shingle'
      },
      {
        organization_id: organizationId,
        client_id: clientsData[1].id,
        property_type: 'residential - condo',
        address_line_1: '456 Oak Avenue',
        city: 'Orlando',
        state: 'FL',
        zip_code: '32801',
        country: 'United States',
        year_built: 2010,
        square_footage: 1800,
        bedrooms: 2,
        bathrooms: 2,
        stories: 1,
        construction_type: 'Concrete Block',
        roof_type: 'Tile'
      },
      {
        organization_id: organizationId,
        client_id: clientsData[2].id,
        property_type: 'commercial - building',
        address_line_1: '789 Business Blvd',
        city: 'Miami',
        state: 'FL',
        zip_code: '33101',
        country: 'United States',
        year_built: 2005,
        square_footage: 5000,
        construction_type: 'Concrete Block',
        roof_type: 'Modified Bitumen'
      }
    ]

    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .insert(properties)
      .select()

    if (propertiesError) {
      console.error('Error inserting properties:', propertiesError)
      return
    }

    // Sample insurance carrier
    const carrier = {
      organization_id: organizationId,
      carrier_name: 'State Farm Insurance',
      carrier_code: 'SF',
      email: 'claims@statefarm.com',
      phone_1: '(800) 782-8332',
      claims_email: 'claims@statefarm.com',
      claims_phone: '(800) 782-8332'
    }

    const { data: carrierData, error: carrierError } = await supabase
      .from('insurance_carriers')
      .insert([carrier])
      .select()
      .single()

    if (carrierError) {
      console.error('Error inserting carrier:', carrierError)
      return
    }

    // Sample claims
    const claims = [
      {
        organization_id: organizationId,
        client_id: clientsData[0].id,
        property_id: propertiesData[0].id,
        file_number: 'CG-2024-001',
        claim_number: 'CLM001',
        carrier_claim_number: 'SF-2024-123456',
        carrier_id: carrierData.id,
        assigned_adjuster_id: userId,
        claim_status: 'in_progress',
        claim_phase: 'investigation',
        priority: 'high',
        date_of_loss: '2024-01-15',
        cause_of_loss: 'hurricane',
        loss_description: 'Hurricane damage to roof and windows causing water infiltration',
        date_reported: '2024-01-16T10:00:00Z',
        date_first_contact: '2024-01-16T14:30:00Z',
        contract_date: '2024-01-17T09:00:00Z',
        contract_fee_type: 'percentage',
        contract_fee_amount: 10.0,
        is_claim_filed: true,
        estimated_loss_value: 125000,
        is_home_habitable: false,
        dwelling_damage_description: 'Roof damage with missing shingles, damaged gutters, broken windows',
        has_ale_expenses: true,
        created_by: userId
      },
      {
        organization_id: organizationId,
        client_id: clientsData[1].id,
        property_id: propertiesData[1].id,
        file_number: 'CG-2024-002',
        claim_number: 'CLM002',
        carrier_claim_number: 'SF-2024-789012',
        carrier_id: carrierData.id,
        assigned_adjuster_id: userId,
        claim_status: 'new',
        claim_phase: 'initial_contact',
        priority: 'medium',
        date_of_loss: '2024-01-20',
        cause_of_loss: 'water damage',
        loss_description: 'Pipe burst in kitchen causing water damage to flooring and cabinets',
        date_reported: '2024-01-21T08:00:00Z',
        date_first_contact: '2024-01-21T11:00:00Z',
        contract_date: '2024-01-22T10:00:00Z',
        contract_fee_type: 'percentage',
        contract_fee_amount: 10.0,
        is_claim_filed: true,
        estimated_loss_value: 45000,
        is_home_habitable: true,
        dwelling_damage_description: 'Kitchen flooring and cabinet damage from water',
        has_ale_expenses: false,
        created_by: userId
      },
      {
        organization_id: organizationId,
        client_id: clientsData[2].id,
        property_id: propertiesData[2].id,
        file_number: 'CG-2024-003',
        claim_number: 'CLM003',
        carrier_claim_number: 'SF-2024-345678',
        carrier_id: carrierData.id,
        assigned_adjuster_id: userId,
        claim_status: 'under_review',
        claim_phase: 'negotiation',
        priority: 'high',
        date_of_loss: '2024-01-10',
        cause_of_loss: 'fire',
        loss_description: 'Kitchen fire resulting in smoke and fire damage to restaurant',
        date_reported: '2024-01-11T07:00:00Z',
        date_first_contact: '2024-01-11T09:30:00Z',
        contract_date: '2024-01-12T15:00:00Z',
        contract_fee_type: 'percentage',
        contract_fee_amount: 12.0,
        is_claim_filed: true,
        estimated_loss_value: 380000,
        dwelling_damage_description: 'Kitchen fire damage with smoke damage throughout restaurant',
        has_ale_expenses: true,
        created_by: userId
      }
    ]

    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .insert(claims)
      .select()

    if (claimsError) {
      console.error('Error inserting claims:', claimsError)
      return
    }

    // Sample activities
    const activities = [
      {
        organization_id: organizationId,
        claim_id: claimsData[0].id,
        activity_type: 'claim_created',
        activity_category: 'system',
        title: 'Claim Created',
        description: 'New hurricane damage claim was created',
        is_system_generated: true,
        created_by: userId
      },
      {
        organization_id: organizationId,
        claim_id: claimsData[0].id,
        activity_type: 'phone_call',
        activity_category: 'communication',
        title: 'Initial Client Contact',
        description: 'Spoke with client about hurricane damage assessment',
        communication_method: 'phone',
        communication_direction: 'outbound',
        phone_number: '(555) 123-4567',
        call_duration: 15,
        created_by: userId
      },
      {
        organization_id: organizationId,
        claim_id: claimsData[1].id,
        activity_type: 'email_sent',
        activity_category: 'communication',
        title: 'Documentation Request',
        description: 'Sent email requesting policy documents and receipts',
        communication_method: 'email',
        communication_direction: 'outbound',
        email_subject: 'Documentation Request - Claim CLM002',
        email_to: ['sarah.johnson@email.com'],
        created_by: userId
      }
    ]

    const { error: activitiesError } = await supabase
      .from('activities')
      .insert(activities)

    if (activitiesError) {
      console.error('Error inserting activities:', activitiesError)
      return
    }

    // Sample tasks
    const tasks = [
      {
        organization_id: organizationId,
        claim_id: claimsData[0].id,
        task_type: 'inspection',
        task_category: 'field_work',
        title: 'Schedule Property Inspection',
        description: 'Schedule and conduct property inspection for hurricane damage',
        status: 'pending',
        priority: 'high',
        assigned_to: userId,
        assigned_by: userId,
        due_date: '2024-02-01T10:00:00Z',
        estimated_hours: 4.0
      },
      {
        organization_id: organizationId,
        claim_id: claimsData[1].id,
        task_type: 'documentation',
        task_category: 'paperwork',
        title: 'Collect Policy Documents',
        description: 'Obtain complete policy documentation from client',
        status: 'pending',
        priority: 'medium',
        assigned_to: userId,
        assigned_by: userId,
        due_date: '2024-01-30T17:00:00Z',
        estimated_hours: 1.0
      },
      {
        organization_id: organizationId,
        claim_id: claimsData[2].id,
        task_type: 'estimate',
        task_category: 'assessment',
        title: 'Prepare Repair Estimate',
        description: 'Create detailed repair estimate for fire damage',
        status: 'in_progress',
        priority: 'high',
        assigned_to: userId,
        assigned_by: userId,
        due_date: '2024-01-28T17:00:00Z',
        estimated_hours: 6.0,
        progress_percentage: 60
      }
    ]

    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError)
      return
    }

    console.log('Sample data inserted successfully!')
    return true
    
  } catch (error) {
    console.error('Error inserting sample data:', error)
    return false
  }
}