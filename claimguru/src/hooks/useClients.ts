import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Client } from '../lib/supabase'
import debounce from 'lodash.debounce'

export interface ClientSearchOption {
  value: string
  label: string
  client: Client
}

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

  // Enhanced search function for real-time client search
  const searchClients = async (searchTerm: string, searchCriteria: string[] = ['name', 'email', 'phone', 'address']): Promise<ClientSearchOption[]> => {
    if (!searchTerm || searchTerm.length < 2 || !userProfile?.organization_id) {
      return []
    }

    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .limit(15)

      // Build search conditions based on criteria
      const conditions: string[] = []
      
      if (searchCriteria.includes('name')) {
        conditions.push(`first_name.ilike.%${searchTerm}%`)
        conditions.push(`last_name.ilike.%${searchTerm}%`)
        conditions.push(`business_name.ilike.%${searchTerm}%`)
      }
      
      if (searchCriteria.includes('email')) {
        conditions.push(`primary_email.ilike.%${searchTerm}%`)
      }
      
      if (searchCriteria.includes('phone')) {
        conditions.push(`primary_phone.ilike.%${searchTerm}%`)
      }
      
      if (searchCriteria.includes('address')) {
        conditions.push(`address_line_1.ilike.%${searchTerm}%`)
        conditions.push(`city.ilike.%${searchTerm}%`)
        conditions.push(`state.ilike.%${searchTerm}%`)
        conditions.push(`zip_code.ilike.%${searchTerm}%`)
      }
      
      if (conditions.length > 0) {
        query = query.or(conditions.join(','))
      }
      
      const { data, error } = await query.order('last_name', { ascending: true })
      
      if (error) throw error
      
      return (data || []).map(client => {
        const displayName = client.client_type === 'commercial' && client.business_name 
          ? client.business_name
          : `${client.first_name || ''} ${client.last_name || ''}`.trim()
        
        const displayInfo = [
          displayName,
          client.primary_email,
          client.primary_phone,
          `${client.address_line_1 || ''} ${client.city || ''}, ${client.state || ''} ${client.zip_code || ''}`.trim()
        ].filter(Boolean).join(' - ')
        
        return {
          value: client.id,
          label: displayInfo,
          client
        }
      })
    } catch (error: any) {
      console.error('Error searching clients:', error)
      return []
    }
  }

  // Debounced search function
  const debouncedSearchClients = debounce(searchClients, 300)

  async function createClient(clientData: Partial<Client>) {
    if (!userProfile?.organization_id || !userProfile?.id) {
      throw new Error('User not properly authenticated')
    }

    try {
      // Clean the data to only include fields that exist in the database
      const cleanClientData = {
        organization_id: userProfile.organization_id,
        created_by: userProfile.id,
        client_type: clientData.client_type || 'residential',
        is_policyholder: clientData.is_policyholder ?? true,
        first_name: clientData.first_name || null,
        last_name: clientData.last_name || null,
        business_name: clientData.business_name || null,
        primary_email: clientData.primary_email || null,
        primary_phone: clientData.primary_phone || null,
        address_line_1: clientData.address_line_1 || null,
        city: clientData.city || null,
        state: clientData.state || null,
        zip_code: clientData.zip_code || null,
        country: clientData.country || 'US',
        mailing_same_as_address: clientData.mailing_same_as_address ?? true,
        notes: clientData.notes || null
      }

      console.log('🚀 Creating client with clean data:', cleanClientData)

      const { data, error } = await supabase
        .from('clients')
        .insert(cleanClientData)
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Client created successfully:', data)
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
    refetch: loadClients,
    searchClients,
    debouncedSearchClients
  }
}