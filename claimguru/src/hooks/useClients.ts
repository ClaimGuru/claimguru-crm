import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Client } from '../lib/supabase'

export function useClients() {
  const { userProfile } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadClients()
    }
  }, [userProfile?.organization_id])

  async function loadClients() {
    if (!userProfile?.organization_id) return

    try {
      setLoading(true)
      
      // Demo mode: return sample data instead of making database calls
      if (userProfile.organization_id === 'demo-org-456') {
        const sampleClients: Client[] = [
          {
            id: 'demo-client-1',
            organization_id: 'demo-org-456',
            client_type: 'individual',
            is_policyholder: true,
            first_name: 'John',
            last_name: 'Smith',
            primary_email: 'john.smith@email.com',
            primary_phone: '(555) 123-4567',
            address_line_1: '123 Main Street',
            city: 'Tampa',
            state: 'FL',
            zip_code: '33601',
            country: 'USA',
            mailing_same_as_address: true,
            created_at: '2024-01-10T10:00:00Z',
            updated_at: '2024-01-15T14:30:00Z'
          },
          {
            id: 'demo-client-2',
            organization_id: 'demo-org-456',
            client_type: 'individual',
            is_policyholder: true,
            first_name: 'Sarah',
            last_name: 'Johnson',
            primary_email: 'sarah.johnson@email.com',
            primary_phone: '(555) 987-6543',
            address_line_1: '456 Oak Avenue',
            city: 'Orlando',
            state: 'FL',
            zip_code: '32801',
            country: 'USA',
            mailing_same_as_address: true,
            created_at: '2024-01-15T08:00:00Z',
            updated_at: '2024-01-20T11:00:00Z'
          },
          {
            id: 'demo-client-3',
            organization_id: 'demo-org-456',
            client_type: 'business',
            is_policyholder: true,
            business_name: 'Sunshine Restaurant Group',
            first_name: 'Mike',
            last_name: 'Rodriguez',
            primary_email: 'mike@sunshinerestaurants.com',
            primary_phone: '(555) 456-7890',
            address_line_1: '789 Business Blvd',
            city: 'Miami',
            state: 'FL',
            zip_code: '33101',
            country: 'USA',
            mailing_same_as_address: true,
            created_at: '2024-01-05T09:00:00Z',
            updated_at: '2024-01-12T16:45:00Z'
          }
        ]
        
        setClients(sampleClients)
        setLoading(false)
        return
      }
      
      // Production mode: make real database calls
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setClients(data || [])
    } catch (error: any) {
      console.error('Error loading clients:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function createClient(clientData: Partial<Client>) {
    if (!userProfile?.organization_id || !userProfile?.id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const newClient = {
        ...clientData,
        organization_id: userProfile.organization_id,
        created_by: userProfile.id,
        client_type: clientData.client_type || 'residential',
        is_policyholder: clientData.is_policyholder || true,
        country: clientData.country || 'US',
        mailing_same_as_address: clientData.mailing_same_as_address || true
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single()

      if (error) {
        throw error
      }

      setClients(prev => [data, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ))
      return data
    } catch (error: any) {
      console.error('Error updating client:', error)
      throw error
    }
  }

  async function deleteClient(id: string) {
    if (!userProfile?.organization_id) {
      throw new Error('User not properly authenticated')
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)

      if (error) {
        throw error
      }

      setClients(prev => prev.filter(client => client.id !== id))
    } catch (error: any) {
      console.error('Error deleting client:', error)
      throw error
    }
  }

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refetch: loadClients
  }
}