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
    refetch: loadClients
  }
}